import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTaskSteps, parseTaskSteps, resetTaskSteps, taskStepProgress, toggleTaskStep, taskDuePresentation, tasksDueWithin, taskCategories, taskCategoryProgress, filterTasksByCategory } from '../src/task-checklist.js';
import { renderFeature } from '../src/dashboard-features.js';

test('les cases cochées et identifiants restent associés aux étapes conservées', () => {
  const steps = parseTaskSteps('Matériaux\nDomaine', [{ id: 'materials', title: 'Matériaux', done: true }], () => 'domain');
  assert.deepEqual(steps, [
    { id: 'materials', title: 'Matériaux', done: true },
    { id: 'domain', title: 'Domaine', done: false },
  ]);
});

test('la progression est exacte avant et après le cochage d’une étape', () => {
  const steps = [{ id: 'a', title: 'A', done: true }, { id: 'b', title: 'B', done: false }];
  assert.deepEqual(taskStepProgress(steps), { done: 1, total: 2, percent: 50 });
  assert.deepEqual(taskStepProgress(toggleTaskStep(steps, 'b')), { done: 2, total: 2, percent: 100 });
});

test('une duplication redémarre les étapes et reçoit de nouveaux identifiants', () => {
  const copy = resetTaskSteps([{ id: 'old', title: 'Étape', done: true }], () => 'copy');
  assert.deepEqual(copy, [{ id: 'copy', title: 'Étape', done: false }]);
});

test('les données anciennes ou mal formées restent inoffensives', () => {
  assert.deepEqual(normalizeTaskSteps(null), []);
  assert.deepEqual(normalizeTaskSteps([{ title: '  Étape  ', done: 1 }, null, { title: '' }]), [
    { id: 'step-0', title: 'Étape', done: true },
  ]);
  assert.deepEqual(parseTaskSteps(''), []);
});

test('Ma session affiche la prochaine étape et sa progression', () => {
  const html = renderFeature('session', { game: 'gi', tasks: [{ id: 'task-1', title: 'Préparer Furina', done: false, steps: [{ id: 'books', title: 'Rassembler les livres', done: false }, { id: 'boss', title: 'Vaincre le boss', done: false }] }] });
  assert.match(html, /data-studio-step="task-1"/);
  assert.match(html, /data-step-id="books"/);
  assert.match(html, /0\/2 étapes/);
  assert.match(html, /aria-valuemax="2"/);
});

test('les échéances affichent un repère relatif exact sans dérive de fuseau',()=>{
 assert.deepEqual(taskDuePresentation(null,'2026-11-15'),{state:'none',delta:null,label:'Sans échéance'});
 assert.equal(taskDuePresentation('2026-11-13','2026-11-15').state,'overdue');
 assert.equal(taskDuePresentation('2026-11-13','2026-11-15').delta,-2);
 assert.match(taskDuePresentation('2026-11-13','2026-11-15').label,/En retard.*2 jours/);
 assert.equal(taskDuePresentation('2026-11-15','2026-11-15').state,'today');
 assert.match(taskDuePresentation('2026-11-16','2026-11-15').label,/Demain/);
 assert.match(taskDuePresentation('2026-11-19','2026-11-15').label,/Dans 4 jours/);
 assert.equal(taskDuePresentation('2026-11-30','2026-11-15').state,'scheduled');
 assert.equal(taskDuePresentation('not-a-date','2026-11-15').state,'unknown');
});

test('la vue des sept prochains jours exclut les retards, les tâches terminées et les dates lointaines',()=>{
 const tasks=[{id:'late',due:'2026-11-14'},{id:'today',due:'2026-11-15'},{id:'soon',due:'2026-11-22'},{id:'later',due:'2026-11-23'},{id:'done',due:'2026-11-16',done:true},{id:'none'}];
 assert.deepEqual(tasksDueWithin(tasks,'2026-11-15').map(task=>task.id),['today','soon']);
 assert.deepEqual(tasksDueWithin(tasks,'2026-11-15',0).map(task=>task.id),['today']);
});

test('les catégories de tâches sont comptées et filtrées sans tenir compte des accents',()=>{
 const tasks=[{id:'one',category:'Événement'},{id:'two',category:'Evenement'},{id:'three',category:'Farm'}];
 assert.deepEqual(taskCategories(tasks),[{label:'Événement',count:2},{label:'Farm',count:1}]);
 assert.deepEqual(filterTasksByCategory(tasks,'evenement').map(task=>task.id),['one','two']);
 assert.equal(filterTasksByCategory(tasks,'all'),tasks);
 assert.deepEqual(filterTasksByCategory(tasks,'unknown'),[]);
});

test('le bilan de catégorie distingue objectifs ouverts, terminés et progression',()=>{
 const tasks=[{category:'Farm'},{category:'Farm',done:true},{category:'Farm',done:true},{category:'Événement'}];
 assert.deepEqual(taskCategoryProgress(tasks,'farm'),{total:3,open:1,done:2,percent:67});
 assert.deepEqual(taskCategoryProgress(tasks,'evenement'),{total:1,open:1,done:0,percent:0});
 assert.deepEqual(taskCategoryProgress(tasks,'absent'),{total:0,open:0,done:0,percent:0});
});
