import test from 'node:test';
import assert from 'node:assert/strict';
import {wishBalance,projectedWishBalance,addWishGains,claimDailyWishReward,challengeTeam,wishEndingSoon,renderFeature,wishEventDeadlineLabel,buildTeamRoutine,setRoutineCompletion,readinessProgress} from '../src/dashboard-features.js';
test('la jauge de préparation compte les données présentes sans inventer un farm non planifié',()=>{
 assert.deepEqual(readinessProgress({hasBuild:true,hasEquipment:true}),{completed:2,total:2,percent:100,farmPlanned:false});
 assert.deepEqual(readinessProgress({hasBuild:true,hasEquipment:false,farmPlanned:true,farmRemaining:4}),{completed:1,total:3,percent:33,farmPlanned:true});
 assert.deepEqual(readinessProgress({hasBuild:true,hasEquipment:true,farmPlanned:true,farmRemaining:0}),{completed:3,total:3,percent:100,farmPlanned:true});
});
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
 assert.equal(after.history[0].primos,160);assert.equal(after.history[0].count,2);assert.equal(after.history[0].balancePrimos,3686);assert.equal(after.history[0].balanceWishes,14);
});
test('la projection du widget part du compte global et convertit les primos au seuil de 160',()=>{
 const plan={wishes:4,currentPrimos:1200,welkin:true};
 assert.deepEqual(projectedWishBalance(plan,{primos:150,wishes:1}),{wishes:5,primos:1350,convertible:8,total:13});
 assert.deepEqual(projectedWishBalance(plan,{primos:0,wishes:0}),{wishes:4,primos:1200,convertible:7,total:11});
 assert.equal(plan.currentPrimos,1200);
});
test('la récompense quotidienne du tableau de bord applique la Faveur une fois et alimente le journal global',()=>{
 const plan={wishes:4,currentPrimos:1200,primos:1200,welkin:true,history:[]};
 const first=claimDailyWishReward(plan,'2026-11-15');
 assert.equal(first.claimed,true);assert.equal(first.primos,150);assert.equal(first.plan.currentPrimos,1350);
 assert.equal(first.plan.history.at(-1).label,'Commissions quotidiennes + Faveur');assert.equal(first.plan.history.at(-1).rewardType,'daily');assert.equal(first.plan.history.at(-1).rewardPeriod,'2026-11-15');
 const repeat=claimDailyWishReward(first.plan,'2026-11-15');assert.equal(repeat.claimed,false);assert.equal(repeat.plan.currentPrimos,1350);
 const noWelkin=claimDailyWishReward({...plan,welkin:false},'2026-11-16');assert.equal(noWelkin.primos,60);assert.equal(noWelkin.plan.currentPrimos,1260);
});
test('Daily Challenge utilise tous les personnages sans sélection et seulement ceux cochés sinon',()=>{
 const people=Array.from({length:8},(_,i)=>({id:String(i)}));
 const all=challengeTeam(people,[],()=>.3);assert.equal(all.length,4);assert.equal(new Set(all.map(p=>p.id)).size,4);assert.equal(people.length,8);
 const selected=challengeTeam(people,['1','3'],()=>.3);assert.deepEqual(new Set(selected.map(p=>p.id)),new Set(['1','3']));
});

test('la routine d’équipe reprend la rotation, ses portraits et ignore les marqueurs de combo',()=>{
 const people=[{id:'a',sourceId:'1001',name:'Amber',image:'/amber.webp'},{id:'b',sourceId:'1002',name:'Kaeya',image:'/kaeya.webp'}];
 const routine=buildTeamRoutine({id:'team-1',name:'Exploration',members:[{character:'1001'},{character:'1002'}],rotation:[{type:'comboStart'},{character:'1001',code:'E',name:'Compétence',count:2},{type:'comboEnd'},{character:'1002',code:'Q',label:'Déchaînement'}]},people);
 assert.equal(routine.teamId,'team-1');assert.deepEqual(routine.members.map(row=>row.name),['Amber','Kaeya']);assert.equal(routine.steps.length,2);assert.equal(routine.steps[0].characterName,'Amber');assert.equal(routine.steps[0].characterImage,'/amber.webp');assert.equal(routine.steps[0].count,2);assert.equal(routine.steps[1].label,'Déchaînement');
});

test('une équipe sans rotation obtient une checklist de composition et la vue session présente la préparation',()=>{
 const people=[{id:'a',name:'Amber',image:'/amber.webp'}],team={id:'team-empty',name:'Exploration',members:[{character:'a'}],rotation:[]};
 const routine=buildTeamRoutine(team,people);assert.equal(routine.steps.length,1);assert.match(routine.steps[0].label,/Vérifier Amber/);
 const html=renderFeature('session',{game:'routine-check',savedTeams:[team],people,tasks:[]});assert.match(html,/data-feature-session-team-select/);assert.match(html,/Préparer une rotation sauvegardée/);assert.match(html,/Commencer/);
});

test('valider directement un rituel conserve le jour, met à jour la série et respecte les états hebdomadaires',()=>{
 const initial={dayKey:'2026-11-16',weekKey:'2026-11-16',tasks:[{id:'daily-a',period:'daily'},{id:'daily-b',period:'daily'},{id:'weekly-a',period:'weekly'}],day:['daily-a'],week:[],history:[]};
 const after=setRoutineCompletion(initial,'daily-b','daily',true,'2026-11-16');assert.deepEqual(after.day,['daily-a','daily-b']);assert.deepEqual(after.history,['2026-11-16']);
 const weekly=setRoutineCompletion(after,'weekly-a','weekly',true,'2026-11-16');assert.deepEqual(weekly.week,['weekly-a']);assert.deepEqual(weekly.day,['daily-a','daily-b']);
 const undone=setRoutineCompletion(weekly,'daily-a','daily',false,'2026-11-16');assert.deepEqual(undone.history,[]);assert.deepEqual(undone.week,['weekly-a']);assert.deepEqual(initial.day,['daily-a']);
});

test('le widget de vœux ne signale que les bannières qui se terminent dans les trois jours',()=>{const now=Date.parse('2026-11-15T12:00:00Z'),near={id:'near',title:'Bannière proche',start:'2026-11-10T00:00:00Z',end:'2026-11-17T00:00:00Z'},far={id:'far',title:'Bannière plus tard',start:'2026-11-10T00:00:00Z',end:'2026-11-20T00:00:00Z'},future={id:'future',title:'Pas encore commencée',start:'2026-11-16T00:00:00Z',end:'2026-11-17T00:00:00Z'};assert.equal(wishEndingSoon([far,near,future],now)?.id,'near');assert.equal(wishEndingSoon([far],now),null);assert.equal(wishEndingSoon([near],now+3*86400000),null);});

test('le widget affiche le solde réel global, la Faveur et la projection non enregistrée des gains',()=>{const base={game:'gi',wishes:{welkin:true,wishes:4,currentPrimos:1200,history:[]},people:[],events:[]},available=renderFeature('wishes',base);assert.match(available,/\+150 primogemmes au solde global/);assert.match(available,/data-wallet-total>11<\/strong>/);assert.match(available,/data-base-primos="1200" data-base-wishes="4"/);assert.match(available,/data-feature-gain-total>11 vœux<\/b>/);assert.match(available,/data-feature-gain-input/);assert.match(available,/data-feature-daily-reward/);const claimed=renderFeature('wishes',{...base,wishes:{...base.wishes,history:[{rewardType:'daily',rewardPeriod:new Date().toLocaleDateString('sv-SE')}]}});assert.match(claimed,/Déjà ajoutées aujourd’hui/);assert.match(claimed,/data-feature-daily-reward disabled/);});

test('le tableau de bord ouvre le formulaire de gains seulement pendant une vraie échéance proche',()=>{const now=Date.now(),soon={title:'Vœux de test',start:new Date(now-86400000).toISOString(),end:new Date(now+36*3600000).toISOString()},context={game:'gi',wishes:{wishes:8,currentPrimos:2400,primos:2400,characterPity:31,gainLog:[]},people:[],events:[soon]};const urgent=renderFeature('wishes',context);assert.match(urgent,/ÉCHÉANCE SOUS 3 JOURS/);assert.match(urgent,/Vœux de test/);assert.match(urgent,/Gains avant la fin/);assert.match(urgent,/8/);assert.match(urgent,/2400/);const quiet=renderFeature('wishes',{...context,events:[]});assert.doesNotMatch(quiet,/ÉCHÉANCE SOUS 3 JOURS/);assert.match(quiet,/Mes gains d’aujourd’hui/);});

test('l’échéance proche montre une date précise et seulement les primogemmes annoncées',()=>{
 const now=Date.now(),soon={title:'Dernier jour',start:new Date(now-3600000).toISOString(),end:new Date(now+36*3600000).toISOString(),primogems:420},base={game:'gi',wishes:{wishes:0,currentPrimos:0},people:[],events:[soon]};
 const html=renderFeature('wishes',base);
 assert.match(html,new RegExp(`datetime="${soon.end.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"`));
 assert.match(html,/Fin prévue ·/);assert.match(html,/420 primogemmes/);
 const withoutReward=renderFeature('wishes',{...base,events:[{...soon,primogems:undefined}]});
 assert.doesNotMatch(withoutReward,/Récompenses annoncées/);
 assert.ok(wishEventDeadlineLabel(soon.end).length>0);assert.equal(wishEventDeadlineLabel('bad-date'),'');
});
