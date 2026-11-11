"""Import attested shared scenes from Nod-Krai quest transcriptions."""
from concurrent.futures import ThreadPoolExecutor
from html import unescape
from itertools import combinations
import importlib.util
import json
from pathlib import Path
import re
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
WIKI = 'https://genshin-impact.fandom.com'
CHAPTERS = (
    'A Dance of Snowy Tides and Hoarfrost Groves',
    'Song of the Welkin Moon',
    'True Moon',
    'Those We Have Kept',
    'Melting Moonlight in the Morning Mist',
    'Elegy of Dust and Lamplight',
    'A Nocturne of the Far North',
    'The Journey Home',
    'Incandescent Ode of Resurrection',
    'Akasha Pulses, the Kalpa Flame Rises',
    'We Will Be Reunited',
    'Masquerade of the Guilty',
    'A Rekviem for the Underworld',
    'Hour of Ruin',
)
DATASET = 'Nod-Krai quest transcriptions'
spec = importlib.util.spec_from_file_location('build_relations', Path(__file__).with_name('build-relations.py'))
pipeline = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pipeline)


def fetch(title):
    params = urlencode({'action':'parse','page':title,'prop':'text|revid','format':'json'},quote_via=quote)
    request = Request(WIKI + '/api.php?' + params,headers={'User-Agent':'Mozilla/5.0'})
    with urlopen(request,timeout=12) as response:
        return json.load(response).get('parse',{})


def plain(html):
    return ' '.join(unescape(re.sub(r'<[^>]*>','',html)).split())


def extract_scenes(dialog, aliases):
    scenes = []
    location = ''
    speakers = {}
    # Anchored scene headings are outside individual dialogue entries.
    tokens = re.finditer(r'<dd\b[^>]*>(.*?)</dd>|<dl\b[^>]*>\s*<dt\b[^>]*>(.*?)</dt>',dialog,re.S|re.I)
    for token in tokens:
        if token[2] is not None:
            if len(speakers) >= 2:
                scenes.append((location,speakers))
            location = plain(token[2]).strip('()')
            speakers = {}
            continue
        if not location:
            continue
        line = re.search(r'<b\b[^>]*>(.*?)</b>\s*(.+)',token[1],re.S|re.I)
        if not line:
            continue
        speaker = plain(line[1])
        if not speaker.endswith(':'):
            continue
        actor = aliases.get(pipeline.normalize(speaker[:-1]))
        if not actor or actor in speakers:
            continue
        text = plain(re.split(r'<(?:dl|ul|div)\b',line[2],maxsplit=1)[0])
        if not text or not re.search(r'[^\W\d_]',text):
            continue
        words = text.split()
        speakers[actor] = ' '.join(words[:12]) + ('…' if len(words)>12 else '')
    if len(speakers) >= 2:
        scenes.append((location,speakers))
    return scenes


def main():
    output = ROOT / 'data/relations.json'
    data = json.loads(output.read_text(encoding='utf-8'))
    aliases = {**data['aliases'],'traveler':'10000005','the traveler':'10000005','paimon':'paimon'}
    quests = set()
    for chapter in CHAPTERS:
        article = fetch(chapter)
        html = article.get('text',{}).get('*','')
        # Chapter summaries have one definition heading per subquest.
        if 'id="Dialogue"' in html:
            quests.add(article.get('title',chapter))
        quests.update(plain(title) for title in re.findall(r'<dl>\s*<dt>([^<]+)</dt>',html))
    evidence = []

    def read(title):
        try:
            article = fetch(title)
            html = article.get('text',{}).get('*','')
            start = html.find('id="Dialogue"')
            if start < 0 or not article.get('pageid'):
                return []
            dialog = html.split('</h2>',1)[1] if start == 0 else html[start:].split('</h2>',1)[-1]
            dialog = dialog.split('<h2',1)[0]
            if not dialog:
                return []
            page = str(article['pageid'])
            source = WIKI + '/wiki/' + quote(article['title'].replace(' ','_'),safe='/') + '?oldid=' + str(article['revid'])
            return [
                {'from':a,'to':b,'kind':'story','lang':'en','id':f'wikiquest:{page}:{index}:{a}:{b}',
                 'quest':page,'title':article['title']+' · '+label,'quote':voices[a],
                 'reply':voices[b],'source':source,'dataset':DATASET}
                for index,(label,voices) in enumerate(extract_scenes(dialog,aliases))
                for a,b in combinations(sorted(voices),2)
            ]
        except (OSError,ValueError,KeyError):
            return []

    with ThreadPoolExecutor(max_workers=6) as pool:
        for rows in pool.map(read,sorted(quests)):
            evidence.extend(rows)
    if not evidence:
        raise RuntimeError('Aucune scène vérifiable trouvée.')
    known={row['id'] for row in data['evidence']}
    data['evidence'] += [row for row in evidence if row['id'] not in known]
    data['coverage']['story'] = True
    temp = output.with_suffix('.tmp')
    temp.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    temp.replace(output)
    print(len(evidence),'preuves de scènes sur',len({row['quest'] for row in evidence}),'quêtes')


if __name__ == '__main__':
    main()
