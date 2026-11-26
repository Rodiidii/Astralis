"""Prepare short, attributed gameplay captures; never label community clips official."""
import concurrent.futures,json,re,requests,subprocess,tempfile,urllib.parse
from pathlib import Path
import imageio_ffmpeg
ROOT=Path(__file__).resolve().parent.parent
FF=imageio_ffmpeg.get_ffmpeg_exe();OUT=ROOT/'assets/express-ultimates'
PEOPLE=json.loads((ROOT/'assets/data/ww-characters.json').read_text(encoding='utf8'))
def norm(s):return re.sub('[^a-z0-9]','',s.lower())
def prepare(person):
 name=person['name'];pid=person['id'];terms=[norm(name)]
 if ':' in name:terms=[norm(x) for x in name.split(':')]
 if name.startswith('Rover'):return None # element/gender must be verified separately
 source=None
 try:
  for query in [name+' ultimate',name+' resonance liberation',name+' ult',name+' liberation']:
   url='https://tenor.com/search/'+urllib.parse.quote(query.lower().replace(' ','-'))+'-gifs';r=requests.get(url,timeout=12);r.raise_for_status()
   candidates=list(dict.fromkeys(re.findall(r'href="(/view/[^"?]+)"',r.text)))
   for candidate in candidates[:8]:
    slug=norm(candidate)
    if not all(t in slug for t in terms) or not re.search(r'ultimate|liberation|[-_]ult(?:[-_]|$)',candidate,re.I) or re.search('meme|edit|fanmade|feet|horny|boobs',candidate,re.I):continue
    source='https://tenor.com'+candidate;r=requests.get(source,timeout=12);r.raise_for_status();match=re.search(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',r.text)
    if not match:continue
    data=json.loads(match[1]);video=data.get('video',{});content=video.get('contentUrl');keywords=norm(data.get('keywords','')+' '+data.get('name',''))
    if not content or not all(t in keywords for t in terms) or not any(t in keywords for t in ['wuthering','wuwa']):continue
    raw=requests.get(content,timeout=18);raw.raise_for_status()
    dest=OUT/('ww-'+pid+'.mp4')
    with tempfile.TemporaryDirectory(prefix='astralis-ww-') as folder:
     clip=Path(folder)/'capture.mp4';clip.write_bytes(raw.content)
     subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-i',str(clip),'-t','4.8','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-crf','18','-preset','fast','-pix_fmt','yuv420p','-an','-movflags','+faststart',str(dest)],check=True,capture_output=True,timeout=30)
    print('CAPTURE',name,source,flush=True)
    return 'ww:'+pid,{'kind':'video','url':'/assets/express-ultimates/'+dest.name,'title':name+' · Resonance Liberation','character':name,'source':source,'previewSource':content,'seconds':4.8,'hasAudio':False,'audioType':'Silent community gameplay capture; original Astralis effect played by the app','sceneKind':'gameplay','betaCapture':'cbt' in candidate.lower(),'creator':data.get('creator','')}
  print('NO VERIFIED CAPTURE',name,flush=True)
 except Exception as e:print('UNAVAILABLE',name,str(e)[:90],flush=True)
 return None
if __name__=='__main__':
 dest=ROOT/'artifacts/ww-clips.json';found=json.loads(dest.read_text(encoding='utf8')) if dest.exists() else {}
 manifest=json.loads((OUT/'manifest.json').read_text(encoding='utf8'))
 found.update({k:e for k,e in manifest.items() if k.startswith('ww:') and e.get('qualityTier')=='native-hd'})
 for result in concurrent.futures.ThreadPoolExecutor(max_workers=4).map(prepare,[p for p in PEOPLE if 'ww:'+p['id'] not in found]):
  if result:found[result[0]]=result[1]
 dest.write_text(json.dumps(found,ensure_ascii=False,indent=2),encoding='utf8');print('Verified candidates',len(found),flush=True)
