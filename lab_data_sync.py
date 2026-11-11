"""Refresh pinned numerical tables in an isolated staging directory, once per day."""
import json,os,shutil,subprocess,sys,tempfile,threading,time
from pathlib import Path
ROOT=Path(__file__).resolve().parent
STATUS=ROOT/'.cache/lab-data-sync.json'
_lock=threading.Lock()
_running=False

def status():
 try:return json.loads(STATUS.read_text(encoding='utf-8'))
 except (OSError,ValueError):return {'state':'idle','checkedAt':0}

def _save(value):
 STATUS.parent.mkdir(parents=True,exist_ok=True);tmp=STATUS.with_suffix('.tmp');tmp.write_text(json.dumps(value,ensure_ascii=False),encoding='utf-8');tmp.replace(STATUS)

def refresh(force=False):
 global _running
 old=status()
 with _lock:
  if _running:return old
  if not force and time.time()-old.get('checkedAt',0)<86400:return old
  _running=True
 _save({**old,'state':'running','startedAt':time.time()})
 def work():
  global _running
  try:
   with tempfile.TemporaryDirectory(prefix='astralis-lab-sync-') as temporary:
    stage=Path(temporary)
    for folder in ['tools','data','assets/data']:(stage/folder).mkdir(parents=True,exist_ok=True)
    for name in ['sync-lab-snapshot.py','sync-lab-weapons.py']:shutil.copy2(ROOT/'tools'/name,stage/'tools'/name)
    for name in ['gi-characters.json','gi-weapons.json']:shutil.copy2(ROOT/'assets/data'/name,stage/'assets/data'/name)
    shutil.copy2(ROOT/'data/lab-source-snapshot.json',stage/'data/lab-source-snapshot.json')
    logs=[]
    for name in ['sync-lab-snapshot.py','sync-lab-weapons.py']:
     result=subprocess.run([sys.executable,str(stage/'tools'/name)],cwd=stage,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=600,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
     logs.append(result.stdout[-1000:])
     if result.returncode:raise RuntimeError(result.stderr[-1000:] or name+' a échoué')
    new=json.loads((stage/'data/lab-source-snapshot.json').read_text(encoding='utf-8'))
    previous=json.loads((ROOT/'data/lab-source-snapshot.json').read_text(encoding='utf-8'))
    if len(new.get('characters',{}))<len(previous.get('characters',{}))*.9 or len(new.get('weapons',{}))<len(previous.get('weapons',{}))*.9:raise ValueError('Tables partielles refusées : les données précédentes sont conservées.')
    target=ROOT/'data/lab-source-snapshot.json';tmp=target.with_suffix('.tmp');tmp.write_text(json.dumps(new,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8');os.replace(tmp,target)
    _save({'state':'ready','checkedAt':time.time(),'revision':new.get('revision'),'characters':len(new.get('characters',{})),'weapons':len(new.get('weapons',{})),'changed':new.get('revision')!=previous.get('revision'),'log':logs})
  except Exception as error:_save({'state':'error','checkedAt':time.time(),'error':str(error)[:1200],'preserved':True})
  finally:
   with _lock:_running=False
 threading.Thread(target=work,daemon=True).start()
 return status()
