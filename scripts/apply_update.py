from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
import zipfile
from pathlib import Path, PurePosixPath, PureWindowsPath


def local_root() -> Path:
    return Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local") / "Astralis"


def safe_relative(name: str) -> Path:
    normalized = name.replace("\\", "/")
    part = PurePosixPath(normalized)
    win = PureWindowsPath(name)
    if part.is_absolute() or win.is_absolute() or win.drive or not part.parts or any(p in {"", ".", ".."} for p in part.parts):
        raise ValueError(f"Chemin interdit dans l’archive : {name}")
    if "\x00" in name or ":" in part.parts[0]:
        raise ValueError(f"Chemin interdit dans l’archive : {name}")
    return Path(*part.parts)


def preserved(rel: Path) -> bool:
    parts = {part.lower() for part in rel.parts}
    return bool(parts & {".git", ".cache", "cache", "user-data", "userdata", "local-data", "localdata"}) or (len(rel.parts) >= 2 and rel.parts[0].lower() == "assets" and rel.parts[1].lower() == "user") or rel.name.lower() in {".env", "hoyolab.dpapi"}


def write_status(state: str, message: str, error: str = "", version: str = "") -> None:
    local = local_root()
    local.mkdir(parents=True, exist_ok=True)
    data = {"state": state, "message": message, "error": error, "version": version, "updatedAt": time.time()}
    (local / "update-status.json").write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")


def copy_application_tree(source: Path, target: Path) -> None:
    def ignore(directory: str, names: list[str]) -> set[str]:
        current = Path(directory)
        ignored = set()
        for name in names:
            rel = (current / name).relative_to(source)
            if preserved(rel):
                ignored.add(name)
        return ignored
    shutil.copytree(source, target, ignore=ignore)


def expected_instance(root: Path) -> str:
    import hashlib
    return hashlib.sha256(str(root.resolve()).casefold().encode("utf-8")).hexdigest()[:12]


def replace_with_retry(source: Path, destination: Path, attempts: int = 24) -> None:
    """Retry transient Windows sharing violations while the server/browser releases paths."""
    for attempt in range(attempts):
        try:
            os.replace(source, destination)
            return
        except OSError as exc:
            if os.name != "nt" or getattr(exc, "winerror", None) not in {5, 32, 33} or attempt == attempts - 1:
                if os.name == "nt" and getattr(exc, "winerror", None) in {5, 32, 33}:
                    raise OSError(exc.errno, f"Windows garde le dossier Astralis ouvert. Ferme la fenêtre Astralis et l’Explorateur ouvert dans ce dossier, puis relance l’installation. ({exc})", str(source)) from exc
                raise
            time.sleep(min(0.25 * (attempt + 1), 1.0))


def start_app(root: Path, *, server_only: bool = False) -> None:
    launcher = root / "Lancer Astralis.bat"
    if not launcher.is_file():
        raise FileNotFoundError("Le lanceur Windows est absent de la nouvelle version.")
    if server_only:
        command = ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(root / "Installer et lancer Astralis.ps1"), "-ServerOnly"]
        flags = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0) | getattr(subprocess, "DETACHED_PROCESS", 0) | getattr(subprocess, "CREATE_NO_WINDOW", 0)
        subprocess.Popen(command, cwd=str(root), stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=flags, close_fds=True)
        return
    subprocess.Popen(["cmd.exe", "/c", "start", "", str(launcher)], cwd=str(root), stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0) | getattr(subprocess, "DETACHED_PROCESS", 0), close_fds=True)


def wait_for_new_app(version: str, root: Path, timeout: float = 45.0) -> bool:
    url = "http://127.0.0.1:8766/health"
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            request = urllib.request.Request(url, headers={"Cache-Control": "no-cache"})
            with urllib.request.urlopen(request, timeout=2) as response:
                health = json.loads(response.read(32_000).decode("utf-8"))
            if health.get("ok") and str(health.get("version")) == version and str(health.get("instance")) == expected_instance(root):
                return True
        except Exception:
            pass
        time.sleep(0.5)
    return False


def move_preserved_data(old_root: Path, new_root: Path) -> None:
    for source in list(old_root.iterdir()):
        rel = Path(source.name)
        if preserved(rel):
            target = new_root / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            if target.exists():
                if target.is_dir():
                    shutil.rmtree(target)
                else:
                    target.unlink()
            shutil.move(str(source), str(target))
    # Nested preserved paths are moved separately after the containing tree is present.
    for rel in (Path("assets/user"), Path(".env"), Path("hoyolab.dpapi")):
        source = old_root / rel
        if not source.exists():
            continue
        target = new_root / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            if target.is_dir(): shutil.rmtree(target)
            else: target.unlink()
        shutil.move(str(source), str(target))


def main() -> int:
    if len(sys.argv) != 4:
        return 2
    root, archive, server_pid = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve(), int(sys.argv[3])
    if root == root.parent or not (root / "server.py").is_file() or not archive.is_file():
        return 3
    parent = root.parent
    if not parent.is_dir():
        return 3
    suffix = f"{int(time.time())}-{os.getpid()}"
    staging = parent / f".{root.name}.astralis-next-{suffix}"
    backup = parent / f".{root.name}.astralis-previous-{suffix}"
    failed = parent / f".{root.name}.astralis-failed-{suffix}"
    try:
        write_status("installing", "Préparation des fichiers modifiés…")
        with zipfile.ZipFile(archive) as zf:
            patch_info = next((item for item in zf.infolist() if item.filename == "ASTRALIS-PATCH.json"), None)
            patch = json.loads(zf.read(patch_info)) if patch_info else None
            if patch:
                if patch.get("kind") != "astralis-delta" or patch.get("baseVersion") != (root / "VERSION").read_text(encoding="utf-8").strip():
                    raise ValueError("Cette mise à jour différentielle ne correspond pas à la version installée. Relance la vérification pour obtenir l’archive complète.")
                copy_application_tree(root, staging)
                for name in patch.get("deleted", []):
                    rel = safe_relative(str(name))
                    if preserved(rel):
                        continue
                    target = (staging / rel).resolve()
                    if staging.resolve() not in target.parents:
                        raise ValueError(f"Chemin de suppression hors de l’application : {name}")
                    if target.is_dir(): shutil.rmtree(target)
                    else: target.unlink(missing_ok=True)
            else:
                staging.mkdir()
            entries = []
            total = 0
            for info in zf.infolist():
                raw = info.filename.rstrip("/")
                if not raw or info.is_dir() or raw == "ASTRALIS-PATCH.json":
                    continue
                rel = safe_relative(raw)
                mode = (info.external_attr >> 16) & 0o170000
                if mode == 0o120000:
                    raise ValueError("L’archive contient un lien symbolique interdit.")
                if preserved(rel):
                    continue
                total += info.file_size
                if len(entries) >= 100_000 or total > 3_000_000_000:
                    raise ValueError("L’archive dépasse les limites de sécurité prévues.")
                target = (staging / rel).resolve()
                if staging.resolve() not in target.parents:
                    raise ValueError(f"Chemin hors de l’application : {raw}")
                entries.append((info, rel))
            if not entries:
                raise ValueError("L’archive ne contient aucun fichier d’application.")
            for info, rel in entries:
                target = staging / rel
                target.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(info) as src, target.open("wb") as dst:
                    shutil.copyfileobj(src, dst)
        version_file = staging / "VERSION"
        version = version_file.read_text(encoding="utf-8").strip() if version_file.exists() else ""
        if not version:
            raise ValueError("La version publiée ne contient pas de fichier VERSION.")

        write_status("restarting", "Fichiers installés. Redémarrage d’Astralis…", version=version)
        subprocess.run(["taskkill", "/PID", str(server_pid), "/F"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
        for _ in range(40):
            try:
                os.kill(server_pid, 0)
            except OSError:
                break
            time.sleep(0.25)

        replace_with_retry(root, backup)
        move_preserved_data(backup, staging)
        replace_with_retry(staging, root)
        # Keep the existing app window. Its updater poll reloads it once the new server is ready.
        start_app(root, server_only=True)
        if not wait_for_new_app(version, root):
            # Retain both folders for recovery and restore the previous working copy.
            replace_with_retry(root, failed)
            replace_with_retry(backup, root)
            move_preserved_data(failed, root)
            start_app(root)
            raise RuntimeError("La nouvelle instance n’a pas confirmé son démarrage. L’ancienne version a été restaurée.")

        # Permanent deletion, only after /health confirms the new version is serving.
        shutil.rmtree(backup)
        archive.unlink(missing_ok=True)
        write_status("done", "Mise à jour installée et application relancée.", version=version)
        return 0
    except Exception as exc:
        if backup.exists():
            try:
                recovery_source = root if root.exists() and (root / "VERSION").is_file() else staging
                if recovery_source.exists():
                    if root.exists() and recovery_source == root:
                        replace_with_retry(root, failed)
                        recovery_source = failed
                    move_preserved_data(recovery_source, backup)
                if not root.exists():
                    replace_with_retry(backup, root)
                    start_app(root)
            except Exception:
                pass
        shutil.rmtree(staging, ignore_errors=True)
        write_status("error", "Échec de la mise à jour.", str(exc))
        return 4


if __name__ == "__main__":
    raise SystemExit(main())
