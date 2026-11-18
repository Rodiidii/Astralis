import test from 'node:test';
import assert from 'node:assert/strict';
import { filterWeaponsByType, resetCatalogFilters, catalogActiveFilterChips, clearCatalogFilter } from '../src/catalog-filters.js';

test('resetting catalog filters clears only filter state and restores first page', () => {
  const result = resetCatalogFilters({
    query: 'furina', element: 'Hydro', rarity: '5', ownedOnly: true,
    order: 'name', pageSize: 96, game: 'gi', section: 'characters', view: 'list'
  });
  assert.deepEqual({ query: result.query, element: result.element, rarity: result.rarity,
    ownedOnly: result.ownedOnly, order: result.order, pageSize: result.pageSize },
  { query: '', element: 'all', rarity: 'all', ownedOnly: false, order: 'release', pageSize: 24 });
  assert.equal(result.game, 'gi');
  assert.equal(result.section, 'characters');
  assert.equal(result.view, 'list');
});

test('weapon type filter keeps the full list on all and isolates the requested weapon family', () => {
  const weapons = [{ name: 'Épée' }, { name: 'Arc' }, { name: 'Catalyseur' }];
  const type = weapon => ({ Épée: 'sword', Arc: 'bow', Catalyseur: 'catalyst' })[weapon.name];
  assert.equal(filterWeaponsByType(weapons, 'all', type), weapons);
  assert.deepEqual(filterWeaponsByType(weapons, 'bow', type), [{ name: 'Arc' }]);
  assert.deepEqual(filterWeaponsByType(weapons, 'unknown', type), []);
});

test('active catalog chips explain each filter and can be cleared independently',()=>{
 const state={query:'  Furina ',element:'Hydro',weaponType:'catalyst',rarity:'5',ownedOnly:true,order:'name',game:'gi',section:'characters',view:'grid',pageSize:96};
 assert.deepEqual(catalogActiveFilterChips(state),[
  {key:'query',label:'Recherche · Furina'}, {key:'element',label:'Hydro'}, {key:'weaponType',label:'Catalyseur'},
  {key:'rarity',label:'5 étoiles'}, {key:'ownedOnly',label:'Possédés uniquement'}, {key:'order',label:'Nom A—Z'}
 ]);
 const cleared=clearCatalogFilter(state,'weaponType');
 assert.equal(cleared.weaponType,'all');assert.equal(cleared.pageSize,24);assert.equal(cleared.query,state.query);assert.equal(cleared.ownedOnly,true);
 assert.deepEqual(clearCatalogFilter(state,'invalid'),state);
});
