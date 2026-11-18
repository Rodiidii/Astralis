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
            page.set_default_timeout(20000)
            def open_allies():
                if not page.locator('[data-lab-allies]').evaluate('(el)=>el.open'):
                    page.locator('[data-lab-allies]>summary').click()

            page.set_default_timeout(25000)
            errors=[]
            page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',e.stack,flush=True)))
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

            page.locator('.lab-character-picker summary').click()
            page.locator('[data-lab-character-choice=diluc]').click()
            page.locator('[data-lab=constellation]').select_option('2')
            page.locator('[data-lab-attack-kind=normal]').click()
            page.wait_for_selector('[data-lab-target-attack] option[value^="wr:"]',state='attached')
            first_attack=page.locator('[data-lab-target-attack] option[value^="wr:"]').first.get_attribute('value')
            page.locator('[data-lab-target-attack]').select_option(first_attack)
            page.locator('#lab-tab-buffs').click()
            page.wait_for_selector('[data-lab-source-buff="-1"][data-source-path=DilucC2]')
            source=page.locator('[data-lab-source-buff="-1"][data-source-path=DilucC2]')
            page.locator('[data-lab-buff-calculate]').click()
            before=page.locator('[data-lab-damage]').inner_text()
            source.select_option('3')
            page.wait_for_function('(old)=>document.querySelector("[data-lab-damage]").textContent!==old',arg=before)
            buffed=page.locator('[data-lab-damage]').inner_text()
            source.select_option('off')
            page.wait_for_function('(old)=>document.querySelector("[data-lab-damage]").textContent!==old',arg=buffed)
            page.locator('[data-lab-buff-owner="0"]').click()
            # The support picker preserves its native select for accessible state changes.
            page.locator('.lab-support-character summary').first.click()
            page.locator('[data-lab-ally-choice="0"][data-choice-field=character][data-choice-value=bennett]').click()
            page.wait_for_selector('[data-lab-source-buff="0"][data-source-path=activeInArea]')
            pbefore=page.locator('[data-lab-damage]').inner_text()
            page.locator('[data-lab-source-buff="0"][data-source-path=underHP]').check()
            page.locator('[data-lab-source-buff="0"][data-source-path=activeInArea]').check()
            page.wait_for_function('(old)=>document.querySelector("[data-lab-damage]").textContent!==old',arg=pbefore)
            assert page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).allies[0].wrConditions.Bennett.activeInArea')=='activeInArea'
            page.set_viewport_size({'width':390,'height':844})
            assert page.locator('.lab-workbench').evaluate('el=>el.scrollWidth<=el.clientWidth+1')
            page.locator('.lab-source-buffs').last.scroll_into_view_if_needed()
            page.screenshot(path=str(Path(tempfile.gettempdir())/'astralis-all-character-buffs-mobile.png'))
            page.set_viewport_size({'width':1440,'height':1000})
            page.reload(wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen',state='detached')
            page.locator('[data-nav=lab]').first.click()
            page.locator('#lab-tab-buffs').click()
            page.locator('[data-lab-buff-owner="0"]').click()
            expect(page.locator('[data-lab-source-buff="0"][data-source-path=activeInArea]')).to_be_checked()
            assert not errors,errors
            browser.close()
            print('Complete source buffs: Diluc C2, Bennett team transfer, persistence and mobile passed',flush=True)
    finally:
        server.shutdown()
        server.server_close()
if __name__=='__main__':
    main()
