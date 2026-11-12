#!/usr/bin/env python3
"""Download real Pokémon booster-wrapper art and map it to Astralis sets.

The source index is PokeSymbols' catalog of photographed/scanned booster art.
The resulting images are local WebP assets so booster opening works offline.
"""
from __future__ import annotations

import hashlib
import html.parser
import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urljoin

from PIL import Image
from io import BytesIO

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "public" / "pokemon-tcg-catalog.json"
OUTPUT = ROOT / "public" / "pokemon-booster-covers.json"
ASSET_DIR = ROOT / "assets" / "booster-covers" / "pokemon"
POKESYMBOLS = "https://pokesymbols.com/tcg/booster-pack-art"
TCGDEX_EN = "https://api.tcgdex.net/v2/en/sets"
USER_AGENT = "Astralis-PokemonBoosterCovers/1.0 (local app asset sync)"

# Sets that are subsets, galleries, or energy-only products reuse the actual
# booster art of the expansion that contains them.
PARENT_SET = {
    "cel25cc": "cel25", "swsh4.5sv": "swsh4.5", "swsh9tg": "swsh9",
    "swsh10tg": "swsh10", "swsh11tg": "swsh11", "swsh12tg": "swsh12",
    "swsh12.5gg": "swsh12.5", "sve": "sv01", "mee": "me01",
    "30th-c": "30th", "xya": "xy1", "exu": "ex10", "sma": "sm115",
    "xy0": "xy1",
}
PACK_NAME_ALIASES = {
    "base1": "base", "hgss2": "hs unleashed", "hgss3": "hs undaunted",
    "hgss4": "hs triumphant", "sm115": "hidden fates",
    "30th": "30th celebration",
}


def fetch(url: str, attempts: int = 4) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=35) as response:
                return response.read()
        except (urllib.error.URLError, TimeoutError):
            if attempt + 1 == attempts:
                raise
            time.sleep(0.4 * (attempt + 1))
    raise RuntimeError(f"Impossible de télécharger {url}")


def normalize(value: str) -> str:
    import unicodedata
    value = unicodedata.normalize("NFKD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


class BoosterArtParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows: list[tuple[str, str]] = []

    def handle_starttag(self, tag, attrs):
        if tag != "img":
            return
        values = dict(attrs)
        src = values.get("src", "")
        alt = values.get("alt", "")
        if "/booster-pack-art/" in src and alt:
            self.rows.append((alt, urljoin("https://pokesymbols.com", src)))


def main() -> None:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    english_sets = json.loads(fetch(TCGDEX_EN))
    by_id = {str(row["id"]).lower(): row for row in english_sets}
    parser = BoosterArtParser()
    parser.feed(fetch(POKESYMBOLS).decode("utf-8", "replace"))
    by_name: dict[str, list[str]] = {}
    for name, url in parser.rows:
        by_name.setdefault(normalize(name), []).append(url)

    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    asset_map: dict[str, list[str]] = {}
    source_map: dict[str, str] = {}
    reused = []
    missing = []
    for row in catalog.get("sets", []):
        set_id = str(row["id"])
        lookup_id = PARENT_SET.get(set_id, set_id)
        english = by_id.get(lookup_id.lower())
        urls = by_name.get(normalize(english["name"]), []) if english else []
        if not urls and lookup_id != set_id:
            parent = by_id.get(lookup_id.lower())
            urls = by_name.get(normalize(parent["name"]), []) if parent else []
        if not urls:
            # A few TCGdex English names differ from the pack index's display
            # title; stable product-code aliases cover those cases.
            aliases = {
                "ex1": "ruby sapphire", "ex6": "firered leafgreen",
                "dp1": "diamond pearl", "swsh3.5": "champion s path",
                "sv03.5": "151", "swsh10.5": "pokemon go",
            }
            pack_name = PACK_NAME_ALIASES.get(lookup_id, aliases.get(lookup_id, ""))
            urls = by_name.get(normalize(pack_name), [])
        if not urls:
            missing.append(set_id)
            continue

        # Use a single authentic pack art per expansion to keep the install
        # small; use the same front for related gallery/energy subsets.
        source_url = urls[0]
        digest = hashlib.sha256(source_url.encode("utf-8")).hexdigest()[:12]
        target = ASSET_DIR / f"{lookup_id}.webp"
        if not target.exists():
            raw = fetch(source_url)
            image = Image.open(BytesIO(raw)).convert("RGB")
            image.save(target, "WEBP", quality=88, method=6)
        relative = target.relative_to(ROOT).as_posix()
        asset_map[set_id] = [relative]
        source_map[set_id] = source_url
        if lookup_id != set_id:
            reused.append((set_id, lookup_id))
        print(f"{set_id}: {relative} ({target.stat().st_size:,} octets)")

    # A real Base Set wrapper is the last-resort image, never a fabricated pack.
    fallback = asset_map.get("base1") or next(iter(asset_map.values()), [])
    if not fallback:
        raise RuntimeError("Aucun visuel de booster n'a pu être récupéré.")
    OUTPUT.write_text(json.dumps({
        "source": "PokeSymbols · index des artworks de boosters Pokémon TCG",
        "sourceUrl": POKESYMBOLS,
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "fallback": fallback,
        "sets": asset_map,
        "sources": source_map,
        "reusedParents": reused,
        "missing": missing,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Keep the app's one catalog fetch simple and offline-ready.
    for row in catalog.get("sets", []):
        row["boosterCovers"] = asset_map.get(row["id"], fallback)
    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    referenced = {Path(paths[0]).name for paths in asset_map.values()}
    referenced.update(Path(path).name for path in fallback)
    for stale in ASSET_DIR.glob("*.webp"):
        if stale.name not in referenced:
            stale.unlink()
    total = sum(path.stat().st_size for path in ASSET_DIR.glob("*.webp"))
    print(f"\n{len(asset_map)}/{len(catalog.get('sets', []))} extensions couvertes; {len(reused)} sous-extensions réutilisent leur booster parent; {len(missing)} sans booster propre; poids total {total / 1024 / 1024:.2f} Mio.")
    if missing:
        print("Sans visuel direct (repli réel Base Set): " + ", ".join(missing))


if __name__ == "__main__":
    main()
