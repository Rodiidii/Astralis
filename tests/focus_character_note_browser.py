"""Character-bound focus session notes persist during the session and in its history."""
import json, threading
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server

def main():
    server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch();page=browser.new_page(viewport={"width":390,"height":844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(f'http://127.0.0.1:{server.server_port}/tests/fixtures/focus-character.html')
            page.locator('[name="characterId"]').select_option('furina')
            page.locator('[name="title"]').fill('Préparer le build Furina')
            page.locator('[name="tasks"]').fill('Vérifier les artéfacts')
            page.locator('[name="note"]').fill('Tester le bonus Hydro')
            page.locator('[data-focus-form] button[type="submit"]').click()
            saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-station:v1'))")
            assert saved['active']['characterId']=='furina' and saved['active']['characterName']=='Furina' and saved['active']['note']=='Tester le bonus Hydro'
            expect(page.locator('[data-focus-session-note]')).to_have_value('Tester le bonus Hydro')
            page.locator('[data-focus-session-note]').fill('Dégâts vérifiés')
            page.reload();expect(page.locator('[data-focus-session-note]')).to_have_value('Dégâts vérifiés')
            page.locator('[data-focus-finish]').click()
            expect(page.locator('[data-focus-history-row]')).to_contain_text('Furina')
            expect(page.locator('[data-focus-history-row]')).to_contain_text('Dégâts vérifiés')
            page.locator('[data-focus-history-query]').fill('Dégâts vérifiés')
            expect(page.locator('[data-focus-history-row]')).to_have_count(1)
            assert not errors,errors;browser.close()
    finally:
        server.shutdown();server.server_close()
    print('PASS: character link and session notes persist, appear in history, and are searchable on mobile.')
if __name__=='__main__':main()
