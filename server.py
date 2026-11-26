from __future__ import annotations
from endgame_archive import refresh_background as endgame_archive
from lab_data_sync import refresh as refresh_lab_data
from app_maintenance import start_maintenance,celestia_status
import desktop_integration
import community_services
from update_progress import write_status as persist_update_status, read_status as saved_update_status

import json
import os
import re
import threading
import time
import unicodedata
import hashlib
import hmac
import binascii
import ipaddress
import secrets
import sqlite3
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from urllib.parse import parse_qs, urlsplit, unquote, urlparse, quote, urlencode, urljoin

_SERVER_ROOT = Path(__file__).resolve().parent
_SERVER_VERSION_FILE = _SERVER_ROOT / "VERSION"
_SERVER_VERSION = _SERVER_VERSION_FILE.read_text(encoding="utf-8-sig").strip() if _SERVER_VERSION_FILE.exists() else "0.0.0"
_SERVER_INSTANCE = hashlib.sha256(str(_SERVER_ROOT).casefold().encode("utf-8")).hexdigest()[:12]

HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8766"))
HOSTED = os.environ.get("ASTRALIS_HOSTED", "").strip().lower() in {"1", "true", "yes"} or bool(os.environ.get("RENDER"))
_CHARACTER_SHEETS_READ_ONLY = HOSTED or os.environ.get("ASTRALIS_CHARACTER_SHEETS_READ_ONLY", "").strip().lower() in {"1", "true", "yes"}
ACCESS_PASSWORD = os.environ.get("ASTRALIS_ACCESS_PASSWORD", "")
TTL = 900
cache: dict[str, tuple[float, bytes]] = {}
cache_lock = threading.Lock()
_HOYOLAB_RESIN_CACHE: tuple[float, dict] | None = None
_UPDATE_STATUS: dict[str, object] = {"state": "idle"}
_UPDATE_LOCK = threading.Lock()
_UPDATE_ACTIVE = {"checking","downloading","verifying","staged","extracting","closing","replacing","starting","cleaning","opening"}
_APP_SESSIONS: dict[str, float] = {}
_APP_WINDOW_TITLES: dict[str, str] = {}
_APP_SESSION_LOCK = threading.Lock()
_APP_SESSIONS_SEEN = False
_APP_SHUTDOWN_TIMER: threading.Timer | None = None
_APP_HTTP_SERVER: ThreadingHTTPServer | None = None
_CHARACTER_SHEETS_ADMIN_PASSWORD = os.environ.get("ASTRALIS_CHARACTER_SHEETS_ADMIN_PASSWORD", "")
if not HOSTED and not community_services.owner_settings() and not _CHARACTER_SHEETS_ADMIN_PASSWORD and not os.environ.get("ASTRALIS_CHARACTER_SHEETS_DB"):
    _CHARACTER_SHEETS_READ_ONLY=True
_CHARACTER_SHEETS_GITHUB_REPO = os.environ.get("ASTRALIS_CHARACTER_SHEETS_GITHUB_REPO", "").strip()
_CHARACTER_SHEETS_GITHUB_TOKEN = os.environ.get("ASTRALIS_CHARACTER_SHEETS_GITHUB_TOKEN", "")
if not HOSTED and not os.environ.get('ASTRALIS_CHARACTER_SHEETS_DB') and not _CHARACTER_SHEETS_GITHUB_TOKEN:
    _CHARACTER_SHEETS_GITHUB_REPO,_CHARACTER_SHEETS_GITHUB_TOKEN=community_services.creator_github_credentials()
_CHARACTER_SHEETS_GITHUB_PATH = os.environ.get("ASTRALIS_CHARACTER_SHEETS_GITHUB_PATH", "published/character-sheets").strip().strip("/")
_CHARACTER_SHEETS_DB = Path(os.environ.get("ASTRALIS_CHARACTER_SHEETS_DB", str(_SERVER_ROOT / "data" / "character-sheets.sqlite3"))).expanduser()
_CHARACTER_SHEETS_ADMIN_SESSIONS: dict[str, float] = {}
_CHARACTER_SHEETS_LOGIN_FAILURES: dict[str, tuple[int, float]] = {}
_CHARACTER_SHEETS_LOCK = threading.RLock()
_CHARACTER_SHEETS_LIMIT = 5_000_000

def _shutdown_app_if_idle() -> None:
    global _APP_SHUTDOWN_TIMER
    with _APP_SESSION_LOCK:
        _APP_SHUTDOWN_TIMER = None
        if not _APP_SESSIONS_SEEN or _APP_SESSIONS or not _APP_HTTP_SERVER:
            return
        if saved_update_status().get("state") in _UPDATE_ACTIVE:
            return
        server = _APP_HTTP_SERVER
    print("[Astralis] Toutes les fenêtres sont fermées; arrêt du serveur local.")
    server.shutdown()

def _schedule_app_shutdown_locked() -> None:
    global _APP_SHUTDOWN_TIMER
    if _APP_SHUTDOWN_TIMER:
        return
    _APP_SHUTDOWN_TIMER = threading.Timer(12, _shutdown_app_if_idle)
    _APP_SHUTDOWN_TIMER.daemon = True
    _APP_SHUTDOWN_TIMER.start()

def _watch_app_sessions() -> None:
    while True:
        time.sleep(30)
        now = time.time()
        with _APP_SESSION_LOCK:
            for session, heartbeat in list(_APP_SESSIONS.items()):
                if now - heartbeat > 180:
                    _APP_SESSIONS.pop(session, None)
            if _APP_SESSIONS_SEEN and not _APP_SESSIONS:
                _schedule_app_shutdown_locked()

def _github_release(repo: str) -> dict:
    if not re.fullmatch(r"[A-Za-z0-9_.-]{1,100}/[A-Za-z0-9_.-]{1,100}", repo):
        raise ValueError("Dépôt GitHub invalide. Format attendu : propriétaire/dépôt.")
    request = Request(f"https://api.github.com/repos/{repo}/releases/latest", headers={"Accept":"application/vnd.github+json", "User-Agent":"Astralis-Updater"})
    with urlopen(request, timeout=18) as response:
        release = json.loads(response.read(2_000_000))
    assets = release.get("assets", [])
    archive = next((asset for asset in assets if asset.get("name") == "Astralis-Update.zip"), None)
    checksum = next((asset for asset in assets if asset.get("name") == "Astralis-Update.zip.sha256"), None)
    patches = []
    for asset in assets:
        match = re.fullmatch(r"Astralis-Patch-from-(\d+\.\d+\.\d+)\.zip", str(asset.get("name", "")))
        if not match:
            continue
        patch_checksum = next((item for item in assets if item.get("name") == f"{asset['name']}.sha256"), None)
        patches.append({"fromVersion":match.group(1), "name":asset["name"], "url":asset.get("browser_download_url"), "digest":asset.get("digest"), "checksumUrl":patch_checksum.get("browser_download_url") if patch_checksum else None, "size":asset.get("size", 0)})
    if not archive:
        raise LookupError("La dernière version ne contient pas l’archive Astralis-Update.zip.")
    return {"tag":str(release.get("tag_name", "")), "name":str(release.get("name") or release.get("tag_name") or "Version publiée"), "notes":str(release.get("body") or "")[:12000], "url":archive.get("browser_download_url"), "digest":archive.get("digest"), "checksumUrl":checksum.get("browser_download_url"), "patches":patches, "published":release.get("published_at")}

def _version_key(value: str) -> tuple[int, int, int, int, str]:
    """Compare numeric release versions instead of treating older tags as updates."""
    match = re.fullmatch(r"v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?", str(value).strip())
    if not match:
        raise ValueError(f"Version invalide : {value!r}")
    major, minor, patch, prerelease = match.groups()
    return int(major), int(minor), int(patch), 0 if prerelease else 1, prerelease or ""

def _installed_update_version(root: Path, client_version: str = "") -> str:
    """Use the installed app's VERSION file; cached HTML may report a stale value."""
    candidates = []
    version_file = root / "VERSION"
    try:
        candidates.append(version_file.read_text(encoding="utf-8").strip())
    except OSError:
        pass
    candidates.append(str(client_version).strip())
    for candidate in candidates:
        normalized = candidate.removeprefix("v")
        if re.fullmatch(r"\d+\.\d+\.\d+", normalized):
            return normalized
    raise ValueError("Version installée introuvable. Relance Astralis avec son lanceur.")

def _is_local_origin(origin: str) -> bool:
    if not origin:
        return True
    try:
        parsed = urlsplit(origin)
        host = (parsed.hostname or "").lower()
        local_host = host == "localhost" or (bool(host) and ipaddress.ip_address(host).is_loopback)
        return parsed.scheme == "http" and parsed.port == PORT and local_host
    except (ValueError, TypeError):
        return False

def _same_site_origin(origin: str, host_header: str) -> bool:
    if not origin:
        return False
    try:
        parsed = urlsplit(origin)
        return parsed.scheme in {"http", "https"} and bool(parsed.netloc) and parsed.netloc.lower() == host_header.lower()
    except (ValueError, TypeError):
        return False

def _character_sheets_storage() -> dict[str, object]:
    github_configured = bool(_CHARACTER_SHEETS_GITHUB_REPO and _CHARACTER_SHEETS_GITHUB_TOKEN)
    configured_path = bool(os.environ.get("ASTRALIS_CHARACTER_SHEETS_DB"))
    ready = github_configured or configured_path or not HOSTED
    return {
        "ready": ready,
        "kind": "github" if github_configured else "sqlite",
        "label": f"GitHub · {_CHARACTER_SHEETS_GITHUB_REPO}" if github_configured else "Base locale" if not HOSTED else "Stockage persistant à configurer",
        "setupRequired": HOSTED and not ready,
    }

def _character_sheets_github_request(method: str, body: dict | None = None, path: str | None = None, raw: bool = False) -> tuple[int, object]:
    if not _CHARACTER_SHEETS_GITHUB_REPO or not _CHARACTER_SHEETS_GITHUB_TOKEN:
        raise RuntimeError("Stockage GitHub des fiches non configuré.")
    if not re.fullmatch(r"[A-Za-z0-9_.-]{1,100}/[A-Za-z0-9_.-]{1,100}", _CHARACTER_SHEETS_GITHUB_REPO):
        raise RuntimeError("Dépôt de fiches invalide.")
    branch = os.environ.get("ASTRALIS_CHARACTER_SHEETS_GITHUB_BRANCH", "main")
    url = f"https://api.github.com/repos/{_CHARACTER_SHEETS_GITHUB_REPO}/contents/{quote(path or _CHARACTER_SHEETS_GITHUB_PATH, safe='/')}"
    if method == "GET":
        url += "?ref=" + quote(branch, safe="")
    data = json.dumps(body).encode("utf-8") if body is not None else None
    request = Request(url, data=data, method=method, headers={
        "Accept": "application/vnd.github.raw+json" if raw else "application/vnd.github+json",
        "Authorization": f"Bearer {_CHARACTER_SHEETS_GITHUB_TOKEN}",
        "User-Agent": "Astralis-Character-Sheets",
        "X-GitHub-Api-Version": "2022-11-28",
        **({"Content-Type": "application/json"} if data is not None else {}),
    })
    try:
        with urlopen(request, timeout=14) as response:
            response_body=response.read(7_000_000)
            if raw:return response.status,response_body
            return response.status,json.loads(response_body) if response_body else {}
    except HTTPError as exc:
        try: payload = json.loads(exc.read(64_000))
        except Exception: payload = {}
        if exc.code == 404: return 404, payload
        raise RuntimeError(payload.get("message") or f"GitHub a refusé le stockage ({exc.code}).") from exc

def _character_sheets_github_read(path: str) -> dict | None:
    status,record=_character_sheets_github_request("GET",path=path)
    if status==404:return None
    try:
        encoded=record.get("content","") if isinstance(record,dict) else ""
        if encoded:raw=binascii.a2b_base64(encoded.replace("\n",""))
        else:
            _,raw=_character_sheets_github_request("GET",path=path,raw=True)
            if isinstance(raw,dict):raw=json.dumps(raw).encode("utf-8")
        payload=json.loads(raw)
        if not isinstance(payload,dict):raise ValueError("Format invalide.")
        return payload
    except Exception as exc:
        raise RuntimeError("Un fichier distant de fiches est illisible.") from exc

def _character_sheets_github_write(path: str, payload: dict, message: str) -> None:
    _,current=_character_sheets_github_request("GET",path=path)
    content=binascii.b2a_base64(json.dumps(payload,ensure_ascii=False,indent=2).encode("utf-8")).decode("ascii").replace("\n","")
    body={"message":message,"branch":os.environ.get("ASTRALIS_CHARACTER_SHEETS_GITHUB_BRANCH","main"),"content":content}
    if current.get("sha"):body["sha"]=current["sha"]
    _character_sheets_github_request("PUT",body,path)

def _character_sheets_github_remove(path: str, message: str) -> bool:
    status,current=_character_sheets_github_request("GET",path=path)
    if status==404:return False
    _character_sheets_github_request("DELETE",{"message":message,"branch":os.environ.get("ASTRALIS_CHARACTER_SHEETS_GITHUB_BRANCH","main"),"sha":current.get("sha")},path)
    return True

def _character_sheets_github_index() -> list[dict]:
    payload=_character_sheets_github_read(f"{_CHARACTER_SHEETS_GITHUB_PATH}/index.json") or {}
    rows=payload.get("sheets",[])
    return rows if isinstance(rows,list) else []

def _character_sheets_read() -> list[dict]:
    with _CHARACTER_SHEETS_LOCK:
        if _CHARACTER_SHEETS_GITHUB_REPO and _CHARACTER_SHEETS_GITHUB_TOKEN:
            output=[]
            for metadata in _character_sheets_github_index():
                sheet_id=str(metadata.get("id", "")) if isinstance(metadata,dict) else ""
                if re.fullmatch(r"[A-Za-z0-9_-]{8,80}",sheet_id):
                    sheet=_character_sheets_github_read(f"{_CHARACTER_SHEETS_GITHUB_PATH}/sheets/{sheet_id}.json")
                    if sheet:output.append(sheet)
            return output
        _CHARACTER_SHEETS_DB.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(_CHARACTER_SHEETS_DB, timeout=10) as connection:
            connection.execute("CREATE TABLE IF NOT EXISTS character_sheets (id TEXT PRIMARY KEY, document TEXT NOT NULL, updated_at INTEGER NOT NULL)")
            rows = connection.execute("SELECT document FROM character_sheets ORDER BY updated_at DESC").fetchall()
        output=[]
        for (document,) in rows:
            try: output.append(json.loads(document))
            except (TypeError, ValueError): continue
        return output

def _character_sheets_public(path: str) -> dict | None:
    key="public-character-sheets:"+path
    with cache_lock:old=cache.get(key)
    if old and time.time()-old[0]<20:return json.loads(old[1])
    request=Request("https://raw.githubusercontent.com/Rodiidii/Astralis/main/published/character-sheets/"+quote(path,safe="/")+"?v="+str(int(time.time()//15)),headers={"User-Agent":"Astralis-Public-Sheets","Cache-Control":"no-cache"})
    with urlopen(request,timeout=10) as response:data=json.loads(response.read(6_000_000))
    if isinstance(data,dict):
        with cache_lock:cache[key]=(time.time(),json.dumps(data).encode())
        return data
    return None

def _character_sheets_get(sheet_id: str) -> dict | None:
    if _CHARACTER_SHEETS_GITHUB_REPO and _CHARACTER_SHEETS_GITHUB_TOKEN:
        return _character_sheets_github_read(f"{_CHARACTER_SHEETS_GITHUB_PATH}/sheets/{sheet_id}.json")
    if not HOSTED and not os.environ.get("ASTRALIS_CHARACTER_SHEETS_DB"):
        try:
            public=_character_sheets_public("sheets/"+sheet_id+".json")
            if public:return public.get("sheet",public)
        except Exception:pass
    return next((row for row in _character_sheets_read() if row.get("id")==sheet_id),None)

def _character_sheets_index() -> list[dict]:
    if _CHARACTER_SHEETS_GITHUB_REPO and _CHARACTER_SHEETS_GITHUB_TOKEN:
        rows=_character_sheets_github_index()
    else:
        rows=_character_sheets_read()
    if not _CHARACTER_SHEETS_GITHUB_TOKEN and not HOSTED and not os.environ.get("ASTRALIS_CHARACTER_SHEETS_DB"):
        try:
            remote=_character_sheets_public("index.json")
            if isinstance(remote,dict):
                indexed={str(row.get("id")):row for row in rows}
                for row in remote.get("sheets",[]):
                    if isinstance(row,dict) and row.get("id"):indexed[str(row["id"])]=row
                rows=list(indexed.values())
        except Exception:pass
    return [_character_sheets_metadata(row) for row in rows]

def _character_sheets_write(sheet: dict) -> dict:
    with _CHARACTER_SHEETS_LOCK:
        if _CHARACTER_SHEETS_GITHUB_REPO and _CHARACTER_SHEETS_GITHUB_TOKEN:
            document_path=f"{_CHARACTER_SHEETS_GITHUB_PATH}/sheets/{sheet['id']}.json"
            previous=_character_sheets_github_read(document_path)
            sheet["version"]=max(1,int(previous.get("version",1))+1) if previous else 1
            sheet["updatedAt"]=int(time.time()*1000)
            if not previous:sheet["createdAt"]=sheet["createdAt"] or sheet["updatedAt"]
            serialized=json.dumps(sheet,ensure_ascii=False,separators=(",",":"))
            if len(serialized.encode("utf-8"))>_CHARACTER_SHEETS_LIMIT:raise ValueError("Cette fiche dépasse la limite de 5 Mo.")
            _character_sheets_github_write(document_path,sheet,f"Publier la fiche personnage {sheet.get('title') or sheet['id']}")
            rows=[row for row in _character_sheets_github_index() if isinstance(row,dict) and row.get("id")!=sheet["id"]]
            rows.insert(0,_character_sheets_metadata(sheet))
            _character_sheets_github_write(f"{_CHARACTER_SHEETS_GITHUB_PATH}/index.json",{"schemaVersion":1,"updatedAt":int(time.time()*1000),"sheets":rows},"Mettre à jour l’index des fiches Astralis")
            return sheet
        rows = _character_sheets_read()
        previous=next((row for row in rows if row.get("id")==sheet["id"]),None)
        sheet["version"]=max(1,int(previous.get("version",1))+1) if previous else 1
        sheet["updatedAt"]=int(time.time()*1000)
        if not previous:sheet["createdAt"]=sheet["createdAt"] or sheet["updatedAt"]
        serialized=json.dumps(sheet,ensure_ascii=False,separators=(",",":"))
        if len(serialized.encode("utf-8"))>_CHARACTER_SHEETS_LIMIT:raise ValueError("Cette fiche dépasse la limite de 5 Mo.")
        _CHARACTER_SHEETS_DB.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(_CHARACTER_SHEETS_DB, timeout=10) as connection:
            connection.execute("CREATE TABLE IF NOT EXISTS character_sheets (id TEXT PRIMARY KEY, document TEXT NOT NULL, updated_at INTEGER NOT NULL)")
            connection.execute("INSERT INTO character_sheets(id,document,updated_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document,updated_at=excluded.updated_at", (sheet["id"],serialized,int(sheet["updatedAt"])))
        return sheet

def _character_sheets_delete(sheet_id: str) -> bool:
    with _CHARACTER_SHEETS_LOCK:
        if _CHARACTER_SHEETS_GITHUB_REPO and _CHARACTER_SHEETS_GITHUB_TOKEN:
            rows=_character_sheets_github_index()
            filtered=[row for row in rows if isinstance(row,dict) and row.get("id")!=sheet_id]
            if len(filtered)==len(rows):return False
            _character_sheets_github_write(f"{_CHARACTER_SHEETS_GITHUB_PATH}/index.json",{"schemaVersion":1,"updatedAt":int(time.time()*1000),"sheets":filtered},f"Retirer la fiche personnage {sheet_id} de l’index")
            _character_sheets_github_remove(f"{_CHARACTER_SHEETS_GITHUB_PATH}/sheets/{sheet_id}.json",f"Supprimer la fiche personnage {sheet_id}")
            return True
        _CHARACTER_SHEETS_DB.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(_CHARACTER_SHEETS_DB, timeout=10) as connection:
            connection.execute("CREATE TABLE IF NOT EXISTS character_sheets (id TEXT PRIMARY KEY, document TEXT NOT NULL, updated_at INTEGER NOT NULL)")
            cursor=connection.execute("DELETE FROM character_sheets WHERE id=?", (sheet_id,))
            return cursor.rowcount > 0

def _character_sheets_metadata(sheet: dict) -> dict:
    metadata={key:sheet.get(key) for key in ("id","characterId","characterName","title","theme","version","createdAt","updatedAt","publishedAt","tags") if key in sheet}
    cover=str(sheet.get("cover") or "")
    if cover.startswith("https://") and len(cover)<2048:metadata["cover"]=cover
    metadata["pageCount"]=len(sheet.get("pages",[])) if isinstance(sheet.get("pages"),list) else max(1,int(sheet.get("pageCount",1)))
    return metadata

def _character_sheets_cookie_token(cookie_header: str) -> str:
    for part in cookie_header.split(";"):
        name, separator, value = part.strip().partition("=")
        if separator and name == "astralis_character_sheets_admin": return value
    return ""

def _character_sheets_is_admin(handler: "Handler") -> bool:
    if _CHARACTER_SHEETS_READ_ONLY: return False
    try: local_admin = not HOSTED and ipaddress.ip_address(handler.client_address[0]).is_loopback
    except (ValueError, TypeError): local_admin = False
    if local_admin: return True
    token = _character_sheets_cookie_token(handler.headers.get("Cookie", ""))
    with _CHARACTER_SHEETS_LOCK:
        now=time.time()
        for key,expires in list(_CHARACTER_SHEETS_ADMIN_SESSIONS.items()):
            if expires <= now: _CHARACTER_SHEETS_ADMIN_SESSIONS.pop(key,None)
        return bool(token and token in _CHARACTER_SHEETS_ADMIN_SESSIONS)

def _validate_character_sheet(value: object) -> dict:
    if not isinstance(value, dict): raise ValueError("Format de fiche invalide.")
    sheet=dict(value)
    sheet_id=str(sheet.get("id", ""))
    if not re.fullmatch(r"[A-Za-z0-9_-]{8,80}", sheet_id): raise ValueError("Identifiant de fiche invalide.")
    for field,label,max_len in (("characterId","personnage",160),("characterName","nom du personnage",160),("title","titre",180)):
        content=str(sheet.get(field, "")).strip()
        if not content or len(content)>max_len: raise ValueError(f"Le champ {label} est manquant ou trop long.")
        sheet[field]=content
    blocks=sheet.get("blocks")
    pages=sheet.get("pages")
    if pages is None: pages=[{"id":"page-1","title":"Présentation","blocks":blocks if isinstance(blocks,list) else []}]
    if not isinstance(pages,list) or not 1<=len(pages)<=20: raise ValueError("Une fiche doit contenir entre 1 et 20 pages.")
    clean_pages=[]
    for index,page in enumerate(pages):
        if not isinstance(page,dict): raise ValueError("Format de page invalide.")
        page_id=str(page.get("id") or f"page-{index+1}")
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,100}",page_id): raise ValueError("Identifiant de page invalide.")
        page_blocks=page.get("blocks",[])
        if not isinstance(page_blocks,list) or len(page_blocks)>100: raise ValueError("Une page peut contenir au maximum 100 blocs.")
        clean_pages.append({"id":page_id,"title":str(page.get("title") or f"Page {index+1}")[:100],"blocks":page_blocks})
    if not isinstance(blocks,list) or len(blocks)>100: blocks=clean_pages[0]["blocks"]
    sheet["pages"]=clean_pages
    sheet["blocks"]=blocks
    sheet["createdAt"]=max(0,int(sheet.get("createdAt") or time.time()*1000))
    sheet["updatedAt"]=int(time.time()*1000)
    sheet["publishedAt"]=sheet["updatedAt"]
    sheet["tags"]=[str(tag)[:40] for tag in sheet.get("tags",[])[:20] if str(tag).strip()] if isinstance(sheet.get("tags",[]),list) else []
    serialized=json.dumps(sheet,ensure_ascii=False,separators=(",",":"))
    if len(serialized.encode("utf-8"))>_CHARACTER_SHEETS_LIMIT: raise ValueError("Cette fiche dépasse la limite de 5 Mo.")
    return sheet

def _set_update_status(**values: object) -> None:
    global _UPDATE_STATUS
    with _UPDATE_LOCK:
        _UPDATE_STATUS = persist_update_status(**values)


def _update_archive_paths(updates: Path, download_name: str) -> tuple[Path, Path]:
    """Give each download private paths so Windows never has to overwrite a locked prior ZIP."""
    token = secrets.token_hex(8)
    safe_name = Path(download_name).name or "Astralis-Update.zip"
    return updates / f"{safe_name}.{token}.part", updates / f"Astralis-Update-{token}.zip"

def _download_update(repo: str, tag: str, from_version: str) -> None:
    global _UPDATE_STATUS
    archive = final_archive = None
    try:
        release = _github_release(repo)
        if release["tag"] != tag:
            raise ValueError("La version disponible a changé. Vérifie à nouveau les mises à jour.")
        if not release.get("digest") and not release.get("checksumUrl"):
            raise ValueError("Cette version ne fournit pas de somme SHA-256 vérifiable.")
        root = Path(__file__).resolve().parent
        updates = Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local") / "Astralis" / "updates"
        updates.mkdir(parents=True, exist_ok=True)
        patch = next((item for item in release.get("patches", []) if item.get("fromVersion") == from_version), None)
        selected = patch if patch else {"name":"Astralis-Update.zip", "url":release["url"], "digest":release.get("digest"), "checksumUrl":release.get("checksumUrl"), "size":0}
        archive, final_archive = _update_archive_paths(updates, str(selected["name"]))
        digest = hashlib.sha256()
        total_bytes = int(selected.get("size") or 0)
        _set_update_status(state="downloading", message="Téléchargement des fichiers modifiés…" if patch else "Téléchargement de l’archive complète…", error="", tag=tag, downloadName=selected["name"], receivedBytes=0, totalBytes=total_bytes, percent=0, differential=bool(patch))
        request = Request(str(selected["url"]), headers={"User-Agent":"Astralis-Updater", "Accept":"application/octet-stream"})
        with urlopen(request, timeout=120) as response, archive.open("wb") as output:
            if not total_bytes:
                try: total_bytes = int(response.headers.get("Content-Length", "0"))
                except ValueError: total_bytes = 0
            received = 0
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk: break
                output.write(chunk); digest.update(chunk); received += len(chunk)
                percent = min(100, round(received * 100 / total_bytes)) if total_bytes else 0
                _set_update_status(state="downloading", message="Téléchargement des fichiers modifiés…" if patch else "Téléchargement de l’archive complète…", receivedBytes=received, totalBytes=total_bytes, percent=percent)
        _set_update_status(state="verifying", message="Vérification SHA-256 de l’archive…")
        actual = digest.hexdigest()
        expected = str(selected.get("digest") or "").removeprefix("sha256:").lower()
        if not expected and selected.get("checksumUrl"):
            check_req = Request(str(selected["checksumUrl"]), headers={"User-Agent":"Astralis-Updater"})
            with urlopen(check_req, timeout=30) as response:
                expected = re.search(r"\b([0-9a-fA-F]{64})\b", response.read(4096).decode("ascii", "ignore")).group(1).lower()
        if not expected or not secrets.compare_digest(actual, expected):
            archive.unlink(missing_ok=True)
            raise ValueError("La vérification SHA-256 a échoué. Aucun fichier n’a été modifié.")
        archive.replace(final_archive)
        _set_update_status(state="extracting", message=("Mise à jour différentielle vérifiée. Préparation…" if patch else "Archive complète vérifiée. Préparation…"), error="", percent=100)
        import shutil
        worker = updates / ("worker-" + secrets.token_hex(6))
        worker.mkdir()
        for source, name in [(root / "scripts" / "apply_update.py", "apply_update.py"), (root / "update_progress.py", "update_progress.py"), (root / "desktop_integration.py", "desktop_integration.py")]:
            shutil.copy2(source, worker / name)
        helper = worker / "apply_update.py"
        flags = getattr(__import__('subprocess'), "CREATE_NEW_PROCESS_GROUP", 0) | getattr(__import__("subprocess"), "CREATE_NO_WINDOW", 0)
        import subprocess
        subprocess.Popen([os.sys.executable, str(helper), str(root), str(final_archive), str(os.getpid())], cwd=str(updates), creationflags=flags, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, close_fds=True)
    except Exception as exc:
        for incomplete in (archive, final_archive):
            if incomplete:
                try: incomplete.unlink(missing_ok=True)
                except OSError: pass
        _set_update_status(state="error", message="Mise à jour interrompue.", error=str(exc))

def _hoyolab_secret_path() -> Path:
    root = Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local") / "Astralis"
    root.mkdir(parents=True, exist_ok=True)
    return root / "hoyolab.dpapi"

def _dpapi(data: bytes, protect: bool) -> bytes:
    """Encrypt/decrypt a small local secret with the current Windows user profile."""
    if os.name != "nt":
        raise RuntimeError("Le coffre HoYoLAB sécurisé requiert Windows DPAPI.")
    import ctypes
    from ctypes import wintypes
    class Blob(ctypes.Structure):
        _fields_ = [("cbData", wintypes.DWORD), ("pbData", ctypes.POINTER(ctypes.c_ubyte))]
    source = ctypes.create_string_buffer(data)
    incoming = Blob(len(data), ctypes.cast(source, ctypes.POINTER(ctypes.c_ubyte)))
    outgoing = Blob()
    crypt = ctypes.windll.crypt32.CryptProtectData if protect else ctypes.windll.crypt32.CryptUnprotectData
    if protect:
        ok = crypt(ctypes.byref(incoming), "Astralis HoYoLAB", None, None, None, 0x01, ctypes.byref(outgoing))
    else:
        ok = crypt(ctypes.byref(incoming), None, None, None, None, 0x01, ctypes.byref(outgoing))
    if not ok:
        raise OSError("Windows n’a pas pu ouvrir le coffre local DPAPI.")
    try:
        return ctypes.string_at(outgoing.pbData, outgoing.cbData)
    finally:
        ctypes.windll.kernel32.LocalFree(outgoing.pbData)

def _read_hoyolab_secret() -> dict | None:
    path = _hoyolab_secret_path()
    if not path.exists(): return None
    return json.loads(_dpapi(path.read_bytes(), False).decode("utf-8"))

def _write_hoyolab_secret(data: dict | None) -> None:
    path = _hoyolab_secret_path()
    if data is None:
        path.unlink(missing_ok=True)
        return
    path.write_bytes(_dpapi(json.dumps(data, ensure_ascii=False).encode("utf-8"), True))

def _fetch_hoyolab_resin() -> dict:
    global _HOYOLAB_RESIN_CACHE
    now = time.time()
    if _HOYOLAB_RESIN_CACHE and now - _HOYOLAB_RESIN_CACHE[0] < 60:
        return _HOYOLAB_RESIN_CACHE[1]
    auth = _read_hoyolab_secret()
    if not auth: raise LookupError("Configure la connexion HoYoLAB locale dans l’onglet HoYoLAB.")
    uid, region, cookie = auth["uid"], auth["region"], auth["cookie"]
    url = f"https://bbs-api-os.hoyolab.com/game_record/genshin/api/dailyNote?server={region}&role_id={uid}"
    timestamp, rand = str(int(now)), secrets.token_hex(4)
    query = f"server={region}&role_id={uid}"
    digest = hashlib.md5(f"salt=6s25p5ox5y14umn1p61aqyyvbvvl3lrt&t={timestamp}&r={rand}&b=&q={query}".encode()).hexdigest()
    req = Request(url, headers={"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36", "Accept":"application/json", "Referer":"https://act.hoyolab.com/", "Origin":"https://act.hoyolab.com", "x-rpc-app_version":"2.71.1", "x-rpc-client_type":"5", "x-rpc-language":"fr-fr", "DS":f"{timestamp},{rand},{digest}", "Cookie":cookie})
    with urlopen(req, timeout=18) as response: payload = json.loads(response.read())
    if payload.get("retcode") != 0:
        message = str(payload.get("message") or "")
        if "not public" in message.lower() or "non public" in message.lower():
            raise RuntimeError("HoYoLAB indique que ta Chronique de bataille est privée. Dans HoYoLAB, ouvre Compte → Ma Chronique de bataille et active l’option Public, puis vérifie que l’UID et le serveur Europe correspondent à ton compte Genshin.")
        if payload.get("retcode") in {10102, 10103}:
            raise RuntimeError("HoYoLAB ne peut pas lire cette Chronique de bataille. Rends-la publique dans HoYoLAB → Compte → Ma Chronique de bataille, puis vérifie l’UID et le serveur.")
        raise RuntimeError(message or "HoYoLAB a refusé la requête. Vérifie la session, le serveur et l’UID.")
    data = payload.get("data") or {}
    result = {"current":int(data.get("current_resin",0)),"maximum":int(data.get("max_resin",200)),"recoverySeconds":int(data.get("resin_recovery_time",0)),"updatedAt":now,"source":"HoYoLAB · Battle Chronicle"}
    _HOYOLAB_RESIN_CACHE = (now, result)
    return result

SOURCES = {
    ("hsr", "character"): "https://vizualabstract.github.io/StarRailStaticAPI/db/fr/characters.json",
    ("hsr", "weapon"): "https://vizualabstract.github.io/StarRailStaticAPI/db/fr/light_cones.json",
    ("hsr", "artifact"): "https://vizualabstract.github.io/StarRailStaticAPI/db/fr/relic_sets.json",
    ("hsr", "skills"): "https://vizualabstract.github.io/StarRailStaticAPI/db/fr/character_skills.json",
    ("gi", "character"): "https://genshin.jmp.blue/characters/all",
    ("gi", "weapon"): "https://genshin.jmp.blue/weapons/all",
    ("gi", "artifact"): "https://genshin.jmp.blue/artifacts/all",
}
WW_ROUTES = {"character": "characters", "weapon": "weapons", "artifact": "echos"}
BASE = "https://wutheringdb.com"
WW_ASSET_INDEX_URL = "https://api.github.com/repos/ryanbenson/wuthering-waves-assets/contents/images"
ww_asset_cache: tuple[float, dict[str, str]] | None = None
ENDGAME_URLS = ("https://genshinflex.com/en/abyss/", "https://genshinflex.com/en/theater/history/", "https://genshinflex.com/en/onslaught/")
GI_ABYSS_WIKI_API = "https://genshin-impact.fandom.com/api.php"
GI_ABYSS_PATCH_NOTES = "https://genshin.aza.gg/?l=en"
LORE_INDEX_TTL = 86400
LORE_INDEX_CATEGORIES = (
    "Character Lore Histories", "Historical Events", "Historical Figures", "Lore",
    "Mythology", "Gods", "Archons", "Celestia", "Khaenri'ah", "Enkanomiya",
    "Organizations", "Locations", "Books", "Quests", "Teyvat",
)
gi_lore_index_cache: tuple[float, bytes] | None = None
GI_LORE_CACHE_FILE = Path(__file__).resolve().parent / ".cache" / "gi-lore-index-v3.json"


def fetch(url: str, headers: dict[str, str] | None = None) -> bytes:
    request_headers = {"User-Agent": "Mozilla/5.0 (compatible; Astralis/1.0)", "Accept": "application/json,text/html,*/*"}
    request_headers.update(headers or {})
    request = Request(url, headers=request_headers)
    with urlopen(request, timeout=18) as response:
        return response.read()


_GI_ALIAS_CACHE: dict | None = None

def _gi_build_token(value: object) -> str:
    """Normalize localized names consistently (case, accents, punctuation)."""
    return re.sub(r"[^a-z0-9]+", "", unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode("ascii").casefold())


def gi_name_aliases(kind: str, name: str) -> set[str]:
    """Resolve localized labels to public guide names without losing accents."""
    global _GI_ALIAS_CACHE
    if _GI_ALIAS_CACHE is None:
        try: _GI_ALIAS_CACHE = json.loads((Path(__file__).resolve().parent / "public" / "gi-name-aliases.json").read_text(encoding="utf-8"))
        except Exception: _GI_ALIAS_CACHE = {}
    group = {"character":"characters", "weapon":"weapons", "artifact":"artifacts"}.get(kind, kind)
    token, aliases = _gi_build_token(name), ({name} if name else set())
    for row in (_GI_ALIAS_CACHE.get(group, []) if isinstance(_GI_ALIAS_CACHE, dict) else []):
        candidates = (row.get("fr", []) or []) + (row.get("en", []) or [])
        if any(_gi_build_token(candidate) == token for candidate in candidates):
            aliases.update(str(candidate) for candidate in candidates if candidate)
            break
    return aliases

_GI_BUILD_REVERSE_CACHE: tuple[float, list[dict]] | None = None
_GI_FLEX_BUILD_CACHE: tuple[float, list[dict]] | None = None


def _gi_class_values(html: str, class_name: str) -> list[str]:
    values = []
    for opening in re.finditer(r'<(?P<tag>[a-z][\w:-]*)\b(?P<attrs>[^>]*)>', html, re.I | re.S):
        classes = re.search(r'\bclass\s*=\s*["\']([^"\']*)["\']', opening.group("attrs"), re.I)
        if not classes or class_name not in classes.group(1).split(): continue
        closing = re.search(r'</' + re.escape(opening.group("tag")) + r'\s*>', html[opening.end():], re.I)
        if closing: values.append(html_text(html[opening.end():opening.end() + closing.start()]))
    return values


def _gi_class_blocks(html: str, class_name: str) -> list[str]:
    starts = []
    for opening in re.finditer(r'<(?P<tag>[a-z][\w:-]*)\b(?P<attrs>[^>]*)>', html, re.I | re.S):
        classes = re.search(r'\bclass\s*=\s*["\']([^"\']*)["\']', opening.group("attrs"), re.I)
        if classes and class_name in classes.group(1).split(): starts.append(opening)
    return [html[m.start():(starts[i+1].start() if i+1 < len(starts) else len(html))] for i,m in enumerate(starts)]


def _parse_genshin_gg_build_page(page: str) -> list[dict]:
    """Extract published gear from Genshin.gg independent of attribute ordering."""
    rows = []
    for body in _gi_class_blocks(page, "builds-list-item"):
        names, roles, gear = (_gi_class_values(body, key) for key in ("build-name", "build-role", "build-weapon-name"))
        if not names: continue
        image = re.search(r'<img\b[^>]*?\b(?:src|data-src)=["\']([^"\']+)', body, re.I | re.S)
        profile = re.search(r'<a\b[^>]*href=["\'](/characters/[^"\']+)', body, re.I)
        weapon = gear[0] if gear else ""
        rows.append({"name":names[0], "role":roles[0] if roles else "", "weapon":weapon, "weapons":[weapon] if weapon else [], "sets":gear[1:], "icon":urljoin("https://genshin.gg/", unescape(image.group(1))) if image else "", "url":urljoin("https://genshin.gg/", profile.group(1)) if profile else "", "source":"Genshin.gg"})
    return rows


def _parse_genshinflex_build_page(page: str, slug: str) -> dict | None:
    """Extract gear, role and patch only when explicitly published by Flex."""
    section = re.search(r'<section\b(?=[^>]*\bid=["\']build["\'])[^>]*>(.*?)</section>', page, re.I | re.S)
    if not section: return None
    body = section.group(1)
    weapon_panel = re.search(r'<h3\b[^>]*>\s*Weapons\s*</h3>(.*?)(?=<h3\b|$)', body, re.I | re.S)
    artifact_panel = re.search(r'<h3\b[^>]*>\s*Artifacts\s*</h3>(.*?)(?=<h3\b|$)', body, re.I | re.S)
    weapon_html, artifact_html = (weapon_panel.group(1) if weapon_panel else ""), (artifact_panel.group(1) if artifact_panel else "")
    anchor_pattern = r'<a\b(?=[^>]*\bhref=["\']/en/weapons/)[^>]*>(.*?)</a>'
    weapons = [html_text(m.group(1)) for m in re.finditer(anchor_pattern, weapon_html, re.I | re.S)]
    if not weapons: weapons = [html_text(v) for v in re.findall(r'<b\b[^>]*>(.*?)</b>', weapon_html, re.I | re.S)]
    sets = []
    for value in re.findall(r'<b\b[^>]*>(.*?)</b>', artifact_html, re.I | re.S):
        sets.extend(html_text(part) for part in re.split(r'\s*\+\s*', value) if html_text(part))
    if not weapons and not sets: return None
    aliases = _GI_ALIAS_CACHE.get("characters", []) if isinstance(_GI_ALIAS_CACHE, dict) else []
    name = next((candidate for row in aliases for candidate in (row.get("en", []) or []) if _gi_build_token(candidate) == _gi_build_token(slug)), "") or slug.replace("-", " ").title()
    role = re.search(r'<p\b[^>]*>(.*?)</p>', body, re.I | re.S)
    patch = re.search(r'\bpatch\s+([0-9]+(?:\.[0-9]+)+)', body, re.I)
    return {"name":name, "role":html_text(role.group(1)) if role else "Build publié", "patch":patch.group(1) if patch else "", "weapon":weapons[0] if weapons else "", "weapons":list(dict.fromkeys(weapons)), "sets":list(dict.fromkeys(sets)), "icon":"", "url":f"https://genshinflex.com/en/characters/{slug}/", "source":"GenshinFlex"}


def gi_genshinflex_build_index() -> list[dict]:
    """Fetch public Flex pages concurrently; refresh every 6h and retain stale data."""
    global _GI_FLEX_BUILD_CACHE, _GI_ALIAS_CACHE
    now = time.time()
    cache_file = Path(__file__).resolve().parent / ".cache" / "gi-flex-builds-v1.json"
    if _GI_FLEX_BUILD_CACHE is None:
        try:
            saved = json.loads(cache_file.read_text(encoding="utf-8"))
            if isinstance(saved.get("rows"), list): _GI_FLEX_BUILD_CACHE = (float(saved.get("updatedAt", 0)), saved["rows"])
        except Exception: pass
    if _GI_FLEX_BUILD_CACHE is not None and now - _GI_FLEX_BUILD_CACHE[0] < 21600: return _GI_FLEX_BUILD_CACHE[1]
    if _GI_ALIAS_CACHE is None: gi_name_aliases("character", "")
    slugs = set()
    try:
        sitemap = fetch("https://genshinflex.com/sitemap.xml").decode("utf-8", "ignore")
        slugs.update(re.findall(r"https://genshinflex\.com/en/characters/([a-z0-9-]+)/?", sitemap, re.I))
    except Exception:
        for row in (_GI_ALIAS_CACHE or {}).get("characters", []):
            for candidate in row.get("en", []) or []: slugs.add(re.sub(r"[^a-z0-9]+", "-", candidate.casefold()).strip("-"))
    urls = [(slug, f"https://genshinflex.com/en/characters/{slug}/") for slug in sorted(slugs) if slug]
    def load_page(entry):
        slug, url = entry
        try:
            request = Request(url, headers={"User-Agent":"Mozilla/5.0 (compatible; Astralis/1.0)", "Accept":"text/html,*/*"})
            with urlopen(request, timeout=7) as response: page = response.read(2_000_000).decode("utf-8", "ignore")
            return _parse_genshinflex_build_page(page, slug)
        except Exception: return None
    with ThreadPoolExecutor(max_workers=16) as pool: rows = [row for row in pool.map(load_page, urls) if row]
    if rows:
        _GI_FLEX_BUILD_CACHE = (now, rows)
        try:
            cache_file.parent.mkdir(parents=True, exist_ok=True)
            cache_file.write_text(json.dumps({"updatedAt":now, "rows":rows}, ensure_ascii=False), encoding="utf-8")
        except OSError: pass
    elif _GI_FLEX_BUILD_CACHE is None: raise RuntimeError("GenshinFlex n’a pas publié de pages de build accessibles pour le moment.")
    return _GI_FLEX_BUILD_CACHE[1]


def gi_build_reverse_index() -> list[dict]:
    """Merge public recommendations, keep an on-disk snapshot and tolerate outages."""
    global _GI_BUILD_REVERSE_CACHE
    now = time.time()
    cache_file = Path(__file__).resolve().parent / ".cache" / "gi-build-reverse-v2.json"
    if _GI_BUILD_REVERSE_CACHE is None:
        try:
            saved = json.loads(cache_file.read_text(encoding="utf-8"))
            if isinstance(saved.get("rows"), list): _GI_BUILD_REVERSE_CACHE = (float(saved.get("updatedAt", 0)), saved["rows"])
        except Exception: pass
    if _GI_BUILD_REVERSE_CACHE is not None and now - _GI_BUILD_REVERSE_CACHE[0] < 21600: return _GI_BUILD_REVERSE_CACHE[1]
    rows, errors = [], []
    try: rows.extend(_parse_genshin_gg_build_page(fetch("https://genshin.gg/builds/").decode("utf-8", "ignore")))
    except Exception as exc: errors.append(exc)
    try: rows.extend(gi_genshinflex_build_index())
    except Exception as exc: errors.append(exc)
    grouped = {}
    for row in rows:
        key = _gi_build_token(row.get("name", ""))
        if not key: continue
        target = grouped.setdefault(key, {**row, "weapons":[], "sets":[], "roles":[], "sources":[], "patches":[]})
        for value in row.get("weapons", []) or ([row.get("weapon")] if row.get("weapon") else []):
            if value and value not in target["weapons"]: target["weapons"].append(value)
        for value in row.get("sets", []):
            if value and value not in target["sets"]: target["sets"].append(value)
        for field, collection in (("role","roles"),("source","sources"),("patch","patches")):
            value = row.get(field)
            if value and value not in target[collection]: target[collection].append(value)
        if row.get("icon") and not target.get("icon"): target["icon"] = row["icon"]
        if row.get("url") and row.get("source") == "Genshin.gg": target["url"] = row["url"]
    merged = list(grouped.values())
    for row in merged:
        row["weapon"] = row["weapons"][0] if row["weapons"] else ""
        row["role"] = " · ".join(row.pop("roles")) or "Build publié"
        row["patch"] = " · ".join(row.pop("patches"))
    if not merged:
        if _GI_BUILD_REVERSE_CACHE is not None and _GI_BUILD_REVERSE_CACHE[1]: return _GI_BUILD_REVERSE_CACHE[1]
        if errors: raise RuntimeError("Genshin.gg et GenshinFlex sont momentanément indisponibles.") from errors[0]
    if merged:
        _GI_BUILD_REVERSE_CACHE = (now, merged)
        try:
            cache_file.parent.mkdir(parents=True, exist_ok=True)
            cache_file.write_text(json.dumps({"updatedAt":now, "rows":merged}, ensure_ascii=False), encoding="utf-8")
        except OSError: pass
    elif _GI_BUILD_REVERSE_CACHE is None: _GI_BUILD_REVERSE_CACHE = (now, [])
    return _GI_BUILD_REVERSE_CACHE[1]


def gi_compatible_build_rows(rows: list[dict], kind: str, aliases: set[str]) -> list[dict]:
    """Return every distinct published recommendation using accent-insensitive aliases."""
    tokens = {_gi_build_token(value) for value in aliases if _gi_build_token(value)}
    matches, seen = [], set()
    for row in rows:
        candidates = (row.get("weapons") or [row.get("weapon", "")]) if kind == "weapon" else row.get("sets", [])
        if not any(_gi_build_token(value) in tokens for value in candidates): continue
        token = _gi_build_token(row.get("name", ""))
        if token and token not in seen: seen.add(token); matches.append(row)
    return matches


_GI_TEAM_GUIDE_CACHE: tuple[float, list[dict]] | None = None

def gi_team_recommendations(character_name: str) -> list[dict]:
    """Parse the public, image-backed Genshin.gg team index and keep its attribution."""
    global _GI_TEAM_GUIDE_CACHE
    now = time.time()
    if _GI_TEAM_GUIDE_CACHE is None or now - _GI_TEAM_GUIDE_CACHE[0] > 21600:
        html = fetch("https://genshin.gg/teams/").decode("utf-8", "ignore")
        headers = list(re.finditer(r'<h2 class="teams-section-title">(.*?)</h2>', html, re.I | re.S))
        starts = list(re.finditer(r'<div class="team-name">(.*?)</div>', html, re.I | re.S))
        teams = []
        for i, match in enumerate(starts):
            end = starts[i+1].start() if i+1 < len(starts) else len(html)
            segment = html[match.end():end]
            members = []
            for slot in re.finditer(r"<div class=[^>]*team-slot[^>]*>(.*?)(?=<div class=[^>]*team-slot|$)", segment, re.I | re.S):
                body = slot.group(1)
                name_match = re.search(r'<h2 class="character-name">(.*?)</h2>', body, re.I | re.S)
                icon_match = re.search(r'<img[^>]+class="character-icon[^"]*"[^>]+src="([^"]+)"', body, re.I)
                link_match = re.search(r'<a href="([^"]+)" class="character-portrait"', body, re.I)
                if name_match:
                    members.append({"name": html_text(name_match.group(1)), "icon": unescape(icon_match.group(1)) if icon_match else "", "url": urljoin("https://genshin.gg/", link_match.group(1)) if link_match else ""})
            if len(members) < 2: continue
            section = next((h.group(1) for h in reversed(headers) if h.start() < match.start()), "Teams")
            teams.append({"name": html_text(match.group(1)), "group": html_text(section), "members": members})
        _GI_TEAM_GUIDE_CACHE = (now, teams)
    normalized = re.sub(r"[^a-z0-9]+", "", character_name.casefold())
    matches = [team for team in (_GI_TEAM_GUIDE_CACHE or (0, []))[1] if any(re.sub(r"[^a-z0-9]+", "", member["name"].casefold()) == normalized for member in team["members"])]
    if matches: return matches[:8]
    # Genshin.gg's global team index is incomplete; its character pages contain
    # dedicated team blocks for characters absent from the index (e.g. Alhaitham).
    slug = re.sub(r"[^a-z0-9]+", "", character_name.casefold())
    profile_url = next((row.get("url") for row in gi_build_reverse_index() if re.sub(r"[^a-z0-9]+", "", row.get("name", "").casefold()) == normalized and row.get("url")), "")
    if not profile_url and slug: profile_url = f"https://genshin.gg/characters/{slug}/"
    if not profile_url: return []
    html = fetch(profile_url).decode("utf-8", "ignore")
    starts = list(re.finditer(r'<div class="character-team">', html, re.I))
    teams = []
    for i, match in enumerate(starts):
        end = starts[i+1].start() if i+1 < len(starts) else html.find('</div><h2 class="character-category">', match.start())
        if end < 0: end = len(html)
        block = html[match.start():end]
        title = re.search(r'<div class="character-team-name">(.*?)</div>', block, re.I | re.S)
        members = []
        for icon in re.finditer(r'<img[^>]*class="character-icon[^"]*"[^>]*>', block, re.I):
            tag = icon.group(0)
            name_match = re.search(r'\balt="([^"]+)"', tag, re.I)
            src_match = re.search(r'\bsrc="([^"]+)"', tag, re.I)
            if not name_match: continue
            before = block.rfind('<a ', 0, icon.start()); after = block.find('</a>', icon.end())
            link = re.search(r'\bhref="([^"]+)"', block[before:after] if before >= 0 and after >= 0 else '', re.I)
            members.append({"name": html_text(name_match.group(1)), "icon": unescape(src_match.group(1)) if src_match else "", "url": urljoin("https://genshin.gg/", link.group(1)) if link else ""})
        # The paired element icon uses another class; keep only the character-icon records.
        if len(members) >= 2:
            teams.append({"name": html_text(title.group(1)) if title else character_name + " · équipe recommandée", "group": "Équipe · fiche de personnage", "members": members[:4]})
    return teams[:8]

_GI_BUILDS_TREE: tuple[float, list[str]] | None = None

def gi_build_guide(character_slug: str) -> dict:
    """Return a compact, cached build guide from the community-maintained GIHT dataset."""
    global _GI_BUILDS_TREE
    slug = re.sub(r"[^a-z0-9-]+", "-", character_slug.casefold()).strip("-")
    if not slug or len(slug) > 64:
        raise ValueError("Nom de personnage invalide.")
    now = time.time()
    if _GI_BUILDS_TREE is None or now - _GI_BUILDS_TREE[0] > 21600:
        payload = json.loads(fetch("https://api.github.com/repos/Genshin-Impact-Helper-Team/genshin-builds/git/trees/main?recursive=1"))
        _GI_BUILDS_TREE = (now, [row["path"] for row in payload.get("tree", []) if row.get("type") == "blob" and row.get("path", "").startswith("src/content/")])
    paths = _GI_BUILDS_TREE[1]
    suffix = f"/{slug}/metadata.json"
    metadata_path = next((p for p in paths if p.endswith(suffix)), None)
    if not metadata_path:
        raise LookupError("Ce personnage n’a pas encore de guide GIHT publié.")
    base = metadata_path.rsplit("/", 1)[0]
    def read_json(path: str, default):
        try:
            return json.loads(fetch("https://raw.githubusercontent.com/Genshin-Impact-Helper-Team/genshin-builds/main/" + path))
        except Exception:
            return default
    metadata = read_json(metadata_path, {})
    mainstats = read_json(base + "/artifacts-mainstats.json", {})
    substats = read_json(base + "/artifacts-substats.json", {})
    artifacts = read_json(base + "/artifacts-sets.json", {})
    talents = read_json(base + "/talents.json", {})
    build_dirs = sorted({path.rsplit("/", 1)[0] for path in paths if path.startswith(base + "/") and path.endswith("/weapons.json")})
    builds = []
    for build_dir in build_dirs:
        weapons = read_json(build_dir + "/weapons.json", {}).get("weapons", [])
        notes = read_json(build_dir + "/build-notes.json", {})
        sets = read_json(build_dir + "/artifacts-sets.json", {}).get("artifact_sets", []) or artifacts.get("artifact_sets", [])
        main = read_json(build_dir + "/artifacts-mainstats.json", {}).get("main_stats", {}) or mainstats.get("main_stats", {})
        subs = read_json(build_dir + "/artifacts-substats.json", {}).get("substats_priority", []) or substats.get("substats_priority", [])
        builds.append({"role": notes.get("name", {}).get("fr") or notes.get("name", {}).get("en") or build_dir.split("/")[-1], "best": bool(notes.get("best")), "weapons": weapons, "artifacts": sets, "mainStats": main, "substats": subs, "notes": [n.get("fr") or n.get("en", "") for n in notes.get("notes", []) if isinstance(n, dict)], "lastUpdated": notes.get("last_updated", metadata.get("last_updated", ""))})
    builds.sort(key=lambda b: not b["best"])
    return {"character": slug, "source": "Genshin Impact Helper Team · Community Builds", "sourceUrl": "https://github.com/Genshin-Impact-Helper-Team/genshin-builds", "updatedAt": now, "version": metadata.get("last_updated", ""), "roles": metadata.get("roles", []), "talents": talents.get("talents", []), "builds": builds}

def html_text(markup: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", markup))).strip()


def lore_intro(wikitext: str) -> str:
    lead = re.split(r"\n==+", wikitext, maxsplit=1)[0]
    lead = re.sub(r"(?s)<!--.*?-->", " ", lead)
    lead = re.sub(r"(?s)<ref\b[^>]*>.*?</ref>|<ref\b[^>]*/>", " ", lead, flags=re.I)
    # Strip nested infobox/templates from the lead without leaving fragments.
    for _ in range(8):
        cleaned = re.sub(r"(?s)\{\{[^{}]*\}\}", " ", lead)
        if cleaned == lead:
            break
        lead = cleaned
    def wiki_link(match: re.Match[str]) -> str:
        target, label = match.group(1), match.group(2)
        return (label or target).replace("_", " ").strip()
    lead = re.sub(r"\[\[([^\]|]+)(?:\|([^\]]*))?\]\]", wiki_link, lead)
    lead = re.sub(r"\[(?:https?://\S+\s+)?([^\]]+)\]", r"\1", lead)
    lead = re.sub(r"'{2,5}", "", lead)
    lead = re.sub(r"<[^>]+>|\[\[.*?\]\]|\{\{.*?\}\}", " ", lead)
    lead = re.sub(r"[\n\r*#|=]+", " ", lead)
    lead = unescape(lead)
    lead = re.sub(r"\b(?:of|in|during|after|before|by|from|the|a|an)\s*[,;.]", ".", lead, flags=re.I)
    return re.sub(r"\s+", " ", lead).strip()


def genshin_lore_index() -> bytes:
    """Build a small, cached browse index from public wiki intros and thumbnails.

    Metadata, a cleaned lead section, and a thumbnail are cached for one day.
    The initial collection is deliberately bounded; artwork is lazy-loaded in UI.
    """
    global gi_lore_index_cache
    now = time.time()
    if gi_lore_index_cache and now - gi_lore_index_cache[0] < LORE_INDEX_TTL:
        return gi_lore_index_cache[1]
    if not gi_lore_index_cache:
        try:
            cached = json.loads(GI_LORE_CACHE_FILE.read_text(encoding="utf-8"))
            cached_at = float(cached.get("cachedAt", 0))
            if cached_at and now - cached_at < LORE_INDEX_TTL:
                payload = json.dumps(cached["payload"], ensure_ascii=False).encode("utf-8")
                gi_lore_index_cache = (cached_at, payload)
                return payload
            if cached.get("payload"):
                gi_lore_index_cache = (cached_at, json.dumps(cached["payload"], ensure_ascii=False).encode("utf-8"))
        except Exception:
            pass
    api = "https://genshin-impact.fandom.com/api.php"
    titles: dict[str, set[str]] = {}
    try:
        def category_pages(category: str) -> tuple[str, list[dict]]:
            collected, continuation = [], {}
            for _ in range(5):
                query = urlencode({"action":"query", "list":"categorymembers", "cmtitle":f"Category:{category}", "cmtype":"page", "cmlimit":"100", "format":"json", **continuation})
                data = json.loads(fetch(f"{api}?{query}"))
                collected.extend(data.get("query", {}).get("categorymembers", []))
                continuation = data.get("continue", {})
                if not continuation:
                    break
            return category, collected
        with ThreadPoolExecutor(max_workers=6) as pool:
            category_results = list(pool.map(category_pages, LORE_INDEX_CATEGORIES))
        for category, pages in category_results:
            for page in pages:
                title = str(page.get("title", "")).strip()
                if title and not title.startswith(("File:", "Category:", "Template:", "Help:")):
                    titles.setdefault(title, set()).add(category)
        rows = []
        all_titles = list(titles)[:360]
        for offset in range(0, len(all_titles), 50):
            batch = all_titles[offset:offset + 50]
            # The current Fandom MediaWiki build no longer supports the classic
            # extracts property; request wikitext and page thumbnails instead.
            query = urlencode({"action":"query", "prop":"revisions|pageimages", "titles":"|".join(batch), "rvprop":"content", "rvslots":"main", "piprop":"thumbnail", "pithumbsize":"720", "format":"json", "origin":"*"})
            data = json.loads(fetch(f"{api}?{query}"))
            for page in data.get("query", {}).get("pages", {}).values():
                title = str(page.get("title", "")).strip()
                revisions = page.get("revisions", [])
                wikitext = revisions[0].get("slots", {}).get("main", {}).get("*", "") if revisions else ""
                # Produce a readable lead from wiki markup, omitting infoboxes,
                # references and nested templates rather than raw source text.
                extract = lore_intro(wikitext)
                if not title or len(extract) < 70:
                    continue
                rows.append({"id":str(page.get("pageid", title)), "title":title, "extract":extract[:1600],
                    "image":page.get("thumbnail", {}).get("source", ""),
                    "categories":sorted(titles.get(title, set())),
                    "url":"https://genshin-impact.fandom.com/wiki/" + quote(title.replace(" ", "_"))})
        rows.sort(key=lambda row: (not any(x in " ".join(row["categories"]).lower() for x in ("lore", "histor", "myth", "book")), row["title"].casefold()))
        payload = json.dumps({"updatedAt":datetime.now(timezone.utc).isoformat(), "source":"Genshin Impact Wiki · catégories publiques", "count":len(rows), "target":200, "articles":rows[:300]}, ensure_ascii=False).encode("utf-8")
        if len(rows) >= 200:
            gi_lore_index_cache = (now, payload)
            try:
                GI_LORE_CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
                GI_LORE_CACHE_FILE.write_text(json.dumps({"cachedAt":now,"payload":json.loads(payload)},ensure_ascii=False),encoding="utf-8")
            except OSError:
                pass
            return payload
        if gi_lore_index_cache:
            return gi_lore_index_cache[1]
        return json.dumps({"updatedAt":datetime.now(timezone.utc).isoformat(), "source":"Genshin Impact Wiki", "count":len(rows), "target":200, "articles":rows[:300], "warning":"La source n’a renvoyé qu’un index partiel; il sera retenté à la prochaine actualisation."}, ensure_ascii=False).encode("utf-8")
    except Exception as exc:
        if gi_lore_index_cache:
            return gi_lore_index_cache[1]
        return json.dumps({"updatedAt":"", "source":"Genshin Impact Wiki", "count":0, "target":200, "articles":[], "error":str(exc)}, ensure_ascii=False).encode("utf-8")


def youtube_video_ids(value: str) -> list[str]:
    text = unescape(value or "")
    pattern = r"https?://(?:www\.)?(?:youtube\.com/(?:watch\?(?:[^#\s]*?&)?v=|embed/|shorts/|live/)|youtu\.be/)([\w-]{11})"
    return list(dict.fromkeys(re.findall(pattern, text, re.I)))


def wuthering_cards(category: str) -> bytes:
    # Encore maintains a versioned live-data index, including beta entries and
    # their official icon URLs. Prefer it for resonators and weapons so new
    # releases appear without waiting for a listing-site scrape.
    if category in {"character", "weapon"}:
        route = "character" if category == "character" else "weapon"
        try:
            payload = json.loads(fetch(f"https://api-v2.encore.moe/api/en/{route}?v=Beta"))
            source_rows = payload.get("roleList" if category == "character" else "weapons", [])
            cards = []
            for row in source_rows:
                name = str(row.get("Name") or "").strip()
                identifier = row.get("Id")
                if not name or identifier is None:
                    continue
                if category == "character":
                    icon = row.get("RoleHeadIconLarge") or row.get("RoleHeadIcon") or row.get("RoleHeadIconBig") or ""
                    element = row.get("Element") or {}
                    weapon_type = row.get("WeaponType") or {}
                    cards.append({
                        "id": re.sub(r"[^a-z0-9]+", "-", name.casefold()).strip("-"),
                        "apiId": str(identifier), "name": name,
                        "element": element.get("Name", ""),
                        "weaponType": weapon_type.get("Name", ""),
                        "rarity": int(row.get("QualityId") or 5),
                        "imageUrl": icon, "portraitUrl": icon,
                        "sourceUrl": f"https://api-v2.encore.moe/api/en/character/{identifier}?v=Beta",
                        "source": "Encore API · catalogue Beta",
                    })
                else:
                    icon = row.get("Icon") or ""
                    cards.append({
                        "id": str(identifier), "name": name,
                        "weaponType": row.get("TypeName") or "",
                        "rarity": int(row.get("QualityId") or 4),
                        "imageUrl": icon, "iconUrl": icon,
                        "sourceUrl": f"https://api-v2.encore.moe/api/en/weapon/{identifier}?v=Beta",
                        "source": "Encore API · catalogue Beta",
                    })
            if cards:
                return json.dumps(cards, ensure_ascii=False).encode("utf-8")
        except Exception:
            # Keep the maintained WutheringDB listing as a fallback if Encore
            # is temporarily unavailable; cached catalogues remain usable too.
            pass

    route = WW_ROUTES[category]
    html = fetch(f"{BASE}/en/{route}").decode("utf-8", errors="replace")
    pattern = rf'<a\b[^>]*href="/en/{route}/([^"/?#]+)"[^>]*>(.*?)</a>'
    matches = re.findall(pattern, html, flags=re.I | re.S)
    portraits: dict[str, str] = {}
    if category == "character":
        global ww_asset_cache
        now = time.time()
        if not ww_asset_cache or now - ww_asset_cache[0] >= TTL:
            try:
                listing = json.loads(fetch(WW_ASSET_INDEX_URL))
                assets = {re.sub(r"[^a-z0-9]", "", entry.get("name", "").rsplit(".", 1)[0].lower()): entry["download_url"]
                          for entry in listing if entry.get("name", "").lower().endswith(".png") and entry.get("download_url")}
                ww_asset_cache = (now, assets)
            except Exception:
                assets = ww_asset_cache[1] if ww_asset_cache else {}
        else:
            assets = ww_asset_cache[1]
        portraits = assets
    cards = []
    for slug, body in matches:
        title = re.search(r"<h2\b[^>]*>(.*?)</h2>", body, flags=re.I | re.S)
        if not title:
            title = re.search(r"<h[23]\b[^>]*>(.*?)</h[23]>", body, flags=re.I | re.S)
        name = html_text(title.group(1)) if title else slug.replace("-", " ").title()
        paragraphs = [html_text(v) for v in re.findall(r"<p\b[^>]*>(.*?)</p>", body, flags=re.I | re.S)]
        rarity = re.search(r"([45])-Star", body, flags=re.I)
        # Prefer maintained transparent character renders; the listing's old
        # roleportrait URLs have gone stale and return 404s.
        portrait = portraits.get(re.sub(r"[^a-z0-9]", "", name.lower()), "")
        if not portrait and slug == "rover-aero":
            portrait = portraits.get("roveraeromale", "")
        record = {
            "id": slug,
            "name": name,
            "description": paragraphs[-1] if paragraphs else "",
            "subtitle": paragraphs[0] if paragraphs else "",
            "imageUrl": portrait or "",
            "portraitUrl": portrait,
            "rarity": int(rarity.group(1)) if rarity else 5,
            "sourceUrl": f"{BASE}/en/{route}/{slug}",
        }
        cards.append(record)
    return json.dumps(cards, ensure_ascii=False).encode("utf-8")


def genshinflex_calendar_rows() -> list[dict]:
    page = fetch("https://genshinflex.com/en/calendar/").decode("utf-8", errors="replace")
    match = re.search(r'<script[^>]+id="cal-data"[^>]*>(.*?)</script>', page, re.I | re.S)
    if not match:
        raise ValueError("Le calendrier public ne fournit pas ses données structurées.")
    allowed = {"event", "char-banner", "weapon-banner", "version", "theater", "abyss", "onslaught"}
    fields = ("id", "kind", "title", "start", "end", "image", "icons", "primogems", "description", "source")
    rows = []
    for row in json.loads(match.group(1)):
        if row.get("kind") not in allowed or not row.get("start") or not row.get("end"):
            continue
        item = {key: row.get(key) for key in fields}
        if item.get("kind") == "event" and re.search(r"stygian\s+onslaught|carnage\s+chthonien", str(item.get("title") or ""), re.I):
            item["kind"] = "onslaught"
        item["source"] = item.get("source") or {"title": "GenshinFlex · calendrier basé sur les annonces officielles", "url": "https://genshinflex.com/en/calendar/"}
        item["icons"] = item.get("icons") or []
        rows.append(item)
    return rows


def _calendar_datetime(value: object) -> datetime | None:
    """Parse feed timestamps consistently; naive GenshinFlex dates are Paris local time."""
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except (TypeError, ValueError, OverflowError):
        return None
    if parsed.tzinfo is None:
        # Paris switches between UTC+1 and UTC+2 on the last Sundays of March/October.
        year = parsed.year
        march_last = datetime(year, 3, 31).date()
        march_last -= timedelta(days=(march_last.weekday() + 1) % 7)
        october_last = datetime(year, 10, 31).date()
        october_last -= timedelta(days=(october_last.weekday() + 1) % 7)
        offset = 2 if march_last <= parsed.date() < october_last else 1
        parsed = parsed.replace(tzinfo=timezone(timedelta(hours=offset)))
    return parsed.astimezone(timezone.utc)


def _calendar_windows_match(left: dict, right: dict, tolerance_hours: int = 12) -> bool:
    """Match a shared event across feeds despite local/UTC publication offsets."""
    if left.get("kind") != right.get("kind"):
        return False
    left_start, right_start = _calendar_datetime(left.get("start")), _calendar_datetime(right.get("start"))
    left_end, right_end = _calendar_datetime(left.get("end")), _calendar_datetime(right.get("end"))
    if not left_start or not right_start or not left_end or not right_end:
        return False
    tolerance = tolerance_hours * 3600
    start_delta = abs((left_start - right_start).total_seconds())
    end_delta = abs((left_end - right_end).total_seconds())
    duration_delta = abs(((left_end - left_start) - (right_end - right_start)).total_seconds())
    return start_delta <= tolerance and end_delta <= tolerance and duration_delta <= tolerance


def _calendar_title_tokens(row: dict) -> set[str]:
    """Return useful, lightly translated words for cross-language event matching."""
    text = " ".join([
        str(row.get("title") or ""),
        " ".join(str(icon.get("name") or "") for icon in row.get("icons") or [] if isinstance(icon, dict)),
    ])
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().casefold()
    stop = {"the", "a", "an", "and", "of", "for", "to", "in", "on", "la", "le", "les", "un", "une", "des", "du", "de", "d", "en", "dans", "pour", "et", "au", "aux", "contre", "with", "from", "event", "evenement", "genshin"}
    aliases = {
        "grande": "grand", "defence": "defense", "defense": "defense",
        "judgment": "jugement", "judgement": "jugement", "unjust": "injuste",
        "blocks": "bloc", "block": "bloc", "blocs": "bloc",
        "project": "projet", "smashing": "destruction", "destroy": "destruction",
        "destructions": "destruction", "stress": "stress",
        "onslaught": "carnage", "stygian": "chthonian", "chthonian": "chthonian",
        "cthonian": "chthonian", "cthonien": "chthonian", "chtonien": "chthonian", "carnage": "carnage",
    }
    tokens = set()
    for word in re.findall(r"[a-z0-9]+", normalized):
        if word in stop or len(word) < 3:
            continue
        word = aliases.get(word, word)
        if word.endswith("s") and len(word) > 4:
            word = word[:-1]
        tokens.add(word)
    return tokens


def _calendar_identity_score(left: dict, right: dict) -> int:
    """Score title identity; time overlap alone is never enough for rewards."""
    if left.get("kind") != right.get("kind"):
        return 0
    left_tokens, right_tokens = _calendar_title_tokens(left), _calendar_title_tokens(right)
    overlap = left_tokens & right_tokens
    if len(overlap) >= 2:
        return len(overlap) * 10
    # A single distinctive featured name can identify a banner; one generic
    # event word is too weak to attach a reward amount safely.
    if len(overlap) == 1 and left.get("kind") in {"char-banner", "weapon-banner"} and max(map(len, overlap)) >= 6:
        return 1
    return 0


def _clean_genshin_calendar(events: list[dict], now: datetime | None = None) -> list[dict]:
    """Remove expired feed rows and collapse duplicate records for the same banner phase."""
    now = now or datetime.now(timezone.utc)
    valid = []
    for row in events:
        start = _calendar_datetime(row.get("start"))
        end = _calendar_datetime(row.get("end"))
        if not start or not end or end < now or end <= start:
            continue
        if start > now + timedelta(days=400):
            continue
        item = dict(row)
        item["start"] = start.isoformat().replace("+00:00", "Z")
        item["end"] = end.isoformat().replace("+00:00", "Z")
        item["icons"] = item.get("icons") or []
        valid.append(item)

    def banner_window_match(left: dict, right: dict) -> bool:
        if left.get("kind") != right.get("kind") or left.get("kind") not in {"char-banner", "weapon-banner"}:
            return False
        return _calendar_windows_match(left, right, tolerance_hours=12)

    grouped: list[list[dict]] = []
    for row in sorted(valid, key=lambda item: (item.get("start", ""), item.get("kind", ""))):
        group = next((candidate for candidate in grouped if banner_window_match(candidate[0], row)), None)
        if group is None:
            grouped.append([row])
        else:
            group.append(row)

    merged = []
    for group in grouped:
        # Prefer a named GenshinFlex banner window when available; its time is the
        # published phase schedule, while Ennead supplies the official character art.
        def score(row: dict) -> tuple[int, int, int]:
            title = str(row.get("title") or "")
            source = row.get("source") or {}
            source_url = source.get("url", "") if isinstance(source, dict) else ""
            return (int("genshinflex.com" in source_url), len(row.get("icons") or []), int("/" in title))
        primary = max(group, key=score)
        item = dict(primary)
        icon_rows = []
        seen_icons = set()
        for row in group:
            for icon in row.get("icons") or []:
                name = re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", str(icon.get("name", ""))).encode("ascii", "ignore").decode().lower())
                if name and name not in seen_icons:
                    seen_icons.add(name)
                    icon_rows.append(icon)
        item["icons"] = icon_rows
        names = [str(icon.get("name", "")).strip() for icon in icon_rows if icon.get("name")]
        if item.get("kind") in {"char-banner", "weapon-banner"} and names:
            featured = [str(icon.get("name", "")).strip() for icon in icon_rows
                        if int(icon.get("rarity") or 0) == 5 or not icon.get("rarity")]
            if featured:
                item["title"] = " / ".join(dict.fromkeys(featured))
            descriptions = [str(row.get("description") or "").strip() for row in group if row.get("description")]
            item["description"] = " · ".join(dict.fromkeys(descriptions)) or " · ".join(names)
        stated_primos = [int(row["primogems"]) for row in group if row.get("primogems") is not None]
        item["primogems"] = max(stated_primos) if stated_primos else None
        merged.append(item)

    # Merge duplicate event announcements even when sources disagree on the
    # opening timestamp by a day or two. Keep the richest/reward-verified row.
    event_groups: list[list[dict]] = []
    for row in sorted(merged, key=lambda item: (item.get("start", ""), item.get("title", "").casefold())):
        group = None
        if row.get("kind") in {"event", "onslaught"}:
            group = next((candidate for candidate in event_groups
                          if candidate[0].get("kind") == row.get("kind")
                          and _calendar_identity_score(candidate[0], row) >= 20
                          and _calendar_windows_match(candidate[0], row, tolerance_hours=72)), None)
        if group is None:
            event_groups.append([row])
        else:
            group.append(row)

    merged_events = []
    for group in event_groups:
        def completeness(row: dict) -> tuple[int, int, int, int, int]:
            return (
                int(bool(row.get("verificationSource"))),
                int(row.get("primogems") is not None),
                len(row.get("rewards") or []),
                int(bool(row.get("image"))),
                len(str(row.get("description") or "")),
            )
        primary = max(group, key=completeness)
        item = dict(primary)
        if not item.get("image"):
            item["image"] = next((row.get("image") for row in group if row.get("image")), "")
        if not item.get("description"):
            item["description"] = next((row.get("description") for row in group if row.get("description")), "")
        if not item.get("rewards"):
            item["rewards"] = max((row.get("rewards") or [] for row in group), key=len, default=[])
        icons, seen_icons = [], set()
        for row in group:
            for icon in row.get("icons") or []:
                name = re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", str(icon.get("name", ""))).encode("ascii", "ignore").decode().lower())
                if name and name not in seen_icons:
                    seen_icons.add(name)
                    icons.append(icon)
        item["icons"] = icons or item.get("icons") or []
        merged_events.append(item)

    # De-duplicate repeated remaining calendar rows by kind, title and start day.
    result, seen = [], set()
    for row in sorted(merged_events, key=lambda item: (item.get("start", ""), item.get("title", "").casefold())):
        start = _calendar_datetime(row.get("start"))
        key = (row.get("kind"), re.sub(r"\W+", "", str(row.get("title", "")).casefold()), start.date().isoformat() if start else "")
        if key in seen:
            continue
        seen.add(key)
        result.append(row)
    return result


def genshin_events() -> bytes:
    """Use GenshinFlex's complete dated feed as the calendar, with Ennead rewards as enrichment."""
    try:
        events = genshinflex_calendar_rows()
        if not events:
            raise ValueError("GenshinFlex n'a renvoyé aucun événement daté.")
        source = "Calendrier Genshin · GenshinFlex (événements, bannières et endgame)"
    except (ValueError, OSError, TypeError, json.JSONDecodeError):
        events = []
        source = "Calendrier Genshin de secours · Ennead"

    try:
        payload = json.loads(fetch("https://api.ennead.cc/mihoyo/genshin/calendar?lang=fr-fr").decode("utf-8", errors="replace"))
        ennead_source = {"title": "Récompenses et illustrations · Ennead", "url": "https://api.ennead.cc/mihoyo/genshin/calendar?lang=fr-fr"}
        supplements = []
        for row in payload.get("events", []):
            rewards = [item for item in (row.get("rewards") or []) if isinstance(item, dict)]
            special = row.get("special_reward") if isinstance(row.get("special_reward"), dict) else {}
            all_rewards = [*rewards, *([special] if special else [])]
            primo_rows = [reward for reward in all_rewards
                          if "primo" in str(reward.get("name", "")).casefold() and int(reward.get("amount") or 0) > 0]
            stamp_start, stamp_end = int(row.get("start_time") or 0), int(row.get("end_time") or 0)
            if not stamp_start or not stamp_end:
                continue
            supplements.append({"id": f"ennead-event-{row.get('id') or stamp_start}",
                "kind": "onslaught" if "hardchallenge" in str(row.get("type_name", "")).casefold() else "event",
                "title": str(row.get("name") or "Événement Genshin"),
                "start": datetime.fromtimestamp(stamp_start, timezone.utc).isoformat().replace("+00:00", "Z"),
                "end": datetime.fromtimestamp(stamp_end, timezone.utc).isoformat().replace("+00:00", "Z"),
                "image": row.get("image_url", ""), "primogems": sum(int(reward.get("amount") or 0) for reward in primo_rows),
                "description": str(row.get("description") or ""),
                "rewards": [{"name": reward.get("name"), "amount": reward.get("amount"), "icon": reward.get("icon", "")} for reward in all_rewards],
                "verificationSource": ennead_source})
        for row in payload.get("banners", []):
            stamp_start, stamp_end = int(row.get("start_time") or 0), int(row.get("end_time") or 0)
            if not stamp_start or not stamp_end:
                continue
            kind = "weapon-banner" if row.get("weapons") else "char-banner"
            featured = row.get("weapons") or row.get("characters") or []
            supplements.append({"id": f"ennead-banner-{row.get('id') or stamp_start}", "kind": kind, "title": str(row.get("name") or "Vœux"),
                "start": datetime.fromtimestamp(stamp_start, timezone.utc).isoformat().replace("+00:00", "Z"),
                "end": datetime.fromtimestamp(stamp_end, timezone.utc).isoformat().replace("+00:00", "Z"),
                "icons": [{"name": item.get("name", ""), "src": item.get("icon", ""), "rarity": item.get("rarity")} for item in featured],
                "verificationSource": ennead_source})

        # A shared time window is not an identity: several simultaneous events can
        # have different rewards. Require a title/featured-character match, then
        # assign each feed row and supplement at most once.
        proposals = []
        for supplement_index, supplement in enumerate(supplements):
            candidates = []
            for event_index, event in enumerate(events):
                if not _calendar_windows_match(event, supplement, tolerance_hours=24):
                    continue
                score = _calendar_identity_score(event, supplement)
                if score:
                    candidates.append((score, event_index))
            if not candidates:
                continue
            top_score = max(score for score, _ in candidates)
            best = [event_index for score, event_index in candidates if score == top_score]
            if len(best) == 1:
                proposals.append((top_score, best[0], supplement_index))

        by_event = {}
        for score, event_index, supplement_index in proposals:
            by_event.setdefault(event_index, []).append((score, supplement_index))
        matched_supplements = set()
        for event_index, candidates in by_event.items():
            top_score = max(score for score, _ in candidates)
            best = [supplement_index for score, supplement_index in candidates if score == top_score]
            if len(best) != 1:
                continue
            supplement_index = best[0]
            supplement = supplements[supplement_index]
            event = events[event_index]
            matched_supplements.add(supplement_index)
            if supplement.get("kind") in {"event", "onslaught"} and supplement.get("title"):
                event["title"] = supplement["title"]
            event["image"] = event.get("image") or supplement.get("image", "")
            # Ennead rewards belong to this matched title, including a verified 0.
            event["primogems"] = supplement.get("primogems")
            event["description"] = supplement.get("description") or event.get("description", "")
            event["rewards"] = supplement.get("rewards", event.get("rewards", []))
            event["verificationSource"] = supplement.get("verificationSource")
            if not event.get("icons") and supplement.get("icons"):
                event["icons"] = supplement["icons"]

        # Keep real Ennead events that the primary feed omitted (often a secondary
        # event running in the exact same date window as a larger one).
        events.extend(supplement for index, supplement in enumerate(supplements)
                      if index not in matched_supplements)

        if not events:
            events = supplements
            source = "Calendrier Genshin de secours · Ennead"
    except (ValueError, OSError, TypeError, json.JSONDecodeError):
        pass

    events = _clean_genshin_calendar(events)
    return json.dumps({"updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "source": source, "events": events}, ensure_ascii=False).encode("utf-8")


def hoyoverse_codes() -> bytes:
    """Fetch active public redemption codes for Genshin and Star Rail."""
    games = {
        "gi": ("genshin", "Genshin Impact", "https://genshin.hoyoverse.com/en/gift?code="),
        "hsr": ("starrail", "Honkai: Star Rail", "https://hsr.hoyoverse.com/gift?code="),
    }

    def load_game(entry: tuple[str, tuple[str, str, str]]) -> tuple[str, list[dict]]:
        game, (slug, label, redeem_base) = entry
        url = f"https://api.ennead.cc/mihoyo/{slug}/codes"
        payload = json.loads(fetch(url).decode("utf-8", errors="replace"))
        rows, seen = [], set()
        for row in payload.get("active", []):
            if not isinstance(row, dict):
                continue
            code = str(row.get("code") or "").strip()
            identity = code.upper()
            if not re.fullmatch(r"[A-Z0-9]{4,32}", identity) or identity in seen:
                continue
            seen.add(identity)
            rewards = [str(value).strip() for value in row.get("rewards", []) if str(value).strip()] if isinstance(row.get("rewards"), list) else []
            rows.append({"id": f"{game}:{identity}", "game": game, "gameName": label,
                "code": code, "rewards": rewards,
                "redeemUrl": redeem_base + quote(code, safe=""),
                "source": {"title": "Ennead · codes actifs publics", "url": url}})
        return game, rows

    codes, errors = [], {}
    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = {pool.submit(load_game, entry): entry[0] for entry in games.items()}
        for future in as_completed(futures):
            game = futures[future]
            try:
                _, rows = future.result()
                codes.extend(rows)
            except Exception as exc:
                errors[game] = str(exc)
    if not codes and errors:
        raise OSError("Les listes de codes Genshin et Honkai: Star Rail sont indisponibles.")
    codes.sort(key=lambda row: (row["game"], row["code"].casefold()))
    return json.dumps({"updatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "Ennead · codes actifs publics", "codes": codes, "errors": errors}, ensure_ascii=False).encode("utf-8")


def _xml_text(node: ET.Element | None) -> str:
    return " ".join("".join(node.itertext()).split()) if node is not None else ""


def _news_timestamp(value: str) -> float:
    """Normalize RFC-822 RSS dates and ISO timestamps before merging feeds."""
    if not value:
        return 0.0
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        try:
            parsed = parsedate_to_datetime(value)
        except (TypeError, ValueError, OverflowError):
            return 0.0
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.timestamp()


def _official_news_feed(url: str, category: str, limit: int = 24, payload: bytes | None = None) -> list[dict]:
    root = ET.fromstring(payload if payload is not None else fetch(url))
    rows = []
    for item in root.findall(".//item")[:limit]:
        title = _xml_text(item.find("title"))
        link = _xml_text(item.find("link"))
        description = _xml_text(item.find("description"))
        pub = _xml_text(item.find("pubDate"))
        media = item.find("enclosure")
        image = media.attrib.get("url", "") if media is not None else ""
        if not image:
            encoded = item.find("{http://purl.org/rss/1.0/modules/content/}encoded")
            match = re.search(r'<img[^>]+src=["\']([^"\']+)', encoded.text or "", re.I) if encoded is not None else None
            image = match.group(1) if match else ""
        hay = f"{category} {title} {description}".lower()
        kind = "special-program" if re.search(r"special program|programme spécial|programme special|preview program", hay) else "event" if re.search(r"event|événement|evenement", hay) else "banner" if re.search(r"banner|bannière|banniere|wish|vœux", hay) else "update" if re.search(r"version|update|mise à jour|mise a jour|maintenance", hay) else "news"
        primos = re.search(r"\b([\d][\d\s,.]*)\s*(?:primogems?|primogemmes?|pierres de la fatalité)\b", description, re.I)
        videos = youtube_video_ids(description)
        rows.append({"id": link or title, "title": title, "description": description[:1200], "link": link, "date": pub, "image": image, "category": kind, "source": "HoYoverse · Genshin Impact", "primogems": int(re.sub(r"\D", "", primos.group(1))) if primos else None, "videos": videos})
    return rows


def _official_hoyoverse_news(payload: bytes) -> list[dict]:
    """Read the same public content API used by the official Genshin news page."""
    data = json.loads(payload)
    rows = []
    for item in data.get("data", {}).get("list", []):
        title = item.get("sTitle", "")
        if not title:
            continue
        info_id = str(item.get("iInfoId", ""))
        content = item.get("sContent", "")
        description = html_text(item.get("sIntro", "") or content)
        searchable = f"{title} {description}".lower()
        category = "special-program" if re.search(r"special program|programme spécial|programme special", searchable) else "event" if re.search(r"event|événement|evenement", searchable) else "banner" if re.search(r"banner|bannière|banniere|vœux", searchable) else "update" if re.search(r"version|mise à jour|mise a jour|maintenance", searchable) else "news"
        try:
            ext = json.loads(item.get("sExt", "{}") or "{}")
        except (TypeError, json.JSONDecodeError):
            ext = {}
        banners = ext.get("banner", [])
        image = next((x.get("url", "") for x in banners if isinstance(x, dict)), "")
        raw_date = item.get("dtCreateTime", "")
        try:
            created = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
            date = created.isoformat()
        except (TypeError, ValueError):
            date = raw_date
        plain_content = html_text(content)
        primos = re.search(r"\b([\d][\d\s,.]*)\s*(?:primogems?|primogemmes?|primo-gemmes?|primo-gemmes?|pierres de la fatalité)\b", plain_content, re.I)
        videos = youtube_video_ids(content)
        rows.append({"id": f"hoyoverse:{info_id}", "title": title, "description": description[:1400], "content": plain_content[:24000], "link": item.get("sUrl") or f"https://genshin.hoyoverse.com/fr/news/detail/{info_id}", "date": date, "image": image, "category": category, "source": "HoYoverse · actualité officielle", "feed": "Site officiel", "primogems": int(re.sub(r"\D", "", primos.group(1))) if primos else None, "videos": videos})
    return rows


class _HoYoLABOfficialEventsParser(HTMLParser):
    """Extract dated cards from HoYoLAB's public, server-rendered event list."""
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.cards: list[dict] = []
        self.card: dict | None = None
        self.depth = 0
        self.capture = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key: value or "" for key, value in attrs}
        classes = set(values.get("class", "").split())
        if tag == "div" and "mhy-contribution-card" in classes:
            self.card = {"title": "", "titleAttribute": "", "description": "", "duration": "", "status": "", "link": "", "image": ""}
            self.depth = 1
            self.capture = ""
            return
        if not self.card:
            return
        if tag == "div":
            self.depth += 1
        if tag == "a" and not self.card["link"]:
            self.card["link"] = urljoin("https://www.hoyolab.com/official/2", values.get("href", ""))
        if tag == "h3" and "mhy-contribution-card__title" in classes:
            self.card["titleAttribute"] = values.get("title", "")
            self.capture = "title"
        elif tag == "div" and "mhy-contribution-card__desc" in classes:
            self.capture = "description"
        elif tag == "span" and "mhy-contribution-card__duration" in classes:
            self.capture = "duration"
        elif tag == "span" and "mhy-contribution-card__status" in classes:
            self.capture = "status"
        elif tag in {"img", "source"}:
            self.card["image"] = values.get("data-src") or values.get("src") or self.card["image"]
        style = values.get("style", "")
        image = re.search(r"url\([\"']?(.*?)[\"']?\)", style, re.I)
        if image and not self.card["image"]:
            self.card["image"] = urljoin("https://www.hoyolab.com", image.group(1))

    def handle_endtag(self, tag: str) -> None:
        if not self.card:
            return
        if tag in {"h3", "div", "span"} and self.capture and ((tag == "h3" and self.capture == "title") or (tag == "div" and self.capture == "description") or (tag == "span" and self.capture in {"duration", "status"})):
            self.capture = ""
        if tag == "div":
            self.depth -= 1
            if self.depth <= 0:
                if not self.card.get("title"):
                    self.card["title"] = self.card.get("titleAttribute", "")
                if self.card.get("title"):
                    self.cards.append(self.card)
                self.card = None
                self.capture = ""

    def handle_data(self, data: str) -> None:
        if self.card and self.capture:
            self.card[self.capture] = (self.card.get(self.capture, "") + data).strip() if self.capture != "description" else (self.card.get(self.capture, "") + data)


def _hoyolab_external_events(payload: bytes) -> list[dict]:
    parser = _HoYoLABOfficialEventsParser()
    parser.feed(payload.decode("utf-8", errors="replace"))
    utc8 = timezone(timedelta(hours=8))

    def window(value: str) -> tuple[str, str]:
        match = re.search(r"(\d{4})/(\d{1,2})/(\d{1,2})\s*[-–—]\s*(\d{4})/(\d{1,2})/(\d{1,2})", value)
        if not match:
            return "", ""
        start = datetime(*(int(part) for part in match.groups()[:3]), tzinfo=utc8)
        end = datetime(*(int(part) for part in match.groups()[3:]), hour=23, minute=59, second=59, tzinfo=utc8)
        return start.isoformat(), end.isoformat()

    rows = []
    for card in parser.cards:
        title = re.sub(r"\s+", " ", unescape(card.get("title", ""))).strip()
        if not title:
            continue
        description = re.sub(r"\s+", " ", unescape(card.get("description", ""))).strip()
        start, end = window(card.get("duration", ""))
        text = f"{title} {description}"
        if re.search(r"web\s+event|événement web|evenement web", text, re.I):
            external_type = "web"
        elif re.search(r"community|communaut|topic discussion|discussion|forum|creator|créateur|createur|submission|concours|contest|competition|compétition|giveaway|tirage au sort|chance to win|share.{0,50}(?:win|reward|event)|top.?up center|recharge", text, re.I):
            external_type = "community"
        else:
            # An official card for a playable in-game activity stays on the
            # game calendar; only out-of-game campaigns belong in this feed.
            continue
        slug = card.get("link", "") or title
        rows.append({
            "id": "hoyolab-event:" + hashlib.sha256(slug.encode("utf-8")).hexdigest()[:16],
            "title": title,
            "description": description,
            "link": card.get("link", ""),
            "start": start,
            "end": end,
            "date": start,
            "image": card.get("image", ""),
            "status": card.get("status", ""),
            "category": external_type,
            "externalType": external_type,
            "source": {"title": "HoYoLAB · événements officiels", "url": "https://www.hoyolab.com/official/2"},
            "feed": "HoYoLAB · événements officiels",
        })
    return rows


def genshin_news() -> bytes:
    feeds = [("official", "https://genshin-feed.com/feed/rss-fr-all-articles.xml", "Actualités officielles"), ("feed-events", "https://genshin-feed.com/feed/rss-fr-events.xml", "Événements")]
    youtube_source = "https://www.youtube.com/feeds/videos.xml?channel_id=UCiS882YPwZt1NfaM0gR0D9Q"
    sources = {"official-api": "https://sg-public-api-static.hoyoverse.com/content_v2_user/app/a1b1f9d3315447cc/getContentList?iAppId=32&iChanId=395&iPageSize=40&iPage=1&sLangKey=fr-fr", "hoyolab": "https://bbs-api-os.hoyolab.com/community/post/wapi/getNewsList?gids=2&page_size=30&type=1", "hoyolab-events": "https://www.hoyolab.com/official/2", **{key: url for key, url, _ in feeds}}
    raw, errors = {}, []
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {pool.submit(fetch, url): key for key, url in sources.items()}
        for future, key in futures.items():
            try: raw[key] = future.result(timeout=22)
            except Exception as exc: errors.append(f"{key}: {exc}")
    articles: dict[str, dict] = {}
    try:
        for row in _official_hoyoverse_news(raw["official-api"]):
            articles[row["id"]] = row
    except Exception as exc:
        errors.append(f"Site officiel Genshin: {exc}")
    for key, url, label in feeds:
        try:
            for row in _official_news_feed(url, label, payload=raw.get(key)):
                row["feed"] = label
                articles[row["id"]] = row
        except Exception as exc:
            errors.append(f"{label}: {exc}")
    # HoYoLAB's public, read-only announcement endpoint. No account token is used.
    try:
        data = json.loads(raw["hoyolab"])
        for entry in data.get("data", {}).get("list", []):
            post = entry.get("post", {})
            title = post.get("subject", "")
            post_id = str(post.get("post_id", ""))
            if not title or not post_id:
                continue
            text = re.sub(r"<[^>]+>", " ", post.get("content", ""))
            images = post.get("images", [])
            cover = post.get("cover", "")
            created = int(post.get("created_at", 0) or 0)
            stamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(created)) if created else ""
            hay = f"{title} {text}".lower()
            kind = "special-program" if re.search(r"special program|programme spécial|programme special", hay) else "event" if re.search(r"event|événement|evenement", hay) else "banner" if re.search(r"banner|bannière|banniere|vœux", hay) else "update" if re.search(r"version|update|mise à jour|mise a jour", hay) else "news"
            primos = re.search(r"\b([\d][\d\s,.]*)\s*(?:primogems?|primogemmes?|pierres de la fatalité)\b", text, re.I)
            articles[f"hoyolab:{post_id}"] = {"id": f"hoyolab:{post_id}", "title": title, "description": text[:1200], "link": f"https://www.hoyolab.com/article/{post_id}", "date": stamp, "image": cover or (images[0].get("url", "") if images and isinstance(images[0], dict) else ""), "category": kind, "source": "HoYoLAB · annonce officielle", "feed": "HoYoLAB", "primogems": int(re.sub(r"\D", "", primos.group(1))) if primos else None, "videos": []}
    except Exception as exc:
        errors.append(f"HoYoLAB: {exc}")
    # Official YouTube uploads are exposed as Atom. The feed can fail temporarily,
    # so retry it and retain videos linked from official articles as a fallback.
    videos = []
    youtube_error = None
    for attempt in range(3):
        try:
            atom = ET.fromstring(fetch(youtube_source))
            ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}
            for entry in atom.findall("a:entry", ns)[:12]:
                video_id = _xml_text(entry.find("yt:videoId", ns))
                title = _xml_text(entry.find("a:title", ns))
                if not video_id or not title: continue
                videos.append({"id": video_id, "title": title, "date": _xml_text(entry.find("a:published", ns)), "link": f"https://www.youtube.com/watch?v={video_id}", "embed": f"https://www.youtube-nocookie.com/embed/{video_id}", "image": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg", "source": "YouTube · Genshin Impact officiel"})
            youtube_error = None
            break
        except Exception as exc:
            youtube_error = exc
            if attempt < 2: time.sleep(0.6 * (attempt + 1))
    known_video_ids = {video["id"] for video in videos}
    for article in sorted(articles.values(), key=lambda row: _news_timestamp(row.get("date", "")), reverse=True):
        for video_id in article.get("videos", []):
            if video_id in known_video_ids: continue
            known_video_ids.add(video_id)
            videos.append({"id": video_id, "title": article.get("title", "Vidéo liée à une annonce Genshin"), "date": article.get("date", ""), "link": f"https://www.youtube.com/watch?v={video_id}", "embed": f"https://www.youtube-nocookie.com/embed/{video_id}", "image": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg", "source": "Vidéo · annonce Genshin officielle"})
    if youtube_error and not videos: errors.append(f"YouTube temporairement indisponible: {youtube_error}")
    ordered = sorted(articles.values(), key=lambda row: _news_timestamp(row.get("date", "")), reverse=True)
    external_events = []
    try:
        external_events = _hoyolab_external_events(raw["hoyolab-events"])
    except Exception as exc:
        errors.append(f"Événements HoYoLAB: {exc}")
    return json.dumps({"updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "source": "HoYoverse / HoYoLAB / YouTube", "articles": ordered[:60], "externalEvents": external_events, "videos": videos, "errors": errors}, ensure_ascii=False).encode("utf-8")


def genshin_tierlist_status() -> bytes:
    # Reader endpoint supplies page metadata when Prydwen blocks server-side requests.
    text = fetch("https://r.jina.ai/https://www.prydwen.gg/genshin-impact/tier-list").decode("utf-8", errors="replace")
    published = re.search(r"Published Time:\s*([^\r\n]+)", text)
    updated = re.search(r"Last updated:\*\*\s*([^*\r\n]+)", text, re.I)
    version = re.search(r"Genshin Impact Tier List \(([^)]+)\)", text)
    changelog = re.search(r"(?im)^Changelog\s*$", text)
    return json.dumps({"checkedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "publishedAt": published.group(1).strip() if published else "", "lastUpdated": updated.group(1).strip() if updated else "", "version": version.group(1) if version else "", "source": "Prydwen", "page": "https://www.prydwen.gg/genshin-impact/tier-list", "changelogAvailable": bool(changelog)}, ensure_ascii=False).encode("utf-8")


_THEATER_DB_ICON_CACHE: dict[str, str] = {}
_GI_ENEMY_ICON_DB: dict[str, dict[str, str]] | None = None
_HOYOWIKI_ENEMY_ART_CACHE: tuple[float, dict[str, str]] = (0.0, {})
def genshin_enemy_artworks() -> dict[str, str]:
    """Read enemy art URLs from HoYoWiki pages; use remote links, never copy image files."""
    global _HOYOWIKI_ENEMY_ART_CACHE
    checked, cached = _HOYOWIKI_ENEMY_ART_CACHE
    if time.time() - checked < 21600 and cached:
        return cached
    artwork: dict[str, str] = {}
    try:
        source = fetch("https://wiki.hoyolab.com/pc/genshin/aggregate/enemy?bbs_presentation_style=&crawler=Googlebot").decode("utf-8", "replace")
        for block in re.split(r'<div class="genshin-show-enemy-item">', source)[1:]:
            name_match = re.search(r'class="card-with-transparent-bg-name pc">\s*(.*?)\s*</div>', block, re.I | re.S)
            style_match = re.search(r'<div class="card-with-transparent-bg-right pc" style="([^"]+)"', block, re.I | re.S)
            image_match = re.search(r"url\(['\"]?(.*?)['\"]?\)", style_match.group(1), re.I) if style_match else None
            if name_match and image_match:
                name = html_text(name_match.group(1))
                image = unescape(image_match.group(1))
                if name and image.startswith("https://"):
                    artwork[_gi_build_token(name)] = image
        _HOYOWIKI_ENEMY_ART_CACHE = (time.time(), artwork)
    except Exception:
        if cached:
            return cached
    return artwork
def theater_db_icon(name: str) -> str:
    global _GI_ENEMY_ICON_DB
    clean_name = re.sub(r"\s*[×x]\s*\d+$", "", str(name or "").strip(), flags=re.I)
    key = re.sub(r"[^a-z0-9]+", " ", clean_name.casefold()).strip()
    if key in _THEATER_DB_ICON_CACHE: return _THEATER_DB_ICON_CACHE[key]
    icon = ""
    try:
        if _GI_ENEMY_ICON_DB is None:
            catalog_path = Path(__file__).resolve().parent / "artifacts" / "genshin-enemy-images.json"
            catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
            _GI_ENEMY_ICON_DB = catalog if isinstance(catalog, dict) else {}
        entry = _GI_ENEMY_ICON_DB.get(_gi_build_token(clean_name), {})
        filename = entry.get("filename_icon", "") if isinstance(entry, dict) else ""
        if filename:
            icon = "https://gi.yatta.moe/assets/UI/monster/" + quote(filename, safe="") + ".png"
            _THEATER_DB_ICON_CACHE[key] = icon
            return icon
    except Exception:
        _GI_ENEMY_ICON_DB = {}
    try:
        url = "https://genshin-db-api.vercel.app/api/v5/enemies?" + urlencode({"query": clean_name, "matchCategories": "true", "verboseCategories": "true", "resultLanguage": "English"})
        request = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; Astralis/1.0)", "Accept": "application/json"})
        with urlopen(request, timeout=6) as response: row = json.loads(response.read())
        candidates = row if isinstance(row, list) else [row]
        wanted = re.sub(r"[^a-z0-9]+", " ", clean_name.casefold()).strip()
        for candidate in candidates:
            found = re.sub(r"[^a-z0-9]+", " ", str(candidate.get("name", "")).casefold()).strip()
            if found == wanted or (len(wanted) > 12 and (wanted in found or found in wanted)):
                filename = (candidate.get("images") or {}).get("filename_icon", "")
                if filename: icon = "https://gi.yatta.moe/assets/UI/monster/" + quote(filename, safe="") + ".png"
                break
    except Exception: pass
    _THEATER_DB_ICON_CACHE[key] = icon
    return icon

def _current_abyss_start(today=None):
    today = today or datetime.now().date()
    if today.day >= 16:
        return today.replace(day=16)
    year, month = today.year, today.month - 1
    if month == 0: year, month = year - 1, 12
    return today.replace(year=year, month=month, day=16)

def _wiki_plain_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\{\{Color\|[^|}]+\|([^}]+)\}\}", r"\1", value)
    value = re.sub(r"\[\[([^]|]+)\|([^]]+)\]\]", r"\2", value)
    value = re.sub(r"\[\[([^]]+)\]\]", r"\1", value)
    value = value.replace("'''", "").replace("''", "")
    return re.sub(r"\s+", " ", unescape(value)).strip()

def _parse_fandom_abyss_rotation(start_date):
    query = urlencode({"action":"parse", "page":f"Spiral Abyss/Floors/{start_date.isoformat()}", "prop":"wikitext", "format":"json"})
    payload = json.loads(fetch(f"{GI_ABYSS_WIKI_API}?{query}").decode("utf-8", "replace"))
    wikitext = ((payload.get("parse") or {}).get("wikitext") or {}).get("*") or ""
    if not wikitext: raise RuntimeError("La page de rotation datée est absente du wiki Genshin.")
    start = re.search(r"^\|start\s*=\s*(\d{4}-\d{2}-\d{2})\s*$", wikitext, re.I | re.M)
    end = re.search(r"^\|end\s*=\s*(\d{4}-\d{2}-\d{2})\s*$", wikitext, re.I | re.M)
    if not start or start.group(1) != start_date.isoformat() or not end:
        raise RuntimeError("La source wiki ne correspond pas au cycle d’Abîme attendu.")
    floors = []
    for floor_no in (11, 12):
        match = re.search(rf"===\s*Floor\s+{floor_no}\s*===(.*?)(?=\n===\s*Floor\s+\d+\s*===|\Z)", wikitext, re.I | re.S)
        if not match: raise RuntimeError(f"Le wiki ne fournit pas l’étage {floor_no} de ce cycle.")
        section = match.group(1)
        domain = re.search(r"\{\{Domain Enemies\s*(.*?)\n\}\}", section, re.I | re.S)
        if not domain: raise RuntimeError(f"Le wiki ne fournit pas les ennemis de l’étage {floor_no}.")
        fields = {}
        for line in domain.group(1).splitlines():
            field = re.match(r"\s*\|\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$", line)
            if field: fields[field.group(1).lower()] = field.group(2)
        chambers = []
        for chamber_no in range(1, 4):
            if not fields.get(f"level{chamber_no}"): continue
            halves = []
            for half_no, half_label in ((1,"1re moitié"),(2,"2e moitié")):
                raw = fields.get(f"enemies{chamber_no}_{half_no}", "").strip()
                enemies = []
                for token in re.split(r"\s*(?://|;)\s*", raw):
                    token = token.strip()
                    if not token: continue
                    count = re.search(r"\*(\d+)\s*$", token)
                    name = token[:count.start()].strip() if count else token
                    if count: name = f"{name} ×{count.group(1)}"
                    clean_name = re.sub(r"\s*×\d+$", "", name)
                    enemies.append({"name":name, "icon":theater_db_icon(clean_name)})
                note = _wiki_plain_text(fields.get(f"note{chamber_no}", ""))
                halves.append({"name":half_label, "enemies":enemies, "note":note})
            level = fields.get(f"level{chamber_no}", "")
            target = fields.get(f"target{chamber_no}", "")
            chambers.append({"name":f"Salle {floor_no}-{chamber_no}", "level":level, "target":_wiki_plain_text(target), "halves":halves})
        if len(chambers) != 3 or any(not side["enemies"] for chamber in chambers for side in chamber["halves"]):
            raise RuntimeError(f"Les données de l’étage {floor_no} sont incomplètes.")
        disorder_block = section.split("{{Domain Enemies", 1)[0]
        disorder = []
        for line in disorder_block.splitlines():
            line = line.strip().lstrip("*# ")
            if not line or "Ley Line Disorder" in line: continue
            line = _wiki_plain_text(line)
            line = re.sub(r"All party members gain a (\d+%) ([\w -]+) DMG Bonus\.?", r"Bonus DGT \2 +\1", line, flags=re.I)
            line = re.sub(r"DMG is increased by (\d+%)", r"DGT augmenté de \1", line, flags=re.I)
            line = re.sub(r"\bFirst Half\b", "1re moitié", line, flags=re.I)
            line = re.sub(r"\bSecond Half\b", "2e moitié", line, flags=re.I)
            line = re.sub(r"All party members have their Elemental Mastery increased by (\d+)", r"Maîtrise élémentaire de l’équipe +\1", line, flags=re.I)
            line = re.sub(r"\bElectro\b", "Électro", line)
            line = re.sub(r"\bGeo\b", "Géo", line)
            if line: disorder.append(line)
        level_values = [int(value) for key,value in fields.items() if re.fullmatch(r"level\d+",key) and value.isdigit()]
        floors.append({"floor":str(floor_no), "levels":f"{min(level_values)}–{max(level_values)}" if level_values else "", "disorder":" · ".join(disorder), "chambers":chambers})
    return {"start":start.group(1), "end":end.group(1), "version":re.search(r"^\|startVersion\s*=\s*(.+)$",wikitext,re.I|re.M).group(1).strip() if re.search(r"^\|startVersion\s*=\s*(.+)$",wikitext,re.I|re.M) else "", "floors":floors, "source":"Genshin Impact Wiki · cycle daté"}

def _official_abyss_blessing(start_date):
    try:
        page = fetch(GI_ABYSS_PATCH_NOTES).decode("utf-8", "replace")
        month = start_date.strftime("%B")
        summary = rf"<summary[^>]*>.*?Update Scheduled for\s+{month}\s+{start_date.day}.*?</summary>"
        block = re.search(summary + r"(.*?)</details>", page, re.I | re.S)
        if not block: return ""
        content = block.group(1)
        title = re.search(r"Blessing of the Abyssal Moon:\s*</p>\s*<p[^>]*>(.*?)</p>", content, re.I | re.S)
        detail = re.search(r"Blessing of the Abyssal Moon:\s*</p>\s*<p[^>]*>.*?</p>\s*<p[^>]*>(.*?)</p>", content, re.I | re.S)
        if not title or not detail: return ""
        return f"{_wiki_plain_text(title.group(1))} — {_wiki_plain_text(detail.group(1))}"
    except Exception:
        return ""

def genshin_endgame() -> bytes:
    def page(url):
        try:
            return fetch(url).decode("utf-8", errors="replace")
        except OSError:
            return ""

    cycle_start = _current_abyss_start()
    with ThreadPoolExecutor(max_workers=6) as pool:
        pages = [pool.submit(page, url) for url in ENDGAME_URLS]
        calendar = pool.submit(genshinflex_calendar_rows)
        wiki_abyss_future = pool.submit(_parse_fandom_abyss_rotation, cycle_start)
        official_blessing_future = pool.submit(_official_abyss_blessing, cycle_start)
        enemy_art_future = pool.submit(genshin_enemy_artworks)
        abyss, theater, onslaught = [future.result() for future in pages]
        try:
            windows = calendar.result()
        except (OSError, ValueError, TypeError):
            windows = []
        try:
            wiki_abyss = wiki_abyss_future.result()
        except Exception:
            wiki_abyss = None
        try:
            official_blessing = official_blessing_future.result()
        except Exception:
            official_blessing = ""
    if not any((abyss, theater, onslaught)):
        raise OSError("Les trois pages de rotation sont indisponibles.")

    def match_window(kind, raw_period):
        date_parts = re.findall(r"([A-Za-z]+)\s+(\d{1,2})", raw_period)
        if len(date_parts) != 2:
            return {}
        try:
            dates = [datetime.strptime(f"{month} {day} 2000", "%B %d %Y").strftime("%m-%d") for month, day in date_parts]
        except ValueError:
            return {}
        matches = [row for row in windows if row["kind"] == kind and
                   [row["start"][5:10], row["end"][5:10]] == dates]
        if not matches:
            return {}
        now = datetime.now().isoformat(timespec="minutes")
        match = min(matches, key=lambda row: abs((datetime.fromisoformat(row["start"][:16]) -
                                                   datetime.fromisoformat(now)).days))
        return {"start": match["start"], "end": match["end"]}

    blessing_match = re.search(r'<div class="panel blessing"[^>]*>.*?<p[^>]*>(.*?)</p>', abyss, re.I | re.S)
    floors = []
    sections = list(re.finditer(r'<section id="floor-(\d+)" class="floor"[^>]*>(.*?)(?=<section id="floor-\d+" class="floor"|</main>)', abyss, re.I | re.S))
    for section in sections:
        floor_no, body = section.groups()
        level = re.search(r'enemy levels?\s*([^<]+)', body, re.I)
        disorder_list = re.search(r'<ul class="disorder"[^>]*>(.*?)</ul>', body, re.I | re.S)
        disorder = [html_text(v).replace("Disorder", "Bonus de trouble") for v in re.findall(r'<li\b[^>]*>(.*?)</li>', disorder_list.group(1), re.I | re.S)] if disorder_list else []
        chambers = []
        for chamber in re.findall(r'<article class="panel chamber"[^>]*>(.*?)</article>', body, re.I | re.S):
            heading = re.search(r'<h3[^>]*>(.*?)</h3>', chamber, re.I | re.S)
            halves = []
            for half in re.findall(r'<div class="half"[^>]*>(.*?)(?=<div class="half"|$)', chamber, re.I | re.S):
                label = re.search(r'<span class="hl"[^>]*>(.*?)</span>', half, re.I | re.S)
                enemies = []
                for enemy in re.findall(r'<li class="enemy"[^>]*>(.*?)</li>', half, re.I | re.S):
                    icon = re.search(r'<img[^>]+src="([^"]+)"', enemy, re.I)
                    name = re.search(r'<span[^>]*>(.*?)</span>', enemy, re.I | re.S)
                    if name:
                        enemy_name = html_text(name.group(1))
                        enemy_icon = urljoin("https://genshinflex.com/", unescape(icon.group(1))) if icon else theater_db_icon(re.sub(r"\s*\([^)]*\)", "", enemy_name).strip())
                        enemies.append({"name": enemy_name, "icon": enemy_icon})
                note_match = re.search(r'<p class="muted small"[^>]*>(.*?)</p>', half, re.I | re.S)
                halves.append({"name": html_text(label.group(1)).replace("Half 1", "1re moitié").replace("Half 2", "2e moitié") if label else "Moitié", "enemies": enemies, "note": html_text(note_match.group(1)) if note_match else ""})
            if heading:
                chambers.append({"name": html_text(heading.group(1)).replace("Chamber", "Salle"), "halves": halves})
        floors.append({"floor": floor_no, "levels": html_text(level.group(1)) if level else "", "disorder": " · ".join(disorder), "chambers": chambers})
    cycle = re.search(r'<article class="panel cycle"[^>]*data-history-item[^>]*>(.*?)(?=<article class="panel cycle"|</main>)', theater, re.I | re.S)
    cycle_html = cycle.group(1) if cycle else ""
    title_match = re.search(r'<h3[^>]*>(.*?)</h3>', cycle_html, re.I | re.S)
    period_match = re.search(r'<p class="muted small"[^>]*>(.*?)</p>', cycle_html, re.I | re.S)
    groups = {}
    for group in re.finditer(r'<div class="cast-group"[^>]*>\s*<h4[^>]*>(.*?)</h4>(.*?)(?=<div class="cast-group"|$)', cycle_html, re.I | re.S):
        names = re.findall(r'<a class="ci"[^>]*title="([^"]+)"', group.group(2), re.I)
        groups[html_text(group.group(1)).lower()] = [html_text(x) for x in names]
    elements = re.search(r'data-elements="([^"]*)"', cycle.group(0), re.I) if cycle else None
    def french_months(text: str) -> str:
        months = {"January":"janvier", "February":"février", "March":"mars", "April":"avril", "May":"mai", "June":"juin", "July":"juillet", "August":"août", "September":"septembre", "October":"octobre", "November":"novembre", "December":"décembre"}
        text = re.sub(r"\b([A-Za-z]+)\s+(\d+)\b", lambda m: f"{m.group(2)} {months.get(m.group(1), m.group(1))}" if m.group(1) in months else m.group(0), text)
        for english, french in months.items():
            text = re.sub(rf"\b{english}\b", french, text, flags=re.I)
        return text.replace("Anemo", "Anémo").replace("Season", "Saison").replace("Imaginarium Theater", "Théâtre de l’imaginarium").replace("elements:", "éléments :")
    element_names = {"hydro":"Hydro", "cryo":"Cryo", "anemo":"Anémo", "pyro":"Pyro", "electro":"Électro", "dendro":"Dendro", "geo":"Géo"}
    theater_bosses = []
    # GenshinFlex keeps boss portraits in the season's enemy-list markup. Index
    # these URLs before parsing the compact "Main villains" text summary.
    theater_enemy_icons = {}
    for enemy_html in re.findall(r'<li class="enemy"[^>]*>(.*?)</li>', theater, re.I | re.S):
        enemy_name = re.search(r'<span[^>]*>(.*?)</span>', enemy_html, re.I | re.S)
        enemy_image = re.search(r'<img[^>]+src="([^"]+)"', enemy_html, re.I)
        if enemy_name and enemy_image:
            clean_name = re.sub(r'\s*<small.*$', '', enemy_name.group(1), flags=re.I | re.S)
            theater_enemy_icons[html_text(clean_name).lower()] = urljoin("https://genshinflex.com/", unescape(enemy_image.group(1)))
    villain_line = re.search(r'Main villains:\s*(.*?)</li>', cycle_html, re.I | re.S)
    if villain_line:
        villain_text = html_text(villain_line.group(1))
        for chunk in re.split(r',\s*(?=Act\s+\d+)', villain_text):
            match = re.match(r'Act\s+(\d+)\s*[—–:-]?\s*(.*)', chunk, re.I)
            if not match: continue
            stage, names = match.groups()
            candidates = re.split(r'\s+or\s+', names, flags=re.I)
            enemies = []
            for name in candidates:
                clean = re.sub(r'\s*\([^)]*mode[^)]*\)', '', name, flags=re.I).strip()
                clean = re.sub(r'\s*·\s*enhanced version', '', clean, flags=re.I).strip()
                icon = theater_enemy_icons.get(clean.lower(), '')
                if not icon:
                    icon = next((url for known, url in theater_enemy_icons.items() if clean.lower() in known or known in clean.lower()), '')
                if not icon: icon = theater_db_icon(re.sub(r"\s*\([^)]*\)", "", clean).strip())
                if clean: enemies.append({"name": clean, "icon": icon})
            theater_bosses.append({"name": f"Acte {stage}", "enemies": enemies})
    for boss in re.findall(r'<div class="boss"[^>]*>(.*?)</div>', cycle_html, re.I | re.S):
        heading = re.search(r'<h4[^>]*>(.*?)</h4>', boss, re.I | re.S)
        enemies = []
        for enemy in re.findall(r'<li class="enemy"[^>]*>(.*?)</li>', boss, re.I | re.S):
            icon = re.search(r'<img[^>]+src="([^"]+)"', enemy, re.I)
            name = re.search(r'<span[^>]*>(.*?)</span>', enemy, re.I | re.S)
            if name:
                enemy_name = html_text(name.group(1))
                enemy_icon = urljoin("https://genshinflex.com/", unescape(icon.group(1))) if icon else theater_db_icon(re.sub(r"\s*\([^)]*\)", "", enemy_name).strip())
                enemies.append({"name": enemy_name, "icon": enemy_icon})
        if enemies and (not heading or "main villains" not in html_text(heading.group(1)).lower()): theater_bosses.append({"name": html_text(heading.group(1)) if heading else "Boss", "enemies": enemies})
    blessing_text = html_text(blessing_match.group(1)) if blessing_match else ""
    for english, french in (("Abyssal Moon blessing:", "Bénédiction de la lune abyssale :"), ("Disorder", "Bonus de trouble"), ("Superconduct", "Supraconduction"), ("Frozen", "Gel"), ("Shatter", "Brisé"), ("Time left over", "Temps restant")):
        blessing_text = blessing_text.replace(english, french)
    on_title_match = re.search(r'<h1[^>]*>.*?</h1>\s*<p class="muted"[^>]*>(.*?)</p>', onslaught, re.I | re.S)
    on_date_match = re.search(r'<span class="muted small"[^>]*>([A-Za-z]+\s+\d+\s*[—-]+\s*[A-Za-z]+\s+\d+)</span>', onslaught, re.I)
    on_elements = []
    intro = re.search(r'<div class="row"[^>]*>(.*?)(?=<div class="panel when"|</header>)', onslaught, re.I | re.S)
    if intro:
        on_elements = [html_text(x) for x in re.findall(r'<span class="chip gold"[^>]*>(.*?)</span>', intro.group(1), re.I | re.S)]
    on_bosses = []
    stage_sections = list(re.finditer(r'<article id="stage-(\d+)" class="panel stage"[^>]*>(.*?)(?=<article id="stage-\d+" class="panel stage"|</div>\s*</section>)', onslaught, re.I | re.S))
    if not stage_sections:
        stage_sections = list(re.finditer(r'<article id="stage-(\d+)" class="panel stage"[^>]*>(.*?)(?=<article id="stage-\d+" class="panel stage"|<section class="videos")', onslaught, re.I | re.S))
    for stage in stage_sections:
        stage_no, body = stage.groups()
        stage_title = re.search(r'<span class="chip"[^>]*>(.*?)</span>', body, re.I | re.S)
        boss_group = re.search(r'<span class="hl"[^>]*>Boss</span>\s*<ul[^>]*>(.*?)</ul>', body, re.I | re.S)
        enemies = []
        if boss_group:
            for enemy in re.findall(r'<li class="enemy"[^>]*>(.*?)</li>', boss_group.group(1), re.I | re.S):
                icon = re.search(r'<img[^>]+src="([^"]+)"', enemy, re.I)
                name = re.search(r'<span[^>]*>(.*?)</span>', enemy, re.I | re.S)
                if name:
                    enemy_name = html_text(name.group(1))
                    enemy_icon = urljoin("https://genshinflex.com/", unescape(icon.group(1))) if icon else theater_db_icon(re.sub(r"\s*\([^)]*\)", "", enemy_name).strip())
                    enemies.append({"name": enemy_name, "icon": enemy_icon})
        weak = re.search(r'<div class="weak"[^>]*>(.*?)</div>', body, re.I | re.S)
        advantages = [html_text(x) for x in re.findall(r'<span class="chip gold"[^>]*>(.*?)</span>', weak.group(1), re.I | re.S)] if weak else []
        on_bosses.append({"stage": stage_no, "name": html_text(stage_title.group(1)) if stage_title else f"Combat {stage_no}", "enemies": enemies, "advantages": advantages})
    abyss_period = re.search(r'<span class="muted small"[^>]*>([A-Za-z]+\s+\d+\s*[—-]+\s*[A-Za-z]+\s+\d+)</span>', abyss, re.I)
    raw_periods = {
        "abyss": html_text(abyss_period.group(1)) if abyss_period else "",
        "theater": html_text(period_match.group(1)) if period_match else "",
        "onslaught": html_text(on_date_match.group(1)) if on_date_match else "",
    }
    published = {kind: match_window(kind, text) for kind, text in raw_periods.items()}
    abyss_source = "GenshinFlex"
    if wiki_abyss:
        current_by_floor = {str(row.get("floor")):row for row in floors}
        current_by_floor.update({str(row["floor"]):row for row in wiki_abyss["floors"]})
        floors = [current_by_floor[key] for key in sorted(current_by_floor, key=lambda value:int(value))]
        reset = datetime.fromisoformat(wiki_abyss["end"]) + timedelta(days=1)
        published["abyss"] = {"start":f"{wiki_abyss['start']}T04:00", "end":reset.strftime("%Y-%m-%dT04:00")}
        abyss_source = wiki_abyss["source"]
    onslaught_data = {"title": (re.search(r"Version\s+([\d.]+)", html_text(on_title_match.group(1)), re.I) and f"Version {re.search(r'Version\s+([\d.]+)', html_text(on_title_match.group(1)), re.I).group(1)} · rotation publiée") if on_title_match else "Carnage chtonien", "period": french_months(html_text(on_date_match.group(1))) if on_date_match else "", "endAt": published["onslaught"].get("end", ""), "elements": on_elements, "bosses": on_bosses}
    if official_blessing:
        blessing_text = official_blessing
    result = {"updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
              "windows": published,
              "blessing": blessing_text,
              "sources":{"abyss":abyss_source,"theater":"GenshinFlex · saison active","onslaught":"GenshinFlex · rotation active","blessing":"Notes de mise à jour officielles" if official_blessing else "GenshinFlex"},
              "floors": floors,
              "theater": {"title": french_months(html_text(title_match.group(1))) if title_match else "Théâtre de l’imaginarium",
                          "period": french_months(html_text(period_match.group(1))) if period_match else "",
                          "elements": [element_names.get(x.lower(), x) for x in (elements.group(1).split() if elements else [])],
                          "opening": next((v for k,v in groups.items() if "opening" in k), []),
                          "guests": next((v for k,v in groups.items() if "special guest" in k), []), "bosses": theater_bosses},
              "onslaught": onslaught_data}
    try:
        enemy_art = enemy_art_future.result()
        icon_aliases = {"battlehardenedsamachurl": "geosamachurl", "battlehardenedprismslime": "largegeoslime", "prismslime": "largegeoslime"}
        art_aliases = {"battlehardenedsamachurl": "geosamachurl", "battlehardenedprismslime": "largegeoslime", "prismslime": "largegeoslime"}
        for group in result.get("floors", []):
            entries = [enemy for chamber in group.get("chambers", []) for half in chamber.get("halves", []) for enemy in half.get("enemies", [])]
            for enemy in entries:
                # Always attach official artwork as a browser-side fallback, even when a catalog icon exists.
                token = _gi_build_token(enemy.get("name", "").split(" ×", 1)[0])
                if token in icon_aliases:
                    enemy["icon"] = theater_db_icon(icon_aliases[token])
                elif not enemy.get("icon"):
                    enemy["icon"] = theater_db_icon(enemy.get("name", ""))
                enemy["art"] = enemy_art.get(token) or enemy_art.get(art_aliases.get(token, ""), "")
        for section in (result.get("theater", {}), result.get("onslaught", {})):
            for group in section.get("bosses", []):
                for enemy in group.get("enemies", []):
                    # Always attach official artwork as a browser-side fallback, even when a catalog icon exists.
                    token = _gi_build_token(enemy.get("name", "").split(" ×", 1)[0])
                    if token in icon_aliases:
                        enemy["icon"] = theater_db_icon(icon_aliases[token])
                    elif not enemy.get("icon"):
                        enemy["icon"] = theater_db_icon(enemy.get("name", ""))
                    enemy["art"] = enemy_art.get(token) or enemy_art.get(art_aliases.get(token, ""), "")
    except Exception:
        pass
    return json.dumps(result, ensure_ascii=False).encode("utf-8")


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, fmt: str, *args: object) -> None:
        print("[Astralis] " + (fmt % args))

    def _require_access(self) -> bool:
        """Protect a hosted personal instance; Render supplies the secret at deploy time."""
        if not HOSTED:
            return True
        if not ACCESS_PASSWORD:
            self.send_json(503, {"error":"Astralis n’est pas encore configuré."})
            return False
        header = self.headers.get("Authorization", "")
        scheme = ""
        try:
            scheme, encoded = header.split(" ", 1)
            import base64
            username, password = base64.b64decode(encoded, validate=True).decode("utf-8").split(":", 1)
        except (ValueError, UnicodeError, binascii.Error):
            username, password = "", ""
        if scheme.lower() == "basic" and username == "astralis" and hmac.compare_digest(password, ACCESS_PASSWORD):
            return True
        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="Astralis privé", charset="UTF-8"')
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", "0")
        self.end_headers()
        return False

    def send_character_sheets_json(self, status: int, data: object, cookie: str | None = None) -> None:
        payload=json.dumps(data,ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type","application/json; charset=utf-8")
        self.send_header("Content-Length",str(len(payload)))
        self.send_header("Cache-Control","no-store")
        if cookie is not None: self.send_header("Set-Cookie",cookie)
        self.end_headers()
        self.wfile.write(payload)

    def do_POST(self) -> None:
        global _HOYOLAB_RESIN_CACHE
        path = urlsplit(self.path).path
        if not self._require_access(): return
        if path == "/api/profile-icon":
            if not _is_local_origin(self.headers.get("Origin","")):
                self.send_json(403,{"error":"Origine refusée."});return
            try:
                length=int(self.headers.get("Content-Length","0"))
                if length<2 or length>900000:raise ValueError("Icône trop volumineuse.")
                self.send_json(200,community_services.store_profile_icon(json.loads(self.rfile.read(length))))
            except (ValueError,TypeError) as error:self.send_json(400,{"error":str(error)})
            return
        sheet_routes={"/api/character-sheets/login","/api/character-sheets/logout","/api/character-sheets/publish","/api/character-sheets/delete"}
        allowed_origin=_same_site_origin(self.headers.get("Origin",""),self.headers.get("Host","")) if HOSTED else _is_local_origin(self.headers.get("Origin",""))
        if path in sheet_routes:
            if not allowed_origin:
                self.send_character_sheets_json(403,{"error":"Origine refusée."}); return
            if _CHARACTER_SHEETS_READ_ONLY and path in {"/api/character-sheets/login","/api/character-sheets/publish","/api/character-sheets/delete"}:
                self.send_character_sheets_json(403,{"error":"Les fiches de cette version hébergée sont en lecture seule."}); return
            try:
                length=int(self.headers.get("Content-Length","0"))
                if length<1 or length>_CHARACTER_SHEETS_LIMIT: raise ValueError("Taille de requête invalide.")
                body=json.loads(self.rfile.read(length))
                if not isinstance(body,dict): raise ValueError("Requête invalide.")
                if path=="/api/character-sheets/login":
                    if not _CHARACTER_SHEETS_ADMIN_PASSWORD:
                        self.send_character_sheets_json(503,{"error":"L’accès auteur n’est pas encore configuré sur le serveur."}); return
                    address=str(self.client_address[0]); now=time.time()
                    with _CHARACTER_SHEETS_LOCK:
                        attempts,until=_CHARACTER_SHEETS_LOGIN_FAILURES.get(address,(0,0))
                        if until>now and attempts>=6:
                            self.send_character_sheets_json(429,{"error":"Trop de tentatives. Réessaie dans quelques minutes."}); return
                    if not hmac.compare_digest(str(body.get("password","")),_CHARACTER_SHEETS_ADMIN_PASSWORD):
                        with _CHARACTER_SHEETS_LOCK:
                            attempts,until=_CHARACTER_SHEETS_LOGIN_FAILURES.get(address,(0,0))
                            attempts=attempts+1 if until>now else 1
                            _CHARACTER_SHEETS_LOGIN_FAILURES[address]=(attempts,now+600)
                        self.send_character_sheets_json(401,{"error":"Mot de passe auteur incorrect."}); return
                    with _CHARACTER_SHEETS_LOCK:
                        _CHARACTER_SHEETS_LOGIN_FAILURES.pop(address,None)
                        token=secrets.token_urlsafe(36)
                        _CHARACTER_SHEETS_ADMIN_SESSIONS[token]=now+43200
                    secure="; Secure" if HOSTED else ""
                    self.send_character_sheets_json(200,{"ok":True,"authenticated":True},f"astralis_character_sheets_admin={token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=43200{secure}"); return
                if path=="/api/character-sheets/logout":
                    token=_character_sheets_cookie_token(self.headers.get("Cookie",""))
                    with _CHARACTER_SHEETS_LOCK: _CHARACTER_SHEETS_ADMIN_SESSIONS.pop(token,None)
                    self.send_character_sheets_json(200,{"ok":True},"astralis_character_sheets_admin=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0"+("; Secure" if HOSTED else "")); return
                if not _character_sheets_is_admin(self):
                    self.send_character_sheets_json(403,{"error":"Seul l’auteur authentifié peut publier ou retirer une fiche."}); return
                storage=_character_sheets_storage()
                if not storage["ready"]:
                    self.send_character_sheets_json(503,{"error":"Le stockage durable des fiches n’est pas configuré. Ajoute le dépôt GitHub et son jeton dans les variables secrètes du serveur."}); return
                if path=="/api/character-sheets/publish":
                    sheet=_validate_character_sheet(body.get("sheet"))
                    saved=_character_sheets_write(sheet)
                    self.send_character_sheets_json(200,{"ok":True,"sheet":_character_sheets_metadata(saved)}); return
                sheet_id=str(body.get("id",""))
                if not re.fullmatch(r"[A-Za-z0-9_-]{8,80}",sheet_id): raise ValueError("Identifiant de fiche invalide.")
                self.send_character_sheets_json(200,{"ok":True,"deleted":_character_sheets_delete(sheet_id)}); return
            except (ValueError,TypeError,json.JSONDecodeError) as exc:
                self.send_character_sheets_json(400,{"error":str(exc) or "Requête invalide."}); return
            except Exception as exc:
                print("[Astralis] Stockage des fiches indisponible : " + str(exc))
                self.send_character_sheets_json(502,{"error":"Le serveur n’a pas pu enregistrer la fiche. Vérifie le dépôt de stockage et réessaie."}); return
        if path not in {"/api/hoyolab/credentials", "/api/hoyolab/disconnect", "/api/update/install", "/api/lab/team-export", "/api/app-session/open", "/api/app-session/close", "/api/desktop/settings", "/api/desktop/shortcut", "/api/desktop/icon"}:
            self.send_json(404, {"error":"Route inconnue."}); return
        if HOSTED and path in {"/api/hoyolab/credentials", "/api/hoyolab/disconnect"}:
            self.send_json(410, {"error":"La connexion HoYoLAB avec cookies est réservée à l’application locale sécurisée."}); return
        if HOSTED and path.startswith("/api/desktop/"):
            self.send_json(410, {"error":"Ces réglages nécessitent l’application Windows locale."}); return
        if HOSTED and path == "/api/update/install":
            self.send_json(410, {"error":"Le service de mise à jour automatique fonctionne uniquement dans l’application Windows."}); return
        if HOSTED and path == "/api/lab/team-export":
            self.send_json(410, {"error":"Sur la version hébergée, le JSON est téléchargé dans ton navigateur et n’est pas enregistré sur le serveur."}); return
        if HOSTED and path in {"/api/app-session/open", "/api/app-session/close"}:
            self.send_json(200, {"ok": True}); return
        origin = self.headers.get("Origin", "")
        if not _is_local_origin(origin):
            self.send_json(403, {"error":"Origine refusée."}); return
        if path.startswith("/api/app-session/") and not ipaddress.ip_address(self.client_address[0]).is_loopback:
            self.send_json(403, {"error":"Arrêt réservé à Astralis sur cet appareil."}); return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > (2_000_000 if path in {"/api/lab/team-export", "/api/desktop/icon", "/api/desktop/shortcut"} else 8192): raise ValueError("Taille de requête invalide.")
            body = json.loads(self.rfile.read(length))
            if path == "/api/desktop/settings":
                if not isinstance(body.get("autoOpenGenshin"), bool): raise ValueError("Option de lancement invalide.")
                settings = desktop_integration.save_settings(Path(__file__).resolve().parent, body["autoOpenGenshin"])
                self.send_json(200, {"ok":True, **settings}); return
            if path == "/api/desktop/icon":
                root = Path(__file__).resolve().parent
                desktop_integration.set_app_icon(body.get("iconData"))
                desktop_integration.refresh_shortcut_icons(root)
                self.send_json(200, {"ok":True}); return
            if path == "/api/desktop/shortcut":
                if "iconData" in body: desktop_integration.set_app_icon(body["iconData"])
                filename = desktop_integration.create_shortcut(Path(__file__).resolve().parent, str(body.get("location", "desktop")), "app")
                self.send_json(200, {"ok":True,"path":filename}); return
            if path in {"/api/app-session/open", "/api/app-session/close"}:
                session = str(body.get("id", ""))
                if not re.fullmatch(r"[A-Za-z0-9_-]{16,80}", session): raise ValueError("Session locale invalide.")
                global _APP_SESSIONS_SEEN, _APP_SHUTDOWN_TIMER
                with _APP_SESSION_LOCK:
                    if path.endswith("/open"):
                        _APP_SESSIONS_SEEN = True
                        _APP_SESSIONS[session] = time.time()
                        _APP_WINDOW_TITLES[session] = str(body.get("title", ""))[:200]
                        if _APP_SHUTDOWN_TIMER:
                            _APP_SHUTDOWN_TIMER.cancel(); _APP_SHUTDOWN_TIMER = None
                    else:
                        removed = _APP_SESSIONS.pop(session, None) is not None
                        if removed and _APP_SESSIONS_SEEN and not _APP_SESSIONS:
                            _schedule_app_shutdown_locked()
                self.send_json(200, {"ok": True}); return
            if path == "/api/lab/team-export":
                if body.get("format") != "astralis-team" or not isinstance(body.get("name"), str) or not isinstance(body.get("team"), dict):
                    raise ValueError("Export d’équipe Astralis invalide.")
                members = body["team"].get("members", [])
                if not isinstance(members, list) or not 1 <= len(members) <= 4:
                    raise ValueError("L’équipe doit contenir un à quatre emplacements.")
                payload = json.dumps(body, ensure_ascii=False, indent=2)
                name = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:24]+".json"
                folder = Path(__file__).resolve().parent / "data" / "lab-user-exports"
                folder.mkdir(parents=True, exist_ok=True)
                temporary = folder / (name+".tmp")
                temporary.write_text(payload, encoding="utf-8")
                temporary.replace(folder / name)
                self.send_json(200, {"ok": True, "file": "data/lab-user-exports/"+name}); return
            if path == "/api/update/install":
                repo = str(body.get("repo", "")).strip()
                tag = str(body.get("tag", "")).strip()
                client_version = str(body.get("current", "")).strip()
                if not re.fullmatch(r"[A-Za-z0-9_.-]{1,100}/[A-Za-z0-9_.-]{1,100}", repo) or not tag or len(tag) > 120: raise ValueError("Dépôt ou version invalide.")
                from_version = _installed_update_version(Path(__file__).resolve().parent, client_version)
                with _UPDATE_LOCK:
                    saved = saved_update_status()
                    status = saved if saved.get("updatedAt", 0) > _UPDATE_STATUS.get("updatedAt", 0) else _UPDATE_STATUS
                    if status.get("state") in _UPDATE_ACTIVE: raise ValueError("Une mise à jour est déjà en cours.")
                    _UPDATE_STATUS.update(persist_update_status(jobId=secrets.token_hex(12), state="checking", message="Vérification de la version…", error="", tag=tag, percent=0, receivedBytes=0, totalBytes=0, windowTitles=list({str(body.get("windowTitle", "Astralis"))[:200], *[title for key,title in _APP_WINDOW_TITLES.items() if key in _APP_SESSIONS and title]}), installationPath=str(Path(__file__).resolve().parent)))
                threading.Thread(target=_download_update, args=(repo, tag, from_version), daemon=True).start()
                self.send_json(202, {"ok":True,"state":"downloading"}); return
            if path.endswith("/disconnect"):
                _write_hoyolab_secret(None)
                _HOYOLAB_RESIN_CACHE = None
                self.send_json(200, {"ok":True}); return
            uid = str(body.get("uid", "")).strip()
            region = str(body.get("region", "os_euro"))
            cookie = str(body.get("cookie", "")).strip()
            if not re.fullmatch(r"\d{8,12}", uid): raise ValueError("Saisis un UID Genshin valide (8 à 12 chiffres).")
            if region not in {"os_usa", "os_euro", "os_asia", "os_cht"}: raise ValueError("Serveur Genshin invalide.")
            if not cookie or len(cookie) > 6000 or "=" not in cookie or "\r" in cookie or "\n" in cookie: raise ValueError("Colle uniquement les cookies de session HoYoLAB valides.")
            _write_hoyolab_secret({"uid":uid,"region":region,"cookie":cookie})
            _HOYOLAB_RESIN_CACHE = None
            self.send_json(200, {"ok":True,"encrypted":True,"storage":"Windows DPAPI · profil utilisateur local"})
        except Exception as exc:
            self.send_json(400, {"error":str(exc)})

    def do_GET(self) -> None:
        if HOSTED and urlsplit(self.path).path == "/healthz":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", "2")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(b"ok")
            return
        if not self._require_access(): return
        request_url = urlsplit(self.path)
        path = request_url.path
        refresh = parse_qs(request_url.query).get("refresh") == ["1"]
        if path in {"/api/feedback/status","/api/feedback/owner-link"}:
            link=community_services.owner_link(self.client_address[0])
            if path.endswith("owner-link"):
                self.send_json(200,{"url":link}) if link else self.send_json(403,{"error":"Accès créateur non configuré sur cet appareil."})
            else:self.send_json(200,{"ok":True,"ownerAvailable":bool(link)})
            return
        if path in {"/api/profile-icon","/api/profile-icon/manifest"}:
            icon_id=parse_qs(request_url.query).get("id",[""])[0]
            icon_file=_SERVER_ROOT/"assets/user/profile-icons"/(icon_id+".png")
            if not re.fullmatch(r"[a-f0-9]{64}",icon_id) or not icon_file.is_file():self.send_json(404,{"error":"Icône introuvable."});return
            if path.endswith("manifest"):
                self.send_json(200,{"id":"/","name":"Astralis","short_name":"Astralis","start_url":"/?profile-icon="+icon_id,"scope":"/","display":"standalone","icons":[{"src":"/api/profile-icon?id="+icon_id,"sizes":"512x512","type":"image/png"}]})
            else:
                data=icon_file.read_bytes();self.send_response(200);self.send_header("Content-Type","image/png");self.send_header("Content-Length",str(len(data)));self.end_headers();self.wfile.write(data)
            return
        if path == "/api/character-sheets/status":
            storage=_character_sheets_storage()
            local_admin=False
            try: local_admin=not HOSTED and ipaddress.ip_address(self.client_address[0]).is_loopback
            except (ValueError,TypeError): pass
            local_admin=local_admin and not _CHARACTER_SHEETS_READ_ONLY
            self.send_character_sheets_json(200,{"ok":True,"readOnly":_CHARACTER_SHEETS_READ_ONLY,"adminConfigured":bool(_CHARACTER_SHEETS_ADMIN_PASSWORD) and not _CHARACTER_SHEETS_READ_ONLY,"authenticated":_character_sheets_is_admin(self),"localAdmin":local_admin,"publishReady":bool(storage["ready"]) and not _CHARACTER_SHEETS_READ_ONLY,"storage":storage["label"],"setupRequired":bool(storage["setupRequired"])})
            return
        if path == "/api/character-sheets/index":
            try:
                rows=_character_sheets_index()
                rows.sort(key=lambda row:int(row.get("updatedAt") or 0),reverse=True)
                self.send_character_sheets_json(200,{"sheets":rows,"updatedAt":int(time.time()*1000)})
            except Exception as exc:
                print("[Astralis] Lecture des fiches indisponible : " + str(exc))
                self.send_character_sheets_json(503,{"error":"Les fiches partagées sont momentanément indisponibles."})
            return
        if path == "/api/character-sheets/item":
            sheet_id=parse_qs(request_url.query).get("id",[""])[0]
            if not re.fullmatch(r"[A-Za-z0-9_-]{8,80}",sheet_id):
                self.send_character_sheets_json(400,{"error":"Identifiant de fiche invalide."}); return
            try:
                sheet=_character_sheets_get(sheet_id)
                if sheet is None: self.send_character_sheets_json(404,{"error":"Fiche introuvable."})
                else: self.send_character_sheets_json(200,{"sheet":sheet})
            except Exception as exc:
                print("[Astralis] Téléchargement de fiche indisponible : " + str(exc))
                self.send_character_sheets_json(503,{"error":"La fiche n’a pas pu être téléchargée."})
            return
        if path == "/api/lab/export-status":
            self.send_json(200,celestia_status()); return
        if path == "/api/lab/data-status":
            self.send_json(200,refresh_lab_data(force=refresh)); return
        if path == "/api/desktop/settings":
            if HOSTED or not ipaddress.ip_address(self.client_address[0]).is_loopback:
                self.send_json(200, {"supported":False,"autoOpenGenshin":False}); return
            self.send_json(200, {**desktop_integration.read_settings(), "supported":os.name == "nt", "installationPath":str(Path(__file__).resolve().parent)}); return
        if path == "/api/update/check":
            try:
                repo = parse_qs(request_url.query).get("repo", [""])[0].strip()
                release = _github_release(repo)
                version_file = Path(__file__).resolve().parent / "VERSION"
                current = version_file.read_text(encoding="utf-8").strip() if version_file.exists() else "0.0.0"
                available = _version_key(release["tag"]) > _version_key(current)
                matching_patch = next((item for item in release.get("patches", []) if item.get("fromVersion") == current), None)
                self.send_json(200, {"ok":True,"current":current,"available":available,"installable":bool(release.get("digest") or release.get("checksumUrl")),"patchAvailable":bool(matching_patch),"release":{k:v for k,v in release.items() if k not in {"url","checksumUrl","digest","patches"}}}); return
            except LookupError as exc: self.send_json(404, {"ok":False,"error":str(exc)})
            except Exception as exc: self.send_json(502, {"ok":False,"error":str(exc) or "GitHub est momentanément inaccessible."})
            return
        if path == "/api/update/status":
            with _UPDATE_LOCK: status = dict(_UPDATE_STATUS)
            saved = saved_update_status()
            if saved.get("updatedAt", 0) > status.get("updatedAt", 0): status = saved
            self.send_json(200, status); return
        if path == "/api/hoyolab/status":
            if HOSTED:
                self.send_json(200, {"connected":False,"uid":"","storage":"Connexion sécurisée disponible uniquement dans l’application locale"}); return
            try:
                auth = _read_hoyolab_secret()
                self.send_json(200, {"connected":bool(auth),"uid":auth.get("uid") if auth else "","storage":"Windows DPAPI · profil utilisateur local"}); return
            except Exception as exc:
                self.send_json(500, {"connected":False,"error":str(exc)}); return
        if path == "/api/hoyolab/resin":
            if HOSTED:
                self.send_json(410, {"error":"La lecture HoYoLAB avec cookies est disponible uniquement dans l’application locale."}); return
            try:
                if refresh:
                    global _HOYOLAB_RESIN_CACHE
                    _HOYOLAB_RESIN_CACHE = None
                self.send_json(200, _fetch_hoyolab_resin())
            except LookupError as exc: self.send_json(401, {"error":str(exc)})
            except Exception as exc: self.send_json(502, {"error":str(exc) or "HoYoLAB est momentanément indisponible."})
            return
        if path == "/api/card-art":
            base = Path(__file__).resolve().parent / "assets"
            def _imgs(folder):
                return sorted(f.name for f in folder.iterdir() if f.is_file() and f.suffix.lower() in {".webp", ".jpg", ".jpeg", ".png", ".avif"}) if folder.is_dir() else []
            fan = _imgs(base / "fanarts")
            try:
                manifest = json.loads((base / "fanarts-manifest.json").read_text(encoding="utf-8"))
                fan_hashes = manifest.get("sha256", {})
            except (OSError, ValueError):
                fan_hashes = {}
            self.send_json(200, {"fan": fan, "fanHashes": fan_hashes, "cards": _imgs(base / "cards"), "path": str(base / "fanarts")}); return
        if path == "/api/fanarts":
            folder = Path(__file__).resolve().parent / "assets" / "fanarts"
            names = sorted(f.name for f in folder.iterdir() if f.is_file() and f.suffix.lower() in {".webp", ".jpg", ".jpeg", ".png", ".avif"}) if folder.is_dir() else []
            self.send_json(200, names); return
        if path == "/health":
            version = _SERVER_VERSION
            instance = _SERVER_INSTANCE
            self.send_json(200, {"ok": True, "message": "Astralis local app active", "version": version, "instance": instance, "pid":os.getpid(), "appWindows":len(_APP_SESSIONS)})
            return
        if path == "/api/gi/aiynao":
            key = "gi/aiynao"
            now = time.time()
            with cache_lock:
                entry = cache.get(key)
                payload = entry[1] if entry and now - entry[0] < 1800 else None
                stale_payload = entry[1] if entry else None
            if payload is None:
                try:
                    videos = []
                    try:
                        feed = ET.fromstring(fetch("https://www.youtube.com/feeds/videos.xml?channel_id=UCBaB1WEGbMC4XmEh_cXxjlA"))
                        atom = "{http://www.w3.org/2005/Atom}"; yt = "{http://www.youtube.com/xml/schemas/2015}"
                        for item in feed.findall(atom + "entry"):
                            video_id=(item.findtext(yt + "videoId") or "").strip(); title=(item.findtext(atom + "title") or "").strip(); published=(item.findtext(atom + "published") or "")[:10]
                            if video_id and title: videos.append({"id":video_id,"title":title,"published":published})
                    except Exception:
                        # YouTube's public RSS can temporarily return errors; the public channel page is a second read-only source.
                        page=fetch("https://www.youtube.com/@Aiynao/videos").decode("utf-8",errors="replace")
                        seen=set()
                        for match in re.finditer(r'"videoRenderer"\s*:\s*\{(.*?)(?=,"trackingParams"|}},"continuationItemRenderer")',page,re.S):
                            block=match.group(1); ident=re.search(r'"videoId"\s*:\s*"([\w-]{11})"',block); title=re.search(r'"title"\s*:\s*\{\s*"runs"\s*:\s*\[\s*\{\s*"text"\s*:\s*"((?:\\.|[^"])*)"',block)
                            if ident and title and ident.group(1) not in seen:
                                seen.add(ident.group(1)); videos.append({"id":ident.group(1),"title":json.loads('"'+title.group(1)+'"'),"published":""})
                    if not videos: raise RuntimeError("Aucune vidéo récente lisible sur les sources publiques.")
                    payload=json.dumps({"videos":videos[:12],"updatedAt":datetime.now(timezone.utc).isoformat(),"source":"Flux public YouTube · Aiynao"},ensure_ascii=False).encode("utf-8")
                    with cache_lock: cache[key]=(now,payload)
                except Exception as exc:
                    if stale_payload:
                        stale=json.loads(stale_payload);stale["stale"]=True;stale["warning"]="Flux YouTube indisponible; affichage de la dernière copie conservée.";payload=json.dumps(stale,ensure_ascii=False).encode("utf-8")
                    else:
                        self.send_json(200,{"videos":[],"updatedAt":"","source":"Aiynao","warning":"Flux public momentanément indisponible.","detail":str(exc)})
                        return
            self.send_bytes(200,payload,"application/json; charset=utf-8")
            return
        if path == "/api/gi/lore-index":
            payload = genshin_lore_index()
            self.send_bytes(200, payload, "application/json; charset=utf-8")
            return
        if path == "/api/gi/lore":
            title = parse_qs(request_url.query).get("title", [""])[0].strip()
            if not title or len(title) > 100 or not re.fullmatch(r"[\wÀ-ÿ’'(),. -]+", title, re.UNICODE):
                self.send_json(400, {"error": "Titre de lore invalide."}); return
            key = "gi/lore/" + title.casefold()
            now = time.time()
            with cache_lock:
                entry = cache.get(key); payload = entry[1] if entry and now-entry[0] < 43200 else None
            if payload is None:
                try:
                    api = "https://genshin-impact.fandom.com/api.php?action=parse&format=json&prop=text&page=" + quote(title)
                    response = json.loads(fetch(api))
                    page = response.get("parse", {})
                    markup = page.get("text", {}).get("*", "")
                    if markup:
                        markup = re.sub(r'<div[^>]+class="[^"]*(?:custom-tabs|mw-references-wrap|toc)[^"]*"[^>]*>.*?</div>', " ", markup, flags=re.I | re.S)
                        markup = re.sub(r"<(aside|table|figure|nav|script|style)\b[^>]*>.*?</\1>", " ", markup, flags=re.I | re.S)
                        markup = re.sub(r'<span class="mw-editsection"[^>]*>.*?</span>', " ", markup, flags=re.I | re.S)
                        markup = re.sub(r"<h([2-6])\b[^>]*>(.*?)</h\1>", lambda m: "\n\n" + "#" * (int(m.group(1))-1) + " " + html_text(m.group(2)) + "\n", markup, flags=re.I | re.S)
                        markup = re.sub(r"</(p|li|blockquote|section|div)>", "\n", markup, flags=re.I)
                        extract = re.sub(r"\n{3,}", "\n\n", unescape(re.sub(r"<[^>]+>", " ", markup))).strip()
                    else:
                        extract = ""
                    if not extract: raise ValueError("Aucun article correspondant dans le wiki.")
                    payload = json.dumps({"title": page.get("title", title), "extract": extract[:180000], "source": "Genshin Impact Wiki · Fandom", "url": "https://genshin-impact.fandom.com/wiki/" + quote(page.get("title", title).replace(" ", "_"))}, ensure_ascii=False).encode("utf-8")
                    with cache_lock: cache[key] = (now, payload)
                except Exception as exc:
                    self.send_json(502, {"error": "La notice communautaire est temporairement indisponible.", "detail": str(exc)}); return
            self.send_bytes(200, payload, "application/json; charset=utf-8"); return
        if path == "/api/gi/build-reverse":
            query = parse_qs(request_url.query)
            name = (query.get("name", [""])[0] or "").strip()
            kind = query.get("kind", ["artifact"])[0]
            if not name or len(name) > 100 or kind not in {"weapon", "artifact"}:
                self.send_json(400, {"error": "Objet de build invalide."}); return
            key = "gi/build-reverse/" + kind + "/" + name.casefold()
            now = time.time()
            with cache_lock:
                entry = cache.get(key); payload = entry[1] if entry and now-entry[0] < 21600 and not refresh else None
            if payload is None:
                try:
                    aliases = {_gi_build_token(value) for value in gi_name_aliases("weapon" if kind == "weapon" else "artifact", name)}
                    rows = gi_build_reverse_index()
                    matches = gi_compatible_build_rows(rows, kind, aliases)
                    used_sources = list(dict.fromkeys(source for row in matches for source in row.get("sources", [])))
                    result = {"item": name, "kind": kind, "source": " · ".join(used_sources) or "Guides communautaires", "sourceUrl": "https://genshin.gg/builds/", "sources": used_sources, "updatedAt": now, "characters": matches, "coverage": "published-recommendations"}
                    payload = json.dumps(result, ensure_ascii=False).encode("utf-8")
                    with cache_lock: cache[key] = (now, payload)
                except Exception as exc:
                    self.send_json(502, {"error": "L’index de recommandations est temporairement indisponible.", "detail": str(exc)}); return
            self.send_bytes(200, payload, "application/json; charset=utf-8"); return
        if path == "/api/gi/team-recommendations":
            name = (parse_qs(request_url.query).get("name", [""])[0] or "").strip()
            if not name or len(name) > 80:
                self.send_json(400, {"error": "Nom de personnage invalide."}); return
            key = "gi/team-recommendations/" + name.casefold()
            now = time.time()
            with cache_lock:
                entry = cache.get(key); payload = entry[1] if entry and now-entry[0] < 21600 and not refresh else None
            if payload is None:
                try:
                    aliases = gi_name_aliases("character", name)
                    teams = []
                    for alias in aliases:
                        teams.extend(gi_team_recommendations(alias))
                    unique = {team.get("name"): team for team in teams if team.get("name")}
                    result = {"character": name, "source": "Genshin.gg · équipes populaires et hors méta", "sourceUrl": "https://genshin.gg/teams/", "updatedAt": now, "teams": list(unique.values())[:8]}
                    payload = json.dumps(result, ensure_ascii=False).encode("utf-8")
                    with cache_lock: cache[key] = (now, payload)
                except Exception as exc:
                    self.send_json(502, {"error": "Les compositions Genshin.gg sont temporairement indisponibles.", "detail": str(exc)}); return
            self.send_bytes(200, payload, "application/json; charset=utf-8"); return
        if path == "/api/gi/build-guide":
            slug = (parse_qs(request_url.query).get("name", [""])[0] or "").strip()
            if not slug or len(slug) > 64 or not re.fullmatch(r"[a-z0-9-]+", slug.casefold()):
                self.send_json(400, {"error": "Nom de personnage invalide."}); return
            key = "gi/build-guide/" + slug.casefold()
            now = time.time()
            with cache_lock:
                entry = cache.get(key); payload = entry[1] if entry and now-entry[0] < 86400 and not refresh else None
            if payload is None:
                try:
                    try:
                        guide = gi_build_guide(slug)
                    except LookupError:
                        guide = {"character": slug, "source": "Genshin.gg · GenshinFlex", "sourceUrl": "https://genshin.gg/builds/", "version": "", "roles": [], "talents": [], "builds": []}
                    aliases = gi_name_aliases("character", slug)
                    alias_tokens = {re.sub(r"[^a-z0-9]+", "", value.casefold()) for value in aliases}
                    slug_token = re.sub(r"[^a-z0-9]+", "", slug.casefold())
                    try:
                        rows = gi_build_reverse_index()
                    except Exception:
                        rows = []
                    matched = [row for row in rows if re.sub(r"[^a-z0-9]+", "", str(row.get("name", "")).casefold()) in (alias_tokens | {slug_token})]
                    if matched:
                        all_weapons = list(dict.fromkeys(value for row in matched for value in row.get("weapons", []) if value))
                        all_sets = list(dict.fromkeys(value for row in matched for value in row.get("sets", []) if value))
                        sources = list(dict.fromkeys(value for row in matched for value in row.get("sources", []) if value))
                        supplemental = {"role": "Recommandations · " + " + ".join(sources), "best": False, "weapons": all_weapons, "artifacts": all_sets, "mainStats": {}, "substats": [], "notes": [], "lastUpdated": "", "sources": sources, "sourceUrl": "https://genshin.gg/builds/"}
                        builds = guide.setdefault("builds", [])
                        signature = ({*map(str.casefold, all_weapons)}, {*map(str.casefold, all_sets)})
                        if not any(({str(x).casefold() for x in b.get("weapons", []) if isinstance(x, str)}, {str(x).casefold() for x in b.get("artifacts", []) if isinstance(x, str)}) == signature for b in builds):
                            builds.append(supplemental)
                        guide["sources"] = list(dict.fromkeys([guide.get("source", ""), *sources]))
                        guide["source"] = " · ".join(value for value in guide["sources"] if value)
                        guide["sourceUrl"] = "https://genshin.gg/builds/"
                    if not guide.get("builds"):
                        raise LookupError("Aucune recommandation publiée pour ce personnage.")
                    payload = json.dumps(guide, ensure_ascii=False).encode("utf-8")
                    with cache_lock: cache[key] = (now, payload)
                except LookupError as exc:
                    self.send_json(404, {"error": str(exc)}); return
                except Exception as exc:
                    self.send_json(502, {"error": "Les recommandations GIHT sont temporairement indisponibles.", "detail": str(exc)}); return
            self.send_bytes(200, payload, "application/json; charset=utf-8"); return
        if path == "/api/gi/character-media":
            name = (parse_qs(request_url.query).get("name", [""])[0] or "").strip()
            if not name or len(name) > 64 or not re.fullmatch(r"[\w .’'()-]+", name, flags=re.UNICODE):
                self.send_json(400, {"error": "Nom de personnage invalide."}); return
            key = "gi/character-media/" + name.casefold()
            now = time.time()
            with cache_lock:
                entry = cache.get(key); payload = entry[1] if entry and now-entry[0] < 86400 else None
            if payload is None:
                try:
                    query = quote(f'"Paimon\'s Paintings" {name}')
                    endpoint = f"https://genshin-impact.fandom.com/api.php?action=query&list=search&srsearch={query}&srnamespace=6&srlimit=12&format=json"
                    results = json.loads(fetch(endpoint)).get("query", {}).get("search", [])
                    pages = [row for row in results if re.search(r"Icon Emoji Paimon.*Paintings", row.get("title", ""), re.I) and name.casefold() in row.get("title", "").casefold()]
                    if pages:
                        titles = "|".join(row["title"] for row in pages[:8])
                        info_url = "https://genshin-impact.fandom.com/api.php?" + urlencode({"action":"query","titles":titles,"prop":"imageinfo","iiprop":"url","iiurlwidth":"220","format":"json"})
                        info = json.loads(fetch(info_url)).get("query", {}).get("pages", {}).values()
                        stickers = [{"title": page.get("title", "").replace("File:", ""), "url": page.get("imageinfo", [{}])[0].get("thumburl") or page.get("imageinfo", [{}])[0].get("url", "")} for page in info if page.get("imageinfo") and (page.get("imageinfo", [{}])[0].get("thumburl") or page.get("imageinfo", [{}])[0].get("url"))]
                    else: stickers = []
                    # Keep a small, optimized-by-source local sticker pack so every page
                    # can reuse the same handful of PNGs without repeatedly contacting the wiki.
                    sticker_dir = Path(__file__).resolve().parent / "assets" / "cache" / "character-emojis"
                    sticker_dir.mkdir(parents=True, exist_ok=True)
                    slug = re.sub(r"[^a-z0-9-]+", "-", name.casefold()).strip("-")[:48] or "character"
                    for index, sticker in enumerate(stickers[:8]):
                        if not sticker.get("url"): continue
                        try:
                            req = Request(sticker["url"], headers={
                                "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36",
                                "Referer":"https://genshin-impact.fandom.com/",
                                "Accept":"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                            })
                            with urlopen(req, timeout=8) as response:
                                mime = response.headers.get_content_type(); image_bytes = response.read(512 * 1024 + 1)
                            if len(image_bytes) > 512 * 1024: continue
                            if image_bytes.startswith(b"\x89PNG\r\n\x1a\n"): ext="png"
                            elif image_bytes.startswith(b"RIFF") and image_bytes[8:12] == b"WEBP": ext="webp"
                            elif image_bytes.startswith(b"\xff\xd8\xff"): ext="jpg"
                            else: continue
                            target = sticker_dir / f"{slug}-{index + 1}.{ext}"
                            if not target.exists(): target.write_bytes(image_bytes)
                            sticker["url"] = f"/assets/cache/character-emojis/{target.name}"
                        except Exception: pass
                    payload = json.dumps({"character":name,"stickers":stickers,"source":"Genshin Impact Wiki · Emojis Paimon's Paintings","sourceUrl":"https://genshin-impact.fandom.com/wiki/Category:Paimon%27s_Paintings"}, ensure_ascii=False).encode("utf-8")
                    with cache_lock: cache[key] = (now, payload)
                except Exception as exc:
                    self.send_json(502, {"error":"Les stickers communautaires ne sont pas disponibles pour le moment.","detail":str(exc)}); return
            self.send_bytes(200, payload, "application/json; charset=utf-8"); return
        if path == "/api/gi/lore-image":
            title = (parse_qs(request_url.query).get("title", [""])[0] or "").strip()
            if not title or len(title) > 80 or not re.fullmatch(r"[\w À-ÿ’'()-]+", title, flags=re.UNICODE):
                self.send_json(400, {"error":"Titre d’image invalide."}); return
            key = "gi/lore-image/" + title.casefold(); now = time.time()
            with cache_lock:
                entry = cache.get(key); payload = entry[1] if entry and now-entry[0] < 86400 else None
            mime = "image/jpeg"
            if payload is None:
                try:
                    endpoint = "https://genshin-impact.fandom.com/api.php?" + urlencode({"action":"query","titles":title,"prop":"pageimages","piprop":"thumbnail","pithumbsize":"960","format":"json"})
                    pages = json.loads(fetch(endpoint)).get("query",{}).get("pages",{}).values()
                    image_url = next((p.get("thumbnail",{}).get("source") for p in pages if p.get("thumbnail",{}).get("source")), "")
                    if not image_url: raise ValueError("Aucune illustration de personnage référencée par la source.")
                    req = Request(image_url, headers={"User-Agent":"Mozilla/5.0 (compatible; Astralis/1.0)"})
                    with urlopen(req, timeout=12) as response:
                        mime = response.headers.get_content_type(); payload = response.read(5 * 1024 * 1024 + 1)
                    if not mime.startswith("image/") or len(payload) > 5 * 1024 * 1024: raise ValueError("Illustration trop volumineuse ou format invalide.")
                    with cache_lock: cache[key] = (now, payload)
                except Exception as exc:
                    self.send_json(502,{"error":"Illustration Lore momentanément indisponible.","detail":str(exc)}); return
            self.send_bytes(200,payload,mime); return
        if path == "/api/image":
            raw = parse_qs(request_url.query).get("url", [""])[0]
            try:
                target = urlparse(raw)
                allowed = {"enka.network", "gi.yatta.moe", "genshin.jmp.blue", "api.ambr.top", "vizualabstract.github.io", "raw.githubusercontent.com", "upload-os-bbs.hoyolab.com", "act-webstatic.hoyoverse.com", "genshin.hoyoverse.com"}
                if target.scheme != "https" or not any(target.hostname == host or (target.hostname or "").endswith("." + host) for host in allowed):
                    self.send_json(400, {"error": "Source d’image non autorisée."}); return
                key = "image/" + raw
                now = time.time()
                with cache_lock:
                    entry = cache.get(key); payload = entry[1] if entry and now-entry[0] < 86400 else None
                mime = "image/png"
                if payload is None:
                    request = Request(raw, headers={"User-Agent": "Mozilla/5.0 (compatible; Astralis/1.0)"})
                    with urlopen(request, timeout=15) as response:
                        mime = response.headers.get_content_type()
                        if not mime.startswith("image/"): raise ValueError("La ressource n’est pas une image.")
                        payload = response.read(8 * 1024 * 1024 + 1)
                    if len(payload) > 8 * 1024 * 1024: raise ValueError("Image trop volumineuse.")
                    with cache_lock: cache[key] = (now, payload)
                self.send_bytes(200, payload, mime); return
            except Exception as exc:
                self.send_json(502, {"error": "Image distante indisponible.", "detail": str(exc)}); return
        if path == "/api/gi/events":
            key = "gi/events"; now = time.time()
            with cache_lock:
                entry = cache.get(key); payload = entry[1] if entry and now-entry[0] < 900 and not refresh else None
            if payload is None:
                try:
                    payload = genshin_events()
                    with cache_lock: cache[key] = (now, payload)
                except Exception as exc:
                    self.send_json(502, {"error": "Le calendrier GenshinFlex est indisponible.", "detail": str(exc)}); return
            self.send_bytes(200, payload, "application/json; charset=utf-8"); return
        if path == "/api/game-codes":
            key = "game-codes"; now = time.time()
            with cache_lock:
                entry = cache.get(key); stale_payload = entry[1] if entry else None
                payload = entry[1] if entry and now-entry[0] < 900 and not refresh else None
            if payload is None:
                try:
                    payload = hoyoverse_codes()
                    with cache_lock: cache[key] = (now, payload)
                except Exception as exc:
                    if stale_payload:
                        payload = stale_payload
                    else:
                        self.send_json(502, {"error": "Les codes publics sont momentanément indisponibles.", "detail": str(exc)}); return
            self.send_bytes(200, payload, "application/json; charset=utf-8"); return
        if path in {"/api/gi/news", "/api/gi/tierlist"}:
            key = path.removeprefix("/api/")
            now = time.time()
            ttl = 1800 if path.endswith("/news") else 3600
            with cache_lock:
                entry = cache.get(key); payload = entry[1] if entry and now-entry[0] < ttl and not refresh else None
            if payload is None:
                try:
                    payload = genshin_news() if path.endswith("/news") else genshin_tierlist_status()
                    with cache_lock: cache[key] = (now, payload)
                except Exception as exc:
                    self.send_json(502, {"error": "La source est momentanément indisponible.", "detail": str(exc)}); return
            self.send_bytes(200, payload, "application/json; charset=utf-8"); return
        if path == "/api/gi/endgame":
            key = "gi/endgame"
            now = time.time()
            with cache_lock:
                entry = cache.get(key)
                stale_payload = entry[1] if entry else None
                payload = entry[1] if entry and now - entry[0] < TTL and not refresh else None
            if payload is None:
                try:
                    payload = genshin_endgame()
                    with cache_lock:
                        cache[key] = (now, payload)
                except Exception as exc:
                    if stale_payload:
                        payload = stale_payload
                    else:
                        self.send_json(502, {"error": "La source Endgame est indisponible.", "detail": str(exc)})
                        return
            current=json.loads(payload);current["archive"]=endgame_archive(fetch,current)
            self.send_json(200,current)
            return
        public_profile = re.fullmatch(r"/api/gi/profile/(\d{8,10})", path)
        if public_profile:
            uid = public_profile.group(1)
            key = f"gi/profile/{uid}"
            now = time.time()
            with cache_lock:
                entry = cache.get(key)
                payload = entry[1] if entry and now - entry[0] < TTL and not refresh else None
            if payload is None:
                try:
                    payload = fetch(f"https://enka.network/api/uid/{uid}/")
                    if len(payload) > 2 * 1024 * 1024:
                        raise ValueError("La réponse du profil dépasse la limite de 2 Mo.")
                    json.loads(payload)
                    with cache_lock:
                        cache[key] = (now, payload)
                except Exception as exc:
                    self.send_json(502, {"error": "Profil public Enka indisponible ou non public.", "detail": str(exc)})
                    return
            self.send_bytes(200, payload, "application/json; charset=utf-8")
            return
        detail = re.fullmatch(r"/detail/gi/character/([a-z0-9-]+)", path)
        if detail:
            slug = detail.group(1)
            key = f"gi/detail/{slug}"
            now = time.time()
            with cache_lock:
                entry = cache.get(key)
                payload = entry[1] if entry and now - entry[0] < TTL else None
            if payload is None:
                try:
                    payload = fetch(f"https://genshin.jmp.blue/characters/{slug}?lang=fr")
                    json.loads(payload)
                    with cache_lock:
                        cache[key] = (now, payload)
                except Exception as exc:
                    self.send_json(502, {"error": "La fiche détaillée ne répond pas.", "detail": str(exc)})
                    return
            self.send_bytes(200, payload, "application/json; charset=utf-8")
            return
        talent_detail = re.fullmatch(r"/detail/gi/talents/([a-z0-9-]+)", path)
        if talent_detail:
            slug = talent_detail.group(1)
            key = f"gi/talents/{slug}"
            now = time.time()
            with cache_lock:
                entry = cache.get(key)
                payload = entry[1] if entry and now - entry[0] < TTL else None
            if payload is None:
                try:
                    query = "Traveler" if slug.startswith("traveler") else slug
                    url = f"https://genshin-db-api.vercel.app/api/v5/talents?query={query}&matchCategories=true&dumpResult=true&queryLanguages=french&resultLanguage=French"
                    response = json.loads(fetch(url))
                    result = response.get("result") or {}
                    if not result.get("combat1"):
                        raise ValueError("Aucune table de talents trouvée pour ce personnage.")
                    payload = json.dumps(result, ensure_ascii=False).encode("utf-8")
                    with cache_lock:
                        cache[key] = (now, payload)
                except Exception as exc:
                    self.send_json(502, {"error": "La table des talents ne répond pas.", "detail": str(exc)})
                    return
            self.send_bytes(200, payload, "application/json; charset=utf-8")
            return
        detail = re.fullmatch(r"/detail/ww/character/([a-z0-9-]+)", path)
        if detail:
            slug = detail.group(1)
            key = f"ww/detail/{slug}"
            now = time.time()
            with cache_lock:
                entry = cache.get(key)
                payload = entry[1] if entry and now - entry[0] < TTL else None
            if payload is None:
                try:
                    if slug.isdigit():
                        source = json.loads(fetch(f"https://api-v2.encore.moe/api/en/character/{slug}?v=Beta"))
                        skills = []
                        for skill in source.get("Skills", []):
                            name = skill.get("SkillName") or skill.get("SkillType") or "Compétence"
                            values = []
                            for attribute in skill.get("SkillAttributes", []):
                                levels = attribute.get("values") or []
                                if levels:
                                    values.append(f"{attribute.get('attributeName', 'Valeur')} : {levels[min(9, len(levels)-1)]}")
                            skills.append({
                                "id": str(skill.get("SkillId", name)), "name": name,
                                "label": skill.get("SkillType") or "Compétence",
                                "description": html_text(skill.get("SkillDescribe", "")),
                                "icon": skill.get("Icon", ""), "values": values,
                            })
                        chains = [{
                            "name": f"C{int(row.get('GroupIndex') or i + 1)} · {row.get('NodeName') or 'Résonance'}",
                            "description": html_text(row.get("AttributesDescription", "")),
                            "icon": row.get("NodeIcon", ""),
                        } for i, row in enumerate(source.get("ResonantChain", []))]
                        artworks = list(dict.fromkeys(value for value in (
                            source.get("Card"), source.get("FormationRoleCard"), source.get("RolePortrait"),
                            source.get("RoleStand"), source.get("RoleHeadIconLarge"),
                        ) if value))
                        portrait = source.get("RolePortrait") or source.get("RoleHeadIconLarge") or source.get("Card") or ""
                        payload = json.dumps({
                            "portraitUrl": portrait, "artworks": artworks, "skills": skills, "constellations": chains,
                            "baseStats": [{"name": row.get("Name", ""), "value": row.get("BaseValue", ""), "icon": row.get("Icon", "")} for row in source.get("Properties", [])],
                            "source": "Encore API · données Beta",
                        }, ensure_ascii=False).encode("utf-8")
                    else:
                        markup = fetch(f"{BASE}/en/characters/{slug}").decode("utf-8", errors="replace")
                        portrait_match = re.search(r'<img\b[^>]*alt="[^"]+ portrait"[^>]*src="([^"]+)"', markup, flags=re.I)
                        portrait = unescape(portrait_match.group(1)).replace("/_ipx/q_70&s_180x180/", "/") if portrait_match else ""
                        skills = []
                        cards = re.findall(r'<div class="rounded-md border border-border/50 p-4">(.*?)</div>', markup, flags=re.I | re.S)
                        for index, card in enumerate(cards[:8]):
                            heading = re.search(r"<h3\b[^>]*>(.*?)</h3>", card, flags=re.I | re.S)
                            paragraph = re.search(r"<p\b[^>]*>(.*?)</p>", card, flags=re.I | re.S)
                            badge = re.search(r'<span\b[^>]*data-slot="badge"[^>]*>(.*?)</span>', card, flags=re.I | re.S)
                            if heading:
                                skills.append({
                                    "id": f"ww-{index}", "name": html_text(heading.group(1)),
                                    "label": html_text(badge.group(1)) if badge else "Compétence",
                                    "description": html_text(paragraph.group(1)) if paragraph else "",
                                    "glyph": ["⚔", "◈", "✦", "◎", "↗", "◇"][index % 6],
                                })
                        payload = json.dumps({"portraitUrl": portrait, "skills": skills}, ensure_ascii=False).encode("utf-8")
                    with cache_lock:
                        cache[key] = (now, payload)
                except Exception as exc:
                    self.send_json(502, {"error": "La fiche WutheringDB ne répond pas.", "detail": str(exc)})
                    return
            self.send_bytes(200, payload, "application/json; charset=utf-8")
            return
        match = re.fullmatch(r"/data/(hsr|gi|ww)/(character|weapon|artifact|skills)", path)
        if match:
            game, category = match.groups()
            key = f"{game}/{category}"
            now = time.time()
            with cache_lock:
                entry = cache.get(key)
                if not refresh and entry and now - entry[0] < TTL:
                    payload = entry[1]
                else:
                    payload = None
            if payload is None:
                try:
                    if game == "ww":
                        payload = wuthering_cards(category)
                    else:
                        url = SOURCES[(game, category)]
                        if game == "gi":
                            url += "?lang=fr"
                        payload = fetch(url)
                    json.loads(payload)
                    with cache_lock:
                        cache[key] = (now, payload)
                except Exception as exc:
                    self.send_json(502, {"error": "La source distante ne répond pas.", "detail": str(exc)})
                    return
            self.send_bytes(200, payload, "application/json; charset=utf-8")
            return
        super().do_GET()

    def send_json(self, status: int, data: object) -> None:
        self.send_bytes(status, json.dumps(data, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")

    def send_bytes(self, status: int, payload: bytes, mime: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store" if urlsplit(self.path).path.startswith(("/api/update/", "/api/desktop/", "/health")) else f"public, max-age={TTL}" if mime.startswith("application/json") else "no-cache, must-revalidate")
        self.end_headers()
        self.wfile.write(payload)


class AstralisHTTPServer(ThreadingHTTPServer):
    # The app imports a large module graph at startup. Keep a larger accept
    # backlog so short bursts of local asset requests do not get refused.
    request_queue_size = 128


if __name__ == "__main__":
    if os.name == "nt":
        AstralisHTTPServer.allow_reuse_address = False
    server = AstralisHTTPServer((HOST, PORT), Handler)
    _APP_HTTP_SERVER = server
    print(f"Astralis lancé sur http://{HOST}:{PORT}")
    if not HOSTED:
        start_maintenance()
        threading.Thread(target=_watch_app_sessions, daemon=True).start()
    try:
        server.serve_forever()
    finally:
        server.server_close()


