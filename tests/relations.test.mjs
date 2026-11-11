import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { groupEvidence, isTravelerVariant, relationId, shortestRelationPath, spreadRing } from '../src/relations.js';

const data = JSON.parse(readFileSync(new URL('../data/relations.json', import.meta.url)));
const ids = new Set(data.evidence.flatMap(row => [row.from,row.to]));
test('le graphe contient des preuves sourcées et retrouve Amber → Jean', () => {
  const grouped = groupEvidence(data.evidence,ids);
  assert.ok(grouped.length > 300);
  const edge = grouped.find(e => [e.a,e.b].includes('10000021') && [e.a,e.b].includes('10000003'));
  assert.ok(edge?.proofs.some(p => p.from === '10000021' && p.to === '10000003' && p.lang === 'fr' && p.title.includes('Jean')));
  for (const row of data.evidence) {
    assert.ok(row.title && row.quote.trim() && row.id);
    assert.ok(row.source.includes(data.revision) || /^https:\/\/genshin-impact\.fandom\.com\/wiki\//.test(row.source));
    assert.notEqual(row.from,row.to);
  }
});
test('un lien sans citation ou avec une extrémité inconnue est écarté', () => {
  const row = data.evidence[0];
  assert.deepEqual(groupEvidence([{...row,quote:''},{...row,to:'inconnu'}],ids),[]);
});

test('le catalogue complet est réparti sur cinq pistes, avec un espace entre portraits', () => {
  const people = JSON.parse(readFileSync(new URL('../assets/data/gi-characters.json', import.meta.url)));
  const group = c => c.region || 'Non confirmé';
  people.sort((a,b)=>group(a).localeCompare(group(b))||a.name.localeCompare(b.name));
  const points = spreadRing(people,group,92*4.55);
  assert.equal(new Set(points.map(p=>Math.round(Math.hypot(p.x-500,p.y-500)))).size,5);
  for (const p of points) {
    assert.ok(p.angle > p.startAngle && p.angle < p.endAngle, p.c.name);
    assert.ok(p.boundary > 20, p.c.name);
  }
  for (const [i,p] of points.entries()) for (const q of points.slice(i+1)) {
    assert.ok(Math.hypot(p.x-q.x,p.y-q.y)>39, p.c.name+' / '+q.c.name);
  }
});

test('les données de Nod-Krai couvrent Flins, Aino et Nefer, avec scènes attribuées', () => {
  for (const id of ['10000120','10000121','10000122','10000119','10000124','10000127','10000130']) {
    assert.ok(data.evidence.some(row=>row.from===id && row.kind==='voice'),id);
  }
  const stories = data.evidence.filter(row=>row.kind==='story');
  assert.ok(stories.length > 200);
  assert.ok(stories.every(row=>row.quest && row.reply && row.source.includes('oldid=')));
});
test('le Voyageur rassemble les deux identifiants sans relation avec lui-même', () => {
  const [proof] = data.evidence;
  const merged = groupEvidence([
    {...proof,from:'10000007',to:'10000021'},
    {...proof,from:'10000007',to:'10000005'}
  ],new Set(['10000005','10000021']));
  assert.equal(merged.length,1);
  assert.equal(merged[0].proofs.length,1);
  assert.equal(merged[0].proofs[0].from,'10000005');
});

test('le chemin privilégie la relation directe, puis le plus petit nombre de sauts', () => {
  const edge = (a,b,weight=1) => ({a,b,weight});
  const links = [edge('a','b',9),edge('b','c'),edge('c','d'),edge('a','e'),edge('e','d')];
  assert.deepEqual(shortestRelationPath(links,'a','d'),['a','e','d']);
  assert.deepEqual(shortestRelationPath([...links,edge('a','d')],'a','d'),['a','d']);
  assert.deepEqual(shortestRelationPath(links,'a','absent'),[]);
});
test('les cinq figures demandées ont des preuves et une icône locale', () => {
  const figures = JSON.parse(readFileSync(new URL('../assets/data/gi-relation-lore.json',import.meta.url)));
  const extras = JSON.parse(readFileSync(new URL('../data/relations-official.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
  const evidence = [...data.evidence,...extras];
  for(const id of ['alice','dottore','dainsleif','capitano','ronova']){
    const figure=figures.find(row=>row.id===id);
    assert.ok(readFileSync(new URL('../'+figure.portrait,import.meta.url)).length > 100);
    assert.ok(evidence.some(row=>row.from===id||row.to===id),id);
  }
});

test('toutes les variantes élémentaires convergent vers le Voyageur', () => {
  for (const id of ['10000005-pyro','10000007-cryo','10000007-dendro','traveler-anemo','lumine_hydro']) {
    assert.equal(relationId(id),'10000005');
    assert.ok(isTravelerVariant({id}));
  }
  assert.ok(isTravelerVariant({id:'ancienne-entree',images:{filename_icon:'UI_AvatarIcon_PlayerGirl'}}));
  assert.ok(!isTravelerVariant({id:'10000125',_name:'Columbina'}));
});
test('les titres de Neuvillette et les répliques de Snezhnaya créent des liens attestés', () => {
  for (const target of ['10000022','10000030','10000052','10000073','10000106']) {
    assert.ok(data.evidence.some(row=>row.from==='10000087'&&row.to===target&&row.kind==='voice'),target);
  }
  for (const actor of ['10000133','10000136','10000137','10000140','10000143','10000148','10000150']) {
    assert.ok(data.evidence.some(row=>row.from===actor&&row.kind==='voice'),actor);
  }
  assert.ok(data.evidence.some(row=>row.from==='10000136'&&row.to==='danica'&&row.kind==='voice'));
});
