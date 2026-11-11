"""Cache Genshin game portraits for the relations map, by stable game ID."""
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import re
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'assets' / 'relations' / 'portraits'
DEST.mkdir(parents=True, exist_ok=True)
CATALOG = json.loads((ROOT / 'assets/data/gi-characters.json').read_text(encoding='utf-8'))


def fetch(character):
    ident = str(character.get('id', ''))
    filename = character.get('images', {}).get('filename_icon', '')
    if not re.fullmatch(r'\d+', ident) or not re.fullmatch(r'UI_AvatarIcon_[A-Za-z0-9_]+', filename):
        return None, character.get('name')
    output = DEST / f'{ident}.png'
    for base in ('https://upload-os-bbs.mihoyo.com/game_record/genshin/character_icon/',
                 'https://gi.yatta.moe/assets/UI/'):
        source = base + filename + '.png'
        try:
            with urlopen(Request(source, headers={'User-Agent':'Mozilla/5.0'}), timeout=9) as response:
                data = response.read(500000)
            if data.startswith(b'\x89PNG\r\n\x1a\n') and data.endswith(b'IEND\xaeB`\x82'):
                output.write_bytes(data)
                return (ident, source), None
        except OSError:
            continue
    return None, character.get('name')


with ThreadPoolExecutor(max_workers=14) as pool:
    results = list(pool.map(fetch, CATALOG))
sources = dict(record for record, _ in results if record)
(DEST.parent / 'portrait-sources.json').write_text(json.dumps(sources, indent=2)+'\n',encoding='utf-8')
print(len(sources), 'portraits, manquants :', [name for _, name in results if name])
