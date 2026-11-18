import test from 'node:test';
import assert from 'node:assert/strict';
import { sortFavoriteRecords } from '../src/favorite-sort.js';
const rows=[{_name:'Zhongli',rarity:5,element:'Geo'},{_name:'Amber',rarity:4,element:'Pyro'},{_name:'Albedo',rarity:5,element:'Geo'}];
test('les favoris se trient sans altérer la liste enregistrée',()=>{
 assert.deepEqual(sortFavoriteRecords(rows,'name').map(x=>x._name),['Albedo','Amber','Zhongli']);
 assert.deepEqual(sortFavoriteRecords(rows,'rarity').map(x=>x._name),['Albedo','Zhongli','Amber']);
 assert.deepEqual(sortFavoriteRecords(rows,'element').map(x=>x._name),['Albedo','Zhongli','Amber']);
 assert.deepEqual(sortFavoriteRecords(rows).map(x=>x._name),['Zhongli','Amber','Albedo']);
 assert.deepEqual(rows.map(x=>x._name),['Zhongli','Amber','Albedo']);
});
