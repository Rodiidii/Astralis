"""Cache attributed character baselines and a reproducible Skirk TC example."""
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import re
import unicodedata
from urllib.request import Request,urlopen
ROOT=Path(__file__).resolve().parents[1]
REV='f9' # resolved below
def get(url):
    with urlopen(Request(url,headers={'User-Agent':'Astralis local data audit'}),timeout=15) as response:return json.load(response)
def norm(text):
    return re.sub('[^a-z0-9]','',''.join(c for c in unicodedata.normalize('NFKD',text.casefold()) if not unicodedata.combining(c)))
revision=get('https://api.github.com/repos/frzyc/genshin-optimizer/commits/master')['sha']
base='https://raw.githubusercontent.com/frzyc/genshin-optimizer/'+revision+'/libs/gi/stats/Data/Characters/'
curves=get(base+'expCurve.json')
tree=get('https://api.github.com/repos/frzyc/genshin-optimizer/git/trees/'+revision+'?recursive=1')
folders={norm(row['path'].split('/')[-2]):row['path'].split('/')[-2] for row in tree['tree'] if row['path'].startswith('libs/gi/stats/Data/Characters/') and row['path'].endswith('/data.json')}
overrides={'nomade':'Wanderer','shogunraiden':'RaidenShogun','thomas':'Thoma','rosalia':'Rosaria'}
catalog=json.loads((ROOT/'assets/data/gi-characters.json').read_text(encoding='utf8'))
def character(row):
    key=norm(row['name']);folder=overrides.get(key) or folders.get(key)
    if not folder:return None
    try:
        source=base+folder+'/data.json';data=get(source)
        if len(data.get('lvlCurves',[]))!=3:return None
        return str(row['id']),dict(name=row['name'],curves=data['lvlCurves'],ascensionBonus=data['ascensionBonus'],source=source)
    except (OSError,ValueError,KeyError):return None
with ThreadPoolExecutor(max_workers=10) as pool:
    people=dict(row for row in pool.map(character,catalog) if row)
params=get(base+'Skirk/skillParam.json')
old='https://raw.githubusercontent.com/theBowja/genshin-db/8e5badd60b5d894284ccc927a56c9683529d2592/src/data/French/talents/skirk.json'
talents=get(old)
for number,key in enumerate(['auto','skill','burst'],1):
    if not params.get(key):continue
    talents['combat'+str(number)]['attributes']['parameters']={'param'+str(i+1):value for i,value in enumerate(params[key])}
result=dict(revision=revision,curves=curves,characters=people,skirkTalents=talents,
            talentSources=[old,base+'Skirk/skillParam.json'])
output=ROOT/'data/lab-source-snapshot.json'
if output.exists():
    previous=json.loads(output.read_text(encoding='utf8'))
    if previous.get('revision')==revision:
        result.update({key:previous[key] for key in ['weapons','weaponCurves'] if key in previous})
output.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
print(len(people),'character baselines with pinned sources')
