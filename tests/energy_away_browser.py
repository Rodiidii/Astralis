import json,threading,time
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':390,'height':844},service_workers='block');page.set_default_timeout(30000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   now=int(time.time()*1000);row={'current':190,'max':200,'minutes':8,'updatedAt':now,'history':[]}
   page.add_init_script('localStorage.setItem("astralis:energy-dock:v1",'+json.dumps(json.dumps({'gi':row}))+')')
   page.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
   page.goto(base+'/tests/fixtures/energy-presets.html',wait_until='domcontentloaded');away=page.locator('[data-energy-away]');expect(away).to_be_visible();away.locator('[data-energy-away-duration]').select_option('480')
   expect(away.locator('[data-energy-away-spend]')).to_have_text('−50');expect(away.locator('[data-energy-away-return]')).to_have_text('200 / 200');expect(away.locator('[data-energy-away-message]')).to_contain_text('Dépense 50 maintenant')
   away.locator('[data-energy-away-apply]').click();expect(page.locator('.energy-log')).to_contain_text('Protection avant absence');expect(page.locator('[data-energy-away-spend]')).to_have_text('0');expect(page.locator('[data-energy-away-apply]')).to_be_disabled()
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'débordement horizontal mobile';assert not errors,errors;browser.close()
  print('OK : projection et application de dépense d’absence, sans débordement mobile.')
 finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
