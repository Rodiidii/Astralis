import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(await fs.readFile(path.join(root, 'public/pokemon-tcg-catalog.json'), 'utf8'));
const workers = 96;
const timeoutMs = 8000;
const classicCelebrations = {
  '001': '2_A', '002': '4_A', '003': '15_A', '004': '73_A', '005': '8_A',
  '006': '15_B', '007': '15_C', '008': '24_A', '009': '20_A', '010': '66_A',
  '011': '9_A', '012': '86_A', '013': '88_A', '014': '93_A', '015': '17_A',
  '016': '15_D', '017': '109_A', '018': '145_A', '019': '107_A', '020': '113_A',
  '021': '114_A', '022': '54_A', '023': '97_A', '024': '76_A', '025': '60_A',
};
const pokemonSetAliases = {
  'swsh4.5sv': 'swsh45sv',
  'swsh12.5gg': 'swsh12pt5gg',
  'sm3.5': 'sm35',
  'sm7.5': 'sm75',
};
const results = new Array(catalog.cards.length);
let cursor = 0;
let completed = 0;

async function check(url) {
  if (!url) return { status: null, error: 'URL absente' };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'Astralis-PokemonImageAudit/1.0' },
      });
      clearTimeout(timer);
      if ([429, 500, 502, 503, 504].includes(response.status) && attempt === 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
        continue;
      }
      return { status: response.status, error: '' };
    } catch (error) {
      clearTimeout(timer);
      if (attempt === 0) {
        await new Promise(resolve => setTimeout(resolve, 150));
        continue;
      }
      return { status: null, error: String(error) };
    }
  }
  return { status: null, error: 'Échec après nouvelle tentative' };
}

function fallbackCandidates(card) {
  const candidates = [...(card.imageFallbacks || []), card.imageFallback || ''];
  if ((card.image || '').includes('assets.tcgdex.net')) candidates.push(card.image.replace('/fr/', '/en/'));
  if (card.setId && card.localId) {
    const setId = pokemonSetAliases[card.setId] || card.setId;
    const localId = String(card.localId);
    const ids = [...new Set([localId, localId.replace(/^0+(?=\d)/, '')].filter(Boolean))];
    for (const id of ids) candidates.push(`https://images.pokemontcg.io/${encodeURIComponent(setId)}/${encodeURIComponent(id)}.png`);
  }
  if (card.id) candidates.push(`https://pkm.gotemtcg.com/img/c/${card.id}/high?v=4`);
  return [...new Set(candidates.filter(url => url && url !== card.image))];
}

async function runWorker() {
  while (true) {
    const index = cursor++;
    if (index >= catalog.cards.length) return;
    const card = catalog.cards[index];
    if (card.setId === 'cel25cc' && card.localId.startsWith('CC')) {
      const scan = classicCelebrations[card.localId.slice(-3)];
      if (scan) card.image = `https://images.pokemontcg.io/cel25c/${scan}.png`;
    }
    const primary = await check(card.image);
    let fallback = { status: null, error: '' };
    let fallbackUrl = '';
    if (primary.status !== 200) {
      for (const url of fallbackCandidates(card)) {
        const result = await check(url);
        if (result.status === 200) {
          fallback = result;
          fallbackUrl = url;
          break;
        }
        fallback = result;
      }
    }
    results[index] = { card, primary, fallback, fallbackUrl };
    completed += 1;
    if (completed % 1000 === 0 || completed === catalog.cards.length) {
      console.log(`Images vérifiées : ${completed}/${catalog.cards.length}`);
    }
  }
}

console.log(`Vérification des scans : ${catalog.cards.length} cartes, ${catalog.setCount} extensions.`);
for (const card of catalog.cards) {
  if (card.setId === 'cel25cc' && card.localId.startsWith('CC')) {
    const scan = classicCelebrations[card.localId.slice(-3)];
    if (scan) card.image = `https://images.pokemontcg.io/cel25c/${scan}.png`;
  }
}
await fs.writeFile(path.join(root, 'public/pokemon-tcg-catalog.json'), JSON.stringify(catalog), 'utf8');
await Promise.all(Array.from({ length: workers }, runWorker));

const bySet = new Map();
for (const result of results) {
  const id = result.card.setId;
  if (!bySet.has(id)) bySet.set(id, []);
  bySet.get(id).push(result);
}
const setNames = new Map(catalog.sets.map(set => [set.id, set.name]));
const fallbackOk = results.filter(row => row.primary.status !== 200 && row.fallback.status === 200);
const missing = results.filter(row => row.primary.status !== 200 && row.fallback.status !== 200);
const primaryOk = results.filter(row => row.primary.status === 200);
const rows = [...bySet.entries()].sort((a, b) => (setNames.get(a[0]) || a[0]).localeCompare(setNames.get(b[0]) || b[0], 'fr'));
const report = [
  '# Audit des visuels Pokémon',
  '',
  `Contrôle du ${new Date().toISOString()} : **${results.length.toLocaleString('fr-FR')} cartes** dans **${bySet.size} extensions**.`,
  'Les scans sont testés par requête HTTP HEAD. Une carte est disponible si son image principale ou au moins une source de repli (autre langue TCGdex ou CDN Pokémon TCG) renvoie HTTP 200.',
  '',
  `- Images principales accessibles : **${primaryOk.length.toLocaleString('fr-FR')}**`,
  `- Repli utilisé avec succès : **${fallbackOk.length.toLocaleString('fr-FR')}**`,
  `- Images absentes ou liens en échec : **${missing.length.toLocaleString('fr-FR')}**`,
  '',
  '## Résultat par extension',
  '',
  '| Extension | Cartes | Principal OK | Repli OK | Introuvables |',
  '|---|---:|---:|---:|---:|',
];
for (const [id, cards] of rows) {
  const main = cards.filter(row => row.primary.status === 200).length;
  const backup = cards.filter(row => row.primary.status !== 200 && row.fallback.status === 200).length;
  const absent = cards.filter(row => row.primary.status !== 200 && row.fallback.status !== 200).length;
  report.push(`| ${setNames.get(id) || id} (${id}) | ${cards.length} | ${main} | ${backup} | ${absent} |`);
}
report.push('', '## Cartes sans image disponible', '');
if (missing.length) {
  for (const { card, primary, fallback } of missing) {
    report.push(`- **${card.setName} · ${card.localId} — ${card.name}** (${card.id}) : principal ${primary.status ?? primary.error}, dernier repli ${fallback.status ?? (fallback.error || 'absent')}.`);
  }
} else {
  report.push('Aucune : toutes les extensions ont un visuel principal ou un repli accessible.');
}
await fs.writeFile(path.join(root, 'docs/AUDIT-POKEMON-IMAGES.md'), `${report.join('\n')}\n`, 'utf8');
console.log(`Audit terminé : ${missing.length} cartes sans image, ${fallbackOk.length} replis utilisés. Rapport docs/AUDIT-POKEMON-IMAGES.md`);
if (missing.length) process.exitCode = 1;
