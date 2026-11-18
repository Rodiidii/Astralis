"""Verifies persistent arcade score history and compact mobile rendering."""
import json
import threading
from functools import partial

from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(viewport={'width': 390, 'height': 844})
            page.goto(base + '/tests/fixtures/arcade-score-history.html', wait_until='load')
            panel = page.locator('[data-arcade-history]')
            expect(panel).to_contain_text('Aucun score enregistré')
            page.evaluate("window.dispatchEvent(new CustomEvent('astralis:arcade-tetris-finished',{detail:{game:'gi',score:1675,lines:8,level:3,id:'run-1',at:'2026-11-15T12:00:00.000Z'}}))")
            expect(panel).to_contain_text('1 675')
            expect(panel).to_contain_text('8 lignes')
            saved = page.evaluate("JSON.parse(localStorage.getItem('astralis:arcade:score-history:v1'))")
            assert saved['gi'][0]['id'] == 'run-1'
            assert saved['gi'][0]['score'] == 1675
            page.evaluate("window.dispatchEvent(new CustomEvent('astralis:arcade-tetris-finished',{detail:{game:'hsr',score:500,id:'other',at:'2026-11-15T13:00:00.000Z'}}))")
            assert len(page.locator('[data-arcade-history] ol li').all()) == 1
            assert page.locator('body').evaluate('e=>e.scrollWidth<=innerWidth+1')
            assert page.locator('.arcade-history-card').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
            page.evaluate('window.cleanupHistory()')
            page.evaluate("window.dispatchEvent(new CustomEvent('astralis:arcade-tetris-finished',{detail:{game:'gi',score:9,id:'after-cleanup',at:'2026-11-15T14:00:00.000Z'}}))")
            assert page.evaluate("JSON.parse(localStorage.getItem('astralis:arcade:score-history:v1')).gi.length") == 1
            browser.close()
        print('OK: historique personnel persistant, isolé par univers, mobile sans débordement.')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
