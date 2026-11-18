"""Exercise selecting and checking a saved team rotation in the session widget."""
import threading
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def main():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width': 390, 'height': 844})
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(f'http://127.0.0.1:{server.server_port}/tests/fixtures/dashboard-session-routine.html')
            page.locator('[data-feature-session-team-prepare]').click()
            team_routine=page.locator('.studio-team-routine:not(.studio-farm-routine)')
            assert team_routine.locator('ol>li').count() == 2
            assert page.locator('.studio-routine-roster img').count() == 2
            assert page.locator('.studio-routine-roster img').evaluate_all("images => images.every(image => image.complete && image.naturalWidth > 0)")
            assert team_routine.locator('[role=progressbar]').get_attribute('aria-valuenow') == '0'
            page.locator('[data-feature-session-step]').first.click()
            saved = page.evaluate("JSON.parse(localStorage.getItem('astralis:session:gi'))")
            assert saved['teamRoutine']['steps'][0]['done'] is True
            assert team_routine.locator('[role=progressbar]').get_attribute('aria-valuenow') == '1'
            page.locator('[data-feature-session-step]').nth(1).click()
            assert team_routine.locator('[role=progressbar]').get_attribute('aria-valuenow') == '2'
            assert not page.locator('[data-feature-session-reset]').is_disabled()
            page.locator('[data-feature-session-reset]').click()
            assert team_routine.locator('[role=progressbar]').get_attribute('aria-valuenow') == '0'
            farm_steps=page.locator('[data-feature-farm-step]')
            assert farm_steps.count()==3
            assert page.locator('.studio-farm-routine [role=progressbar]').get_attribute('aria-valuenow')=='0'
            farm_steps.first.click()
            saved_farm=page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:farm-calendar'))")
            assert saved_farm[0]['doneCharacters']==['amber'] and saved_farm[0]['done'] is False
            assert page.locator('.studio-farm-routine [role=progressbar]').get_attribute('aria-valuenow')=='1'
            page.locator('[data-feature-farm-step]').nth(1).click()
            saved_farm=page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:farm-calendar'))")
            assert saved_farm[0]['done'] is True
            assert page.locator('.studio-farm-routine [role=progressbar]').get_attribute('aria-valuenow')=='2'
            page.locator('[data-feature-farm-step]').nth(2).click()
            saved_farm=page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:farm-calendar'))")
            assert saved_farm[1]['done'] is True
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert not errors, errors
            browser.close()
    finally:
        server.shutdown()
    print('PASS: saved team routine prepares, saves progress, resets, and fits mobile.')

if __name__ == '__main__':
    main()
