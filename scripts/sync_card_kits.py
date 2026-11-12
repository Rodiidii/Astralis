"""Cache card texts from the same documented game-data sources used by data.js."""
import json, re, unicodedata
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import Request, urlopen
ROOT=Path(__file__).resolve().parent.parent
def slug(value):return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFD',str(value)).encode('ascii','ignore').decode().lower()).strip('-')
def get(url):
 with urlopen(Request(url,headers={'User-Agent':'Astralis-card-kits/1.0'}),timeout=18) as response:return json.loads(response.read(16*1024*1024))
def get_large(url):
 with urlopen(Request(url,headers={'User-Agent':'Astralis-card-kits/1.0'}),timeout=90) as response:return json.loads(response.read())
def current_hsr_kits(cards):
 base='https://raw.githubusercontent.com/DimbreathBot/TurnBasedGameData/main/'
 avatars=get(base+'ExcelOutput/AvatarConfig.json')
 skill_rows=get_large(base+'ExcelOutput/AvatarSkillConfig.json')
 text_map=get_large(base+'TextMap/TextMapFR.json')
 by_avatar={int(row['AvatarID']):row for row in avatars}
 by_skill={int(row['SkillID']):row for row in skill_rows}
 result={}
 for card in cards:
  if card['game']!='hsr' or card['kind']!='character':continue
  try: avatar=by_avatar.get(int(card.get('sourceId')))
  except (TypeError,ValueError): avatar=None
  if not avatar:continue
  moves=[]
  for skill_id in avatar.get('SkillList',[]):
   skill=by_skill.get(int(skill_id),{});trigger=skill.get('SkillTriggerKey')
   if trigger not in {'Skill02','Skill03'}:continue
   name=text_map.get(str((skill.get('SkillName')or{}).get('Hash','')),'')
   description=text_map.get(str((skill.get('SkillDesc')or{}).get('Hash','')),'')
   if not name or not description:continue
   params=[row.get('Value') for row in skill.get('ParamList',[])]
   def replace(match):
    index=int(match.group(1))-1
    if index<0 or index>=len(params) or not isinstance(params[index],(int,float)):return match.group(0)
    value=float(params[index]);percent=match.group(2)=='%'
    if percent:value*=100
    rendered=f'{value:.1f}'.rstrip('0').rstrip('.')
    return rendered+('%' if percent else '')
   description=re.sub(r'#(\d+)\[(?:i|f\d+|s)\](%)?',replace,description).replace('\\n','\n')
   if re.search(r'#[0-9]+\[',description):continue
   moves.append({'name':name,'description':description,'label':'Compétence' if trigger=='Skill02' else 'Ultime','variants':['E' if trigger=='Skill02' else 'Q'],'source':base+'ExcelOutput/AvatarSkillConfig.json + TextMap/TextMapFR.json'})
  if moves:result['hsr:'+card['artSlug']]=moves
 return result
def main():
 cards=json.loads((ROOT/'public/card-catalog.json').read_text(encoding='utf-8'))['cards'];kits={};errors=[]
 def failed(source,exc):errors.append({'source':source,'error':str(exc)})
 try:
  source='https://genshin-db-api.vercel.app/api/v5/talents?query=names&matchCategories=true&verboseCategories=true&resultLanguage=French&queryLanguages=English'
  data=get(source)
  if isinstance(data,dict):data=list(data.values())
  aliases=json.loads((ROOT/'public/gi-name-aliases.json').read_text(encoding='utf-8'))['characters']
  for row in data:
   if not isinstance(row,dict):continue
   name=row.get('name','');alias=next((a for a in aliases if name in a['fr'] or name in a['en']),None);key=slug(alias['en'][0] if alias else name)
   moves=[]
   for index in [2,3]:
    skill=row.get(f'combat{index}')
    if not skill:continue
    attributes=skill.get('attributes',{});labels=attributes.get('labels',[]);params=attributes.get('parameters',{})
    cost_label=next((label for label in labels if re.search(r'coût|energy.cost',label,re.I)),None)
    cost=None
    if cost_label and '|' in cost_label:
     label,expression=cost_label.split('|',1)
     match=re.search(r'\{(param\d+):[^}]+\}',expression)
     levels=params.get(match[1],[]) if match else []
     value=levels[min(9,len(levels)-1)] if levels else None
     if isinstance(value,(int,float)):cost={'amount':value,'resource':label}
    moves.append({'name':skill.get('name',''),'description':skill.get('description',''),'label':['Compétence','Déchaînement'][index-2],'variants':[['E'],['Q']][index-2],'attributes':attributes,'cost':cost,'source':source})
   if moves:kits['gi:'+key]=moves
 except Exception as exc:failed(source,exc)
 try:
  source='https://raw.githubusercontent.com/DimbreathBot/TurnBasedGameData/main/ExcelOutput/AvatarSkillConfig.json + TextMap/TextMapFR.json'
  kits.update(current_hsr_kits(cards))
 except Exception as exc:failed(source,exc)
 ww={card['sourceId']:card for card in cards if card['game']=='ww' and card['kind']=='character' and card.get('_item')}
 def ww_kit(pair):
  identifier,card=pair;source=f'https://api-v2.encore.moe/api/en/character/{identifier}?v=Beta'
  try:
   data=get(source);moves=[]
   for skill in data.get('Skills',[]):
    label=skill.get('SkillType','')
    if 'Resonance Skill' not in label and 'Resonance Liberation' not in label:continue
    moves.append({'name':skill.get('SkillName',''),'description':skill.get('SkillDescribe',''),'label':label,'variants':['Q' if 'Liberation' in label else 'E'],'source':source})
   return 'ww:'+card['artSlug'],moves
  except Exception as exc:failed(source,exc);return 'ww:'+card['artSlug'],[]
 with ThreadPoolExecutor(max_workers=8) as executor:
  for task in as_completed([executor.submit(ww_kit,pair) for pair in ww.items()]):
   key,moves=task.result()
   if moves:kits[key]=moves
 pending=sorted({f"{card['game']}:{card['artSlug']}" for card in cards if card['kind']=='character'}-kits.keys())
 (ROOT/'public/card-kits.json').write_text(json.dumps({'kits':kits,'missing':pending,'errors':errors},ensure_ascii=False,indent=2),encoding='utf-8')
 print(f'{len(kits)} kits en cache, {len(pending)} kits non obtenus, {len(errors)} erreurs.')
if __name__=='__main__':main()
