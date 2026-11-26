import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

ORIGIN=os.environ.get('ASTRALIS_TEST_ORIGIN','http://127.0.0.1:8877')


async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True,args=['--autoplay-policy=no-user-gesture-required'])
        context=await browser.new_context(viewport={'width':1440,'height':1100},service_workers='block')
        await context.add_init_script('''localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:preferences',JSON.stringify({characterThemeMode:'manual',characterThemeIds:{gi:'lore-istaroth',hsr:'lore-obsidian'},theme:'astral',reducedMotion:true}));const crew={owned:['amber','kaeya','lisa','barbara','ronova','istaroth','asmoday','naberius','capitano','dainsleif'],active:'istaroth',levels:{}};localStorage.setItem('astralis:express-des-mondes:v1',JSON.stringify({version:1,world:'gi',place:'mondstadt',screen:'home',characters:crew,crewByWorld:{gi:crew},tutorial:{done:true},clicker:{teams:{gi:['istaroth','ronova','capitano','dainsleif']}},lastAt:Date.now()}));''')
        page=await context.new_page();errors=[];page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',e.stack,flush=True)))
        # Keep the test app alive if the actual user's last window is closed.
        await context.request.post(ORIGIN+'/api/app-session/open',data={'id':'identity-design-verification','title':'Vérification du design'})
        await page.goto(ORIGIN+'/',wait_until='domcontentloaded',timeout=60000)
        print('App document loaded',flush=True)
        await page.wait_for_timeout(5000)
        await page.screenshot(path='artifacts/identity-app-boot.png')
        print('Frame',await page.locator('.app-frame').get_attribute('data-identity'),flush=True)
        await page.locator('.app-frame[data-identity="gi:istaroth"]').wait_for(timeout=20000)
        await page.wait_for_timeout(1200)
        assert await page.locator('.character-identity-scene .identity-mark').count()==3
        assert await page.locator('.character-theme-sigils .identity-signature-badge').count()==3
        await page.locator('.theme-ribbon-portrait').evaluate_all('(nodes)=>Promise.all(nodes.map(i=>i.decode()))')
        portraits=await page.locator('.theme-ribbon-portrait').evaluate_all('(nodes)=>nodes.map(i=>({src:i.currentSrc||i.src,loaded:i.complete&&i.naturalWidth>0}))')
        assert portraits and all(i['loaded'] and 'istaroth-portrait.png' in i['src'] for i in portraits),portraits
        await page.screenshot(path='artifacts/identity-istaroth-app.png',full_page=False)
        await page.locator('[data-nav=customize]').first.click();await page.locator('[data-settings-tab=appearance]').click()
        await page.locator('.character-identity-preview').wait_for();print('Appearance ready',flush=True)
        choices=await page.locator('[data-pref=characterThemeId] option').evaluate_all('(nodes)=>nodes.map(i=>i.value)')
        for id in ['lore-ronova','lore-istaroth','lore-capitano','lore-naberius','lore-asmoday','lore-dainsleif']:assert id in choices,id
        await page.locator('[data-pref=characterThemeId]').select_option('lore-asmoday')
        await page.locator('.app-frame[data-identity="gi:asmoday"]').wait_for()
        await page.locator('[data-settings-tab=appearance]').click()
        await page.locator('[data-pref=characterThemeMotifs]').uncheck()
        assert not await page.locator('.character-identity-scene').count()
        await page.locator('[data-settings-tab=appearance]').click()
        await page.locator('[data-pref=characterThemeMotifs]').check()
        await page.locator('[data-settings-tab=appearance]').click()
        await page.locator('[data-pref=characterThemeIntensity]').fill('80');await page.locator('[data-pref=characterThemeIntensity]').dispatch_event('change')
        assert await page.locator('.app-frame').evaluate("i=>i.style.getPropertyValue('--identity-strength')")=='0.8'
        await page.locator('[data-nav=daily-quiz]').first.click();await page.locator('.cx-expedition-v2').wait_for(timeout=30000);print('Game ready',flush=True)
        await page.locator('[data-cx-stage]').scroll_into_view_if_needed();await page.locator('.cx-squad img,.cx-destinations img').evaluate_all('(nodes)=>Promise.all(nodes.map(i=>i.decode().catch(()=>null)))');await page.screenshot(path='artifacts/expedition-v2-in-app-desktop.png')
        assert await page.locator('.cx-battle-rail [data-deep-kit]').count()==1
        assert await page.locator('.cx-destinations img').count()>4
        assert await page.locator('.exw-nav-more summary').count()==1
        await page.locator('.exw-nav-more summary').click();assert await page.locator('.exw-nav-more[open]').count()==1
        await page.keyboard.press('Escape');assert not await page.locator('.exw-nav-more[open]').count()
        for width in [1440,1024,768,390]:
            await page.set_viewport_size({'width':width,'height':1000 if width>550 else 844})
            assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
        await page.locator('[data-cx-stage]').scroll_into_view_if_needed();await page.screenshot(path='artifacts/expedition-v2-in-app-mobile.png')
        await page.locator('[data-cx-view=focus]').click();assert await page.locator('.cx-expedition-v2.scene-focus').count()==1
        await page.locator('[data-cx-view=focus]').click();assert not await page.locator('.cx-expedition-v2.scene-focus').count()
        await page.locator('[data-place="gi:liyue"]').click();await page.locator('[data-regional-object=liyue]').wait_for()
        await page.locator('[data-cx-team-active=ronova]').click();await page.locator('[data-character-identity="gi:ronova"]').wait_for()
        await page.locator('.cx-wish').click(force=True);assert await page.locator('[data-rpg-damage]').inner_text()!='0'
        await page.set_viewport_size({'width':1440,'height':1000})
        await page.locator('[data-nav=customize]').first.click();await page.locator('[data-settings-tab=appearance]').click()
        await page.locator('[data-game=hsr]').first.click();await page.locator('[data-nav=customize]').first.click();await page.locator('[data-settings-tab=appearance]').click()
        await page.locator('[data-pref=characterThemeId] option[value=lore-obsidian]').wait_for(state='attached')
        await page.locator('[data-pref=characterThemeId]').select_option('lore-obsidian')
        await page.locator('.app-frame[data-identity="hsr:obsidian"]').wait_for()
        assert 'assets/express-lore/obsidian.png' in await page.locator('.theme-ribbon-portrait').get_attribute('src')
        await page.set_viewport_size({'width':1440,'height':1000});await page.screenshot(path='artifacts/identity-obsidian-unchanged.png')
        report={'fullAppBoot':True,'threeAuthoredMotifs':True,'separateCutoutPortrait':True,'sixLoreThemesGenshin':True,'obsidianOriginalPortrait':True,'themeControls':True,'teamAndKitRail':True,'illustratedDestinations':True,'workingCompactNavigation':True,'focusMode':True,'regionAndCharacterSwitch':True,'realDamage':True,'responsiveWidths':[1440,1024,768,390],'errors':errors}
        Path('artifacts/character-themes-browser-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report),flush=True)
        await browser.close();assert not errors


asyncio.run(main())
