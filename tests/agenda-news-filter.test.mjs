import test from 'node:test';
import assert from 'node:assert/strict';
import {filterNewsRows} from '../src/agenda-model.js';

const rows=[
 {id:'banner',title:'Bannière de test',description:'Personnage',category:'banner',feed:'Site officiel'},
 {id:'event',title:'Événement de test',description:'Récompenses',category:'event',feed:'HoYoLAB'},
 {id:'update',title:'Mise à jour',description:'Version',category:'update',feed:'Site officiel'},
];

test('les vues actualités combinent état lu, favoris, catégorie, source et recherche',()=>{
 assert.deepEqual(filterNewsRows(rows,{view:'unread',readKeys:['event']}).map(row=>row.id),['banner','update']);
 assert.deepEqual(filterNewsRows(rows,{view:'saved',savedKeys:['event','update'],source:'official'}).map(row=>row.id),['update']);
 assert.deepEqual(filterNewsRows(rows,{view:'unread',category:'banner',query:'personnage'}).map(row=>row.id),['banner']);
 assert.deepEqual(filterNewsRows(rows,{view:'saved',savedKeys:[]}),[]);
});
