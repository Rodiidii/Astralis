
from concurrent.futures import ThreadPoolExecutor
import json
import re
from pathlib import Path
from urllib.request import Request,urlopen
ROOT=Path(__file__).resolve().parents[1]
file=ROOT/'data/lab-source-snapshot.json'
snapshot=json.loads(file.read_text(encoding='utf-8'))
revision=snapshot['revision']
base='https://raw.githubusercontent.com/frzyc/genshin-optimizer/'+revision+'/'
def get(url):
 with urlopen(Request(url,headers={'User-Agent':'Astralis data cache'}),timeout=20) as response:return json.load(response)
treeFile=ROOT/'data/.lab-source-tree.tmp.json'
tree=json.loads(treeFile.read_text(encoding='utf-8')) if treeFile.exists() else get('https://api.github.com/repos/frzyc/genshin-optimizer/git/trees/'+revision+'?recursive=1')
paths=[row['path'] for row in tree['tree'] if row['path'].startswith('libs/gi/stats/Data/Weapons/') and row['path'].endswith('/data.json')]
def fetch(path):
 try:return dict(get(base+path),source=base+path)
 except (OSError,ValueError):return None
with ThreadPoolExecutor(max_workers=10) as pool:rows=[row for row in pool.map(fetch,paths) if row]
weapons=json.loads((ROOT/'assets/data/gi-weapons.json').read_text(encoding='utf-8'))
types={'WEAPON_SWORD_ONE_HAND':'sword','WEAPON_CLAYMORE':'claymore','WEAPON_POLE':'polearm','WEAPON_BOW':'bow','WEAPON_CATALYST':'catalyst'}
stats={'FIGHT_PROP_CRITICAL':'critRate_','FIGHT_PROP_CRITICAL_HURT':'critDMG_','FIGHT_PROP_HP_PERCENT':'hp_','FIGHT_PROP_ATTACK_PERCENT':'atk_','FIGHT_PROP_DEFENSE_PERCENT':'def_','FIGHT_PROP_CHARGE_EFFICIENCY':'enerRech_','FIGHT_PROP_ELEMENT_MASTERY':'eleMas','FIGHT_PROP_PHYSICAL_ADD_HURT':'physical_dmg_'}
result={}
for weapon in weapons:
 candidates=[row for row in rows if row['weaponType']==types.get(weapon['weaponType']) and row['rarity']==weapon['rarity'] and abs(row['mainStat']['base']-weapon.get('baseAtkValue',0))<.002]
 # Match growth statistics only; passive effects are independently read from the actual selected weapon.
 fingerprints={json.dumps([row['mainStat'],row['ascensionBonus']],sort_keys=True) for row in candidates}
 if len(fingerprints)!=1:continue
 row=candidates[0]
 result[str(weapon['id'])]={'mainStat':row['mainStat'],'ascensionBonus':row['ascensionBonus'],'source':row['source']}
 subkey=stats.get(weapon.get('mainStatType'))
 text=weapon.get('baseStatText','').replace(',','.')
 match=re.search(r'([0-9]+(?:\.[0-9]+)?)',text)
 expected=float(match[1])/(100 if '%' in text else 1) if match else None
 subs=[row for row in candidates if row.get('subStat',{}).get('type')==subkey and expected is not None and abs(row['subStat']['base']-expected)<(.001 if '%' in text else .1)]
 unique={json.dumps(row['subStat'],sort_keys=True) for row in subs}
 if len(unique)==1:result[str(weapon['id'])]['subStat']=subs[0]['subStat']
snapshot['weaponCurves']=get(base+'libs/gi/stats/Data/Weapons/expCurve.json')
snapshot['weapons']=result
file.write_text(json.dumps(snapshot,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
print(len(result),'weapon main-stat curves matched unambiguously to local catalog')
