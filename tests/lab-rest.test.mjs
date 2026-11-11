import {activeBuffBonuses} from '../src/lab-actions.js';
import {calculateHit} from '../src/damage-engine.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeGoodArtifact,usableArtifact,validateArtifact} from '../src/artifact-model.js';
import {parseLabConfiguration} from '../src/lab-import-config.js';
import {effectCatalog} from '../src/lab-effect-catalog.js';
import {positionPriority,getCharacterPriority} from '../src/priority-list.js';
import {optimizeArtifacts} from '../src/optimizer.js';

test('les paliers de roll restent un diagnostic sans écarter la pièce saisie',()=>{
 const piece=normalizeGoodArtifact({setKey:'ThunderingFury',slot:'plume',rarity:5,level:20,mainType:'atkFlat',mainValue:311,substats:[{type:'defFlat',value:39}]});
 assert.equal(validateArtifact(piece).valid,false);assert.equal(usableArtifact(piece),true);
 assert.equal(usableArtifact({...piece,mainType:'hydroDmg'}),false);
 assert.equal(usableArtifact({...piece,substats:[{type:'defFlat',value:NaN}]}),false);
});
test('positionner un personnage complète et réordonne la liste sans doublon',()=>{
 const data=new Map();globalThis.localStorage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
 positionPriority('c',1,['a','b','c']);assert.deepEqual(getCharacterPriority(),['c','a','b']);
 positionPriority('a',3,['a','b','c']);assert.deepEqual(getCharacterPriority(),['c','b','a']);
});
test('le répertoire conserve descriptions, raffinements et constellations verrouillées',()=>{
 const rows=effectCatalog({weapons:[{id:1,_name:'Arme test',r1:{description:'ATQ augmentée de 20 %.'},r5:{description:'ATQ augmentée de 40 %.'}}],sets:[{id:2,_name:'Set test',effect2Pc:'ATQ augmentée de 18 %.',effect4Pc:'Effet conditionnel.'}]},{id:3,name:'Personnage test',passives:[{name:'Passif',description:'Effet publié.'}],constellations:[{name:'C1',description:'Bonus publié.'}]},0);
 assert.ok(rows.some(row=>row.name.includes('R5')&&row.description.includes('40')));
 assert.ok(rows.some(row=>row.type==='character'&&row.locked));
 assert.ok(rows.some(row=>row.type==='set'&&row.name.includes('2 pièces')&&row.bonuses.atkPct===18));
});
test('les trois fichiers utilisateur sont reconnus sans perte des chemins de calcul',()=>{
 for(const [name,kind]of [['MavuikaImportMeltTEam.json','team'],['Skirk.json','multi-target'],['cyno.json','multi-target']]){
  const text=readFileSync(new URL('./fixtures/lab-imports/'+name,import.meta.url),'utf8');const parsed=parseLabConfiguration(text);assert.equal(parsed.kind,kind);assert.ok(parsed.original.name);
 }
});
test('un meilleur assemblage provenant des pièces verrouillées peut être recherché explicitement',async()=>{
 const slots=['flower','plume','sands','goblet','circlet'],mains=['hpFlat','atkFlat','atkPct','pyroDmg','critDmg'];
 const inventory=slots.map((slot,index)=>({id:slot,slot,slotIndex:index,setKey:'A',level:20,locked:true,mainType:mains[index],mainValue:10,substats:[]}));
 const result=await optimizeArtifacts({inventory,filters:{includeLocked:true,configuration:'any'},topN:1,objective:'atk',input:{baseStats:{atk:1000}}});
 assert.ok(result.results.length===1);
});

test('les attaques physiques reçoivent le bonus physique sans prendre un bonus élémentaire',()=>{
 const base={stats:{atk:1000,critRate:0,critDmg:0,physicalDmg:50,pyroDmg:100},talentMultiplier:1,baseStat:'atk',attackerLevel:90,enemyLevel:90,enemyResistance:.1,critMode:'nonCrit'};
 assert.equal(calculateHit(base).total,675);
 assert.equal(calculateHit({...base,elementKey:'pyro'}).total,900);
});

test('un buff suit la position actuelle de son équipier source',()=>{
 const p={character:'a',fightPosition:'on',allies:[{character:'b',position:'on'}],buffs:[{type:'atkPct',value:20,active:true,sourceCharacter:'b',sourcePosition:'off',sourceCondition:'off'}]};
 assert.equal(activeBuffBonuses(p).atkPct,undefined);p.allies[0].position='off';assert.equal(activeBuffBonuses(p).atkPct,20);
});
