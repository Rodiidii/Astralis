"""Exercise the real application shell and its persisted preferences in isolated storage."""
import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright

ORIGIN=os.environ.get('ASTRALIS_TEST_ORIGIN','http://127.0.0.1:8891')
ARTIFACTS=Path('artifacts')

async def main():
    ARTIFACTS.mkdir(exist_ok=True)
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True)
        context=await browser.new_context(viewport={'width':1440,'height':1000},service_workers='block',accept_downloads=True)
        await context.add_init_script("""if(!localStorage.getItem('shell-qa-seeded')){localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:preferences',JSON.stringify({characterThemeMode:'manual',characterThemeIds:{gi:'lore-istaroth',hsr:'lore-obsidian'},theme:'midnight',reducedMotion:true,backupReminder:false}));localStorage.setItem('shell-qa-seeded','1');}""")
        page=await context.new_page();page.set_default_timeout(15000);errors=[]
        page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)))
        async def clean():
            # Keep nonessential assistant announcements out of reference screenshots.
            await page.locator('#assistant-toast-stack,.release-notes-notice').evaluate_all('(ns)=>ns.forEach(n=>n.remove())')
        async def ready():
            await page.locator('.shell-v2').wait_for(timeout=30000)
            await page.locator('#astralis-launch-screen').wait_for(state='detached',timeout=30000)
            await page.locator('.shell-character-card img').evaluate_all('(ns)=>Promise.all(ns.map(n=>n.decode().catch(()=>null)))')
            await clean()
            assert not await page.get_by_text('Cette page a rencontré un problème.',exact=True).count()
        async def drawer(tab='appearance'):
            await page.locator('.shell-bar-utilities > [data-shell=appearance]').click()
            await page.locator('#shell-personalization[open]').wait_for()
            if tab!='appearance':await page.locator('[data-shell-tab="navigation"]').click()
        await page.goto(ORIGIN+'/',wait_until='domcontentloaded',timeout=60000);await ready()
        print('Boot and local character portrait OK',flush=True)
        assert await page.locator('.shell-location b').inner_text()=='Tableau de bord général'
        assert 'istaroth-portrait.png' in await page.locator('.shell-character-card img').get_attribute('src')
        assert not await page.locator('.rail-quick-search:visible').count()
        await page.screenshot(path=str(ARTIFACTS/'shell-desktop.png'))
        await drawer();assert await page.locator('#shell-personalization').evaluate('d=>d.contains(document.activeElement)')
        await page.screenshot(path=str(ARTIFACTS/'shell-appearance.png'))
        await page.keyboard.press('Escape');assert not await page.locator('#shell-personalization[open]').count()
        assert await page.locator('.shell-bar-utilities > [data-shell=appearance]').evaluate('b=>b===document.activeElement')
        await drawer('navigation')
        await page.locator('[data-shell-pref=shellNavigation]').select_option('compact')
        assert await page.locator('.app-frame').get_attribute('data-shell-nav')=='compact'
        await page.locator('[data-shell-pref=shellResources]').uncheck()
        assert not await page.locator('.topbar-resources').is_visible()
        await page.locator('[data-shell-pin=favorites]').uncheck()
        await page.locator('[data-shell-pin=notes]').check()
        assert await page.locator('.shell-pins [data-shell-route=notes]').count()==1
        await page.locator('[data-shell-move=notes][data-direction="-1"]').click()
        assert await page.locator('.shell-pins button').evaluate_all('(ns)=>ns.map(n=>n.dataset.shellRoute)')==['dashboard','characters','notes','planner']
        await page.keyboard.press('Escape')
        assert await page.locator('.side-rail').evaluate('n=>n.getBoundingClientRect().width')<100
        await page.screenshot(path=str(ARTIFACTS/'shell-compact.png'))
        await page.locator('.shell-pins [data-shell-route=notes]').click();await page.locator('.shell-location b').filter(has_text='Carnet de terrain').wait_for()
        print('Compact navigation, custom pins, real route and saved settings OK',flush=True)
        await page.locator('[data-shell=collapse]').click()
        await drawer();await page.locator('[data-shell-theme=paper]').click()
        assert await page.locator('html').get_attribute('data-theme')=='paper'
        await page.locator('[data-shell-pref=shellFinish]').select_option('glass')
        await page.locator('[data-shell-character]').select_option('lore-ronova')
        await page.locator('.app-frame[data-identity="gi:ronova"]').wait_for()
        await page.locator('[data-shell-pref=characterThemeIntensity]').fill('80');await page.locator('[data-shell-pref=characterThemeIntensity]').dispatch_event('change')
        assert await page.locator('.app-frame').evaluate("n=>n.style.getPropertyValue('--identity-strength')")=='0.8'
        await page.locator('[data-shell-pref=shellPortrait]').uncheck()
        assert not await page.locator('.shell-character-card img').is_visible()
        await page.locator('[data-shell-pref=shellPortrait]').check()
        await page.screenshot(path=str(ARTIFACTS/'shell-light-appearance.png'))
        await page.keyboard.press('Escape');await page.screenshot(path=str(ARTIFACTS/'shell-light.png'))
        await page.reload(wait_until='domcontentloaded');await ready()
        assert await page.locator('html').get_attribute('data-theme')=='paper'
        assert await page.locator('.app-frame').get_attribute('data-shell-finish')=='glass'
        assert await page.locator('.app-frame').get_attribute('data-identity')=='gi:ronova'
        assert await page.locator('.shell-pins button').evaluate_all('(ns)=>ns.map(n=>n.dataset.shellRoute)')==['dashboard','characters','notes','planner']
        print('Live theme, character, intensity and reload persistence OK',flush=True)
        await page.locator('.shell-search').click();await page.locator('[data-command-palette]').wait_for()
        await page.locator('.command-search input').fill('Favoris');await page.locator('.command-result').filter(has_text='Favoris').first.click()
        await page.locator('.shell-location b').filter(has_text='Ta sélection').wait_for()
        await page.keyboard.press('Control+k');await page.locator('[data-command-palette]').wait_for();await page.keyboard.press('Escape')
        await page.locator('.topbar-profile').click();await page.locator('.profile-editor').wait_for();await page.locator('[data-action=profile-editor-cancel]').first.click()
        await page.locator('.shell-more summary').click()
        async with page.expect_file_chooser():await page.locator('.shell-more [data-action=import]').click()
        async with page.expect_download() as download:await page.locator('.shell-more [data-action=export]').click()
        assert (await download.value).suggested_filename.endswith('.json')
        await page.keyboard.press('Escape');print('Search shortcut, profile, import and backup download OK',flush=True)
        # The inbox may load the game's news first. It still uses the actual application handler.
        await page.locator('[data-inbox-open]').click();await page.locator('.inbox-center-dialog[open]').wait_for(timeout=45000)
        await page.screenshot(path=str(ARTIFACTS/'shell-inbox.png'))
        await page.keyboard.press('Escape')
        await drawer();await page.locator('[data-shell-theme=midnight]').click();await page.keyboard.press('Escape')
        sizes=[]
        for width in [1440,1024,768,390]:
            await page.set_viewport_size({'width':width,'height':1000 if width>550 else 844})
            assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'Page overflow at {width}'
            geometry=await page.locator('.topbar').evaluate('n=>({r:n.getBoundingClientRect().right,l:n.getBoundingClientRect().left})')
            assert geometry['l']>=0 and geometry['r']<=width,geometry
            for selector in ['.shell-search','.shell-more summary','.topbar-profile','[data-inbox-open]']:
                bounds=await page.locator(selector).evaluate('n=>n.getBoundingClientRect().toJSON()')
                assert bounds['right']<=width-5 and bounds['left']>=5,(width,selector,bounds)
            sizes.append(width)
        await page.locator('[data-shell=mobile-menu]').click();await page.locator('#shell-mobile-navigation[open]').wait_for()
        await page.screenshot(path=str(ARTIFACTS/'shell-mobile-menu.png'))
        await page.locator('#shell-mobile-navigation [data-shell-route=notes]').click()
        await page.locator('.shell-location b').filter(has_text='Carnet de terrain').wait_for()
        await clean();await page.screenshot(path=str(ARTIFACTS/'shell-mobile.png'))
        await page.locator('[data-shell=mobile-menu]').click();await page.locator('#shell-mobile-navigation [data-shell-game=hsr]').click()
        await page.locator('.app-frame[data-active-game=hsr]').wait_for(timeout=45000)
        await page.locator('[data-shell=mobile-menu]').click();await page.locator('#shell-mobile-navigation [data-shell=appearance]').click()
        await page.locator('[data-shell-character] option[value=lore-obsidian]').wait_for(state='attached')
        await page.locator('[data-shell-character]').select_option('lore-obsidian')
        await page.locator('.app-frame[data-identity="hsr:obsidian"]').wait_for()
        assert '/assets/express-lore/obsidian.png'==await page.locator('.shell-character-card img').get_attribute('src')
        await page.locator('[data-shell-tab=navigation]').click()
        assert not await page.locator('[data-shell-pin=notes]').is_checked(),'Genshin quick links must not leak into Star Rail'
        await page.screenshot(path=str(ARTIFACTS/'shell-mobile-appearance.png'))
        await page.keyboard.press('Escape')
        await page.locator('[data-shell=mobile-menu]').click();await page.locator('#shell-mobile-navigation [data-shell-game=ww]').click()
        await page.locator('.app-frame[data-active-game=ww]').wait_for(timeout=45000)
        assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        print('Inbox, responsive sizes, mobile routes and all 3 universes OK',flush=True)
        report={'boot':True,'localCharacterPortrait':True,'liveAppearanceControls':True,'savedPreferencesAfterReload':True,'compactRail':True,'perGameQuickLinksAndOrdering':True,'searchAndCtrlK':True,'originalProfileEditor':True,'originalImportFileChooser':True,'originalBackupDownload':True,'inbox':True,'mobileNavigationAndWorldSwitch':True,'allThreeGames':True,'obsidianPortraitUnchanged':True,'responsiveWidths':sizes,'errors':errors}
        (ARTIFACTS/'app-chrome-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
        print(json.dumps(report,ensure_ascii=False),flush=True);assert not errors
        await browser.close()

asyncio.run(main())
