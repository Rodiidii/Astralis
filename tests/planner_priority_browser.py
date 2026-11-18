import json, threading
from datetime import date, timedelta
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    today = date.today()
    iso = lambda delta: (today + timedelta(days=delta)).isoformat()
    tasks = [
        {'id':'current', 'title':'Déjà planifiée', 'due':iso(0), 'done':False, 'priority':'Normale'},
        {'id':'urgent', 'title':'Priorité urgente', 'due':iso(-1), 'done':False, 'priority':'Urgente'},
        {'id':'high', 'title':'Priorité haute', 'due':iso(-2), 'done':False, 'priority':'Haute'},
        {'id':'normal', 'title':'Priorité normale', 'due':'', 'done':False, 'priority':'Normale'},
        {'id':'low', 'title':'Priorité basse', 'due':'', 'done':False, 'priority':'Basse'},
        {'id':'done', 'title':'Déjà terminé', 'due':iso(-3), 'done':True, 'priority':'Urgente'},
    ]
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(service_workers='block')
            page.set_default_timeout(60000)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:tasks:gi'," + json.dumps(json.dumps(tasks)) + ");localStorage.setItem('astralis:gi:assistant-profile','{\"enabled\":false}')")
            page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            page.wait_for_function("document.documentElement.dataset.appReady==='true'")
            page.locator('[data-nav=planner]').first.click()
            button = page.locator('[data-action=planner-spread-backlog]')
            expect(button).to_be_enabled()
            expect(button).to_have_attribute('title', 'Préserver les tâches fixes et équilibrer la durée estimée sur les jours libres')
            before = page.evaluate("localStorage.getItem('astralis:tasks:gi')")
            page.set_viewport_size({'width': 390, 'height': 844})
            button.click()
            dialog = page.locator('.planner-spread-dialog')
            expect(dialog).to_be_visible()
            expect(dialog).to_contain_text('Vérifie ta semaine avant de déplacer les tâches')
            expect(dialog).to_contain_text('Priorité urgente')
            assert page.locator('.planner-spread-days').evaluate("node => node.scrollWidth <= node.clientWidth")
            assert page.evaluate("localStorage.getItem('astralis:tasks:gi')") == before
            dialog.locator('[data-planner-spread-confirm]').click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:tasks:gi')).find(task=>task.id==='urgent')?.due!==new Date().toLocaleDateString('sv-SE')")
            saved = {row['id']: row.get('due') for row in page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi'))")}
            priority_dates = [saved[key] for key in ('urgent','high','normal','low')]
            assert all(value >= iso(0) for value in priority_dates), saved
            assert priority_dates == sorted(priority_dates), saved
            assert saved['done'] == iso(-3), saved
            expect(page.locator('.toast-message')).to_contain_text('après vérification de la charge')
            assert not errors, errors
            browser.close()
            print('Planificateur : prévisualise la charge avant confirmation, respecte les priorités et préserve les tâches terminées.')
    finally:
        server.shutdown(); server.server_close()


if __name__ == '__main__':
    main()
