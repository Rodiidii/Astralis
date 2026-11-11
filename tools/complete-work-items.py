"""Move verified items from the pending file to the completed log, preserving text."""
import argparse,json,re
from datetime import datetime,timedelta,timezone
from pathlib import Path
from zoneinfo import ZoneInfo,ZoneInfoNotFoundError

def paris_now():
 try:return datetime.now(ZoneInfo('Europe/Paris'))
 except ZoneInfoNotFoundError:
  now=datetime.now(timezone.utc)
  def boundary(month):
   last=datetime(now.year,month+1,1,tzinfo=timezone.utc)-timedelta(days=1)
   return (last-timedelta(days=(last.weekday()+1)%7)).replace(hour=1)
  offset=2 if boundary(3)<=now<boundary(10) else 1
  return now.astimezone(timezone(timedelta(hours=offset)))

def complete(root,ids,evidence):
 pending=root/'docs/A-FAIRE.md';done=root/'docs/FAIT.md'
 source=pending.read_text(encoding='utf-8');history=done.read_text(encoding='utf-8')
 changes=[]
 for item_id in ids:
  pattern=re.compile(r'^- \[ \] \*\*'+re.escape(item_id)+r'(?:\*\*|\s)[^\n]*',re.M)
  matches=list(pattern.finditer(source))
  if len(matches)!=1:raise ValueError(f'{item_id}: attendu une seule entrée ouverte, trouvé {len(matches)}')
  changes.append((item_id,matches[0].group()))
 for item_id,line in changes:
  entry='\n## '+item_id+' · '+paris_now().isoformat(timespec='seconds')+'\n\n'+line.replace('- [ ]','- [x]',1)+'\n\n'+evidence.strip()+'\n'
  if ('\n## '+item_id+' · ') not in history:history+=entry
  source=source.replace(line+'\n','',1)
 # Write the evidence first. If interrupted, the item remains pending, never lost.
 for target,value in [(done,history),(pending,source)]:
  temporary=target.with_suffix('.tmp');temporary.write_text(value,encoding='utf-8',newline='\n');temporary.replace(target)
 return len(changes)

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('ids',nargs='+');parser.add_argument('--evidence',required=True,type=Path);args=parser.parse_args()
 print('Points déplacés :',complete(Path(__file__).resolve().parent.parent,args.ids,args.evidence.read_text(encoding='utf-8')))
