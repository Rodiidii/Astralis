import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeDashboardDay} from '../src/dashboard-day-summary.js';

test('le résumé compte événements actifs, objectifs échus et rituels complétés sans doublons',()=>{
 const now=new Date(2026,10,15,12),today=now.toLocaleDateString('sv-SE');
 const events=[
  {start:new Date(2026,10,14,18).toISOString(),end:new Date(2026,10,15,20).toISOString()},
  {start:new Date(2026,10,15,14).toISOString(),end:new Date(2026,10,15,18).toISOString()},
  {start:new Date(2026,10,16,0).toISOString(),end:new Date(2026,10,16,23).toISOString()},
  {start:'invalid',end:'invalid'},
 ];
 const tasks=[{due:today},{due:'2026-11-14'},{due:today,done:true},{title:'Sans date'}];
 assert.deepEqual(summarizeDashboardDay({events,tasks,rituals:{completed:4,total:2},now}),{
  events:2,activeEvents:1,dueTasks:2,rituals:{completed:2,total:2,percent:100},
 });
});

test('des données absentes ou des dates invalides donnent un résumé calme et sûr',()=>{
 assert.deepEqual(summarizeDashboardDay({events:null,tasks:null,rituals:null,now:'bad-date'}),{
  events:0,activeEvents:0,dueTasks:0,rituals:{completed:0,total:0,percent:0},
 });
});
