import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('les imports nommes du demarrage existent dans les modules demandes', async () => {
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  for (const [, names, path] of app.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)) {
    const moduleUrl = new URL('../src/' + path.replace(/^\.\//, ''), import.meta.url);
    // Browser-only custom elements are exercised in cards_browser.py.
    const source = await readFile(moduleUrl, 'utf8');
    const module = source.includes('extends HTMLElement')
      ? Object.fromEntries([...source.matchAll(/export\s+(?:async\s+)?(?:function|const|class)\s+(\w+)/g)].map(match => [match[1], true]))
      : await import(moduleUrl);
    for (const name of names.split(',').map(value => value.trim().split(/\s+as\s+/)[0])) {
      assert.ok(name in module, `${path} doit exporter ${name}`);
    }
  }
});

test('le secours masque le chargement et explique un echec de demarrage', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(match => match[1]).find(source => source.includes('Filet de sécurité'));
  let removed = false;
  const app = { children: [], innerHTML: '' };
  const timers = [];
  vm.runInNewContext(script, {
    document: { documentElement: { dataset: {} }, getElementById: id => id === 'app' ? app : { remove() { removed = true; } } },
    window: { addEventListener() {} },
    setTimeout(callback, delay) { timers.push({ callback, delay }); },
  });
  const timeout = timers.find(timer => timer.delay === 12000);
  assert.ok(timeout, 'le delai de secours doit etre installe');
  timeout.callback();
  assert.equal(removed, true);
  assert.match(app.innerHTML, /Le démarrage prend trop de temps/);
});
