import json,threading
from functools import partial
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1360,'height':900},service_workers='block');page.set_default_timeout(60000);errors=[];dialogs={'count':0};page.on('pageerror',lambda e:errors.append(str(e)))
   def handle_dialog(dialog):
    dialogs['count']+=1
    if dialogs['count']==1:dialog.dismiss()
    else:dialog.accept()
   page.on('dialog',handle_dialog)
   def route(r):
    url=r.request.url;path=urlsplit(url).path
    if path.startswith('/api/'):r.fulfill(json={})
    elif url.startswith(base):r.continue_()
    elif '/assets/skills/' in url or '/UI/' in url:r.fulfill(path=str(ROOT/'assets/ui/game-genshin.png'))
    else:r.abort()
   page.route('**/*',route)
   rows=[{'id':'n1','kind':'note','game':'gi','category':'build','label':'Souvenir personnel','text':'Build Furina','at':1794700000000,'day':'2026-11-14'},{'id':'v1','kind':'visit','game':'hsr','section':'hsr-builds','label':'Mes builds HSR','at':1794700100000,'day':'2026-11-15'},{'id':'v2','kind':'visit','game':'ww','section':'teams','label':'Équipes','at':1794700200000,'day':'2026-11-15'}]
   seed={'astralis:active-game':'gi','astralis:gi:assistant-profile':json.dumps({'enabled':False,'proactive':False}),'astralis:journey-log:v1':json.dumps(rows,ensure_ascii=False)}
   page.add_init_script('for(const [key,value]of Object.entries('+json.dumps(seed,ensure_ascii=False)+'))localStorage.setItem(key,value)')
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.locator('[data-nav=journey]').first.click();page.wait_for_selector('.journey-filters');recap=page.locator('.journey-week-recap');expect(recap).to_contain_text('4 traces');expect(recap.locator('.journey-week-stats article').nth(0).locator('b')).to_have_text('3');expect(recap.locator('.journey-week-stats article').nth(0).locator('small')).to_have_text('pages visitées');expect(recap.locator('.journey-week-stats article').nth(1).locator('b')).to_have_text('1');expect(recap.locator('.journey-week-day')).to_have_count(7);expect(recap.locator('.journey-week-revisit')).to_have_attribute('data-nav','dashboard');expect(recap.locator('.journey-week-revisit')).to_have_attribute('data-planner-game','gi')
   expect(page.locator('[data-journey-filter-count]')).to_have_text('4 / 4 traces')
   page.locator('[data-journey-filter=query]').fill('furina');expect(page.locator('.journey-entry:visible')).to_have_count(1)
   page.locator('[data-journey-filter=query]').fill('');page.locator('[data-journey-filter=game]').select_option('hsr');expect(page.locator('.journey-entry:visible')).to_have_count(1)
   page.locator('[data-journey-filter=game]').select_option('all');page.locator('[data-journey-filter=category]').select_option('build');expect(page.locator('.journey-entry:visible')).to_have_count(1);expect(page.locator('.journey-entry:visible')).to_contain_text('Build')
   page.locator('[data-journey-filter=category]').select_option('idea');expect(page.locator('.journey-entry:visible')).to_have_count(0)
   page.locator('[data-journey-filter=kind]').select_option('note');expect(page.locator('.journey-entry:visible')).to_have_count(0);expect(page.locator('[data-journey-no-results]')).to_be_visible()
   page.locator('[data-journey-filter-reset]').click();expect(page.locator('.journey-entry:visible')).to_have_count(4);assert not errors,errors
   page.evaluate('''()=>{window.__journeyBlob=null;window.__journeyDownload='';URL.createObjectURL=blob=>(window.__journeyBlob=blob,'blob:journey-test');HTMLAnchorElement.prototype.click=function(){window.__journeyDownload=this.download}}''')
   page.locator('[data-journey-filter=query]').fill('furina');page.locator('[data-journey-export="filtered"]').click();page.wait_for_function('window.__journeyBlob!==null');filtered=json.loads(page.evaluate('async()=>await window.__journeyBlob.text()'));assert [row['id'] for row in filtered]==['n1'];assert 'selection-' in page.evaluate('window.__journeyDownload')
   page.locator('[data-journey-filter-reset]').click();page.evaluate('window.__journeyBlob=null');page.locator('[data-journey-export="all"]').click();page.wait_for_function('window.__journeyBlob!==null');complete=json.loads(page.evaluate('async()=>await window.__journeyBlob.text()'));assert len(complete)==4;assert 'complet-' in page.evaluate('window.__journeyDownload')
   selected_day=page.locator('[data-journey-day="2026-11-15"]');assert selected_day.is_visible(),'La journée avec activité n’est pas proposée dans la carte';selected_day.click();expect(page.locator('.journey-entry:visible')).to_have_count(2);expect(page.locator('[data-journey-selected-day]')).to_contain_text('15 nov.');page.locator('[data-journey-clear-day]').click();expect(page.locator('.journey-entry:visible')).to_have_count(4);selected_day.click();expect(page.locator('.journey-entry:visible')).to_have_count(2);selected_day.click();expect(page.locator('.journey-entry:visible')).to_have_count(4)
   page.set_viewport_size({'width':390,'height':844});assert page.locator('[data-journey-delete="n1"]').is_visible(),'La commande pour supprimer une note est inaccessible sur téléphone';assert page.locator('[data-journey-log]').evaluate('(node)=>node.scrollWidth<=node.clientWidth'),'Le carnet déborde sur téléphone'
   page.locator('[data-journey-delete="n1"]').click();assert page.evaluate("JSON.parse(localStorage.getItem('astralis:journey-log:v1')).some(row=>row.id==='n1')"),'Une suppression annulée a effacé la note';page.locator('[data-journey-delete="n1"]').click();assert not page.evaluate("JSON.parse(localStorage.getItem('astralis:journey-log:v1')).some(row=>row.id==='n1')"),'La note supprimée est encore enregistrée';page.locator('.toast-action-button').click();restored=page.evaluate("JSON.parse(localStorage.getItem('astralis:journey-log:v1')).find(row=>row.id==='n1')");assert restored and restored['text']=='Build Furina','Annuler n’a pas restauré le souvenir complet';page.locator('[data-journey-delete="n1"]').click();assert not page.evaluate("JSON.parse(localStorage.getItem('astralis:journey-log:v1')).some(row=>row.id==='n1')"),'La note supprimée après confirmation est encore enregistrée';assert page.evaluate("JSON.parse(localStorage.getItem('astralis:journey-log:v1')).some(row=>row.id==='v1')"),'La suppression a effacé une visite sans rapport'
   form=page.locator('[data-journey-note-form]');form.locator('[data-journey-note-category]').select_option('farm');form.locator('#journey-note-input').fill('Matériaux à récolter demain');form.locator('button[type=submit]').click();page.wait_for_function("JSON.parse(localStorage.getItem('astralis:journey-log:v1')).some(row=>row.text==='Matériaux à récolter demain'&&row.category==='farm')");assert not errors,errors
   browser.close()
  print('OK: recherche, filtres croisés, état vide et réinitialisation du carnet fonctionnent.')
 finally:server.shutdown()
if __name__=='__main__':main()


