"""Smoke test for the real relation-source panel and its local JSON export."""
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
            page = browser.new_page(service_workers='block')
            page.set_default_timeout(60000)

            def route(request):
                path = urlsplit(request.request.url).path
                if path.startswith('/api/'):
                    request.fulfill(json={})
                elif not request.request.url.startswith(base):
                    request.abort()
                else:
                    file = (ROOT / unquote(path).lstrip('/')).resolve()
                    if file.is_dir():
                        file = file / 'index.html'
                    if file.is_relative_to(ROOT) and file.is_file():
                        request.fulfill(path=str(file))
                    else:
                        request.fulfill(status=404, body='')

            page.route('**/*', route)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.add_init_script("localStorage.setItem('astralis:active-game','gi')")
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            page.evaluate("document.querySelector('[data-nav=relations]').click()")
            page.wait_for_selector('.relations-board canvas')
            page.set_viewport_size({'width': 390, 'height': 844})
            page.get_by_role('button', name='Sources', exact=True).click()
            page.locator('.relations-source-card').first.wait_for()
            assert page.locator('.relations-source-card').count() > 0
            reference = page.evaluate('''()=>{const e=document.querySelector('.relations-reference-audit');return {text:e?.innerText||'',sample:e?.querySelector('.relations-reference-sample')?.getAttribute('href')||'',visible:!!e&&e.getClientRects().length>0,fits:!!e&&e.scrollWidth<=e.clientWidth+1}}''')
            assert reference['visible']
            assert reference['fits']
            reference_text = ''.join(reference['text'].split())
            assert '233308' in reference_text and '2330000' in reference_text
            assert reference['sample'].endswith('/story/en/Amber.json')
            page.evaluate('''()=>{window.__auditBlob=null;window.__auditFilename='';URL.createObjectURL=blob=>(window.__auditBlob=blob,'blob:relation-audit');HTMLAnchorElement.prototype.click=function(){window.__auditFilename=this.download}}''')
            page.evaluate("document.querySelector('astralis-relations').utility.querySelector('[data-source-export]').click()")
            page.wait_for_function("window.__auditBlob && window.__auditFilename==='astralis-audit-sources-relations.json'")
            export = json.loads(page.evaluate('async()=>await window.__auditBlob.text()'))
            assert export['evidenceCount'] > 0 and export['groups']
            assert export['reference']['counts']['storyLines'] == 233308
            assert export['reference']['delivery']['documentedBulkApi'] is False
            assert page.locator('.relations-source-audit-grid').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
            browser.close()
        print('OK: audit des sources ouvert, export JSON valide, panneau sans débordement mobile.')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
