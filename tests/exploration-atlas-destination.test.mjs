import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExplorationCircuit, pickRandomDestination } from '../src/exploration-atlas.js';

const zones = [
  { id: 'montdstat', name: 'Mondstadt', progress: 20 },
  { id: 'liyue', name: 'Liyue', progress: 100 },
  { id: 'inazuma', name: 'Inazuma', progress: 75 },
];

test('le tirage ne propose que les zones inachevées et respecte son hasard', () => {
  assert.equal(pickRandomDestination(zones, () => 0).id, 'montdstat');
  assert.equal(pickRandomDestination(zones, () => 0.999).id, 'inazuma');
  assert.ok(pickRandomDestination(zones, () => 0.5).id !== 'liyue');
});

test('le tirage gère les atlas vides, terminés et les valeurs aléatoires invalides', () => {
  assert.equal(pickRandomDestination([], () => 0), null);
  assert.equal(pickRandomDestination([{ id: 'done', name: 'Zone terminée', progress: 100 }]), null);
  assert.equal(pickRandomDestination(zones, () => Number.NaN).id, 'montdstat');
  assert.equal(pickRandomDestination(null), null);
});

test('le circuit met les échéances en tête puis les zones actives et nouvelles',()=>{
 const zones=[
  {id:'new',name:'Nouvelle zone',progress:0},
  {id:'active-old',name:'Ancienne active',progress:40,updated:100},
  {id:'goal-late',name:'Cible future',progress:10,goal:80,goalDate:'2026-11-20'},
  {id:'done',name:'Terminée',progress:100},
  {id:'goal-past',name:'Cible en retard',progress:50,goal:90,goalDate:'2026-11-14'},
  {id:'active-new',name:'Active récente',progress:20,updated:200},
 ];
 const result=buildExplorationCircuit(zones,new Date('2026-11-15T12:00:00'),3);
 assert.deepEqual(result.map(row=>row.id),['goal-past','goal-late','active-new']);
 assert.equal(result[0].reason,'Échéance dépassée');
 assert.equal(buildExplorationCircuit([{id:'done',name:'Finie',progress:100}],Date.now()).length,0);
});
