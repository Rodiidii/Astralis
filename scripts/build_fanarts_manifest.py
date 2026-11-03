from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTS = ROOT / "assets" / "fanarts"
OUT = ROOT / "assets" / "fanarts-manifest.json"
EXTENSIONS = {".webp", ".jpg", ".jpeg", ".png", ".avif"}

manifest = {
    "sha256": {
        path.name.lower(): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in sorted(ARTS.iterdir())
        if path.is_file() and path.suffix.lower() in EXTENSIONS
    }
}
OUT.write_text(json.dumps(manifest, separators=(",", ":")), encoding="utf-8")
print(f"Manifest écrit : {len(manifest['sha256'])} illustrations")
