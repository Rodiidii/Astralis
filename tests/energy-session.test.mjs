import test from 'node:test';
import assert from 'node:assert/strict';
import {energyActivitySummary,energyAbsenceProjection,energyDailySpendGoal,energyLocalDateTimeValue,energyMonthlyActivity,energyWeeklyActivity,energyWeeklyComparison,projectEnergySession} from '../src/energy-tracker.js';

test('daily spend goal tracks only today, clamps progress and marks completion',()=>{
 const now=new Date(2026,10,16,12).getTime();
 const row={dailyGoal:80,history:[{at:new Date(2026,10,16,8).getTime(),delta:-30},{at:new Date(2026,10,16,9).getTime(),delta:-10},{at:new Date(2026,10,15,23,59).getTime(),delta:-90}]};
 assert.deepEqual(energyDailySpendGoal(row,now),{configured:true,target:80,spent:40,remaining:40,progress:50,complete:false});
 assert.deepEqual(energyDailySpendGoal({...row,history:[...row.history,{at:now,delta:-60}]},now),{configured:true,target:80,spent:100,remaining:0,progress:100,complete:true});
 assert.equal(energyDailySpendGoal({...row,dailyGoal:0},now).configured,false);
 assert.equal(energyDailySpendGoal({...row,dailyGoal:20},now).progress,100);
});

test('daily activity totals only same-local-day actions and keeps gains separate from spending',()=>{
 const now=new Date(2026,10,15,12).getTime();
 const row={history:[
  {at:new Date(2026,10,15,8).getTime(),delta:-40},
  {at:new Date(2026,10,15,9).getTime(),delta:12},
  {at:new Date(2026,10,14,23,59).getTime(),delta:-60},
  {at:NaN,delta:-10}
 ]};
 assert.deepEqual(energyActivitySummary(row,now),{entries:2,spent:40,gained:12,net:-28,retainedActions:4,capped:false});
});

test('daily activity summary keeps its full 90-action window before marking totals limited',()=>{
 const now=new Date(2026,10,15,12).getTime();
 const history=Array.from({length:8},(_,index)=>({at:now-index*60000,delta:-20}));
 assert.deepEqual(energyActivitySummary({history},now),{entries:8,spent:160,gained:0,net:-160,retainedActions:8,capped:false});
 history.push(...Array.from({length:82},(_,index)=>({at:now-index*60000,delta:1})));
 assert.equal(energyActivitySummary({history},now).capped,true);
});

test('weekly energy chart groups local dates, separates gains and ignores records outside the week',()=>{
 const now=new Date(2026,10,15,12).getTime();
 const row={history:[
  {at:new Date(2026,10,15,8).getTime(),delta:-40},
  {at:new Date(2026,10,15,9).getTime(),delta:10},
  {at:new Date(2026,10,12,18).getTime(),delta:-60},
  {at:new Date(2026,10,7,23,59).getTime(),delta:-90}
 ]};
 const week=energyWeeklyActivity(row,now);
 assert.equal(week.days.length,7);
 assert.equal(week.days[6].spent,40);
 assert.equal(week.days[6].gained,10);
 assert.equal(week.days[3].spent,60);
 assert.deepEqual({spent:week.totalSpent,gained:week.totalGained,actions:week.actions},{spent:100,gained:10,actions:2});
});

test('weekly comparison contrasts the latest seven local days with the preceding seven',()=>{
 const now=new Date(2026,10,16,12).getTime(),row={history:[
  {at:new Date(2026,10,3,8).getTime(),delta:-100},
  {at:new Date(2026,10,3,9).getTime(),delta:20},
  {at:new Date(2026,10,10,8).getTime(),delta:-20},
  {at:new Date(2026,10,15,8).getTime(),delta:-30},
  {at:new Date(2026,10,16,8).getTime(),delta:10},
  {at:new Date(2026,10,2,23,59).getTime(),delta:-500},
 ]};
 assert.deepEqual(energyWeeklyComparison(row,now),{current:{spent:50,gained:10,activeDays:3},previous:{spent:100,gained:20,activeDays:1},available:true,change:-50,percent:-50});
});

test('weekly comparison does not invent a percentage without prior recorded spending',()=>{
 const now=new Date(2026,10,16,12).getTime();
 const comparison=energyWeeklyComparison({history:[{at:new Date(2026,10,15,8).getTime(),delta:-40}]},now);
 assert.equal(comparison.available,false);
 assert.equal(comparison.percent,null);
 assert.equal(comparison.change,40);
});

test('monthly energy heatmap shows 28 local days and aggregates both spending and gains',()=>{
 const now=new Date(2026,10,15,12).getTime();
 const row={history:[
  {at:new Date(2026,10,15,8).getTime(),delta:-40},
  {at:new Date(2026,10,15,9).getTime(),delta:10},
  {at:new Date(2026,10,1,18).getTime(),delta:-60},
  {at:new Date(2026,9,18,23,59).getTime(),delta:-90}
 ]};
 const month=energyMonthlyActivity(row,now);
 assert.equal(month.days.length,28);
 assert.equal(month.days[0].date.getDate(),19);
 assert.equal(month.days[27].key,'2026-11-15');
 assert.equal(month.days[27].spent,40);
 assert.deepEqual({spent:month.totalSpent,gained:month.totalGained,active:month.activeDays,current:month.currentStreak,best:month.bestStreak},{spent:100,gained:10,active:2,current:1,best:1});
});

test('monthly energy activity reports the current and longest consecutive active-day streaks',()=>{
 const now=new Date(2026,10,15,12).getTime(),history=[13,14,15,10,9].map(day=>({at:new Date(2026,10,day,9).getTime(),delta:-20}));
 const summary=energyMonthlyActivity({history},now);
 assert.equal(summary.currentStreak,3);
 assert.equal(summary.bestStreak,3);
 const rested=energyMonthlyActivity({history:history.filter(entry=>new Date(entry.at).getDate()!==15)},now);
 assert.equal(rested.currentStreak,0);
 assert.equal(rested.bestStreak,2);
});

test('a precisely scheduled energy session projects the stock at that local time',()=>{
 const now=Date.UTC(2026,10,15,12),row={current:50,max:200,minutes:8,updatedAt:now},startAt=now+90*60_000;
 const upcoming=projectEnergySession('gi',row,{cost:60,startAt},now);
 assert.equal(upcoming.offsetMinutes,90);
 assert.equal(upcoming.currentAtStart,61);
 assert.equal(upcoming.ready,true);
 assert.equal(upcoming.scheduled,false);
 const due=projectEnergySession('gi',row,{cost:60,startAt},startAt+1);
 assert.equal(due.scheduled,true);
 assert.equal(due.ready,true);
});

test('local date-time formatter preserves the selected minute in the current timezone',()=>{
 const selected=new Date(2026,10,15,18,42,0,0),value=energyLocalDateTimeValue(selected.getTime());
 assert.match(value,/^2026-11-15T18:42$/);
 assert.equal(new Date(value).getTime(),selected.getTime());
});

test('absence projection recommends only the spend needed to avoid the cap',()=>{
 const now=Date.UTC(2026,10,15,12),row={current:190,max:200,minutes:8,updatedAt:now};
 const projection=energyAbsenceProjection(row,480,now);
 assert.deepEqual({ready:projection.ready,current:projection.current,gained:projection.gained,recommendedSpend:projection.recommendedSpend,spendNow:projection.spendNow,atReturn:projection.atReturn,unavoidableLoss:projection.unavoidableLoss},{ready:true,current:190,gained:60,recommendedSpend:50,spendNow:50,atReturn:200,unavoidableLoss:0});
});

test('absence projection reports overflow that cannot be prevented with current stock',()=>{
 const now=Date.UTC(2026,10,15,12),row={current:200,max:200,minutes:8,updatedAt:now};
 const projection=energyAbsenceProjection(row,1920,now);
 assert.equal(projection.spendNow,200);
 assert.equal(projection.atReturn,200);
 assert.equal(projection.unavoidableLoss,40);
});
