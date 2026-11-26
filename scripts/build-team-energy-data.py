"""Extract numerical KQM generation profiles, retaining variant requirements."""
import json,re,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
URL='https://raw.githubusercontent.com/KQM-git/TCL/master/docs/resources/compendiums/elemental-skill-particles.md'
manifest=json.loads((ROOT/'data/lab-character-conditions.json').read_text(encoding='utf-8'))['characters']
norm=lambda x:re.sub('[^a-z]','',x.lower())
keys={norm(key):key for key in manifest}
profiles={}
text=urllib.request.urlopen(URL,timeout=25).read().decode()
for line in text.splitlines():
    match=re.search(r"char='([^']+)'",line)
    if not match:continue
    name=match[1];key=keys.get(norm(name))
    if not key:continue
    fields=[x.strip() for x in line.strip().strip('|').split('|')]
    try:cooldown=float(fields[2]);average=float(fields[4])
    except (ValueError,IndexError):continue
    note=fields[1];rank=re.search(r'\bC([1-6])\b',note)
    # Ignore inconsistent rows rather than importing an unverified correction.
    counts=re.findall(r'\d+(?:\.\d+)?',fields[3].split('(')[0])
    if len(counts)==1 and float(counts[0])!=average and not re.search(r'full|volleys|Projection',note,re.I):continue
    label='Compétence'
    if re.search(r'hold',note,re.I):label='Compétence maintenue'
    elif re.search(r'tap',note,re.I):label='Compétence courte'
    if key=='Fischl':label='Oz · durée complète'
    if key=='KukiShinobu':label='Anneau · durée complète'
    if key=='RaidenShogun':label='Attaques coordonnées · déclenchement'
    if key=='Wanderer':label='Attaque en vol · déclenchement'
    if key=='Nahida':label='Purification trikarmique · déclenchement'
    if key=='Alhaitham':label='Projections · séquence complète'
    if key=='Layla':label='Étoiles · '+('4' if '4 volleys' in note else '3')+' salves'
    if key=='Bennett' and 'A4' in note:label='Compétence courte dans le déchaînement · A4'
    elif key=='Bennett' and 'A1' in note:label+=' · A1'
    if rank:label+=' · C'+rank[1]
    rows=profiles.setdefault(str(manifest[key]['id']),[])
    candidate={'key':key+'-'+str(len(rows)),'label':label,'particles':average,'cooldown':cooldown,
               'minConstellation':int(rank[1]) if rank else 0,'source':'https://library.keqingmains.com/resources/compendiums/elemental-skill-particles'}
    if not any(all(row[k]==candidate[k] for k in ('label','particles','cooldown')) for row in rows):rows.append(candidate)
flins=manifest['Flins']['id']
profiles[str(flins)]=[{'key':'flins-normal','label':'Normale sous compétence · 1 particule / déclenchement','particles':1,'cooldown':2,'maxEvents':5,'defaultEvents':5,'minConstellation':0,'source':'https://keqingmains.com/q/flins-quickguide/'}]

# Current KQM ERC profiles: continuous turret generation and Aino skill.
profiles.update({'10000116': [{'key': 'ineffa-erc-safe', 'label': 'Birgitta · particules par seconde (ERC prudent)', 'particles': 0.2475, 'cooldown': 0, 'minConstellation': 0, 'source': 'https://docs.google.com/spreadsheets/d/1XeU4lTmO9ECWFdPyc3WEQ_hhJ63hdq8gK_q9HMVV0PM/edit', 'unit': 'seconds'}], '10000121': [{'key': 'aino-skill', 'label': 'Compétence touchée', 'particles': 3, 'cooldown': 10, 'minConstellation': 0, 'source': 'https://docs.google.com/spreadsheets/d/1XeU4lTmO9ECWFdPyc3WEQ_hhJ63hdq8gK_q9HMVV0PM/edit'}], '10000031': [{'key': 'fischl-erc-safe', 'label': 'Oz · 12 secondes actives (ERC prudent)', 'particles': 6.03, 'cooldown': 0, 'minConstellation': 0, 'source': 'https://docs.google.com/spreadsheets/d/1XeU4lTmO9ECWFdPyc3WEQ_hhJ63hdq8gK_q9HMVV0PM/edit'}]})
output={'sourceVersion':'KQM · table de référence 3.4, Flins Luna VI','characters':profiles,
        'burstVariants':{str(flins):[{'key':'short','label':'Symphonie tonitruante · courte','cost':30,'bursts':2},{'key':'normal','label':'Déchaînement normal','cost':80,'bursts':1}]}}
(ROOT/'data/team-energy-profiles.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(profiles)} personnages, {sum(map(len,profiles.values()))} variantes de generation')
