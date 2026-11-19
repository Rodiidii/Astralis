from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "releases"
SKIP_DIRS = {".git", ".idea", ".cache", "__pycache__", "releases", "user-data", "userdata", "local-data", "localdata", "--help", "_backup_avant_modif"}
SKIP_FILES = {".env", "hoyolab.dpapi"}
SKIP_PATHS = {("assets", "user"), ("assets", "card-art", "downloads")}


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


def development_only(relative: Path) -> bool:
    parts = tuple(part.lower() for part in relative.parts)
    return bool(parts and (parts[0] in {"tests", ".github"} or (parts[0] == "docs" and len(parts)>1 and parts[1] != "sources") or parts[:2] == ("vendor", "genshin-optimizer-source")))


def should_skip(relative: Path) -> bool:
    parts = tuple(part.lower() for part in relative.parts)
    if development_only(relative):
        return True
    skipped_path = any(parts[:len(prefix)] == prefix for prefix in SKIP_PATHS)
    return any(part in SKIP_DIRS for part in parts) or skipped_path or relative.name.lower() in SKIP_FILES or relative.name.lower().endswith(".tmp.txt") or relative.name.lower().startswith("tmp-source-") or relative.suffix.lower() in {".pyc", ".pyo"}


def write_checksum(archive: Path) -> None:
    hasher = hashlib.sha256()
    with archive.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(chunk)
    (archive.parent / f"{archive.name}.sha256").write_text(f"{hasher.hexdigest()}  {archive.name}\n", encoding="ascii")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    archive = OUT / "Astralis-Update.zip"
    # Build the exact committed tree. Local profiles, diagnostics and unrelated
    # uncommitted edits must never end up in a public release.
    snapshot = OUT / ".astralis-release-source.zip"
    subprocess.run(["git", "archive", "--format=zip", "HEAD", "--output", str(snapshot)], cwd=ROOT, check=True)
    try:
        with zipfile.ZipFile(snapshot) as source:
            names = sorted(info.filename for info in source.infolist() if not info.is_dir() and not should_skip(Path(info.filename)))
            def copy_files(output, selected):
                for name in selected:
                    if name not in names:
                        continue
                    with source.open(name) as src, output.open(name, "w") as dst:
                        shutil.copyfileobj(src, dst)
            with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as output:
                copy_files(output, names)
            write_checksum(archive)
            base_tags = [sys.argv[i + 1] for i, arg in enumerate(sys.argv[:-1]) if arg == "--base-tag"]
            target_version = source.read("VERSION").decode("utf-8").strip()
            for base_tag in base_tags:
                base_version = base_tag.removeprefix("v")
                changed, deleted = git_changed_files(base_tag)
                patch_archive = OUT / f"Astralis-Patch-from-{base_version}.zip"
                previous = subprocess.check_output(["git","ls-tree","-r","--name-only","-z",base_tag],cwd=ROOT).decode("utf-8").split("\0")
                removed = {name for name in deleted if not should_skip(Path(name))}
                removed.update(name for name in previous if development_only(Path(name)))
                manifest = {"kind": "astralis-delta", "baseVersion": base_version, "version": target_version, "deleted": sorted(removed)}
                with zipfile.ZipFile(patch_archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as output:
                    output.writestr("ASTRALIS-PATCH.json", json.dumps(manifest, ensure_ascii=False))
                    copy_files(output, changed)
                write_checksum(patch_archive)
                print(f"Patch : {patch_archive} ({len(changed)} fichiers modifiés, {len(manifest['deleted'])} supprimés)")
    finally:
        snapshot.unlink(missing_ok=True)
    print(f"Archive : {archive}")
    print("Publie les fichiers ZIP et SHA-256 comme assets de la même release GitHub.")


if __name__ == "__main__":
    main()
