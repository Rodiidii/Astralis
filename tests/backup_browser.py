import json,threading,tempfile
from pathlib import Path
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 seed={'astralis:gi:objectives-v2':json.dumps({'targets':[{'name':'Test sauvegarde','copies':2}],'income':{'start':'2026-11-04','end':'2026-12-16'}}),'astralis:gi:talent-targets':json.dumps({'skirk':{'from':[1,6,8],'to':[6,8,10]}}),'astralis:gi:farm-xp':'{"purple":123}','astralis:gi:farm-priority':'["skirk","furina"]'}
 try:
  with sync_playwright() as p,tempfile.TemporaryDirectory() as temporary:
   browser=p.chromium.launch();page=browser.new_page(service_workers='block',accept_downloads=True);page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   def route(r):
    if r.request.url.startswith(base+'/api/'):r.fulfill(json={})
    elif r.request.url.startswith(base):r.continue_()
    else:r.abort()
   page.route('**/*',route);page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:gi:assistant-profile','{\"enabled\":false}');")
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.evaluate('seed=>{for(const[k,v]of Object.entries(seed))localStorage.setItem(k,v)}',seed)
   with page.expect_download() as download:page.locator('[data-action=export]').first.click()
   path=Path(temporary)/'backup.json';download.value.save_as(str(path));backup=json.loads(path.read_text(encoding='utf-8'))
   for key,value in seed.items():assert backup['workspaceState']['entries'][key]==value
   page.evaluate('keys=>keys.forEach(key=>localStorage.removeItem(key))',list(seed));page.locator('#import-file').set_input_files(str(path));page.wait_for_function("localStorage.getItem('astralis:gi:farm-xp')==='{"+'"purple":123'+'}' +"'")
   for key,value in seed.items():assert page.evaluate('key=>localStorage.getItem(key)',key)==value
   page.reload(wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');expect(page.locator('.backup-reminder')).to_have_count(0)
   page.evaluate("localStorage.setItem('astralis:backup:last-export','1')");page.reload(wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');expect(page.locator('.backup-reminder')).to_be_visible();page.locator('[data-backup-later]').click();expect(page.locator('.backup-reminder')).to_have_count(0)
   assert int(page.evaluate("localStorage.getItem('astralis:backup:snooze-until')"))>0
   assert not errors,errors;browser.close();print('Sauvegarde portable : téléchargement réel et restauration objectifs/talents/stock/priorités validés.',flush=True)
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
