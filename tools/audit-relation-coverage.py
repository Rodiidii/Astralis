
from pathlib import Path
import json
from collections import defaultdict
ROOT=Path(__file__).resolve().parents[1]
def read(path):return json.loads((ROOT/path).read_text(encoding='utf-8-sig'))
def canonical(value):
 value=str(value)
 return '10000005' if value=='10000007' else value
def main():
 catalog=read('assets/data/gi-characters.json')
 lore=read('assets/data/gi-relation-lore.json')
 overrides=read('assets/data/gi-relation-overrides.json')
 roster={canonical(x['id']):x for x in catalog+overrides['roster']+lore}
 evidence=read('data/relations.json')['evidence']+read('data/relations-official.json')
 links=defaultdict(set);counts=defaultdict(int);invalid=[]
 for row in evidence:
  a,b=canonical(row['from']),canonical(row['to'])
  if a not in roster or b not in roster or a==b or not row.get('source') or not row.get('quote'):
   invalid.append(row['id']);continue
  links[a].add(b);links[b].add(a);counts[a]+=1;counts[b]+=1
 lines=['# Audit de couverture des relations','',
 'Audit automatique de tout le catalogue local et des figures de lore. Les variantes du Voyageur sont regroupées. Les preuves sans source et les extrémités absentes sont écartées du graphe.','',
 'Une scène commune atteste une interaction de scène, pas une amitié. Une mention collective des Sept porte un libellé explicite ; elle ne prétend pas à un dialogue personnel.','',
 f'{len(roster)} identités contrôlées ; {len(evidence)} preuves disponibles ; {sum(len(v) for v in links.values())//2} paires sourcées ; {len(invalid)} preuves exclues.','',
 'Columbina : scènes de Nod-Krai complétées via les transcriptions de quêtes, dont True Moon. Mavuika : mentions des Sept signalées comme collectives. La Tsarine : icône locale et région Snezhnaya.','',
 'Le contrôle valide la structure et la couverture du corpus consulté. Il ne garantit pas que tous les dialogues de toutes les versions du jeu ont été transcrits. Les voix absentes de la source restent absentes.','',
 '| Personnage | Liens distincts | Preuves |','|---|---:|---:|']
 for key,row in sorted(roster.items(),key=lambda pair:pair[1]['name']):
  lines.append(f"| {row['name']} | {len(links[key])} | {counts[key]} |")
 lines+=['','## Sources non récupérées','',', '.join(read('data/relations.json').get('voiceFallback',{}).get('unavailable',[])) or 'Aucune.','','## Preuves exclues','',', '.join(invalid) or 'Aucune.']
 (ROOT/'docs/AUDIT-RELATIONS-COUVERTURE.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
 print(lines[6])
if __name__=='__main__':main()
