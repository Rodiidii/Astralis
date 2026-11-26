import importlib.util,json,tempfile,unittest,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];spec=importlib.util.spec_from_file_location('uploader',ROOT/'tools/infinityfree_upload.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
sys.path.insert(0,str(ROOT/'tools'))
from infinityfree_parallel import ParallelUploader
class FakeFTP:
    def __init__(self,files=None):self.files=files if files is not None else {};self.operations=[];self.directory='';self.closed=False
    def connect(self,host,port):self.operations.append(('connect',host,port))
    def auth(self):self.operations.append(('tls',))
    def login(self,user,password):self.operations.append(('login',user))
    def prot_p(self):self.operations.append(('encrypted-data',))
    def set_pasv(self,value):pass
    def cwd(self,path):
        if path.startswith('/example.wuaze.com/'):raise module.ftplib.error_perm('550 absent')
        self.directory=path
    def voidcmd(self,cmd):pass
    def mkd(self,name):self.operations.append(('mkdir',name))
    def size(self,name):
        if name not in self.files:raise module.ftplib.error_perm('550 absent')
        return len(self.files[name])
    def storbinary(self,command,stream,blocksize,callback):
        name=command[5:];data=stream.read();self.files[name]=data;self.operations.append(('store',name));callback(data)
    def rename(self,old,new):self.files[new]=self.files.pop(old);self.operations.append(('rename',old,new))
    def close(self):self.closed=True
class UploadTests(unittest.TestCase):
    def prepare(self,tmp):
        root=Path(tmp)/'htdocs';root.mkdir();(root/'index.html').write_text('<html>Astralis</html>');(root/'.htaccess').write_text('DirectoryIndex index.html');(root/'sw.js').write_text('const CACHE=1;');(root/'assets').mkdir();(root/'assets/a.svg').write_text('<svg/>');return root
    def test_assets_are_uploaded_before_entry_points(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=self.prepare(tmp);self.assertEqual([name for name,_ in module.upload_files(root)],['assets/a.svg','index.html','sw.js','.htaccess'])
    def test_private_files_prevent_upload(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=self.prepare(tmp);(root/'.env').write_text('SECRET=private')
            with self.assertRaises(ValueError):module.upload_files(root)
    def test_secure_atomic_upload_and_receipt_without_password(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=self.prepare(tmp);ftp=FakeFTP({'unrelated.txt':b'keep'});worker=module.Uploader(root,'if0_123','example.wuaze.com','test-secret',factory=lambda:ftp);result=worker.run()
            self.assertEqual(result['count'],4);self.assertEqual(ftp.files['unrelated.txt'],b'keep');self.assertEqual(ftp.files['index.html'],b'<html>Astralis</html>');self.assertEqual(worker.password,'');self.assertNotIn('test-secret',worker.receipt.read_text());self.assertTrue(ftp.closed);self.assertIn(('tls',),ftp.operations);self.assertIn(('encrypted-data',),ftp.operations)
    def test_retry_skips_only_recorded_matching_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=self.prepare(tmp);files={};first=FakeFTP(files);worker=module.Uploader(root,'if0_123','example.wuaze.com','secret',factory=lambda:first);worker.run();second=FakeFTP(files);result=module.Uploader(root,'if0_123','example.wuaze.com','secret',factory=lambda:second).run();self.assertEqual(result['skipped'],4);self.assertFalse(any(op[0]=='store' for op in second.operations))
    def test_same_size_modified_local_file_is_sent_again(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=self.prepare(tmp);files={};module.Uploader(root,'if0_123','example.wuaze.com','secret',factory=lambda:FakeFTP(files)).run();(root/'assets/a.svg').write_text('<svgX>');ftp=FakeFTP(files);result=module.Uploader(root,'if0_123','example.wuaze.com','secret',factory=lambda:ftp).run();self.assertEqual(result['skipped'],3);self.assertEqual(files['assets/a.svg'],b'<svgX>')
    def test_cancel_never_publishes_the_html(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=self.prepare(tmp);ftp=FakeFTP();worker=module.Uploader(root,'if0_123','example.wuaze.com','secret',factory=lambda:ftp);worker.cancel.set()
            with self.assertRaises(module.Cancelled):worker.run()
            self.assertNotIn('index.html',ftp.files);self.assertEqual(worker.password,'')
    def test_disconnect_while_checking_a_completed_file_reconnects(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=self.prepare(tmp);files={};module.Uploader(root,'if0_123','example.wuaze.com','secret',factory=lambda:FakeFTP(files)).run()
            class Disconnected(FakeFTP):
                def size(self,name):raise module.ftplib.error_temp('421 connection timed out')
            first=Disconnected(files);reconnected=FakeFTP(files);pool=[first]
            worker=module.Uploader(root,'if0_123','example.wuaze.com','secret',factory=lambda:pool.pop() if pool else reconnected)
            result=worker.run();self.assertEqual(result['skipped'],4);self.assertTrue(first.closed);self.assertIn(('connect','ftpupload.net',21),reconnected.operations)
    def test_disconnect_before_rename_retransfers_without_republishing_partial_html(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=self.prepare(tmp);files={}
            class Disconnected(FakeFTP):
                def rename(self,old,new):raise EOFError('connection closed')
            first=Disconnected(files);reconnected=FakeFTP(files);pool=[first]
            worker=module.Uploader(root,'if0_123','example.wuaze.com','secret',factory=lambda:pool.pop() if pool else reconnected)
            result=worker.run();self.assertEqual(result['count'],4);self.assertEqual(files['index.html'],b'<html>Astralis</html>');self.assertEqual(worker.password,'')
    def test_parallel_sessions_publish_entry_points_after_all_assets(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=self.prepare(tmp);(root/'assets/b.svg').write_text('<svgB/>');files={};operations=[];events=[]
            class Tracking(FakeFTP):
                def rename(self,old,new):super().rename(old,new);operations.append(new)
            worker=ParallelUploader(root,'if0_123','example.wuaze.com','secret',events.append,factory=lambda:Tracking(files));result=worker.run()
            self.assertEqual(result['count'],5);self.assertEqual(operations[-3:],['index.html','sw.js','.htaccess']);self.assertEqual(len(json.loads(worker.receipt.read_text())['completed']),5);self.assertEqual(worker.password,'');self.assertEqual(events[-1]['type'],'done')
if __name__=='__main__':unittest.main()
