"""Verify real polling timers with continuous activity, safe reader updates and private inbox refresh."""
import json
from pathlib import Path
from urllib.parse import urlsplit,unquote
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];base='https://astralis.test'
sheet={'id':'realtime-sheet-01','characterId':'10000073','characterName':'Nahida','title':'Nahida · version initiale','version':1,'theme':{},'pages':[{'id':'page-1','title':'Le guide','blocks':[{'id':'title','type':'heading','text':'Avant mise à jour'},{'id':'text','type':'text','content':'<p>Un guide suffisamment long.</p>'*70}]}]}
reports=[];calls=[];notifications=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=p.chromium.executable_path,args=['--disable-gpu']);c=browser.new_context(service_workers='block',viewport={'width':1200,'height':800});page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.clock.install();
 def route(r):
  path=urlsplit(r.request.url).path
  if path.startswith('/api/'):
   calls.append(path)
   if path.endswith('character-sheets/status'):r.fulfill(json={'readOnly':True,'authenticated':False});return
   if path.endswith('character-sheets/index'):r.fulfill(json={'sheets':[{k:sheet[k] for k in ['id','characterId','characterName','title','version']}]});return
   if path.endswith('character-sheets/item'):r.fulfill(json={'sheet':sheet});return
   if path.endswith('feedback/status'):r.fulfill(json={'authenticated':True,'newCount':len(reports)});return
   if path.endswith('feedback/inbox'):r.fulfill(json={'reports':reports});return
   r.fulfill(json={'ok':True});return
  if path=='/harness':r.fulfill(content_type='text/html',body='<!doctype html><html><head></head><body><button data-sheet-unread-badge></button><div id="sheet-root"></div><script type="module">window.sheetModule=await import("/src/character-sheets.js");sheetModule.initCharacterSheets(document.querySelector("#sheet-root"),{characters:[{id:"10000073",name:"Nahida",image:"/assets/character-portraits/gi-10000073.webp"}]});</script></body></html>');return
  file=(ROOT/unquote(path).lstrip('/')).resolve()
  if file.is_relative_to(ROOT) and file.is_file():r.fulfill(path=str(file))
  else:r.fulfill(status=404,body='')
 page.route('**/*',route);print('Realtime: initial automatic download',flush=True);page.goto(base+'/harness');page.wait_for_function("JSON.parse(localStorage.getItem('astralis:character-sheets:seen-versions:v1')||'{}')['realtime-sheet-01']===1");expect(page.locator('[data-sheet-unread-badge]')).to_have_text('1');page.locator('[data-sheet-action=read]').first.click();expect(page.locator('.sheet-reader-page')).to_be_visible()
 page.evaluate('window.scrollTo(0,500)');scroll=page.evaluate('window.scrollY');sheet['version']=2;sheet['title']='Nahida · version actualisée';sheet['pages'][0]['blocks'][0]['text']='Mise à jour reçue sans attendre'
 print('Realtime: update while reader stays active',flush=True)
 for _ in range(3):page.keyboard.press('ArrowDown');page.clock.fast_forward(10000);page.wait_for_timeout(40)
 page.wait_for_function("JSON.parse(localStorage.getItem('astralis:character-sheets:seen-versions:v1')||'{}')['realtime-sheet-01']===2");expect(page.locator('.sheet-reader-page')).to_contain_text('Mise à jour reçue sans attendre');assert page.evaluate('window.scrollY')>=scroll;assert page.url==base+'/harness';print('Realtime: reader updated within one 30-second interval',flush=True)
 page.evaluate("async()=>{document.body.innerHTML='<div class=\"side-rail\"><button class=\"rail-link\" data-nav=\"feedback\">Retours</button></div><div id=\"feedback-root\"></div>';const m=await import('/src/feedback.js');document.querySelector('#feedback-root').innerHTML=m.renderFeedback();await m.mountFeedback(document.querySelector('[data-feedback]'));window.notices=[];m.startFeedbackNotifications(message=>notices.push(message));}")
 expect(page.locator('[data-feedback-inbox]')).to_be_visible();reports.append({'id':'a'*24,'title':'Nouveau retour privé','kind':'bug','category':'display','platform':'site','description':'La description du retour reçu automatiquement.','createdAt':'2026-11-26T20:00:00Z','status':'new'})
 page.clock.fast_forward(30000);page.wait_for_function("document.querySelector('.feedback-report')!==null");expect(page.locator('[data-feedback-badge]')).to_have_text('1');assert page.evaluate('notices.length')==1;assert not errors,errors
 (ROOT/'releases/community-realtime-browser.json').write_text(json.dumps({'passed':True,'pollIntervalSeconds':30,'activeReaderUpdated':True,'readerPositionPreserved':True,'privateInboxAutoUpdated':True,'privateBadgeUpdated':True,'pageErrors':errors},indent=2),encoding='utf-8');print('PASS realtime: active reader, automatic cache, private inbox, badge and notification',flush=True);browser.close()
