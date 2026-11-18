import json,threading
from functools import partial
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1360,'height':900},service_workers='block');page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
   def route(request):
    path=urlsplit(request.request.url).path
    if path.startswith('/api/'):request.fulfill(json={})
    elif request.request.url.startswith(base):request.continue_()
    elif '/assets/skills/' in request.request.url or '/UI/' in request.request.url:request.fulfill(path=str(ROOT/'assets/ui/game-genshin.png'))
    else:request.abort()
   page.route('**/*',route)
   existing=[{'id':'visit-old','kind':'visit','game':'gi','section':'characters','label':'Personnages','at':1794700000000,'day':'2026-11-15'}]
   page.add_init_script('localStorage.setItem("astralis:active-game","gi");localStorage.setItem("astralis:gi:assistant-profile",JSON.stringify({enabled:false,proactive:false}));localStorage.setItem("astralis:journey-log:v1",'+json.dumps(json.dumps(existing))+')')
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.locator('[data-nav=journey]').first.click();page.wait_for_selector('[data-journey-import-trigger]')
   payload=[existing[0],{'id':'note-new','kind':'note','game':'ww','label':'Souvenir restauré','text':'Essayer une équipe','at':1794700300000,'day':'2026-11-15'}]
   with page.expect_file_chooser() as picker:page.locator('[data-journey-import-trigger]').click()
   picker.value.set_files({'name':'astralis-carnet.json','mimeType':'application/json','buffer':json.dumps(payload,ensure_ascii=False).encode()})
   expect(page.locator('[data-journey-filter-count]')).to_have_text('3 / 3 traces')
   saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:journey-log:v1'))")
   assert len(saved)==3 and sum(row['id']=='note-new' for row in saved)==1,'La sauvegarde n’a pas été fusionnée avec les données locales.'
   assert not errors,errors;browser.close()
  print('OK: import depuis le sélecteur, fusion sans doublon, persistance locale et rafraîchissement visuel.')
 finally:server.shutdown()
if __name__=='__main__':main()
