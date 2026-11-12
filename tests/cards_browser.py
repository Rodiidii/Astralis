"""Playwright integration, pixel comparisons, and strict artwork checks.

python tests/cards_browser.py --design-only : independent reference-design checks
python tests/cards_browser.py : also audits the entire catalog; fails for missing art, forbidden repeats, restricted splash usage, broken files, or overflowing text
Screenshots and pixel diffs are saved under docs/card-visual-tests/.
The original supplied HTML is the baseline, never an auto-approved screenshot.
"""
import argparse, base64, hashlib, io, json, threading, re
from functools import partial
from collections import Counter
from datetime import datetime
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'docs/card-visual-tests'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 def handle_error(self,*args):pass
def freeze(page,time=0):
 page.evaluate("""time => {for (const animation of document.getAnimations({subtree:true})) {animation.pause();animation.currentTime=time;} for(const host of document.querySelectorAll('astralis-card'))for(const animation of host.shadowRoot.querySelector('.tcg-card').getAnimations({subtree:true})){animation.pause();animation.currentTime=time;}}""",time)
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--design-only',action='store_true');parser.add_argument('--limit',type=int);args=parser.parse_args();OUT.mkdir(parents=True,exist_ok=True)
 captures=OUT/('run-'+datetime.now().strftime('%Y%m%d-%H%M%S'));captures.mkdir(parents=True,exist_ok=False)
 failures=[];results=[]
 source_html=(ROOT/'docs/reference/cards.html').read_text(encoding='utf-8')
 reference_head='<!doctype html><html><head>'+''.join(re.findall(r'<style[^>]*>[\s\S]*?</style>',source_html))+'<link rel="stylesheet" href="/assets/card-design/fonts.css"></head><body></body></html>'
 reference=json.loads((ROOT/'assets/card-design/reference.json').read_text(encoding='utf-8'))
 assert hashlib.sha256((ROOT/'docs/reference/cards.html').read_bytes()).hexdigest()==reference['sha256'],'La référence fournie a changé.'
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 # Deterministic image content isolates frame, proportion, text, and effect fidelity.
 image=Image.new('RGB',(440,616));image.putdata([(x%256,y%256,(x+y)%256) for y in range(616) for x in range(440)])
 buffer=io.BytesIO();image.save(buffer,'PNG');art='data:image/png;base64,'+base64.b64encode(buffer.getvalue()).decode()
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True);context=browser.new_context(viewport={'width':1440,'height':1100},device_scale_factor=1,service_workers='block')
  def route(request):
   if request.request.url==base+'/docs/reference/cards.html':request.fulfill(body=reference_head,content_type='text/html')
   elif not request.request.url.startswith(base):request.abort()
   elif '/api/' in request.request.url:request.fulfill(json={})
   elif request.request.url.startswith(base+'/data/'):request.fulfill(json={})
   else:request.continue_()
  context.route('**/*',route)
  original=context.new_page();original.add_init_script('Math.random=()=>0.5');original.goto(base+'/docs/reference/cards.html',wait_until='load')
  # The reference's convenience image loader/drag handlers are irrelevant to design.
  original.evaluate("""art=>{document.querySelectorAll('script').forEach(n=>n.remove());document.body.innerHTML='<div id="reference" style="width:354px;height:470px;padding:32px;box-sizing:border-box;margin:0"></div>';document.body.style.cssText='margin:0;padding:40px;background:#111015;font-family:Cabin,system-ui,sans-serif';window.testArt=art;}""",art)
  independent=original.evaluate("""html=>[...new DOMParser().parseFromString(html,'text/html').querySelectorAll('.pv-card')].map(n=>({slug:n.dataset.slug,rarity:n.dataset.rar,html:n.querySelector('.tcg-card').outerHTML,rarityLabel:n.querySelector('.tcg-card__foot span:first-child')?.textContent.trim(),number:n.querySelector('.tcg-card__foot span:last-child')?.textContent.trim()}))""",source_html)
  actual=context.new_page();actual.add_init_script('Math.random=()=>0.5');actual.on('pageerror',lambda error:print('Erreur navigateur :',str(error),flush=True));actual.goto(base+'/tests/cards-harness.html',wait_until='domcontentloaded');actual.wait_for_function('window.cardTestReady')
  # Check all supplied examples, including element and name variations.
  for row in reference['cards'][:args.limit]:
   label=f"{row['rarity']}-{row['slug']}"
   original.evaluate("""({html,art})=>{document.querySelector('#reference').innerHTML=html;document.querySelectorAll('#reference img').forEach(img=>{img.removeAttribute('onerror');img.loading='eager';img.src=art;});}""",{'html':next(item['html'] for item in independent if item['slug']==row['slug'] and item['rarity']==row['rarity']),'art':art})
   referenceCard=next(item for item in independent if item['slug']==row['slug'] and item['rarity']==row['rarity'])
   actual.evaluate("""({row,reference})=>{document.querySelector('#mount').innerHTML=window.cardTest.cardMarkup({id:'reference',name:row.name,rarity:row.rarity,rarityLabel:reference.rarityLabel,number:reference.number},{fixture:row.slug+':'+row.rarity,mode:'detail'});}""",{'row':row,'reference':referenceCard})
   actual.wait_for_function("document.querySelector('astralis-card')?.shadowRoot.querySelector('.tcg-card')")
   actual.evaluate("""art=>{const root=document.querySelector('astralis-card').shadowRoot;root.querySelectorAll('img').forEach(img=>{img.removeAttribute('onerror');img.loading='eager';img.src=art});}""",art)
   for page in [original,actual]:
    page.evaluate("""async()=>{const roots=[document,...[...document.querySelectorAll('astralis-card')].map(n=>n.shadowRoot)];await Promise.all(roots.flatMap(root=>[...root.querySelectorAll('img')]).map(img=>img.decode().catch(()=>{})));await document.fonts.ready;await Promise.all([document.fonts.load('500 16px Cabin'),document.fonts.load('700 16px Cabin'),document.fonts.load('italic 500 16px Cabin'),document.fonts.load('700 16px "Barlow Condensed"')]);}""");freeze(page)
   for time in [0,1600]:
    frame_label=label if time==0 else label+'-t1600'
    file_label=re.sub(r'[^A-Za-z0-9._-]+','-',frame_label).strip('.-')
    for page in [original,actual]:freeze(page,time)
    expected_bytes=original.screenshot(clip=original.locator('#reference').bounding_box(),animations='allow')
    actual_bytes=actual.screenshot(clip=actual.locator('#mount').bounding_box(),animations='allow')
    a=Image.open(io.BytesIO(expected_bytes)).convert('RGBA');b=Image.open(io.BytesIO(actual_bytes)).convert('RGBA')
    if a.size!=b.size:failures.append(frame_label+': proportions différentes');continue
    difference=ImageChops.difference(a,b);different=any(channel.getbbox() for channel in difference.split()[:3]);results.append({'card':frame_label,'identical':not different})
    pair=Image.new('RGBA',(a.width*2,a.height));pair.paste(a,(0,0));pair.paste(b,(a.width,0));pair.save(captures/(file_label+'-comparison.png'))
    if different:difference.save(captures/(file_label+'-diff.png'));failures.append(frame_label+': différence de pixels')
  print(f"Référence : {len(results)} captures comparées, {sum(not r['identical'] for r in results)} différences.",flush=True)
  # Production rendering, 100+ cards, real names and real cached kits.
  catalog=json.loads((ROOT/'public/card-catalog.json').read_text(encoding='utf-8'))['cards']
  sample=[*{card['rarity']:card for card in catalog}.values(),*sorted(catalog,key=lambda card:len(card['name']),reverse=True)[:15],*catalog[::max(1,len(catalog)//110)]]
  actual.evaluate("""cards=>{document.querySelector('#mount').innerHTML=cards.map(card=>window.cardTest.cardMarkup(card,{mode:'static'})).join('');}""",sample)
  actual.wait_for_function("[...document.querySelectorAll('astralis-card')].every(n=>n.shadowRoot.querySelector('.tcg-card'))",timeout=20000)
  actual.evaluate("window.scrollTo(0,0)");actual.wait_for_timeout(500)
  diagnostics=actual.evaluate('window.cardTest.cardDiagnostics()')
  if diagnostics['broken']:failures.append('Images cassées')
  if diagnostics['duplicates']:failures.append('Images dupliquées')
  if diagnostics['overflow']:failures.append(f"Textes débordants : {len(diagnostics['overflow'])}")
  if any(row['error'] for row in diagnostics['rows']):failures.append('Erreur de rendu')
  # Audit every catalog entry in bounded batches: cardMarkup retains a capped
  # payload cache, so mounting all 1,400+ cards at once would hide early rows.
  full_rows=[]
  for start in range(0,len(catalog),120):
   batch=catalog[start:start+120]
   actual.evaluate("cards=>{document.querySelector('#mount').innerHTML=cards.map(card=>window.cardTest.cardMarkup(card,{mode:'static'})).join('');}",batch)
   actual.wait_for_function("[...document.querySelectorAll('astralis-card')].every(n=>n.shadowRoot.querySelector('.tcg-card'))",timeout=30000)
   full_rows.extend(actual.evaluate('window.cardTest.cardDiagnostics().rows'))
  by_art={}
  for row in full_rows:
   if row['artwork']:by_art.setdefault(row['artwork'],{})[row['id']]=row
  full_duplicates=[]
  for artwork,entries in by_art.items():
   rows=list(entries.values())
   if len(rows)<2:continue
   record={'artwork':artwork,'identity':rows[0]['identity'],'ids':[row['id'] for row in rows]}
   full_duplicates.append(record)
  if full_duplicates:failures.append(f"Images dupliquées dans le catalogue complet : {len(full_duplicates)}")
  forbidden_splashes=[row for row in full_rows if row['rarity'] in {'full','group','secret','gold','legend','astral','eternal','aeon'} and '/assets/genshin/splashes/' in row['source'].lower()]
  if forbidden_splashes:failures.append(f"Splash arts interdits au-dessus de Full Art : {len(forbidden_splashes)}")
  art_manifest=json.loads((ROOT/'public/card-artworks.json').read_text(encoding='utf-8')).get('artworks',{})
  no_promo_rarities={'full','group','secret','gold','legend','astral','eternal','aeon'}
  forbidden_promo=[]
  for row in full_rows:
   source=row['source'].split('?',1)[0].lstrip('/')
   record=art_manifest.get(source,{})
   forbidden=(record.get('artType') in {'official-character-poster','official-character-promo','splash-art'} or re.search(r'\b(?:splash(?:\s*art)?|character\s*poster|character\s*promo)\b',record.get('title',''),re.I))
   if row['rarity'] in no_promo_rarities and forbidden:forbidden_promo.append(row)
  if forbidden_promo:failures.append(f"Affiches ou images promotionnelles interdites pour Full Art+ : {len(forbidden_promo)}")
  fallback_doc=json.loads((ROOT/'public/card-low-rarity-fallbacks.json').read_text(encoding='utf-8'))
  fallback_rows=list(fallback_doc.get('fallbacks',{}).values())
  fallback_hashes=[row['pixelSha256'] for row in fallback_rows]
  fallback_identities=Counter(row['identity'] for row in fallback_rows)
  if len(fallback_hashes)!=len(set(fallback_hashes)):failures.append('Doublons exacts dans les images de repli')
  if any(row['rarity'] not in {'common','super','rare','epic'} or not row['src'].startswith('/assets/genshin/splashes/') for row in fallback_rows):failures.append('Image de repli autorisée sur une mauvaise rareté ou provenant d’une mauvaise source')
  if any(count>1 for count in fallback_identities.values()):failures.append('Plusieurs cartes d’une même identité réutilisent un splash art')
  source_artworks=json.loads((ROOT/'public/card-artworks.json').read_text(encoding='utf-8')).get('artworks',{})
  known_hashes={row.get('sourcePixelSha256') or row.get('pixelSha256') for row in source_artworks.values()}
  if known_hashes.intersection(fallback_hashes):failures.append('Image de repli identique à une illustration déjà attribuée')
  known_dhashes=[int(row['dhash'],16) for row in source_artworks.values() if row.get('dhash')]
  if any(any((known^int(row['dhash'],16)).bit_count()<=3 for known in known_dhashes) for row in fallback_rows):failures.append('Image de repli perceptuellement trop proche d’une illustration attribuée')
  full_broken=[row for row in full_rows if row['broken']]
  full_overflow=[row for row in full_rows if row['overflow']]
  if full_broken:failures.append(f"Images cassées dans le catalogue complet : {len(full_broken)}")
  if full_overflow:failures.append(f"Textes débordants dans le catalogue complet : {len(full_overflow)}")
  runtime_audit={'cards':len(full_rows),'duplicates':full_duplicates,'withoutArtworkCandidate':[row['id'] for row in full_rows if not row['artwork']]}
  runtime_audit['forbiddenSplashCards']=[row['id'] for row in forbidden_splashes]
  runtime_audit['forbiddenPromoCards']=[row['id'] for row in forbidden_promo]
  runtime_audit['lowRarityFallbacks']=[row['cardId'] for row in fallback_rows]
  runtime_audit['brokenImages']=[row['id'] for row in full_broken]
  runtime_audit['textOverflow']=[{'id':row['id'],'text':row['overflow']} for row in full_overflow]
  print(f"Audit complet : {len(full_rows)} cartes, {len(full_duplicates)} doublon(s) (aucune exception), {len(forbidden_splashes)} splash art interdit(s), {len(full_broken)} image(s) cassée(s), {len(full_overflow)} débordement(s), {len(runtime_audit['withoutArtworkCandidate'])} emplacements sans source admissible.",flush=True)
  actual.evaluate("cards=>{document.querySelector('#mount').innerHTML=cards.map(card=>window.cardTest.cardMarkup(card,{mode:'static'})).join('');}",sample)
  actual.wait_for_function("[...document.querySelectorAll('astralis-card')].every(n=>n.shadowRoot.querySelector('.tcg-card'))",timeout=30000)
  animated=actual.evaluate("""()=>[...document.querySelectorAll('astralis-card')].some(host=>host.shadowRoot.querySelector('.tcg-card').getAnimations({subtree:true}).some(a=>a.playState==='running'))""")
  if animated:failures.append('Effets animés dans la grille statique')
  # Effects are enabled during consultation, and the 3D tilt resets on leave.
  actual.evaluate("""card=>{document.querySelector('#mount').innerHTML=window.cardTest.cardMarkup(card,{mode:'detail'});}""",next(card for card in catalog if card['rarity']=='gold'))
  actual.wait_for_function("document.querySelector('astralis-card')?.shadowRoot.querySelector('.tcg-card')")
  actual.wait_for_timeout(100)
  assert actual.evaluate("""()=>document.querySelector('astralis-card').shadowRoot.querySelector('.tcg-card').getAnimations({subtree:true}).some(animation=>animation.playState==='running')"""),'Effets absents en consultation'
  actual.locator('astralis-card').hover();actual.mouse.move(150,180);actual.wait_for_timeout(80)
  actual.mouse.move(1300,20);actual.wait_for_timeout(80)
  if actual.locator('astralis-card').get_attribute('interacting') is not None:failures.append('Inclinaison non réinitialisée')
  actual.emulate_media(reduced_motion='reduce')
  if actual.evaluate("""()=>document.querySelector('astralis-card').shadowRoot.querySelector('.tcg-card').getAnimations({subtree:true}).some(a=>a.playState==='running')"""):failures.append('Effets actifs malgré la réduction des animations')
  actual.emulate_media(reduced_motion='no-preference')
  # Browser failure fallback: zero broken images even if a manifest image vanishes.
  actual.route('**/assets/card-art/**',lambda route:route.abort())
  actual.evaluate("""card=>{document.querySelector('#mount').innerHTML=cardTest.cardMarkup({...card,id:'forced-missing'},{mode:'static',customArt:'/assets/card-art/forced-missing.webp'});}""",sample[0])
  actual.wait_for_function("document.querySelector('astralis-card')?.dataset.artStatus==='missing'")
  fallback=actual.evaluate("""()=>({diagnostics:cardTest.cardDiagnostics(),placeholder:document.querySelector('astralis-card').shadowRoot.querySelector('.card-art-placeholder')?.textContent,rect:document.querySelector('astralis-card').getBoundingClientRect().height})""")
  assert not fallback['diagnostics']['broken'] and fallback['placeholder'] and fallback['rect']>0
  actual.evaluate("""({card,art})=>{document.querySelector('#mount').innerHTML=['duplicate-a','duplicate-b'].map(id=>cardTest.cardMarkup({...card,id},{mode:'static',customArt:art})).join('');}""",{'card':sample[0],'art':art})
  actual.wait_for_function("[...document.querySelectorAll('astralis-card')].every(node=>node.dataset.artStatus==='ready')")
  assert len(actual.evaluate('cardTest.cardDiagnostics().duplicates'))==1,'Le détecteur doit signaler deux cartes utilisant la même image fournie'
  print('Production :',len(diagnostics['rows']),'cartes,',len(diagnostics['overflow']),'débordements,',len(diagnostics['broken']),'images cassées.',flush=True)
  if not args.design_only:
   missing=runtime_audit['withoutArtworkCandidate']
   if missing:failures.append(f'{len(missing)} illustrations manquantes au rendu (voir docs/AUDIT-CARTES.md)')
  (OUT/('sample-results.json' if args.limit else 'results.json')).write_text(json.dumps({'referenceSha256':reference['sha256'],'comparisons':results,'comparisonCaptures':str(captures.relative_to(ROOT)),'production':diagnostics,'runtimeArtworkAudit':runtime_audit,'failures':failures},ensure_ascii=False,indent=2),encoding='utf-8')
  browser.close()
 server.shutdown()
 print('\n'.join(failures) if failures else 'Contrôles réussis.',flush=True)
 return bool(failures)
if __name__=='__main__':raise SystemExit(main())
