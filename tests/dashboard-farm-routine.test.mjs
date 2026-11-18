import test from 'node:test';
import assert from 'node:assert/strict';
import {buildFarmRoutine} from '../src/dashboard-farm-routine.js';

const today='2026-11-15';
const people=[
 {id:'furina',sourceId:'1001',name:'Furina',image:'furina.webp'},
 {id:'nahida',sourceId:'1002',name:'Nahida',image:'nahida.webp'},
];

test('la checklist prend le prochain jour du plan et suit chaque personnage séparément',()=>{
 const result=buildFarmRoutine([
  {id:'past',date:'2026-11-14',title:'Ancienne session',characterId:'furina'},
  {id:'today',date:today,title:'Livres et boss hebdomadaire',characterIds:['1001','nahida'],doneCharacters:['1001']},
  {id:'today-mora',date:today,title:'Mora',done:false},
  {id:'tomorrow',date:'2026-11-16',title:'Artéfacts'},
 ],people,today);
 assert.equal(result.date,today);
 assert.equal(result.sourceCount,2);
 assert.equal(result.total,3);
 assert.equal(result.completed,1);
 assert.deepEqual(result.steps.map(step=>[step.characterName,step.done]),[['Furina',true],['Nahida',false],['',false]]);
 assert.equal(result.steps[1].characterImage,'nahida.webp');
});

test('quand le jour courant est terminé, le panneau passe au prochain jour ouvert',()=>{
 const result=buildFarmRoutine([
  {id:'done',date:today,title:'Terminé',done:true},
  {id:'next',date:'2026-11-16',title:'Donjon',characterId:'1002'},
 ],people,today);
 assert.equal(result.date,'2026-11-16');
 assert.equal(result.steps[0].characterName,'Nahida');
});

test('les éléments déjà cochés restent visibles et une journée entièrement faite affiche 100 %',()=>{
 const result=buildFarmRoutine([{id:'done',date:today,title:'Mora',done:true}],people,today);
 assert.equal(result.total,1);
 assert.equal(result.completed,1);
 assert.equal(result.steps[0].done,true);
});

test('un plan vide retourne une checklist vide sans date inventée',()=>{
 assert.deepEqual(buildFarmRoutine([],people,today),{date:'',steps:[],sourceCount:0,completed:0,total:0});
});
