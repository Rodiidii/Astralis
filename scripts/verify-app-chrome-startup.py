import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright

ORIGIN=os.environ.get('ASTRALIS_TEST_ORIGIN','http://127.0.0.1:8891')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True)
        context=await browser.new_context(viewport={'width':1280,'height':900},service_workers='block')
        # Hold only the welcome's automatic dismissal so its real rendered state can be captured.
        # Normal dismissal is checked by every boot in verify-app-chrome-browser.py.
        await context.add_init_script("""if(!localStorage.getItem('shell-startup-seeded')){localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:preferences',JSON.stringify({characterThemeMode:'off',theme:'ocean',reducedMotion:true,backupReminder:false}));localStorage.setItem('shell-startup-seeded','1');window.__holdShellWelcome=true;const originalRemove=Element.prototype.remove;Element.prototype.remove=function(){if(this.id==='astralis-launch-screen'&&window.__holdShellWelcome)return;return originalRemove.call(this)};const hold=new MutationObserver(()=>{const screen=document.querySelector('#astralis-launch-screen');if(screen){screen.dataset.dismissScheduled='true';hold.disconnect();}});hold.observe(document,{childList:true,subtree:true});}""")
        page=await context.new_page();page.set_default_timeout(20000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        await page.goto(ORIGIN+'/',wait_until='domcontentloaded',timeout=60000)
        await page.locator('.shell-v2').wait_for()
        launch=page.locator('#astralis-launch-screen.shell-launch')
        assert await launch.is_visible()
        assert await launch.evaluate('n=>getComputedStyle(n).backgroundColor')=='rgb(13, 21, 24)'
        await page.screenshot(path='artifacts/shell-welcome.png')
        await launch.evaluate('n=>{window.__holdShellWelcome=false;n._timers?.forEach(clearInterval);n.remove()}')
        assert await page.locator('.shell-character-placeholder').count()==1
        assert not await page.locator('.character-identity-scene').count()
        await page.locator('[data-shell=collapse]').click()
        await page.locator('.shell-more summary').click()
        await page.locator('.shell-tools-worlds [data-game=hsr]').click()
        await page.locator('.app-frame[data-active-game=hsr]').wait_for()
        assert await page.locator('.app-frame').get_attribute('data-shell-nav')=='compact'
        await page.locator('.shell-more summary').click()
        await page.locator('.shell-tools-worlds [data-game=ww]').click()
        await page.locator('.app-frame[data-active-game=ww]').wait_for()
        await page.set_viewport_size({'width':390,'height':844})
        assert await page.locator('.topbar-profile>span').is_visible()
        await page.locator('.topbar-profile').click();await page.locator('.profile-editor').wait_for();await page.locator('[data-action=profile-editor-cancel]').first.click()
        await page.locator('[data-shell=mobile-menu]').click()
        await page.locator('#shell-mobile-navigation [data-shell=appearance]').click()
        await page.locator('[data-shell-pref=shellLaunch]').uncheck()
        await page.keyboard.press('Escape')
        await page.reload(wait_until='domcontentloaded');await page.locator('.shell-v2').wait_for()
        assert not await page.locator('#astralis-launch-screen').count()
        assert not await page.get_by_text('Cette page a rencontré un problème.',exact=True).count()
        report={'welcomeMatchesTheme':True,'welcomeScreenshot':True,'noCharacterMode':True,'compactWorldSwitcher':True,'mobileProfileVisibleAndWorking':True,'welcomeCanBeDisabled':True,'errors':errors}
        Path('artifacts/app-chrome-startup-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report),flush=True)
        await browser.close();assert not errors

asyncio.run(main())
