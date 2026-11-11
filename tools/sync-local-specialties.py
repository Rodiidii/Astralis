"""Refresh local specialty capacities from the official HoYoLAB map (no credentials)."""
import json,urllib.request,datetime
from pathlib import Path
SOURCE='https://sg-public-api.hoyolab.com/common/map_user/ys_obc/v1/map/label/tree?app_sn=ys_obc&lang=en-us&map_id=2'
def sync():
 data=json.load(urllib.request.urlopen(SOURCE,timeout=30));items={}
 materials=json.loads(Path(__file__).resolve().parents[1].joinpath('assets/data/gi-materials.json').read_text(encoding='utf-8'));specialties={m['id'] for m in materials if m.get('typeText','').startswith('Produit ')}
 # Multiple harvestable units per map marker; other specialties use one unit per marker.
 yields={100022:4,100027:3,100029:2,101235:3}
 def walk(nodes):
  for node in nodes:
   if node.get('item_id') in specialties and node.get('point_count'):
    id=node['item_id'];items[str(id)]={'name':node['name'],'points':node['point_count'],'perPoint':yields.get(id,1),'capacity':node['point_count']*yields.get(id,1),'mapLabel':node['id'],'source':'https://act.hoyolab.com/ys/app/interactive-map/index.html#/map/2?shown_types='+str(node['id'])}
   walk(node.get('children',[]))
 walk(data['data']['tree'])
 result={'updatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':SOURCE,'respawnHours':48,'items':items}
 Path(__file__).resolve().parents[1].joinpath('data/local-specialties.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
 print(str(len(items))+' specialties refreshed')
if __name__=='__main__':sync()
