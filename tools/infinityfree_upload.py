"""Local FTPS upload window. Passwords stay in memory; no remote deletion."""
from __future__ import annotations
import argparse,ftplib,getpass,hashlib,json,queue,socket,ssl,sys,threading,time
from pathlib import Path,PurePosixPath

class Cancelled(Exception):pass

class SecureFTP(ftplib.FTP_TLS):
    def ntransfercmd(self,cmd,rest=None):
        connection,size=ftplib.FTP.ntransfercmd(self,cmd,rest)
        if self._prot_p:
            connection=self.context.wrap_socket(connection,server_hostname=self.host,session=self.sock.session)
        return connection,size

def upload_files(source:Path):
    source=source.resolve();rows=[]
    if not (source/'index.html').is_file() or not (source/'.htaccess').is_file():
        raise ValueError('Le dossier htdocs préparé est introuvable ou incomplet.')
    for file in source.rglob('*'):
        if not file.is_file():continue
        if file.is_symlink() or not file.resolve().is_relative_to(source):raise ValueError('Lien extérieur au dossier du site.')
        relative=file.relative_to(source).as_posix()
        if file.name.startswith('.env') or file.suffix.lower() in {'.sqlite3','.db','.dpapi','.pem','.key','.py','.bat','.ps1','.log'}:
            raise ValueError('Un fichier privé ou non destiné au site est présent : '+relative)
        limit=10000 if file.name=='.htaccess' else 1000000 if file.suffix.lower() in {'.js','.mjs','.php','.html'} else 10000000
        if file.stat().st_size>=limit:raise ValueError('Fichier trop volumineux pour InfinityFree : '+relative)
        rows.append((relative,file))
    last={'index.html':1,'sw.js':2,'.htaccess':3}
    return sorted(rows,key=lambda row:(last.get(row[0],0),row[0]))

def digest(file):
    hasher=hashlib.sha256()
    with file.open('rb') as stream:
        for block in iter(lambda:stream.read(1048576),b''):hasher.update(block)
    return hasher.hexdigest()

class Uploader:
    def __init__(self,source,username,domain,password,notify=lambda event:None,factory=None,receipt=None):
        if not username.startswith('if0_') or not username[4:].isdigit():raise ValueError('Identifiant FTP InfinityFree invalide.')
        if not domain or '/' in domain or '\\' in domain or '..' in domain:raise ValueError('Nom de domaine invalide.')
        self.source=Path(source).resolve();self.username=username;self.domain=domain;self.password=password;self.notify=notify
        self.cancel=threading.Event();self.factory=factory;self.ftp=None;self.remote='';self.completed={};self.dirs=set()
        self.receipt=Path(receipt) if receipt else self.source.parent/('.upload-'+username+'.json');self.connected_at=0.0;self.phase='préparation';self.current_file='';self.selection=None
    def connect(self):
        self.close()
        if self.factory:self.ftp=self.factory()
        else:
            context=ssl.create_default_context();context.minimum_version=ssl.TLSVersion.TLSv1_2
            self.ftp=SecureFTP(context=context,timeout=35)
        self.ftp.connect('ftpupload.net',21);self.ftp.auth();self.ftp.login(self.username,self.password);self.ftp.prot_p();self.ftp.set_pasv(True)
        for target in ['/'+self.domain+'/htdocs','/htdocs']:
            try:self.ftp.cwd(target);self.remote=target;break
            except ftplib.error_perm:continue
        else:raise ValueError('Aucun dossier htdocs trouvé sur ce compte. Vérifie l’hébergement dans InfinityFree.')
        self.ftp.voidcmd('TYPE I');self.dirs={'.'};self.connected_at=time.monotonic()
    def close(self):
        if self.ftp:
            try:self.ftp.close()
            except Exception:pass
        self.ftp=None
    def save_receipt(self):
        data={'host':'ftpupload.net','username':self.username,'domain':self.domain,'remote':self.remote,'completed':self.completed}
        temporary=self.receipt.with_suffix('.tmp');temporary.write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8');temporary.replace(self.receipt)
    def load_receipt(self):
        try:
            data=json.loads(self.receipt.read_text(encoding='utf-8'))
            if data.get('username')==self.username and data.get('domain')==self.domain and data.get('remote')==self.remote:
                self.completed.update(data.get('completed',{}) if isinstance(data.get('completed'),dict) else {})
        except (OSError,ValueError):pass
    def ensure_dirs(self,relative):
        directory=PurePosixPath(relative).parent;current=PurePosixPath('.')
        for part in directory.parts:
            current=current/part;name=str(current)
            if name in self.dirs:continue
            try:self.ftp.mkd(name)
            except ftplib.error_perm:
                self.ftp.cwd(name);self.ftp.cwd(self.remote)
            self.dirs.add(name)
    def run(self):
        try:
            rows=self.selection if self.selection is not None else upload_files(self.source);total=sum(file.stat().st_size for _,file in rows);done_bytes=0;skipped=0
            self.notify({'type':'status','text':'Connexion sécurisée à ton hébergement…'})
            self.connect();self.load_receipt();self.notify({'type':'status','text':'Envoi vers '+self.domain+' · '+self.remote})
            for index,(relative,file) in enumerate(rows):
                if self.cancel.is_set():raise Cancelled()
                self.current_file=relative;size=file.stat().st_size;sha=digest(file)
                cached=self.completed.get(relative,{})
                transferred=[0]
                def block_sent(block):
                    if self.cancel.is_set():raise Cancelled()
                    transferred[0]+=len(block)
                    self.notify({'type':'progress','file':relative,'index':index+1,'count':len(rows),'done':min(total,done_bytes+transferred[0]),'total':total,'skipped':skipped})
                reused=False
                for attempt in range(12):
                    if self.cancel.is_set():raise Cancelled()
                    try:
                        if attempt or not self.ftp or time.monotonic()-self.connected_at>40:self.connect()
                        self.phase='vérification'
                        if cached.get('sha256')==sha:
                            try:match=self.ftp.size(relative)==size
                            except ftplib.error_perm as error:
                                if not str(error).startswith('550'):raise
                                match=False
                            if match:reused=True;break
                        self.phase='dossier de destination'
                        self.ensure_dirs(relative);transferred[0]=0
                        target=PurePosixPath(relative);temporary=str(target.parent/('__astralis_part_'+target.name))
                        self.phase='transfert'
                        with file.open('rb') as stream:self.ftp.storbinary('STOR '+temporary,stream,blocksize=131072,callback=block_sent)
                        self.phase='taille après transfert'
                        actual=self.ftp.size(temporary)
                        for check in range(3):
                            if actual==size:break
                            if self.cancel.wait(.5):raise Cancelled()
                            actual=self.ftp.size(temporary)
                        if actual!=size:raise OSError(f'Taille distante {actual}, taille attendue {size} octets.')
                        self.phase='publication du fichier'
                        self.ftp.rename(temporary,relative);break
                    except ftplib.all_errors as error:
                        message=str(error).replace(self.password,'[masqué]') if self.password else str(error)
                        permanent=isinstance(error,ftplib.error_perm)
                        if message.startswith('530') or attempt>=11 or permanent and attempt>=2:
                            raise RuntimeError(f'{relative} · {self.phase} · {type(error).__name__}: {message}') from None
                        self.close();self.notify({'type':'status','text':f'Connexion interrompue pendant {self.phase}. Reprise {attempt+1}/12 · {type(error).__name__}: {message[:140]}'})
                        if self.cancel.wait(min(15,2+attempt)):raise Cancelled() from error
                if reused:skipped+=1
                self.completed[relative]={'sha256':sha,'bytes':size};done_bytes+=size
                if not reused:self.save_receipt()
                self.notify({'type':'progress','file':relative,'index':index+1,'count':len(rows),'done':done_bytes,'total':total,'skipped':skipped})
            self.notify({'type':'done','count':len(rows),'total':total,'skipped':skipped,'remote':self.remote})
            return {'count':len(rows),'total':total,'skipped':skipped,'remote':self.remote}
        finally:self.close();self.password=''

def headless(args):
    print('CREDENTIAL_INPUT_READY',flush=True)
    secret=getpass.getpass('Mot de passe FTP : ') if sys.stdin.isatty() else sys.stdin.readline().rstrip('\r\n')
    if not secret:raise SystemExit('Aucun mot de passe reçu. Aucun transfert lancé.')
    status_path=Path(args.source).resolve().parent/('.transfer-status-'+args.username+'.json');last=[0.0]
    def notify(event):
        now=time.monotonic()
        if event['type']=='progress' and now-last[0]<15 and event['index']!=event['count']:return
        last[0]=now;status_path.write_text(json.dumps(event,ensure_ascii=False),encoding='utf-8')
        if event['type']=='progress':print(f"PROGRESS {event['index']}/{event['count']} · {event['done']/1048576:.1f}/{event['total']/1048576:.1f} Mo · {event['skipped']} repris · {event['file']}",flush=True)
        elif event['type']=='done':print('UPLOAD_COMPLETE '+json.dumps(event,ensure_ascii=False),flush=True)
        else:print(event.get('text',''),flush=True)
    worker=Uploader(args.source,args.username,args.domain,secret,notify);secret=''
    try:worker.run()
    except Exception as error:
        event={'type':'error','file':worker.current_file,'phase':worker.phase,'message':str(error)};status_path.write_text(json.dumps(event,ensure_ascii=False),encoding='utf-8');print('TRANSFER_ERROR '+json.dumps(event,ensure_ascii=False),flush=True);raise SystemExit(1) from None

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--source',required=True);parser.add_argument('--username',required=True);parser.add_argument('--domain',required=True);parser.add_argument('--headless',action='store_true');args=parser.parse_args()
    if args.headless:return headless(args)
    import tkinter as tk
    from tkinter import ttk,messagebox
    source=Path(args.source).resolve();window=tk.Tk();window.title('Astralis · Mise en ligne InfinityFree');window.geometry('650x535');window.minsize(600,510);window.configure(bg='#111d25')
    style=ttk.Style();style.theme_use('clam');style.configure('Horizontal.TProgressbar',background='#a2dbc4',troughcolor='#243640',borderwidth=0,thickness=9)
    body=tk.Frame(window,bg='#111d25');body.pack(fill='both',expand=True,padx=34,pady=27)
    def label(text,size=11,color='#b9c9cf',**kw):
        widget=tk.Label(body,text=text,font=('Segoe UI',size),bg='#111d25',fg=color,anchor='w',justify='left',**kw);widget.pack(fill='x',pady=(0,12));return widget
    label('ASTRALIS / INFINITYFREE',9,'#a2dbc4');label('Ton atelier arrive sur le web.',23,'#f1f5ed')
    label(args.domain+'\nCompte FTP : '+args.username,12,'#d7e3df')
    label('Copie le mot de passe FTP affiché dans ton panneau InfinityFree.\nIl sert à cet envoi et reste en mémoire sur ton ordinateur.',10)
    password=tk.Entry(body,show='●',font=('Segoe UI',13),bg='#243640',fg='#f0f3ed',insertbackground='#f0f3ed',relief='flat');password.pack(fill='x',ipady=10,pady=(0,15));password.focus_set()
    progress=ttk.Progressbar(body,mode='determinate',maximum=100);progress.pack(fill='x',pady=(0,13))
    status=label('Prêt à envoyer le dossier htdocs préparé.',11,'#eff4ea',wraplength=570)
    detail=label('Les transferts interrompus peuvent être repris.\nAucun autre fichier du site ne sera supprimé.',10,wraplength=570)
    buttons=tk.Frame(body,bg='#111d25');buttons.pack(fill='x',pady=(12,0));events=queue.Queue();active={'worker':None,'thread':None,'done':False};last_event={'at':0.0}
    def notify(event):
        if event['type']=='progress' and event['index']!=event['count']:
            now=time.monotonic()
            if now-last_event['at']<.15:return
            last_event['at']=now
        events.put(event)
    def start():
        secret=password.get()
        if not secret:password.focus_set();return
        try:worker=Uploader(source,args.username,args.domain,secret,notify)
        except Exception as error:messagebox.showerror('Préparation impossible',str(error));return
        password.delete(0,'end');password.configure(state='disabled');send.configure(state='disabled');active['worker']=worker
        def run():
            try:worker.run()
            except Cancelled:events.put({'type':'cancelled'})
            except Exception as error:events.put({'type':'error','class':type(error).__name__,'text':str(error)})
        thread=threading.Thread(target=run,daemon=True);active['thread']=thread;thread.start()
    def close():
        if active['thread'] and active['thread'].is_alive():
            active['worker'].cancel.set();status.configure(text='Arrêt demandé. La progression enregistrée sera conservée.');return
        window.destroy()
    send=tk.Button(buttons,text='Envoyer Astralis',command=start,bg='#a2dbc4',fg='#112c29',relief='flat',font=('Segoe UI',11,'bold'),padx=25,pady=11);send.pack(side='left')
    stop=tk.Button(buttons,text='Fermer / arrêter',command=close,bg='#243640',fg='#d3e0df',relief='flat',font=('Segoe UI',10),padx=20,pady=12);stop.pack(side='right')
    def update():
        try:
            while True:
                event=events.get_nowait();kind=event['type']
                if kind=='status':status.configure(text=event['text'])
                elif kind=='progress':
                    progress['value']=event['done']/max(1,event['total'])*100
                    status.configure(text=f"{event['index']} / {event['count']} fichiers · {event['done']/1048576:.1f} / {event['total']/1048576:.1f} Mo")
                    detail.configure(text=event['file'])
                elif kind=='done':
                    active['done']=True;progress['value']=100;status.configure(text='Astralis a été envoyé sur ton hébergement.')
                    detail.configure(text='Adresse : https://'+args.domain+'\nLe transfert est terminé. Vérifie maintenant le site dans ton navigateur.')
                elif kind in ['error','cancelled']:
                    password.configure(state='normal');send.configure(state='normal')
                    if kind=='cancelled':status.configure(text='Envoi arrêté. Tu peux le reprendre plus tard.')
                    else:
                        text=event['text']
                        if '530' in text:text='Connexion refusée. Vérifie le mot de passe FTP du compte '+args.username+' et que son accès FTP est activé.'
                        status.configure(text='L’envoi ne s’est pas terminé.');detail.configure(text=text[:420])
        except queue.Empty:pass
        window.after(150,update)
    window.protocol('WM_DELETE_WINDOW',close);window.after(150,update);window.mainloop()

if __name__=='__main__':main()
