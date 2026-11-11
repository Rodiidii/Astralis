import sys,tempfile,unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import app_maintenance

class MaintenanceTest(unittest.TestCase):
 def test_download_then_wait_six_hours(self):
  with tempfile.TemporaryDirectory() as temporary:
   status=Path(temporary)/'status.json'
   with patch.object(app_maintenance,'STATUS',status),patch.object(app_maintenance,'refresh') as refresh,patch.object(app_maintenance.subprocess,'run',return_value=SimpleNamespace(returncode=0,stdout='2 nouveaux exports',stderr='')) as run,patch.object(app_maintenance.time,'sleep',side_effect=StopIteration):
    with self.assertRaises(StopIteration):app_maintenance.maintenance_cycle()
    self.assertEqual(run.call_count,1);self.assertEqual(app_maintenance.celestia_status()['state'],'ready');refresh.assert_called_once()
    with self.assertRaises(StopIteration):app_maintenance.maintenance_cycle()
    self.assertEqual(run.call_count,1)
 def test_failed_download_keeps_a_retry_status(self):
  with tempfile.TemporaryDirectory() as temporary:
   with patch.object(app_maintenance,'STATUS',Path(temporary)/'status.json'),patch.object(app_maintenance,'refresh'),patch.object(app_maintenance.subprocess,'run',side_effect=RuntimeError('Source indisponible')),patch.object(app_maintenance.time,'sleep',side_effect=StopIteration):
    with self.assertRaises(StopIteration):app_maintenance.maintenance_cycle()
    self.assertEqual(app_maintenance.celestia_status()['state'],'error')
    self.assertIn('Source indisponible',app_maintenance.celestia_status()['message'])

if __name__=='__main__':unittest.main()
