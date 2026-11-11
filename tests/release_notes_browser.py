import threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':390,'height':844});page.goto(f'http://127.0.0.1:{server.server_port}/tests/sheets-harness.html');page.evaluate("async()=>{window.notes=await import('/src/release-notes.js');document.body.innerHTML='<button id=return>Ouvrir le journal</button>';const css=document.createElement('link');css.rel='stylesheet';css.href='/assets/recovery-workshop.css';document.head.append(css);document.querySelector('#return').focus();await notes.showReleaseNotes({automatic:true});}")
   expect(page.locator('.release-notes-notice')).to_be_visible();expect(page.locator('dialog')).to_have_count(0);page.locator('.release-notes-notice button').first.click();dialog=page.get_by_role('dialog');expect(dialog).to_be_visible();expect(dialog).to_contain_text('Un atelier plus fiable');assert dialog.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1');dialog.locator('summary').click();expect(dialog).to_contain_text('laboratoire');page.keyboard.press('Escape');expect(dialog).to_have_count(0)
   page.wait_for_function("localStorage.getItem('astralis:releases:last-seen')==='2026-11-11-atelier-1'")
   assert page.evaluate("localStorage.getItem('astralis:releases:last-seen')")=='2026-11-11-atelier-1'
   assert page.evaluate('notes.showReleaseNotes({automatic:true})') is False
   page.locator('#return').focus();page.evaluate('notes.showReleaseNotes()');expect(page.get_by_role('dialog')).to_be_visible();page.get_by_role('button',name='Compris',exact=True).click();expect(page.locator('#return')).to_be_focused()
   page.evaluate('notes.showReleaseNotes({load:async()=>{throw new Error("offline")}})');expect(page.get_by_role('dialog')).to_contain_text('temporairement indisponible');page.keyboard.press('Escape')
   browser.close();print('Nouveautés : annonce discrète, lecture, fermeture, mémoire, réouverture, mobile et repli validés.',flush=True)
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
