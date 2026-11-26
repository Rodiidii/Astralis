import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogAliases,catalogAdditions,catalogValueChanges,catalogFieldSnapshot,matchCatalogRows,mergeCatalogDiffRows} from '../src/catalog-diff.js';

test('catalogues still match when display names and generated slugs differ',()=>{
 const old=[{id:10000150,_id:'odette',name:'Odette',enName:'Odette'}];
 const fresh=[{id:'10000150',_id:'odette-fr',name:'Odette (FR)',enName:'Odette'}];
 assert.equal(catalogAdditions(old,fresh).length,0);
 assert.equal(matchCatalogRows(old,fresh)[0].previous,old[0]);
});

test('French accents and punctuation do not make an existing set look new',()=>{
 const old=[{id:15050,_id:'sejour-empyreen',name:'Séjour empyréen',enName:'Empyrean Sojourn'}];
 const fresh=[{id:'15050',_id:'sejour-empyréen',name:'Séjour empyréen',enName:'Empyrean Sojourn'}];
 assert.deepEqual(catalogAdditions(old,fresh),[]);
 assert.ok(catalogAliases(old[0]).includes('name:empyreansojourn'));
});

test('same display name with a different explicit ID remains a distinct catalog entry',()=>{
 const old=[{id:10000005,_id:'traveler-anemo',name:'Voyageur'}];
 const fresh=[{id:10000007,_id:'traveler-dendro',name:'Voyageur'}];
 assert.deepEqual(catalogAdditions(old,fresh).map(item=>item.id),[10000007]);
});

test('only an actually new character or artifact is counted as an addition',()=>{
 const old=[{id:10001,_id:'nahida',name:'Nahida',enName:'Nahida'},{id:15001,_id:'flower-of-paradise-lost',name:'Au-delà du vermillon'}];
 const fresh=[...old,{id:10002,_id:'new-character',name:'Nouvel arrivant',enName:'New Arrival'},{id:15050,_id:'empyrean-sojourn',name:'Séjour empyréen',enName:'Empyrean Sojourn'}];
 assert.deepEqual(catalogAdditions(old,fresh).map(item=>item.id),[10002,15050]);
});

test('the journal records changed character values instead of unrelated source metadata',()=>{
 const old=[{id:10000150,_id:'odette',name:'Odette',enName:'Odette',rarity:5,element:'Cryo',ascensionStats:{hp:12000,atk:300}}];
 const fresh=[{id:10000150,_id:'odette',name:'Odette',enName:'Odette',rarity:5,element:'Cryo',ascensionStats:{hp:12100,atk:300},updatedAt:99}];
 const changes=catalogValueChanges(old,fresh,item=>catalogFieldSnapshot(item,'character'));
 assert.equal(changes.length,1);
 assert.equal(changes[0].type,'updated');
 assert.equal(changes[0].fields.length,1);
 assert.equal(changes[0].fields[0].key,'Élévation › hp');
});

test('the Traveler selected element never becomes a false data update',()=>{
 const before=[{id:10000005,_id:'traveler-anemo',name:'Voyageur',element:'Anemo'}];
 const after=[{id:10000005,_id:'traveler-anemo',name:'Voyageur',element:'Electro'}];
 assert.deepEqual(catalogValueChanges(before,after,item=>catalogFieldSnapshot(item,'character')),[]);
});

test('published Traveler element forms do not appear as newly released characters',()=>{
 const before=[{id:10000005,_id:'traveler',name:'Voyageur',enName:'Aether'},{id:10000007,_id:'traveler-f',name:'Voyageuse',enName:'Lumine'}];
 const after=[...before,...['ANEMO','CRYO','DENDRO','ELECTRO','GEO','HYDRO','PYRO'].flatMap(element=>[
  {id:10000005,_id:`10000005_${element}`,name:'Voyageur',enName:'Aether',element},
  {id:10000007,_id:`10000007_${element}`,name:'Voyageuse',enName:'Lumine',element},
 ])];
 assert.deepEqual(catalogAdditions(before,after),[]);
 assert.deepEqual(catalogValueChanges(before,after,item=>catalogFieldSnapshot(item,'character')),[]);
 assert.ok(matchCatalogRows(after,after).every(row=>row.previous),'same-version sync matches every Traveler element row');
});

test('provider rarity labels compare as the same five-star value',()=>{
 const before=[{id:15517,_id:'silverdawn',name:'Aube d’argent',rarity:5}];
 const after=[{id:'15517',_id:'silverdawn',name:'Aube d’argent',rarity:'QUALITY_ORANGE'}];
 assert.deepEqual(catalogValueChanges(before,after,item=>catalogFieldSnapshot(item,'weapon')),[]);
});

test('weapon passive comparisons use the same five refinement fields across source schemas',()=>{
 const old={id:11503,_id:'freedom-sworn',name:'Serment de la liberté',effectName:'Ode de l’appel à la révolte'};
 const fresh={...old,passive:{name:old.effectName,refinements:{}}};
 for(let rank=1;rank<=5;rank++){
  const description=`Effet R${rank} : ATQ +${rank*5} %`;
  old[`r${rank}`]={description,values:[`${rank*5} %`]};
  fresh.passive.refinements[String(rank)]={description,params:[rank/20]};
 }
 assert.deepEqual(catalogValueChanges([old],[fresh],item=>catalogFieldSnapshot(item,'weapon')),[]);
 fresh.passive.refinements['3'].description='Effet R3 : ATQ +18 %';
 const changes=catalogValueChanges([old],[fresh],item=>catalogFieldSnapshot(item,'weapon'));
 assert.equal(changes.length,1);
 assert.deepEqual(changes[0].fields.map(field=>field.key),['Passif · R3']);
});

test('gender and platform localization refreshes do not appear as weapon value changes',()=>{
 const old={id:11503,name:'Ode de l\'appel à la révolte',effectName:'Concert du millénaire',r1:{description:'Lorsque le voyageur équipe ceci, son ATQ augmente de 20%.'}};
 const refreshed={id:11503,name:old.name,passive:{name:old.effectName,refinements:{'1':{description:'Lorsque {M#le voyageur}{F#la voyageuse} équipe ceci, son ATQ augmente de 20%.'}}}};
 assert.deepEqual(catalogValueChanges([old],[refreshed],item=>catalogFieldSnapshot(item,'weapon')),[]);
 refreshed.passive.refinements['1'].description='Lorsque {M#le voyageur}{F#la voyageuse} équipe ceci, son ATQ augmente de 24%.';
 const changes=catalogValueChanges([old],[refreshed],item=>catalogFieldSnapshot(item,'weapon'));
 assert.equal(changes.length,1);
 assert.deepEqual(changes[0].fields.map(field=>field.key),['Passif · R1']);
});

test('artifact differences use the visible two-piece and four-piece effects',()=>{
 const before=[{id:15050,_id:'empyrean-sojourn',name:'Séjour empyréen',twoPieceBonus:'Recharge d’énergie +20 %',fourPieceBonus:'Bonus de dégâts +25 %'}];
 const after=[{id:15050,_id:'empyrean-sojourn',name:'Séjour empyréen',twoPieceBonus:'Recharge d’énergie +20 %',fourPieceBonus:'Bonus de dégâts +30 %'}];
 const changes=catalogValueChanges(before,after,item=>catalogFieldSnapshot(item,'artifact'));
 assert.equal(changes.length,1);
 assert.equal(changes[0].fields[0].key,'Bonus 4 pièces');
 assert.match(changes[0].fields[0].after,/30/);
});

test('fields absent from an older export are not reported as changed values',()=>{
 const before=[{id:15050,name:'Set',rarity:null,twoPieceBonus:''}];
 const after=[{id:15050,name:'Set',rarity:5,twoPieceBonus:'Recharge +20 %'}];
 assert.deepEqual(catalogValueChanges(before,after,item=>catalogFieldSnapshot(item,'artifact')),[]);
});

test('journal rows are unique and a real newly added item stays first',()=>{
 const previous=[{id:'15001',category:'artifact',type:'updated',name:'Set existant',at:10,fields:[{key:'Bonus',before:'A',after:'B',type:'updated'}]}];
 const incoming=[{id:'15001',category:'artifact',type:'updated',name:'Set existant',at:20,fields:[{key:'Bonus',before:'B',after:'C',type:'updated'}]},{id:'15050',category:'artifact',type:'new',name:'Nouveau set',at:20,fields:[]}];
 const rows=mergeCatalogDiffRows(incoming,previous);
 assert.equal(rows.length,2);
 assert.equal(rows[0].name,'Nouveau set');
 assert.deepEqual(rows[1].fields,[{key:'Bonus',before:'A',after:'C',type:'updated'}]);
 assert.equal(mergeCatalogDiffRows(incoming,rows).length,2);
});
