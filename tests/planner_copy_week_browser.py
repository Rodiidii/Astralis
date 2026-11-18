import json, threading
from datetime import date, timedelta
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    today = date.today()
    iso = lambda delta: (today + timedelta(days=delta)).isoformat()
    tasks = [
        {'id': 'source-a', 'title': 'Préparer Furina', 'due': iso(-7), 'done': False, 'priority': 'Haute', 'category': 'Build'},
        {'id': 'source-done', 'title': 'Objectif déjà terminé', 'due': iso(-6), 'done': True},
        {'id': 'source-b', 'title': 'Réviser la rotation', 'due': iso(-6), 'done': False, 'priority': 'Normale'},
        {'id': 'already-there', 'title': 'preparer furina', 'due': iso(0), 'done': False},
    ]
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(service_workers='block', viewport={'width': 1440, 'height': 1000})
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:tasks:gi'," + json.dumps(json.dumps(tasks, ensure_ascii=False)) + ");localStorage.setItem('astralis:tasks:hsr'," + json.dumps(json.dumps([{'id':'hsr-today','title':'Réviser un cône','due':iso(0),'done':False}], ensure_ascii=False)) + ");localStorage.setItem('astralis:gi:assistant-profile','{\"enabled\":false}')")
            page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            page.wait_for_function("document.documentElement.dataset.appReady==='true'")
            for _ in range(5):
                page.locator('.side-rail [data-nav=planner]').evaluate('(el) => el.click()')
                try:
                    page.wait_for_selector('.planner-week-grid', timeout=2500)
                    break
                except Exception:
                    continue
            button = page.locator('[data-action=planner-copy-last-week]')
            expect(button).to_be_enabled()
            expect(button).to_contain_text('2')
            button.click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:tasks:gi')).length===5")
            today_cell = page.locator(f'.planner-day[data-planner-drop-date="{iso(0)}"]')
            expect(today_cell.locator('.planner-cross-game-badge')).to_contain_text('Genshin ×1 · Star Rail ×1')
            saved = page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi'))")
            copy = next(row for row in saved if row['id'] not in {task['id'] for task in tasks})
            assert copy['title'] == 'Réviser la rotation', copy
            assert copy['due'] == iso(1), copy
            assert copy['priority'] == 'Normale' and copy['done'] is False, copy
            assert sum(row['title'].lower() == 'preparer furina' and row['due'] == iso(0) for row in saved) == 1
            assert not any(row['id'] != 'source-done' and row['title'] == 'Objectif déjà terminé' for row in saved)
            page.set_viewport_size({'width': 390, 'height': 844})
            assert page.locator('.planner-week').evaluate('(el) => el.scrollWidth <= el.clientWidth'), 'l’agenda déborde horizontalement sur téléphone'
            expect(page.locator('[data-action=planner-copy-last-week]')).to_be_visible()
            page.set_viewport_size({'width': 1440, 'height': 1000})
            page.locator('[data-action=planner-copy-last-week]').click()
            expect(page.locator('.toast-message').last).to_contain_text('Aucun nouvel objectif')
            assert len(page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi'))")) == 5
            page.evaluate('window.print = () => {};')
            page.locator('[data-action=planner-print-week]').click()
            assert page.locator('html').evaluate("el => el.classList.contains('planner-print-week')")
            page.emulate_media(media='print')
            assert page.locator('.planner-week').evaluate("el => getComputedStyle(el).visibility") == 'visible'
            assert page.locator('.planner-hero').evaluate("el => getComputedStyle(el).visibility") == 'hidden'
            page.emulate_media(media='screen')
            page.evaluate("window.dispatchEvent(new Event('afterprint'))")
            assert not errors, errors
            browser.close()
            print('Planificateur : copie les objectifs ouverts aux mêmes jours, garde leurs détails, ignore terminés/doublons et ne recopie pas deux fois.')
    finally:
        server.shutdown(); server.server_close()


if __name__ == '__main__':
    main()
