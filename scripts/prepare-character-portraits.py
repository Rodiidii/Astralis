"""Keep verified original profile assets local; never substitute a different person."""
import concurrent.futures
import io
import json
from pathlib import Path
import requests
from PIL import Image

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'assets/character-portraits'
OUT.mkdir(exist_ok=True)
data=json.loads((ROOT/'artifacts/identity-portrait-candidates.json').read_text(encoding='utf8'))
dest=OUT/'sources.json'
previous=json.loads(dest.read_text(encoding='utf8')) if dest.exists() else {}
records=previous.copy()


def fetch(row):
    world,p=row
    key=world+':'+p['id']
    if key in previous and (ROOT/previous[key]['url'].lstrip('/')).exists():
        return key,previous[key]
    errors=[]
    for url in p['sources']:
        if not url.startswith('https://'):
            continue
        # Portrait APIs without an ID cannot possibly identify the right person.
        if '/characters//' in url:
            continue
        try:
            r=requests.get(url,timeout=(4,9),headers={'User-Agent':'Mozilla/5.0'})
            r.raise_for_status()
            image=Image.open(io.BytesIO(r.content));image.verify()
            image=Image.open(io.BytesIO(r.content))
            if min(image.size)<64:
                raise ValueError('Icon too small')
            ext={'PNG':'.png','WEBP':'.webp','JPEG':'.jpg'}.get(image.format)
            if not ext:
                raise ValueError('Unsupported original asset')
            file=OUT/(world+'-'+p['id']+ext);file.write_bytes(r.content)
            result={'url':'/assets/character-portraits/'+file.name,'source':url,'name':p['name'],
                    'width':image.width,'height':image.height,'originalBytes':len(r.content)}
            print('PORTRAIT',key,p['name'],flush=True)
            return key,result
        except Exception as error:
            errors.append(str(error)[:100])
    print('UNAVAILABLE',key,p['name'],flush=True)
    return key,{'name':p['name'],'error':'No source could be decoded','attempts':len(errors)}


if __name__=='__main__':
    jobs=[(world,row) for world,rows in data.items() for row in rows]
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        for key,record in pool.map(fetch,jobs):
            records[key]=record
            dest.write_text(json.dumps({k:v for k,v in records.items() if 'url' in v},ensure_ascii=False,indent=2),encoding='utf8')
    good={k:v['url'] for k,v in records.items() if 'url' in v}
    (ROOT/'src/character-portrait-assets.js').write_text('export const CHARACTER_PORTRAITS='+json.dumps(good,ensure_ascii=False,indent=2)+';\n',encoding='utf8')
    (ROOT/'artifacts/character-portrait-audit.json').write_text(json.dumps({'verified':len(good),'total':len(records),'missing':{k:v for k,v in records.items() if 'url' not in v}},ensure_ascii=False,indent=2),encoding='utf8')
    print('Verified original portraits',len(good),'of',len(jobs),flush=True)
