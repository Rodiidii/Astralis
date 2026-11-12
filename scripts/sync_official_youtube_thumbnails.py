"""Collect character promotional stills from verified official publisher channels.

Only thumbnails are downloaded; videos are never fetched. These promo stills are tagged
separately so the card auditor can keep them out of splash-art-restricted rarities.
Requires yt-dlp and Pillow.
"""
from __future__ import annotations

import hashlib
import io
import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
CHANNELS = {
    "gi": ("UCiS882YPwZt1NfaM0gR0D9Q", "https://www.youtube.com/channel/UCiS882YPwZt1NfaM0gR0D9Q/videos", "official-hoyoverse", "Genshin Impact"),
    "hsr": ("UC2PeMPA8PAOp-bynLoCeMLA", "https://www.youtube.com/channel/UC2PeMPA8PAOp-bynLoCeMLA/videos", "official-hoyoverse", "Honkai: Star Rail"),
    "ww": ("UCGc93NguHRwzv1Rw9MyIcxQ", "https://www.youtube.com/@wutheringwaves3352/videos", "official-kuro", "Wuthering Waves"),
}
PROMO = re.compile(r"character\s+(demo|trailer|teaser|showcase|pv)|resonator\s+(trailer|showcase|teaser|gameplay|combat)", re.I)
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; AstralisArtworkCollector/1.0)"}


def normalized(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.casefold())


def match_character(title: str, chars: list[dict]) -> dict | None:
    haystack = normalized(title)
    hits = []
    for row in chars:
        name = row["name"]
        slug = row["artSlug"]
        candidates = {normalized(name), normalized(slug)}
        candidates.update(normalized(alias) for alias in row.get("aliases", []) if alias)
        candidates = {item for item in candidates if len(item) >= 5 and item not in {"traveler", "trailblazer"}}
        if any(candidate in haystack for candidate in candidates):
            hits.append(row)
    # More than one character name in a title means the art cannot safely be assigned.
    unique = {row["artSlug"]: row for row in hits}
    return next(iter(unique.values())) if len(unique) == 1 else None


def get_bytes(url: str) -> bytes:
    if not url.startswith("https://i.ytimg.com/vi/"):
        raise ValueError("Thumbnail hors domaine YouTube officiel")
    with urlopen(Request(url, headers=HEADERS), timeout=25) as response:
        data = response.read(12 * 1024 * 1024 + 1)
    if len(data) > 12 * 1024 * 1024:
        raise ValueError("Thumbnail trop volumineuse")
    return data


def candidate_thumbnail(entry: dict) -> str | None:
    options = sorted(entry.get("thumbnails") or [], key=lambda item: item.get("width", 0) * item.get("height", 0), reverse=True)
    for item in options:
        url = item.get("url", "")
        if url.startswith("https://i.ytimg.com/vi/") and item.get("width", 0) >= 500 and item.get("height", 0) >= 500:
            return url
    video_id = entry.get("id", "")
    # The playlist's hq720 entry is only 720x404 and too small for a card. Ask for
    # YouTube's official max-resolution still; decode_thumbnail rejects placeholders.
    return f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg" if video_id else None


def decode_thumbnail(url: str) -> tuple[bytes, tuple[int, int]]:
    data = get_bytes(url)
    with Image.open(io.BytesIO(data)) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
        if min(image.size) < 280 or image.width < 500:
            raise ValueError(f"Résolution insuffisante: {image.width}x{image.height}")
        image.thumbnail((1600, 1200), Image.Resampling.LANCZOS)
        saturation = list(image.convert("HSV").getchannel("S").resize((80, 80)).get_flattened_data())
        if saturation and sum(value <= 18 for value in saturation) / len(saturation) >= .94 and sum(saturation) / len(saturation) <= 12:
            raise ValueError("Image en noir et blanc")
        out = io.BytesIO()
        image.save(out, "WEBP", quality=88, method=6)
        return out.getvalue(), source.size


def main() -> int:
    target = os.environ.get("TEMP", "")
    vendor = Path(target) / "astralis_yt_dlp"
    if vendor.exists():
        sys.path.insert(0, str(vendor))
    try:
        import yt_dlp
    except ImportError:
        print("yt-dlp est requis (installé temporairement hors du projet).", file=sys.stderr)
        return 2

    catalog = json.loads((ROOT / "public/card-catalog.json").read_text(encoding="utf-8"))["cards"]
    sources_path = ROOT / "assets/card-art/downloads/sources.json"
    sources = json.loads(sources_path.read_text(encoding="utf-8")) if sources_path.exists() else []
    known = {(row.get("game"), row.get("slug"), row.get("officialAssetUrl")) for row in sources}
    known_urls = {row.get("officialAssetUrl") for row in sources}
    known_urls.update(row.get("officialAssetUrl") for row in json.loads((ROOT / "public/card-artworks.json").read_text(encoding="utf-8")).get("artworks", {}).values())
    report = {}
    for game, (expected_channel, playlist_url, provenance, channel_label) in CHANNELS.items():
        with yt_dlp.YoutubeDL({"quiet": True, "extract_flat": True, "ignoreerrors": True, "skip_download": True, "playlistend": 2500, "socket_timeout": 25}) as ydl:
            playlist = ydl.extract_info(playlist_url, download=False)
        actual_channel = (playlist or {}).get("channel_id") or (playlist or {}).get("id")
        if actual_channel != expected_channel:
            raise RuntimeError(f"Chaîne non vérifiée pour {game}: {actual_channel!r} != {expected_channel!r}")
        chars = [row for row in catalog if row.get("game") == game and row.get("kind") == "character"]
        entries = (playlist or {}).get("entries") or []
        candidates = []
        for entry in entries:
            title = entry.get("title", "")
            if not PROMO.search(title):
                continue
            character = match_character(title, chars)
            if not character:
                continue
            video_id = entry.get("id")
            url = candidate_thumbnail(entry)
            key = (game, character["artSlug"], url)
            if not video_id or not url or key in known or url in known_urls:
                continue
            candidates.append((entry, character, url))

        def fetch(item):
            entry, character, url = item
            content, resolution = decode_thumbnail(url)
            local = ROOT / "assets/card-art/downloads" / (hashlib.sha256(content).hexdigest() + ".image")
            if not local.exists():
                local.write_bytes(content)
            video_url = f"https://www.youtube.com/watch?v={entry['id']}"
            return {
                "game": game,
                "slug": character["artSlug"],
                "local": local.relative_to(ROOT).as_posix(),
                "source": video_url,
                "officialAssetUrl": url,
                "title": entry.get("title", ""),
                "provenance": provenance,
                "artType": "official-character-promo",
                "sourceVerifiedBy": f"Chaîne YouTube officielle vérifiée: {channel_label} ({expected_channel}); miniature vidéo uniquement",
                "sourceResolution": f"{resolution[0]}x{resolution[1]}",
            }

        added, rejected = [], []
        with ThreadPoolExecutor(max_workers=6) as pool:
            futures = {pool.submit(fetch, item): item for item in candidates}
            for future in as_completed(futures):
                try:
                    row = future.result()
                    sources.append(row)
                    known.add((row["game"], row["slug"], row["officialAssetUrl"]))
                    known_urls.add(row["officialAssetUrl"])
                    added.append(row)
                except Exception as exc:
                    rejected.append({"title": futures[future][0].get("title", ""), "reason": str(exc)[:180]})
        report[game] = {"officialChannel": expected_channel, "videosScanned": len(entries), "uniqueCharacterPromos": len(candidates), "thumbnailsAdded": len(added), "rejected": rejected}
        sources_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps({game: {key: value for key, value in report[game].items() if key != "rejected"} | {"rejected": len(rejected)}}, ensure_ascii=True), flush=True)

    (ROOT / "assets/card-art/downloads/youtube-official-art-sync.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
