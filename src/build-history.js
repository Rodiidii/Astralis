const HISTORY_KEY = 'astralis:gi:build-history:v1';
const PER_BUILD_LIMIT = 8;
const TOTAL_LIMIT = 80;

function readHistory() {
  try {
    const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeHistory(rows) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(rows.slice(0, TOTAL_LIMIT)));
}

function copyBuild(build) {
  const copy = structuredClone(build);
  delete copy.image;
  if (Array.isArray(copy.pieces)) copy.pieces = copy.pieces.map(piece => {
    if (!piece) return piece;
    const clean = { ...piece };
    delete clean.image;
    return clean;
  });
  return copy;
}

function safe(value) {
  return String(value ?? '—').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function summary(build, metadata = {}) {
  const pieces = ['Fleur', 'Plume', 'Sablier', 'Coupe', 'Couronne'];
  const fields = [
    ['Nom', build.name || 'Build principal'], ['Niveau', build.level || 90],
    ['Constellation', build.constellation || 'C0'], ['Arme', metadata.weaponName || build.weaponName || build.weapon || 'Aucune'],
    ['Niveau de l’arme', build.weaponLevelValue || build.weaponLevel || '—'],
    ['Raffinement', `R${build.weaponRefinement || 1}`], ['Set', metadata.setName || build.setName || build.set || 'Aucun'],
    ...(build.setMode === 'two-two' ? [['Second set', metadata.set2Name || build.set2Name || build.set2 || 'Aucun']] : []),
    ['Configuration', build.setMode === 'two-two' ? '2 + 2 pièces' : '4 pièces']
  ];
  for (let i = 0; i < 5; i++) {
    const piece = build.pieces?.[i] || {};
    const main = [piece.mainType, piece.mainValue].filter(Boolean).join(' ');
    const subs = [0, 1, 2, 3].map(n => [piece[`sub${n}Type`], piece[`sub${n}Value`]].filter(Boolean).join(' ')).filter(Boolean).join(' · ');
    fields.push([`${pieces[i]} · principale`, main || '—'], [`${pieces[i]} · sous-stats`, subs || '—']);
  }
  for (const [index, name] of ['PV', 'ATQ', 'DÉF', 'Maîtrise', 'Recharge', 'Taux CRIT', 'DGT CRIT', 'Bonus DGT'].entries()) {
    const value = build.stats?.[index];
    if (value !== '' && value != null) fields.push([`Stat · ${name}`, value]);
  }
  const calculated = metadata.calculated;
  if (calculated) for (const [key, label] of [['hp','PV calculés'],['atk','ATQ calculée'],['def','DÉF calculée'],['em','Maîtrise calculée'],['er','Recharge calculée'],['critRate','Taux CRIT calculé'],['critDmg','DGT CRIT calculés'],['dmgBonus','Bonus DGT calculé']]) {
    if (calculated[key] != null) fields.push([label, `${Number(calculated[key]).toLocaleString('fr-FR',{maximumFractionDigits:1})}${['er','critRate','critDmg','dmgBonus'].includes(key)?'%':''}`]);
  }
  return fields;
}

function diffRows(before, current, beforeMetadata, currentMetadata) {
  const now = new Map(summary(current, currentMetadata));
  const then = new Map(summary(before, beforeMetadata));
  const keys = [...new Set([...then.keys(), ...now.keys()])];
  const changed = keys.filter(key => String(then.get(key) ?? '—') !== String(now.get(key) ?? '—'));
  if (!changed.length) return '<p class="build-history-same">Identique au build actuel.</p>';
  return `<ul class="build-history-diff">${changed.map(key => `<li><b>${safe(key)}</b><span>${safe(then.get(key) ?? '—')}</span><i>→</i><span>${safe(now.get(key) ?? '—')}</span></li>`).join('')}</ul>`;
}

export function createBuildSnapshot(build, metadata = {}) {
  if (!build?.id) return false;
  const rows = readHistory();
  rows.unshift({ id: crypto.randomUUID(), buildId: build.id, character: build.character, savedAt: new Date().toISOString(), build: copyBuild(build), metadata: structuredClone(metadata) });
  const kept = [];
  let forBuild = 0;
  for (const row of rows) {
    if (row.buildId === build.id && forBuild++ >= PER_BUILD_LIMIT) continue;
    kept.push(row);
  }
  writeHistory(kept);
  return true;
}

export function restoreBuildSnapshot(buildId, snapshotId, currentBuild) {
  const row = readHistory().find(item => item.buildId === buildId && item.id === snapshotId);
  if (!row?.build || !currentBuild) return null;
  const restored = structuredClone(row.build);
  restored.id = currentBuild.id;
  restored.character = currentBuild.character;
  if (currentBuild.image) restored.image = currentBuild.image;
  restored.pieces = Array.from({ length: Math.max(5, restored.pieces?.length || 0, currentBuild.pieces?.length || 0) }, (_, index) => ({ ...(restored.pieces?.[index] || {}), ...(currentBuild.pieces?.[index]?.image ? { image: currentBuild.pieces[index].image } : {}) }));
  return restored;
}

export function deleteBuildHistory(buildId) {
  const rows = readHistory().filter(row => row.buildId !== buildId);
  writeHistory(rows);
}

export function renderBuildHistory(build, metadata = {}) {
  if (!build?.id) return '';
  const rows = readHistory().filter(row => row.buildId === build.id);
  const body = rows.length ? rows.map(row => {
    const date = new Date(row.savedAt);
    const label = Number.isNaN(date.valueOf()) ? 'Instantané enregistré' : date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
    return `<article class="build-history-entry"><div><b>${safe(row.build?.name || 'Build')}</b><small>${safe(label)}</small></div><details><summary>Comparer au build actuel</summary>${diffRows(row.build || {}, build, row.metadata || {}, metadata)}</details><button data-action="build-history-restore" data-history-id="${safe(row.id)}">Restaurer</button></article>`;
  }).join('') : '<p class="build-history-empty">Aucun point de restauration. Enregistre un instantané avant un changement important.</p>';
  return `<section class="build-history"><header><div><span class="eyebrow">VERSIONS LOCALES · 8 MAXIMUM</span><h3>Historique du build</h3><p>Garde des repères avant de modifier tes pièces, ton arme ou tes statistiques.</p></div><button class="button-primary" data-action="build-history-snapshot">＋ Créer un instantané</button></header><div class="build-history-list">${body}</div></section>`;
}
