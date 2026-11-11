import json,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from endgame_archive import parse_published

class PublishedRotationsTest(unittest.TestCase):
 def test_only_dated_content_is_associated(self):
  rows=[{'start':'2026-12-16','end':'2027-01-16','floors':[{'floor':12}]},{'start':'2026-11-16','end':'2026-12-16','floors':[]},{'title':'Version future','bosses':[{'name':'Boss'}]}]
  found=parse_published(json.dumps(rows),'abyss','https://genshinflex.com/en/abyss/history/')
  self.assertEqual(len(found),1);self.assertEqual(found[0]['start'],'2026-12-16');self.assertTrue(found[0]['published'])
 def test_json_scripts_and_unavailable_content(self):
  text='<script id="history" type="application/json">'+json.dumps({'cycles':[{'start':'2026-11-01','end':'2026-12-01','bosses':[{'name':'Boss'}]}]})+'</script>'
  self.assertEqual(len(parse_published(text,'theater','source')),1)
  self.assertEqual(parse_published('<h1>Access denied</h1>','theater','source'),[])

if __name__=='__main__':unittest.main()
