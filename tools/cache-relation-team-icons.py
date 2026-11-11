"""Cache the exact preferred character icons used by Astralis teams."""
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import subprocess
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'assets/relations/team-portraits'
DEST.mkdir(parents=True, exist_ok=True)
roster = json.loads(subprocess.check_output(['node', str(ROOT/'tools/relation-team-icons.mjs')]))


def fetch(entry):
    ident, urls = entry
    for url in urls:
        try:
            with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=8) as response:
                data = response.read(500000)
            if data.startswith(b'RIFF') and data[8:12] == b'WEBP' and int.from_bytes(data[4:8],'little') + 8 == len(data):
                (DEST / (ident + '.webp')).write_bytes(data)
                return ident,url
        except OSError:
            continue
    return None


with ThreadPoolExecutor(max_workers=14) as pool:
    sources = dict(entry for entry in pool.map(fetch, roster) if entry)
(DEST.parent / 'team-portrait-sources.json').write_text(json.dumps(sources,indent=2)+'\n',encoding='utf-8')
print(len(sources),'icônes identiques aux équipes')
