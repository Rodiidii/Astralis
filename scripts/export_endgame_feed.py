"""Publish only public game data; never user progress, cookies or profiles."""
from __future__ import annotations
import json,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
import server
from endgame_archive import read_archive,parse_published,HISTORY
def main():
 output=ROOT/'hosting-data/gi-endgame.json';previous={}
 if output.is_file():previous=json.loads(output.read_text(encoding='utf-8'))
 data=json.loads(server.genshin_endgame())
 if not any((data.get('floors'),data.get('theater',{}).get('bosses'),data.get('onslaught',{}).get('bosses'))):raise RuntimeError('No published endgame content; keep the previous feed.')
 rotations=read_archive().get('rotations',[])+previous.get('archive',{}).get('rotations',[])
 for kind,url in HISTORY.items():
  try:rotations.extend(parse_published(server.fetch(url).decode('utf-8',errors='replace'),kind,url))
  except Exception:pass
 for kind,window in data.get('windows',{}).items():
  if not window.get('start') or not window.get('end'):continue
  content={'floors':data.get('floors',[]),'blessing':data.get('blessing','')} if kind=='abyss' else data.get(kind,{})
  rotations.append({**content,**window,'kind':kind,'published':True,'source':HISTORY[kind]})
 unique={(row.get('kind'),str(row.get('start'))[:10]):row for row in rotations if row.get('published') and row.get('kind') in HISTORY and row.get('start') and row.get('end')}
 data['archive']={'rotations':sorted(unique.values(),key=lambda r:r['start'])[-200:],'checkedAt':time.time()}
 data['feedMode']='published-public-data';output.parent.mkdir(exist_ok=True);temporary=output.with_suffix('.tmp');temporary.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8');temporary.replace(output)
 print(json.dumps({'floors':len(data.get('floors',[])),'theaterBosses':len(data.get('theater',{}).get('bosses',[])),'onslaughtBosses':len(data.get('onslaught',{}).get('bosses',[])),'publishedRotations':len(unique),'updatedAt':data.get('updatedAt')},ensure_ascii=False),flush=True)
if __name__=='__main__':main()
