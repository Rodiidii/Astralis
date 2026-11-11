"""Playwright integration, pixel comparisons, and strict artwork checks.

python tests/cards_browser.py --design-only : independent reference-design checks
python tests/cards_browser.py : also fails for any missing or repeated artwork
Screenshots and pixel diffs are saved under docs/card-visual-tests/.
The original supplied HTML is the baseline, never an auto-approved screenshot.
"""
import argparse, base64, hashlib, io, json, threading, re
from functools import partial
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
  original=context.new_page();original.goto(base+'/docs/reference/cards.html',wait_until='load')
  # The reference's convenience image loader/drag handlers are irrelevant to design.
  original.evaluate("""art=>{document.querySelectorAll('script').forEach(n=>n.remove());document.body.innerHTML='<div id="reference" style="width:354px;height:470px;padding:32px;box-sizing:border-box;margin:0"></div>';document.body.style.cssText='margin:0;padding:40px;background:#111015;font-family:Cabin,system-ui,sans-serif';window.testArt=art;}""",art)
  independent=original.evaluate("""html=>[...new DOMParser().parseFromString(html,'text/html').querySelectorAll('.pv-card')].map(n=>({slug:n.dataset.slug,rarity:n.dataset.rar,html:n.querySelector('.tcg-card').outerHTML}))""",source_html)
  actual=context.new_page();actual.on('pageerror',lambda error:print('Erreur navigateur :',str(error),flush=True));actual.goto(base+'/tests/cards-harness.html',wait_until='domcontentloaded');actual.wait_for_function('window.cardTestReady')
  # Check all supplied examples, including element and name variations.
  for row in reference['cards'][:args.limit]:
   label=f"{row['rarity']}-{row['slug']}"
   original.evaluate("""({html,art})=>{document.querySelector('#reference').innerHTML=html;document.querySelectorAll('#reference img').forEach(img=>{img.removeAttribute('onerror');img.loading='eager';img.src=art;});}""",{'html':next(item['html'] for item in independent if item['slug']==row['slug'] and item['rarity']==row['rarity']),'art':art})
   actual.evaluate("""row=>{document.querySelector('#mount').innerHTML=window.cardTest.cardMarkup({id:'reference',name:row.name,rarity:row.rarity,rarityLabel:row.rarity},{fixture:row.slug+':'+row.rarity,mode:'detail'});}""",row)
   actual.wait_for_function("document.querySelector('astralis-card')?.shadowRoot.querySelector('.tcg-card')")
   actual.evaluate("""art=>{const root=document.querySelector('astralis-card').shadowRoot;root.querySelectorAll('img').forEach(img=>{img.removeAttribute('onerror');img.loading='eager';img.src=art});}""",art)
   for page in [original,actual]:
    page.evaluate("""async()=>{const roots=[document,...[...document.querySelectorAll('astralis-card')].map(n=>n.shadowRoot)];await Promise.all(roots.flatMap(root=>[...root.querySelectorAll('img')]).map(img=>img.decode().catch(()=>{})));await document.fonts.ready;await Promise.all([document.fonts.load('500 16px Cabin'),document.fonts.load('700 16px Cabin'),document.fonts.load('italic 500 16px Cabin'),document.fonts.load('700 16px "Barlow Condensed"')]);}""");freeze(page)
   for time in [0,1600]:
    frame_label=label if time==0 else label+'-t1600'
    for page in [original,actual]:freeze(page,time)
    expected_path=OUT/(frame_label+'-reference.png');actual_path=OUT/(frame_label+'-actual.png')
    expected_bytes=original.screenshot(clip=original.locator('#reference').bounding_box(),animations='allow')
    actual_bytes=actual.screenshot(clip=actual.locator('#mount').bounding_box(),animations='allow')
    a=Image.open(io.BytesIO(expected_bytes)).convert('RGBA');b=Image.open(io.BytesIO(actual_bytes)).convert('RGBA')
    if a.size!=b.size:failures.append(frame_label+': proportions différentes');continue
    difference=ImageChops.difference(a,b);different=any(channel.getbbox() for channel in difference.split()[:3]);results.append({'card':frame_label,'identical':not different})
    pair=Image.new('RGBA',(a.width*2,a.height));pair.paste(a,(0,0));pair.paste(b,(a.width,0));pair.save(OUT/(frame_label+'-comparison.png'))
    if different:difference.save(OUT/(frame_label+'-diff.png'));failures.append(frame_label+': différence de pixels')
    else:(OUT/(frame_label+'-diff.png')).unlink(missing_ok=True)
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
   manifest=json.loads((ROOT/'public/card-artworks.json').read_text(encoding='utf-8'));missing=[c['id'] for c in catalog if c['kind']!='energy' and f"{c['game']}:{c['artSlug']}:{c['rarity']}" not in manifest['assignments']]
   if missing:failures.append(f'{len(missing)} illustrations manquantes (voir docs/AUDIT-CARTES.md)')
  (OUT/('sample-results.json' if args.limit else 'results.json')).write_text(json.dumps({'referenceSha256':reference['sha256'],'comparisons':results,'production':diagnostics,'failures':failures},ensure_ascii=False,indent=2),encoding='utf-8')
  browser.close()
 server.shutdown()
 print('\n'.join(failures) if failures else 'Contrôles réussis.',flush=True)
 return bool(failures)
if __name__=='__main__':raise SystemExit(main())
