import test from 'node:test';
import assert from 'node:assert/strict';
import {filterRelationList} from '../src/relations.js';

const characters=new Map([['a',{name:'Furina'}],['b',{name:'Neuvillette'}],['c',{name:'Navia'}]]);
const edges=[
 {a:'a',b:'b',weight:2,proofs:[{title:'Le procès',quote:'La vérité reviendra à la surface.',quest:'Acte final'}]},
 {a:'a',b:'c',weight:1,proofs:[{title:'À propos de Navia',quote:'Une amie courageuse.',lang:'fr'}]},
];

test('la liste relationnelle cherche sans casse ni accents dans les liens et preuves locales',()=>{
 assert.deepEqual(filterRelationList(edges,characters,'verite').map(edge=>edge.b),['b']);
 assert.deepEqual(filterRelationList(edges,characters,'NAVIA').map(edge=>edge.b),['c']);
 assert.equal(filterRelationList(edges,characters,'acte final').length,1);
 assert.equal(filterRelationList(edges,characters,'absent').length,0);
});

test('la recherche de preuves conserve le filtre de personnage et un terme vide montre tout',()=>{
 assert.deepEqual(filterRelationList(edges,characters,'', ['b']).map(edge=>edge.b),['b']);
 assert.equal(filterRelationList(edges,characters,'   ').length,2);
});
