"""Build compact clips from official HoYoWiki talent previews + burst voices.

Cached entry JSON is read from .hoyo-cache during asset preparation only.
Every output records its actual image, voice and source in the media manifest.
"""
import concurrent.futures
import json
from pathlib import Path
import re
import subprocess
import tempfile
import urllib.request
import urllib.parse
import imageio_ffmpeg
import unicodedata

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'assets/express-ultimates'
OUT.mkdir(exist_ok=True)
FFMPEG=imageio_ffmpeg.get_ffmpeg_exe()
canonical=lambda s: re.sub('[^a-z0-9]','',unicodedata.normalize('NFD',s.lower()))
catalog=json.loads((ROOT/'assets/data/gi-characters.json').read_text(encoding='utf-8'))
by_name={canonical(p['name']):str(p['id']) for p in catalog}
aliases={'raidenshogun':'10000052','tartaglia':'10000033','kamisatoayaka':'10000002','sangonomiyakokomi':'10000054','rosaria':'10000045','thoma':'10000050','wanderer':'10000075','mitya':'10000136','valeriy':'10000137','danica':'10000147','anastasya':'10000149'}
by_name.update(aliases)
hsr_names={}
for pid,row in json.loads((ROOT/'assets/data/hsr-nanoka-character.json').read_text(encoding='utf-8')).items():hsr_names.setdefault(canonical(row.get('en','')),pid)
hsr_names['march7ththehunt']='1224'

def download(url,path):
 req=urllib.request.Request(urllib.parse.quote(url,safe=':/?&=%'),headers={'User-Agent':'Mozilla/5.0'})
 with urllib.request.urlopen(req,timeout=35) as r:path.write_bytes(r.read())

def build(path):
 try:
  p=json.loads(path.read_text(encoding='utf-8'));name=p['name'];world='hsr' if path.parent.name.endswith('-hsr') else 'gi';pid=(hsr_names if world=='hsr' else by_name).get(canonical(name))
  if not pid:return None
  protected=globals().get('entries',{}).get(world+':'+pid,{})
  if protected.get('qualityTier')=='native-hd' and (ROOT/protected['url'].lstrip('/')).exists():return world+':'+pid,protected
  video=None;voices=[]
  for m in p.get('modules',[]):
   for c in m.get('components',[]):
    if c.get('component_id')=='talent':
     rows=json.loads(c['data'] or '{}').get('list',[])
     if len(rows)>=3:video=rows[2]
    if c.get('component_id')=='trace' and world=='hsr':
     for trace in json.loads(c['data'] or '{}').get('points',{}).values():
      if re.sub('<[^>]+>','',trace.get('desc','')).strip().startswith('Ultimate'):
       images=trace.get('trace_imgs') or []
       preview=trace.get('img','') or next((i.get('url','') for i in images if i.get('url')), '')
       video={'title':trace['title'],'talent_img':preview};break
    if c.get('component_id')=='voice':
     voices=[v for v in json.loads(c['data'] or '{}').get('list',[]) if ('Ultimate:' if world=='hsr' else 'Elemental Burst') in v.get('title','')]
  if not video:return None
  voices.sort(key=lambda v:0 if 'Unleash' in v.get('title','') else 1)
  audio=next((a for v in voices for a in v.get('audios',[]) if a.get('name')=='EN' and a.get('url')),None)
  if not audio:audio=next((a for v in voices for a in v.get('audios',[]) if a.get('name')=='JP' and a.get('url')),None)
  if not audio:audio=next((a for v in voices for a in v.get('audios',[]) if a.get('url')),None)
  if not audio and not video.get('talent_img'):return None
  has_preview=bool(video.get('talent_img'))
  dest=OUT/((world+'-' if world=='hsr' else '')+pid+('.mp4' if has_preview else '.m4a'))
  if not dest.exists() or dest.stat().st_size<1000:
   with tempfile.TemporaryDirectory(prefix='astralis-ult-') as temp:
    gif=Path(temp)/'preview.gif';wav=Path(temp)/'voice.wav'
    if audio:download(audio['url'],wav)
    if has_preview:
     try:download(video['talent_img'],gif)
     except Exception:
      # Some older pages still point at the retired bbs asset hostname.
      has_preview=False;dest=OUT/((world+'-' if world=='hsr' else '')+pid+'.m4a')
    if has_preview and audio:
     cmd=[FFMPEG,'-y','-hide_banner','-loglevel','error','-i',str(gif),'-i',str(wav),'-t','5','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-af','apad','-movflags','+faststart',str(dest)]
    elif has_preview:
     cmd=[FFMPEG,'-y','-hide_banner','-loglevel','error','-i',str(gif),'-t','5','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-an','-movflags','+faststart',str(dest)]
    elif audio:
     cmd=[FFMPEG,'-y','-hide_banner','-loglevel','error','-i',str(wav),'-t','5','-c:a','aac','-b:a','96k','-movflags','+faststart',str(dest)]
    else:return None
    subprocess.run(cmd,check=True,capture_output=True,timeout=75)
  entry={'kind':'video' if has_preview else 'audio','url':'/assets/express-ultimates/'+dest.name,'title':video.get('title') or video.get('key') or 'Ultime','source':f'https://wiki.hoyolab.com/pc/{"hsr" if world=="hsr" else "genshin"}/entry/{p["id"]}?lang=en-us','previewSource':video.get('talent_img',''),'audioSource':audio['url'] if audio else '', 'hasAudio':bool(audio),'audioLanguage':audio.get('name','') if audio else '', 'audioType':'Official talent preview with burst voice' if audio and has_preview else 'Official voice with Astralis scene' if audio else 'Silent official talent preview; original Astralis effect played by app','seconds':5,'character':name}
  print('OK',pid,name,dest.stat().st_size,flush=True)
  return world+':'+pid,entry
 except Exception as e:
  print('SKIP',path.name,str(e)[:120],flush=True);return None

if __name__=='__main__':
 manifest=OUT/'manifest.json'
 entries=json.loads(manifest.read_text(encoding='utf-8')) if manifest.exists() else {}
 # Rehydrate the source cache from the committed provenance manifest. The app
 # itself never needs this script, Python, FFmpeg or an external media request.
 if not list((ROOT/'.hoyo-cache').glob('*.json')) and entries:
  def hydrate(item):
   key,entry=item;world=key.split(':')[0];match=re.search(r'/entry/(\d+)',entry.get('source',''))
   if not match:return
   cache=ROOT/('.hoyo-cache-hsr' if world=='hsr' else '.hoyo-cache');cache.mkdir(exist_ok=True)
   pid=match.group(1);url=f'https://sg-wiki-api.hoyolab.com/hoyowiki/{"hsr" if world=="hsr" else "genshin"}/wapi/entry_page?entry_page_id={pid}'
   try:
    req=urllib.request.Request(url,headers={'x-rpc-language':'en-us','x-rpc-wiki_app':'hsr' if world=='hsr' else 'genshin','User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=25) as response:page=json.load(response)['data']['page']
    (cache/(pid+'.json')).write_text(json.dumps(page,ensure_ascii=False),encoding='utf-8')
   except Exception as error:print('Source unavailable:',key,str(error)[:100],flush=True)
  list(concurrent.futures.ThreadPoolExecutor(max_workers=4).map(hydrate,entries.items()))
 for result in concurrent.futures.ThreadPoolExecutor(max_workers=3).map(build,sorted((ROOT/'.hoyo-cache').glob('*.json'))+sorted((ROOT/'.hoyo-cache-hsr').glob('*.json'))):
  if result:entries[result[0]]=result[1]
 manifest.write_text(json.dumps(entries,ensure_ascii=False,indent=2),encoding='utf-8')
 print('Clips with official voice:',len(entries),flush=True)
