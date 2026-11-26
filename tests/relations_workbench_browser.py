"""Exercise relations using the actual local evidence snapshot."""
import json
import threading
from functools import partial
from urllib.parse import urlsplit, unquote

from playwright.sync_api import sync_playwright
from voyage_browser import ROOT, Quiet, Server


def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            context = browser.new_context(accept_downloads=True, permissions=['clipboard-read', 'clipboard-write'])
            page = context.new_page()
            page.set_default_navigation_timeout(120000)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))

            def route(request):
                path = urlsplit(request.request.url).path
                if path == '/data/version.json' and 'api.lunaris.moe' in request.request.url:
                    request.fulfill(json={'version':'test'})
                elif path.startswith('/data/test/fr/char/') and 'api.lunaris.moe' in request.request.url:
                    request.fulfill(json={'info':{'attributes':[]},'skills':{}})
                elif not request.request.url.startswith(base):
                    request.abort()
                elif path == '/api/image':
                    request.fulfill(status=403, body='Proxy désactivé pour ce test')
                elif path not in ('/data/relations.json','/data/relations-official.json') and path.startswith(('/api/', '/data/')):
                    request.fulfill(json={})
                else:
                    file = (ROOT / unquote(path).lstrip('/')).resolve()
                    if file.is_dir():
                        file = file / 'index.html'
                    if file.is_relative_to(ROOT) and file.is_file():
                        request.fulfill(path=str(file))
                    else:
                        request.fulfill(status=404, body='')

            page.route('**/*', route)
            page.add_init_script("""
              localStorage.setItem('astralis:active-game','gi');
              localStorage.setItem('astralis:teams:gi',JSON.stringify([{
                id:'poster-team',name:'Chœur astral',members:[
                  {character:'10000005',role:'Soutien'},{character:'10000121',role:'DPS'},{character:'10000038'},{}
                ],rotation:[{character:'10000005',name:'Compétence',code:'E',count:2}]
              }]));
            """)
            page.add_init_script("localStorage.setItem('astralis:cosmos:gi',JSON.stringify({revision:3,view:'blocks',background:'none',motion:false}))")
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            page.add_style_tag(content='#assistant-toast-stack{display:none!important}')
            page.locator('[data-nav=relations]').first.click()
            page.wait_for_selector('.relations-board canvas')
            assert page.locator('.relations-board button').count() > 80
            graph = page.locator('astralis-relations')
            graph.evaluate('g=>g.clearSelection()')
            page.locator('.kw-bar [data-kw=open]').click();dialog=page.locator('.kw-dialog');dialog.locator('[data-pane=relations]').click()
            edge=graph.evaluate('g=>({a:g.edges[0].a,b:g.edges[0].b,an:g.characters.get(g.edges[0].a).name,bn:g.characters.get(g.edges[0].b).name})')
            form=dialog.locator('[data-kw-form=path]');form.locator('select').first.select_option(edge['a']);form.locator('select').last.select_option(edge['b']);form.locator('button').click()
            assert dialog.locator('[data-path-result]').inner_text()==edge['an']+' → '+edge['bn']
            dialog.locator('[data-kw=graph-summary]').click();assert 'preuves' in dialog.locator('[data-graph-summary]').inner_text();dialog.locator('[data-kw=graph-save]').click();assert page.evaluate('JSON.parse(localStorage.getItem("astralis:knowledge:v1")).boards.length')==1
            with page.expect_download() as pending:dialog.locator('[data-kw=graph-csv]').click()
            assert pending.value.suggested_filename=='Relations-documentees.csv'
            dialog.locator('[data-kw=close]').click();page.set_viewport_size({'width':390,'height':844});page.wait_for_function('document.querySelector(".workspace").getBoundingClientRect().left<20');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
            assert not errors,errors
            print('OK actual relation edges, path names, research snapshot, CSV and mobile workbench',flush=True)
            browser.close()
    finally:
        server.shutdown()


if __name__ == '__main__':
    main()
