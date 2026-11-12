"""Inventory, import and audit real card artworks. Never substitutes icons; splash art is limited to Full Art.

Run node scripts/export_card_catalog.mjs first. Official artwork candidates come from publisher feeds
and reviewed records in assets/card-art/sources.json. Unknown provenance stays unassigned.
--strict exits nonzero for missing/duplicate files.
Pillow is required for decoding, pixel fingerprints and high-quality WebP conversion.
"""
from __future__ import annotations
import argparse, hashlib, io, json, re, unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import unquote
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parent.parent
QUALITY_EXCLUSIONS_FILE=ROOT/'assets/card-art/quality-exclusions.json'
QUALITY_EXCLUSIONS=json.loads(QUALITY_EXCLUSIONS_FILE.read_text(encoding='utf-8')) if QUALITY_EXCLUSIONS_FILE.exists() else []
QUALITY_EXCLUDED_URLS={item.get('officialAssetUrl') for item in QUALITY_EXCLUSIONS if item.get('officialAssetUrl')}
WW_MIN_ARTWORK_ASPECT=0.62
REJECT=re.compile(r'fan.?art|contest|splash|gacha|icon|thumb|avatar|character.details|screenshot|cutscene|chibi|sticker|shorts|game\.png|portrait|namecard|render|model|teaser|resonator\s+review|eye\.',re.I)
MONOCHROME_ANNIVERSARY_SLUGS={'black-swan','blade','bronya','himeko','huohuo','jingliu','kafka','march-7th-evernight','seele','sparkle'}
MONOCHROME_ART_FILES={
 'assets/card-art/hsr/acheron-2.webp',
 'assets/card-art/hsr/ruan-mei-1.webp',
 'assets/card-art/hsr/kafka-1.webp',
 'assets/card-art/hsr/kafka-2.webp',
 'assets/card-art/hsr/sparkle-1.webp',
 'assets/card-art/hsr/sparkle-2.webp',
 'assets/card-art/hsr/sparkle-sparxie-1.webp',
 'assets/card-art/hsr/ruan-mei-3.webp',
 'assets/fanarts/acheron-legend.png',
 'assets/fanarts/ruan-mei-full.png',
 'assets/fanarts/ruan-mei-gold.png',
 'assets/fanarts/sparkle-sparxie-group.png',
}
def reject_art(row):
 title=row.get('title','')
 if REJECT.search(title):return True
 if row.get('officialAssetUrl') in QUALITY_EXCLUDED_URLS:return True
 # Kuro's very tall 9:16 social posters and editorial sheets are not suitable card art.
 # Keep landscape/square art and moderate portrait crops; reject the long poster format.
 if row.get('game')=='ww' and row.get('width') and row.get('height') and row['width']/row['height']<WW_MIN_ARTWORK_ASPECT:return True
 local=row.get('local','').replace('\\','/')
 if local in MONOCHROME_ART_FILES:return True
 return row.get('game')=='hsr' and row.get('slug') in MONOCHROME_ANNIVERSARY_SLUGS and 'korean 1st anniversary artwork' in title.lower()
def is_monochrome(path):
 """Reject genuinely grayscale drawings while allowing muted/color-washed art."""
 try:
  with Image.open(path) as source:
   image=ImageOps.exif_transpose(source)
   image.thumbnail((80,80),Image.Resampling.BILINEAR)
   hsv=image.convert('RGB').convert('HSV')
   saturation=hsv.getchannel('S')
   values=list(saturation.get_flattened_data())
   if not values:return False
   low=sum(value<=18 for value in values)/len(values)
   average=sum(values)/len(values)
   return low>=0.94 and average<=12
 except Exception:
  return False
def slug(text):return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFD',text).encode('ascii','ignore').decode().lower()).strip('-')
def sha(data):return hashlib.sha256(data).hexdigest()
def decoded_pixel_sha(path):
 with Image.open(path) as source:
  image=ImageOps.exif_transpose(source).convert('RGB')
  image.thumbnail((1600,2400),Image.Resampling.LANCZOS)
  return sha(f'{image.width}x{image.height}'.encode()+image.tobytes())
def decoded_dhash(path):
 with Image.open(path) as source:
  image=ImageOps.exif_transpose(source).convert('RGB')
  image.thumbnail((1600,2400),Image.Resampling.LANCZOS)
  small=image.resize((9,8)).convert('L');values=list(small.get_flattened_data())
  return f"{sum((values[y*9+x]>values[y*9+x+1])<<(y*8+x) for y in range(8) for x in range(8)):016x}"
def source_key(url):return unquote(url or '').rstrip('/').lower()
def near_same_source(source,dhash,artworks):
 value=int(dhash,16)
 return next((item for item in artworks.values() if (int(item.get('dhash','0'),16)^value).bit_count()<=3),None)
def forbidden_above_full(record):
 art_type=record.get('artType','')
 title=record.get('title','')
 return art_type in {'official-character-poster','official-character-promo','splash-art'} or bool(re.search(r'\b(?:splash(?:\s*art)?|character\s*poster|character\s*promo)\b',title,re.I))
def read_json(path):return json.loads(path.read_text(encoding='utf-8'))
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--fetch',action='store_true');parser.add_argument('--fetch-equipment',action='store_true');parser.add_argument('--incremental',action='store_true');parser.add_argument('--strict',action='store_true');args=parser.parse_args()
 catalog=read_json(ROOT/'public/card-catalog.json')['cards']
 source_rows=[];rejected=[];searches=[]
 downloaded_sources=ROOT/'assets/card-art/downloads/sources.json'
 if downloaded_sources.exists():source_rows.extend(row for row in read_json(downloaded_sources) if row.get('provenance') in {'official-hoyoverse','official-kuro'})
 source_rows=[row for row in source_rows if not reject_art(row)]
 # Optional explicitly supplied, reviewed artwork records. Unknown files never auto-qualify.
 supplied=ROOT/'assets/card-art/sources.json'
 if supplied.exists():
  for row in read_json(supplied):
   official=row.get('provenance') in {'official-hoyoverse','official-kuro'}
   if official:source_rows.append(row)
 searches=[{'game':row.get('game'),'slug':row.get('slug'),'source':row.get('source'),'provenance':row.get('provenance')} for row in source_rows]
 manifest_file=ROOT/'public/card-artworks.json'
 existing_manifest=read_json(manifest_file) if manifest_file.exists() else {}
 existing_sources={row['source'] for row in existing_manifest.get('artworks',{}).values()}
 if args.fetch or args.fetch_equipment:
  raise SystemExit('La collecte officielle est gérée par sync_official_art_sources.py et les sources vérifiées Kuro; aucune archive communautaire n’est interrogée.')
 output=ROOT/'assets/card-art';output.mkdir(parents=True,exist_ok=True)
 # The canonical files remain auditable when the disposable download cache is gone.
 previous=existing_manifest
 previous_audit=read_json(ROOT/'docs/card-audit.json') if (ROOT/'docs/card-audit.json').exists() else {}
 artworks=previous.get('artworks',{});pools=defaultdict(list,{tuple(key.split(':',1)):value[:] for key,value in previous.get('ASTRALIS_CARD_ARTWORKS',{}).items()});pixels={};duplicates=previous_audit.get('duplicateCandidates',[]);low=previous_audit.get('lowResolution',[])
 # Older manually reviewed records may predate pixel fingerprints. Rebuild them
 # from the checked-in image so the audit remains usable after hand additions.
 for artwork in artworks.values():
  path=ROOT/artwork.get('local','')
  if path.is_file():
   try:
    pixel_hash=decoded_pixel_sha(path)
    artwork.setdefault('pixelSha256',pixel_hash)
    artwork.setdefault('sourcePixelSha256',pixel_hash)
    artwork.setdefault('dhash',decoded_dhash(path))
    pixels[artwork['sourcePixelSha256']]=artwork.get('local','')
   except Exception:pass
 rejected=previous_audit.get('rejected',[])+rejected
 for src,artwork in list(artworks.items()):
  path=(ROOT/src).resolve()
  if not path.is_relative_to((ROOT/'assets/card-art').resolve()) or not path.is_file() or sha(path.read_bytes())!=artwork['sha256']:
   rejected.append({'file':src,'reason':'Fichier canonique absent ou empreinte modifiée'})
   del artworks[src]
   for pool in pools.values():
    if src in pool:pool.remove(src)
  # Existing canonical assets already passed the expensive pixel/color review when
  # first imported. Re-evaluate metadata rules here; reserve decoding for new imports.
  elif reject_art(artwork):
   rejected.append({'file':src,'reason':'Illustration en noir et blanc ou format exclu par les critères visuels'})
   del artworks[src]
   for pool in pools.values():
    if src in pool:pool.remove(src)
 pixels={row.get('sourcePixelSha256',row['pixelSha256']):row['local'] for row in artworks.values()}
 valid_artwork_paths=set(artworks)
 for key in list(pools):
  pools[key]=[src for src in pools[key] if src in valid_artwork_paths]
  if not pools[key]:del pools[key]
 known={(row['game'],row['slug'],row['source'],row['local']) for row in artworks.values()}
 source_rows=sorted({(row['game'],row['slug'],row['source'],row['local']):row for row in source_rows}.values(),key=lambda row:(row['game'],row['slug'],row['source'],row['local']))
 for row in source_rows:
  if (row['game'],row['slug'],row['source'],row['local']) in known:continue
  path=ROOT/row['local']
  if not path.is_file():continue
  try:
   if reject_art(row) or is_monochrome(path):
    rejected.append({'file':row['local'],'reason':'Illustration en noir et blanc ou format exclu par les critères visuels','source':row.get('source','')});continue
   with Image.open(path) as original:
    image=ImageOps.exif_transpose(original).convert('RGB')
    image.thumbnail((1600,2400),Image.Resampling.LANCZOS)
    width,height=image.size
    if row.get('game')=='ww' and width/height<WW_MIN_ARTWORK_ASPECT:
     rejected.append({'file':row['local'],'reason':'Visuel Wuwa au format portrait très allongé (affiche 9:16/fiche éditoriale), pas une illustration de carte','source':row.get('source','')});continue
    if min(width,height)<500:low.append({'file':row['local'],'size':[width,height]});continue
    pixel_hash=sha(f'{width}x{height}'.encode()+image.tobytes())
    small=image.resize((9,8)).convert('L');values=list(small.get_flattened_data());dhash=sum((values[y*9+x]>values[y*9+x+1])<<(y*8+x) for y in range(8) for x in range(8))
    if pixel_hash in pixels:
     duplicates.append({'file':row['local'],'sameAs':pixels[pixel_hash]});continue
    near_duplicate=near_same_source(row['source'],f'{dhash:016x}',artworks)
    if near_duplicate:
     duplicates.append({'file':row['local'],'sameAs':near_duplicate['src'],'reason':'Empreinte perceptuelle quasi identique; origine éditeur différente ou repost'});continue
    pixels[pixel_hash]=row['local'];key=(row['game'],row['slug']);index=len(pools[key])+1
    target=output/row['game']/f"{row['slug']}-{index}.webp";target.parent.mkdir(parents=True,exist_ok=True)
    image.save(target,'WEBP',quality=89,method=5)
    with Image.open(target) as emitted:pixel_output=sha(f'{width}x{height}'.encode()+emitted.convert('RGB').tobytes())
    record={**row,'src':target.relative_to(ROOT).as_posix(),'sha256':sha(target.read_bytes()),'pixelSha256':pixel_output,'sourcePixelSha256':pixel_hash,'dhash':f'{dhash:016x}','width':width,'height':height,'focal':[50,35],'focalReview':'à vérifier visuellement'}
    artworks[record['src']]=record;pools[key].append(record['src'])
  except Exception as exc:rejected.append({'file':row['local'],'reason':str(exc)})
 assignments={};missing=[];used=set()
 # Prioritize unique/special prints, but never reuse an image for a second card.
 order={'eternal':0,'astral':1,'gold':2,'secret':3,'legend':4,'full':5,'group':6,'aeon':7,'epic':8,'rare':9,'super':10,'common':11,'equipment':12,'energy':13}
 for card in sorted(catalog,key=lambda c:order.get(c['rarity'],99)):
  key=(card['game'],card['artSlug']);image=next((src for src in pools[key] if src not in used and not (forbidden_above_full(artworks.get(src,{})) and card['rarity'] in {'full','secret','gold','legend','group','astral','eternal','aeon'})),None)
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
 games={game:{'cards':sum(card['game']==game for card in catalog),'assigned':sum(key.startswith(game+':') for key in assignments),'missing':sum(row.get('game')==game for row in missing)} for game in sorted({card['game'] for card in catalog})}
 report={'cards':len(catalog),'assigned':len(assignments),'missing':missing,'byGame':games,'duplicateCandidates':duplicates,'nearDuplicates':near,'lowResolution':low,'rejected':rejected,'qualityExclusions':QUALITY_EXCLUSIONS,'searches':searches}
 (ROOT/'public/card-artworks.json').write_text(json.dumps({'schemaVersion':1,'ASTRALIS_CARD_ARTWORKS':dict((f'{g}:{s}',v) for (g,s),v in pools.items()),'artworks':artworks,'assignments':assignments},ensure_ascii=False,indent=2),encoding='utf-8')
 (ROOT/'docs/card-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 counts=Counter(card['rarity'] for card in catalog)
 lines=['# Audit des cartes Astralis','',f"Catalogue : **{len(catalog)} cartes**. Illustrations attribuées sans réutilisation : **{len(assignments)}**. Emplacements à fournir : **{len(missing)}**.",'','La source canonique est `public/card-artworks.json` (`ASTRALIS_CARD_ARTWORKS`), fichiers `assets/card-art/<jeu>/<slug>-<n>.webp`.','Le rendu ne recycle plus une liste d’images en boucle entre raretés. Si une identité n’a qu’une seule image admissible, Astralis peut la réutiliser pour ses variantes et le signale dans `?debug=cards` sous « Exceptions une seule illustration ». Les autres emplacements sans visuel distinct gardent le repli propre et sont listés comme manquants.','', '| Jeu | Cartes | Attribuées | Manquantes |','|---|---:|---:|---:|',*[f"| {game} | {values['cards']} | {values['assigned']} | {values['missing']} |" for game,values in games.items()],
 'Empreintes SHA-256 du fichier et des pixels décodés, dimensions et dHash perceptuel enregistrés. Une illustration ne peut être attribuée qu’à une carte. Seules les illustrations publiées par HoYoverse ou Kuro Games et leurs comptes officiels sont admises; aucun dessin de fan, croquis ou contenu communautaire n’est importé.',
 'Règle de rareté : aucun splash art, poster ou visuel promotionnel de personnage n’est attribué aux cartes au-dessus de Full Art (Secrète, Gold, Légende, Astrale, Astrale éternelle, Aeon), ni aux Groupes. Ces visuels restent réservés aux Full Art.',
 'Les imports officiels sont examinés pour les doublons exacts, les ressemblances perceptuelles et la résolution. Le cadrage central haut reste à valider pour chaque nouvelle image; aucune détection automatique de visage anime n’est prétendue.',
 f"{sum(item.get('game')=='ww' for item in QUALITY_EXCLUSIONS)} visuels Kuro de type guide, fiche de matériaux, panneau de statistiques, vignette « Resonator Review » ou chibi sont écartés par `assets/card-art/quality-exclusions.json`. Les visuels Brant-2/3 sont exclus explicitement; les affiches Wuwa très allongées (ratio largeur/hauteur inférieur à {WW_MIN_ARTWORK_ASPECT:.2f}, dont le format 9:16) sont aussi rejetées automatiquement.",
 '', '## Quantités','', '| Rareté | Cartes |','|---|---:|',*[f'| {key} | {value} |' for key,value in sorted(counts.items())],
 '', '## Images uniques disponibles par personnage','', 'Une seule image retrouvée ne signifie pas qu’aucune autre image officielle n’existe. Les exceptions de rendu observées sont détaillées plus haut; elles sont tolérées uniquement quand l’identité ne dispose réellement que d’une illustration admissible.','',*[f'- {game} / {name} : **une seule image admissible retrouvée**.' for (game,name),pool in sorted(pools.items()) if len(pool)==1],
 '', '## Recherche automatique','',f'{len(searches)} candidats issus de sources éditeur sont inscrits dans le registre local avec leurs URLs et leur provenance. Les collecteurs ne consultent pas de wiki ou galerie communautaire. Les images restent non attribuées si le personnage, la source ou le format ne peuvent pas être vérifiés. Détails dans `docs/card-audit.json`.',
 '', '## Doublons et résolution','',f'{len(duplicates)} fichiers identiques écartés, {len(near)} paires visuellement proches à vérifier, {len(low)} fichiers sous 500 px sur leur petit côté écartés.',
 '', '## Illustrations restant à fournir','', '| Jeu | Carte | Rareté | Fichier attendu (numéro libre) |','|---|---|---|---|',*[f"| {c['game']} | {c['name']} | {c['rarity']} | assets/card-art/{c['game']}/{c['artSlug']}-n.webp |" for c in missing],
 '', '## Ajouter une image','', 'Ajouter une entrée à `assets/card-art/sources.json` avec game, slug, local, source, title et attribution. Seules les provenances `official-hoyoverse` et `official-kuro` sont admises; dessins de fans et reposts communautaires sont exclus.',
 '', '## Reproduire','', 'node scripts/export_card_catalog.mjs, python scripts/sync_official_art_sources.py --games gi hsr, python scripts/sync_official_wuwa_art_sources.py, python scripts/audit_cards.py --incremental, python scripts/audit_cards.py --strict, python scripts/optimize_card_assets.py --apply, python tests/cards_browser.py',
 'Les images officielles sont stockées en WebP qualité 89, limitées à 1600 × 2400 px. Les binaires de téléchargement temporaires sont exclus du dépôt et des versions distribuées; les sources et crédits restent dans le manifeste officiel.',
 '', 'Le contrôle strict et le contrôle Playwright des images échouent tant que la liste des images manquantes n’est pas vide. Le rapport ne transforme pas un emplacement de secours en réussite.',
 '', '## Référence et limites','', '`docs/reference/cards.html` est la copie exacte du fichier fourni. Dix raretés y figurent. Aeon reprend le modèle Légende (classe Aeon déjà présente); Équipement reprend Full Art; Énergie reprend Common sans attaques. Le modèle unique Obsidian reprend la carte Obsidian originale. Aucun modèle inédit absent du fichier n’est présenté comme une correspondance visuelle originale.',
 'Les textes réels viennent de characterDetails()/skillList() et du rendu riche existants. Un kit non publié reste indiqué, sans attaques, coûts, faiblesses ou chiffres inventés. Les groupes reprennent des compétences réelles de leurs membres, sans inventer de kit collectif.'
 ]
 kits_file=ROOT/'public/card-kits.json'
 priority_rarities={'eternal','astral','legend','gold','secret','full'}
 priority_cards=[card for card in catalog if card.get('kind')=='character' and card.get('rarity') in priority_rarities]
 missing_ids={card.get('id') for card in missing}
 lines.extend(['','## Roster demandé','',f"Les raretés prioritaires listées représentent **{len(priority_cards)} cartes personnage** (The Herta compte deux fois car elle figure dans deux raretés). Images attribuées : **{len(priority_cards)-sum(card['id'] in missing_ids for card in priority_cards)}** ; encore manquantes : **{sum(card['id'] in missing_ids for card in priority_cards)}**.",'La section Astrales annonce 21 cartes mais ne nomme que 20 personnages : sept Genshin (alors que la sous-liste en annonce huit), huit HSR et cinq Wuthering Waves. Aucun nom n’a été ajouté par déduction.'])
 for rarity in ['eternal','astral','legend','gold','secret','full']:
  group=[card for card in priority_cards if card['rarity']==rarity]
  outstanding=[card['name'] for card in group if card['id'] in missing_ids]
  lines.append(f"- **{rarity}** : {len(group)-len(outstanding)}/{len(group)} illustrées"+(f" — à fournir : {', '.join(outstanding)}." if outstanding else ' — complet.'))
 if kits_file.exists():
  priority_kit_missing=[key for key in read_json(kits_file)['missing'] if any(key==f"{card['game']}:{card.get('artSlug') or card.get('sourceId')}" for card in priority_cards)]
  lines.extend(['',f"Kits officiels absents pour {len(priority_kit_missing)} des cartes de ce roster (personnages de lore, personnages récents ou variantes sans fiche de combat publiée) :",'',*['- `'+key+'`' for key in priority_kit_missing]])
 provenance_counts=Counter(row.get('provenance','non renseignée') for row in artworks.values())
 lines.extend(['','## Provenance à confirmer','',
  f"{provenance_counts.get('official-wiki-file-title',0)} fichiers ont une archive communautaire comme URL de référence et nécessitent une correspondance avec une publication primaire. {provenance_counts.get('official-hoyoverse',0)} fichiers ont été reliés à une pièce jointe HoYoLAB officielle; {provenance_counts.get('official-kuro',0)} à une publication Kuro officielle. Les anciennes entrées sans URL primaire prouvée restent signalées ici.",
  f"Le contrôle colorimétrique a écarté les images en niveaux de gris détectées. {sum('noir et blanc' in row.get('reason','').lower() for row in rejected)} exclusion(s) noir et blanc sont consignées dans cet audit."])
 kits_file=ROOT/'public/card-kits.json'
 if kits_file.exists():
  kits=read_json(kits_file);lines.extend(['','## Kits de personnages','',f"{len(kits['kits'])} kits réels en cache. Kits non obtenus (dont personnages de lore et Aeons non jouables) :",'',*['- `'+key+'`' for key in kits['missing']]])
 audit_path=ROOT/'docs/AUDIT-CARTES.md'
 if audit_path.exists():
  previous=audit_path.read_text(encoding='utf-8')
  runtime=re.search(r'## Contrôle du rendu complet\n[\s\S]*?(?=\n## Quantités)',previous)
  source_line='La source canonique est `public/card-artworks.json` (`ASTRALIS_CARD_ARTWORKS`), fichiers `assets/card-art/<jeu>/<slug>-<n>.webp`.'
  if runtime and source_line in lines:
   insert=lines.index(source_line)+1;lines[insert:insert]=['',runtime.group(0),'']
 audit_path.write_text('\n'.join(lines)+'\n',encoding='utf-8')
 print(f'{len(catalog)} cartes, {len(assignments)} images attribuées, {len(missing)} manquantes, {len(duplicates)} doublons écartés.')
 return 1 if args.strict and (any(card['kind']!='energy' for card in missing) or near) else 0
if __name__=='__main__':raise SystemExit(main())
