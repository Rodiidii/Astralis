import test from 'node:test';
import assert from 'node:assert/strict';
import {gameDay,nextMonthlyReset,endgameDeadlines,farmBrief,safeImage} from '../src/home-command-model.js';
import {normalizeHomePrefs} from '../src/home-portal.js';
test('Farm day follows the fixed game server offset, not browser daylight saving',()=>{
 assert.equal(gameDay(new Date('2026-11-26T02:59:59Z'),'europe'),'2026-11-25');
 assert.equal(gameDay(new Date('2026-11-26T03:00:00Z'),'europe'),'2026-11-26');
 assert.equal(gameDay(new Date('2026-07-26T02:30:00Z'),'europe'),'2026-07-25');
 assert.equal(gameDay(new Date('2026-11-25T20:00:00Z'),'asia'),'2026-11-26');
 assert.equal(gameDay(new Date('2026-11-26T08:59:59Z'),'america'),'2026-11-25');
});
test('Abyss and Theater roll across month and year boundaries at server reset',()=>{
 assert.equal(nextMonthlyReset(1,new Date('2026-11-26T12:00:00Z')),'2026-12-01T03:00:00.000Z');
 assert.equal(nextMonthlyReset(16,new Date('2026-12-16T03:00:00Z')),'2027-01-16T03:00:00.000Z');
 const rows=endgameDeadlines({},new Date('2026-11-26T12:00:00Z'));assert.equal(rows[2].end,'');assert.equal(rows[2].days,null);
});
test('A published Carnage deadline takes precedence; expired dates never invent a future rotation',()=>{
 assert.equal(endgameDeadlines({events:[{kind:'onslaught',end:'2026-12-02T03:00:00Z'}]},new Date('2026-11-26T12:00:00Z'))[2].end,'2026-12-02T03:00:00.000Z');
 assert.equal(endgameDeadlines({events:[{kind:'onslaught',end:'2026-01-02'}]},new Date('2026-11-26'))[2].end,'');
});
test('Daily farm totals exclude tomorrow and completed sessions',()=>{
 const f=farmBrief([{date:'2026-11-26',resin:40},{date:'2026-11-26',resin:20,done:true},{date:'2026-11-27',resin:180}], '2026-11-26');assert.equal(f.resin,40);assert.equal(f.pending.length,1);assert.equal(f.completed,1);
});
test('Imported dashboard settings keep supported blocks and reject injected styling and URLs',()=>{
 const p=normalizeHomePrefs({accent:'red;display:none',tracked:Array(30).fill('1'),widgets:['events','events','fake'],hidden:['fake','tasks'],colors:{farm:'javascript:alert(1)'},titles:{farm:'Farm'}});
 assert.equal(p.widgets.length,8);assert.equal(p.widgets[0],'events');assert.deepEqual(p.hidden,['tasks']);assert.deepEqual(p.tracked,['1']);assert.equal(p.accent,'#a1e8d0');assert.deepEqual(p.colors,{});assert.equal(safeImage('javascript:alert(1)'),'');assert.equal(safeImage('//evil.test/a.png'),'');assert.equal(safeImage('/assets/ok.png'),'/assets/ok.png');
});
