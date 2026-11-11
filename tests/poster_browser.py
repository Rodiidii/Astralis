"""PNG preview, browser clipboard and download use the same pixels."""
import hashlib
import threading
from functools import partial
from tempfile import TemporaryDirectory
from pathlib import Path
from urllib.parse import urlsplit, unquote

from playwright.sync_api import sync_playwright
from voyage_browser import ROOT, Quiet, Server


def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as playwright, TemporaryDirectory() as tmp:
            browser = playwright.chromium.launch()
            context = browser.new_context(accept_downloads=True, permissions=['clipboard-read', 'clipboard-write'])
            page = context.new_page()
            page.set_default_timeout(120000)
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
                    request.fulfill(path=str(ROOT / 'assets/ui/game-genshin.png'))
                elif path.startswith(('/api/', '/data/')):
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
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            page.locator('[data-nav=teams]').first.click()
            page.locator('[data-team-export-png=poster-team]').click()
            dialog = page.locator('.astralis-png-preview')
            canvas = dialog.locator('canvas')
            try:
                canvas.wait_for(timeout=25000)
            except Exception:
                print('Erreurs navigateur:', errors, 'Apercu:', dialog.all_text_contents(), flush=True)
                raise
            assert canvas.evaluate('c=>c.width') == 4000
            assert dialog.get_by_label('Copier aussi dans le presse-papiers').is_checked()
            dialog.get_by_label('Palette',exact=True).select_option('pyro')
            page.wait_for_function("document.querySelector('.astralis-png-preview canvas')?.sheetAudit?.element==='pyro' && !document.querySelector('.astralis-png-preview [data-save]').disabled")
            expected = canvas.evaluate("""async c => {
              const data=await (await fetch(c.toDataURL())).arrayBuffer();
              return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)), n=>n.toString(16).padStart(2,'0')).join('');
            }""")
            with page.expect_download() as pending:
                dialog.get_by_role('button',name='Enregistrer le PNG').click()
            file = Path(tmp) / 'export.png'
            pending.value.save_as(file)
            assert hashlib.sha256(file.read_bytes()).hexdigest() == expected
            dialog.get_by_text('PNG enregistré et copié.', exact=True).wait_for()
            assert page.evaluate("(async()=> (await navigator.clipboard.read()).some(item=>item.types.includes('image/png')))()")
            dialog.get_by_role('button',name='Fermer').click()
            page.locator('[data-nav=characters]').first.click()
            page.locator('.character-catalog-card').first.click()
            page.locator('[data-export-catalog-png]').click()
            dialog.get_by_label('Format').select_option('square')
            page.wait_for_function("document.querySelector('.astralis-png-preview canvas')?.width===2160")
            dialog.get_by_role('button',name='Fermer').click()
            page.keyboard.press('Escape')
            page.locator('[data-nav=builds]').first.click()
            page.locator('[data-action=build-new]').first.click(timeout=10000)
            page.locator('[data-action=build-export-png]').click()
            page.wait_for_function("document.querySelector('.astralis-png-preview canvas')?.width===4000 && !document.querySelector('.astralis-png-preview [data-save]').disabled")
            assert canvas.evaluate('c=>c.height') >= 2840
            assert not errors, errors
            print('PNG équipe, build et personnage : aperçu, formats, téléchargement et copie vérifiés.', flush=True)
            browser.close()
    finally:
        server.shutdown()


if __name__ == '__main__':
    main()
