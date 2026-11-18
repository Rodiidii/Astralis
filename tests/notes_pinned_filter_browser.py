import json,threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 notes=[
  {'id':'furina','title':'Rotation Furina','body':'Réaction Vaporisation','tag':'Rotation','targetName':'Furina','pinned':True,'updated':2},
  {'id':'farm','title':'Notes de farm','body':'Résine et matériaux','tag':'Farm','targetName':'Neuvillette','pinned':False,'updated':1},
  {'id':'build','title':'Build','body':'Tests dégâts','tag':'Build','pinned':True,'updated':3},
 ]
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(service_workers='block');page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)+' '+str(e.stack)))
   page.add_init_script('localStorage.setItem("astralis:active-game","gi");localStorage.setItem("astralis:notes:gi",'+json.dumps(json.dumps(notes))+');localStorage.setItem("astralis:gi:assistant-profile","{\"enabled\":false}")')
   page.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.locator('[data-game=gi]').first.click();page.evaluate('notes=>localStorage.setItem("astralis:notes:gi",JSON.stringify(notes))',notes);page.locator('[data-nav=notes]').first.click();expect(page.locator('.note-card')).to_have_count(3)
   errors.clear();toggle=page.locator('[data-notes-pinned-only]');toggle.click();expect(toggle).to_have_attribute('aria-pressed','true');expect(page.locator('.note-card')).to_have_count(2);assert page.evaluate("localStorage.getItem('astralis:gi:notes-pinned-only')")=='true'
   toggle.click();search=page.locator('#notes-search');search.fill('resine');expect(page.locator('.note-card')).to_have_count(1);expect(page.locator('.note-card')).to_contain_text('Notes de farm')
   search.fill('NEUVILLETTE');expect(page.locator('.note-card')).to_have_count(1);page.locator('#note-filter').select_option('Rotation');expect(page.locator('.notes-grid .note-card')).to_have_count(0)
   search.fill('');page.locator('#note-filter').select_option('all');sort=page.locator('#notes-sort');sort.select_option('title');expect(page.locator('.note-card [data-edit-note]').first).to_have_attribute('data-edit-note','build');expect(page.locator('.note-card [data-edit-note]').nth(1)).to_have_attribute('data-edit-note','furina');assert page.evaluate("localStorage.getItem('astralis:gi:notes-sort')")=='title'
   sort.select_option('character');expect(page.locator('.note-card [data-edit-note]').first).to_have_attribute('data-edit-note','furina');expect(page.locator('.note-card [data-edit-note]').nth(1)).to_have_attribute('data-edit-note','build')
   sort.select_option('oldest');expect(page.locator('.note-card [data-edit-note]').first).to_have_attribute('data-edit-note','furina');sort.select_option('recent');expect(page.locator('.note-card [data-edit-note]').first).to_have_attribute('data-edit-note','build')
   page.locator('[data-delete-note=build]').click();expect(page.locator('.note-card')).to_have_count(2);expect(page.locator('.toast-message-action')).to_contain_text('supprimée du carnet');page.wait_for_function("JSON.parse(localStorage.getItem('astralis:notes:gi')).length===2");page.locator('.toast-action-button').click();expect(page.locator('.note-card')).to_have_count(3);restored=page.evaluate("JSON.parse(localStorage.getItem('astralis:notes:gi')).find(note=>note.id==='build')");assert restored['body']=='Tests dégâts' and restored['pinned'] is True,'L’annulation ne restaure pas le contenu original'
   page.locator('[data-delete-note=build]').click();page.evaluate("notes=>{const rows=JSON.parse(localStorage.getItem('astralis:notes:gi'));rows.unshift({...notes.find(note=>note.id==='build'),title:'Note concurrente'});localStorage.setItem('astralis:notes:gi',JSON.stringify(rows))}",notes);page.locator('.toast-action-button').click();expect(page.locator('.toast-message')).to_contain_text('aucune donnée remplacée');assert page.evaluate("JSON.parse(localStorage.getItem('astralis:notes:gi')).find(note=>note.id==='build').title")=='Note concurrente','L’annulation a écrasé une note ajoutée entre-temps'
   page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),'débordement horizontal des filtres du Carnet sur téléphone';expect(page.locator('#notes-sort')).to_be_visible()
   assert not errors,errors;browser.close()
  print('OK : filtres et recherche du Carnet, annulation de suppression sans écrasement, rendu mobile.')
 finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
