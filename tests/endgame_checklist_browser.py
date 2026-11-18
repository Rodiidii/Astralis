import json, threading
from functools import partial
from urllib.parse import urlsplit, unquote
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server

def main():
    server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch()
            page=browser.new_page(service_workers='block')
            page.set_default_timeout(30000)
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            def route(request):
                if not request.request.url.startswith(base):
                    request.abort();return
                if '/api/gi/endgame' in request.request.url:
                    request.fulfill(json={'blessing':'Rotation QA','floors':[{'floor':'12','levels':'Niveau 95','chambers':[{'name':'Chambre 1','halves':[{'name':'Première moitié','enemies':[{'name':'Boss A'}]},{'name':'Seconde moitié','enemies':[{'name':'Boss A'}]}]}]}]})
                elif '/api/' in request.request.url or '/data/' in request.request.url:
                    request.fulfill(json={})
                else:
                    path=(ROOT/unquote(urlsplit(request.request.url).path).lstrip('/')).resolve()
                    if path.is_dir():path=path/'index.html'
                    request.fulfill(path=str(path)) if path.is_relative_to(ROOT) and path.is_file() else request.fulfill(status=404,body='')
            page.route('**/*',route)
            page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:gi:assistant-profile','{\"enabled\":false}')")
            page.goto(base,wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen',state='detached')
            page.wait_for_selector('.dashboard-studio')
            page.evaluate('document.querySelector(`[data-nav="endgame"]`).click()')
            first=page.locator('[data-endgame-enemy]').nth(0)
            second=page.locator('[data-endgame-enemy]').nth(1)
            expect(first).to_be_visible();expect(second).to_be_visible()
            assert first.get_attribute('data-endgame-enemy') != second.get_attribute('data-endgame-enemy')
            first.check()
            expect(page.locator('.endgame-half-checklist').nth(0)).to_contain_text('1/1 vaincus')
            expect(page.locator('.endgame-half-checklist').nth(1)).to_contain_text('0/1 vaincus')
            page.locator('.endgame-half-checklist').nth(0).locator('[data-endgame-stars="3"]').click()
            expect(page.locator('.endgame-half-checklist').nth(0).locator('[data-endgame-stars-value]')).to_have_text('3 / 3')
            score_id = page.locator('.endgame-half-checklist').nth(0).locator('[data-endgame-star-group]').get_attribute('data-endgame-star-group')
            saved_stars = page.evaluate("([key,id])=>({raw:localStorage.getItem(key), id, value:JSON.parse(localStorage.getItem(key)||'{}').scores?.[id]})", ['astralis:gi:endgame-stars:v1', score_id])
            assert saved_stars['value'] == 3, saved_stars
            stored=page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:endgame-checklist:v1'))")
            assert len(stored['defeated'])==1
            page.reload(wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen',state='detached')
            page.wait_for_selector('.dashboard-studio')
            page.evaluate('document.querySelector(`[data-nav="endgame"]`).click()')
            expect(page.locator('[data-endgame-enemy]').nth(0)).to_be_checked()
            expect(page.locator('.endgame-half-checklist').nth(0).locator('[data-endgame-stars="3"]')).to_have_attribute('aria-pressed','true')
            assert not errors,errors
            browser.close()
        print('OK : checklist Endgame indépendante par moitié et conservée après rechargement.')
    finally:
        server.shutdown();server.server_close()

if __name__=='__main__':main()
