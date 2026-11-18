"""Import pinned talent text, constellation text and numeric talent tables.

This imports source data, not an assertion that every mechanic is implemented.
Existing output is retained if a refresh is incomplete.
"""
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DB_REV = '8e5badd60b5d894284ccc927a56c9683529d2592'
DB = f'https://raw.githubusercontent.com/theBowja/genshin-db/{DB_REV}/src/data/French'


def get(url):
    with urlopen(Request(url, headers={'User-Agent': 'Astralis kit audit'}), timeout=25) as response:
        return json.load(response)


def main():
    baseline = json.loads((ROOT / 'data/lab-source-snapshot.json').read_text(encoding='utf8'))
    catalog = json.loads((ROOT / 'assets/data/gi-characters.json').read_text(encoding='utf8'))
    output = ROOT / 'data/lab-kit-snapshot.json'
    previous = json.loads(output.read_text(encoding='utf8')) if output.exists() else {}
    kits = previous.get('characters', {})
    parameter_url = f'https://raw.githubusercontent.com/theBowja/genshin-db/{DB_REV}/src/data/stats/talents.json'
    parameters = get(parameter_url)
    failures = []

    def load(row):
        character_id = str(row['id'])
        source = baseline['characters'].get(character_id, {}).get('source')
        if not source:
            raise ValueError('No numeric source for ' + row['name'])
        folder = source.rsplit('/', 2)[-2]
        slug = folder.lower()
        talents = get(f'{DB}/talents/{slug}.json')
        constellations = get(f'{DB}/constellations/{slug}.json')
        params_url = parameter_url
        params = parameters[slug]
        for index in [1, 2, 3]:
            key = 'combat' + str(index)
            skill = talents.get(key)
            if skill and params.get(key):
                skill.setdefault('attributes', {})['parameters'] = params[key]
        return character_id, {
            'name': row['name'], 'talents': talents, 'constellations': constellations,
            'sources': [f'{DB}/talents/{slug}.json', f'{DB}/constellations/{slug}.json', params_url],
            'status': 'source-data-only',
        }

    with ThreadPoolExecutor(max_workers=10) as pool:
        jobs = {pool.submit(load, row): row for row in catalog if str(row['id']) not in kits}
        for future in as_completed(jobs):
            row = jobs[future]
            try:
                key, kit = future.result()
                kits[key] = kit
            except Exception as error:
                failures.append({'id': str(row['id']), 'name': row['name'], 'error': str(error)})
            if (len(kits) + len(failures)) % 20 == 0:
                print(f'{len(kits)} kits imported; {len(failures)} unresolved', flush=True)
    variants = previous.get('travelerVariants', {})

    def load_variant(slug):
        talents = get(f'{DB}/talents/{slug}.json')
        constellations = get(f'{DB}/constellations/{slug}.json')
        for index in [1, 2, 3]:
            key = 'combat' + str(index)
            talents[key].setdefault('attributes', {})['parameters'] = parameters[slug][key]
        return slug.removeprefix('traveler'), {
            'name': talents.get('name', slug), 'talents': talents, 'constellations': constellations,
            'sources': [f'{DB}/talents/{slug}.json', f'{DB}/constellations/{slug}.json', parameter_url],
            'status': 'source-data-only',
        }

    with ThreadPoolExecutor(max_workers=7) as pool:
        jobs = {pool.submit(load_variant, slug): slug for slug in parameters
                if slug.startswith('traveler') and slug.removeprefix('traveler') not in variants}
        for future in as_completed(jobs):
            try:
                element, entry = future.result()
                variants[element] = entry
            except Exception as error:
                failures.append({'variant': jobs[future], 'error': str(error)})
    output.write_text(json.dumps({
        'revisions': {'genshinDB': DB_REV, 'optimizer': baseline['revision']},
        'characters': kits, 'travelerVariants': variants, 'unresolved': failures,
    }, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf8')
    print(f'{len(kits)}/{len(catalog)} kits imported; {len(failures)} unresolved', flush=True)


if __name__ == '__main__':
    main()
