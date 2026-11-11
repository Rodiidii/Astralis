"""Background maintenance runs only while the local Astralis server is open."""
import json,subprocess,sys,threading,time
from pathlib import Path
from lab_data_sync import refresh
ROOT=Path(__file__).resolve().parent
STATUS=ROOT/'.cache/celestia-sync.json'

def celestia_status():
 try:return json.loads(STATUS.read_text(encoding='utf-8'))
 except (OSError,ValueError):return {'state':'idle','checkedAt':0}

def _save(value):
 STATUS.parent.mkdir(parents=True,exist_ok=True);tmp=STATUS.with_suffix('.tmp');tmp.write_text(json.dumps(value,ensure_ascii=False),encoding='utf-8');tmp.replace(STATUS)

def maintenance_cycle():
 while True:
  try:
   refresh()
   old=celestia_status()
   if time.time()-old.get('checkedAt',0)>=21600:
    _save({**old,'state':'running','startedAt':time.time()})
    result=subprocess.run([sys.executable,str(ROOT/'tools/download-celestia-exports.py')],cwd=ROOT,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=3600,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
    _save({'state':'ready' if result.returncode==0 else 'partial','checkedAt':time.time(),'message':(result.stdout+'\n'+result.stderr)[-1800:]})
  except Exception as error:
   _save({'state':'error','checkedAt':time.time(),'message':str(error)[:1000]})
  time.sleep(900)

def start_maintenance():
 threading.Thread(target=maintenance_cycle,name='astralis-maintenance',daemon=True).start()
