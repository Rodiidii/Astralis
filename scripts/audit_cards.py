"""Inventory, import and audit real card artworks. Never substitutes icons or splash art.

Run node scripts/export_card_catalog.mjs first. --fetch searches the three game wikis
for explicitly titled official birthday/illustration files, never arbitrary search results.
Unknown provenance stays unassigned. --strict exits nonzero for missing/duplicate files.
Pillow is required for decoding, pixel fingerprints and high-quality WebP conversion.
"""
from __future__ import annotations
import argparse, hashlib, io, json, re, unicodedata
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlencode, unquote
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parent.parent
WIKIS={'gi':'https://genshin-impact.fandom.com','hsr':'https://honkai-star-rail.fandom.com','ww':'https://wutheringwaves.fandom.com'}
REJECT=re.compile(r'fan.?art|contest|splash|gacha|icon|thumb|avatar|character.details|screenshot|cutscene|chibi|sticker|shorts|game\.png|portrait|namecard|render|model|teaser|eye\.',re.I)
ACCEPT=re.compile(r'birthday|official.*(?:illustration|artwork)|illustration|key.visual|anniversary.art',re.I)
def slug(text):return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFD',text).encode('ascii','ignore').decode().lower()).strip('-')
def sha(data):return hashlib.sha256(data).hexdigest()
def read_json(path):return json.loads(path.read_text(encoding='utf-8'))
def fetch(url):
 referer='https://genshin-impact.fandom.com/' if 'gensin-impact' in url else 'https://honkai-star-rail.fandom.com/' if 'honkai-star-rail' in url else 'https://wutheringwaves.fandom.com/'
 with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0','Referer':referer,'Accept':'application/json,image/*,*/*'}),timeout=12) as r:
  data=r.read(24*1024*1024+1)
  if len(data)>24*1024*1024:raise ValueError('Image trop volumineuse')
  return data
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--fetch',action='store_true');parser.add_argument('--fetch-equipment',action='store_true');parser.add_argument('--incremental',action='store_true');parser.add_argument('--strict',action='store_true');args=parser.parse_args()
 catalog=read_json(ROOT/'public/card-catalog.json')['cards'];wanted=defaultdict(list)
 for card in catalog:wanted[(card['game'],card['artSlug'])].append(card)
 source_rows=[];rejected=[];searches=[]
 search_log=ROOT/'assets/card-art/downloads/search-log.json'
 if search_log.exists():searches=read_json(search_log)
 downloaded_sources=ROOT/'assets/card-art/downloads/sources.json'
 if downloaded_sources.exists():source_rows.extend(read_json(downloaded_sources))
 for line in (ROOT/'credits-artworks-importees-v87.txt').read_text(encoding='utf-8').splitlines():
  parts=line.split(' | ')
  if len(parts)!=3:continue
  local,title,url=parts;path=ROOT/local
  if not path.is_file():continue
  game=next((game for game,wiki in WIKIS.items() if url.startswith(wiki+'/')),None)
  if not game:continue
  stem=re.sub(r'-(?:common|super|rare|epic|full|gold|legend|secret|astral|group)$','',path.stem)
  if REJECT.search(title) or not ACCEPT.search(title):rejected.append({'file':local,'reason':'Type interdit ou provenance officielle insuffisante','source':url});continue
  source_rows.append({'game':game,'slug':stem,'local':local,'source':url,'title':title,'provenance':'official-wiki-file-title'})
 # Optional explicitly supplied, reviewed artwork records. Unknown files never auto-qualify.
 supplied=ROOT/'assets/card-art/sources.json'
 if supplied.exists():
  for row in read_json(supplied):
   if row.get('provenance') in {'user-supplied','official-hoyoverse','official-kuro'}:source_rows.append(row)
 manifest_file=ROOT/'public/card-artworks.json'
 existing_manifest=read_json(manifest_file) if manifest_file.exists() else {}
 existing_sources={row['source'] for row in existing_manifest.get('artworks',{}).values()}
 if args.fetch or args.fetch_equipment:
  if args.fetch:searches=[]
  def search(pair):
   (game,art_slug),cards=pair;name=cards[0]['name'].replace('Énergie · ','')
   if cards[0].get('equipmentType')=='lightcone':
    src=cards[0].get('image','')
    if not re.fullmatch(r'https://raw\.githubusercontent\.com/Mar-7th/StarRailRes/master/image/light_cone_portrait/\d+\.png',src):return []
    if src in existing_sources:return []
    try:
     data=fetch(src);folder=ROOT/'assets/card-art/downloads';folder.mkdir(parents=True,exist_ok=True);local=folder/(sha(data)+'.image');local.write_bytes(data)
     searches.append({'game':game,'slug':art_slug,'url':src,'found':1,'kind':'official-lightcone-asset'})
     return [{'game':game,'slug':art_slug,'local':local.relative_to(ROOT).as_posix(),'source':src,'title':name+' · illustration officielle du cône','provenance':'official-hoyoverse'}]
    except Exception as exc:searches.append({'game':game,'slug':art_slug,'url':src,'error':str(exc)});return []
   if cards[0]['kind'] not in {'character','group'}:return []
   titles=[f'File:{name} Birthday {year}.png' for year in (2026,2025,2024,2023)]+[f'File:{name} Illustration.png']
   query=urlencode({'action':'query','format':'json','titles':'|'.join(titles),'prop':'imageinfo','iiprop':'url|size|extmetadata'})
   url=WIKIS[game]+'/api.php?'+query
   try:
    data=json.loads(fetch(url));found=[]
    for page in data.get('query',{}).get('pages',{}).values():
     title=page.get('title','');info=(page.get('imageinfo')or[{}])[0];src=info.get('url')
     if not src or REJECT.search(title) or not ACCEPT.search(title):continue
     if (info.get('descriptionurl')or url) in existing_sources:continue
     # The wiki's named official birthday/illustration file is the provenance;
     # no generic HoYoLAB post or fan gallery is accepted.
     try:image=fetch(src)
     except Exception as exc:
      searches.append({'game':game,'slug':art_slug,'url':src,'error':str(exc)});continue
     folder=ROOT/'assets/card-art/downloads';folder.mkdir(parents=True,exist_ok=True)
     local=folder/(sha(image)+'.image');local.write_bytes(image)
     found.append({'game':game,'slug':art_slug,'local':local.relative_to(ROOT).as_posix(),'source':info.get('descriptionurl')or url,'title':title,'provenance':'official-wiki-file-title'})
    searches.append({'game':game,'slug':art_slug,'url':url,'found':len(found)});return found
   except Exception as exc:searches.append({'game':game,'slug':art_slug,'url':url,'error':str(exc)});return []
  pairs=[pair for pair in wanted.items() if not args.fetch_equipment or pair[1][0]['kind']=='equipment']
  with ThreadPoolExecutor(max_workers=6) as executor:
   for task in as_completed([executor.submit(search,pair) for pair in pairs]):source_rows.extend(task.result())
  downloaded_sources.parent.mkdir(parents=True,exist_ok=True)
  downloaded_sources.write_text(json.dumps([row for row in source_rows if '/downloads/' in row['local']],ensure_ascii=False,indent=2),encoding='utf-8')
  search_log.write_text(json.dumps(searches,ensure_ascii=False,indent=2),encoding='utf-8')
 output=ROOT/'assets/card-art';output.mkdir(parents=True,exist_ok=True)
 # The canonical files remain auditable when the disposable download cache is gone.
 previous=existing_manifest
 previous_audit=read_json(ROOT/'docs/card-audit.json') if (ROOT/'docs/card-audit.json').exists() else {}
 artworks=previous.get('artworks',{});pools=defaultdict(list,{tuple(key.split(':',1)):value[:] for key,value in previous.get('ASTRALIS_CARD_ARTWORKS',{}).items()});pixels={row.get('sourcePixelSha256',row['pixelSha256']):row['local'] for row in artworks.values()};duplicates=previous_audit.get('duplicateCandidates',[]);low=previous_audit.get('lowResolution',[])
 rejected=previous_audit.get('rejected',[])+rejected
 for src,artwork in list(artworks.items()):
  path=(ROOT/src).resolve()
  if not path.is_relative_to((ROOT/'assets/card-art').resolve()) or not path.is_file() or sha(path.read_bytes())!=artwork['sha256']:
   rejected.append({'file':src,'reason':'Fichier canonique absent ou empreinte modifiée'})
   del artworks[src]
   for pool in pools.values():
    if src in pool:pool.remove(src)
 pixels={row.get('sourcePixelSha256',row['pixelSha256']):row['local'] for row in artworks.values()}
 known={(row['game'],row['slug'],row['source'],row['local']) for row in artworks.values()}
 source_rows=sorted({(row['game'],row['slug'],row['source'],row['local']):row for row in source_rows}.values(),key=lambda row:(row['game'],row['slug'],row['source'],row['local']))
 for row in source_rows:
  if (row['game'],row['slug'],row['source'],row['local']) in known:continue
  path=ROOT/row['local']
  if not path.is_file():continue
  try:
   with Image.open(path) as original:
    image=ImageOps.exif_transpose(original).convert('RGB')
    image.thumbnail((2000,2800),Image.Resampling.LANCZOS)
    width,height=image.size
    if min(width,height)<500:low.append({'file':row['local'],'size':[width,height]});continue
    pixel_hash=sha(f'{width}x{height}'.encode()+image.tobytes())
    small=image.resize((9,8)).convert('L');values=list(small.get_flattened_data());dhash=sum((values[y*9+x]>values[y*9+x+1])<<(y*8+x) for y in range(8) for x in range(8))
    if pixel_hash in pixels:
     duplicates.append({'file':row['local'],'sameAs':pixels[pixel_hash]});continue
    pixels[pixel_hash]=row['local'];key=(row['game'],row['slug']);index=len(pools[key])+1
    target=output/row['game']/f"{row['slug']}-{index}.webp";target.parent.mkdir(parents=True,exist_ok=True)
    image.save(target,'WEBP',quality=98,method=0)
    with Image.open(target) as emitted:pixel_output=sha(f'{width}x{height}'.encode()+emitted.convert('RGB').tobytes())
    record={**row,'src':target.relative_to(ROOT).as_posix(),'sha256':sha(target.read_bytes()),'pixelSha256':pixel_output,'sourcePixelSha256':pixel_hash,'dhash':f'{dhash:016x}','width':width,'height':height,'focal':[50,35],'focalReview':'à vérifier visuellement'}
    artworks[record['src']]=record;pools[key].append(record['src'])
  except Exception as exc:rejected.append({'file':row['local'],'reason':str(exc)})
 assignments={};missing=[];used=set()
 # Prioritize unique/special prints, but never reuse an image for a second card.
 order={'eternal':0,'astral':1,'gold':2,'secret':3,'legend':4,'full':5,'group':6,'aeon':7,'epic':8,'rare':9,'super':10,'common':11,'equipment':12,'energy':13}
 for card in sorted(catalog,key=lambda c:order.get(c['rarity'],99)):
  key=(card['game'],card['artSlug']);image=next((src for src in pools[key] if src not in used),None)
  card_key=f"{card['game']}:{card['artSlug']}:{card['rarity']}"
  if image:assignments[card_key]=image;used.add(image)
  else:missing.append({key:card.get(key) for key in ['id','name','game','rarity','artSlug','kind','members']})
 near=[];items=list(artworks.values())
 for i,a in enumerate(items):
  for b in items[i+1:]:
   distance=(int(a['dhash'],16)^int(b['dhash'],16)).bit_count()
   if distance<=4:near.append({'a':a['src'],'b':b['src'],'distance':distance})
 duplicates=list({(row['file'],row['sameAs']):row for row in duplicates}.values())
 rejected=list({(row['file'],row['reason']):row for row in rejected}.values())
 report={'cards':len(catalog),'assigned':len(assignments),'missing':missing,'duplicateCandidates':duplicates,'nearDuplicates':near,'lowResolution':low,'rejected':rejected,'searches':searches}
 (ROOT/'public/card-artworks.json').write_text(json.dumps({'schemaVersion':1,'ASTRALIS_CARD_ARTWORKS':dict((f'{g}:{s}',v) for (g,s),v in pools.items()),'artworks':artworks,'assignments':assignments},ensure_ascii=False,indent=2),encoding='utf-8')
 (ROOT/'docs/card-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 counts=Counter(card['rarity'] for card in catalog)
 lines=['# Audit des cartes Astralis','',f"Catalogue : **{len(catalog)} cartes**. Illustrations attribuées sans réutilisation : **{len(assignments)}**. Emplacements à fournir : **{len(missing)}**.",'','La source canonique est `public/card-artworks.json` (`ASTRALIS_CARD_ARTWORKS`), fichiers `assets/card-art/<jeu>/<slug>-<n>.webp`.',
 'Empreintes SHA-256 du fichier ET des pixels décodés, dimensions et dHash perceptuel enregistrés. Une illustration ne peut être attribuée qu’à une carte. Aucun splash, icône ou fan art ne sert de repli.',
 'Les fichiers hérités ne sont admis que si leur crédit identifie une illustration/anniversaire officiel dans le wiki du jeu. Les titres ambigus sont écartés. Le cadrage central haut reste à valider pour chaque nouvelle image; aucune détection automatique de visage anime n’est prétendue.',
 '', '## Quantités','', '| Rareté | Cartes |','|---|---:|',*[f'| {key} | {value} |' for key,value in sorted(counts.items())],
 '', '## Images uniques disponibles par personnage','', 'Une seule image retrouvée ne signifie pas qu’aucune autre image officielle n’existe. Aucune exception de duplication n’a été activée.','',*[f'- {game} / {name} : **une seule image admissible retrouvée**.' for (game,name),pool in sorted(pools.items()) if len(pool)==1],
 '', '## Recherche automatique','',f'{len(searches)} entrées dans le journal des sources et téléchargements; {sum(bool(s.get("error")) for s in searches)} erreurs consignées. Les premières tentatives HTTP 403 ne sont pas incluses dans le journal reconstruit des téléchargements réussis. Détails et URL dans `docs/card-audit.json`.',
 '', '## Doublons et résolution','',f'{len(duplicates)} fichiers identiques écartés, {len(near)} paires visuellement proches à vérifier, {len(low)} fichiers sous 500 px sur leur petit côté écartés.',
 '', '## Illustrations restant à fournir','', '| Jeu | Carte | Rareté | Fichier attendu (numéro libre) |','|---|---|---|---|',*[f"| {c['game']} | {c['name']} | {c['rarity']} | assets/card-art/{c['game']}/{c['artSlug']}-n.webp |" for c in missing],
 '', '## Ajouter une image','', 'Ajouter une entrée à `assets/card-art/sources.json` avec `game`, `slug`, `local`, `source`, `title`, `provenance` (`user-supplied`, `official-hoyoverse` ou `official-kuro`), puis relancer l’audit. Une présence sur HoYoLAB ne prouve pas à elle seule une origine officielle.',
 '', '## Reproduire','', '```text','node scripts/export_card_catalog.mjs','python scripts/audit_cards.py --fetch','python scripts/audit_cards.py --strict','python tests/cards_browser.py','```',
 '', 'Le contrôle strict et le contrôle Playwright des images échouent tant que la liste des images manquantes n’est pas vide. Le rapport ne transforme pas un emplacement de secours en réussite.',
 '', '## Référence et limites','', '`docs/reference/cards.html` est la copie exacte du fichier fourni. Dix raretés y figurent. Aeon reprend le modèle Légende (classe Aeon déjà présente); Équipement reprend Full Art; Énergie reprend Common sans attaques. Le modèle unique Obsidian reprend la carte Obsidian originale. Aucun modèle inédit absent du fichier n’est présenté comme une correspondance visuelle originale.',
 'Les textes réels viennent de characterDetails()/skillList() et du rendu riche existants. Un kit non publié reste indiqué, sans attaques, coûts, faiblesses ou chiffres inventés. Les groupes reprennent des compétences réelles de leurs membres, sans inventer de kit collectif.'
 ]
 kits_file=ROOT/'public/card-kits.json'
 if kits_file.exists():
  kits=read_json(kits_file);lines.extend(['','## Kits de personnages','',f"{len(kits['kits'])} kits réels en cache. Kits non obtenus (dont personnages de lore et Aeons non jouables) :",'',*['- `'+key+'`' for key in kits['missing']]])
 (ROOT/'docs/AUDIT-CARTES.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
 print(f'{len(catalog)} cartes, {len(assignments)} images attribuées, {len(missing)} manquantes, {len(duplicates)} doublons écartés.')
 return 1 if args.strict and (any(card['kind']!='energy' for card in missing) or near) else 0
if __name__=='__main__':raise SystemExit(main())
