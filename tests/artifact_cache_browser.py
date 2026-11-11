"""Verify that a stale installed worker cannot mix old artifact code with the new app."""
import threading
from functools import partial

from playwright.sync_api import sync_playwright
from voyage_browser import ROOT, Quiet, Server


LEGACY_WORKER = b"""
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
"""


class Handler(Quiet):
    def do_GET(self):
        if self.path == '/legacy-worker.js':
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript')
            self.end_headers()
            self.wfile.write(LEGACY_WORKER)
        elif self.path == '/cache-seed.html':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<title>Cache migration fixture</title>')
        else:
            super().do_GET()


def main():
    server = Server(('127.0.0.1', 0), partial(Handler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            def route(handler):
                url = handler.request.url
                if not url.startswith(base):
                    handler.abort()
                elif '/api/' in url:
                    handler.fulfill(json={})
                else:
                    handler.continue_()
            page.route('**/*', route)
            page.goto(base+'/cache-seed.html')
            page.evaluate("""async () => {
              const cache = await caches.open('astralis-shell-v64');
              await cache.put('/src/artifact-model.js', new Response(
                'export const ARTIFACT_MAIN_MAX = {};',
                {headers:{'Content-Type':'application/javascript'}}
              ));
              await navigator.serviceWorker.register('/legacy-worker.js');
              await navigator.serviceWorker.ready;
              if (!navigator.serviceWorker.controller) {
                await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, {once:true}));
              }
              localStorage.setItem('astralis:active-game','gi');
            }""")
            assert 'artifactStatKey' not in page.evaluate("fetch('/src/artifact-model.js').then(r=>r.text())")
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_function("document.documentElement.dataset.appReady === 'true'", timeout=60000)
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            result = page.evaluate("""async () => {
              const model = await import('/src/artifact-model.js?v=20261110-artifact-import-2');
              return model.normalizeGoodArtifact({
                slotKey:'goblet', rarity:5, level:20, mainStatKey:'pyro_dmg_'
              }).mainValue;
            }""")
            assert result == 46.6
            browser.close()
            assert not errors, errors
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
