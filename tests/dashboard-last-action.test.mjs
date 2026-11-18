import test from 'node:test';
import assert from 'node:assert/strict';
import {loadDashboardLastAction,saveDashboardLastAction} from '../src/dashboard-last-action.js';

function memoryStorage(){const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value))};}

test('la dernière destination se sauvegarde par jeu avec un libellé propre',()=>{
 const storage=memoryStorage();
 assert.deepEqual(saveDashboardLastAction(storage,'gi','farming','  Plan\n de farm  ',1234),{destination:'farming',label:'Plan de farm',savedAt:1234});
 assert.deepEqual(loadDashboardLastAction(storage,'gi'),{destination:'farming',label:'Plan de farm',savedAt:1234});
 assert.equal(loadDashboardLastAction(storage,'hsr'),null);
});

test('les liens inconnus et les données locales mal formées sont ignorés',()=>{
 const storage=memoryStorage();
 assert.equal(saveDashboardLastAction(storage,'gi','javascript:alert(1)','dangereux'),null);
 storage.setItem('astralis:studio:last-action:gi','{');
 assert.equal(loadDashboardLastAction(storage,'gi'),null);
 storage.setItem('astralis:studio:last-action:gi','{"destination":"events","label":"Événements","savedAt":1e999}');
 assert.equal(loadDashboardLastAction(storage,'gi').savedAt,0);
});
