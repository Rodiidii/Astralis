import json,threading
from datetime import date,timedelta
from functools import partial
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 today=date.today();yesterday=(today-timedelta(days=1)).isoformat();tomorrow=(today+timedelta(days=1)).isoformat()
 tasks=[{'id':'late','title':'Objectif en retard','category':'Test','priority':'Haute','due':yesterday,'done':False},{'id':'late-week','title':'Objectif à reporter plus tard','category':'Test','priority':'Normale','due':yesterday,'done':False},{'id':'today','title':'Objectif du jour','category':'Test','priority':'Normale','due':today.isoformat(),'done':False,'steps':[{'id':'one','title':'Étape déjà faite','done':True},{'id':'two','title':'Étape restante','done':False},{'id':'three','title':'Dernière étape','done':False}]},{'id':'tomorrow','title':'Objectif de demain','category':'Test','priority':'Basse','due':tomorrow,'done':False},{'id':'undated-today','title':'Objectif à planifier aujourd’hui','category':'Test','priority':'Normale','done':False},{'id':'undated-tomorrow','title':'Objectif à planifier demain','category':'Test','priority':'Basse','done':False},{'id':'undated-custom','title':'Objectif à date libre','category':'Test','priority':'Normale','done':False}]
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1366,'height':900},service_workers='block');page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   today=date.fromisoformat(page.evaluate("(()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')})()"));yesterday=(today-timedelta(days=1)).isoformat();tomorrow=(today+timedelta(days=1)).isoformat()
   for task in tasks:
    if task['id'] in ('late','late-week'):task['due']=yesterday
    elif task['id']=='today':task['due']=today.isoformat()
    elif task['id']=='tomorrow':task['due']=tomorrow
   def route(r):
    url=r.request.url;path=urlsplit(url).path
    if path.startswith('/api/'):r.fulfill(json={})
    elif url.startswith(base):r.continue_()
    elif '/assets/skills/' in url or '/UI/' in url:r.fulfill(path=str(ROOT/'assets/ui/game-genshin.png'))
    else:r.abort()
   page.route('**/*',route)
   seed={'astralis:active-game':'gi','astralis:gi:assistant-profile':json.dumps({'enabled':False,'proactive':False}),'astralis:tasks:gi':json.dumps(tasks)}
   page.add_init_script('for(const [key,value]of Object.entries('+json.dumps(seed)+'))localStorage.setItem(key,value)')
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.wait_for_function("document.querySelector('[data-nav=tasks]') && !document.querySelector('[data-nav=tasks]').disabled");page.evaluate("document.querySelector('[data-nav=tasks]').click()");page.wait_for_selector('.task-card')
   expect(page.locator('.task-card').filter(has_text='Objectif en retard').locator('time')).to_have_class('due-overdue')
   expect(page.locator('.task-card').filter(has_text='Objectif du jour').locator('time')).to_contain_text('Aujourd’hui')
   expect(page.locator('.task-card').filter(has_text='Objectif de demain').locator('time')).to_contain_text('Demain')
   page.locator('[data-task-postpone="late"]').click();expect(page.locator('.task-card').filter(has_text='Objectif en retard').locator('time')).to_contain_text('Demain')
   later=page.locator('.task-card').filter(has_text='Objectif à reporter plus tard');later.locator('.task-postpone-more').evaluate("el=>{el.open=true;el.querySelector('[data-task-postpone-days=\"7\"]').click()}");saved=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))');assert next(task for task in saved if task['id']=='late-week')['due']==(today+timedelta(days=7)).isoformat()
   page.locator('[data-task-schedule="undated-today"][data-task-date="today"]').click();expect(page.locator('.task-card').filter(has_text='Objectif à planifier aujourd’hui').locator('time')).to_contain_text('Aujourd’hui')
   page.locator('[data-task-schedule="undated-tomorrow"][data-task-date="tomorrow"]').click();expect(page.locator('.task-card').filter(has_text='Objectif à planifier demain').locator('time')).to_contain_text('Demain')
   custom=(today+timedelta(days=10)).isoformat();page.locator('[data-task-schedule-custom="undated-custom"]').fill(custom);saved=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))');assert next(task for task in saved if task['id']=='undated-custom')['due']==custom
   scheduled=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))');assert next(task for task in scheduled if task['id']=='undated-today')['due']==today.isoformat();assert next(task for task in scheduled if task['id']=='undated-tomorrow')['due']==tomorrow;assert next(task for task in scheduled if task['id']=='undated-custom')['due']==custom
   saved=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))');assert next(task for task in saved if task['id']=='late')['due']==tomorrow;assert next(task for task in saved if task['id']=='late-week')['due']==(today+timedelta(days=7)).isoformat();page.locator('[data-task-complete-remaining=\"today\"]').click();saved=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))');assert all(step['done'] for step in next(task for task in saved if task['id']=='today')['steps']);expect(page.locator('.task-card').filter(has_text='Objectif du jour').locator('.task-step-count')).to_contain_text('3/3')
   page.locator('[data-task-select="undated-today"]').check();page.locator('[data-task-select="undated-tomorrow"]').check();expect(page.locator('.task-bulk-bar>span')).to_have_text('2 sélectionnées');page.locator('[data-task-bulk-schedule]').click();saved=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))');assert all(next(task for task in saved if task['id']==task_id)['due']==tomorrow for task_id in ['undated-today','undated-tomorrow']);assert page.evaluate('localStorage.getItem("astralis:gi:task-bulk-selection")') is None
   page.locator('[data-task-select="late"]').check();page.locator('[data-task-select="today"]').check();page.locator('[data-task-bulk-complete]').click();saved=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))');assert all(next(task for task in saved if task['id']==task_id)['done'] for task_id in ['late','today'])
   page.locator('[data-task-delete="undated-custom"]').click();expect(page.locator('.task-card').filter(has_text='Objectif à date libre')).to_have_count(0);expect(page.locator('.toast-message-action')).to_contain_text('supprimé');page.locator('.toast-action-button').click();expect(page.locator('.task-card').filter(has_text='Objectif à date libre')).to_be_visible();saved=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))');assert next(task for task in saved if task['id']=='undated-custom')['due']==custom
   page.locator('[data-task-select="undated-today"]').check();page.locator('[data-task-select="undated-tomorrow"]').check();page.locator('[data-task-bulk-clear]').click();saved=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))');assert not any(task['id'] in ('undated-today','undated-tomorrow') for task in saved);page.locator('.toast-action-button').click();saved=page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))');assert all(any(task['id']==task_id for task in saved) for task_id in ('undated-today','undated-tomorrow'))
   assert not errors,errors;browser.close()
  print('OK: échéances en retard, aujourd’hui et demain; reports à demain et à une semaine enregistrés et affichés.')
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()


