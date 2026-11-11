"""Cache original game equipment icons from explicit catalog filenames, not guessed slugs."""
import concurrent.futures,hashlib,io,json,time
from pathlib import Path
from urllib.request import Request,urlopen
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent

def main():
 catalogs={kind:json.loads((ROOT/('assets/data/gi-'+kind+'.json')).read_text(encoding='utf-8')) for kind in ['weapons','artifacts']}
 names=set()
 for kind,rows in catalogs.items():
  keys=['filename_icon'] if kind=='weapons' else ['filename_'+slot for slot in ['flower','plume','sands','goblet','circlet']]
  for row in rows:
   for key in keys:
    name=row.get('images',{}).get(key)
    if name and name.startswith('UI_') and all(c.isalnum() or c=='_' for c in name):names.add(name)
 folder=ROOT/'assets/genshin/equipment';folder.mkdir(parents=True,exist_ok=True)
 def save(name):
  path=folder/(name+'.png');url='https://enka.network/ui/'+name+'.png'
  try:
   if path.exists():data=path.read_bytes()
   else:
    for attempt in range(2):
     try:
      with urlopen(Request(url,headers={'User-Agent':'Astralis equipment asset maintenance'}),timeout=25) as response:data=response.read()
      break
     except Exception:
      if attempt:raise
   if not data.startswith(b'\x89PNG'):raise ValueError('PNG attendu')
   with Image.open(io.BytesIO(data)) as im:im.verify()
   with Image.open(io.BytesIO(data)) as im:size=list(im.size)
   if min(size)<96:raise ValueError('Résolution insuffisante')
   if not path.exists():temporary=path.with_suffix('.tmp');temporary.write_bytes(data);temporary.replace(path)
   return {'filename':name,'url':url,'path':'./assets/genshin/equipment/'+path.name,'sha256':hashlib.sha256(data).hexdigest(),'size':size},None
  except Exception as error:return None,{'filename':name,'url':url,'error':str(error)}
 results=[];errors=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
  for i,future in enumerate(concurrent.futures.as_completed([pool.submit(save,name) for name in sorted(names)]),1):
   row,error=future.result()
   if row:results.append(row)
   if error:errors.append(error)
   if i%100==0:print(str(i)+'/'+str(len(names)),flush=True)
 results.sort(key=lambda row:row['filename']);index={row['filename']:row['path'] for row in results}
 (ROOT/'src/equipment-art.js').write_text('// Original game equipment icons; sources and hashes in assets/genshin/equipment/sources.json.\nexport const EQUIPMENT_ART='+json.dumps(index,separators=(',',':'))+';\nexport const equipmentArtwork=filename=>EQUIPMENT_ART[filename]||null;\n',encoding='utf-8')
 report={'fetchedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'catalogs':{kind:{'path':'assets/data/gi-'+kind+'.json','sha256':hashlib.sha256((ROOT/('assets/data/gi-'+kind+'.json')).read_bytes()).hexdigest(),'count':len(rows)} for kind,rows in catalogs.items()},'files':results,'missing':errors}
 (folder/'sources.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'files':len(results),'missing':errors}),flush=True)

if __name__=='__main__':main()
