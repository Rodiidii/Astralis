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
            page.goto(base + '/tests/fixtures/arcade-mode-tabs.html', wait_until='load')
            tabs = page.get_by_role('tab')
            expect(tabs.nth(0)).to_have_js_property('tabIndex', 0)
            expect(tabs.nth(1)).to_have_js_property('tabIndex', -1)
            tabs.nth(0).focus()
            page.keyboard.press('ArrowLeft')
            expect(tabs.nth(2)).to_be_focused()
            expect(tabs.nth(2)).to_have_attribute('aria-selected', 'true')
            expect(tabs.nth(2)).to_have_js_property('tabIndex', 0)
            expect(tabs.nth(0)).to_have_js_property('tabIndex', -1)
            page.keyboard.press('ArrowRight')
            expect(tabs.nth(0)).to_be_focused()
            page.keyboard.press('End')
            expect(tabs.nth(2)).to_be_focused()
            page.keyboard.press('Home')
            expect(tabs.nth(0)).to_be_focused()
            tabs.nth(2).click()
            favorite_toggle=page.locator('[data-arcade-favorite-toggle]')
            expect(favorite_toggle).to_have_attribute('aria-pressed','false')
            favorite_toggle.click()
            expect(favorite_toggle).to_have_attribute('aria-pressed','true')
            expect(page.locator('[data-arcade-favorites]')).to_be_visible()
            page.locator('[data-arcade-favorite-open="three"]').click()
            expect(tabs.nth(2)).to_have_attribute('aria-selected','true')
            page.reload()
            expect(page.locator('[data-arcade-favorite-open="three"]')).to_be_visible()
            expect(page.locator('[data-arcade-favorite-toggle]')).to_have_attribute('aria-pressed','false')
            page.locator('[data-arcade-favorite-open="three"]').click()
            expect(page.locator('[data-arcade-favorite-toggle]')).to_have_attribute('aria-pressed','true')
            page.locator('[data-arcade-favorite-toggle]').click()
            expect(page.locator('[data-arcade-favorites]')).to_be_hidden()
            assert page.locator('body').evaluate('node => node.scrollWidth <= innerWidth + 1')
            page.evaluate("document.querySelector('[data-astral-arcade]').cleanup()")
            tabs.nth(0).focus()
            page.keyboard.press('ArrowRight')
            expect(tabs.nth(0)).to_be_focused()
            browser.close()
        print('OK: navigation arcade au clavier, focus visible dans le flux, pas de débordement mobile.')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
