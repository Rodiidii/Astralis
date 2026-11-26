"""Publish changed public files and the hashed creator key through verified FTPS."""
from __future__ import annotations
import argparse,getpass,hashlib,io,json,time
from pathlib import Path
from infinityfree_upload import Uploader,upload_files,digest
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--source',required=True);parser.add_argument('--username',required=True);parser.add_argument('--domain',required=True);parser.add_argument('--only',action='append');args=parser.parse_args()
 source=Path(args.source).resolve();receipt=source.parent/('.upload-'+args.username+'.json');previous=json.loads(receipt.read_text(encoding='utf-8'));assert previous.get('username')==args.username and previous.get('domain')==args.domain
 records=previous.get('completed',{})
 if args.only:
  rows=[]
  for name in args.only:
   file=(source/name).resolve()
   if not file.is_relative_to(source) or not file.is_file() or file.suffix in {'.key','.pem','.env','.db','.py'} or name=='api/owner.php':raise ValueError('Fichier public invalide.')
   rows.append((file.relative_to(source).as_posix(),file))
  rows.sort(key=lambda row:({'index.html':1,'sw.js':2,'.htaccess':3}.get(row[0],0),row[0]))
 else:rows=upload_files(source)
 changed=[row for row in rows if records.get(row[0],{}).get('sha256')!=digest(row[1])]
 print('CHANGED_FILES',len(changed),'OF',len(rows),flush=True)
 for name,_ in changed:print('FILE',name,flush=True)
 print('CREDENTIAL_INPUT_READY',flush=True);password=getpass.getpass('Mot de passe FTP : ')
 def notify(event):
  if event['type']=='progress' and event['done']==sum(file.stat().st_size for _,file in changed[:event['index']]):print(f"PUBLISHED {event['index']}/{event['count']} {event['file']}",flush=True)
  elif event['type']=='status':print(event['text'],flush=True)
 worker=Uploader(source,args.username,args.domain,password,notify);worker.selection=changed
 try:
  worker.connect();owner=Path(__file__).resolve().parents[1]/'assets/user/owner-services.json';settings=json.loads(owner.read_text(encoding='utf-8'));hashed=hashlib.sha256(settings['feedbackKey'].encode()).hexdigest();data=("<?php\nreturn ['feedback_hash'=>'"+hashed+"'];\n").encode();temporary='api/__astralis_part_owner.php';worker.ftp.storbinary('STOR '+temporary,io.BytesIO(data));assert worker.ftp.size(temporary)==len(data);worker.ftp.rename(temporary,'api/owner.php');worker.close()
  result=worker.run();print('UPDATE_PUBLISHED '+json.dumps(result),flush=True)
  report={'domain':args.domain,'publishedAt':time.time(),'changedFiles':[name for name,_ in changed],'publicFiles':len(rows),'creatorAccessConfigured':True};(source.parent/'update-deployment.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 finally:worker.close();worker.password='';password=''
if __name__=='__main__':main()
