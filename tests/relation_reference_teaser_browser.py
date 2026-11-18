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
            page=browser.new_page(viewport={'width':390,'height':844})
            page.goto(base+'/tests/fixtures/relations-reference-teaser.html',wait_until='domcontentloaded')
            teaser=page.locator('.relations-reference-teaser')
            expect(teaser.locator('.relations-reference-teaser-counts>span')).to_have_count(4)
            expect(teaser).to_contain_text('233 308')
            assert teaser.evaluate('(e)=>e.scrollWidth<=e.clientWidth+1')
            assert teaser.locator('a').get_attribute('href').startswith('https://ties.catforest.dev/genshin')
            assert teaser.locator('a').get_attribute('rel')=='noopener noreferrer'
            assert teaser.locator('.relations-reference-teaser-counts').evaluate('(e)=>getComputedStyle(e).gridTemplateColumns.split(" ").length')==2
            page.set_viewport_size({'width':1920,'height':1080})
            assert teaser.evaluate('(e)=>e.scrollWidth<=e.clientWidth+1')
            browser.close()
        print('OK : compteurs et provenance visibles, lisibles sur mobile et bureau.')
    finally:
        server.shutdown();server.server_close()


if __name__=='__main__':main()
