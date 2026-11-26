"""Deploy through two isolated FTPS connections; entry points are published last."""
from __future__ import annotations
import argparse,getpass,json,sys,threading,time
from pathlib import Path
from infinityfree_upload import Uploader,upload_files,Cancelled

class ParallelUploader(Uploader):
    def run(self):
        children=[];threads=[];errors=[];guard=threading.Lock();rows=upload_files(self.source)
        normal=[row for row in rows if row[0] not in {'index.html','sw.js','.htaccess'}]
        entry=[row for row in rows if row[0] in {'index.html','sw.js','.htaccess'}]
        total=sum(file.stat().st_size for _,file in rows);seed={}
        try:
            saved=json.loads(self.receipt.read_text(encoding='utf-8'))
            if saved.get('username')==self.username and saved.get('domain')==self.domain:seed=saved.get('completed',{})
        except (OSError,ValueError):pass
        self.completed=dict(seed) if isinstance(seed,dict) else {};states=[{'index':0,'done':0,'skipped':0} for _ in range(2)]
        def progress(index,event):
            with guard:
                if event['type']=='progress':
                    states[index]=event;self.current_file=event['file']
                    self.notify({**event,'index':sum(s['index'] for s in states),'count':len(rows),'done':sum(s['done'] for s in states),'total':total,'skipped':sum(s['skipped'] for s in states)})
                elif event['type']=='status':self.notify({**event,'text':f"Canal {index+1} · "+event['text']})
        for index in range(2):
            child=Uploader(self.source,self.username,self.domain,self.password,notify=lambda event,i=index:progress(i,event),factory=self.factory,receipt=self.receipt.with_name(self.receipt.stem+f'-worker{index+1}.json'))
            child.selection=normal[index::2];child.completed=dict(self.completed);children.append(child)
        def run_child(child):
            try:child.run()
            except BaseException as error:
                with guard:errors.append((child.current_file,child.phase,error))
                for other in children:other.cancel.set()
        def merge():
            for child in children:
                for name,_ in child.selection:
                    if name in child.completed:self.completed[name]=child.completed[name]
            self.remote=next((c.remote for c in children if c.remote),'');self.save_receipt()
        try:
            for child in children:
                thread=threading.Thread(target=run_child,args=(child,),daemon=True);threads.append(thread);thread.start()
            while any(t.is_alive() for t in threads):
                if self.cancel.is_set():
                    for child in children:child.cancel.set()
                for thread in threads:thread.join(.25)
            merge()
            if errors:
                self.current_file,self.phase,error=errors[0];raise error
            if self.cancel.is_set():raise Cancelled()
            base_done=sum(s['done'] for s in states);base_skipped=sum(s['skipped'] for s in states)
            def publish_progress(event):
                if event['type']=='progress':self.notify({**event,'index':len(normal)+event['index'],'count':len(rows),'done':base_done+event['done'],'total':total,'skipped':base_skipped+event['skipped']})
                elif event['type']=='status':self.notify(event)
            publisher=Uploader(self.source,self.username,self.domain,self.password,publish_progress,factory=self.factory,receipt=self.receipt)
            publisher.selection=entry;publisher.completed=dict(self.completed);result=publisher.run();self.completed=publisher.completed;self.remote=publisher.remote;self.save_receipt()
            result={'count':len(rows),'total':total,'skipped':base_skipped+result['skipped'],'remote':self.remote};self.notify({'type':'done',**result});return result
        finally:
            for child in children:child.cancel.set();child.close()
            for thread in threads:thread.join(5)
            if children:merge()
            self.password=''

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--source',required=True);parser.add_argument('--username',required=True);parser.add_argument('--domain',required=True);args=parser.parse_args()
    print('CREDENTIAL_INPUT_READY',flush=True)
    secret=getpass.getpass('Mot de passe FTP : ') if sys.stdin.isatty() else sys.stdin.readline().rstrip('\r\n')
    if not secret:raise SystemExit('Aucun mot de passe reçu.')
    path=Path(args.source).resolve().parent/('.transfer-status-'+args.username+'.json');last=[0.0];lock=threading.Lock()
    def notify(event):
        with lock:
            now=time.monotonic()
            if event['type']=='progress' and now-last[0]<15 and event['index']!=event['count']:return
            last[0]=now;temporary=path.with_suffix('.tmp');temporary.write_text(json.dumps(event,ensure_ascii=False),encoding='utf-8');temporary.replace(path)
            if event['type']=='progress':print(f"PROGRESS {event['index']}/{event['count']} · {event['done']/1048576:.1f}/{event['total']/1048576:.1f} Mo · {event['skipped']} repris · {event['file']}",flush=True)
            elif event['type']=='done':print('UPLOAD_COMPLETE '+json.dumps(event,ensure_ascii=False),flush=True)
            else:print(event.get('text',''),flush=True)
    worker=ParallelUploader(args.source,args.username,args.domain,secret,notify);secret=''
    try:worker.run()
    except Exception as error:
        event={'type':'error','file':worker.current_file,'phase':worker.phase,'message':str(error)};path.write_text(json.dumps(event,ensure_ascii=False),encoding='utf-8');print('TRANSFER_ERROR '+json.dumps(event,ensure_ascii=False),flush=True);raise SystemExit(1) from None

if __name__=='__main__':main()
