import json,subprocess,re,concurrent.futures,imageio_ffmpeg
from pathlib import Path
ff=imageio_ffmpeg.get_ffmpeg_exe();p=Path('assets/express-ultimates/manifest.json');j=json.loads(p.read_text(encoding='utf8'))
def audit(item):
 key,e=item;file=Path(e['url'][1:]);assert file.exists() and file.stat().st_size>500,(key,'empty');r=subprocess.run([ff,'-hide_banner','-i',str(file)],capture_output=True,text=True);probe=r.stderr;match=re.search(r'Duration: (\d+):(\d+):([\d.]+)',probe);assert match,(key,'no duration');a,b,c=match.groups();duration=int(a)*3600+int(b)*60+float(c);assert duration>0,(key,duration)
 assert duration<=5.1,(key,'clip too long',duration)
 if e['kind']=='video':
  assert 'Video:' in probe,(key,'no video');decoded=subprocess.run([ff,'-hide_banner','-loglevel','error','-i',str(file),'-frames:v','1','-f','null','-'],capture_output=True);assert decoded.returncode==0,(key,'decode')
 return key,{'duration':duration,'audio':e['hasAudio'],'bytes':file.stat().st_size,'kind':e['kind']}
results=dict(concurrent.futures.ThreadPoolExecutor(max_workers=4).map(audit,j.items()));Path('artifacts/expanded-media-verification.json').write_text(json.dumps(results,indent=2),encoding='utf8');print('audited',len(results),'videos',sum(e['kind']=='video' for e in j.values()),'max seconds',max(v['duration'] for v in results.values()))
