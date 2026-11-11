
import test from 'node:test';
import assert from 'node:assert/strict';
import {craftDeficits,periodIncome,orderedGuarantees} from '../src/planning-rules.js';
test('le surplus est converti vers les tiers supérieurs après réservation du besoin',()=>{
 assert.deepEqual(craftDeficits([9,63,114],[18,66,112]).missing,[0,0,0]);
 assert.deepEqual(craftDeficits([3,0,1],[9,0,0]).missing,[0,0,1]);
});
test('les échéances suivent la période et les dates réelles',()=>{
 const result=periodIncome({start:'2026-11-04',end:'2026-11-04',welkin:true});
 assert.equal(result.primos,790);assert.equal(result.wishes,2);assert.equal(result.patches,1);
 const day=periodIncome({start:'2026-11-22',end:'2026-11-22'});
 assert.equal(day.primos,1060);
 assert.equal(periodIncome({start:'2026-11-04',end:'2026-11-03'}).primos,0);
});
test('les objectifs consomment une seule fois la pity initiale',()=>{
 const rows=orderedGuarantees([{name:'A',copies:1},{name:'B',copies:1}],{characterPity:30,characterGuarantee:true,wishes:60});
 assert.equal(rows[0].wishes,60);assert.equal(rows[0].missing,0);
 assert.equal(rows[1].wishes,180);assert.equal(rows[1].missingPrimos,28800);
});

test('le déficit de garantie conserve les primogemmes restantes sous 160',()=>{const [row]=orderedGuarantees([{copies:1}],{characterPity:89,characterGuarantee:true,primos:159});assert.equal(row.missing,1);assert.equal(row.missingPrimos,1);});
