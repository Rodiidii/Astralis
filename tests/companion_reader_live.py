"""Public site smoke test, with disposable player preferences and no author writes."""
import sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path(__file__).resolve().parents[1];origin='https://astralis.wuaze.com';report={'origin':origin,'checks':{},'errors':[],'formats':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=p.chromium.executable_path,args=['--disable-gpu']);context=browser.new_context(viewport={'width':1536,'height':1050},service_workers='allow',reduced_motion='reduce');page=context.new_page();page.set_default_timeout(60000);expect.set_options(timeout=30000);page.on('pageerror',lambda e:report['errors'].append(str(e)))
 page.add_init_script("localStorage.setItem('astralis:releases:last-seen','2026-11-27-reader-polish-1')")
 try:
  print('LIVE companion: startup',flush=True);page.goto(origin+'/',wait_until='domcontentloaded',timeout=120000);page.wait_for_selector('.hc-dashboard',timeout=120000);page.locator('#astralis-launch-screen').wait_for(state='detached');assert page.evaluate("async()=> (await fetch('/VERSION',{cache:'no-store'}).then(r=>r.text())).trim()")=='1.0.61'
  profile=page.evaluate("()=>JSON.parse(localStorage.getItem('astralis:gi:assistant-profile')||'{}')");assert not profile.get('personaCharacter');assert page.locator('#theme-signature-companion').count()==0;report['checks']['noDefaultCharacter']=True
  resource=page.evaluate("""async()=>{const r=await fetch('/src/motion-library.js?v=20261127-reader-polish-1',{cache:'no-store'});return {status:r.status,type:r.headers.get('content-type'),body:await r.text()}}""");assert resource['status']==200 and 'javascript' in resource['type'] and 'MutationObserver' in resource['body'];report['checks']['animationResourceIsJavaScript']=True
  page.add_style_tag(content='.backup-reminder,.release-notes-notice{display:none!important}')
  page.locator('.side-rail [data-nav=assistant]').evaluate('e=>e.click()');page.locator('[data-assistant-character][data-character-name=nahida]').click();page.locator('.assistant-profile-drawer>summary').click();page.locator('[data-action=assistant-test-nudge]').click();expect(page.locator('[data-companion-message]')).to_be_visible();expect(page.locator('[data-companion-message]')).to_contain_text('Nahida');page.set_viewport_size({'width':390,'height':844});box=page.locator('[data-companion-message]').bounding_box();assert box['x']>=0 and box['x']+box['width']<=391;page.screenshot(path=str(ROOT/'docs/companion-live-mobile.png'));page.locator('.assistant-toast-close').click();report['checks']['chosenCompanionMessage']=True
  print('LIVE guides: published reading',flush=True);page.locator('.side-rail [data-nav=sheets]').evaluate('e=>e.click()');page.locator('[data-sheet-action=read]').first.click();page.wait_for_selector('.reader-refined');page.wait_for_function('document.querySelector(".sheet-reader-hero .sheet-cover-image")?.naturalWidth>0');paragraph=page.locator('.sheet-read-text p').first;before=paragraph.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)');page.locator('[data-reader-font="1"]').click();assert paragraph.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')>before;report['checks']['actualReaderTextSize']=True
  for width,height in [(1536,1050),(1366,768),(1024,768),(768,1024),(430,932),(390,844),(360,800),(320,740)]:
   page.set_viewport_size({'width':width,'height':height});page.evaluate('()=>{for(const e of document.querySelectorAll(".workspace,.main-content,.app-frame"))e.scrollTop=0;scrollTo(0,0)}');page.wait_for_timeout(150);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),width;box=page.locator('.reader-refined').bounding_box();assert box['x']>=0 and box['x']+box['width']<=width+1;report['formats'].append([width,height]);
   if width in [1536,390]:page.screenshot(path=str(ROOT/f'docs/guide-live-{width}.png'))
  report['checks']['publishedCoverLoaded']=True
  print('LIVE startup: blocked animation stays optional',flush=True);isolated=browser.new_context(service_workers='block');probe=isolated.new_page();probe.route('**/src/motion-library.js*',lambda r:r.abort());probe.goto(origin+'/',wait_until='domcontentloaded',timeout=120000);probe.wait_for_selector('.hc-dashboard',timeout=120000);probe.locator('#astralis-launch-screen').wait_for(state='detached',timeout=60000);assert 'Astralis n’a pas pu démarrer' not in probe.locator('#app').inner_text();report['checks']['blockedAnimationsDoNotBlockStartup']=True;isolated.close()
  assert not report['errors'],report['errors'];report['passed']=True;print('PASS live companion and reader',json.dumps(report,ensure_ascii=False),flush=True)
 except Exception as error:
  report['error']=str(error);report['passed']=False;page.screenshot(path=str(ROOT/'docs/companion-reader-live-failure.png'));raise
 finally:
  (ROOT/'releases/companion-reader-live.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');browser.close()
