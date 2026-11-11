import threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(service_workers='block');page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   def route(r):
    if r.request.url.startswith(base+'/api/'):r.fulfill(json={})
    elif r.request.url.startswith(base):r.continue_()
    else:r.abort()
   page.route('**/*',route);page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:gi:assistant-profile','{\"enabled\":false}');localStorage.setItem('astralis:releases:last-seen','2026-11-11-atelier-1');")
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.locator('[data-nav=sets]').first.click();page.locator('[data-create-artifact]').click();dialog=page.locator('.artifact-create-dialog');expect(dialog).to_be_visible()
   expect(dialog.locator('[name=value]')).to_have_value('4780');dialog.locator('[name=slot]').select_option('goblet');dialog.locator('[name=main]').select_option('cryoDmg');expect(dialog.locator('[name=value]')).to_have_value('46.6');dialog.locator('[name=level]').fill('0');dialog.locator('[name=level]').press('Tab');expect(dialog.locator('[name=value]')).to_have_value('7')
   dialog.locator('[name=level]').fill('20');dialog.locator('[name=level]').press('Tab');expect(dialog.locator('[name=value]')).to_have_value('46.6')
   dialog.locator('[name=stat0]').select_option('defFlat');dialog.locator('[name=roll0]').fill('39');dialog.locator('[name=stat1]').select_option('defFlat');dialog.locator('[name=roll1]').fill('23');dialog.locator('[type=submit]').click();expect(dialog.locator('[role=status]')).to_contain_text('répétée');assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:owned-artifacts')||'[]').length")==0
   dialog.locator('[name=stat1]').select_option('critRate');dialog.locator('[name=roll1]').fill('7.8');dialog.locator('[type=submit]').click();expect(dialog.locator('[role=status]')).to_contain_text('enregistrée');expect(dialog).to_be_visible();expect(dialog.locator('[name=slot]')).to_have_value('flower');expect(dialog.locator('[name=value]')).to_have_value('4780');expect(dialog.locator('[name=roll0]')).to_have_value('')
   dialog.locator('[type=submit]').click();expect(dialog.locator('[role=status]')).to_contain_text('enregistrée');rows=page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:owned-artifacts'))");assert len(rows)==2;assert rows[0]['mainType']=='cryoDmg' and rows[0]['mainValue']==46.6;assert rows[0]['substats'][0]['value']==39
   assert not errors,errors;browser.close();print('Création artéfact : principales par niveau, erreurs, diagnostic et saisies successives vérifiés.',flush=True)
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
