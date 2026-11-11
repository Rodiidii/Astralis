"""Run the Lore page against the shipped snapshots in Chromium."""
import re
import threading
from functools import partial
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

from voyage_browser import ROOT, Quiet, Server


def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(service_workers='block', viewport={'width': 1280, 'height': 900})
            page.set_default_timeout(120000)
            page.set_default_navigation_timeout(120000)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))

            def route(handler):
                url = handler.request.url
                path = urlsplit(url).path
                if url.startswith('https://www.youtube-nocookie.com/'):
                    handler.fulfill(body='player')
                elif not url.startswith(base):
                    handler.abort()
                elif path.startswith('/api/'):
                    handler.fulfill(json={})
                else:
                    handler.continue_()

            page.route('**/*', route)
            page.add_init_script("localStorage.setItem('astralis:active-game','gi')")
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            page.locator('[data-nav=lore]').first.click()
            page.locator('[data-lore-category=characters]').first.click()
            selector = page.locator('#lore-character')
            expect(selector.locator('option[value=alice]')).to_have_count(1)
            expect(selector.locator('option[value="10000005"]')).to_have_count(1)
            expect(selector.locator('option[value="10000007"]')).to_have_count(0)
            selector.select_option('10000089')
            expect(page.locator('.lore-character-profile h2')).to_have_text('Furina')
            assert page.locator('.lore-biography').count() > 3
            expect(page.locator('.lore-evidence h3').first).to_have_text('Relations documentées')
            media = page.locator('.lore-filmography')
            expect(media.locator('iframe')).to_have_count(0)
            teaser = media.locator('button').filter(has_text='▶').first
            expect(teaser).to_have_attribute('aria-label', re.compile('Furina'))
            teaser.click()
            expect(media.locator('iframe')).to_have_attribute('src', re.compile(r'^https://www\.youtube-nocookie\.com/embed/'))
            assert media.locator('a[href^="https://www.youtube.com/watch"]').count() > 0

            page.locator('[data-lore-category=events]').click()
            assert page.locator('.lore-event-entry').count() >= 35
            page.locator('[data-lore-event-region]').select_option('fontaine')
            expect(page.locator('.lore-event-entry').first.locator('small')).to_contain_text('Fontaine')
            assert all('Fontaine' in region for region in page.locator('.lore-event-entry small').all_text_contents())
            page.locator('input[data-lore-search]').fill('mousquets')
            expect(page.locator('.lore-event-entry')).to_have_count(1)
            artwork = page.locator('.lore-event-entry img.lore-event-artwork')
            artwork.scroll_into_view_if_needed()
            page.wait_for_function("document.querySelector('.lore-event-artwork')?.naturalWidth > 100")
            page.locator('input[data-lore-search]').fill('')
            page.locator('[data-lore-category=regions]').first.click()
            page.locator('.lore-region-tabs [data-lore-region-pick=fontaine]').click()
            expect(page.locator('.lore-region-article h2')).to_have_text('Fontaine')
            expect(page.locator('.lore-region-factions h3')).to_have_text('Factions de Fontaine')
            expect(page.locator('.lore-region-history h3')).to_have_text('Histoire et société')
            assert page.locator('.lore-filmography button[data-lore-video]').count() >= 2
            expect(page.locator('.lore-filmography iframe')).to_have_count(0)
            page.locator('[data-lore-category=cosmology]').first.click()
            page.locator('.lore-entity-card').filter(has=page.get_by_role('heading',name='Dainsleif · le Gardien du rameau',exact=True)).get_by_role('button',name='Ouvrir le dossier',exact=True).click()
            expect(page.locator('.lore-full-dossier h2')).to_have_text('Dainsleif · le Gardien du rameau')
            assert page.locator('.lore-full-dossier section').count() >= 5
            page.locator('[data-lore-dossier-back]').click()
            page.set_viewport_size({'width': 500, 'height': 840})
            page.locator('[data-lore-category=characters]').first.click()
            selector.select_option('alice')
            expect(page.locator('.lore-character-profile h2')).to_have_text('Alice')
            expect(page.locator('.lore-biography').first).to_be_visible()
            assert page.locator('.lore-character-profile').evaluate('el => el.scrollWidth <= el.clientWidth + 1')
            browser.close()
            assert not errors, errors
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
