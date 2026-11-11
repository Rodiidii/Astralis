"""Import explicitly titled voice-overs missing from the genshin-db snapshot."""
from concurrent.futures import ThreadPoolExecutor
from html import unescape
import importlib.util
import json
from pathlib import Path
import re
from urllib.parse import urlencode, quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
WIKI = 'https://genshin-impact.fandom.com'
DATASET = 'Fandom voice-over transcription'
spec = importlib.util.spec_from_file_location('build_relations', Path(__file__).with_name('build-relations.py'))
pipeline = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pipeline)
NAME_OVERRIDES = {'Nomade':'Wanderer', 'Le Nomade':'Wanderer', 'Shogun Raiden':'Raiden Shogun',
                  'Émilie':'Emilie','Fréminet':'Freminet','Noëlle':'Noelle','Rosalia':'Rosaria','Thomas':'Thoma'}


def plain(html):
    return ' '.join(unescape(re.sub(r'<[^>]*>', '', html)).split())


def extract_voiceovers(html, actor, aliases, source, revision):
    for row in re.findall(r'<tr\b[^>]*>(.*?)</tr>', html, re.S | re.I):
        header = re.search(r'<th\b[^>]*>(.*?)</th>', row, re.S | re.I)
        cell = re.search(r'<td\b[^>]*>(.*?)</td>', row, re.S | re.I)
        if not header or not cell:
            continue
        def language_spans(text):
            return re.findall(r'<span\b[^>]*\blang="en"[^>]*>(.*?)</span>', text, re.S | re.I)
        headings = language_spans(header[1])
        texts = language_spans(cell[1])
        if not headings or not texts:
            continue
        title = plain(headings[0])
        target = pipeline.voice_target(title, aliases, actor)
        transcript = plain(texts[-1])
        collective=title.casefold().strip() in ('about the seven','about the seven...')
        targets=([x for x in ['10000022','10000030','10000052','10000073','10000106','tsaritsa'] if x!=actor] if collective else [target])
        if not targets or not transcript:
            continue
        # Short extract, with the full transcription accessible at its source.
        words = transcript.split()
        excerpt = ' '.join(words[:16]) + ('…' if len(words) > 16 else '')
        audio = re.search(r'<audio\b[^>]*\bsrc="(https://static\.wikia\.nocookie\.net/[^"]+)"', cell[1])
        for target in targets:
            if not target or target==actor:continue
            yield {'from':actor,'to':target,'kind':'voice','lang':'en',
                   'id':'wiki:'+actor+':'+pipeline.normalize(title)+(':'+target if collective else ''),
                   'title':title,'quote':excerpt,'source':source,'dataset':DATASET,
                   'scope':'collective' if collective else 'individual',
                   'revision':revision,'audio':unescape(audio[1]) if audio else None}


def main():
    output = ROOT / 'data/relations.json'
    snapshot = json.loads(output.read_text(encoding='utf-8'))
    catalog = json.loads((ROOT / 'assets/data/gi-characters.json').read_text(encoding='utf-8'))
    aliases = {**snapshot['aliases'], 'the traveler':'10000005','traveler':'10000005',
               'le voyageur':'10000005','la voyageuse':'10000005','voyageur':'10000005','voyageuse':'10000005'}
    lore = json.loads((ROOT / 'assets/data/gi-relation-lore.json').read_text(encoding='utf-8-sig'))
    additions = json.loads((ROOT / 'assets/data/gi-relation-overrides.json').read_text(encoding='utf-8'))['roster']
    for entry in additions:
        aliases[pipeline.normalize(entry['name'])] = entry['id']
    for entry in lore:
        for alias in entry['aliases']:
            if len(alias) > 1:
                aliases.setdefault(pipeline.normalize(alias),entry['id'])
    aliases.update({
        'marionette':'10000133','lady marionette':'10000133','lady arlecchino':'10000096',
        'lady damselette':'10000125','damselette':'10000125','valeriy s lectures':'10000137'
    })
    for character in catalog:
        aliases[pipeline.normalize(character['name'])]=str(character['id'])
    aliases.update({'anastasya':'tsaritsa','anastasya feodorovna snezhnaya':'tsaritsa','the tsaritsa':'tsaritsa',
      'cryo archon':'tsaritsa','pyro archon':'10000106','the pyro archon':'10000106',
      'the anemo archon':'10000022','the geo archon':'10000030','the electro archon':'10000052',
      'the dendro archon':'10000073','the hydro archon':'10000089','raiden shogun':'10000052',
      'raiden ei':'10000052','morax':'10000030','barbatos':'10000022','buer':'10000073',
      'focalors':'focalors','the damselette':'10000125','the moon goddess':'10000125',
      'kuutar':'10000125','kyryll chudomirovich flins':'10000120'})
    existing = list(snapshot['evidence'])
    known = {(row['from'],row['to'],pipeline.normalize(row['title'])) for row in existing if row['kind']=='voice' and row['lang']=='en'}
    failed = []

    def fetch(character):
        actor = str(character['id'])
        name = character.get('page') or NAME_OVERRIDES.get(character['name'],character['name'])
        if actor=='tsaritsa':name='Anastasya'
        page = name + '/Voice-Overs'
        api = WIKI + '/api.php?' + urlencode({'action':'parse','page':page,'prop':'text|revid','format':'json'},quote_via=quote)
        try:
            with urlopen(Request(api,headers={'User-Agent':'Mozilla/5.0'}),timeout=12) as response:
                parsed = json.load(response).get('parse')
            if not parsed:
                return name,[]
            actual = parsed['title'].removesuffix('/Voice-Overs')
            if pipeline.normalize(actual)!=pipeline.normalize(name) and aliases.get(pipeline.normalize(actual)) != actor:
                return name,[]
            source = WIKI + '/wiki/' + quote(parsed['title'].replace(' ','_'),safe='/')
            if parsed.get('revid'):
                source += '?oldid=' + str(parsed['revid'])
            return None,list(extract_voiceovers(parsed['text']['*'],actor,aliases,source,parsed.get('revid')))
        except (OSError,ValueError,KeyError):
            return name,[]

    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(fetch, list({str(row['id']):row for row in catalog+additions+lore}.values())))
    added = []
    for failure, rows in results:
        if failure:
            failed.append(failure)
        for row in rows:
            key = (row['from'],row['to'],pipeline.normalize(row['title']))
            if key in known:
                continue
            known.add(key)
            added.append(row)
    if not added:
        print('Aucune preuve nouvelle. Le corpus actuel est conservé.')
    snapshot.update(evidence=existing+added,aliases=aliases,voiceFallback={'source':WIKI,'unavailable':failed})
    temp = output.with_suffix('.tmp')
    temp.write_text(json.dumps(snapshot,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    temp.replace(output)
    print(len(added),'preuves ajoutées. Pages non récupérées :',failed)


if __name__=='__main__':
    main()
