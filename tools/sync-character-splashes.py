"""Store full official gacha illustrations locally using Enka's verified avatar filename."""
import concurrent.futures,hashlib,io,json,time
from pathlib import Path
from urllib.request import Request,urlopen
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
SOURCE='https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json'

def fetch(url):return urlopen(Request(url,headers={'User-Agent':'Astralis artwork maintenance'}),timeout=30).read()
def main():
 raw=fetch(SOURCE);mapping=json.loads(raw)
 catalog=json.loads((ROOT/'assets/data/gi-characters.json').read_text(encoding='utf-8'))
 folder=ROOT/'assets/genshin/splashes';folder.mkdir(exist_ok=True,parents=True)
 tasks=[]
 for c in catalog:
  key=str(c['id']);entry=mapping.get(key)
  if not entry:continue
  side=entry.get('SideIconName','')
  if not side.startswith('UI_AvatarIcon_Side_'):continue
  filename=side.replace('UI_AvatarIcon_Side_','UI_Gacha_AvatarImg_',1)
  tasks.append((key,filename))
 def save(row):
  key,filename=row;path=folder/(key+'.webp');url='https://enka.network/ui/'+filename+'.png'
  try:
   if not path.exists():
    data=fetch(url)
    with Image.open(io.BytesIO(data)) as image:
     if min(image.size)<500:raise ValueError('illustration trop petite')
     image.convert('RGBA').save(path,'WEBP',quality=92,method=5)
   with Image.open(path) as image:dimensions=image.size
   return key,{'file':'./assets/genshin/splashes/'+path.name,'url':url,'width':dimensions[0],'height':dimensions[1],'sha256':hashlib.sha256(path.read_bytes()).hexdigest()},None
  except Exception as error:return key,None,{'id':key,'url':url,'error':str(error)}
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(save,tasks))
 index={key:entry for key,entry,_ in results if entry};errors=[error for _,_,error in results if error]
 (ROOT/'src/character-splashes.js').write_text('// Full game illustrations cached from the verified Enka avatar mapping.\nexport const CHARACTER_SPLASHES='+json.dumps({key:entry['file'] for key,entry in index.items()},separators=(',',':'))+';\n',encoding='utf-8')
 (folder/'sources.json').write_text(json.dumps({'source':SOURCE,'mappingSha256':hashlib.sha256(raw).hexdigest(),'fetchedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'artworks':index,'missing':errors},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('Illustrations locales :',len(index),'· indisponibles :',len(errors),flush=True)

if __name__=='__main__':main()
