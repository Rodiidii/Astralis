import test from 'node:test';
import assert from 'node:assert/strict';
import {wishBalance,addWishGains,challengeTeam} from '../src/dashboard-features.js';
test('les vœux disponibles sont les vœux du compte plus les primos divisées par 160, arrondies au sol',()=>{
 assert.deepEqual(wishBalance({wishes:12,currentPrimos:3526}),{wishes:12,primos:3526,convertible:22,total:34});
 assert.equal(wishBalance({wishes:2,currentPrimos:159}).total,2);
 assert.equal(wishBalance({wishes:2,currentPrimos:160}).total,3);
 assert.equal(wishBalance({wishes:2,currentPrimos:0,primos:500}).total,2);
});
test('les gains ajoutent des ressources sans convertir ni supprimer les soldes existants',()=>{
 const before={wishes:12,primos:3526,currentPrimos:3526,characterPity:47};
 const after=addWishGains(before,160,2,'2026-11-10');
 assert.equal(after.wishes,14);assert.equal(after.currentPrimos,3686);assert.equal(after.primos,3686);assert.equal(after.characterPity,47);
 assert.equal(after.gainLog[0].primos,160);assert.equal(after.gainLog[0].wishes,2);assert.equal(before.wishes,12);
});
test('Daily Challenge utilise tous les personnages sans sélection et seulement ceux cochés sinon',()=>{
 const people=Array.from({length:8},(_,i)=>({id:String(i)}));
 const all=challengeTeam(people,[],()=>.3);assert.equal(all.length,4);assert.equal(new Set(all.map(p=>p.id)).size,4);assert.equal(people.length,8);
 const selected=challengeTeam(people,['1','3'],()=>.3);assert.deepEqual(new Set(selected.map(p=>p.id)),new Set(['1','3']));
});
