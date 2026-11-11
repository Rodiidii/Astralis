"""Visual and interaction regression for the redesigned damage laboratory."""
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
    settings=dict(character='10000089',build='lab-build',atk=1000,hp=15000,em=100,critRate=50,critDmg=100,er=120,
        talent=2,level=90,elementKey='hydro',loadout='equipped',artifactLevelPreset='0',setEffects='{}',**{'def':700})
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch()
            page=browser.new_page(viewport={'width':1440,'height':1000},service_workers='block')
            page.set_default_navigation_timeout(120000)
            page.set_default_timeout(120000)
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
                    handler.fulfill(json={'info':{'attributes':[{'level':90,'ascension':6,'hp':15000,'attack':240,'defense':700}]},'skills':skills})
                elif 'genshin-db-api.vercel.app/api/v5/stats' in url:
                    handler.fulfill(json={'90':{'level':90,'attack':540,'specialized':0}})
                elif not url.startswith(base):
                    if any(x in path.lower() for x in ('furina','10000089','avatarimage','gacha_avatarimg')):
                        handler.fulfill(path=str(ROOT/'assets/card-art/gi/furina-1.webp'))
                    elif any(word in path for word in ('/UI/','/assets/skills/','/genshin/','/assets/UI/')):
                        handler.fulfill(path=str(ROOT/'assets/app-icon.svg'))
                    else:
                        handler.abort()
                elif path.startswith('/api/'):
                    handler.fulfill(json={})
                else:
                    handler.continue_()
            page.route('**/*',route)
            page.add_init_script('localStorage.setItem("astralis:gi:assistant-profile",JSON.stringify({enabled:false,proactive:false}));localStorage.setItem("astralis:active-game","gi");'+
                'if(!sessionStorage.getItem("labTestSeeded")){sessionStorage.setItem("labTestSeeded","1");localStorage.setItem("astralis:gi:lab-demo-v1","1");localStorage.setItem("astralis:gi:owned-artifacts",'+json.dumps(json.dumps(pieces))+');'+
                'localStorage.setItem("astralis:gi:builds",'+json.dumps(json.dumps([build]))+');'+
                'localStorage.setItem("astralis:gi:damage-lab:v1",'+json.dumps(json.dumps(settings))+');}')
            page.goto(base,wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen',state='detached')
            page.locator('[data-nav=lab]').first.click()
            page.wait_for_selector('.lab-workbench')
            expect(page.locator('.lab-portrait-caption h2')).to_have_text('Furina')
            assert page.locator('.lab-loadout-strip').first.locator('.lab-gear-piece').count()==6
            expect(page.locator('[data-lab-attack-kind]')).to_have_count(5)
            page.locator('[data-lab-attack-kind=charged]').click()
            expect(page.locator('[data-lab-attack-kind=charged]')).to_have_attribute('aria-pressed','true')
            expect(page.locator('[data-lab=hitCount]')).to_have_value('2')
            expect(page.locator('[data-lab=talent]')).to_have_value('1.5')
            page.locator('[data-lab-attack-kind=plunge]').click()
            expect(page.locator('[data-lab=talent]')).to_have_value('2.2')
            page.locator('[data-lab-attack-kind=skill]').click()
            expect(page.locator('[data-lab-target-attack]')).not_to_have_value('')
            # The weapon can change without leaving the laboratory, and source stats are recomputed.
            original_weapon=page.locator('[data-lab-weapon]').input_value()
            try:
                page.locator('[data-lab-weapon]').select_option(label='Absolution · 5★', timeout=10000)
            except Exception:
                print('Armes proposées:',page.locator('[data-lab-weapon] option').all_text_contents(),flush=True)
                print('Erreurs navigateur:', errors,flush=True)
                raise
            page.wait_for_function('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).referenceCharacter===JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).character')
            page.locator('[data-lab-weapon-refinement]').select_option('5')
            page.wait_for_function('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).weaponRefinement===5')
            page.locator('[data-lab-weapon]').select_option(original_weapon)
            page.wait_for_function('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).referenceCharacter===JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).character')
            page.locator('.lab-masthead').scroll_into_view_if_needed()
            page.screenshot(path=str(Path(tempfile.gettempdir())/'astralis-lab-controls-desktop.png'),full_page=True)
            page.locator('[data-lab-action=calculate]').click()
            expect(page.locator('[data-lab-damage]')).not_to_have_text('—')
            assert page.locator('[data-lab-damage]').inner_text()!='TODO_DATA'
            page.locator('.lab-masthead').scroll_into_view_if_needed()
            page.screenshot(path=str(Path(tempfile.gettempdir())/'astralis-lab-overview.png'),full_page=True)
            page.locator('#lab-tab-talents').click()
            page.wait_for_selector('[data-lab-talent-value]')
            page.locator('[data-lab-talent-value="1:0"]').click()
            expect(page.locator('#lab-tab-overview')).to_have_attribute('aria-selected','true')
            expect(page.locator('[data-lab="talent"]')).to_have_value('2.9')
            page.locator('[data-lab-action=calculate]').click()
            page.locator('#lab-tab-rotation').click()
            page.locator('[data-lab-action=add-hit]').click()
            expect(page.locator('[data-rotation-index]')).to_have_count(1)
            page.locator('[data-lab-duration="0"]').fill('5')
            page.locator('[data-lab-duration="0"]').dispatch_event('change')
            assert 'DPS' in page.locator('[data-lab-rotation-total]').inner_text()
            page.locator('#lab-tab-optimizer').click()
            expect(page.locator('[data-lab-allow-set]')).to_have_count(1)
            expect(page.locator('[data-lab-allow-set]').first).to_be_checked()
            settings_now=page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1"))')
            assert settings_now['artifactLevelPreset']=='0' and not settings_now['respectPriority']
            page.locator('[data-lab-allow-set]').first.uncheck()
            expect(page.locator('[data-lab-metrics]')).to_contain_text('0')
            page.locator('[data-lab-allow-set]').first.check()
            page.locator('.lab-set-effect-card>summary').first.click()
            set_condition=page.locator('[data-lab-effect="set:15044:four:hit"]')
            set_condition.check()
            expect(set_condition).to_be_checked()
            page.locator('[data-lab-require-set]').first.check()
            expect(page.locator('[data-lab-require-set]').first).to_be_checked()
            page.locator('.lab-masthead').scroll_into_view_if_needed()
            page.screenshot(path=str(Path(tempfile.gettempdir())/'astralis-lab-set-controls.png'),full_page=True)
            page.locator('[data-lab-action=optimize]').click()
            try:
                page.wait_for_selector('.lab-build-result',timeout=15000)
            except Exception:
                print('OPTIMIZER DEBUG',page.locator('[data-lab-metrics]').inner_text(),page.evaluate('localStorage.getItem("astralis:gi:damage-lab:v1")'),errors,flush=True)
                raise
            assert 'terminée' in page.locator('[data-lab-metrics]').inner_text()
            assert page.locator('.lab-build-result .lab-gear-piece').count()>=6
            page.locator('[data-lab-compare-result]').first.click()
            expect(page.locator('.lab-compare-row')).to_have_count(2)
            page.locator('#lab-tab-optimizer').click()
            page.locator('.lab-masthead').scroll_into_view_if_needed()
            page.screenshot(path=str(Path(tempfile.gettempdir())/'astralis-lab-optimizer.png'),full_page=True)
            page.locator('[data-lab-action=new-result]').first.click()
            assert page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:builds")).length')==2
            page.locator('#lab-tab-priority').click()
            first=page.locator('[data-priority-id]').first.get_attribute('data-priority-id')
            page.locator('[data-lab-action=priority-down]').first.click()
            assert page.locator('[data-priority-id]').nth(1).get_attribute('data-priority-id')==first
            page.locator('[data-lab-action=load-build]').click()
            assert 900<float(page.locator('[data-lab=atk]').input_value())<950
            page.locator('#lab-tab-overview').click()
            page.locator('[data-lab-action=sensitivity]').click()
            expect(page.locator('[data-lab-sensitivity] h4')).to_have_text('Ce qui rapporte le plus')
            page.set_viewport_size({'width':390,'height':844})
            page.locator('#lab-tab-overview').click()
            assert page.locator('.lab-workbench').evaluate('el=>el.scrollWidth<=el.clientWidth+1')
            page.locator('.lab-masthead').scroll_into_view_if_needed()
            page.screenshot(path=str(Path(tempfile.gettempdir())/'astralis-lab-mobile.png'),full_page=True)
            page.set_viewport_size({'width':1440,'height':1000})
            page.evaluate('localStorage.removeItem("astralis:gi:lab-demo-v1")')
            page.reload(wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen',state='detached')
            page.locator('[data-nav=lab]').first.click()
            page.locator('[data-lab-demo]').click()
            expect(page.locator('.lab-portrait-caption h2')).to_have_text('Skirk')
            expect(page.locator('[data-lab=hitCount]')).to_have_value('6')
            page.wait_for_function('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).referenceCharacter===JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).character')
            assert 350<float(page.locator('[data-lab=atk]').input_value())<370
            page.locator('.lab-current-equipment>summary').click()
            page.locator('.lab-equipped-detail summary').click()
            assert page.locator('.lab-equipped-grid article').count()==5
            page.locator('[data-lab-action=calculate]').click()
            expect(page.locator('[data-lab-damage]')).not_to_have_text('TODO_DATA')
            first_damage=page.locator('[data-lab-damage]').inner_text()
            page.locator('[data-lab-add-buff]').click()
            page.locator('[data-lab-action=calculate]').click()
            expect(page.locator('[data-lab-damage]')).not_to_have_text(first_damage)
            page.locator('[data-lab-tc-name]').fill('Test TC Skirk')
            page.locator('[data-lab-export]').click()
            page.locator('.astralis-png-preview canvas').wait_for()
            assert page.locator('.astralis-png-preview canvas').evaluate('c=>c.width')==4000
            with page.expect_download() as download:
                page.locator('.astralis-png-preview [data-save]').click()
            exported=download.value
            assert exported.suggested_filename.endswith('.png')
            page.keyboard.press('Escape')
            page.locator('[data-lab-save-tc]').click()
            page.wait_for_function('JSON.parse(localStorage.getItem("astralis:gi:builds")).some(b=>b.tc&&b.name==="TC - Test TC Skirk")')
            page.locator('#lab-tab-rotation').click()
            page.locator('[data-lab-action=add-hit]').click()
            expect(page.locator('[data-rotation-index]')).to_have_count(1)
            box=page.locator('.lab-rotation-step-icon').bounding_box()
            assert abs(box['width']-box['height'])<1 and box['width']<=44
            page.locator('[data-lab-duration="0"]').fill('5')
            page.locator('[data-lab-duration="0"]').dispatch_event('change')
            page.locator('[data-lab-evaluate-rotation]').click()
            expect(page.locator('[data-lab-result-title]')).to_have_text('Dégâts de la rotation')
            page.screenshot(path=str(Path(tempfile.gettempdir())/'astralis-lab-skirk-tc.png'),full_page=True)
            # Exercise the actual Enka import button and the Builds editor.
            enka_types=['FIGHT_PROP_HP','FIGHT_PROP_ATTACK','FIGHT_PROP_ATTACK_PERCENT','FIGHT_PROP_WATER_ADD_HURT','FIGHT_PROP_CRITICAL_HURT']
            enka_values=[4780,311,46.6,46.6,62.2]
            equip_types=['EQUIP_BRACER','EQUIP_NECKLACE','EQUIP_SHOES','EQUIP_RING','EQUIP_DRESS']
            enka=dict(playerInfo={'nickname':'Test Enka'},avatarInfoList=[dict(avatarId=10000089,propMap={'4001':{'val':'90'},'4002':{'val':'6'}},
                fightPropMap={'1':15000,'4':240,'7':700,'2':4780,'3':0,'5':311,'6':.466,'8':0,'9':0,'20':.55,'22':1.122,'23':1,'28':0,'42':.466},
                equipList=[dict(reliquary={'level':21,'mainPropId':15008},flat={'itemType':'ITEM_RELIQUARY','equipType':equip_types[i],'rankLevel':5,'icon':'UI_RelicIcon_15044_1','setNameTextMapHash':0,
                'reliquaryMainstat':{'mainPropId':enka_types[i],'statValue':enka_values[i]},
                'reliquarySubstats':[{'appendPropId':'FIGHT_PROP_CRITICAL','statValue':10.0}]}) for i in range(5)])])
            page.evaluate('(profile)=>localStorage.setItem("astralis:gi:profile",JSON.stringify(profile))',enka)
            page.reload(wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen',state='detached')
            page.locator('[data-nav=profile]').first.click()
            page.on('dialog',lambda dialog:dialog.accept('Enka régression'))
            page.locator('[data-import-enkabuild="10000089"]').click()
            page.wait_for_selector('[data-build-id]')
            saved=page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:builds")).find(b=>b.name==="Enka régression")')
            assert saved['pieces'][2]['mainType']=='atkPct'
            assert saved['pieces'][3]['mainType']=='hydroDmg'
            assert saved['pieces'][4]['mainType']=='critDmg'
            assert saved['pieces'][3]['mainValue']==46.6 and saved['pieces'][3]['level']==20
            expect(page.locator('select[data-build-piece="3"][data-piece-field="mainType"]')).to_have_value('hydroDmg')
            expect(page.locator('input[data-build-piece="3"][data-piece-field="sub0Value"]')).to_have_value('10')
            page.locator('[data-nav=lab]').first.click()
            page.wait_for_selector('[data-damage-lab]')
            page.evaluate("""document.dispatchEvent(new CustomEvent('astralis:open-imported-team', {detail:{
                original:{name:'Équipe JSON test',loadoutData:[{key:'Furina',buildTcs:[{
                    character:{constellation:2},weapon:{key:'',refinement:1},artifact:{sets:{}}
                }]}]}
            }}))""")
            expect(page.locator('.team-builder')).to_be_visible()
            expect(page.locator('[data-team-field=name]')).to_have_value('Équipe JSON test')
            expect(page.locator('.builder-slot').first.locator('.builder-character-art')).to_have_attribute('alt','Furina')
            expect(page.locator('[data-slot="0"][data-slot-field=constellation]')).to_have_value('2')
            page.keyboard.press('Escape')
            print('Laboratoire, inventaire, buffs, rotation et téléchargement PNG vérifiés.',flush=True)
            browser.close()
            assert not errors,errors
    finally:
        server.shutdown()
        server.server_close()


if __name__=='__main__':
    main()
