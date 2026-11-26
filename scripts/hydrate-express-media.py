"""Read public character menus and cache source talent/voice pages for media builds."""
import concurrent.futures,json,requests
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
def headers(world):return {'x-rpc-language':'en-us','x-rpc-wiki_app':world,'x-rpc-client_type':'4','Referer':'https://wiki.hoyolab.com/'}
def run(world,menu):
 folder=ROOT/('.hoyo-cache-hsr' if world=='hsr' else '.hoyo-cache');folder.mkdir(exist_ok=True);rows=[]
 for page in range(1,8):
  response=requests.post('https://sg-wiki-api.hoyolab.com/hoyowiki/wapi/get_entry_page_list',json={'filters':[],'menu_id':menu,'page_num':page,'page_size':50,'use_es':True},headers=headers(world),timeout=20);response.raise_for_status();j=response.json();batch=(j.get('data') or {}).get('list',[])
  if not batch:break
  rows.extend(batch)
  if len(batch)<50:break
 (ROOT/'artifacts'/('hoyo-media-menu-'+world+'.json')).write_text(json.dumps(rows,ensure_ascii=False),encoding='utf8')
 def cache(row):
  dest=folder/(str(row['entry_page_id'])+'.json')
  if dest.exists():return
  try:
   r=requests.get(f'https://sg-wiki-api.hoyolab.com/hoyowiki/{world}/wapi/entry_page',params={'entry_page_id':row['entry_page_id']},headers=headers(world),timeout=20);r.raise_for_status();p=r.json()['data']['page'];dest.write_text(json.dumps(p,ensure_ascii=False),encoding='utf8');print(world,p['name'],flush=True)
  except Exception as e:print('UNAVAILABLE',world,row.get('name'),str(e)[:80],flush=True)
 list(concurrent.futures.ThreadPoolExecutor(max_workers=4).map(cache,rows));return len(rows)
if __name__=='__main__':
 for world,menu in [('genshin','2'),('hsr','104')]:print('MENU',world,run(world,menu),flush=True)
