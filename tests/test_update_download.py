import hashlib
import io
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import server
import update_progress

ROOT=Path(__file__).resolve().parents[1]
class Response(io.BytesIO):
 def __init__(self,payload):super().__init__(payload);self.headers={'Content-Length':str(len(payload))}
class DownloadTests(unittest.TestCase):
 def release(self,payload,digest=None):return {'tag':'v1.0.54','url':'https://github.com/example/app/releases/download/v1.0.54/Astralis-Update.zip','digest':'sha256:'+(digest or hashlib.sha256(payload).hexdigest()),'patches':[]}
 def test_verified_download_runs_worker_outside_replaced_installation(self):
  with tempfile.TemporaryDirectory() as temp,patch.dict(os.environ,{'LOCALAPPDATA':temp}),patch.object(server,'_UPDATE_STATUS',{'state':'idle'}),patch.object(server,'_github_release',return_value=self.release(b'archive')),patch.object(server,'urlopen',return_value=Response(b'archive')),patch('subprocess.Popen') as spawn:
   update_progress.write_status(jobId='test',state='checking');server._download_update('example/app','v1.0.54','1.0.53')
   self.assertTrue(spawn.called);command=spawn.call_args.args[0];worker=Path(command[1]);self.assertNotEqual(worker.parent,ROOT/'scripts');self.assertTrue(worker.is_file());self.assertTrue((worker.parent/'update_progress.py').is_file());self.assertTrue(Path(command[3]).is_file());self.assertEqual(update_progress.read_status()['state'],'extracting')
 def test_bad_checksum_never_starts_installer(self):
  with tempfile.TemporaryDirectory() as temp,patch.dict(os.environ,{'LOCALAPPDATA':temp}),patch.object(server,'_UPDATE_STATUS',{'state':'idle'}),patch.object(server,'_github_release',return_value=self.release(b'archive','0'*64)),patch.object(server,'urlopen',return_value=Response(b'archive')),patch('subprocess.Popen') as spawn:
   update_progress.write_status(jobId='test',state='checking');server._download_update('example/app','v1.0.54','1.0.53');spawn.assert_not_called();status=update_progress.read_status();self.assertEqual(status['state'],'error');self.assertIn('SHA-256',status['error']);self.assertFalse(list((Path(temp)/'Astralis/updates').glob('*.zip')))
 def test_progress_steps_and_estimates_survive_a_new_process(self):
  with tempfile.TemporaryDirectory() as temp,patch.dict(os.environ,{'LOCALAPPDATA':temp}):
   update_progress.write_status(jobId='one',state='checking');update_progress.write_status(state='downloading',percent=50,receivedBytes=500,totalBytes=1000)
   state=update_progress.read_status();self.assertEqual(state['steps'][0]['status'],'done');self.assertEqual(state['steps'][1]['status'],'active');self.assertGreaterEqual(state['remainingSeconds'],0)
   state=update_progress.write_status(state='extracting',extractedFiles=50,totalFiles=100,percent=50);self.assertEqual(len(state['steps']),9);self.assertGreater(state['overallPercent'],20)
   update_progress.write_status(jobId='two',state='checking');state=update_progress.read_status();self.assertEqual(state['completedSteps'],[]);self.assertNotIn('receivedBytes',state)

if __name__=='__main__':unittest.main()
