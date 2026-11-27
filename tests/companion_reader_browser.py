"""Functional and visual checks in an isolated browser profile; no user's saves."""
import json,threading,sys
sys.stdout.reconfigure(encoding="utf-8")
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit,unquote
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=128
 def handle_error(self,*args):pass
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
report={'errors':[],'checks':{},'formats':[]}
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=p.chromium.executable_path,args=['--disable-gpu']);context=browser.new_context(viewport={'width':1536,'height':1050},service_workers='block',reduced_motion='reduce',accept_downloads=True,permissions=['clipboard-read','clipboard-write']);page=context.new_page();page.set_default_timeout(45000);expect.set_options(timeout=15000);page.on('pageerror',lambda e:(report['errors'].append(str(e)),print('PAGEERROR',str(e),flush=True)))
  def route(r):
   url=r.request.url
   if not url.startswith(base):r.abort();return
   if '/assets/user/' in url:r.fulfill(status=404,body='');return
   if '/src/motion-library.js' in url:r.abort();return
   if '/api/character-sheets/status' in url:r.fulfill(json={'ok':True,'readOnly':False,'authenticated':True,'localAdmin':True,'publishReady':True});return
   if '/api/character-sheets/index' in url:r.fulfill(path=str(ROOT/'published/character-sheets/index.json'));return
   if '/api/character-sheets/item' in url:r.fulfill(json={'sheet':json.loads(next((ROOT/'published/character-sheets/sheets').glob('*.json')).read_text(encoding='utf-8'))});return
   if '/api/feedback/status' in url:r.fulfill(json={'ok':True,'ownerAvailable':False});return
   if '/api/gi/endgame' in url:r.fulfill(path=str(ROOT/'hosting-data/gi-endgame.json'));return
   if '/src/app.js' in url:r.fulfill(body=(ROOT/'src/app.js').read_text(encoding='utf-8')+'\nwindow.companionQA={state,render,renderPageOnly,showAssistantNudge,showAssistantToast,selectedThemeCharacter};',content_type='application/javascript');return
   if '/api/' in url:r.fulfill(json={});return
   file=(ROOT/unquote(urlsplit(url).path).lstrip('/')).resolve()
   if file.is_dir():file=file/'index.html'
   if not file.is_relative_to(ROOT) or not file.is_file():r.fulfill(status=404,body='');return
   r.fulfill(path=str(file))
  page.route('**/*',route)
  page.add_init_script("""if(!sessionStorage.getItem('qa-desk')){sessionStorage.setItem('qa-desk','1');localStorage.setItem('astralis:active-game','hsr');localStorage.setItem('astralis:gi:assistant-profile','{"enabled":true,"proactive":true}');localStorage.setItem('astralis:releases:last-seen','2026-11-26-daily-desk-1');} """)
  try:
    print('Daily desk: startup',flush=True);page.goto(base,wait_until='domcontentloaded',timeout=120000);page.wait_for_selector('.hc-dashboard',timeout=90000);page.locator('#astralis-launch-screen').wait_for(state='detached',timeout=60000)
    assert page.locator('.app-frame').get_attribute('data-active-game')=='gi';report['checks']['defaultGenshin']=True
    page.add_style_tag(content='.backup-reminder,.release-notes-notice{display:none!important}')
    report['checks']['optionalAnimationFailureDoesNotBlockApp']=True
    print('Companions: no implicit character',flush=True)
    page.evaluate("""async()=>{const {state}=companionQA;const chars=[{_id:'ayaka',id:'10000002',_name:'Kamisato Ayaka',name:'Kamisato Ayaka',elementText:'Cryo',_labImage:'/assets/character-portraits/gi-10000002.webp',_labSplash:'/assets/genshin/splashes/10000002.webp'},{_id:'nahida',id:'10000073',_name:'Nahida',name:'Nahida',elementText:'Dendro',_labImage:'/assets/character-portraits/gi-10000073.webp',_labSplash:'/assets/genshin/splashes/10000073.webp'}];Object.defineProperty(state.catalogs,'gi:character',{configurable:true,get:()=>chars,set:()=>{}});localStorage.removeItem('astralis:gi:assistant-profiles');localStorage.setItem('astralis:gi:assistant-profile',JSON.stringify({id:'companion-1',name:'Voyageur QA',enabled:true,proactive:true,personaCharacter:'',companion:''}));await companionQA.showAssistantNudge();state.section='assistant';companionQA.render();}""")
    assert page.locator('#assistant-toast-stack').count()==0;assert page.evaluate('()=>companionQA.selectedThemeCharacter()') is None;report['checks']['noDefaultCharacter']=True
    print('Companions: choose Nahida',flush=True);page.locator('[data-assistant-character=nahida]').click();print('Companions: open chat',flush=True);
    if not page.locator('[data-cl-form=chat]').is_visible():page.locator('[data-cl=pane][data-pane=chat]').first.click()
    expect(page.locator('[data-cl-form=chat]')).to_be_visible();page.locator('#lounge-question').fill('Je veux préparer mon farm et ma rotation.');page.locator('[data-cl-form=chat] [type=submit]').click();expect(page.locator('.cl-message.is-user')).to_have_count(1);expect(page.locator('.cl-message.is-guide')).to_have_count(1);expect(page.locator('.cl-message.is-guide')).to_contain_text('Nahida');report['checks']['chosenCharacterConversation']=True
    page.evaluate("()=>companionQA.showAssistantToast({char:companionQA.state.catalogs['gi:character'][1],text:'On garde une priorité claire pour la prochaine session. '.repeat(8),kind:'Pour ta prochaine session',duration:600,manual:true})")
    expect(page.locator('[data-companion-message]')).to_be_visible();page.locator('.assistant-message-expand').click();expect(page.locator('.assistant-message-expand')).to_have_attribute('aria-expanded','true');report['checks']['messageExpansion']=True;page.screenshot(path=str(ROOT/'docs/companion-refined-desktop.png'))
    page.set_viewport_size({'width':390,'height':844});b=page.locator('[data-companion-message]').bounding_box();assert b['x']>=0 and b['x']+b['width']<=391;page.screenshot(path=str(ROOT/'docs/companion-refined-mobile.png'));page.locator('.assistant-toast-close').click();page.evaluate("async()=>{const {readAssistantProfile,saveAssistantProfile}=await import('/src/assistant.js?v=20261126-personal-workshop-6');saveAssistantProfile({...readAssistantProfile(),proactive:false})}")
    print('Guides: reader and explicit character selection',flush=True)
    page.locator('.side-rail [data-nav=sheets]').evaluate('e=>e.click()');page.locator('[data-sheet-action=read]').first.click();expect(page.locator('.reader-refined')).to_be_visible();expect(page.locator('.sheet-reader-hero h1')).to_contain_text('Nahida');page.wait_for_function('document.querySelector(".sheet-reader-hero .sheet-cover-image")?.naturalWidth>0')
    paragraph=page.locator('.sheet-read-text p').first;before=paragraph.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)');page.locator('[data-reader-font="1"]').click();assert paragraph.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')>before;report['checks']['readerTextSize']=True
    assert not any('<' in text for text in page.locator('.reader-toc-links a').all_inner_texts());page.locator('[data-reader-toc-toggle]').click();expect(page.locator('.reader-toc-links')).to_be_visible();page.locator('[data-sheet-reader-jump]').last.click();expect(page.locator('[data-reader-toc-toggle]')).to_have_attribute('aria-expanded','false');report['checks']['mobileContents']=True
    for width,height in [(1536,1050),(1366,768),(1024,768),(768,1024),(430,932),(390,844),(360,800),(320,740)]:
     page.set_viewport_size({'width':width,'height':height});page.evaluate('()=>{for(const e of document.querySelectorAll(".workspace,.main-content,.app-frame"))e.scrollTop=0;scrollTo(0,0)}');page.wait_for_timeout(150);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),width;box=page.locator('.reader-refined').bounding_box();assert box['x']>=0 and box['x']+box['width']<=width+1,(width,box);report['formats'].append([width,height]);
     if width in [1536,390]:page.screenshot(path=str(ROOT/f'docs/guide-refined-{width}.png'))
    page.locator('[data-sheet-action=back]').first.click();page.locator('[data-sheet-action=new][data-sheet-template=blank]').click();expect(page.locator('.sheet-person-chooser')).to_be_visible();assert page.locator('.sheet-editor-page').count()==0;page.locator('[data-person-search]').fill('Nahida');page.locator('[data-person-choice=nahida]').click();expect(page.locator('[data-sheet-field=characterId]')).to_have_value('nahida');report['checks']['newGuideRequiresCharacter']=True
    assert not report['errors'],report['errors'];report['passed']=True;print('PASS companion and guide polish',json.dumps(report,ensure_ascii=False),flush=True);browser.close()
  except Exception as error:
   report['error']=str(error);page.screenshot(path=str(ROOT/'docs/companion-reader-failure.png'));print('FAILURE',str(error),flush=True);print(page.locator('body').inner_text()[-2200:],flush=True);raise

finally:
 (ROOT/'releases').mkdir(exist_ok=True);(ROOT/'releases/companion-reader-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');server.shutdown();server.server_close()
