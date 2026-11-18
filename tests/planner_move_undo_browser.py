import json, threading
from datetime import date, timedelta
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    today = date.today()
    iso = lambda delta: (today + timedelta(days=delta)).isoformat()
    tasks = [{'id':'move-me','title':'Déplacer le farm','due':iso(0),'done':False,'game':'gi','priority':'Normale'},{'id':'schedule-me','title':'Planifier une session','due':'','done':False,'priority':'Normale'},{'id':'late-me','title':'Reporter un domaine','due':iso(-1),'done':False,'priority':'Normale'},{'id':'bulk-a','title':'Farm prioritaire','due':iso(0),'done':False},{'id':'bulk-b','title':'Farm secondaire','due':iso(1),'done':False}]
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(service_workers='block', viewport={'width':1440,'height':1000})
            errors=[]
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.set_default_timeout(15000)
            page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:tasks:gi',"+json.dumps(json.dumps(tasks,ensure_ascii=False))+ ")")
            page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
            page.goto(base,wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen',state='detached')
            page.evaluate("document.documentElement.dataset.appReady==='true'")
            for _ in range(5):
                page.evaluate("document.querySelector('[data-nav=planner]')?.click()")
                try:
                    page.wait_for_selector('.planner-week-grid',timeout=2500); break
                except Exception: pass
            task=page.locator('[data-planner-drag-task="move-me"]')
            expect(task).to_be_visible()
            task.focus(); task.press('Alt+ArrowRight')
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:tasks:gi')).find(x=>x.id==='move-me').due==="+json.dumps(iso(1)))
            undo=page.locator('.toast-action-button')
            expect(undo).to_be_visible(); expect(undo).to_contain_text('Annuler')
            undo.click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:tasks:gi')).find(x=>x.id==='move-me').due==="+json.dumps(iso(0)))
            # A stale undo must not overwrite a newer date written after the move.
            task=page.locator('[data-planner-drag-task="move-me"]'); task.focus(); task.press('Alt+ArrowRight')
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:tasks:gi')).find(x=>x.id==='move-me').due==="+json.dumps(iso(1)))
            page.evaluate("""(due)=>{const rows=JSON.parse(localStorage.getItem('astralis:tasks:gi'));rows[0].due=due;localStorage.setItem('astralis:tasks:gi',JSON.stringify(rows))}""",iso(2))
            page.locator('.toast-action-button').click()
            assert page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi'))[0].due")==iso(2)
            assert 'modifiée depuis son déplacement' in page.locator('.toast-message').last.inner_text()
            page.evaluate("document.querySelector('[data-nav=tasks]')?.click()")
            page.wait_for_selector('.task-card')
            page.locator('[data-task-schedule=\"schedule-me\"][data-task-date=\"today\"]').click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:tasks:gi')).find(x=>x.id==='schedule-me').due==="+json.dumps(iso(0)))
            page.locator('.toast-action-button').click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:tasks:gi')).find(x=>x.id==='schedule-me').due===\"\"")
            custom=page.locator('[data-task-schedule-custom=\"schedule-me\"]');custom.fill(iso(3))
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:tasks:gi')).find(x=>x.id==='schedule-me').due==="+json.dumps(iso(3)))
            page.locator('.toast-action-button').click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:tasks:gi')).find(x=>x.id==='schedule-me').due===\"\"")
            page.locator('[data-task-postpone=\"late-me\"]').click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:tasks:gi')).find(x=>x.id==='late-me').due==="+json.dumps(iso(1)))
            page.locator('.toast-action-button').click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:tasks:gi')).find(x=>x.id==='late-me').due==="+json.dumps(iso(-1)))
            page.locator('[data-task-select="bulk-a"]').check(force=True)
            page.locator('[data-task-select="bulk-b"]').check(force=True)
            page.locator('[data-task-bulk-schedule]').click()
            page.wait_for_function("['bulk-a','bulk-b'].every(id=>JSON.parse(localStorage.getItem('astralis:tasks:gi')).find(x=>x.id===id).due==="+json.dumps(iso(1))+ ")")
            page.evaluate("""due=>{const rows=JSON.parse(localStorage.getItem('astralis:tasks:gi'));rows.find(x=>x.id==='bulk-b').due=due;localStorage.setItem('astralis:tasks:gi',JSON.stringify(rows))}""",iso(2))
            page.locator('.toast-action-button').click()
            saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi'))")
            assert next(row for row in saved if row['id']=='bulk-a')['due']==iso(0)
            assert next(row for row in saved if row['id']=='bulk-b')['due']==iso(2)
            assert '1 échéance restaurée' in page.locator('.toast-message').last.inner_text()
            assert not errors,errors
            browser.close()
            print('Agenda et objectifs : déplacement, planification et report peuvent être annulés sans écraser une échéance plus récente.')
    finally:
        server.shutdown(); server.server_close()

if __name__=='__main__': main()


