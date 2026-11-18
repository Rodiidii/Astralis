"""Verify Astralis's Genshin daily command dashboard in desktop and mobile layouts."""
import json
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class LocalServer(ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 128


def main():
    server = LocalServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}"
    errors = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={"width": 1920, "height": 1080}, service_workers="block")
        page.on("pageerror", lambda error: errors.append(str(error)))

        def route(request):
            url = request.request.url
            if not url.startswith(base):
                request.abort()
                return
            if "/api/gi/events" in url:
                request.fulfill(json={"events": [{"id": "banner-test", "title": "Bannière de test", "kind": "char-banner", "start": "2026-11-15T00:00:00Z", "end": "2026-11-18T18:00:00Z"}]})
                return
            if "/api/gi/endgame" in url or "/api/" in url:
                request.fulfill(json={})
                return
            path = (ROOT / unquote(urlsplit(url).path.lstrip("/"))).resolve()
            if path.is_dir():
                path /= "index.html"
            if path.is_relative_to(ROOT) and path.is_file():
                request.fulfill(path=str(path))
            else:
                request.fulfill(status=404, body="")

        page.route("**/*", route)
        page.add_init_script("""
          localStorage.setItem('astralis:active-game', 'gi');
          localStorage.setItem('astralis:gi:wish-plan', JSON.stringify({welkin:true, wishes:4, currentPrimos:320}));
          localStorage.setItem('astralis:gi:farm-calendar', JSON.stringify([{id:'farm-dashboard-test',date:new Date().toLocaleDateString('sv-SE'),title:'Livres de talents'}]));
        """)
        page.goto(base, wait_until="domcontentloaded")
        page.wait_for_selector(".dashboard-command-center", timeout=60_000)
        page.wait_for_selector("#astralis-launch-screen", state="detached", timeout=30_000)
        page.wait_for_selector(".command-event-row")

        assert page.locator(".workspace > .page-hero").count() == 0
        assert page.locator("astralis-planet, astralis-world, .orbit-stage").count() == 0
        assert page.locator(".command-panel").count() == 5
        assert page.locator(".command-route-map .route-map-pin[data-nav]").count() == 7
        assert page.locator(".route-map-pin img").evaluate_all("icons => icons.length === 7 && icons.every(image => image.complete && image.naturalWidth > 0)")
        assert page.locator(".command-session .studio-farm-routine [data-feature-farm-step]").count() == 1
        assert page.locator(".command-wishes [data-feature-gains]").count() == 1

        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=str(ROOT / "docs" / "dashboard-command-1920.png"), full_page=True)

        farm_button = page.locator("[data-feature-farm-step]")
        farm_button.click()
        page.wait_for_function("JSON.parse(localStorage.getItem('astralis:gi:farm-calendar'))[0].done === true")
        page.locator("[data-feature-daily-reward]").click()
        page.wait_for_function("document.querySelector('[data-feature-daily-reward]').disabled")
        balance = page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:wish-plan')).currentPrimos")
        assert balance == 470, balance

        desktop_width = page.evaluate("document.documentElement.scrollWidth - innerWidth")
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(180)
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=str(ROOT / "docs" / "dashboard-command-mobile.png"), full_page=True)
        mobile_width = page.evaluate("document.documentElement.scrollWidth - innerWidth")
        assert desktop_width == 0, desktop_width
        assert mobile_width == 0, mobile_width
        assert not errors, errors

        print("Tableau de bord quotidien : actions, checklist de farm, solde global, événements, absence de planètes, desktop 1920×1080, mobile et console validés.")
        browser.close()

    server.shutdown()
    server.server_close()


if __name__ == "__main__":
    main()
