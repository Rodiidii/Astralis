"""Cache published talent costs, keeping previously verified entries on source failure."""
import json
import re
import unicodedata
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
REVISION = "8e5badd60b5d894284ccc927a56c9683529d2592"
BASE = f"https://raw.githubusercontent.com/theBowja/genshin-db/{REVISION}/src/data"
ALIASES = {"Shogun Raiden":"raidenshogun", "Rosalia":"rosaria", "Thomas":"thoma", "Nomade":"wanderer"}
ELEMENTS = ("anemo","geo","electro","dendro","hydro","pyro")
PATH = ROOT / "data/gi-talent-costs.json"


def slug(name):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", name.lower()))


def download(language, name):
    url = f"{BASE}/{language}/talents/{name}.json"
    try:
        with urlopen(Request(url, headers={"User-Agent":"Astralis source cache"}), timeout=15) as response:
            return json.load(response).get("costs"), url
    except (OSError, ValueError):
        return None, url


def main():
    cache = json.loads(PATH.read_text(encoding="utf-8")) if PATH.exists() else {}
    characters = json.loads((ROOT / "assets/data/gi-characters.json").read_text(encoding="utf-8"))
    materials = {str(item["id"]): item["name"] for item in
                 json.loads((ROOT / "assets/data/gi-materials.json").read_text(encoding="utf-8"))}
    missing = [(str(row["id"]), row["name"]) for row in characters
               if str(row["id"]) not in cache and row["name"] not in {"Aether","Lumine"}]

    def fetch(entry):
        ident, name = entry
        costs, source = download("French", slug(name))
        if not costs and name in ALIASES:
            costs, source = download("English", ALIASES[name])
        if not costs:
            return ident, None
        translated = {level: [{**row, "name": materials.get(str(row["id"]), row["name"])} for row in items]
                      for level, items in costs.items()}
        return ident, {"costs": translated, "source": source}

    traveler_jobs = [("traveler-" + element, "Traveler " + element) for element in ELEMENTS
                     if "traveler-" + element not in cache]
    ALIASES.update({name: slug(name) for _, name in traveler_jobs})
    with ThreadPoolExecutor(max_workers=10) as pool:
        cache.update({key: value for key, value in pool.map(fetch, missing + traveler_jobs) if value})
    tmp = PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(cache, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    tmp.replace(PATH)
    print(len(cache), "talent cost tables cached")


if __name__ == "__main__":
    main()
