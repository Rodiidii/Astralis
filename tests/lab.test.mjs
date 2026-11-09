import test from 'node:test';
import assert from 'node:assert/strict';
import { RESISTANCE_MULTIPLIER, DEFENSE_MULTIPLIER, calculateHit, finalStats, amplifyingReactionMultiplier, transformativeReactionMultiplier, ADDITIVE_REACTION_EM_MULTIPLIER } from '../src/damage-engine.js';
import { normalizeGoodArtifact, validateArtifact, pruneDominatedArtifacts, parseArtifactInventory, artifactImportDelta, ARTIFACT_SUBSTAT_MAX } from '../src/artifact-model.js';
import { evaluateDamageStats, optimizeArtifacts } from '../src/optimizer.js';
import { buildAttackSearchIndex, attackMatches, foldAttackQuery, summarizeRotation } from '../src/lab-page.js';

test('résistance et défense utilisent les formules Genshin',()=>{
  assert.equal(RESISTANCE_MULTIPLIER(.1),.9);
  assert.equal(RESISTANCE_MULTIPLIER(-.2),1.1);
  assert.equal(RESISTANCE_MULTIPLIER(.8),1/4.2);
  assert.equal(DEFENSE_MULTIPLIER(90,100),190/390);
  assert.equal(DEFENSE_MULTIPLIER(90,100,1),190/(190+200*.1));
});
test('stat finale pourcentage + plat et calcul moyen isolent les termes',()=>{
  assert.deepEqual(finalStats({atk:1000,critRate:50,critDmg:100},{atkPct:20,atkFlat:50}),{hp:0,atk:1250,def:0,em:0,critRate:50,critDmg:100,dmgBonus:0,er:0,healing:0,defReduction:0,defIgnore:0,pyroDmg:0,hydroDmg:0,cryoDmg:0,electroDmg:0,anemoDmg:0,geoDmg:0,dendroDmg:0,physicalDmg:0});
  const out=calculateHit({stats:{atk:1000,critRate:50,critDmg:100},baseStat:'atk',talentMultiplier:2,attackerLevel:90,enemyLevel:100,enemyResistance:.1});
  assert.equal(out.ok,true);assert.ok(Math.abs(out.direct-(2000*1.5*(190/390)*.9))<1e-9);
});
test('réactions manquantes restent TODO_DATA et ne sont pas remplacées par zéro',()=>{
  const out=calculateHit({stats:{atk:1000,em:0},baseStat:'atk',talentMultiplier:1,attackerLevel:90,reaction:{kind:'amplifying',baseMultiplier:undefined}});
  assert.equal(out.ok,false);assert.ok(out.warnings.some(x=>x.includes('TODO_DATA')));
  assert.ok(Number.isNaN(Number(undefined)));
});
test('stat de référence et multiplicateur absents ne produisent pas un faux zéro',()=>{
  assert.equal(calculateHit({stats:{},baseStat:'atk',talentMultiplier:1,attackerLevel:90}).ok,false);
  assert.equal(calculateHit({stats:{atk:100},baseStat:'atk',talentMultiplier:0,attackerLevel:90}).ok,false);
});
test('validation GOOD signale les lignes impossibles',()=>{
  const row=normalizeGoodArtifact({id:'a',setKey:'set',slotKey:'flower',rarity:5,level:20,mainStatKey:'FIGHT_PROP_HP',mainStatValue:4780,substats:[{key:'FIGHT_PROP_ATTACK_PERCENT',value:17.49},{key:'FIGHT_PROP_CRITICAL',value:7.78},{key:'FIGHT_PROP_CRITICAL_HURT',value:15.54},{key:'FIGHT_PROP_ATTACK',value:38.9}]});
  assert.equal(validateArtifact(row).valid,true);
  assert.equal(validateArtifact({...row,mainType:'critRate'}).valid,false);
  assert.equal(validateArtifact({...row,slot:'flower',mainType:'atkPct'}).valid,false);
});
test('le pré-filtrage conserve une copie d’un vecteur identique',()=>{
  const row={id:'a',slotIndex:0,setKey:'A',mainType:'atkPct',mainValue:46.6,substats:[{type:'critRate',value:10}]};
  assert.deepEqual(pruneDominatedArtifacts([row,{...row,id:'b'}]).map(x=>x.id),['a']);
});
function fixtureInventory(){const rows=[];for(let i=0;i<5;i++){for(const [setKey,atkPct,critDmg] of [['A',10+i,5],['B',7,15+i]])rows.push({id:`${i}-${setKey}`,slotIndex:i,slot:['flower','plume','sands','goblet','circlet'][i],setKey,mainType:'atkPct',mainValue:atkPct,substats:[{type:'critDmg',value:critDmg}],rarity:5,level:20,locked:false});}return rows;}
test('optimiseur exact = recherche brute sur petit inventaire',async()=>{
  const inventory=fixtureInventory(),input={baseStats:{atk:1000,critRate:50,critDmg:100},bonuses:{},level:90,setEffects:{A:{two:{atkPct:18},four:{dmgBonus:35}},B:{two:{atkPct:18},four:{dmgBonus:15}}},hit:{baseStat:'atk',talentMultiplier:2,attackerLevel:90,enemyLevel:100,enemyResistance:.1,critMode:'average'}};
  let brute=-Infinity;const choose=(slot,rows,counts,stats)=>{if(slot===5){const c=[...counts.values()].sort((a,b)=>b-a);if(!(c[0]>=4||(c[0]>=2&&c[1]>=2)))return;brute=Math.max(brute,evaluateDamageStats(input,stats,counts).total);return;}for(const p of inventory.filter(x=>x.slotIndex===slot)){rows.push(p);stats.atkPct=(stats.atkPct||0)+p.mainValue;stats.critDmg=(stats.critDmg||0)+p.substats[0].value;counts.set(p.setKey,(counts.get(p.setKey)||0)+1);choose(slot+1,rows,counts,stats);counts.set(p.setKey,counts.get(p.setKey)-1);if(!counts.get(p.setKey))counts.delete(p.setKey);stats.atkPct-=p.mainValue;stats.critDmg-=p.substats[0].value;rows.pop();}};choose(0,[],new Map(),{});
  const result=await optimizeArtifacts({inventory,input,topN:1});assert.equal(result.exact,true);assert.equal(result.results.length,1);assert.ok(Math.abs(result.results[0].score-brute)<1e-8);
});
test('un bonus 4 pièces cumule aussi le bonus 2 pièces',()=>{
  const input={baseStats:{atk:1000,critRate:0,critDmg:0},bonuses:{},setEffects:{A:{two:{atkPct:18},four:{dmgBonus:35}}},hit:{baseStat:'atk',talentMultiplier:1,attackerLevel:90,enemyLevel:100,enemyResistance:.1}};
  const result=evaluateDamageStats(input,{},new Map([['A',4]]));
  assert.equal(result.bonuses.atkPct,18);assert.equal(result.stats.dmgBonus,35);assert.equal(result.stats.atk,1180);
});
test('index de talents construit une fois et recherche accents, alias anglais et fautes',()=>{
  const character={_id:'char-1',_name:'Personnage test'};
  const index=buildAttackSearchIndex([
    {id:'skill-1',character,name:'Réaction de Vaporisation',nameEn:'Vaporize Reaction',kind:'Compétence',description:'Inflige des dégâts Pyro.'},
    {id:'skill-2',character:{_id:'char-2',_name:'Autre'},name:'Lame stellaire',kind:'Attaque',description:'Frappe rapide.'}
  ]);
  assert.equal(foldAttackQuery('Vaporisation Éclât'), 'vaporisation eclat');
  assert.equal(attackMatches(index,'vaporisation')[0].id,'skill-1');
  assert.equal(attackMatches(index,'vaporize')[0].id,'skill-1');
  assert.equal(attackMatches(index,'vaporisaton')[0].id,'skill-1');
  assert.equal(attackMatches(index,'vaporisation')[0].character._name,'Personnage test');
});
test('le bonus élémentaire sélectionné influe sur le résultat optimisé',()=>{
  const input={baseStats:{atk:1000,critRate:0,critDmg:0},bonuses:{},hit:{baseStat:'atk',talentMultiplier:1,attackerLevel:90,enemyLevel:100,enemyResistance:.1,elementKey:'pyro'}};
  const plain=evaluateDamageStats(input,{},new Map()),withGoblet=evaluateDamageStats(input,{pyroDmg:46.6},new Map());
  assert.ok(withGoblet.total>plain.total);
});


test('calculs manuels : CRIT moyen, CRIT et sans CRIT',()=>{
 const common={stats:{atk:1000,critRate:50,critDmg:100},baseStat:'atk',talentMultiplier:1,attackerLevel:90,enemyLevel:100,enemyResistance:0,critMode:'average'};
 assert.equal(calculateHit(common).direct,1000*1.5*(190/390));
 assert.equal(calculateHit({...common,critMode:'crit'}).direct,1000*2*(190/390));
 assert.equal(calculateHit({...common,critMode:'nonCrit'}).direct,1000*(190/390));
});
test('calcul manuel : RÉS négative et haute RÉS',()=>{
 assert.equal(RESISTANCE_MULTIPLIER(-.4),1.2);assert.equal(RESISTANCE_MULTIPLIER(.75),1/4);assert.equal(RESISTANCE_MULTIPLIER(1),.2);
});
test('calcul manuel : réduction et ignorance de DÉF se multiplient',()=>{
 const plain=DEFENSE_MULTIPLIER(90,100),reduced=DEFENSE_MULTIPLIER(90,100,.3,.2);
 assert.equal(reduced,190/(190+200*.7*.8));assert.ok(reduced>plain);
});
test('calcul manuel : Vaporisation ×2 avec maîtrise élémentaire',()=>{
 const em=280,amp=2*(1+2.78*em/(em+1400));assert.equal(amplifyingReactionMultiplier(em),1+2.78*em/(em+1400));
 const out=calculateHit({stats:{atk:1000,em,critRate:0,critDmg:0},baseStat:'atk',talentMultiplier:1,attackerLevel:90,enemyLevel:100,enemyResistance:0,critMode:'nonCrit',reaction:{kind:'amplifying',baseMultiplier:2}});
 assert.equal(out.direct,1000*(190/390)*amp);
});
test('calcul manuel : additif applique le coefficient de niveau fourni',()=>{
 const em=200,coef=1.15,level=1446.85;const expected=(1000+coef*level*ADDITIVE_REACTION_EM_MULTIPLIER(em))*(190/390);
 const out=calculateHit({stats:{atk:1000,em,critRate:0,critDmg:0},baseStat:'atk',talentMultiplier:1,attackerLevel:90,enemyLevel:100,enemyResistance:0,critMode:'nonCrit',reaction:{kind:'additive',coefficient:coef,levelMultiplier:level}});
 assert.ok(Math.abs(out.direct-expected)<1e-8);
});
test('calcul manuel : réaction transformative séparée du critique et de la DEF',()=>{
 const em=400,level=1446.85,coefficient=3,expected=coefficient*level*(1+16*em/(em+2000))*.9;
 const out=calculateHit({stats:{atk:1000,em,critRate:100,critDmg:200,dmgBonus:80},baseStat:'atk',talentMultiplier:1,attackerLevel:90,enemyLevel:100,enemyResistance:.1,critMode:'crit',reaction:{kind:'transformative',coefficient,levelMultiplier:level,enemyResistance:.1}});
 assert.ok(Math.abs(out.transformative-expected)<1e-8);assert.ok(out.direct>1000);
});
test('les coefficients ou tables manquants ne deviennent jamais zéro',()=>{
 const out=calculateHit({stats:{atk:1000,em:0},baseStat:'atk',talentMultiplier:1,attackerLevel:90,reaction:{kind:'transformative',id:'hyperbloom'}});
 assert.equal(out.ok,false);assert.match(out.error,/TODO_DATA/);
});
test('inventaire GOOD conserve les doublons réels mais ne réimporte pas un fichier identique',()=>{
 const piece={id:'same',setKey:'set',slot:'flower',rarity:5,level:0,mainType:'hpFlat',mainValue:717,substats:[{type:'atkFlat',value:16},{type:'defFlat',value:19},{type:'em',value:16}]};
 const parsed=parseArtifactInventory({artifacts:[piece,{...piece,id:'other'}]});assert.equal(parsed.duplicates,1);
 const first=artifactImportDelta([],parsed.rows);assert.equal(first.length,2);const second=artifactImportDelta(first,parsed.rows);assert.equal(second.length,0);
 const extra=artifactImportDelta(first,[...parsed.rows,{...piece,id:'third'}]);assert.equal(extra.length,1);
});
test('stats finales convertissent les pourcentages sur la base et ajoutent les plats',()=>{
 assert.deepEqual(finalStats({hp:10000,atk:1000,def:500},{hpPct:20,hpFlat:4780,atkPct:46.6,atkFlat:311,defPct:58.3}),{hp:16780,atk:1777,def:791.5,em:0,critRate:0,critDmg:0,dmgBonus:0,er:0,healing:0,defReduction:0,defIgnore:0,pyroDmg:0,hydroDmg:0,cryoDmg:0,electroDmg:0,anemoDmg:0,geoDmg:0,dendroDmg:0,physicalDmg:0});
});
test('rotation inconnue garde total et DPS non confirmés au lieu de compter zéro',()=>{
 const s=summarizeRotation([{damage:null,damageKnown:false,duration:2},{damage:100,duration:3}],2);
 assert.equal(s.knownTotal,200);assert.equal(s.total,null);assert.equal(s.duration,10);assert.equal(s.dps,null);assert.equal(s.unknown,1);
});
test('inventaire de référence des sous-stats comprend les paliers de roll',()=>{
 assert.deepEqual(ARTIFACT_SUBSTAT_MAX,{hpFlat:298.75,atkFlat:19.45,defFlat:23.15,hpPct:5.83,atkPct:5.83,defPct:7.29,em:23.31,er:6.48,critRate:3.89,critDmg:7.77});
});
