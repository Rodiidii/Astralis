from __future__ import annotations
import hashlib, io, json, re, urllib.parse
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
API='https://sg-public-api-static.hoyoverse.com/content_v2_user/app/113fe6d3b4514cdd/getContentList'
SITE='https://hsr.hoyoverse.com/en-us/character'
CDNS=('https://fastcdn.hoyoverse.com/content-v2/hkrpg/','https://webstatic.hoyoverse.com/upload/op-public/')
HEADERS={'User-Agent':'Mozilla/5.0','Referer':'https://hsr.hoyoverse.com/'}

def norm(s: str) -> str:
    return re.sub(r'[^a-z0-9]+','',s.lower())

def main() -> int:
    cache=ROOT/'assets/card-art/downloads/hsr-official-characters.json'
    if not cache.is_file():
        query=urllib.parse.urlencode({'iPage':1,'iPageSize':999,'sLangKey':'en-us','iChanId':242,'isPreview':0})
        with urlopen(Request(API+'?'+query,headers=HEADERS),timeout=30) as response:
            cache.write_bytes(response.read())
    records=json.loads(cache.read_text(encoding='utf-8')).get('data',{}).get('list',[])
    catalog=json.loads((ROOT/'public/card-catalog.json').read_text(encoding='utf-8'))['cards']
    chars={(r['artSlug'],r['name']) for r in catalog if r.get('game')=='hsr' and r.get('kind')=='character'}
    # Match normalized official website name to a catalog character name; no fuzzy guesses.
    names={norm(name):(slug,name) for slug,name in chars}
    manifest=json.loads((ROOT/'public/card-artworks.json').read_text(encoding='utf-8')).get('artworks',{})
    path=ROOT/'assets/card-art/downloads/sources.json'
    sources=json.loads(path.read_text(encoding='utf-8')) if path.is_file() else []
    known={(r.get('game'),r.get('slug'),r.get('officialAssetUrl')) for r in sources}
    known_urls={r.get('officialAssetUrl') for r in sources if r.get('officialAssetUrl')}
    known_urls.update(r.get('officialAssetUrl') for r in manifest.values() if r.get('officialAssetUrl'))
    added=[]; unmatched=[]; rejected=[]
    for entry in records:
        try: ext=json.loads(entry.get('sExt','{}'))
        except (TypeError,json.JSONDecodeError): continue
        title=ext.get('name') or entry.get('sTitle','')
        match=names.get(norm(title))
        if not match:
            # Some official pages title an alternate form after a separator; only accept a unique exact base name.
            bases={norm(part.strip()) for part in re.split(r'[•★:]',title) if part.strip()}
            matches=[names[b] for b in bases if b in names]
            match=matches[0] if len(set(matches))==1 else None
        slug,name=match if match else ('','')
        if not match:
            unmatched.append(title);continue
        images=ext.get('posterPC') or []
        for image in images:
            url=image.get('url','') if isinstance(image,dict) else ''
            if not url.startswith(CDNS) or url in known_urls or (slug,url) in known: continue
            try:
                with urlopen(Request(url,headers=HEADERS),timeout=30) as response: data=response.read(24*1024*1024+1)
                if len(data)>24*1024*1024: rejected.append({'character':name,'reason':'asset exceeds 24MB'});continue
                with Image.open(io.BytesIO(data)) as original:
                    artwork=ImageOps.exif_transpose(original).convert('RGB')
                    if min(artwork.size)<500: rejected.append({'character':name,'reason':'too small','size':artwork.size});continue
                    artwork.thumbnail((1600,2400),Image.Resampling.LANCZOS)
                    saturation=list(artwork.convert('HSV').getchannel('S').resize((80,80)).get_flattened_data())
                    if saturation and sum(v<=18 for v in saturation)/len(saturation)>=.94 and sum(saturation)/len(saturation)<=12:
                        rejected.append({'character':name,'reason':'monochrome'});continue
                    out=io.BytesIO();artwork.save(out,'WEBP',quality=88,method=5);compressed=out.getvalue()
                local=ROOT/'assets/card-art/downloads'/(hashlib.sha256(data).hexdigest()+'.image')
                if not local.exists():local.write_bytes(compressed)
                row={'game':'hsr','slug':slug,'local':local.relative_to(ROOT).as_posix(),
                     'source':SITE,'officialAssetUrl':url,'title':title,
                     'provenance':'official-hoyoverse','artType':'official-character-poster',
                     'sourceVerifiedBy':'Entrée du personnage sur le site officiel HSR (API officielle content_v2_user); champ posterPC'}
                sources.append(row);known.add((row['game'],slug,url));known_urls.add(url);added.append(name)
            except Exception as exc: rejected.append({'character':name,'reason':str(exc)[:200]})
    path.write_text(json.dumps(sources,ensure_ascii=False,indent=2),encoding='utf-8')
    report={'officialWebsiteEntries':len(records),'newCharacterPosters':len(added),'characters':added,'unmatchedEntries':unmatched,'rejected':rejected}
    (ROOT/'assets/card-art/downloads/hsr-official-character-site-sync.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:v if k not in {'characters','unmatchedEntries','rejected'} else len(v) for k,v in report.items()},ensure_ascii=True))
    return 0

if __name__=='__main__': raise SystemExit(main())
