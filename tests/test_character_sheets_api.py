"""API integration coverage for author-only shared character sheets."""
import base64
import json
import os
import sys
import tempfile
import threading
import unittest
from http.client import HTTPConnection
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import server as astralis_server


class CharacterSheetsApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        cls.old = {
            "hosted": astralis_server.HOSTED,
            "read_only": astralis_server._CHARACTER_SHEETS_READ_ONLY,
            "access": astralis_server.ACCESS_PASSWORD,
            "admin": astralis_server._CHARACTER_SHEETS_ADMIN_PASSWORD,
            "repo": astralis_server._CHARACTER_SHEETS_GITHUB_REPO,
            "token": astralis_server._CHARACTER_SHEETS_GITHUB_TOKEN,
            "db": astralis_server._CHARACTER_SHEETS_DB,
            "sessions": astralis_server._CHARACTER_SHEETS_ADMIN_SESSIONS.copy(),
        }
        db_path = Path(cls.temp_dir.name) / "sheets.sqlite3"
        os.environ["ASTRALIS_CHARACTER_SHEETS_DB"] = str(db_path)
        astralis_server.HOSTED = True
        astralis_server._CHARACTER_SHEETS_READ_ONLY = False
        astralis_server.ACCESS_PASSWORD = "test-site-password"
        astralis_server._CHARACTER_SHEETS_ADMIN_PASSWORD = "owner-only-password"
        astralis_server._CHARACTER_SHEETS_GITHUB_REPO = ""
        astralis_server._CHARACTER_SHEETS_GITHUB_TOKEN = ""
        astralis_server._CHARACTER_SHEETS_DB = db_path
        astralis_server._CHARACTER_SHEETS_ADMIN_SESSIONS.clear()
        cls.httpd = astralis_server.ThreadingHTTPServer(("127.0.0.1", 0), astralis_server.Handler)
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()
        cls.host = f"127.0.0.1:{cls.httpd.server_port}"
        cls.origin = f"http://{cls.host}"
        cls.auth = "Basic " + base64.b64encode(b"astralis:test-site-password").decode("ascii")

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join(timeout=3)
        os.environ.pop("ASTRALIS_CHARACTER_SHEETS_DB", None)
        astralis_server.HOSTED = cls.old["hosted"]
        astralis_server._CHARACTER_SHEETS_READ_ONLY = cls.old["read_only"]
        astralis_server.ACCESS_PASSWORD = cls.old["access"]
        astralis_server._CHARACTER_SHEETS_ADMIN_PASSWORD = cls.old["admin"]
        astralis_server._CHARACTER_SHEETS_GITHUB_REPO = cls.old["repo"]
        astralis_server._CHARACTER_SHEETS_GITHUB_TOKEN = cls.old["token"]
        astralis_server._CHARACTER_SHEETS_DB = cls.old["db"]
        astralis_server._CHARACTER_SHEETS_ADMIN_SESSIONS.clear()
        astralis_server._CHARACTER_SHEETS_ADMIN_SESSIONS.update(cls.old["sessions"])
        cls.temp_dir.cleanup()

    def request(self, method, path, payload=None, cookie=""):
        connection = HTTPConnection("127.0.0.1", self.httpd.server_port, timeout=5)
        headers = {"Authorization": self.auth, "Origin": self.origin, "Host": self.host}
        if payload is not None:
            headers["Content-Type"] = "application/json"
            body = json.dumps(payload).encode("utf-8")
            headers["Content-Length"] = str(len(body))
        else:
            body = None
        if cookie:
            headers["Cookie"] = cookie
        connection.request(method, path, body=body, headers=headers)
        response = connection.getresponse()
        raw = response.read()
        result = (response.status, json.loads(raw or b"{}"), response.getheader("Set-Cookie"))
        connection.close()
        return result

    def login_as_author(self):
        status, body, cookie_header = self.request("POST", "/api/character-sheets/login", {"password": "owner-only-password"})
        self.assertEqual(status, 200, body)
        self.assertTrue(body["authenticated"])
        self.assertIn("HttpOnly", cookie_header)
        self.assertIn("SameSite=Strict", cookie_header)
        return cookie_header.split(";", 1)[0]

    def test_publish_edit_read_and_remove_require_author_session(self):
        sheet = {
            "id": "test-sheet-0001",
            "characterId": "10000032",
            "characterName": "Bennett",
            "title": "Guide de test",
            "cover": "data:image/png;base64,AAAA",
            "createdAt": 1000,
            "theme": {"accent": "#c4a06b", "paper": "#121a24", "ink": "#eef0f4"},
            "tags": ["guide"],
            "pages": [
                {"id": "page-one", "title": "Build", "blocks": [{"id": "block-one", "type": "text", "content": "<p>Statistiques</p>"}]},
                {"id": "page-two", "title": "Équipe", "blocks": [{"id": "block-two", "type": "team", "team": []}]},
            ],
            "blocks": [{"id": "block-one", "type": "text", "content": "<p>Statistiques</p>"}],
        }
        denied, denied_body, _ = self.request("POST", "/api/character-sheets/publish", {"sheet": sheet})
        self.assertEqual(denied, 403)
        self.assertIn("auteur", denied_body["error"])

        cookie = self.login_as_author()
        created, result, _ = self.request("POST", "/api/character-sheets/publish", {"sheet": sheet}, cookie)
        self.assertEqual(created, 200, result)
        self.assertEqual(result["sheet"]["version"], 1)
        self.assertEqual(result["sheet"]["pageCount"], 2)

        listed, index, _ = self.request("GET", "/api/character-sheets/index")
        self.assertEqual(listed, 200)
        self.assertEqual(index["sheets"][0]["title"], "Guide de test")
        self.assertEqual(index["sheets"][0]["pageCount"], 2)
        self.assertNotIn("cover", index["sheets"][0], "The five-minute metadata check must not transfer embedded images")
        read, document, _ = self.request("GET", "/api/character-sheets/item?id=test-sheet-0001")
        self.assertEqual(read, 200)
        self.assertEqual(len(document["sheet"]["pages"]), 2)
        self.assertEqual(document["sheet"]["version"], 1)

        sheet["title"] = "Guide mis à jour"
        updated, update_result, _ = self.request("POST", "/api/character-sheets/publish", {"sheet": sheet}, cookie)
        self.assertEqual(updated, 200, update_result)
        self.assertEqual(update_result["sheet"]["version"], 2)
        updated_item, updated_document, _ = self.request("GET", "/api/character-sheets/item?id=test-sheet-0001")
        self.assertEqual(updated_item, 200)
        self.assertEqual(updated_document["sheet"]["version"], 2)

        deleted, delete_result, _ = self.request("POST", "/api/character-sheets/delete", {"id": "test-sheet-0001"}, cookie)
        self.assertEqual(deleted, 200, delete_result)
        self.assertTrue(delete_result["deleted"])
        missing, missing_result, _ = self.request("GET", "/api/character-sheets/item?id=test-sheet-0001")
        self.assertEqual(missing, 404, missing_result)

    def test_invalid_page_count_is_rejected(self):
        cookie = self.login_as_author()
        sheet = {
            "id": "test-sheet-many-pages",
            "characterId": "10000032",
            "characterName": "Bennett",
            "title": "Trop de pages",
            "blocks": [],
            "pages": [{"id": f"p-{index}", "title": "Page", "blocks": []} for index in range(21)],
        }
        status, result, _ = self.request("POST", "/api/character-sheets/publish", {"sheet": sheet}, cookie)
        self.assertEqual(status, 400)
        self.assertIn("20 pages", result["error"])

    def test_read_only_hosted_version_blocks_author_and_write_routes(self):
        astralis_server._CHARACTER_SHEETS_READ_ONLY = True
        astralis_server._CHARACTER_SHEETS_ADMIN_SESSIONS["valid-owner-session"] = 4_000_000_000
        try:
            status, status_body, _ = self.request("GET", "/api/character-sheets/status", cookie="astralis_character_sheets_admin=valid-owner-session")
            self.assertEqual(status, 200)
            self.assertTrue(status_body["readOnly"])
            self.assertFalse(status_body["authenticated"])
            login, _, _ = self.request("POST", "/api/character-sheets/login", {"password": "owner-only-password"})
            self.assertEqual(login, 403)
            publish, publish_body, _ = self.request("POST", "/api/character-sheets/publish", {"sheet": {"id": "blocked-sheet-001"}}, cookie="astralis_character_sheets_admin=valid-owner-session")
            self.assertEqual(publish, 403)
            self.assertIn("lecture seule", publish_body["error"])
            delete, _, _ = self.request("POST", "/api/character-sheets/delete", {"id": "blocked-sheet-001"}, cookie="astralis_character_sheets_admin=valid-owner-session")
            self.assertEqual(delete, 403)
        finally:
            astralis_server._CHARACTER_SHEETS_READ_ONLY = False
            astralis_server._CHARACTER_SHEETS_ADMIN_SESSIONS.pop("valid-owner-session", None)


if __name__ == "__main__":
    unittest.main()
