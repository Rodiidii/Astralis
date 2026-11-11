"""Keep dated, published rotations; probe public history pages without assigning guesses."""
import json
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

_lock=threading.Lock()
_running=False
HISTORY={kind:f'https://genshinflex.com/en/{name}/history/' for kind,name in [('abyss','abyss'),('theater','theater'),('onslaught','onslaught')]}
CACHE=Path(__file__).resolve().parent/'.cache/endgame-archive.json'

def parse_published(payload,kind,source):
    rows=[]
    def visit(value,depth=0):
        if depth>12:return
        if isinstance(value,list):
            for row in value[:300]:visit(row,depth+1)
        elif isinstance(value,dict):
            start=value.get('start') or value.get('startDate')
            end=value.get('end') or value.get('endDate')
            content=value.get('floors') or value.get('bosses')
            if isinstance(start,str) and isinstance(end,str) and re.match(r'^\d{4}-\d{2}-\d{2}',start) and re.match(r'^\d{4}-\d{2}-\d{2}',end) and isinstance(content,list) and content:
                rows.append({**value,'kind':kind,'start':start,'end':end,'source':source,'published':True})
            else:
                for child in value.values():
                    if isinstance(child,(dict,list)):visit(child,depth+1)
    try:visit(json.loads(payload))
    except (ValueError,TypeError):
        for text in re.findall(r'<script[^>]*type=["\']application/(?:ld\+)?json["\'][^>]*>(.*?)</script>',payload,re.I|re.S):
            try:visit(json.loads(text))
            except ValueError:pass
    return rows

def read_archive():
    try:return json.loads(CACHE.read_text(encoding='utf-8'))
    except (OSError,ValueError):return {'rotations':[],'checks':[],'checkedAt':0}

def refresh_background(fetch,current):
    global _running
    archive=read_archive()
    current_rows=[]
    for kind,window in current.get('windows',{}).items():
        if not window.get('start') or not window.get('end'):continue
        content={'floors':current.get('floors',[]),'blessing':current.get('blessing','')} if kind=='abyss' else current.get(kind if kind=='theater' else 'onslaught',{})
        current_rows.append({**content,**window,'kind':kind,'published':True,'source':HISTORY.get(kind,'')})
    def run():
        global _running
        try:
            checks=[];rows=archive.get('rotations',[])+current_rows
            def request(entry):
                kind,url=entry
                try:
                    result=parse_published(fetch(url).decode('utf-8',errors='replace'),kind,url)
                    return result,{'kind':kind,'source':url,'status':'published' if result else 'no-dated-structured-data','count':len(result)}
                except Exception as error:return [],{'kind':kind,'source':url,'status':'unavailable','detail':str(error)[:180]}
            with ThreadPoolExecutor(max_workers=3) as pool:
                for found,check in pool.map(request,HISTORY.items()):rows.extend(found);checks.append(check)
            unique={(row['kind'],row['start'][:10]):row for row in rows}
            value={'rotations':sorted(unique.values(),key=lambda row:row['start'])[-200:],'checks':checks,'checkedAt':time.time()}
            CACHE.parent.mkdir(parents=True,exist_ok=True);temporary=CACHE.with_suffix('.tmp');temporary.write_text(json.dumps(value,ensure_ascii=False),encoding='utf-8');temporary.replace(CACHE)
        finally:
            with _lock:_running=False
    with _lock:
        if not _running and time.time()-archive.get('checkedAt',0)>21600:
            _running=True;threading.Thread(target=run,daemon=True).start()
    archive['rotations']=list({(row['kind'],row['start'][:10]):row for row in archive.get('rotations',[])+current_rows}.values())
    return archive
