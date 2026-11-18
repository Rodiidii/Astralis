import threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
   page.goto(base+'/tests/fixtures/daily-quiz-explanation.html');page.wait_for_selector('[data-quiz-answer]');page.locator('[data-quiz-answer]').last.click();expect(page.locator('[data-quiz-feedback]')).to_contain_text('Pas cette fois');expect(page.locator('.quiz-answer-context')).to_contain_text('Arme · Catalyseur');expect(page.locator('.quiz-answer-context')).to_contain_text('Région · Fontaine');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');assert not errors,errors;browser.close()
  print('OK: après réponse, le quiz révèle les autres repères du profil sans débordement mobile ni erreur JavaScript.')
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
