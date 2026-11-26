import base64,json,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import community_services as service
class CommunityServicesTest(unittest.TestCase):
 def test_only_owner_installation_on_loopback_can_open_the_private_inbox(self):
  with tempfile.TemporaryDirectory() as tmp:
   settings=Path(tmp)/'owner.json';settings.write_text(json.dumps({'feedbackKey':'test-key'}))
   with patch.object(service,'OWNER',settings):
    self.assertTrue(service.owner_link('127.0.0.1').endswith('#feedback-owner=test-key'))
    self.assertIsNone(service.owner_link('192.0.2.12'));self.assertIsNone(service.owner_link('invalid'))
   with patch.object(service,'OWNER',Path(tmp)/'missing.json'):self.assertIsNone(service.owner_link('127.0.0.1'))
 def test_profile_icons_validate_format_and_dimensions_before_storage(self):
  with self.assertRaises(ValueError):service.store_profile_icon({'image':'data:image/svg+xml;base64,abc'})
  with self.assertRaises(ValueError):service.store_profile_icon({'image':'data:image/png;base64,'+base64.b64encode(b'not png').decode()})
 def test_creator_provider_is_disabled_without_local_owner_configuration(self):
  with patch.object(service,'owner_settings',return_value={}),patch.object(service.subprocess,'run') as call:
   self.assertEqual(service.creator_github_credentials(),('',''));call.assert_not_called()
if __name__=='__main__':unittest.main()
