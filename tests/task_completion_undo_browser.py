import json, threading
from datetime import date, timedelta
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    today=date.today()
    tasks=[
        {'id':'once','title':'Objectif simple','due':today.isoformat(),'done':False,'steps':[{'id':'a','title':'Étape conservée','done':True}]},
        {'id':'weekly','title':'Objectif hebdomadaire','due':today.isoformat(),'done':False,'recurrence':'weekly','steps':[{'id':'b','title':'Réinitialiser','done':True}]},
        {'id':'bulk-one','title':'Lot · première tâche','due':today.isoformat(),'done':False},
        {'id':'bulk-week','title':'Lot · tâche récurrente','due':today.isoformat(),'done':False,'recurrence':'daily'},
    ]
    server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch()
            page=browser.new_page(viewport={'width':1366,'height':900},service_workers='block')
            page.set_default_timeout(20000)
            errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
            seed={'astralis:active-game':'gi','astralis:tasks:gi':json.dumps(tasks,ensure_ascii=False)}
            page.add_init_script('for(const [key,value] of Object.entries('+json.dumps(seed)+'))localStorage.setItem(key,value)')
            page.route('**/*',lambda route:route.continue_() if route.request.url.startswith(base) else route.abort())
            page.goto(base,wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen',state='detached')
            page.evaluate("document.querySelector('[data-nav=tasks].rail-link')?.click()")
            page.wait_for_selector('.task-card')
            page.locator('[data-task-toggle="once"]').click()
            expect(page.locator('.toast-action-button')).to_contain_text('Annuler')
            assert next(row for row in page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))') if row['id']=='once')['done']
            page.locator('.toast-action-button').click()
            restored=next(row for row in page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))') if row['id']=='once')
            assert restored['done'] is False and restored['steps']==tasks[0]['steps']

            page.locator('[data-task-toggle="weekly"]').click()
            state=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))')
            generated=next(row for row in state if row.get('seriesId')=='weekly' and row['id']!='weekly')
            assert generated['due']==(today+timedelta(days=7)).isoformat()
            assert all(not step['done'] for step in generated['steps'])
            page.locator('.toast-action-button').click()
            state=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))')
            assert not any(row['id']==generated['id'] for row in state)
            assert next(row for row in state if row['id']=='weekly')['done'] is False

            page.locator('[data-task-toggle="weekly"]').click()
            state=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))')
            generated=next(row for row in state if row.get('seriesId')=='weekly' and row['id']!='weekly')
            page.evaluate("""id=>{const rows=JSON.parse(localStorage.getItem('astralis:tasks:gi'));const next=rows.find(row=>row.id===id);next.title+=' · modifiée';next.updated=(next.updated||0)+10;localStorage.setItem('astralis:tasks:gi',JSON.stringify(rows))}""",generated['id'])
            page.locator('.toast-action-button').click()
            state=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))')
            retained=next(row for row in state if row['id']==generated['id'])
            assert retained['title'].endswith('· modifiée')
            assert next(row for row in state if row['id']=='weekly')['done'] is False

            page.locator('[data-task-select="bulk-one"]').check(force=True)
            page.locator('[data-task-select="bulk-week"]').check(force=True)
            page.locator('[data-task-bulk-complete]').click()
            state=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))')
            assert next(row for row in state if row['id']=='bulk-one')['done']
            bulk_next=next(row for row in state if row.get('seriesId')=='bulk-week' and row['id']!='bulk-week')
            page.locator('.toast-action-button').click()
            state=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))')
            assert next(row for row in state if row['id']=='bulk-one')['done'] is False
            assert next(row for row in state if row['id']=='bulk-week')['done'] is False
            assert not any(row['id']==bulk_next['id'] for row in state)
            assert not errors,errors
            browser.close()
        print('Tâches : annulation de fin individuelle et groupée; occurrences récurrentes retirées seulement si elles n’ont pas été modifiées.')
    finally:
        server.shutdown();server.server_close()

if __name__=='__main__': main()
