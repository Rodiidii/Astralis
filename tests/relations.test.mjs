import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { groupEvidence, isTravelerVariant, relationId, relationRegionCoverage, nearestRelationNeighbor, closestRelationLeads, widenRelationCompareSettings, relationProofBalance, shortestRelationPath, shortestRelationPaths, spreadRing } from '../src/relations.js';

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

test('la couverture régionale distingue profils reliés et profils sans preuve locale',()=>{
 const people=[{id:'a',region:'Liyue'},{id:'b',region:'Liyue'},{id:'c',region:'Mondstadt'}];
 const result=relationRegionCoverage(people,[
  {a:'a',b:'c',proofs:[{kind:'voice'}]},
  {a:'a',b:'c',proofs:[{kind:'story'}]},
 ]);
 assert.deepEqual(result,[
  {region:'Mondstadt',total:1,linked:1,isolated:0,voiceLinked:1,storyLinked:1,bothSources:1,percent:100},
  {region:'Liyue',total:2,linked:1,isolated:1,voiceLinked:1,storyLinked:1,bothSources:1,percent:50},
 ]);
});

test('le réseau trouve le portrait visible le plus proche dans une direction clavier',()=>{
 const points=new Map([
  ['a',{c:{id:'a'},x:50,y:50}],['b',{c:{id:'b'},x:80,y:53}],['c',{c:{id:'c'},x:54,y:83}],
  ['d',{c:{id:'d'},x:20,y:50}],['e',{c:{id:'e'},x:48,y:22}],
 ]);
 assert.equal(nearestRelationNeighbor(points,'a','ArrowRight'),'b');
 assert.equal(nearestRelationNeighbor(points,'a','ArrowDown'),'c');
 assert.equal(nearestRelationNeighbor(points,'a','ArrowLeft'),'d');
 assert.equal(nearestRelationNeighbor(points,'a','ArrowUp'),'e');
 assert.equal(nearestRelationNeighbor(points,'missing','ArrowRight'),'');
 assert.equal(nearestRelationNeighbor(points,'a','Enter'),'');
});

test('les pistes proches proposent le meilleur lien adjacent sans relier artificiellement le duo',()=>{
 const weak={a:'a',b:'c',weight:1,proofs:[{kind:'voice',relationType:'colleague'}]};
 const strong={a:'a',b:'d',weight:4,proofs:[{kind:'story',explicitRelation:true,relationType:'family'}]};
 const other={a:'b',b:'e',weight:3,proofs:[{kind:'story',explicitRelation:true,relationType:'family'}]};
 const leads=closestRelationLeads([weak,strong,other],[ 'a','b' ]);
 assert.deepEqual(leads.map(row=>[row.from,row.to]),[['a','d'],['b','e']]);
 assert.equal(closestRelationLeads([weak],[ 'a','b' ]).length,1);
 assert.deepEqual(closestRelationLeads([],['a','b']),[]);
});

test('élargir le comparatif enlève les filtres de réseau sans modifier thème, langue ni spoilers',()=>{
 const widened=widenRelationCompareSettings({region:'Liyue',regions:['Liyue'],element:'Pyro',version:'5.0',owned:true,npc:false,source:'voice',direction:'out',min:3,theme:'light',lang:'fr',spoilers:true});
 assert.equal(widened.region,'');assert.deepEqual(widened.regions,[]);assert.equal(widened.element,'');assert.equal(widened.version,'');
 assert.equal(widened.owned,false);assert.equal(widened.npc,true);assert.equal(widened.source,'all');assert.equal(widened.direction,'all');assert.equal(widened.min,1);
 assert.equal(widened.theme,'light');assert.equal(widened.lang,'fr');assert.equal(widened.spoilers,true);
});

test('le résumé d’un duo sépare les voix par sens, les échanges communs et les scènes uniques',()=>{
 const proofs=[
  {id:'v1',kind:'voice',from:'a',to:'b'}, {id:'v1',kind:'voice',from:'a',to:'b',lang:'fr'},
  {id:'v2',kind:'voice',from:'b',to:'a'}, {id:'v3',kind:'voice',from:'paimon',to:'a',scope:'collective'},
  {id:'s1',kind:'story'}, {id:'s1',kind:'story',lang:'en'}, {id:'s2',kind:'story'}
 ];
 assert.deepEqual(relationProofBalance(proofs,'a','b'),{voiceAB:1,voiceBA:1,voiceMutual:0,storyScenes:2});
 assert.deepEqual(relationProofBalance([], 'a','b'),{voiceAB:0,voiceBA:0,voiceMutual:0,storyScenes:0});
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
test('les autres itinéraires exposent les chemins de même longueur, classés par preuves et plafonnés',()=>{
 const edge=(a,b,weight=1)=>({a,b,weight});
 const links=[edge('a','x',1),edge('x','z',1),edge('a','y',8),edge('y','z',7),edge('a','b'),edge('b','c'),edge('c','z')];
 assert.deepEqual(shortestRelationPaths(links,'a','z'),[['a','y','z'],['a','x','z']]);
 assert.deepEqual(shortestRelationPaths(links,'a','z',1),[['a','y','z']]);
 assert.deepEqual(shortestRelationPaths(links,'missing','z'),[]);
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
