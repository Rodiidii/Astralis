"""Fetch the pinned MIT-licensed formula dependency graph (no UI/assets).

The manifest records exact source hashes. Downloading a sheet does not certify
that its mechanics pass Astralis' integration and coverage checks.
"""
import concurrent.futures
import hashlib
import json
import re
from pathlib import Path, PurePosixPath
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'vendor/genshin-optimizer-source'
REVISION = json.loads((ROOT / 'data/lab-source-snapshot.json').read_text())['revision']
BASE = f'https://raw.githubusercontent.com/frzyc/genshin-optimizer/{REVISION}/'


def get(path):
    target = OUTPUT / path
    if target.is_file():
        return path, target.read_bytes()
    with urlopen(Request(BASE + path, headers={'User-Agent': 'Astralis formula integration'}), timeout=30) as response:
        content = response.read()
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content)
    return path, content


def main():
    tree = json.loads((ROOT / 'data/lab-go-tree.json').read_text())
    available = set(tree['paths'])
    _, content = get('tsconfig.base.json')
    aliases = json.loads(content)['compilerOptions']['paths']

    def resolve(path, imported):
        if imported in aliases:
            candidate = aliases[imported][0].removeprefix('./')
        elif imported.startswith('.'):
            parts = []
            for part in (PurePosixPath(path).parent / imported).parts:
                if part == '..':
                    parts.pop()
                elif part != '.':
                    parts.append(part)
            candidate = '/'.join(parts)
        else:
            return None
        for suffix in ['', '.ts', '.tsx', '.json', '.js', '/index.ts', '/index.tsx', '/index.js']:
            if candidate + suffix in available:
                return candidate + suffix
        raise ValueError(f'Unresolved local import {path} -> {imported}')

    pending = {
        'LICENSE', 'libs/gi/formula/src/calculator.ts',
        'libs/gi/formula/src/data/index.ts', 'libs/gi/formula/src/meta.ts',
        'libs/gi/formula/src/util.ts', 'libs/gi/formula/src/data/util/index.ts',
        aliases['@genshin-optimizer/pando/engine'][0].removeprefix('./'),
    }
    pending = {path for path in pending if path in available}
    hashes, external, failures = {}, set(), []
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
        while pending:
            batch = pending - hashes.keys()
            pending = set()
            jobs = {pool.submit(get, path): path for path in batch}
            for future in concurrent.futures.as_completed(jobs):
                path = jobs[future]
                try:
                    _, data = future.result()
                    hashes[path] = hashlib.sha256(data).hexdigest()
                    if path.endswith(('.ts', '.tsx', '.js')):
                        text = data.decode('utf8')
                        imports = re.findall(r'''(?:from\s*|import\s*\(|require\s*\(|import\s*)['"]([^'"]+)['"]''', text)
                        for imported in imports:
                            if any(char in imported for char in ['`', '$', '\n']):
                                continue
                            dependency = resolve(path, imported)
                            if dependency:
                                if dependency not in hashes:
                                    pending.add(dependency)
                            else:
                                external.add(imported)
                except Exception as error:
                    failures.append({'path': path, 'error': str(error)})
            print(f'{len(hashes)} source files; {len(pending)} pending; {len(failures)} errors', flush=True)
    manifest = {'repository': 'https://github.com/frzyc/genshin-optimizer',
                'revision': REVISION, 'license': 'MIT', 'files': hashes,
                'external': sorted(external), 'failures': failures}
    (OUTPUT / 'astralis-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf8')
    if failures:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
