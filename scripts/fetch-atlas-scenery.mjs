import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ATLAS_CONTENT } from '../src/exploration-atlas-worlds.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'assets/exploration-atlas/photos');
const WIKIS = {
  gi: 'https://genshin-impact.fandom.com',
  hsr: 'https://honkai-star-rail.fandom.com',
  ww: 'https://wutheringwaves.fandom.com',
};
const CLIENT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36';
const API_UA = 'Astralis personal exploration atlas image catalog';
const slug = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const TITLE_OVERRIDES = {
  gi: { 'mer-des-temps-revolus': 'Sea of Bygone Eras', vanarana: 'Vanarana (Area)' },
  hsr: { 'plaines-enneigees-peripheriques': 'Outlying Snow Plains', 'passe-de-l-arriere-eau': 'Backwater Pass', 'bourgade-de-rivet': 'Rivet Town' },
  ww: { 'archipel-du-rivage-noir': 'The Black Shores', 'mer-de-flammes': 'Sea of Flames', 'havre-consacre': 'Sanctuary of Faith', 'installations-enfouies': "Tethys' Deep", 'abime-de-fangspire': 'Fangspire Chasm', 'crete-silencieuse': 'Silent Crag', 'landes-de-norfall': 'Norfall Barrens', 'hauts-plateaux-de-rebirth': 'Rebirth Uplands', 'cours-de-la-stagnation': 'Stagnant Run' },
};
const DIRECT_SCENES = {
  'hsr:jarilo-vi:passe-de-l-arriere-eau': { articleTitle: 'Backwater Pass', file: 'Area_Backwater_Pass.png', url: 'https://static.wikia.nocookie.net/houkai-star-rail/images/a/a1/Area_Backwater_Pass.png/revision/latest/scale-to-width-down/640?cb=20250418070703' },
  'ww:lahai-roi:cours-de-la-stagnation': { articleTitle: 'Stagnant Run', file: 'Stagnant_Run.png', url: 'https://static.wikia.nocookie.net/wutheringwaves/images/e/e6/Stagnant_Run.png/revision/latest/scale-to-width-down/640?cb=20260108182444' },
  'ww:roya-frostlands:cours-de-la-stagnation': { articleTitle: 'Stagnant Run', file: 'Stagnant_Run.png', url: 'https://static.wikia.nocookie.net/wutheringwaves/images/e/e6/Stagnant_Run.png/revision/latest/scale-to-width-down/640?cb=20260108182444' },
};

async function api(game, params) {
  const url = new URL('/api.php', WIKIS[game]);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, { headers: { 'User-Agent': API_UA } });
    if (response.ok) return response.json();
    if (response.status !== 429 && response.status < 500) throw new Error(`API ${response.status}`);
    await wait(350 * (attempt + 1));
  }
  throw new Error('API rate limit');
}

function imageLooksLikeScene(url) {
  const filename = decodeURIComponent(String(url).split('?')[0].split('/revision/')[0].split('/').at(-1) || '').toLowerCase();
  return /\.(png|jpe?g|webp|avif)$/.test(filename) && !/(?:^|[ _.-])(map|floor|emblem|icon|logo|badge|sprite|portrait|avatar|chest|element|talent|weapon|character)(?:[ _.-]|$)/.test(filename);
}

function imageScore(fileTitle, articleTitle, game) {
  const filename = fileTitle.replace(/^File:/, '').replace(/\.[a-z0-9]+$/i, '').replace(/[_-]/g, ' ').toLowerCase();
  if (/(?:^| )(map|floor|emblem|icon|logo|badge|sprite|portrait|avatar|chest|element|talent|weapon|character)(?: |$)/.test(filename)) return -100;
  const subject = articleTitle.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(word => word.length > 2 && !['the', 'and', 'area', 'region', 'world', 'location', 'district', 'zone'].includes(word));
  const matched = subject.filter(word => filename.includes(word)).length;
  let score = matched * 8;
  if (filename.includes(articleTitle.toLowerCase().replace(/[_-]/g, ' '))) score += 35;
  if (game === 'hsr' && filename.startsWith('area ')) score += 24;
  if (filename.includes('key art')) score += 18;
  if (filename.includes('screenshot') || filename.includes('scene')) score += 16;
  if (/(jpg|jpeg|webp)$/.test(fileTitle)) score += 3;
  return matched ? score : -1;
}

async function findScene(game, subject, parentName, kind) {
  const directScene = DIRECT_SCENES[`${game}:${slug(parentName)}:${slug(subject)}`];
  if (directScene) return saveCandidate(game, directScene.articleTitle, { url: directScene.url, title: directScene.file });
  let articleTitle = TITLE_OVERRIDES[game]?.[slug(subject)] || '';
  if (!articleTitle) {
    const searchTerms = [subject, `${subject} ${parentName}`];
    for (const term of searchTerms) {
      const result = await api(game, { action: 'query', list: 'search', srsearch: term, srlimit: '6', format: 'json' });
      const rows = result?.query?.search || [];
      if (rows.length) {
        const exact = rows.find(row => row.title.toLocaleLowerCase('en') === subject.toLocaleLowerCase('en'));
        articleTitle = (exact || rows[0]).title;
        break;
      }
    }
  }
  if (!articleTitle) return null;

  const pageResult = await api(game, { action: 'query', titles: articleTitle, prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '720', format: 'json' });
  const page = Object.values(pageResult?.query?.pages || {})[0];
  const direct = page?.thumbnail?.source?.replace(/\/scale-to-width-down\/\d+(?=\?)/, '/scale-to-width-down/720');
  const candidates = [];
  if (direct && imageLooksLikeScene(direct)) candidates.push({ url: direct, title: decodeURIComponent(direct.split('?')[0].split('/').at(-1) || '') });

  if (!candidates.length) {
    const gallery = await api(game, { action: 'query', titles: articleTitle, prop: 'images', imlimit: '500', format: 'json' });
    const imageTitles = Object.values(gallery?.query?.pages || {}).flatMap(item => item.images || []).map(item => item.title);
    const ranked = imageTitles.map(title => ({ title, score: imageScore(title, articleTitle, game) })).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 24);
    if (ranked.length) {
      const files = ranked.map(item => item.title).join('|');
      const info = await api(game, { action: 'query', titles: files, prop: 'imageinfo', iiprop: 'url', iiurlwidth: '720', format: 'json' });
      for (const item of Object.values(info?.query?.pages || {})) {
        const image = item.imageinfo?.[0]?.thumburl || item.imageinfo?.[0]?.url;
        if (image) candidates.push({ url: image, title: item.title.replace(/^File:/, '') });
      }
      candidates.sort((a, b) => imageScore(b.title, articleTitle, game) - imageScore(a.title, articleTitle, game));
    }
  }

  for (const candidate of candidates) {
    const saved = await saveCandidate(game, articleTitle, candidate);
    if (saved) return saved;
  }
  return { articleTitle, articleUrl: `${WIKIS[game]}/wiki/${encodeURIComponent(articleTitle.replaceAll(' ', '_'))}`, missing: true };
}

async function saveCandidate(game, articleTitle, candidate) {
  try {
    const response = await fetch(candidate.url, { headers: { 'User-Agent': CLIENT_UA, Referer: `${WIKIS[game]}/wiki/${encodeURIComponent(articleTitle.replaceAll(' ', '_'))}` } });
    if (!response.ok || !String(response.headers.get('content-type') || '').startsWith('image/')) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength < 5000) return null;
    const contentType = response.headers.get('content-type') || '';
    const extension = contentType.includes('webp') ? 'webp' : contentType.includes('jpeg') ? 'jpg' : contentType.includes('avif') ? 'avif' : 'png';
    const hash = createHash('sha1').update(candidate.url).digest('hex').slice(0, 14);
    const relativePath = `assets/exploration-atlas/photos/${game}/${hash}.${extension}`;
    await mkdir(path.dirname(path.join(ROOT, relativePath)), { recursive: true });
    await writeFile(path.join(ROOT, relativePath), bytes);
    return { path: relativePath, articleTitle, articleUrl: `${WIKIS[game]}/wiki/${encodeURIComponent(articleTitle.replaceAll(' ', '_'))}`, imageUrl: candidate.url, file: candidate.title };
  } catch {
    return null;
  }
}

const targets = [];
for (const [game, regions] of Object.entries(ATLAS_CONTENT)) {
  for (const region of regions) {
    targets.push({ game, regionName: region.name, subject: region.name, key: `${game}:${slug(region.name)}`, kind: 'region' });
    for (const place of region.places || []) {
      targets.push({ game, regionName: region.name, subject: place.name, key: `${game}:${slug(region.name)}:${slug(place.name)}`, kind: 'subregion' });
    }
  }
}

const scenes = {};
const sources = [];
let previousSources = [];
try { previousSources = JSON.parse(await readFile(path.join(ROOT, 'assets/exploration-atlas/photo-sources.json'), 'utf8')); } catch {}
const previousByKey = new Map(previousSources.map(item => [item.key, item]));
let cursor = 0;
let resolved = 0;
const workerCount = 7;
await Promise.all(Array.from({ length: workerCount }, async () => {
  while (cursor < targets.length) {
    const target = targets[cursor++];
    const previous = previousByKey.get(target.key);
    if (previous?.path && !previous.missing && !DIRECT_SCENES[target.key]) {
      try {
        await access(path.join(ROOT, previous.path));
        scenes[target.key] = previous.path;
        sources.push(previous);
        resolved++;
        if (resolved && resolved % 20 === 0) process.stdout.write(`Visuels importés : ${resolved} · ${cursor}/${targets.length}\n`);
        continue;
      } catch {}
    }
    try {
      const scene = await findScene(target.game, target.subject, target.regionName, target.kind);
      if (scene?.path) {
        scenes[target.key] = scene.path;
        sources.push({ ...target, ...scene });
        resolved++;
      } else sources.push({ ...target, ...(scene || {}), missing: true });
    } catch (error) {
      sources.push({ ...target, missing: true, error: String(error?.message || error) });
    }
    if (resolved && resolved % 20 === 0) process.stdout.write(`Visuels importés : ${resolved} · ${cursor}/${targets.length}\n`);
  }
}));

const sceneSources = Object.fromEntries(sources.filter(item => item.path).map(item => [item.key, item.articleUrl]));
await writeFile(path.join(ROOT, 'src/exploration-atlas-photos.js'), `export const ATLAS_PHOTOS = ${JSON.stringify(scenes, null, 2)};\nexport const ATLAS_PHOTO_SOURCES = ${JSON.stringify(sceneSources, null, 2)};\n`);
await writeFile(path.join(ROOT, 'assets/exploration-atlas/photo-sources.json'), JSON.stringify(sources, null, 2) + '\n');
const regions = sources.filter(item => item.kind === 'region');
const subregions = sources.filter(item => item.kind === 'subregion');
console.log(`Visuels régionaux : ${regions.filter(item => item.path).length}/${regions.length}`);
console.log(`Visuels de sous-région : ${subregions.filter(item => item.path).length}/${subregions.length}`);
console.log(`Sans photo exploitable : ${sources.filter(item => item.missing).length}`);
