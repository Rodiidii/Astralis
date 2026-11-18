from __future__ import annotations
import json
import threading
from functools import partial
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width': 1280, 'height': 900}, service_workers='block')
            page.set_default_timeout(60000)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))

            def route(request):
                path = urlsplit(request.request.url).path
                if path.startswith('/api/'):
                    request.fulfill(json={})
                elif request.request.url.startswith(base):
                    request.continue_()
                elif '/assets/skills/' in request.request.url or '/UI/' in request.request.url:
                    request.fulfill(path=str(ROOT / 'assets/ui/game-genshin.png'))
                else:
                    request.abort()

            page.route('**/*', route)
            page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:gi:assistant-profile',JSON.stringify({enabled:false,proactive:false}))")
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')

            status = page.locator('[data-app-connectivity]')
            expect(status).to_have_text('En ligne · espace local prêt')
            page.context.set_offline(True)
            expect(status).to_contain_text('Hors ligne')
            expect(status).to_contain_text('sauvegardes locales disponibles')
            page.context.set_offline(False)
            expect(status).to_have_text('En ligne · espace local prêt')

            # Teste les commandes depuis le Carnet, où les boutons de tâches/notes ne sont pas affichés.
            page.locator('.side-rail [data-nav=journey]').click()
            expect(page.locator('#page-content')).to_contain_text('Le voyage continue')
            page.keyboard.press('Control+k')
            palette = page.locator('[data-command-palette]')
            expect(palette).to_be_visible()
            search = palette.locator('input[type=search]')
            search.fill('créer une tâche')
            expect(palette.locator('.command-result')).to_have_count(1)
            palette.locator('.command-result').click()
            expect(page.locator('#modal-root #task-title')).to_be_visible()
            page.locator('#modal-root .modal-close').click()
            expect(page.locator('#modal-root #task-title')).to_have_count(0)

            page.keyboard.press('Control+k')
            palette = page.locator('[data-command-palette]')
            expect(palette).to_be_visible()
            search = palette.locator('input[type=search]')
            search.fill('écrire une note')
            expect(palette.locator('.command-result')).to_have_count(1)
            palette.locator('.command-result').click()
            expect(page.locator('#modal-root #note-title')).to_be_visible()
            page.locator('#modal-root .modal-close').click()
            expect(page.locator('#modal-root #note-title')).to_have_count(0)

            page.keyboard.press('Alt+Shift+F')
            expect(page.locator('[data-focus-station] [data-focus-console]')).to_have_class(__import__('re').compile('is-active'))
            expect(page.locator('[data-focus-station] [data-focus-sprint-clock]')).to_be_visible()
            session = page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active")
            assert session['status'] == 'running' and session['focusDurationMs'] == 25 * 60 * 1000
            page.locator('.side-rail [data-nav=journey]').click()
            page.keyboard.press('Alt+Shift+F')
            assert page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active.id") == session['id']
            page.locator('.side-rail [data-nav=journey]').click()
            page.keyboard.press('Control+k')
            palette = page.locator('[data-command-palette]')
            search = palette.locator('input[type=search]')
            search.fill('session en cours')
            expect(palette.locator('.command-result')).to_have_count(1)
            expect(palette.locator('.command-result')).to_contain_text('Ouvrir ma session en cours')
            palette.locator('.command-result').click()
            expect(page.locator('[data-focus-station] [data-focus-sprint-clock]')).to_be_visible()
            assert page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active.id") == session['id']
            page.locator('[data-focus-pause]').click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active.status === 'paused'")
            page.locator('[data-focus-resume]').click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active.status === 'running'")
            page.locator('[data-focus-finish]').click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).history.length === 1")

            page.keyboard.press('Control+k')
            palette = page.locator('[data-command-palette]')
            expect(palette).to_be_visible()
            search = palette.locator('input[type=search]')
            search.fill('voeux')
            results = palette.locator('.command-result')
            expect(results).to_have_count(1)
            expect(results.first).to_contain_text('Vœux')
            pin = palette.locator('[data-command-pin]')
            expect(pin).to_have_count(1)
            pin.click()
            expect(pin).to_have_attribute('aria-pressed', 'true')
            expect(results.first.locator('small')).to_have_text('Épinglé')
            assert 'page:wishes' in page.evaluate("JSON.parse(localStorage.getItem('astralis:command-pinned:v1'))")

            search.focus()
            page.keyboard.press('Tab')
            expect(results.first).to_be_focused()
            page.keyboard.press('Tab')
            expect(pin).to_be_focused()
            page.keyboard.press('Tab')
            expect(search).to_be_focused()
            page.keyboard.press('Shift+Tab')
            expect(pin).to_be_focused()

            search.fill('personnages')
            expect(results).to_have_count(1)
            palette.locator('[data-command-pin]').click()
            assert page.evaluate("JSON.parse(localStorage.getItem('astralis:command-pinned:v1'))") == ['page:characters', 'page:wishes']
            search.fill('')
            expect(results.first).to_contain_text('Personnages')
            expect(results.nth(1).locator('small')).to_have_text('Épinglé')
            page.keyboard.press('Escape')
            expect(palette).to_have_count(0)

            page.set_viewport_size({'width': 390, 'height': 844})
            page.keyboard.press('Control+k')
            expect(page.locator('[data-command-palette] .command-palette')).to_be_visible()
            assert page.locator('[data-command-palette]').evaluate('(node)=>node.scrollWidth<=node.clientWidth'), 'La palette déborde en vue mobile'
            page.keyboard.press('Escape')
            page.locator('.mobile-quick-nav [data-nav=dashboard]').click()
            page.keyboard.press('Control+k')
            recent_dashboard = page.locator('[data-command-palette] .command-result').filter(has_text='Tableau de bord')
            expect(recent_dashboard).to_have_count(1)
            expect(recent_dashboard.locator('small')).to_have_text('Récemment ouvert')
            assert not errors, errors
            browser.close()
        print('OK : actions globales tâche/note/sprint, minuterie de concentration, état réseau, favoris, clavier et mobile.')
    finally:
        server.shutdown()


if __name__ == '__main__':
    main()
