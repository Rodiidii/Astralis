import json, threading
from datetime import date
from functools import partial
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server

def main():
    server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch()
            page=browser.new_page(viewport={'width':1366,'height':900},service_workers='block')
            page.set_default_timeout(60000)
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            def route(request):
                url=request.request.url
                if url.startswith(base): request.continue_()
                elif '/api/' in url: request.fulfill(json={})
                else: request.abort()
            page.route('**/*',route)
            seed={'astralis:active-game':'gi','astralis:assistant-profile':json.dumps({'enabled':False,'proactive':False})}
            page.add_init_script('for(const [key,value] of Object.entries('+json.dumps(seed)+'))localStorage.setItem(key,value)')
            page.goto(base,wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen',state='detached')
            page.locator('[data-nav="arcade"]').first.click()
            page.wait_for_selector('[data-astral-arcade]')
            page.locator('[data-arcade-mode="memory"]').click()
            difficulty=page.locator('[data-memory-difficulty]')
            expect(difficulty).to_have_value('standard')
            expect(page.locator('[data-memory-card]')).to_have_count(12)
            difficulty.select_option('relaxed')
            expect(page.locator('[data-memory-card]')).to_have_count(8)
            expect(page.locator('[data-memory-status]')).to_have_attribute('role','status')
            expect(page.locator('[data-memory-grid]')).not_to_have_attribute('aria-live','polite')
            hint=page.locator('[data-memory-hint]')
            expect(hint).to_be_disabled()
            page.locator('[data-memory-card]').nth(0).focus()
            first_focus=page.locator('[data-memory-card]').nth(0).get_attribute('data-memory-card')
            second_focus=page.locator('[data-memory-card]').nth(1).get_attribute('data-memory-card')
            page.keyboard.press('ArrowRight')
            expect(page.locator(':focus')).to_have_attribute('data-memory-card',second_focus)
            page.keyboard.press('Enter')
            expect(page.locator(f'[data-memory-card="{second_focus}"]')).to_have_attribute('aria-pressed','true')
            expect(page.locator(':focus')).to_have_attribute('data-memory-card',second_focus)
            page.keyboard.press('ArrowLeft')
            expect(page.locator(':focus')).to_have_attribute('data-memory-card',first_focus)
            page.keyboard.press('Escape')
            expect(page.locator('[data-memory-moves]')).to_have_text('0')
            page.locator('[data-memory-card="0-a"]').click()
            page.locator('[data-memory-card="1-a"]').click()
            expect(hint).to_be_enabled()
            hint.click()
            expect(page.locator('[data-memory-moves]')).to_have_text('3')
            expect(page.locator('[data-memory-status]')).to_contain_text('+2 coups')
            expect(page.locator('.memory-card.is-hinted')).to_have_count(2)
            expect(hint).to_have_text('✧ Indice · 1')
            page.wait_for_timeout(1400)
            expect(page.locator('.memory-card.is-hinted')).to_have_count(0)
            expect(page.locator('[data-memory-status]')).to_contain_text('TROUVE LES PAIRES')
            page.locator('[data-memory-start]').click()
            page.locator('[data-memory-card="0-a"]').click()
            page.locator('[data-memory-card="0-b"]').click()
            expect(page.locator('.memory-card.is-new-match')).to_have_count(2)
            page.wait_for_timeout(700)
            expect(page.locator('.memory-card.is-new-match')).to_have_count(0)
            page.locator('[data-memory-start]').click()
            for pair in range(4):
                page.locator(f'[data-memory-card="{pair}-a"]').click()
                page.locator(f'[data-memory-card="{pair}-b"]').click()
            expect(page.locator('[data-memory-status]')).to_contain_text('série de 1 jour')
            expect(page.locator('[data-memory-streak]')).to_have_text('1 j')
            expect(page.locator('[data-memory-start]')).to_contain_text('Rejouer')
            page.locator('[data-memory-start]').click()
            for pair in range(4):
                page.locator(f'[data-memory-card="{pair}-a"]').click()
                page.locator(f'[data-memory-card="{pair}-b"]').click()
            assert page.evaluate("JSON.parse(localStorage.getItem('astralis:arcade:memory:v1')).gi.daily.streak") == 1
            difficulty.select_option('stellar')
            expect(page.locator('[data-memory-card]')).to_have_count(16)
            page.locator('[data-memory-card]').first.click()
            expect(difficulty).to_be_disabled()
            expect(page.locator('[data-memory-moves]')).to_have_text('0')
            assert page.evaluate("localStorage.getItem('astralis:arcade:memory:settings:gi')")=='stellar'
            page.set_viewport_size({'width':390,'height':844})
            page.wait_for_timeout(100)
            expect(page.locator('.memory-stats')).to_be_visible()
            assert page.locator('.memory-stats').evaluate('(el)=>[...el.querySelectorAll("b")].every(node=>node.scrollWidth<=node.clientWidth)')
            assert not errors,errors
            browser.close()
        print('OK: difficulties create 8/12/16 cards, persist per universe and lock while playing; no browser errors.')
    finally:
        server.shutdown();server.server_close()

if __name__=='__main__': main()
