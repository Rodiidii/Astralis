import test from 'node:test';
import assert from 'node:assert/strict';
import { plannerDayLoad, plannerDayPriorityLoad, plannerCalendarIcs, plannerWeekLoadSummary } from '../src/planner-schedule.js';

test('planner flags a day with overlapping tasks and distinguishes crowded days', () => {
  assert.deepEqual(plannerDayLoad([]), { count: 0, conflict: false, crowded: false });
  assert.deepEqual(plannerDayLoad([{}, {}]), { count: 2, conflict: true, crowded: false });
  assert.deepEqual(plannerDayLoad([{}, {}, {}, {}]), { count: 4, conflict: true, crowded: true });
  assert.deepEqual(plannerDayLoad(null), { count: 0, conflict: false, crowded: false });
});

test('the agenda weights high-priority work and ignores completed tasks',()=>{
 assert.deepEqual(plannerDayPriorityLoad([]),{score:0,level:'clear',open:0,urgent:0});
 assert.deepEqual(plannerDayPriorityLoad([{priority:'Basse'},{priority:'Normale'}]),{score:1.5,level:'light',open:2,urgent:0});
 assert.deepEqual(plannerDayPriorityLoad([{priority:'Urgente'},{priority:'Haute'}]),{score:5,level:'busy',open:2,urgent:2});
 assert.deepEqual(plannerDayPriorityLoad([{priority:'Urgente'},{priority:'Urgente',done:true},{priority:'Haute'},{priority:'Normale'}]),{score:6,level:'heavy',open:3,urgent:2});
});

test('weekly load summary counts open work, free days and the busiest date',()=>{
 const dates=['2026-11-16','2026-11-17','2026-11-18','invalid'];
 const tasks=[{due:dates[0],priority:'Haute'},{due:dates[0],priority:'Normale'},{due:dates[1],done:true,priority:'Urgente'},{due:dates[2],priority:'Urgente'},{due:dates[2]},{due:dates[2]},{due:dates[2]}];
 assert.deepEqual(plannerWeekLoadSummary(tasks,dates),{
  days:3,open:6,urgent:2,freeDays:1,conflictDays:2,crowdedDays:1,peak:{date:'2026-11-18',open:4,urgent:1}
 });
 assert.deepEqual(plannerWeekLoadSummary([],[]),{days:0,open:0,urgent:0,freeDays:0,conflictDays:0,crowdedDays:0,peak:{date:'',open:0,urgent:0}});
});

test('planner calendar export escapes text, includes dated open tasks and skips completed or unscheduled tasks', () => {
  const ics = plannerCalendarIcs([
    { id: 'a-1', game: 'gi', category: 'Farm; talent', title: 'Livres, boss\\hebdo\nNouveau', due: '2026-11-15' },
    { id: 'done', title: 'Terminé', due: '2026-11-15', done: true },
    { id: 'later', title: 'Sans date' }
  ], new Date('2026-11-15T12:34:56.789Z'));
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /DTSTAMP:20261115T123456Z/);
  assert.match(ics, /DTSTART;VALUE=DATE:20261115\r\nDTEND;VALUE=DATE:20261116/);
  assert.match(ics, /SUMMARY:Livres\\, boss\\\\hebdo\\nNouveau/);
  assert.match(ics, /DESCRIPTION:gi · Farm\\; talent/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 1);
  assert.match(ics, /END:VCALENDAR\r\n$/);
});
