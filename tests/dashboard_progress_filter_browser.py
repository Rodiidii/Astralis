import threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(service_workers='block');page.goto(base+'/tests/fixtures/dashboard-progress-filter.html',wait_until='load');page.wait_for_selector('[data-feature-progress-character]');expect(page.locator('.feature-readiness')).to_have_count(2);expect(page.locator('.feature-readiness [role="progressbar"]').nth(0)).to_have_attribute('aria-valuenow','67');expect(page.locator('.feature-readiness').nth(0)).to_contain_text('Farm restant');expect(page.locator('.feature-readiness [role="progressbar"]').nth(1)).to_have_attribute('aria-valuenow','0');page.evaluate("window.progressContext.farmRows[0].done=true;window.renderProgress()");expect(page.locator('.feature-readiness [role="progressbar"]').nth(0)).to_have_attribute('aria-valuenow','100');expect(page.locator('.feature-readiness').nth(0)).to_contain_text('Farm terminé');page.locator('[data-feature-progress-character]').select_option('a');expect(page.locator('.feature-readiness')).to_have_count(1);expect(page.locator('.feature-readiness')).to_contain_text('Aether');assert page.evaluate("JSON.parse(localStorage.getItem('astralis:studio:progress-person:gi'))")== 'a';page.evaluate('window.renderProgress()');expect(page.locator('[data-feature-progress-character]')).to_have_value('a');expect(page.locator('.feature-readiness')).to_have_count(1);page.locator('[data-feature-progress-character]').select_option('all');expect(page.locator('.feature-readiness')).to_have_count(2);assert not page.locator('.feature-filter-empty').count();browser.close()
  print('OK : jauges de préparation, mise à jour du farm, filtre personnage et retour à Tous.')
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
