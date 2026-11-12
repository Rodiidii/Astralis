#!/usr/bin/env python3
"""Build Astralis' lightweight French Pokémon TCG catalog from TCGdex.

Only catalog metadata is stored in the repository. Card scans remain hosted by
TCGdex so the app does not grow by gigabytes.
"""
from __future__ import annotations

import concurrent.futures
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "pokemon-tcg-catalog.json"
COVER_MAP = ROOT / "public" / "pokemon-booster-covers.json"
BASE = "https://api.tcgdex.net/v2/fr"
LANG = "fr"
# Physical Pokémon TCG expansion series. Promo-only, starter-kit and Pocket
# series are deliberately excluded; special expansions remain included.
MAIN_SERIES = {"base", "neo", "ecard", "ex", "dp", "pl", "hgss", "col", "bw", "xy", "sm", "swsh", "sv", "me"}
EXCLUDED_SET_IDS = {"miscp"}
CLASSIC_CELEBRATIONS = {
    "001": "2_A", "002": "4_A", "003": "15_A", "004": "73_A", "005": "8_A",
    "006": "15_B", "007": "15_C", "008": "24_A", "009": "20_A", "010": "66_A",
    "011": "9_A", "012": "86_A", "013": "88_A", "014": "93_A", "015": "17_A",
    "016": "15_D", "017": "109_A", "018": "145_A", "019": "107_A", "020": "113_A",
    "021": "114_A", "022": "54_A", "023": "97_A", "024": "76_A", "025": "60_A",
}


def fetch_json(url: str, attempts: int = 4):
    request = urllib.request.Request(url, headers={"User-Agent": "Astralis-PokemonCatalog/1.0"})
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.load(response)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            if attempt + 1 == attempts:
                raise
            time.sleep(0.35 * (attempt + 1))


def details_for_card(card_id: str):
    try:
        row = fetch_json(f"{BASE}/cards/{urllib.parse.quote(card_id, safe='-!')}")
        return row
    except Exception as error:  # keep partial catalogs useful if one record is absent
        return {"id": card_id, "_syncError": str(error)}


def clean_card(row: dict, set_row: dict):
    image_base = row.get("image") or ""
    local_id = str(row.get("localId") or "")
    fallback_images = []
    if image_base:
        image = f"{image_base}/high.webp"
    elif set_row["id"] == "mee" and local_id.isdigit() and 1 <= int(local_id) <= 8:
        # TCGdex has no scans for this energy mini-set; use its verified card scan mirror.
        image = f"https://api.rip.fun/storage/v1/object/public/tcg/cards/mee-{int(local_id)}.large.webp"
    elif set_row["id"] == "mee" and local_id.isdigit() and 9 <= int(local_id) <= 16:
        # These 30th-anniversary energy scans are currently absent from TCGdex and its mirror.
        image = f"https://jmcards.fr/wp-content/uploads/2026/10/245px-Carte_MC3A9ga-C389volution_C389nergie_de_base_{int(local_id):03d}-245x300.png"
    elif set_row["id"] == "cel25cc" and local_id.startswith("CC"):
        scan = CLASSIC_CELEBRATIONS.get(local_id[-3:])
        image = f"https://images.pokemontcg.io/cel25c/{scan}.png" if scan else ""
    else:
        image = f"https://assets.tcgdex.net/{LANG}/{set_row['serie']['id']}/{set_row['id']}/{local_id}/high.webp"
        fallback_images.append(image.replace("/fr/", "/en/", 1))
        fallback_images.append(f"https://images.pokemontcg.io/{set_row['id']}/{local_id}.png")
    return {
        "id": row.get("id"),
        "localId": str(row.get("localId") or ""),
        "name": row.get("name") or "Carte Pokémon",
        "category": row.get("category") or "Pokémon",
        "rarity": row.get("rarity") or "Rareté inconnue",
        "hp": row.get("hp"),
        "types": row.get("types") or [],
        "image": image,
        "imageFallback": fallback_images[0] if fallback_images else "",
        "imageFallbacks": fallback_images,
        "illustrator": row.get("illustrator") or "",
        "setId": set_row["id"],
        "setName": set_row["name"],
        "seriesId": set_row["serie"]["id"],
        "seriesName": set_row["serie"]["name"],
        "releaseDate": set_row.get("releaseDate") or "",
        "dexId": row.get("dexId") or [],
    }


def main():
    index = fetch_json(f"{BASE}/sets")
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        sets = list(executor.map(lambda item: fetch_json(f"{BASE}/sets/{item['id']}"), index))
    sets = [
        row for row in sets
        if row.get("id") not in EXCLUDED_SET_IDS
        and (row.get("serie") or {}).get("id") in MAIN_SERIES
        and "promo" not in (row.get("name") or "").lower()
        and row.get("cards")
    ]
    set_by_id = {row["id"]: row for row in sets}
    refs = [(card["id"], set_by_id[set_id]) for set_id in set_by_id for card in set_by_id[set_id].get("cards", []) if card.get("id")]
    print(f"Récupération des fiches détaillées : {len(refs)} cartes dans {len(sets)} extensions…", flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        details = list(executor.map(lambda pair: details_for_card(pair[0]), refs))
    owner = {card["id"]: set_row for set_row in sets for card in set_row.get("cards", []) if card.get("id")}
    cards = [clean_card(row, owner[row["id"]]) for row in details if row.get("id") in owner]
    cards.sort(key=lambda c: (c["releaseDate"], c["seriesName"], c["setName"], c["localId"].lstrip("0") or "0"))
    cover_data = json.loads(COVER_MAP.read_text(encoding="utf-8")) if COVER_MAP.exists() else {}
    cover_sets = cover_data.get("sets", {})
    cover_fallback = cover_data.get("fallback", [])
    payload = {
        "source": "TCGdex",
        "sourceUrl": "https://www.tcgdex.dev/",
        "language": LANG,
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "setCount": len(sets),
        "cardCount": len(cards),
        "series": sorted({(s["serie"]["id"], s["serie"]["name"]) for s in sets}, key=lambda x: x[1]),
        "sets": [{"id": s["id"], "name": s["name"], "seriesId": s["serie"]["id"], "seriesName": s["serie"]["name"], "releaseDate": s.get("releaseDate") or "", "logo": s.get("logo") or "", "symbol": s.get("symbol") or "", "boosterCovers": cover_sets.get(s["id"], cover_fallback), "cardCount": s.get("cardCount", {}).get("official", len(s.get("cards", [])))} for s in sorted(sets, key=lambda x: (x.get("releaseDate") or "", x["name"]))],
        "cards": cards,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    failed = sum(bool(row.get("_syncError")) for row in details)
    print(f"Catalogue ecrit : {len(cards)} cartes, {len(sets)} extensions, {failed} fiches manquantes -> {OUTPUT}")


if __name__ == "__main__":
    import urllib.parse
    main()
