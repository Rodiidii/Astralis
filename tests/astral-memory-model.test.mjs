import test from 'node:test';
import assert from 'node:assert/strict';
import { memoryDailySelection, memoryDailyStreak, memoryDifficulty, memoryQuickThreshold, memoryRecordIsBetter } from '../src/astral-memory.js';

test('le jeu de mémoire expose trois difficultés avec un nombre de paires croissant',()=>{
 assert.deepEqual(['relaxed','standard','stellar'].map(id=>memoryDifficulty(id).pairs),[4,6,8]);
 assert.equal(memoryDifficulty('unknown').id,'standard');
});

test('le seuil du meilleur temps de coups grandit avec la difficulté',()=>{
 assert.deepEqual([4,6,8].map(memoryQuickThreshold),[10,15,20]);
 assert.equal(memoryQuickThreshold(0),3);
});

test('la série quotidienne ne progresse qu’une fois par jour et se réinitialise après une absence',()=>{
 assert.deepEqual(memoryDailyStreak({},'2026-11-15'),{streak:1,alreadyCompleted:false});
 assert.deepEqual(memoryDailyStreak({lastDate:'2026-11-14',streak:4},'2026-11-15'),{streak:5,alreadyCompleted:false});
 assert.deepEqual(memoryDailyStreak({lastDate:'2026-11-15',streak:5},'2026-11-15'),{streak:5,alreadyCompleted:true});
 assert.deepEqual(memoryDailyStreak({lastDate:'2026-11-12',streak:5},'2026-11-15'),{streak:1,alreadyCompleted:false});
});

test('la constellation quotidienne choisit les mêmes compagnons même si le catalogue arrive dans un ordre différent',()=>{
 const roster=Array.from({length:10},(_,index)=>({name:`Personnage ${index+1}`,icon:`/icons/${index+1}.webp`}));
 const first=memoryDailySelection(roster,'gi','2026-11-16','standard');
 const reordered=memoryDailySelection(roster.slice().reverse(),'gi','2026-11-16','standard');
 assert.deepEqual(reordered.map(person=>person.name),first.map(person=>person.name));
 assert.equal(first.length,6);
 assert.equal(new Set(first.map(person=>person.icon)).size,6);
});

test('le record de mémoire départage les égalités au temps et ignore les résultats invalides',()=>{
 assert.equal(memoryRecordIsBetter({moves:12,seconds:40},{bestMoves:12,bestSeconds:41}),true);
 assert.equal(memoryRecordIsBetter({moves:12,seconds:42},{bestMoves:12,bestSeconds:41}),false);
 assert.equal(memoryRecordIsBetter({moves:11,seconds:60},{bestMoves:12,bestSeconds:1}),true);
 assert.equal(memoryRecordIsBetter({moves:13,seconds:20},{bestMoves:12,bestSeconds:60}),false);
 assert.equal(memoryRecordIsBetter({moves:NaN,seconds:10},{bestMoves:12,bestSeconds:60}),false);
});
