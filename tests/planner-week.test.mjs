import test from 'node:test';
import assert from 'node:assert/strict';
import { isPlannerDate, plannerWeekDates, plannerWeekProgress, plannerDayTasks, plannerDayPreview, spreadPlannerBacklog, copyPlannerWeekTasks, plannerCrossGameSummary, plannerCalendarIcs } from '../src/planner-schedule.js';

test('l’agenda garde trois tâches visibles puis révèle tout le jour sur demande', () => {
  const tasks = Array.from({ length: 6 }, (_, index) => ({ id: `task-${index}`, due: '2026-11-16', done: index === 5 }));
  const compact = plannerDayPreview(tasks, '2026-11-16');
  assert.equal(compact.visible.length, 3);
  assert.equal(compact.hidden, 3);
  assert.equal(compact.expanded, false);
  const expanded = plannerDayPreview(tasks, '2026-11-16', true);
  assert.equal(expanded.visible.length, 6);
  assert.equal(expanded.hidden, 0);
  assert.equal(expanded.expanded, true);
});

test('la navigation produit sept jours consécutifs pour chaque semaine', () => {
  const week = plannerWeekDates('2026-11-14');
  assert.equal(week.length, 7);
  assert.equal(week[0], '2026-11-14');
  assert.equal(week[6], '2026-11-20');
  assert.deepEqual(plannerWeekDates('2026-11-14', 1), ['2026-11-21', '2026-11-22', '2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27']);
  assert.deepEqual(plannerWeekDates('2026-11-14', -1), ['2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13']);
});

test('copie les objectifs ouverts sur le même jour de la semaine et ignore les doublons', () => {
  const source = plannerWeekDates('2026-11-09');
  const target = plannerWeekDates('2026-11-16');
  const tasks = [
    { id: 'farm', game: 'gi', title: 'Farm Furina', due: source[0], done: false, priority: 'Haute', category: 'Matériaux', updated: 123 },
    { id: 'done', game: 'gi', title: 'Déjà fini', due: source[1], done: true },
    { id: 'hsr-farm', game: 'hsr', title: 'Farm Furina', due: source[0], done: false },
    { id: 'duplicate', game: 'gi', title: 'FARM FURINA', due: target[0], done: false },
    { id: 'other-game', game: 'hsr', title: 'Autre objectif', due: target[0], done: false },
  ];
  const copies = copyPlannerWeekTasks(tasks, source, target, () => 'fresh-id');
  assert.deepEqual(copies, [{ id: 'fresh-id', game: 'hsr', title: 'Farm Furina', due: target[0], done: false }]);
  assert.equal(tasks[0].due, source[0], 'les objectifs source restent intacts');
  assert.deepEqual(copyPlannerWeekTasks(tasks, source.slice(1), target), []);
});

test('repère la charge partagée entre plusieurs jeux sans compter les tâches terminées', () => {
  assert.deepEqual(plannerCrossGameSummary([
    { game: 'gi', done: false }, { game: 'gi', done: false },
    { game: 'hsr', done: false }, { game: 'ww', done: true },
  ]), {
    games: [{ id: 'gi', label: 'Genshin', count: 2 }, { id: 'hsr', label: 'Star Rail', count: 1 }],
    label: 'Genshin ×2 · Star Rail ×1', total: 3,
  });
  assert.equal(plannerCrossGameSummary([{ game: 'gi' }, { game: 'gi' }]), null);
  assert.equal(plannerCrossGameSummary([{ game: 'gi', done: true }, { game: 'hsr', done: false }]), null);
});

test('le calendrier respecte les changements de mois et rejette une date invalide', () => {
  assert.deepEqual(plannerWeekDates('2026-12-29', 1), ['2027-01-05', '2027-01-06', '2027-01-07', '2027-01-08', '2027-01-09', '2027-01-10', '2027-01-11']);
  assert.deepEqual(plannerWeekDates('2026-02-30'), []);
  assert.ok(plannerWeekDates('2026-11-14', 999).every(isPlannerDate));
});

test('la progression hebdomadaire compte les tâches terminées par jour', () => {
  const progress = plannerWeekProgress([
    { due: '2026-11-14', done: true },
    { due: '2026-11-14', done: false },
    { due: '2026-11-16', done: true },
    { due: '2026-11-21', done: true },
  ], plannerWeekDates('2026-11-14'));
  assert.equal(progress.total, 3);
  assert.equal(progress.completed, 2);
  assert.equal(progress.remaining, 1);
  assert.equal(progress.percent, 67);
  assert.deepEqual(progress.rows[0], { date: '2026-11-14', total: 2, completed: 1, remaining: 1, percent: 50 });
  assert.equal(progress.rows[1].total, 0);
});

test('la répartition du backlog équilibre les jours disponibles et laisse les tâches terminées intactes',()=>{
 const tasks=[{id:'today',game:'gi',due:'2026-11-15',done:false},{id:'old',game:'gi',due:'2026-11-14',done:false},{id:'undated',game:'hsr',title:'Sans date',done:false},{id:'done',game:'ww',due:'2026-11-14',done:true}];
 assert.deepEqual(spreadPlannerBacklog(tasks,['2026-11-14','2026-11-15','2026-11-16','2026-11-17'],'2026-11-15'),[
  {id:'old',game:'gi',title:undefined,due:'2026-11-16'},
  {id:'undated',game:'hsr',title:'Sans date',due:'2026-11-17'}
 ]);
 assert.deepEqual(spreadPlannerBacklog(tasks,['2026-11-14'],'2026-11-15'),[]);
});

test('la répartition du backlog place les priorités hautes avant les tâches moins urgentes',()=>{
 const today='2026-11-15',dates=['2026-11-15','2026-11-16','2026-11-17'];
 const tasks=[
  {id:'already-today',due:today,done:false,priority:'Normale'},
  {id:'low',due:'',done:false,priority:'Basse'},
  {id:'urgent',due:'2026-11-14',done:false,priority:'Urgente'},
  {id:'normal',due:'',done:false,priority:'Normale'},
  {id:'high',due:'2026-11-13',done:false,priority:'Haute'},
  {id:'finished',due:'',done:true,priority:'Urgente'},
 ];
 const assignments=spreadPlannerBacklog(tasks,dates,today);
 assert.deepEqual(assignments.map(row=>row.id),['urgent','high','normal','low']);
 assert.deepEqual(assignments.map(row=>row.due),['2026-11-16','2026-11-17','2026-11-15','2026-11-16']);
 assert.equal(tasks[1].due,'');
});

test('la répartition conserve les tâches fixes et programme les optionnelles après les flexibles',()=>{
 const today='2026-11-15',dates=['2026-11-15','2026-11-16','2026-11-17','2026-11-18'];
 const tasks=[
  {id:'optional-urgent',due:'',done:false,priority:'Urgente',scheduleMode:'optional'},
  {id:'fixed-overdue',due:'2026-11-14',done:false,priority:'Urgente',scheduleMode:'fixed'},
  {id:'flexible-low',due:'',done:false,priority:'Basse',scheduleMode:'flexible'},
  {id:'flexible-high',due:'2026-11-13',done:false,priority:'Haute'},
 ];
 const rows=spreadPlannerBacklog(tasks,dates,today);
 assert.deepEqual(rows.map(row=>row.id),['flexible-high','flexible-low','optional-urgent']);
 assert.equal(tasks.find(task=>task.id==='fixed-overdue').due,'2026-11-14');
});

test('la répartition du backlog équilibre les durées au lieu du seul nombre de tâches',()=>{
 const today='2026-11-15',dates=['2026-11-15','2026-11-16','2026-11-17'];
 const tasks=[{id:'long',due:today,durationMinutes:120,done:false},{id:'medium',due:'',durationMinutes:60,done:false},{id:'short',due:'',durationMinutes:30,done:false}];
 const assignments=spreadPlannerBacklog(tasks,dates,today,{defaultTaskMinutes:30});
 assert.deepEqual(assignments.map(row=>row.due),['2026-11-16','2026-11-17']);
 const estimated=spreadPlannerBacklog([{id:'old',due:'',title:'Domaine',done:false}],dates,today,{estimateTaskDuration:()=>({minutes:75,samples:3})});
 assert.equal(estimated[0].due,'2026-11-15');
});

test('l’export calendrier replie les longues lignes UTF-8 sans couper les caractères', () => {
  const ics = plannerCalendarIcs([{ id: 'long', title: 'Préparer les matériaux de l’Invocation des Sept Étoiles — réunion avec Furina et Neuvillette', due: '2026-11-16' }], new Date('2026-11-15T12:00:00Z'));
  const lines = ics.split('\r\n');
  assert.ok(lines.some(line => line.startsWith(' ')), 'les lignes longues doivent être repliées');
  assert.ok(lines.every(line => new TextEncoder().encode(line).length <= 75));
  assert.match(ics, /Préparer les matériaux/);
  assert.match(ics, /Furina/);
});

test('les identifiants d’évènements restent uniques même si deux objectifs partagent un identifiant', () => {
  const ics = plannerCalendarIcs([
    { id: 'duplicate', title: 'Préparer Furina', due: '2026-11-16' },
    { id: 'duplicate', title: 'Préparer Neuvillette', due: '2026-11-17' },
  ]);
  const ids = [...ics.matchAll(/^UID:(.+)$/gm)].map(match => match[1]);
  assert.deepEqual(ids, ['duplicate@astralis.local', 'duplicate-2@astralis.local']);
});


test('l’agenda trie les objectifs ouverts avant les terminés et rejette les dates invalides', () => {
  const tasks = [
    { id: 'done', due: '2026-11-16', done: true },
    { id: 'later', due: '2026-11-17', done: false },
    { id: 'open', due: '2026-11-16', done: false },
  ];
  assert.deepEqual(plannerDayTasks(tasks, '2026-11-16').map(task => task.id), ['open', 'done']);
  assert.deepEqual(plannerDayTasks(tasks, '2026-11-17').map(task => task.id), ['later']);
  assert.deepEqual(plannerDayTasks(tasks, '2026-02-30'), []);
});
