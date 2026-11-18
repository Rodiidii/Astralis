from __future__ import annotations
import json, threading
from datetime import date
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    row = {'id': 'group-farm', 'date': date.today().isoformat(), 'title': 'Livres de talents',
           'category': 'Domaine', 'characterIds': ['furina', 'nahida'], 'character': 'Furina, Nahida',
           'materialIds': [], 'done': False}
    requests = []
    errors = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width': 1280, 'height': 900}, service_workers='block')
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('request', lambda request: requests.append(request.url))
            page.route('**/api/gi/events', lambda route: route.fulfill(json={'events': []}))
            page.route('**/*', lambda route: route.continue_() if request_host(route.request.url, base) else route.abort())
            page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:preferences',JSON.stringify({characterThemeMode:'off'}));localStorage.setItem('astralis:gi:farm-calendar'," + json.dumps(json.dumps([row])) + ")")
            task = {'id': 'inbox-task', 'title': 'Terminer la session', 'due': date.today().isoformat(), 'done': False}
            page.add_init_script("localStorage.setItem('astralis:tasks:gi'," + json.dumps(json.dumps([task], ensure_ascii=False)) + ")")
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            page.wait_for_timeout(1800)
            page.evaluate("document.querySelector('.side-rail [data-nav=journey]')?.click()")
            page.locator('[data-inbox-open]').click()
            expect(page.locator('.inbox-farm-person')).to_have_count(2, timeout=30000)
            expect(page.locator('.inbox-farm-person-progress')).to_have_text('0/2 personnages farmés')
            assert any('gi-characters.json' in url for url in requests), 'Le roster a été ignoré à l’ouverture.'
            page.locator('.inbox-farm-person').first.click()
            expect(page.locator('.inbox-farm-person-progress')).to_have_text('1/2 personnages farmés')
            page.locator('[data-inbox-action=task][data-task-id=inbox-task]').click()
            assert page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi'))[0].done") is True
            expect(page.locator('.inbox-task-undo [data-inbox-task-undo]')).to_be_visible()
            page.locator('.inbox-task-undo [data-inbox-task-undo]').click()
            expect(page.locator('.inbox-item[data-inbox-kind=task]')).to_contain_text('Terminer la session')
            assert page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi'))[0].done") is False
            assert not errors, errors
            browser.close()
        print('Boîte de bord : roster disponible depuis le Carnet; suivi multi-personnages 0/2 -> 1/2, aucune erreur.', flush=True)
    finally:
        server.shutdown(); server.server_close()


def request_host(url, base):
    return url.startswith(base)


if __name__ == '__main__':
    main()
