"""Character-specific laboratory buffs: real calculations and saved team controls."""
import json
import tempfile
import threading
from functools import partial
from pathlib import Path
from urllib.parse import unquote, urlsplit

from playwright.sync_api import expect, sync_playwright
from voyage_browser import ROOT, Quiet, Server


def main():
    server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}'
    slots=['flower','plume','sands','goblet','circlet']
    mains=['hpFlat','atkFlat','hpPct','hydroDmg','critRate']
    values=[717,47,7,7,4.7]
    pieces=[dict(id='lab-'+slot,setKey='15044',slot=slot,slotIndex=index,mainType=mains[index],mainValue=values[index],rarity=5,level=0,
        substats=[dict(type='defFlat',value=23.15),dict(type='em',value=23.31),dict(type='er',value=6.48)]) for index,slot in enumerate(slots)]
    pieces.append(dict(pieces[3],id='lab-pyro',mainType='pyroDmg'))
    build=dict(id='lab-build',name='Écume de minuit',character='10000089',level=90,constellation=2,weapon='11501',weaponLevelValue=90,
        pieces=[dict(piece,set='15044',ownedArtifactId=piece['id']) for piece in pieces[:5]])
    settings=dict(character='10000089',build='lab-build',constellation=2,atk=1000,hp=15000,em=100,critRate=50,critDmg=100,er=120,
        talent=2,level=90,elementKey='hydro',loadout='equipped',artifactLevelPreset='0',setEffects='{}',**{'def':700})
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch()
            page=browser.new_page(viewport={'width':1440,'height':1000},service_workers='block')
            page.set_default_navigation_timeout(120000)
            page.set_default_timeout(120000)
            def open_allies():
                if not page.locator('[data-lab-allies]').evaluate('(el)=>el.open'):
                    page.locator('[data-lab-allies]>summary').click()

            page.set_default_timeout(25000)
            errors=[]
            page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)))
            def route(handler):
                url=handler.request.url
                path=urlsplit(url).path
                if url.startswith('https://api.lunaris.moe/data/version.json'):
                    handler.fulfill(json={'version':'test'})
                elif url.startswith('https://api.lunaris.moe/data/test/fr/char/'):
                    skills={key:dict(name=name,description='Inflige des dégâts Hydro à la cible.',icon='test-icon',
                        multipliers={'DGT de compétence':[str(200+i*10)+'%' for i in range(15)]}) for key,name in [
                            ('normalattack','Danse sur les eaux'),('elementalskill','Salon solitaire'),('elementalburst','Que le peuple se réjouisse')]}
                    skills['normalattack']['multipliers']={
                        'DGT du 1er coup':['100%' for _ in range(15)],
                        'DGT attaque chargée':['150% ×2' for _ in range(15)],
                        'DGT chute basse':['220%' for _ in range(15)]}
                    handler.fulfill(json={'info':{'attributes':[{'level':90,'ascension':6,'hp':15000,'attack':240,'defense':700}]},'skills':skills,'passives':{'passive1':{'name':'Passif de test','description':'Le bonus de dégâts dépend des conditions actives.'},'passive2':{'name':'Passif A4 de test','description':'Ce passif renforce les dégâts selon le nombre de cumuls.'}},'constellations':{'c1':{'name':'Constellation verrouillée','description':'Un bonus réservé à C1.'}}})
                elif 'genshin-db-api.vercel.app/api/v5/stats' in url:
                    handler.fulfill(json={'90':{'level':90,'attack':540,'specialized':0}})
                elif not url.startswith(base):
                    if any(x in path.lower() for x in ('furina','10000089','avatarimage','gacha_avatarimg')):
                        handler.fulfill(path=str(ROOT/'assets/app-icon.svg'))
                    elif any(word in path for word in ('/UI/','/assets/skills/','/genshin/','/assets/UI/')):
                        handler.fulfill(path=str(ROOT/'assets/app-icon.svg'))
                    else:
                        handler.abort()
                elif path.startswith('/api/'):
                    handler.fulfill(json={})
                else:
                    local=(ROOT/unquote(path).lstrip('/')).resolve()
                    if local.is_dir():local=local/'index.html'
                    if local.is_relative_to(ROOT) and local.is_file():handler.fulfill(path=str(local))
                    else:handler.fulfill(status=404,body='')
            page.route('**/*',route)
            page.add_init_script('localStorage.setItem("astralis:gi:assistant-profile",JSON.stringify({enabled:false,proactive:false}));localStorage.setItem("astralis:active-game","gi");'+
                'if(!sessionStorage.getItem("labTestSeeded")){sessionStorage.setItem("labTestSeeded","1");localStorage.setItem("astralis:gi:lab-demo-complex-v2","1");localStorage.setItem("astralis:gi:owned-artifacts",'+json.dumps(json.dumps(pieces))+');'+
                'localStorage.setItem("astralis:gi:builds",'+json.dumps(json.dumps([build]))+');'+
                'localStorage.setItem("astralis:gi:damage-lab:v1",'+json.dumps(json.dumps(settings))+');}')
            page.goto(base,wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen',state='detached')
            page.locator('[data-nav=lab]').first.click()
            page.wait_for_selector('.lab-workbench')
            expect(page.locator('.lab-portrait-caption h2')).to_have_text('Furina')
            assert page.locator('.lab-loadout-strip').first.locator('.lab-gear-piece').count()==6
            expect(page.locator('[data-lab-attack-kind]')).to_have_count(5)
            page.locator('.lab-weapon-picker summary').click()
            expect(page.locator('[data-lab-weapon-choice]').filter(has=page.locator('img')).first).to_be_visible()
            weapon_choice=page.locator('[data-lab-weapon-choice]').filter(has=page.locator('img')).first
            selected_weapon=weapon_choice.get_attribute('data-lab-weapon-choice')
            weapon_choice.click()
            page.wait_for_function('(id)=>JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).weaponOverride===id',arg=selected_weapon)
            page.locator('#lab-tab-buffs').click()
            expect(page.locator('#lab-view-overview')).to_be_hidden()
            expect(page.locator('.lab-passive-text').first).to_be_visible()
            expect(page.locator('[data-lab-ally-effects="-1"]')).not_to_contain_text('Passif de test')
            expect(page.locator('[data-lab-ally-effects="-1"]')).not_to_contain_text('Danse sur les eaux')
            expect(page.locator('[data-lab-ally-effects="-1"]')).not_to_contain_text('Salon solitaire')
            expect(page.locator('[data-lab-attack-table] table').first).to_be_visible()
            expect(page.locator('[data-lab-attack-table] thead').first).to_contain_text('Sans CRIT')
            expect(page.locator('[data-lab-attack-table] thead').first).to_contain_text('Moyenne')
            assert page.locator('[data-lab^=minimum-]').count()==0
            assert page.locator('.lab-roster-gear').count()==4
            expect(page.locator('[data-lab-ally-effects="-1"] .lab-passive-text details').first).not_to_have_attribute('open','')
            toggle=page.locator('[data-lab-character-buff=furina][data-buff-key=enabled]')
            toggle.check()
            assert page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).complexEffects.furina.enabled')
            expect(page.locator('[data-lab-character-buff=furina][data-buff-key=fanfare]')).to_be_visible()
            page.locator('[data-lab-character-buff=furina][data-buff-key=fanfare]').fill('200')
            page.locator('[data-lab-character-buff=furina][data-buff-key=fanfare]').dispatch_event('change')
            expect(page.locator('[data-lab-character-buff=furina][data-buff-key=hpChangePercent]')).to_have_count(0)
            expect(page.locator('[data-lab-character-buff=furina][data-buff-key=enabled]').locator('xpath=ancestor::article[1]')).to_contain_text('Condition')
            page.locator('[data-lab-buff-calculate]').click()
            expect(page.locator('[data-lab-damage]')).not_to_have_text('—')
            buffed=page.locator('[data-lab-damage]').inner_text()
            toggle.uncheck()
            page.locator('[data-lab-buff-calculate]').click()
            page.wait_for_function('(old)=>document.querySelector("[data-lab-damage]").textContent!==old',arg=buffed)
            page.locator('#lab-tab-optimizer').click()
            page.locator('[data-lab-reaction-choice]').select_option('vaporize')
            assert page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).reaction')=='vaporize'
            page.locator('[data-lab-reaction-choice]').select_option('none')
            page.locator('[data-lab-main="goblet:hydroDmg"]').check()
            expect(page.locator('[data-lab-main-count=goblet]')).to_have_text('1 pièces retenues')
            page.locator('[data-lab-require-set]').first.check()
            assert page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).configuration')=='4pc'
            assert len(page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).requiredSets'))==1
            expect(page.locator('[data-lab-metrics]')).to_contain_text('1 assemblages')
            page.locator('[data-lab-action=optimize]').click()
            page.wait_for_selector('.lab-build-result')
            expect(page.locator('[data-lab-metrics]')).to_contain_text('1 combinaisons possibles')
            expect(page.locator('.lab-build-result .lab-gear-piece').filter(has_text='Bonus Hydro')).to_have_count(1)
            expect(page.locator('.lab-build-result .lab-gear-piece').filter(has_text='Bonus Pyro')).to_have_count(0)
            page.locator('#lab-tab-buffs').click()
            page.locator('[data-lab-buff-owner="0"]').click()
            page.locator('[data-buff-slot="0"] .lab-ally-image-picker').first.locator('summary').click()
            page.locator('[data-lab-ally-choice="0"][data-choice-field=character]').filter(has_text='Shenhe').click()
            page.locator('[data-lab-character-buff=shenhe][data-buff-key=enabled]').check()
            assert page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).complexEffects.shenhe.atk')==3000
            page.locator('[data-buff-slot="0"] .lab-ally-image-picker').first.locator('summary').click()
            page.locator('[data-lab-ally-choice="0"][data-choice-field=character]').filter(has_text='Mona').click()
            expect(page.locator('[data-lab-character-buff=shenhe]')).to_have_count(0)
            assert not page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).complexEffects.shenhe.enabled')
            page.locator('[data-lab-character-buff=mona][data-buff-key=enabled]').check()
            expect(page.locator('[data-buff-slot="0"] .lab-support-equipment')).to_be_visible()
            page.locator('[data-buff-slot="0"] .is-weapon > summary').click()
            picker=page.locator('[data-buff-slot="0"] .is-weapon')
            picker.locator('[data-lab-ally-query]').fill('Histoire')
            picker.locator('[data-lab-ally-choice]').filter(has_text='Histoire des chasseurs de dragon').click()
            page.locator('[data-lab-ally="0"][data-ally-field=refinement]').select_option('5')
            expect(page.locator('[data-lab-support-weapon="0"]')).to_be_visible()
            expect(page.locator('[data-lab-support-weapon="0"]').locator('xpath=ancestor::article[1]')).to_contain_text('+48 % ATQ')
            base_atk=page.locator('[data-lab-live-stat=atk]').inner_text()
            page.locator('[data-lab-support-weapon="0"]').check()
            page.wait_for_function('(old)=>document.querySelector("[data-lab-live-stat=atk]").textContent!==old',arg=base_atk)
            expect(page.locator('[data-buff-slot="0"] .lab-buff-count')).to_have_text('2 actifs')
            assert page.locator('[data-buff-slot="0"] .lab-owner-sets').count()==0

            page.reload(wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen',state='detached')
            page.locator('[data-nav=lab]').first.click()
            page.locator('#lab-tab-buffs').click()
            page.locator('[data-lab-buff-owner="0"]').click()
            page.wait_for_selector('[data-lab-character-buff=mona][data-buff-key=enabled]')
            expect(page.locator('[data-lab-character-buff=mona][data-buff-key=enabled]')).to_be_checked()
            expect(page.locator('[data-lab-support-weapon="0"]')).to_be_checked()
            page.locator('.lab-party-buffs').scroll_into_view_if_needed()
            page.screenshot(path=str(Path(tempfile.gettempdir())/'astralis-character-buffs-desktop.png'))
            page.locator('[data-buff-slot="0"]').screenshot(path=str(Path(tempfile.gettempdir())/'astralis-support-equipment-card.png'))
            assert page.locator('[data-buff-slot="0"] .lab-support-character>summary').evaluate('el=>el.firstElementChild.getBoundingClientRect().width<=45')
            page.set_viewport_size({'width':390,'height':844})
            page.locator('.lab-party-buffs').scroll_into_view_if_needed()
            assert page.locator('.lab-workbench').evaluate('el=>el.scrollWidth<=el.clientWidth+1')
            page.screenshot(path=str(Path(tempfile.gettempdir())/'astralis-character-buffs-mobile.png'))
            page.set_viewport_size({'width':1440,'height':1000})
            page.locator('.lab-character-picker summary').click()
            page.locator('[data-lab-character-choice=skirk]').click()
            page.locator('#lab-tab-buffs').click()
            page.locator('[data-lab-buff-owner="-1"]').click()
            try:
                page.locator('[data-lab-character-buff=skirk][data-buff-key=enabled]').check()
            except Exception:
                print('SKIRK STATE',page.evaluate('localStorage.getItem("astralis:gi:damage-lab:v1")'),flush=True)
                print('SKIRK TEXT',page.locator('[data-lab-ally-effects="-1"]').inner_text(),errors,flush=True)
                page.screenshot(path=str(Path(tempfile.gettempdir())/'astralis-buff-failure.png'))
                raise

            page.locator('[data-lab-character-buff=skirk][data-buff-key=enable_passive_1]').check()
            page.locator('[data-lab-character-buff=skirk][data-buff-key=deathStacks]').select_option('2')
            assert page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).complexEffects.skirk.deathStacks')==2
            page.locator('[data-lab-character-buff=skirk][data-buff-key=sevenPhase]').check()
            assert page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).complexEffects.skirk.sevenPhase')
            expect(page.locator('[data-lab-character-buff=skirk][data-buff-key=serpentExtra] option')).to_have_count(13)
            page.locator('[data-lab=constellation]').select_option('2')
            expect(page.locator('[data-lab-character-buff=skirk][data-buff-key=serpentExtra] option')).to_have_count(23)
            expect(page.locator('[data-lab-character-buff=skirk][data-buff-key=deathStacksAt]')).to_have_count(0)
            assert 'Passif A4 de test' in page.locator('[data-lab-character-buff=skirk][data-buff-key=deathStacks]').locator('xpath=ancestor::article[1]').inner_text()
            page.locator('.lab-weapon-picker > summary').click()
            page.locator('[data-lab-weapon-choice]').filter(has_text='Éclazur').click()
            azure=page.locator('[data-buff-slot="-1"] [data-lab-azurelight=enabled]')
            expect(azure).to_be_visible()
            azure.check()
            page.locator('[data-buff-slot="-1"] [data-lab-azurelight=zeroEnergy]').check()
            expect(page.locator('[data-buff-slot="-1"] [data-lab-azurelight-gain]')).to_have_text('Gain actif : +48 % ATQ · +40 % DGT CRIT')
            page.locator('[data-lab-weapon-refinement]').select_option('5')
            expect(page.locator('[data-buff-slot="-1"] [data-lab-azurelight-gain]')).to_have_text('Gain actif : +96 % ATQ · +80 % DGT CRIT')

            expect(page.locator('[data-lab-character-buff=skirk][data-buff-key=sevenPhase]').locator('xpath=ancestor::article[1]')).to_contain_text('Salon solitaire')
            page.wait_for_selector('[data-lab-set-choice=first]')
            page.locator('[data-lab-set-choice=mode]').select_option('2+2')
            set_options=page.locator('[data-lab-set-choice=first] option').evaluate_all('els=>els.map(el=>el.value).filter(Boolean)')
            assert len(set_options)>=2
            page.locator('[data-lab-set-choice=first]').select_option(set_options[0])
            page.locator('[data-lab-set-choice=second]').select_option(set_options[1])
            page.locator('[data-lab-search-sets]').click()
            expect(page.locator('#lab-tab-optimizer')).to_have_attribute('aria-selected','true')
            assert page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).configuration')=='2+2'
            assert len(page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).requiredSets'))==0
            assert len(page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).allowedSets'))==2
            page.locator('#lab-tab-buffs').click()
            page.locator('.lab-buff-tab-heading').scroll_into_view_if_needed()
            page.screenshot(path=str(Path(tempfile.gettempdir())/'astralis-coherent-buffs-desktop.png'))
            assert not errors,errors
            browser.close()
            print('Character buffs: toggle, damage, team change, persistence and mobile passed',flush=True)
    finally:
        server.shutdown()
        server.server_close()
if __name__=='__main__':
    main()
