"""Cache original game farm-materials icons from explicit catalog filenames, not guessed slugs."""
import concurrent.futures,hashlib,io,json,time
from pathlib import Path
from urllib.request import Request,urlopen
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent

def main():
 ids={'202','104001','104002','104003'}
 for row in json.loads((ROOT/'assets/data/gi-characters.json').read_text(encoding='utf-8')):
  for costs in row.get('costs',{}).values():
   for item in costs:ids.add(str(item['id']))
 for row in json.loads((ROOT/'data/gi-talent-costs.json').read_text(encoding='utf-8')).values():
  for costs in row.get('costs',{}).values():
   for item in costs:ids.add(str(item['id']))
 rows=json.loads((ROOT/'assets/data/gi-materials.json').read_text(encoding='utf-8'))
 catalogs={'materials':[row for row in rows if str(row['id']) in ids]}
 missing_catalog=sorted(ids-{str(row['id']) for row in catalogs['materials']})
 if missing_catalog:raise ValueError('Matériaux absents du catalogue : '+str(missing_catalog))
 names=set()
 for kind,rows in catalogs.items():
  keys=['filename_icon']
  for row in rows:
   for key in keys:
    name=row.get('images',{}).get(key)
    if name and name.startswith('UI_') and all(c.isalnum() or c=='_' for c in name):names.add(name)
 folder=ROOT/'assets/genshin/farm-materials';folder.mkdir(parents=True,exist_ok=True)
 previous={row['filename']:row['url'] for row in json.loads((folder/'sources.json').read_text(encoding='utf-8')).get('files',[])} if (folder/'sources.json').exists() else {}
 def save(name):
  path=folder/(name+'.png');url='https://enka.network/ui/'+name+'.png'
  try:
   if path.exists():data=path.read_bytes();url=previous.get(name,url)
   else:
    failures=[]
    for candidate in [url,'https://gi.yatta.moe/assets/UI/'+name+'.png']:
     try:
      with urlopen(Request(candidate,headers={'User-Agent':'Astralis original material asset maintenance'}),timeout=25) as response:data=response.read()
      url=candidate;break
     except Exception as error:failures.append(str(error))
    else:raise ValueError('; '.join(failures))
   if not data.startswith(b'\x89PNG'):raise ValueError('PNG attendu')
   with Image.open(io.BytesIO(data)) as im:im.verify()
   with Image.open(io.BytesIO(data)) as im:size=list(im.size)
   if min(size)<96:raise ValueError('Résolution insuffisante')
   if not path.exists():temporary=path.with_suffix('.tmp');temporary.write_bytes(data);temporary.replace(path)
   return {'filename':name,'url':url,'path':'./assets/genshin/farm-materials/'+path.name,'sha256':hashlib.sha256(data).hexdigest(),'size':size},None
  except Exception as error:return None,{'filename':name,'url':url,'error':str(error)}
 results=[];errors=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
  for i,future in enumerate(concurrent.futures.as_completed([pool.submit(save,name) for name in sorted(names)]),1):
   row,error=future.result()
   if row:results.append(row)
   if error:errors.append(error)
   if i%100==0:print(str(i)+'/'+str(len(names)),flush=True)
 results.sort(key=lambda row:row['filename']);index={row['filename']:row['path'] for row in results}
 (ROOT/'src/farm-art.js').write_text('// Original game farm-materials icons; sources and hashes in assets/genshin/farm-materials/sources.json.\nexport const FARM_ART='+json.dumps(index,separators=(',',':'))+';\nexport const farmArtwork=filename=>FARM_ART[filename]||null;\n',encoding='utf-8')
 report={'fetchedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'catalogs':{kind:{'path':'assets/data/gi-'+kind+'.json','sha256':hashlib.sha256((ROOT/('assets/data/gi-'+kind+'.json')).read_bytes()).hexdigest(),'count':len(rows)} for kind,rows in catalogs.items()},'files':results,'missing':errors}
 (folder/'sources.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'files':len(results),'missing':errors}),flush=True)

if __name__=='__main__':main()
