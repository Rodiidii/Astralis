from __future__ import annotations

import hashlib
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "releases"
SKIP_DIRS = {".git", ".idea", ".cache", "__pycache__", "releases", "user-data", "userdata", "local-data", "localdata"}
SKIP_FILES = {".env", "hoyolab.dpapi"}
SKIP_PATHS = {("assets", "user")}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    archive = OUT / "Astralis-Update.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as output:
        for path in sorted(ROOT.rglob("*")):
            if not path.is_file():
                continue
            relative = path.relative_to(ROOT)
            if any(part.lower() in SKIP_DIRS for part in relative.parts) or tuple(part.lower() for part in relative.parts[:2]) in SKIP_PATHS or path.name.lower() in SKIP_FILES or path.name.lower().endswith(".tmp.txt") or path.suffix.lower() in {".pyc", ".pyo"}:
                continue
            output.write(path, relative.as_posix())
    hasher = hashlib.sha256()
    with archive.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(chunk)
    digest = hasher.hexdigest()
    (OUT / "Astralis-Update.zip.sha256").write_text(f"{digest}  Astralis-Update.zip\n", encoding="ascii")
    print(f"Archive : {archive}")
    print(f"SHA-256 : {digest}")
    print("Publie les deux fichiers comme assets de la même release GitHub.")


if __name__ == "__main__":
    main()
