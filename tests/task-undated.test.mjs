import test from 'node:test';
import assert from 'node:assert/strict';
import { tasksWithoutDueDate } from '../src/task-checklist.js';
test('les objectifs sans date restent accessibles et excluent les tâches closes',()=>{
 const rows=[{id:'backlog'},{id:'dated',due:'2026-11-18'},{id:'closed',done:true},{id:'blank',due:' '}];
 assert.deepEqual(tasksWithoutDueDate(rows).map(x=>x.id),['backlog','blank']);
});
