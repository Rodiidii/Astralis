"""Verify dashboard priority actions complete a task and a routine in place."""
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
            page.goto(f'http://127.0.0.1:{server.server_port}/tests/fixtures/dashboard-priority-actions.html')
            task = page.locator('[data-priority-complete="urgent-task"]')
            task.wait_for()
            url = page.url
            task.click()
            assert page.locator('[data-priority-complete="urgent-task"]').count() == 0
            routine = page.locator('[data-priority-routine]').first
            routine.wait_for()
            routine.click()
            saved = page.evaluate("JSON.parse(localStorage.getItem('astralis:routine:v1:gi'))")
            assert len(saved['day']) == 1
            assert saved['day'][0].startswith('seed-')
            assert page.url == url
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert not errors, errors
            browser.close()
    finally:
        server.shutdown()
    print('PASS: dashboard recommendations complete tasks and rituals without leaving the widget.')

if __name__ == '__main__':
    main()
