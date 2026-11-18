import threading
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server

def main():
    server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch();page=browser.new_page(viewport={'width':1366,'height':900});page.goto(base+'/tests/fixtures/catalog-toolbar.html')
            bar=page.locator('.collection-bar');controls=page.locator('.collection-controls');expect(bar).to_be_visible()
            copy_y=page.locator('.collection-copy').bounding_box()['y'];controls_y=controls.bounding_box()['y'];assert abs(copy_y-controls_y)<15
            page.set_viewport_size({'width':1920,'height':1080});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
            page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');assert controls.evaluate('el=>el.scrollWidth>el.clientWidth')
            controls.evaluate('el=>el.scrollLeft=120');assert controls.evaluate('el=>el.scrollLeft>0')
            browser.close()
        print('OK : barre compacte sur PC, largeur 1920 et défilement isolé sur téléphone.')
    finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
