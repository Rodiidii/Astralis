from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "releases"
SKIP_DIRS = {".git", ".idea", ".cache", "__pycache__", "releases", "user-data", "userdata", "local-data", "localdata", "--help"}
SKIP_FILES = {".env", "hoyolab.dpapi"}
SKIP_PATHS = {("assets", "user")}


def git_changed_files(base_tag: str) -> tuple[list[str], list[str]]:
    result = subprocess.run(
        ["git", "diff", "--name-status", "-z", f"{base_tag}..HEAD"],
        cwd=ROOT, check=True, capture_output=True,
    )
    fields = result.stdout.decode("utf-8", "surrogateescape").split("\0")
    changed: list[str] = []
    deleted: list[str] = []
    index = 0
    while index < len(fields) and fields[index]:
        status = fields[index]
        index += 1
        if status.startswith(("R", "C")):
            index += 1
        name = fields[index].replace("\\", "/")
        index += 1
        if status.startswith("D"):
            deleted.append(name)
        elif status[:1] in {"A", "M", "R", "C", "T"}:
            changed.append(name)
    return changed, deleted


def should_skip(relative: Path) -> bool:
    return any(part.lower() in SKIP_DIRS for part in relative.parts) or tuple(part.lower() for part in relative.parts[:2]) in SKIP_PATHS or relative.name.lower() in SKIP_FILES or relative.name.lower().endswith(".tmp.txt") or relative.suffix.lower() in {".pyc", ".pyo"}


def write_checksum(archive: Path) -> None:
    hasher = hashlib.sha256()
    with archive.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(chunk)
    (archive.parent / f"{archive.name}.sha256").write_text(f"{hasher.hexdigest()}  {archive.name}\n", encoding="ascii")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    archive = OUT / "Astralis-Update.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as output:
        for path in sorted(ROOT.rglob("*")):
            if not path.is_file():
                continue
            relative = path.relative_to(ROOT)
            if should_skip(relative):
                continue
            output.write(path, relative.as_posix())
    write_checksum(archive)
    base_tags = [sys.argv[i + 1] for i, arg in enumerate(sys.argv[:-1]) if arg == "--base-tag"]
    if base_tags:
        target_version = (ROOT / "VERSION").read_text(encoding="utf-8").strip()
        for base_tag in base_tags:
            base_version = base_tag.removeprefix("v")
            changed, deleted = git_changed_files(base_tag)
            patch_archive = OUT / f"Astralis-Patch-from-{base_version}.zip"
            manifest = {"kind": "astralis-delta", "baseVersion": base_version, "version": target_version, "deleted": [name for name in deleted if not should_skip(Path(name))]}
            with zipfile.ZipFile(patch_archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as output:
                output.writestr("ASTRALIS-PATCH.json", json.dumps(manifest, ensure_ascii=False))
                for name in changed:
                    relative = Path(name)
                    path = ROOT / relative
                    if path.is_file() and not should_skip(relative):
                        output.write(path, relative.as_posix())
            write_checksum(patch_archive)
            print(f"Patch : {patch_archive} ({len(changed)} fichiers modifiés, {len(manifest['deleted'])} supprimés)")
    print(f"Archive : {archive}")
    print("Publie les fichiers ZIP et SHA-256 comme assets de la même release GitHub.")


if __name__ == "__main__":
    main()
