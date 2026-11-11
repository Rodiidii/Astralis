"""Build Genshin relationship evidence from a pinned genshin-db snapshot."""
import argparse
from itertools import combinations
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import random
import re
import unicodedata
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
API = 'https://api.github.com/repos/theBowja/genshin-db/git/trees/'
RAW = 'https://raw.githubusercontent.com/theBowja/genshin-db/'
ALIASES = {'Childe':'Tartaglia','Ajax':'Tartaglia','Rex Lapis':'Zhongli','Morax':'Zhongli',
           'Barbatos':'Venti','Buer':'Nahida','Lesser Lord Kusanali':'Nahida',
           'Beelzebul':'Shogun Raiden','Raiden Ei':'Shogun Raiden','Narukami':'Shogun Raiden',
           'Le Nomade':'Nomade','Wanderer':'Nomade','Scaramouche':'Nomade','Arataki Itto':'Arataki Itto'}
AMBIGUOUS = {'lisa minci', 'nous', 'you', 'us', 'traveler', 'voyageur', 'voyageuse'}


def normalize(text):
    text = unicodedata.normalize('NFKD', str(text).casefold())
    return ' '.join(re.findall(r'[^\W_]+', ''.join(c for c in text if not unicodedata.combining(c))))


def aliases_for(characters):
    aliases = {}
    names = {normalize(c['name']): str(c['id']) for c in characters}
    for name, ident in names.items():
        aliases.setdefault(name, set()).add(ident)
    for alias, name in ALIASES.items():
        if normalize(name) in names:
            aliases.setdefault(normalize(alias), set()).add(names[normalize(name)])
    return {k: next(iter(v)) for k,v in aliases.items() if len(v) == 1 and k not in AMBIGUOUS}


def target_for(title, aliases):
    match = re.match(r"^(?:about\s+|à propos (?:de\s+|du\s+|d['’]))(.+)$", title.strip(), re.I)
    if not match:
        return None
    name = re.split(r'\s+[-–—:]\s+|\s*[:.….]', match[1], maxsplit=1)[0]
    name = re.sub(r'\s+(?:lui|elle)[- ]même$', '', name.strip(), flags=re.I)
    return aliases.get(normalize(name))


# A title like "the Electro Archon" can refer to Makoto in historical texts.
# These specific titles in Neuvillette’s profile refer to the current bearers.
NEUVILLETTE_TITLES = {
    'geo':'10000030','anemo':'10000022','electro':'10000052','dendro':'10000073','pyro':'10000106'
}


def voice_target(title, aliases, actor):
    if str(actor) == '10000087':
        key = normalize(title)
        for element, ident in NEUVILLETTE_TITLES.items():
            if key in {f'about the {element} archon', f'a propos de l archon {element}'}:
                return ident
    return target_for(title,aliases)


def get(url):
    with urlopen(url, timeout=24) as response:
        return json.load(response)


def quest_evidence(path, language, source, aliases):
    """Accept GenshinDialog quest JSONL. A pair needs two named speakers in the same subquest."""
    with path.open(encoding='utf-8-sig') as stream:
        for raw in stream:
            if not raw.strip():
                continue
            quest = json.loads(raw)
            quest_id = quest.get('mainQuestId')
            if not quest_id:
                continue
            for scene_index, scene in enumerate(quest.get('subQuests') or []):
                speakers = {}
                for item in scene.get('items') or []:
                    speaker = item.get('speakerText') or {}
                    if speaker.get('textType') != 'SpeakerKnown':
                        continue
                    actor = aliases.get(normalize(speaker.get('textId','')))
                    if not actor or actor in speakers:
                        continue
                    for dialog in item.get('dialogs') or []:
                        quote = (dialog.get('text') or {}).get('textId','')
                        if isinstance(quote,str) and quote.strip():
                            speakers[actor] = quote
                            break
                title = (scene.get('subQuestTitle') or {}).get('textId') or (quest.get('mainQuestTitle') or {}).get('textId')
                if not title:
                    continue
                for a,b in combinations(sorted(speakers),2):
                    yield dict(**{'from':a,'to':b},kind='story',lang=language,
                        id=f'quest:{quest_id}:{scene_index}:{a}:{b}',quest=str(quest_id),title=title,
                        quote=speakers[a], reply=speakers[b], source=source)


def build(ref, quest_inputs=()):
    tree = get(API + ref + '?recursive=1')
    revision = tree['sha']
    paths = [item['path'] for item in tree['tree']
             if re.fullmatch(r'src/data/(?:French|English)/voiceovers/[^/]+\.json', item['path'])
             and item.get('size', 0) > 100]
    characters = json.loads((ROOT / 'assets/data/gi-characters.json').read_text(encoding='utf-8'))
    aliases = aliases_for(characters)
    ids = {str(c['id']) for c in characters}
    aliases.update({'paimon':'paimon'})
    ids.add('paimon')
    failures = []
    def read(path):
        url = RAW + revision + '/' + path
        for _ in range(2):
            try:
                return path, url, get(url)
            except Exception:
                pass
        return path, url, None

    with ThreadPoolExecutor(max_workers=14) as pool:
        documents = list(pool.map(read, paths))
    name_candidates = {name:{actor} for name,actor in aliases.items()}
    for _, _, entry in documents:
        if entry and str(entry.get('id')) in ids and entry.get('name'):
            name_candidates.setdefault(normalize(entry['name']),set()).add(str(entry['id']))
    aliases = {name:next(iter(matches)) for name,matches in name_candidates.items()
               if len(matches) == 1 and name not in AMBIGUOUS}
    evidence = []
    for path, url, entry in documents:
        if entry is None:
            failures.append(path)
            continue
        actor = str(entry.get('id'))
        if actor not in ids:
            continue
        language = 'fr' if '/French/' in path else 'en'
        for line in entry.get('friendLines', []):
            title, quote = line.get('title',''), line.get('description','')
            target = voice_target(title, aliases, actor)
            if not target or target == actor or not quote.strip() or not line.get('voicelineId'):
                continue
            evidence.append(dict(**{'from':actor,'to':target}, kind='voice', lang=language,
                id=f"{actor}:{line['voicelineId']}", title=title, quote=quote,
                source=url, voicefile=line.get('voicefile')))
    if not evidence:
        raise RuntimeError('Aucune preuve récupérée. Le fichier précédent est conservé.')
    if failures:
        raise RuntimeError(f'{len(failures)} fichiers en échec. Le fichier précédent est conservé.')
    for language, path, source in quest_inputs:
        if language not in {'fr','en'} or not source.startswith('https://'):
            raise ValueError('Chaque corpus de quête exige une langue FR/EN et une source HTTPS.')
        evidence.extend(quest_evidence(Path(path),language,source,aliases))
    story_count = sum(row['kind']=='story' for row in evidence)
    result = dict(revision=revision, coverage={'voice':True,'story':bool(story_count)}, aliases=aliases, evidence=evidence)
    output = ROOT / 'data/relations.json'
    output.parent.mkdir(exist_ok=True)
    temporary = output.with_suffix('.tmp')
    temporary.write_text(json.dumps(result, ensure_ascii=False, separators=(',',':'))+'\n', encoding='utf-8')
    temporary.replace(output)
    sample = random.Random(20261110).sample(evidence, min(50,len(evidence)))
    audit = ['# Audit du réseau', '', f'Source genshin-db, révision {revision}.',
             f'{len(evidence)-story_count} preuves vocales et {story_count} preuves de scène. Les traductions vocales partagent un identifiant.',
             'Les URL audio lisibles restent à intégrer.',
             'Échantillon reproductible. Le verdict automatique vérifie la correspondance exacte du titre et la présence du texte. La relecture humaine reste à faire.', '']
    for row in sample:
        excerpt = ' '.join(row['quote'].split())[:95]
        audit.append(f"- {row['id']} · {row['lang'].upper()} · {row['title']} · « {excerpt}… » · titre concordant. [Source]({row['source']})")
    (ROOT / 'docs/AUDIT-RELATIONS.md').write_text('\n'.join(audit)+'\n', encoding='utf-8')
    print(f'{len(evidence)} preuves publiées dans {output}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--ref', default='main')
    parser.add_argument('--quests', nargs=3, action='append', default=[], metavar=('LANG','JSONL','SOURCE'))
    args = parser.parse_args()
    build(args.ref,args.quests)
