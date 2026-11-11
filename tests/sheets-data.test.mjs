import test from 'node:test';
import assert from 'node:assert/strict';
import {shares} from '../src/sheets/common.js';
import {sheetSeed,sheetElement,adaptSheetData} from '../src/sheet-renderer.js';
import {parseLabConfiguration} from '../src/lab-import-config.js';

test('les parts arrondies somment à 100 sans parts négatives',()=>{
 for(const data of [[1,1,1],[100,1,3,9],[110,-10,0,0],[Infinity,20,30,NaN]]){
  const values=shares(data);assert.equal(Math.round(values.reduce((a,b)=>a+b,0)*10),1000);
  assert.ok(values.every(n=>Number.isFinite(n)&&n>=0&&n<=100));
 }
 assert.deepEqual(shares([null,0,undefined]),[0,0,0]);
});
test('le fond reste déterministe et les éléments français sont normalisés',()=>{
 assert.equal(sheetSeed('Équipe personnelle'),sheetSeed('Équipe personnelle'));
 assert.notEqual(sheetSeed('Équipe personnelle'),sheetSeed('Une autre équipe'));
 assert.equal(sheetElement('Électro'),'electro');assert.equal(sheetElement('Géo'),'geo');
});
test('une fiche native conserve ses données et ses valeurs inconnues',()=>{
 const data={name:'Alhaitham',stats:{hp:null},materials:[]};
 assert.equal(adaptSheetData('build',data),data);
 assert.equal(adaptSheetData('build',{title:'Fiche',sheetModel:data}).stats.hp,null);
});
test('les équipes natives et les anciens exports GO restent importables',()=>{
 const original={format:'astralis-team',name:'Mon équipe',team:{members:[{character:'10000005'}]}};
 assert.equal(parseLabConfiguration(JSON.stringify(original)).kind,'astralis-team');
 assert.equal(parseLabConfiguration(JSON.stringify({name:'GO',loadoutData:[{key:'Mualani'}]})).kind,'team');
 assert.throws(()=>parseLabConfiguration(JSON.stringify({...original,team:{members:[]}})));
});
