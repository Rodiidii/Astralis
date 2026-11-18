import threading
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch()
   page=browser.new_page(viewport={'width':390,'height':844},service_workers='block')
   page.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
   page.goto(base+'/tests/fixtures/energy-presets.html',wait_until='domcontentloaded')
   panel=page.locator('[data-energy-today]');expect(panel).to_be_visible()
   cols=panel.locator(':scope>div').evaluate('(el)=>getComputedStyle(el).gridTemplateColumns.split(" ").length')
   assert cols==2,cols
   weekly=page.locator('[data-energy-week]');expect(weekly).to_be_visible()
   comparison=weekly.locator('[data-energy-week-comparison]');expect(comparison).to_contain_text('comparaison hebdomadaire apparaîtra')
   heatmap=page.locator('[data-energy-month]');expect(heatmap).to_be_visible()
   assert heatmap.locator('.energy-month-day').count()==28
   assert heatmap.evaluate('(el)=>el.scrollWidth<=el.clientWidth')
   assert weekly.evaluate('(el)=>el.scrollWidth<=el.clientWidth')
   browser.close()
  print('OK : suivi quotidien, comparaison hebdomadaire et calendrier restent lisibles sur mobile.')
 finally:
  server.shutdown();server.server_close()

if __name__=='__main__':main()
