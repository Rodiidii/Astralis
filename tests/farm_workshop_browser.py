"""Farm page: exact goals, shared stock, live calendar, real assets and PNG/clipboard."""
import hashlib,json,sys,subprocess,threading
from datetime import date
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 before='--before' in sys.argv;day=date.today().isoformat()
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 out=ROOT/'docs/captures/farm-workshop';out.mkdir(parents=True,exist_ok=True)
 sources={path:subprocess.check_output(['git','show','b643cde:'+path],cwd=ROOT) for path in ['src/app.js','src/data.js','src/planning-controls.js','src/farm-simulator.js','src/page-state.js','assets/recovery-workshop.css']} if before else {}
 goals={id:{'levelFrom':80,'levelTo':90,'from':[6,6,6],'to':[8,8,8]} for id in ['bennett','diluc']}
 seed={'astralis:active-game':'gi','astralis:gi:assistant-profile':json.dumps({'enabled':False}),'astralis:gi:farm-roster':json.dumps([{'id':'bennett','active':True},{'id':'diluc','active':True}]),'astralis:gi:talent-targets':json.dumps(goals),'astralis:gi:farm-simulation':json.dumps({'start':day,'artifactDays':0})}
 errors=[]
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();context=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block',permissions=['clipboard-read','clipboard-write'],accept_downloads=True);page=context.new_page();page.set_default_timeout(30000);page.on('pageerror',lambda e:errors.append(str(e)))
   def route(r):
    url=r.request.url;path=url.split('?',1)[0].removeprefix(base+'/')
    if url.startswith(base) and path in sources:r.fulfill(body=sources[path],content_type='text/css' if path.endswith('.css') else 'application/javascript')
    elif url.startswith(base+'/api/'):r.fulfill(json={})
    elif url.startswith(base):r.continue_()
    elif 'lunaris' in url:r.fulfill(json={})
    else:r.abort()
   page.route('**/*',route);page.add_init_script("if(!localStorage.getItem('farm-workshop-seeded')){localStorage.setItem('farm-workshop-seeded','1');for(const[k,v]of Object.entries("+json.dumps(seed)+"))localStorage.setItem(k,v);}")
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.locator('[data-nav=farming]').first.evaluate('(el)=>el.click()');page.wait_for_selector('.farm-projection-options button')
   page.wait_for_function("()=>JSON.parse(document.querySelector('farm-forecasts').dataset.plan).characters.every(c=>c.requirements.some(r=>String(r.id).startsWith('113'))&&c.requirements.some(r=>String(r.id).startsWith('104')))" )
   if before:
    page.locator('farm-talent-targets').scroll_into_view_if_needed();page.screenshot(path=str(out/'before-goals.png'),animations='disabled');context.close();browser.close();print('Capture avant farm enregistrée.',flush=True);return
   expect(page.locator('farm-talent-targets details')).not_to_have_attribute('open','');page.locator('farm-talent-targets summary').click();expect(page.locator('.farm-goal-row')).to_have_count(2)
   expect(page.locator('.farm-goal-talent img')).to_have_count(6)
   row=page.locator('[data-farm-goal=bennett]');field=row.locator('[data-level=from][data-skill="0"]');field.fill('9');field.press('Tab');expect(row.locator('[data-level=to][data-skill="0"]')).to_have_value('9')
   field=row.locator('[data-level=to][data-skill="0"]');field.fill('6');field.press('Tab');expect(field).to_have_value('9');expect(page.locator('farm-talent-targets details')).to_have_attribute('open','')
   page.locator('farm-talent-targets').scroll_into_view_if_needed();page.screenshot(path=str(out/'after-goals.png'),animations='disabled')
   print('Step: goals',flush=True)
   # A draft calendar action survives inventory-driven rerenders.
   page.locator('#farm-calendar-task').fill('Session réservée au test');page.locator('#farm-calendar-character').select_option('bennett');page.locator('#farm-calendar-category').select_option(label='Livres d’aptitudes')
   page.locator('.farm-resource-card.mora [data-farm-inventory]').fill('100');page.locator('.farm-resource-card.mora [data-farm-inventory]').press('Tab');expect(page.locator('#farm-calendar-task')).to_have_value('Session réservée au test');expect(page.locator('#farm-calendar-character')).to_have_value('bennett')
   assert page.locator('.farm-calendar-day.is-talent-day').count()>0
   page.locator('[data-apply-farm]').click();page.wait_for_function("JSON.parse(localStorage.getItem('astralis:gi:farm-calendar')||'[]').some(r=>r.simulated)")
   sessions=page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:farm-calendar'))")
   assert {'talent','boss','xp','mora'}<=set(s['kind'] for s in sessions);assert any(s.get('supplements') for s in sessions)
   assert all(not any(str(i).startswith('100') or str(i)=='104319' for i in s['materialIds']) for s in sessions)
   page.locator('[data-artifact-days="2"]').click();page.wait_for_function("JSON.parse(localStorage.getItem('astralis:gi:farm-calendar')).some(s=>s.kind==='artifact')")
   print('Step: calendar',flush=True)
   dates=page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:farm-projections'))");first_date=next(iter(dates.values()));page.locator('[data-farm-month]').fill(first_date[:7]);page.locator('[data-farm-month]').press('Tab');expect(page.locator('.farm-calendar-day[data-date="'+first_date+'"]')).to_have_class(__import__('re').compile('farm-completion-day'))
   page.locator('.farm-calendar').scroll_into_view_if_needed();page.locator('.farm-month-grid img').evaluate_all('nodes=>nodes.forEach(n=>n.loading="eager")');page.wait_for_function("[...document.querySelectorAll('.farm-month-grid img')].every(i=>i.complete&&i.naturalWidth>0)")
   page.screenshot(path=str(out/'after-calendar.png'),animations='disabled')
   assert not page.locator('.farm-calendar-lines').evaluate('(el)=>el.open')
   page.locator('.farm-calendar-day[data-date="'+first_date+'"] .farm-day-open').click();dialog=page.locator('.farm-day-dialog');expect(dialog).to_be_visible();expect(dialog.locator('article')).not_to_have_count(0);dialog.get_by_role('button',name='Fermer la journée').click();expect(dialog).to_have_count(0)
   expect(page.locator('.farm-harvest-card')).not_to_have_count(0);expect(page.locator('.farm-harvest-card').first).to_contain_text('Repousse 48 h')

   print('Step: calendar rendered',flush=True)
   # Reserve a date manually. Later re-computations must leave it free of auto sessions.
   planned_date=sessions[0]['date'];page.locator('#farm-calendar-date').fill(planned_date);page.locator('[data-action=farm-schedule]').click()
   page.wait_for_function("d=>JSON.parse(localStorage.getItem('astralis:gi:farm-calendar')).some(r=>r.date===d&&!r.auto&&!r.simulated)",arg=planned_date);expect(page.locator('#farm-calendar-task')).to_have_value('')
   field=page.locator('.farm-resource-card.mora [data-farm-inventory]');field.fill('100000000');field.press('Tab');page.wait_for_function("d=>JSON.parse(localStorage.getItem('astralis:gi:farm-calendar')).every(r=>!r.simulated||r.date!==d&&r.kind!=='mora')",arg=planned_date)
   print('Step: manual reserved',flush=True)
   # Set a controlled shared recipe: 6 green + 2 blue, across two characters.
   recipe={id:{'levelFrom':90,'levelTo':90,'from':[1,1,1],'to':[1,1,1]} for id in ['bennett','diluc']};recipe['bennett']['to'][0]=2;recipe['diluc']['to'][0]=3
   page.evaluate("goals=>{localStorage.setItem('astralis:gi:talent-targets',JSON.stringify(goals));localStorage.setItem('astralis:gi:farm-inventory','{}');document.dispatchEvent(new CustomEvent('astralis:planning-changed'));}",recipe)
   talent=json.loads((ROOT/'data/gi-talent-costs.json').read_text(encoding='utf-8'))['10000032']['costs'];green=str(next(x['id'] for x in talent['lvl2'] if str(x['id']).startswith('104')));blue=str(next(x['id'] for x in talent['lvl3'] if str(x['id']).startswith('104')))
   field=page.locator('[data-farm-inventory="'+green+'"]').first;field.fill('9');field.press('Tab')
   stock=page.locator('.farm-stock-row').filter(has=page.locator('[data-farm-inventory="'+blue+'"]'));expect(stock).to_contain_text('reste 1');expect(stock).to_contain_text('1 synthétisable')
   field=page.locator('[data-farm-inventory="'+green+'"]').first;field.fill('12');field.press('Tab');expect(stock).to_contain_text('reste 0')
   if not page.locator('.farm-manual-needs').evaluate('(el)=>el.open'):page.locator('.farm-manual-needs summary').click()
   expect(page.locator('.farm-manual-needs')).to_have_attribute('open','');expect(page.locator('.farm-manual-needs button')).not_to_have_count(0)
   page.locator('.farm-manual-needs button').first.click();assert page.locator('.farm-inventory').evaluate('(el)=>el.open')
   expected_first=page.locator('[data-farm-rank="1"]').get_attribute('data-farm-person');page.locator('[data-farm-rank="0"]').drag_to(page.locator('[data-farm-rank="1"]'));page.wait_for_function("id=>JSON.parse(localStorage.getItem('astralis:gi:farm-priority'))[0]===id",arg=expected_first)
   page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.locator('farm-talent-targets').scroll_into_view_if_needed();page.screenshot(path=str(out/'mobile-goals.png'),animations='disabled');page.set_viewport_size({'width':1440,'height':1000})
   page.locator('[data-farm-character-search]').fill('Bennett');expect(page.locator('.farm-person-card:visible')).to_have_count(1)
   page.locator('[data-farm-export-character=bennett]').click();dialog=page.locator('.astralis-png-preview');expect(dialog).to_be_visible();expect(dialog.locator('[data-save]')).to_be_enabled(timeout=120000)
   canvas=dialog.locator('canvas');assert canvas.evaluate('(c)=>c.width')>=2000;expect(dialog.locator('[data-copy-png]')).to_be_checked()
   digest=canvas.evaluate("async c=>{const b=await(await fetch(c.toDataURL())).arrayBuffer();return [...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('')}")
   with page.expect_download() as download:dialog.locator('[data-save]').click()
   target=out/'farm-bennet-after.png';download.value.save_as(str(target));assert hashlib.sha256(target.read_bytes()).hexdigest()==digest
   expect(dialog.locator('[role=status]')).to_contain_text('copié');assert page.evaluate("async()=> (await navigator.clipboard.read()).some(item=>item.types.includes('image/png'))")
   assert not errors,errors;context.close();browser.close();print('Farm : talents individuels, synthèse partagée, dates, calendrier, priorité, images, mobile et PNG/presse-papiers : OK',flush=True)
 finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
