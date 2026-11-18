"""Check optional rotation cues, accessibility state, persistence, and mute behavior."""
import threading
from functools import partial
from playwright.sync_api import sync_playwright
from voyage_browser import ROOT, Quiet, Server


def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(f'http://127.0.0.1:{server.server_port}/tests/fixtures/rotation-audio.html')
            page.set_viewport_size({'width': 390, 'height': 844})
            sound = page.locator('[data-command="sound"]')
            sound.wait_for()
            assert page.locator('rotation-rehearsal').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
            page.locator('[data-tempo]').select_option('0.5')
            sound.click()
            assert sound.get_attribute('aria-pressed') == 'true'
            assert page.evaluate('localStorage.getItem("astralis:rotation-cues")') == 'on'
            page.locator('[data-command="toggle"]').click()
            page.wait_for_function('document.querySelector("[data-run-status]").textContent.includes("Rotation terminée")', timeout=5000)
            assert page.evaluate('window.__oscillatorStarts') >= 5
            assert '1 répétition' in page.locator('[data-record]').inner_text()
            page.locator('[data-command="sound"]').click()
            assert page.locator('[data-command="sound"]').get_attribute('aria-pressed') == 'false'
            starts = page.evaluate('window.__oscillatorStarts')
            page.locator('[data-command="toggle"]').click()
            page.wait_for_timeout(750)
            assert page.evaluate('window.__oscillatorStarts') == starts
            assert not errors, errors
            browser.close()
        print('Repères sonores optionnels, fin musicale discrète, préférence mémorisée et mode muet vérifiés.')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
