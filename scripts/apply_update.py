from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
import time
import zipfile
from pathlib import Path, PurePosixPath


def local_root() -> Path:
    return Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local") / "Astralis"


def safe_relative(name: str) -> Path:
    normalized = name.replace("\\", "/")
    part = PurePosixPath(normalized)
    if part.is_absolute() or not part.parts or any(p in {"", ".", ".."} for p in part.parts):
        raise ValueError(f"Chemin interdit dans l’archive : {name}")
    return Path(*part.parts)


def preserved(rel: Path) -> bool:
    parts = {part.lower() for part in rel.parts}
    return bool(parts & {".git", ".cache", "cache", "user-data", "userdata", "local-data", "localdata"}) or (len(rel.parts) >= 2 and rel.parts[0].lower() == "assets" and rel.parts[1].lower() == "user") or rel.name.lower() in {".env", "hoyolab.dpapi"}


def start_app(root: Path) -> None:
    launcher = root / "Lancer Astralis.bat"
    subprocess.Popen(["cmd.exe", "/c", "start", "", str(launcher)], cwd=str(root), stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0) | getattr(subprocess, "DETACHED_PROCESS", 0), close_fds=True)


def main() -> int:
    if len(sys.argv) != 4:
        return 2
    root, archive, server_pid = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve(), int(sys.argv[3])
    if not (root / "server.py").is_file() or not archive.is_file():
        return 3
    time.sleep(1.2)
    subprocess.run(["taskkill", "/PID", str(server_pid), "/T", "/F"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
    for _ in range(30):
        time.sleep(0.5)
        try:
            os.kill(server_pid, 0)
        except OSError:
            break

    local = local_root()
    staging = Path(tempfile.mkdtemp(prefix="astralis-update-", dir=str(local)))
    backup = local / "update-backup"
    changed: list[tuple[Path, Path | None]] = []
    try:
        with zipfile.ZipFile(archive) as zf:
            entries = []
            for info in zf.infolist():
                rel = safe_relative(info.filename.rstrip("/")) if info.filename.rstrip("/") else None
                if rel is None or info.is_dir() or preserved(rel):
                    continue
                mode = (info.external_attr >> 16) & 0o170000
                if mode == 0o120000:
                    raise ValueError("L’archive contient un lien symbolique interdit.")
                entries.append((info, rel))
            if not entries or len(entries) > 100_000:
                raise ValueError("Archive vide ou trop volumineuse en nombre de fichiers.")
            for info, rel in entries:
                target = (root / rel).resolve()
                if root not in target.parents:
                    raise ValueError(f"Chemin hors du dossier Astralis : {info.filename}")
                temp_file = staging / rel
                temp_file.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(info) as src, temp_file.open("wb") as dst:
                    shutil.copyfileobj(src, dst)
        backup.mkdir(parents=True, exist_ok=True)
        for _, rel in entries:
            target, staged = root / rel, staging / rel
            old_copy = None
            if target.exists() and target.is_file():
                old_copy = backup / rel
                old_copy.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(target, old_copy)
            changed.append((target, old_copy))
            target.parent.mkdir(parents=True, exist_ok=True)
            os.replace(staged, target)
        (local / "update-status.json").write_text('{"state":"done","message":"Mise à jour installée.","error":""}', encoding="utf-8")
    except Exception as exc:
        for target, old_copy in reversed(changed):
            try:
                if old_copy and old_copy.exists():
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(old_copy, target)
                else:
                    target.unlink(missing_ok=True)
            except OSError:
                pass
        (local / "update-status.json").write_text('{"state":"error","message":"Échec de l’installation.","error":' + __import__("json").dumps(str(exc), ensure_ascii=False) + '}', encoding="utf-8")
        shutil.rmtree(staging, ignore_errors=True)
        start_app(root)
        return 4
    shutil.rmtree(staging, ignore_errors=True)
    start_app(root)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
