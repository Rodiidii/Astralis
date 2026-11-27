"""Actual PHP image storage + full app button + iPhone WebKit metadata, disposable profiles."""
import io,json,sys
from pathlib import Path
from urllib.parse import urlsplit,unquote
from PIL import Image
from playwright.sync_api import sync_playwright,expect
from test_hosted_community import HostedCommunityTest,ROOT
sys.stdout.reconfigure(encoding='utf-8')
report=json.loads((ROOT/'releases/profile-install-browser.json').read_text(encoding='utf-8')) if sys.argv[1:] else {'engines':{},'errors':[]}
HostedCommunityTest.setUpClass();origin=HostedCommunityTest.base
try:
 with sync_playwright() as p:
  for name in (sys.argv[1:] or ['chromium','webkit']):
   print('Profile shortcut:',name,flush=True)
   browser=(p.chromium.launch(executable_path=p.chromium.executable_path) if name=='chromium' else p.webkit.launch())
   context=browser.new_context(**p.devices['iPhone 13'],service_workers='block',reduced_motion='reduce');page=context.new_page();page.set_default_timeout(60000);page.set_default_navigation_timeout(120000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   def route(r):
    url=r.request.url
    if not url.startswith(origin):r.abort();return
    if '/src/design-system.js' in url or '/src/motion-library.js' in url:r.abort();return
    if '/assets/user/' in url:r.fulfill(status=404,body='');return
    if '/api/profile-icon' in url:r.continue_();return
    if '/api/' in url:r.fulfill(json={});return
    file=(ROOT/unquote(urlsplit(url).path).lstrip('/')).resolve()
    if file.is_dir():file=file/'index.html'
    if file.is_relative_to(ROOT) and file.is_file():r.fulfill(path=str(file))
    else:r.fulfill(status=404,body='')
   page.route('**/*',route);page.goto(origin+'/',wait_until='domcontentloaded');page.wait_for_selector('.hc-dashboard',timeout=90000);page.locator('#astralis-launch-screen').wait_for(state='detached');print('Profile app ready',name,flush=True)
   assert not page.locator('[data-companion-message]').count();page.locator('[data-action=profile-edit]').first.click();expect(page.locator('.profile-editor')).to_be_visible()
   page.locator('#local-profile-name').fill('Profil de test')
   image=Image.new('RGB',(640,480),'#75bfa7');image.paste('#d19ce0',(320,0,640,480));buf=io.BytesIO();image.save(buf,format='PNG')
   page.locator('#local-profile-avatar').set_input_files({'name':'profile-test.png','mimeType':'image/png','buffer':buf.getvalue()})
   page.wait_for_function('document.querySelector(".profile-editor-avatar")?.naturalWidth>0');print('Profile photo ready',name,flush=True);page.locator('[data-action=profile-install]').click();page.wait_for_url('**/api/profile-icon/install?id=*');expect(page.locator('h1')).to_contain_text('Ton raccourci')
   print('Profile landing ready',name,flush=True);identifier=page.url.split('id=')[1];icon='/api/profile-icon/'+identifier+'.png'
   assert page.locator('link[rel=apple-touch-icon]').get_attribute('href')==icon;assert page.locator('link[rel=icon]').get_attribute('href')==icon
   page.wait_for_function('document.querySelector("main>img")?.naturalWidth===512');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   page.screenshot(path=str(ROOT/f'docs/profile-install-{name}-390.png'))
   page.locator('main>a').click();print('Profile returning to app',name,flush=True);page.wait_for_selector('.hc-dashboard',timeout=90000);page.locator('#astralis-launch-screen').wait_for(state='detached');assert identifier in page.locator('link[rel=apple-touch-icon]').get_attribute('href');assert identifier in page.locator('link[rel=icon]').get_attribute('href')
   assert page.evaluate("JSON.parse(localStorage.getItem('astralis:local-profile:v1')).name")=='Profil de test'
   cached=page.evaluate("JSON.parse(localStorage.getItem('astralis:profile-install-icon:v1'))")
   assert identifier in cached['iconUrl'];page.goto(origin+'/',wait_until='domcontentloaded');assert identifier in page.locator('link[rel=apple-touch-icon]').get_attribute('href');page.wait_for_selector('.hc-dashboard',timeout=90000)
   print('Profile reload complete',name,flush=True);page.locator('[data-action=profile-edit]').first.click();print('Profile editor reopened',name,flush=True);page.locator('[data-action=profile-avatar-clear]').click();print('Profile photo cleared',name,flush=True);page.locator('[data-action=profile-editor-save]').click();print('Profile saved without photo',name,flush=True)
   assert page.evaluate("localStorage.getItem('astralis:profile-install-icon:v1')") is None;assert identifier not in page.locator('link[rel=icon]').get_attribute('href');assert 'icon-180.png' in page.locator('link[rel=apple-touch-icon]').get_attribute('href')
   assert not errors,errors;report['engines'][name]={'fullAppBootWithoutDecoration':True,'realProfilePNG':True,'staticAppleMetadata':True,'faviconMatchesProfile':True,'reloadKeepsIcon':True,'clearPhotoResetsIcon':True,'mobileOverflow':False};browser.close()
 report['passed']=True;print(json.dumps(report,ensure_ascii=False),flush=True)
finally:
 (ROOT/'releases/profile-install-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');HostedCommunityTest.tearDownClass()
