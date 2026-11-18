import test from 'node:test';
import assert from 'node:assert/strict';
import {artifactQuickScore,sortArtifactInventory} from '../src/artifact-inventory-sort.js';

test('tri indicatif privilégie les sous-stats offensives, sans modifier l’inventaire',()=>{
 const rows=[{id:'flat',level:20,rarity:5,mainType:'atkPct',mainValue:46.6,substats:[{type:'hpFlat',value:508}]},{id:'crit',level:16,rarity:5,mainType:'atkPct',mainValue:46.6,substats:[{type:'critRate',value:10.5},{type:'critDmg',value:21}]}];
 assert.ok(artifactQuickScore(rows[1])>artifactQuickScore(rows[0]));
 assert.deepEqual(sortArtifactInventory(rows,'score').map(row=>row.id),['crit','flat']);
 assert.deepEqual(sortArtifactInventory(rows,'level').map(row=>row.id),['flat','crit']);
 assert.deepEqual(sortArtifactInventory(rows,'import').map(row=>row.id),['flat','crit']);
 assert.deepEqual(rows.map(row=>row.id),['flat','crit']);
});
