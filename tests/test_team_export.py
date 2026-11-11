"""The local export route writes JSON into the project without trusting filenames."""
import importlib.util
import json
import tempfile
import threading
import unittest
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('astralis_server',ROOT/'server.py')
server_module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(server_module)

class TeamExportTest(unittest.TestCase):
    def test_export_is_hashed_and_validated(self):
        with tempfile.TemporaryDirectory(prefix='astralis-team-test-') as directory:
            server=ThreadingHTTPServer(('127.0.0.1',0),server_module.Handler)
            threading.Thread(target=server.serve_forever,daemon=True).start()
            try:
                with patch.object(server_module,'__file__',str(Path(directory)/'server.py')):
                    def post(body,origin='http://127.0.0.1:8766'):
                        connection=HTTPConnection('127.0.0.1',server.server_port)
                        connection.request('POST','/api/lab/team-export',json.dumps(body),{'Content-Type':'application/json','Origin':origin})
                        response=connection.getresponse();data=json.loads(response.read());connection.close();return response.status,data
                    original={'format':'astralis-team','name':'../../Mon équipe','team':{'members':[{'character':'10000005'}]}}
                    status,data=post(original)
                    self.assertEqual(status,200)
                    file=Path(directory)/data['file']
                    self.assertTrue(file.resolve().is_relative_to(Path(directory).resolve()/'data/lab-user-exports'))
                    self.assertEqual(json.loads(file.read_text(encoding='utf-8')),original)
                    self.assertEqual(post({'format':'astralis-team','name':'Vide','team':{'members':[]}})[0],400)
                    self.assertEqual(post(original,'https://example.com')[0],403)
            finally:
                server.shutdown();server.server_close()

if __name__=='__main__':unittest.main()
