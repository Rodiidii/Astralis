"""Fetch character artwork from Kuro's official Wuthering Waves website feed."""
from __future__ import annotations

import hashlib
import io
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/en"
DETAIL = "https://wutheringwaves.kurogames.com/en/main/news/detail/{}"
HEADERS = {"User-Agent": "Mozilla/5.0", "Referer": "https://wutheringwaves.kurogames.com/"}
QUALITY_EXCLUSIONS = ROOT / "assets/card-art/quality-exclusions.json"
EXCLUDED_URLS = {row.get("officialAssetUrl") for row in json.loads(QUALITY_EXCLUSIONS.read_text(encoding="utf-8")) if row.get("officialAssetUrl")} if QUALITY_EXCLUSIONS.exists() else set()
MIN_CARD_ART_ASPECT = 0.62


def get(url: str, limit: int = 24 * 1024 * 1024) -> bytes:
    allowed = ("https://hw-media-cdn-mingchao.kurogame.com/",)
    if not url.startswith(allowed):
        raise ValueError("URL hors CDN officiel Kuro")
    with urlopen(Request(url, headers=HEADERS), timeout=25) as response:
        data = response.read(limit + 1)
    if len(data) > limit:
        raise ValueError("Image trop volumineuse")
    return data


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def dhash(data: bytes) -> str:
    from io import BytesIO
    with Image.open(BytesIO(data)) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image.thumbnail((1600, 2400), Image.Resampling.LANCZOS)
        image = image.convert("L").resize((9, 8), Image.Resampling.LANCZOS)
        values = list(image.get_flattened_data())
    value = sum((values[y * 9 + x] > values[y * 9 + x + 1]) << (y * 8 + x)
                for y in range(8) for x in range(8))
    return f"{value:016x}"


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def matches_character(title: str, key: str, name: str) -> bool:
    full = {norm(key), norm(name)}
    aliases = {tokens[-1] for value in (key, name) if (tokens := [token for token in re.split(r"[-\s]+", value.lower()) if len(token) >= 4])}
    return any(term and term in norm(title) for term in full | aliases)


def collect_article(entry: dict, chars: dict[str, str], known: set[tuple]) -> dict:
    title = entry.get("articleTitle", "")
    matches = [(key, name) for key, name in chars.items() if matches_character(title, key, name)]
    if len(matches) != 1:
        return {"articles": 0, "rows": [], "migrations": [], "failures": []}
    char_slug, _ = matches[0]
    article_id = int(entry["articleId"])
    try:
        article = json.loads(get(f"{BASE}/article/{article_id}.json").decode("utf-8"))
        content = unescape(article.get("articleContent", ""))
        urls = list(dict.fromkeys(re.findall(r"https://hw-media-cdn-mingchao\.kurogame\.com/[^\"'<> ]+\.(?:png|jpe?g|webp)(?:\?[^\"'<> ]*)?", content, re.I)))
    except Exception as exc:
        return {"articles": 0, "rows": [], "migrations": [], "failures": [{"article": article_id, "error": str(exc)}]}
    source = DETAIL.format(article_id)
    rows, failures = [], []
    for image_url in urls:
        if image_url in EXCLUDED_URLS:
            continue
        if ("ww", char_slug, image_url) in known:
            continue
        try:
            data = get(image_url)
            with Image.open(io.BytesIO(data)) as source_image:
                image = ImageOps.exif_transpose(source_image).convert("RGB")
                if min(image.size) < 500:
                    continue
                # Avoid long 9:16 character posters and editorial/profile sheets. They
                # are official, but the stretched crop is a poor fit for a card frame.
                if image.width / image.height < MIN_CARD_ART_ASPECT:
                    continue
                image.thumbnail((1600, 2400), Image.Resampling.LANCZOS)
                saturation = list(image.convert("HSV").getchannel("S").resize((80, 80)).get_flattened_data())
                if saturation and sum(value <= 18 for value in saturation) / len(saturation) >= .94 and sum(saturation) / len(saturation) <= 12:
                    continue
            image_hash = dhash(data)
            local = ROOT / "assets/card-art/downloads" / f"{digest(data)}.image"
            if not local.exists():
                output = io.BytesIO()
                with Image.open(io.BytesIO(data)) as source_image:
                    image = ImageOps.exif_transpose(source_image).convert("RGB")
                    image.thumbnail((1600, 2400), Image.Resampling.LANCZOS)
                    image.save(output, "WEBP", quality=88, method=6)
                try:
                    with local.open("xb") as cache_file:
                        cache_file.write(output.getvalue())
                except FileExistsError:
                    pass
            row = {"game": "ww", "slug": char_slug, "local": local.relative_to(ROOT).as_posix(),
                   "source": source, "officialAssetUrl": image_url, "title": title,
                   "provenance": "official-kuro", "sourceVerifiedBy": "Profil/article de résonateur du site officiel Kuro Games", "_dhash": image_hash}
            rows.append(row)
        except Exception as exc:
            failures.append({"article": article_id, "url": image_url, "error": str(exc)})
    return {"articles": 1, "rows": rows, "failures": failures}


def main() -> int:
    catalog = json.loads((ROOT / "public/card-catalog.json").read_text(encoding="utf-8"))["cards"]
    chars = {row["artSlug"]: row["name"] for row in catalog
             if row.get("game") == "ww" and row.get("kind") == "character"}
    menu = json.loads(get(BASE + "/ArticleMenu.json").decode("utf-8"))
    chosen = [row for row in menu if re.search(r"profile reveal|resonator review|post-lament anthropocene: stars intertwined", row.get("articleTitle", ""), re.I)]
    out_path = ROOT / "assets/card-art/downloads/sources.json"
    rows = json.loads(out_path.read_text(encoding="utf-8")) if out_path.is_file() else []
    manifest_path = ROOT / "public/card-artworks.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    artworks = manifest.get("artworks", {})
    known = {(row.get("game"), row.get("slug"), row.get("officialAssetUrl")) for row in rows}
    added, failures, articles = 0, [], 0
    completed = 0
    def save_result(result):
        nonlocal added, articles, completed
        articles += result["articles"]
        failures.extend(result["failures"])
        for row in result["rows"]:
            for record in artworks.values():
                if record.get("game") == "ww" and record.get("slug") == row["slug"] and record.get("dhash") == row["_dhash"] and record.get("provenance") != "official-kuro":
                    record.update({key: row[key] for key in ("source", "officialAssetUrl", "provenance", "sourceVerifiedBy")})
                    record["local"] = row["local"]
            if (row["game"], row["slug"], row["officialAssetUrl"]) not in known:
                row.pop("_dhash", None)
                rows.append(row); known.add((row["game"], row["slug"], row["officialAssetUrl"])); added += 1
        completed += 1
        if completed % 10 == 0:
            print(f"Articles Kuro vérifiés: {completed}/{len(chosen)}", flush=True)
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(collect_article, entry, chars, known) for entry in chosen]
        for future in as_completed(futures):
            save_result(future.result())
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    report = {"profileArticles": articles, "newOfficialCharacterArtworks": added, "failures": failures}
    (ROOT / "assets/card-art/downloads/wuwa-official-art-sync.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    by_local = {row.get("local"): row for row in artworks.values() if row.get("provenance") == "official-kuro"}
    for source_row in rows:
        record = by_local.get(source_row.get("local"))
        if record:
            source_row.update({key: record[key] for key in ("source", "officialAssetUrl", "provenance", "sourceVerifiedBy") if key in record})
    out_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"profileArticles": articles, "newOfficialCharacterArtworks": added, "failures": len(failures)}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
