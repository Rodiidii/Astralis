"""Cache game skill icons using Enka's ID -> SkillOrder mapping, never invented filenames."""
import concurrent.futures,hashlib,json,time
from pathlib import Path
from urllib.request import Request,urlopen
ROOT=Path(__file__).resolve().parent.parent
SOURCE='https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json'

def fetch(url):
 return urlopen(Request(url,headers={'User-Agent':'Astralis asset maintenance'}),timeout=25).read()

def main():
 raw=fetch(SOURCE);characters=json.loads(raw)
 catalog=json.loads((ROOT/'assets/data/gi-characters.json').read_text(encoding='utf-8'))
 mapping={};names=set()
 for c in catalog:
  key=str(c['id']);entry=characters.get(key) or characters.get(key+'-'+str(c.get('skillDepotId','')))
  if not entry:continue
  icons=[entry.get('Skills',{}).get(str(i)) for i in entry.get('SkillOrder',[])[:3]]
  if len(icons)!=3 or not all(icons):continue
  mapping[key]=icons;names.update(icons)
 folder=ROOT/'assets/genshin/skills';folder.mkdir(parents=True,exist_ok=True)
 def save(name):
  path=folder/(name+'.png')
  if path.exists() and path.read_bytes().startswith(b'\x89PNG'):return name,True,None
  try:
   data=fetch('https://enka.network/ui/'+name+'.png')
   if not data.startswith(b'\x89PNG'):raise ValueError('image PNG attendue')
   temporary=path.with_suffix('.tmp');temporary.write_bytes(data);temporary.replace(path);return name,True,None
  except Exception as e:return name,False,str(e)
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(save,sorted(names)))
 successful={name for name,ok,_ in results if ok};errors=[{'name':name,'error':error} for name,ok,error in results if not ok]
 index={key:[('./assets/genshin/skills/'+name+'.png') if name in successful else None for name in icons] for key,icons in mapping.items()}
 module='// Official game icons; ID mapping and sources recorded by tools/sync-skill-icons.py.\nexport const CHARACTER_SKILL_ICONS='+json.dumps(index,separators=(',',':'))+';\n'
 (ROOT/'src/character-skill-icons.js').write_text(module,encoding='utf-8')
 report={'source':SOURCE,'mappingSha256':hashlib.sha256(raw).hexdigest(),'characters':len(index),'files':len(successful),'missing':errors,'fetchedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
 (folder/'sources.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(report,ensure_ascii=True),flush=True)

if __name__=='__main__':main()
