"""Exercise the actual PHP handlers with disposable storage and creator credentials."""
import base64,hashlib,http.cookiejar,io,json,shutil,socket,subprocess,tempfile,time,unittest,urllib.error,urllib.request
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
class HostedCommunityTest(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.temp=tempfile.TemporaryDirectory();cls.folder=Path(cls.temp.name);cls.web=cls.folder/'htdocs';api=cls.web/'api';api.mkdir(parents=True)
  for name,target in [('api-router.php','router.php'),('feedback-service.php','feedback-service.php'),('profile-icon-service.php','profile-icon-service.php')]:shutil.copy2(ROOT/'hosting/infinityfree'/name,api/target)
  (api/'owner.php').write_text("<?php return ['feedback_hash'=>'"+hashlib.sha256(b'test-creator-key').hexdigest()+"'];")
  (cls.folder/'route.php').write_text("<?php if(strpos($_SERVER['REQUEST_URI'],'/api/')===0){require __DIR__.'/htdocs/api/router.php';}else{return false;}")
  sock=socket.socket();sock.bind(('127.0.0.1',0));port=sock.getsockname()[1];sock.close();cls.base=f'http://127.0.0.1:{port}'
  runtime=ROOT/'releases/tools/php';cls.process=subprocess.Popen([str(runtime/'php.exe'),'-d','extension_dir='+str(runtime/'ext'),'-d','extension=mbstring','-S',f'127.0.0.1:{port}','-t',str(cls.web),str(cls.folder/'route.php')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0));cls.public=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()));cls.owner=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
  for _ in range(60):
   try:cls.call(cls.public,'feedback/status');break
   except OSError:time.sleep(.1)
 @classmethod
 def tearDownClass(cls):cls.process.terminate();cls.process.wait(timeout=5);cls.temp.cleanup()
 @classmethod
 def call(cls,client,path,body=None):
  request=urllib.request.Request(cls.base+'/api/'+path,data=json.dumps(body).encode() if body is not None else None,headers={'Content-Type':'application/json'})
  try:response=client.open(request,timeout=5)
  except urllib.error.HTTPError as error:response=error
  payload=response.read();response.close()
  return response.status,json.loads(payload) if 'json' in response.headers.get('Content-Type','') else payload
 def test_private_report_round_trip_with_attachment_and_status(self):
  self.assertEqual(self.call(self.public,'feedback/inbox')[0],403)
  self.assertEqual(self.call(self.owner,'feedback/login',{'key':'incorrect'})[0],401)
  self.assertEqual(self.call(self.owner,'feedback/login',{'key':'test-creator-key'})[0],200)
  image=Image.new('RGB',(64,64),'#80bfaf');buf=io.BytesIO();image.save(buf,format='PNG');encoded='data:image/png;base64,'+base64.b64encode(buf.getvalue()).decode()
  status,data=self.call(self.public,'feedback',{'kind':'bug','category':'calculation','title':'Test isolé du calcul','description':'Une description suffisamment longue pour vérifier la réception.','image':encoded,'platform':'app'})
  self.assertEqual(status,201,data);identifier=data['id'];self.assertEqual(self.call(self.public,'feedback/item?id='+identifier)[0],403)
  status,inbox=self.call(self.owner,'feedback/inbox');record=next(r for r in inbox['reports'] if r['id']==identifier);self.assertTrue(record['hasImage']);self.assertNotIn('image',record)
  self.assertEqual(self.call(self.owner,'feedback/item?id='+identifier)[1]['report']['image'],encoded)
  self.assertEqual(self.call(self.owner,'feedback/update',{'id':identifier,'status':'resolved'})[0],200)
  self.assertEqual(self.call(self.owner,'feedback/item?id='+identifier)[1]['report']['status'],'resolved')
  self.assertFalse(any(self.web.rglob('report-*.json')));self.assertTrue((self.folder/'.astralis-feedback'/('report-'+identifier+'.json')).is_file())
  self.assertEqual(self.call(self.owner,'feedback/delete',{'id':identifier})[0],200)
 def test_rejects_executable_images_and_unauthorized_sheet_publication(self):
  status,_=self.call(self.public,'feedback',{'kind':'bug','category':'display','title':'Image incorrecte','description':'Une description suffisante pour cette vérification.','image':'data:image/svg+xml;base64,PHN2Zz4='});self.assertEqual(status,400)
  self.assertEqual(self.call(self.public,'character-sheets/publish',{'sheet':{}})[0],403)
 def test_profile_icon_is_a_real_public_png_and_manifest_is_specific(self):
  buf=io.BytesIO();Image.new('RGB',(512,512),'#5e9ea3').save(buf,format='PNG');data=buf.getvalue();status,created=self.call(self.public,'profile-icon',{'image':'data:image/png;base64,'+base64.b64encode(data).decode()});self.assertEqual(status,200,created)
  response=self.public.open(self.base+created['iconUrl']);self.assertEqual(response.headers.get('Content-Type'),'image/png');self.assertEqual(response.read(),data)
  manifest=json.load(self.public.open(self.base+created['manifestUrl']));self.assertEqual(manifest['icons'][0]['src'],created['iconUrl']);self.assertEqual(manifest['icons'][0]['sizes'],'512x512')
if __name__=='__main__':unittest.main()
