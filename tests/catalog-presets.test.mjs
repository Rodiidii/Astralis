import test from 'node:test';
import assert from 'node:assert/strict';
import {deleteCatalogPreset,normalizeCatalogPreset,readCatalogPresets,saveCatalogPreset} from '../src/catalog-presets.js';

class MemoryStorage{data=new Map();getItem(key){return this.data.get(key)||null}setItem(key,value){this.data.set(key,String(value))}}

test('un filtre sauvegardé restaure les réglages normalisés et reste isolé par bibliothèque',()=>{
 const storage=new MemoryStorage(),saved=saveCatalogPreset(storage,'gi:characters','Hydro possédés',{query:'Furina',element:'Hydro',weaponType:'sword',rarity:'5',ownedOnly:true,order:'name',view:'list'},()=> 'p1');
 assert.equal(saved.id,'p1');assert.equal(readCatalogPresets(storage,'gi:characters')[0].filters.query,'Furina');assert.equal(readCatalogPresets(storage,'gi:weapons').length,0);
 assert.deepEqual(normalizeCatalogPreset({rarity:'99',order:'bad',view:'cards'}),{query:'',element:'all',weaponType:'all',rarity:'all',ownedOnly:false,order:'release',view:'grid'});
});

test('un nom identique remplace le preset et la suppression est propre',()=>{
 const storage=new MemoryStorage();saveCatalogPreset(storage,'gi:sets','Sets favoris',{ownedOnly:true},()=> 'a');saveCatalogPreset(storage,'gi:sets','Sets favoris',{rarity:'5'},()=> 'b');
 const rows=readCatalogPresets(storage,'gi:sets');assert.equal(rows.length,1);assert.equal(rows[0].id,'b');assert.equal(rows[0].filters.rarity,'5');assert.equal(deleteCatalogPreset(storage,'gi:sets','b'),true);assert.deepEqual(readCatalogPresets(storage,'gi:sets'),[]);assert.equal(deleteCatalogPreset(storage,'gi:sets','b'),false);
});

test('un preset vide ne peut pas être enregistré',()=>{assert.throws(()=>saveCatalogPreset(new MemoryStorage(),'gi:weapons','   ',{}),/nom/)});
