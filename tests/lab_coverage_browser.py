"""Real-app smoke for pinned kits, constellations and in-card support effects."""
import json
import threading
from functools import partial
from urllib.parse import urlsplit, unquote
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    settings = dict(character='10000073', tab='buffs', level=90, constellation=0,
                    referenceCharacter='10000073', statSchema=3, atk=1000, hp=15000,
                    **{'def': 700}, em=200, critRate=50, critDmg=100, er=100,
                    baseStat='atk', talent=2, talentLevel=10, loadout='manual',
                    elementKey='dendro', inventoryDefaultsVersion=1,
                    allies=[dict(character='10000006', weapon='14302', refinement=5,
                                 set='15045', constellation=0)], buffSlot=0)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width': 1440, 'height': 1000}, service_workers='block')
            page.set_default_timeout(30000)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))

            def route(request):
                url = request.request.url
                if not url.startswith(base):
                    request.abort()
                elif '/api/' in url:
                    request.fulfill(json={})
                else:
                    path = (ROOT / unquote(urlsplit(url).path).lstrip('/')).resolve()
                    if path.is_dir():
                        path = path / 'index.html'
                    if path.is_relative_to(ROOT) and path.is_file():
                        request.fulfill(path=str(path))
                    else:
                        request.fulfill(status=404, body='')

            page.route('**/*', route)
            page.add_init_script('localStorage.setItem("astralis:active-game","gi");'
                                 'localStorage.setItem("astralis:gi:lab-demo-complex-v2","1");'
                                 'localStorage.setItem("astralis:gi:assistant-profile",JSON.stringify({enabled:false,proactive:false}));'
                                 'localStorage.setItem("astralis:gi:damage-lab:v1",' + json.dumps(json.dumps(settings)) + ');')
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            page.locator('[data-nav=lab]').first.click()
            page.wait_for_selector('.lab-workbench')
            expect(page.locator('[data-lab-attack-table]')).to_contain_text('purification trikarmique', timeout=30000)
            page.locator('[data-lab-buff-owner="0"]').click()
            card = page.locator('[data-buff-slot="0"]')
            weapon = card.locator('[data-support-gear="weapon"]')
            expect(weapon.locator('[data-lab-support-weapon]')).to_be_visible()
            refinement = weapon.locator('[data-ally-field="refinement"]')
            expect(refinement).to_be_visible()
            page.wait_for_function("""(()=>{const el=document.querySelector('[data-buff-slot="0"] [data-ally-field="refinement"]');return el&&el.getBoundingClientRect().width>100})()""")
            bounds = refinement.bounding_box()
            assert bounds['width'] > 100 and bounds['height'] >= 44, bounds
            weapon.locator('[data-lab-support-weapon]').check()
            expect(weapon.locator('[data-lab-support-weapon]')).to_be_checked()
            expect(card.locator('[data-support-gear="set"] [data-lab-party-set]')).to_be_visible()
            card.locator('[data-support-gear="set"] [data-lab-party-set]').check()
            card.locator('[data-ally-field="partySetTier"]').select_option('1')
            page.locator('[data-lab-buff-owner="-1"]').click()
            expect(page.locator('.lab-owner-sets')).to_have_count(0)
            expect(page.locator('[data-lab-extended-buff="-1"][data-kit-effect="a1"][data-kit-field="enabled"]')).to_be_visible()
            expect(page.locator('[data-lab-attack-table]')).to_contain_text('purification trikarmique')
            page.locator('[data-lab=constellation]').select_option('3')
            try:
                expect(page.locator('[data-lab-attack-table]')).to_contain_text('purification trikarmique', timeout=10000)
            except Exception:
                print('ERRORS', errors, flush=True)
                print('TABLE', page.locator('[data-lab-attack-table]').inner_text(), flush=True)
                raise
            page.locator('#lab-tab-overview').click()
            page.locator('[data-lab=reaction]').select_option('stellarSwirl')
            page.locator('[data-lab=reactionContributorCount]').locator('xpath=ancestor::details[1]/summary').click()
            page.locator('[data-lab=reactionContributorCount]').select_option('1')
            expect(page.locator('[data-lab=reactionMember0EM]')).to_be_visible()
            page.locator('[data-lab=reactionLevel]').fill('1446.85')
            for key, value in [('Level', '1446.85'), ('EM', '300'), ('CR', '40'), ('CD', '100')]:
                page.locator('[data-lab=reactionMember0' + key + ']').fill(value)
            page.locator('[data-lab-action=calculate]').first.click()
            expect(page.locator('[data-lab-damage]')).not_to_have_text('TODO_DATA')
            page.set_viewport_size({'width': 390, 'height': 844})
            page.locator('#lab-tab-buffs').click()
            page.locator('[data-lab-buff-owner="0"]').click()
            expect(page.locator('[data-buff-slot="0"] [data-support-gear="weapon"] [data-lab-support-weapon]')).to_be_visible()
            assert not errors, errors
            browser.close()
            print('Pinned kits, support controls, reaction contributors, desktop and mobile passed', flush=True)
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
