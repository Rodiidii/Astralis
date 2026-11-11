import test from 'node:test';
import assert from 'node:assert/strict';
import {farmSessionPresentation} from '../src/farm-calendar.js';
const materials=[{id:100001,name:'Fleur',typeText:'Produit de Mondstadt'},{id:104319,name:'Couronne de la sagesse'},{id:113055,name:'Œil de tourbillon',sources:['Narval (Niv.70+)']},{id:104303,name:'Philosophies',typeText:'Matériau d’aptitude de personnage'}];
test('EXP et artéfacts gardent leur icône même avec un supplément hebdomadaire',()=>{
 for(const kind of ['xp','artifact']){const view=farmSessionPresentation({kind,materialIds:[113055],characterIds:['10000089']},materials,[{id:10000089,_id:'furina'}]);assert.equal(view.generic,true);assert.equal(view.kind,kind);assert.equal(view.items[0].id,113055);assert.equal(view.people[0]._id,'furina');}
});
test('spécialités et couronnes ne deviennent jamais des icônes de sessions à résine',()=>{
 const view=farmSessionPresentation({kind:'talent',materialIds:[100001,104319,104303,104303,999]},materials);assert.deepEqual(view.items.map(x=>x.id),[104303]);assert.equal(view.generic,false);
});
test('une session manuelle conserve sa nature et ses personnages',()=>{
 const view=farmSessionPresentation({farmType:'Livres d’aptitudes',characterId:'furina'},materials,[{id:10000089,_id:'furina'}]);assert.equal(view.kind,'talent');assert.equal(view.generic,true);assert.equal(view.people.length,1);
});
