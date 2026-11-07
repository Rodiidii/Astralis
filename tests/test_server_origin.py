import unittest

from server import _is_local_origin


class LocalOriginTests(unittest.TestCase):
    def test_accepts_local_app_origins(self):
        for origin in ("http://127.0.0.1:8766", "http://localhost:8766", "http://[::1]:8766", ""):
            with self.subTest(origin=origin):
                self.assertTrue(_is_local_origin(origin))

    def test_rejects_remote_or_wrong_port_origins(self):
        for origin in ("https://127.0.0.1:8766", "http://example.com:8766", "http://127.0.0.1:80", "null"):
            with self.subTest(origin=origin):
                self.assertFalse(_is_local_origin(origin))


if __name__ == "__main__":
    unittest.main()
