import os
"""Measure actual native HD playback, warm-up and effect suspension in Chromium."""
import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',
            headless=True, args=['--autoplay-policy=no-user-gesture-required'])
        page = await browser.new_page(service_workers='block', viewport={'width':1366,'height':900})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto(os.environ.get('ASTRALIS_TEST_ORIGIN','http://127.0.0.1:8766')+'/health')
        await page.evaluate('''async()=>{
            document.body.innerHTML='<main class="cx-adventure"><div class="cx-photo-stage" data-cx-stage style="position:relative;width:1100px;height:620px;overflow:hidden;background:#101820"><div class="cx-kit-entities"><i style="animation:testOrbit 2s linear infinite">Invocation</i></div></div></main>';
            const style=document.createElement('style');style.textContent='@keyframes testOrbit{to{transform:rotate(360deg)}}';document.head.append(style);
            for(const name of ['express-adventure','express-character-cinematics']){const l=document.createElement('link');l.rel='stylesheet';l.href='/styles/'+name+'.css?v=20261124-expedition-3';document.head.append(l);}
            window.player=await import('/src/express-ultimate-player.js?v=20261124-expedition-3');await player.preloadUltimateMedia();
        }''')
        results = []
        samples = [('gi','10000089','Furina'),('hsr','1408','Phainon'),('ww','1304','Jinhsi'),('gi','ronova','Ronova')]
        if '--smoke' in sys.argv:
            samples = samples[:1]
        for world, pid, name in samples:
            await page.evaluate('''async({world,pid,name})=>{
                window.person={id:pid,name,lore:pid==='ronova'};await player.warmUltimateClips([person],world);
            }''', {'world':world,'pid':pid,'name':name})
            # Wait for the same first-frame preparation used by the selected team.
            await page.evaluate('''({world,pid})=>{window.started=performance.now();window.movie=player.playUltimateMedia(document.querySelector('[data-cx-stage]'),person,pid,world,{muted:true});}''', {'world':world,'pid':pid})
            await page.wait_for_function("document.querySelector('.cx-media-playing video')?.currentTime>.1", timeout=15000)
            latency = await page.evaluate('performance.now()-started')
            baseline = await page.evaluate("(()=>{const q=document.querySelector('.cx-media-playing video').getVideoPlaybackQuality();return {total:q.totalVideoFrames,dropped:q.droppedVideoFrames}})()")
            await page.wait_for_timeout(2200)
            metrics = await page.evaluate('''()=>{
                const v=document.querySelector('.cx-media-playing video'),q=v.getVideoPlaybackQuality();v.pause();clearTimeout(movie.timer);return {
                    width:v.videoWidth,height:v.videoHeight,seconds:v.duration,currentTime:v.currentTime,
                    totalFrames:q.totalVideoFrames,droppedFrames:q.droppedVideoFrames,rate:v.playbackRate,
                    controls:v.controls,effectsPaused:getComputedStyle(document.querySelector('.cx-kit-entities i')).animationPlayState,
                    imageRendering:getComputedStyle(v).imageRendering,filter:getComputedStyle(v).filter,src:v.currentSrc};
            }''')
            metrics.update(character=name, startupMs=round(latency))
            metrics['visibleTotalFrames'] = metrics['totalFrames']-baseline['total']
            metrics['visibleDroppedFrames'] = metrics['droppedFrames']-baseline['dropped']
            assert metrics['height'] >= 1080, metrics
            assert metrics['seconds'] <= 5.1 and metrics['rate'] == 1 and not metrics['controls'], metrics
            assert metrics['totalFrames'] >= 25, metrics
            assert metrics['effectsPaused'] == 'paused' and metrics['filter'] == 'none', metrics
            await page.locator('[data-cx-stage]').screenshot(path='artifacts/hd-'+name.lower()+'.png', animations='allow')
            await page.locator('.cx-ultimate-skip').click(force=True)
            assert not await page.locator('.cx-media-playing').count()
            assert await page.evaluate("getComputedStyle(document.querySelector('.cx-kit-entities i')).animationPlayState") == 'running'
            results.append(metrics)
        await page.evaluate("window.finishedNaturally=false;player.playUltimateMedia(document.querySelector('[data-cx-stage]'),person,'ronova','gi',{muted:true,onComplete:()=>window.finishedNaturally=true})")
        await page.wait_for_function('window.finishedNaturally===true',timeout=9000)
        assert not await page.locator('.cx-ultimate-fullframe').count()
        await page.evaluate("player.playUltimateMedia(document.querySelector('[data-cx-stage]'),person,'ronova','gi',{reduced:true,muted:true})")
        assert not await page.locator('.cx-ultimate-fullframe video').count()
        await page.evaluate('player.stopUltimateMedia();player.releaseUltimatePreloads()')
        report = {'playback':results,'effectResume':True,'naturalEnd':True,'reducedMotion':True,'errors':errors}
        Path('artifacts/hd-playback-smoke.json' if '--smoke' in sys.argv else 'artifacts/hd-playback-browser-verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf8')
        print(json.dumps(report, ensure_ascii=False), flush=True)
        assert not errors
        await browser.close()


asyncio.run(main())
