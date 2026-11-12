"""Collect character illustrations directly from the official HoYoLAB feeds.

Only HoYoverse account attachments are downloaded. A post is considered art only
when its official subject identifies a catalog character and an art/birthday/
anniversary publication; unrelated news, screenshots and video thumbnails are skipped.
"""
from __future__ import annotations

import hashlib
import io
import json
import re
import time
import urllib.parse
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ACCOUNTS = {"gi": ("1015537", 2), "hsr": ("172534910", 6)}
API = "https://bbs-api-os.hoyolab.com/community/post/wapi/userPost"
PAGE = "https://www.hoyolab.com/article/{}"
MIN_TIME = int(datetime(2020, 1, 1, tzinfo=timezone.utc).timestamp())
HEADERS = {"User-Agent": "Mozilla/5.0", "Referer": "https://www.hoyolab.com/", "Accept": "application/json,image/*"}
ART_TERMS = re.compile(r"birthday|anniversary|illustration|artwork|commemorat|ost|original soundtrack|album|character art|character trailer|character demo|character preview|profile reveal|single.panel", re.I)
REJECT_TERMS = re.compile(r"fan.?art|contest|screenshot|cutscene|chibi|sticker|wallpaper|web.?event|livestream|special program|version preview", re.I)


def get_bytes(url: str, limit: int = 24 * 1024 * 1024) -> bytes:
    if not url.startswith("https://upload-os-bbs.hoyolab.com/"):
        raise ValueError("Pièce jointe hors domaine officiel HoYoLAB")
    with urlopen(Request(url, headers=HEADERS), timeout=25) as response:
        data = response.read(limit + 1)
    if len(data) > limit:
        raise ValueError("Pièce jointe trop volumineuse")
    return data


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def dhash(data: bytes) -> str:
    from io import BytesIO
    with Image.open(BytesIO(data)) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
        image.thumbnail((1600, 2400), Image.Resampling.LANCZOS)
        image = image.convert("L").resize((9, 8), Image.Resampling.LANCZOS)
        values = list(image.get_flattened_data())
    value = sum((values[y * 9 + x] > values[y * 9 + x + 1]) << (y * 8 + x)
                for y in range(8) for x in range(8))
    return f"{value:016x}"


def prepare_image(data: bytes) -> tuple[bytes, str] | None:
    with Image.open(io.BytesIO(data)) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
        if min(image.size) < 500:
            return None
        image.thumbnail((1600, 2400), Image.Resampling.LANCZOS)
        saturation = list(image.convert("HSV").getchannel("S").resize((80, 80)).get_flattened_data())
        if saturation and sum(value <= 18 for value in saturation) / len(saturation) >= .94 and sum(saturation) / len(saturation) <= 12:
            return None
        pixel_hash = sha(f"{image.width}x{image.height}".encode() + image.tobytes())
        output = io.BytesIO()
        image.save(output, "WEBP", quality=88, method=6)
    return output.getvalue(), pixel_hash


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def matches_character(subject: str, key: str, name: str) -> bool:
    text = re.sub(r"[^a-z0-9]", "", subject.lower())
    full = {re.sub(r"[^a-z0-9]", "", value.lower()) for value in (key, name)}
    aliases = {tokens[-1] for value in (key, name) if (tokens := [token for token in re.split(r"[-\s]+", value.lower()) if len(token) >= 4])}
    return any(term and term in text for term in full | aliases)


def cache_posts(game: str, uid: str, gid: int, refresh: bool) -> list[dict]:
    cache = ROOT / f"assets/card-art/downloads/hoyolab-official-{game}-art-posts.json"
    if cache.is_file() and not refresh:
        cached = json.loads(cache.read_text(encoding="utf-8"))
        if cached:
            return cached
    posts, offset, seen = [], 0, set()
    while True:
        query = urllib.parse.urlencode({"uid": uid, "gids": gid, "offset": offset, "size": 20})
        with urlopen(Request(f"{API}?{query}", headers=HEADERS), timeout=25) as response:
            payload = json.loads(response.read().decode("utf-8"))
        data = payload.get("data", {})
        page = [row["post"] for row in data.get("list", []) if row.get("post")]
        if not page:
            break
        for post in page:
            subject = post.get("subject", "")
            if ART_TERMS.search(subject) and not REJECT_TERMS.search(subject):
                posts.append({"post_id": post.get("post_id"), "subject": subject,
                              "created_at": post.get("created_at"), "images": post.get("images", [])})
        oldest = min(int(post.get("created_at", 0)) for post in page)
        next_offset = str(data.get("next_offset") or "")
        if data.get("is_last") or oldest < MIN_TIME or not next_offset or next_offset in seen:
            break
        seen.add(next_offset)
        offset = max(0, int(next_offset) - 1)
        time.sleep(0.12)
    cache.parent.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(posts, ensure_ascii=False, indent=2), encoding="utf-8")
    return posts


def post_images(post: dict, gid: int) -> list[str]:
    raw = post.get("images", [])
    urls = [item if isinstance(item, str) else item.get("url", "") for item in raw]
    query = urllib.parse.urlencode({"gids": gid, "post_id": post.get("post_id")})
    with urlopen(Request(f"{API}/getPostFull?{query}", headers=HEADERS), timeout=25) as response:
        payload = json.loads(response.read().decode("utf-8"))
    full = payload.get("data", {}).get("post", {})
    urls = [item.get("url", "") for item in (full.get("image_list") or full.get("cover_list") or []) if isinstance(item, dict)]
    detail_post = full.get("post", {})
    try:
        blocks = json.loads(detail_post.get("structured_content", "[]"))
        for block in blocks:
            image = block.get("insert", {}).get("image") if isinstance(block, dict) and isinstance(block.get("insert"), dict) else ""
            if image:
                urls.append(image)
    except (TypeError, json.JSONDecodeError):
        pass
    return list(dict.fromkeys(url for url in urls if url.startswith("https://upload-os-bbs.hoyolab.com/")))


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--games", nargs="+", choices=sorted(ACCOUNTS), default=sorted(ACCOUNTS))
    parser.add_argument("--refresh", action="store_true", help="Récupérer à nouveau les publications officielles")
    args = parser.parse_args()
    catalog = json.loads((ROOT / "public/card-catalog.json").read_text(encoding="utf-8"))["cards"]
    manifest_path = ROOT / "public/card-artworks.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    artworks = manifest.get("artworks", {})
    existing_hashes = {row.get("sourcePixelSha256") for row in artworks.values()}
    existing_urls = {row.get("officialAssetUrl") for row in artworks.values() if row.get("officialAssetUrl")}
    sources_path = ROOT / "assets/card-art/downloads/sources.json"
    sources = json.loads(sources_path.read_text(encoding="utf-8")) if sources_path.is_file() else []
    existing_urls.update(row.get("officialAssetUrl") for row in sources if row.get("officialAssetUrl"))
    known = {(row.get("game"), row.get("slug"), row.get("source")) for row in sources}
    report = {}
    migrated = []
    for game in args.games:
        uid, gid = ACCOUNTS[game]
        posts = cache_posts(game, uid, gid, args.refresh)
        characters = {row["artSlug"]: row["name"] for row in catalog
                      if row.get("game") == game and row.get("kind") == "character"}
        matched_posts = []
        for post in posts:
            subject = post.get("subject", "")
            matched = [(key, name) for key, name in characters.items()
                       if matches_character(subject, key, name)]
            if len(matched) == 1:
                matched_posts.append((post, matched[0]))

        local_write_lock = threading.Lock()
        def collect_post(item: tuple[dict, tuple[str, str]]) -> list[dict]:
            post, (char_slug, char_name) = item
            subject = post.get("subject", "")
            source = PAGE.format(post["post_id"])
            try:
                image_urls = post_images(post, gid)
            except Exception:
                return []
            result = []
            for index, image_url in enumerate(image_urls, 1):
                try:
                    if image_url in existing_urls:
                        continue
                    data = get_bytes(image_url)
                    prepared = prepare_image(data)
                    if not prepared:
                        continue
                    compressed, pixel_hash = prepared
                    local = ROOT / "assets/card-art/downloads" / f"{sha(data)}.image"
                    with local_write_lock:
                        if not local.is_file():
                            local.write_bytes(compressed)
                    image_hash = dhash(data)
                    row = {"game": game, "slug": char_slug, "local": local.relative_to(ROOT).as_posix(),
                           "source": source, "officialAssetUrl": image_url, "title": subject,
                           "provenance": "official-hoyoverse", "sourceVerifiedBy": "Publication du compte officiel HoYoverse sur HoYoLAB; nom du personnage dans le titre",
                           "sourcePixelSha256": pixel_hash, "dhash": image_hash}
                    if re.search(r"character trailer|character demo|character preview|trailer|demo", subject, re.I):
                        row["artType"] = "official-character-promo"
                    result.append(row)
                except Exception:
                    continue
            return result

        added = 0
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = {executor.submit(collect_post, item): item for item in matched_posts}
            for index, future in enumerate(as_completed(futures), 1):
                try:
                    candidates = future.result()
                except Exception:
                    candidates = []
                for row in candidates:
                    identity = (row["game"], row["slug"], row["officialAssetUrl"])
                    if identity in known or row["sourcePixelSha256"] in existing_hashes:
                        continue
                    known.add(identity)
                    existing_urls.add(row["officialAssetUrl"])
                    existing_hashes.add(row["sourcePixelSha256"])
                    for record in artworks.values():
                        if (record.get("game") == game and record.get("slug") == row["slug"]
                                and record.get("dhash") == row["dhash"]
                                and record.get("provenance") != "official-hoyoverse"):
                            record.update({key: row[key] for key in ("source", "officialAssetUrl", "provenance", "sourceVerifiedBy")})
                            migrated.append(record.get("local"))
                    row.pop("sourcePixelSha256", None)
                    row.pop("dhash", None)
                    sources.append(row)
                    added += 1
                if index % 50 == 0 or index == len(futures):
                    sources_path.parent.mkdir(parents=True, exist_ok=True)
                    sources_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
                    print(f"{game}: {index}/{len(futures)} publications traitées; {added} nouvelles images", flush=True)
        report[game] = {"officialPosts": len(posts), "characterPosts": len(matched_posts), "newCharacterArtworks": added}
    sources_path.parent.mkdir(parents=True, exist_ok=True)
    sources_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    by_local = {row.get("local"): row for row in artworks.values() if row.get("provenance") == "official-hoyoverse"}
    changed = False
    for source_row in sources:
        source_record = by_local.get(source_row.get("local"))
        if source_record:
            source_row.update({key: source_record[key] for key in ("source", "officialAssetUrl", "provenance", "sourceVerifiedBy") if key in source_record})
            changed = True
    if changed:
        sources_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"games": report, "archivedArtMatchedToOfficialPost": len(set(migrated))}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
