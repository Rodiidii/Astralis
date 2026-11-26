"""Verify deployed PHP and UI using one disposable report, then remove only that report."""
import base64,io,json,time,uuid
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];origin='https://astralis.wuaze.com';report={'checkedAt':time.time(),'checks':{},'errors':[]};settings=json.loads((ROOT/'assets/user/owner-services.json').read_text(encoding='utf-8'));owner_key=settings['feedbackKey'];identifier=''
buf=io.BytesIO();Image.new('RGB',(512,512),'#80b8ac').save(buf,format='PNG');image_bytes=buf.getvalue();image='data:image/png;base64,'+base64.b64encode(image_bytes).decode()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=p.chromium.executable_path,args=['--disable-gpu']);public=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block',reduced_motion='reduce');page=public.new_page();page.set_default_timeout(60000);page.on('pageerror',lambda e:report['errors'].append(str(e)))
 try:
  print('LIVE daily desk: opening public site',flush=True);page.goto(origin+'/',wait_until='domcontentloaded',timeout=120000);page.wait_for_selector('.hc-dashboard',timeout=90000);page.locator('#astralis-launch-screen').wait_for(state='detached',timeout=60000);assert page.locator('.app-frame').get_attribute('data-active-game')=='gi';report['checks']['newDashboardAndGenshinDefault']=True
  page.screenshot(path=str(ROOT/'docs/daily-desk-live-desktop.png'))
  print('LIVE daily desk: automatic published guide receipt',flush=True);page.wait_for_function("Object.keys(JSON.parse(localStorage.getItem('astralis:character-sheets:seen-versions:v1')||'{}')).length>0",timeout=90000);report['checks']['automaticPublishedGuideReceived']=True
  page.locator('.side-rail [data-nav=feedback]').evaluate('e=>e.click()');page.wait_for_selector('[data-feedback-form]');title='Vérification automatique '+uuid.uuid4().hex[:8];page.locator('[name=title]').fill(title);page.locator('[data-feedback-form] [name=description]').fill('Vérification du formulaire public, de la capture privée et de la réception réservée au créateur. Ce message sera supprimé par le test.');page.locator('[name=category]').select_option('display');page.locator('[data-feedback-image]').set_input_files({'name':'verification.png','mimeType':'image/png','buffer':image_bytes});page.locator('[data-feedback-form] [type=submit]').click();expect(page.locator('[data-feedback-message]')).to_contain_text('bien été enregistré',timeout=60000);report['checks']['realFeedbackFormSubmission']=True;print('LIVE: public report received',flush=True)
  forbidden=page.evaluate("async()=>({status:(await fetch('/api/feedback/inbox')).status})");assert forbidden['status']==403;report['checks']['visitorCannotReadInbox']=True
  print('LIVE: verify creator-only inbox',flush=True);owner=browser.new_context(service_workers='block');creator=owner.new_page();creator.goto(origin+'/',wait_until='domcontentloaded',timeout=120000);creator.wait_for_selector('.hc-dashboard',timeout=90000)
  login=creator.evaluate("async key=>{const r=await fetch('/api/feedback/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});return {status:r.status,data:await r.json()}}",owner_key);assert login['status']==200,login;owner_key=''
  rows=creator.evaluate("async()=>{const r=await fetch('/api/feedback/inbox');return await r.json()}");found=next(r for r in rows['reports'] if r['title']==title);identifier=found['id'];assert found['hasImage'] and 'image' not in found;report['checks']['creatorReceivesPrivateReport']=True;print('LIVE: creator inbox received report',flush=True)
  for path in ['/api/.astralis-private/feedback/report-'+identifier+'.json','/api/.astralis-private/feedback/image-'+identifier+'.txt','/api/owner.php']:
   status=page.evaluate('async path=>(await fetch(path)).status',path);assert status in [403,404],(path,status)
  report['checks']['directPrivateFilesBlocked']=True
  details=creator.evaluate("async id=>{const r=await fetch('/api/feedback/item?id='+id);return await r.json()}",identifier);assert details['report']['image']==image;report['checks']['privateAttachmentMatches']=True
  update=creator.evaluate("async id=>{const r=await fetch('/api/feedback/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status:'resolved'})});return r.status}",identifier);assert update==200
  icon=page.evaluate("async image=>{const r=await fetch('/api/profile-icon',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image})});return {status:r.status,data:await r.json()}}",image);assert icon['status']==200,icon
  manifest=page.evaluate("async url=>await fetch(url).then(r=>r.json())",icon['data']['manifestUrl']);assert manifest['icons'][0]['src']==icon['data']['iconUrl'];report['checks']['hostedProfileIconAndManifest']=True
  page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.screenshot(path=str(ROOT/'docs/daily-desk-live-feedback-mobile.png'));report['checks']['mobileFeedbackLayout']=True
  assert not report['errors'],report['errors'];report['passed']=True;print('PASS live dashboard, automatic guide, actual feedback form, private inbox and image, hosted profile icon and mobile',flush=True)
 finally:
  if identifier:
   try:
    result=creator.evaluate("async id=>{const r=await fetch('/api/feedback/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});return r.status}",identifier);report['testReportDeleted']=result==200
   except Exception:report['testReportDeleted']=False
  (ROOT/'releases/InfinityFree/daily-desk-live.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');browser.close();owner_key=''
