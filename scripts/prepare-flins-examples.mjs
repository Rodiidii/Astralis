import fs from 'node:fs';
import {loadWrEngine,sourceScenario,createSourceEvaluator} from '../src/lab-wr-adapter.js';
import {analyzeTeamSources} from '../src/team-source-stats.js';
const read=path=>JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const manifest=read('data/lab-character-conditions.json'),aliases=read('public/gi-name-aliases.json'),sourceSnapshot=read('data/lab-source-snapshot.json');
const chars=Object.entries(manifest.characters).map(([key,row])=>({_id:row.id,id:row.id,_name:row.name,name:key,elementText:({Flins:'Electro',Ineffa:'Electro',Aino:'Hydro',Sucrose:'Anemo',Fischl:'Electro'})[key]||'Hydro'}));
const weapons=aliases.weapons.map(row=>({_id:row.id,id:row.id,_name:row.en[0],name:row.en[0],rarity:4}));
const sets=aliases.artifacts.map(row=>({_id:row.id,id:row.id,_name:row.en[0],name:row.en[0]}));
const piece=(set,index,mainType,mainValue,subs)=>({id:'flins-demo-piece-'+set+'-'+index,set,slot:['flower','plume','sands','goblet','circlet'][index],rarity:5,level:20,mainType,mainValue,...Object.fromEntries(subs.flatMap(([type,value],i)=>[['sub'+i+'Type',type],['sub'+i+'Value',value]]))});
const flinsId='example-flins-20261126',ineffaId='example-ineffa-20261126';
const flins={id:flinsId,character:'10000120',name:'Démo · Flins — Sélénocution',level:90,ascended:true,constellation:'C0',talentNA:1,talentSkill:10,talentBurst:10,weapon:'13407',weaponLevelValue:90,weaponAscended:true,weaponRefinement:5,set:'15041',setMode:'four',tc:true,demo:false,
 pieces:[piece('15041',0,'hpFlat',4780,[['critRate',10.5],['critDmg',21],['atkPct',9.9],['er',5.8]]),piece('15041',1,'atkFlat',311,[['critRate',10.5],['critDmg',21],['atkPct',9.9],['em',21]]),piece('15041',2,'atkPct',46.6,[['critRate',7],['critDmg',21],['er',11.7],['em',21]]),piece('15041',3,'atkPct',46.6,[['critRate',7],['critDmg',21],['er',11.7],['em',21]]),piece('15041',4,'critDmg',62.2,[['critRate',10.5],['atkPct',9.9],['er',11.7],['em',21]])],
 notes:'Exemple théorique C0, niveau 90, talents 1/10/10, Lance de Favonius R5. Pièces de démonstration : elles ne proviennent pas de ton inventaire. Tester la Symphonie tonitruante dans le laboratoire.'};
const ineffa={id:ineffaId,character:'10000116',name:'Démo · Ineffa — soutien de Flins',level:90,ascended:true,constellation:'C0',talentNA:1,talentSkill:10,talentBurst:10,weapon:'13407',weaponLevelValue:90,weaponAscended:true,weaponRefinement:5,set:'15025',setMode:'four',tc:true,demo:false,
 pieces:[piece('15025',0,'hpFlat',4780,[['atkPct',15.2],['er',11],['critRate',10.5],['em',40]]),piece('15025',1,'atkFlat',311,[['atkPct',15.2],['er',11],['critRate',10.5],['em',40]]),piece('15025',2,'atkPct',46.6,[['em',40],['er',11],['critRate',10.5],['critDmg',14]]),piece('15025',3,'atkPct',46.6,[['em',40],['er',11],['critRate',10.5],['critDmg',14]]),piece('15025',4,'atkPct',46.6,[['em',40],['er',11],['critRate',10.5],['critDmg',14]])],
 tcSettings:{wrConditions:{Ineffa:{a4AfterBurst:'on'},GildedDreams:{passive:'on'}}},notes:'Exemple théorique de soutien : ME partagée après le déchaînement, calculée depuis l’ATQ d’Ineffa. Pièces de démonstration.'};
const members=[{character:flins.character,buildId:flins.id,role:'main-dps',weapon:flins.weapon,set:flins.set,refinement:5,wrConditions:{NightOfTheSkysUnveiling:{'4GleamingMoon':'on'}}},{character:ineffa.character,buildId:ineffa.id,role:'sub-dps',weapon:ineffa.weapon,set:ineffa.set,refinement:5,wrConditions:ineffa.tcSettings.wrConditions},{character:'10000121',role:'support',weapon:'12401',set:'15042',refinement:5,wrConditions:{SilkenMoonsSerenade:{'4GleamingMoon':'on'}}},{character:'10000043',role:'support',set:'15002',wrConditions:{Sucrose:{swirlelectro:'on',skillHit:'hit',lockAfterSkill:'on'},ViridescentVenerer:{swirlelectro:'electro'}}}];
const teams=[{id:'example-flins-team-20261126',name:'Démo · Flins / Ineffa / Aino / Sucrose',tag:'Sélénocution',activeMember:0,members,rotation:[],notes:'Exemple C0. Buffs : déchaînement d’Ineffa, Lune de soie et Dispersion Électro. Les personnages sans build associé utilisent leurs bases au niveau 90 et les effets du set choisi.'},{id:'example-flins-budget-20261126',name:'Démo · Flins / Fischl / Aino / Sucrose',tag:'Variante accessible',activeMember:0,members:members.map((m,i)=>i===1?{character:'10000031',role:'sub-dps',set:'15002'}:structuredClone(m)),rotation:[],notes:'Variante à comparer au soutien d’Ineffa. Fischl n’a pas de build de démonstration associé ; équipe ton propre build pour comparer précisément.'}];
// The budget variant must not grant an Anemo support set to Fischl.
teams[1].members[1].set='';
const main={character:flins.character,build:flins.id,referenceBuild:flins.id,referenceCharacter:flins.character,level:90,characterLevel:90,constellation:0,talentLevel:10,talentAuto:1,talentSkill:10,talentBurst:10,weaponOverride:flins.weapon,weaponLevel:90,weaponRefinement:5,loadout:'equipped',attackSelection:'wr:burst.thunderDmg',actionKind:'burst',targetName:'Symphonie tonitruante · impact principal',elementKey:'electro',hitCount:1,critMode:'average',reaction:'none',enemyLevel:100,resistance:10,radianceMode:'auto',wrConditions:members[0].wrConditions,inventoryDefaultsVersion:1,setRequirementsVersion:2,tab:'overview'};
const support=m=>({character:m.character,build:m.buildId,level:90,constellation:0,talentLevel:10,weapon:m.weapon,weaponLevel:90,refinement:m.refinement||1,set:m.set,wrConditions:m.wrConditions||{},position:'off'});
const scenario={...main,allies:members.slice(1).map(support)};
// Normalize the editor's piece representation for the sourced laboratory.
const normalized=[flins,ineffa].map(b=>({...b,pieces:b.pieces.map(p=>({...p,setKey:p.set,substats:[0,1,2,3].map(i=>({type:p['sub'+i+'Type'],value:p['sub'+i+'Value']}))}))}));
// Set-only supports count the specified set, without inventing artifact stats.
for(const [i,m]of members.slice(2).entries()){const b={id:'support-'+i,character:m.character,pieces:Array.from({length:4},(_,i)=>({id:'support-set-'+i,slot:['flower','plume','sands','goblet'][i],setKey:m.set,setOnly:true}))};normalized.push(b);scenario.allies[i+1].build=b.id;}
const engine=await loadWrEngine();
const context={characters:chars,weapons,sets,aliases,builds:normalized,equipped:normalized[0].pieces,sourceSnapshot};
const evaluate=p=>{const s=sourceScenario(engine,p,context);return createSourceEvaluator(engine,s)();};
const withTeam=evaluate(scenario),solo=evaluate({...main,allies:[]}),resistant=evaluate({...scenario,resistance:50}),nonCrit=evaluate({...scenario,critMode:'nonCrit'}),crit=evaluate({...scenario,critMode:'crit'});
if(![withTeam,solo,resistant,nonCrit,crit].every(r=>r.ok&&r.total>0)||!(withTeam.total>solo.total&&resistant.total<withTeam.total&&nonCrit.total<=withTeam.total&&crit.total>=withTeam.total))throw Error('Flins calculation regression');
const analysis=await analyzeTeamSources({team:teams[0],builds:[flins,ineffa],characters:chars,weapons,sets,aliases,sourceSnapshot});
if(!analysis?.receipts.members[flins.character]?.some(r=>r.owner===ineffa.character&&r.effects.some(e=>e.stat==='em'&&e.value>0)))throw Error('Ineffa EM buff not applied to Flins');
const observed={at:'2026-11-26',attack:main.targetName,solo:solo.total,withTeam:withTeam.total,resistance50:resistant.total,nonCrit:nonCrit.total,crit:crit.total,stats:withTeam.stats,teamStats:analysis.members[flins.character].stats,assumptions:'Une cible, un impact principal, niveau 100, RÉS 10 %, moyenne CRIT. Aucun DPS de rotation. Les pièces sont fictives.'};
// Store only the two requested builds. Other members keep no fabricated build.
scenario.allies=members.slice(1).map(support);
flins.tcSettings=structuredClone(scenario);delete flins.tcSettings.build;delete flins.tcSettings.referenceBuild;
flins.notes+=' Résultat observé : '+Math.round(withTeam.total).toLocaleString('fr-FR')+' dégâts moyens sur un impact principal, RÉS 10 %. Valeur de simulation, pas un DPS de rotation.';
teams[0].dps=Math.round(withTeam.total).toLocaleString('fr-FR')+' / impact';
const output={schema:1,id:'flins-examples-20261126-v1',builds:[flins,ineffa],teams,scenario,observed};
fs.writeFileSync(new URL('../data/flins-examples.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
fs.writeFileSync(new URL('../docs/flins-observed.json',import.meta.url),JSON.stringify(observed,null,2)+'\n');
console.log(JSON.stringify(observed));
