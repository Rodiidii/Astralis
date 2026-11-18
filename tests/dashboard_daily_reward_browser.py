"""Verify the dashboard's real daily reward click and local wallet update."""
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
            page.goto(f'http://127.0.0.1:{server.server_port}/tests/fixtures/dashboard-daily-reward.html')
            button = page.locator('[data-feature-daily-reward]')
            button.wait_for()
            assert page.locator('.daily-reward-icon img').get_attribute('src') == 'assets/ui/currency-genshin-primogem.png'
            assert page.locator('[data-wallet-total]').inner_text() == '11'
            page.locator('[data-feature-gains] [name="primos"]').fill('150')
            page.locator('[data-feature-gains] [name="wishes"]').fill('1')
            assert '13 vœux' in page.locator('[data-feature-gains-preview]').inner_text()
            assert '1 350 primos' in page.locator('[data-feature-gains-preview]').inner_text()
            page.locator('[data-feature-gains] [name="primos"]').fill('0')
            page.locator('[data-feature-gains] [name="wishes"]').fill('0')
            button.click()
            assert page.locator('[data-feature-daily-reward]').is_disabled()
            saved = page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:wish-plan'))")
            assert saved['currentPrimos'] == 1350 and saved['wishes'] == 4
            assert saved['history'][-1]['rewardType'] == 'daily'
            assert saved['history'][-1]['rewardPeriod'] == page.evaluate("new Date().toLocaleDateString('sv-SE')")
            page.locator('[data-feature-daily-reward]').click(force=True)
            assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:wish-plan')).currentPrimos") == 1350
            assert not errors, errors
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            browser.close()
    finally:
        server.shutdown()
    print('PASS: one-tap daily reward updates the global wallet once; mobile layout fits.')

if __name__ == '__main__':
    main()
