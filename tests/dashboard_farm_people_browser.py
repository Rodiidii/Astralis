"""Checks individual completion for multi-character farm sessions on the dashboard."""
import json, threading
from datetime import date
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    today = date.today().isoformat()
    row = {'id': 'group-farm', 'date': today, 'title': 'Livres d’aptitudes', 'category': 'Domaine',
           'characterIds': ['furina', 'nahida'], 'character': 'Furina, Nahida',
           'materialIds': [], 'done': False}
    errors = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width': 1440, 'height': 1000}, service_workers='block')
            page.on('pageerror', lambda error: errors.append(error.stack or str(error)))
            page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
            seed = {'astralis:active-game': 'gi', 'astralis:gi:farm-calendar': json.dumps([row])}
            page.add_init_script('for(const [key,value] of Object.entries(' + json.dumps(seed) + '))localStorage.setItem(key,value)')
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            page.wait_for_timeout(2500)
            page.evaluate("document.querySelector('[data-studio-edit]')?.click()")
            page.wait_for_selector('[data-studio-add="farm"]')
            page.evaluate('document.querySelector("[data-studio-add=farm]")?.click()')
            page.wait_for_selector('.farm-today-person-toggle[data-farm-person-id="furina"]', timeout=20000)
            progress = page.locator('.farm-today-person-progress')
            expect(progress).to_have_text('0/2 personnages préparés')
            page.locator('.farm-today-person-toggle[data-farm-person-id="furina"]').click()
            expect(progress).to_have_text('1/2 personnages préparés')
            saved = page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:farm-calendar'))[0]")
            assert saved['doneCharacters'] == ['furina'] and saved['done'] is False
            page.locator('.farm-today-person-toggle[data-farm-person-id="nahida"]').click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:gi:farm-calendar'))[0].done===true")
            assert not errors, errors
            browser.close()
            print('Tableau de bord : suivi individuel 0/2 -> 1/2 -> 2/2, état sauvegardé et aucune erreur JavaScript.', flush=True)
    finally:
        server.shutdown(); server.server_close()


if __name__ == '__main__':
    main()
