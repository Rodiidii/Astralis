
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {farmLevelGoal} from '../src/planning-rules.js';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
function functionText(name,next){return source.slice(source.indexOf('function '+name+'('),source.indexOf('function '+next+'('));}
test('les coûts d’aptitudes incluent les matériaux hebdomadaires',()=>{
 const snapshots=JSON.parse(readFileSync(new URL('../data/gi-talent-costs.json',import.meta.url)));
 assert.ok(Object.keys(snapshots).length>=110);
 const costs=snapshots['10000089'].costs;
 assert.ok(costs.lvl10?.length>0);
 const context={farmLevelGoal,state:{catalogs:{'gi:material':[]}}};
 vm.createContext(context);vm.runInContext(functionText('farmCharacterGoal','isGiNonFarmable'),context);
 const result=context.mergeGiCosts({costs:{}},{talentCosts:costs});
 for(const row of costs.lvl10)assert.ok(result.find(x=>x.id===String(row.id)).count>=row.count*3);
});
test('les jours de domaines viennent des matériaux et restent bornés',()=>{
 const context={};vm.createContext(context);vm.runInContext(functionText('talentFarmDays','proposeGiFarmCalendar'),context);
 assert.deepEqual([...context.talentFarmDays([{item:{daysOfWeek:['Lundi','Jeudi','Dimanche']}}])],[0,3,6]);
 assert.deepEqual([...context.talentFarmDays([{item:{daysOfWeek:['Mardi','Vendredi','Dimanche']}}])],[1,4,6]);
 assert.deepEqual([...context.talentFarmDays([])],[6]);
});
