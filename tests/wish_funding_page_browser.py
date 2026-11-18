import threading
from functools import partial
import json

from playwright.sync_api import expect

from voyage_browser import ROOT, Quiet, Server


def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(viewport={'width': 1280, 'height': 900}, service_workers='block')
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            base = f'http://127.0.0.1:{server.server_port}'
            def route(request):
                if not request.request.url.startswith(base):
                    request.abort()
                elif '/api/' in request.request.url or '/data/' in request.request.url:
                    request.fulfill(status=200, content_type='application/json', body=json.dumps({}))
                else:
                    request.continue_()
            page.route('**/*', route)
            page.add_init_script("""
              localStorage.clear();
              localStorage.setItem('astralis:active-game','gi');
              localStorage.setItem('astralis:gi:wish-plan',JSON.stringify({
                currentPrimos:1200,wishes:5,characterPity:70,characterGuarantee:true,
                history:[{date:'2026-11-14',primos:320,count:1},{date:'2026-11-16',primos:80,count:2}]
              }));
            """)
            page.goto(base, wait_until='domcontentloaded')
            try:
                page.wait_for_selector('.dashboard-studio', timeout=60000)
            except Exception:
                print('Page non prête :', page.locator('body').inner_text()[:1200], errors)
                raise
            page.locator('.rail-link[data-nav="wishes"]').dispatch_event('click')
            panel = page.locator('article.wish-funding-forecast')
            expect(panel).to_be_visible(timeout=30000)
            expect(panel.locator('.wish-funding-chart rect')).to_have_count(30)
            expect(panel).to_contain_text('2 000 primos équivalentes')
            expect(panel).to_contain_text('≈ 5 j au rythme observé')
            curve = page.locator('.wish-income-curve')
            slider = curve.locator('[data-wish-curve-day]')
            initial_x = curve.locator('[data-wish-curve-marker]').get_attribute('cx')
            state_after = slider.evaluate("node => { node.value = node.max; node.dispatchEvent(new Event('input', {bubbles:true})); return {value:node.value,max:node.max,label:node.getAttribute('aria-valuetext'),readout:node.closest('.wish-income-curve').querySelector('[data-wish-curve-readout]').textContent,cx:node.closest('.wish-income-curve').querySelector('[data-wish-curve-marker]').getAttribute('cx')}}")
            expect(curve.locator('[data-wish-curve-readout]')).to_contain_text('vœux équivalents')
            assert state_after['label'] and state_after['cx'] != initial_x, state_after
            page.set_viewport_size({'width': 390, 'height': 844})
            assert panel.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1'), 'Le panneau de prévision dépasse sur téléphone'
            assert not errors, errors
            browser.close()
        print('OK : le graphique de vœux s’affiche avec les gains consignés et tient sur téléphone.')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()

