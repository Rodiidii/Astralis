import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuizReview, buildQuizWeek, buildQuizMistake, resolveQuizMistake, quizStreakProgress, quizExplanationFacts, quizComboStats, chooseQuizHint, quizTopicMastery, quizTopicMistakes } from '../src/daily-quiz.js';

const questions = [
  { label: 'Élément', value: 'Hydro', targetId: 'furina', options: [{ id: 'furina', name: 'Furina', image: '/furina.webp' }, { id: 'neuvillette', name: 'Neuvillette', image: '' }] },
  { label: 'Région', value: 'Mondstadt', targetId: 'venti', options: [{ id: 'venti', name: 'Venti', image: '/venti.webp' }, { id: 'jean', name: 'Jean', image: '' }] },
];

test('quiz review pairs each answered clue with its expected and selected character', () => {
  assert.deepEqual(buildQuizReview(questions, [
    { correct: true, selectedId: 'furina' },
    { correct: false, selectedId: 'jean' },
  ]), [
    { label: 'Élément', value: 'Hydro', correct: true, targetName: 'Furina', targetImage: '/furina.webp', chosenName: 'Furina' },
    { label: 'Région', value: 'Mondstadt', correct: false, targetName: 'Venti', targetImage: '/venti.webp', chosenName: 'Jean' },
  ]);
});

test('quiz review keeps older saved answers readable', () => {
  assert.equal(buildQuizReview(questions, [{ correct: false, name: 'Furina' }])[0].chosenName, 'Réponse non mémorisée');
  assert.equal(buildQuizReview(questions, [{ correct: true, name: 'Furina' }])[0].chosenName, 'Furina');
});

test('quiz mistakes preserve the original clue and answer options, and clear only after a correct retry',()=>{
 const mistake=buildQuizMistake(questions[1],{correct:false,selectedId:'jean'},'2026-11-15');
 assert.equal(mistake.id,'2026-11-15-venti');
 assert.equal(mistake.targetId,'venti');
 assert.equal(mistake.day,'2026-11-15');
 assert.equal(mistake.options[0].name,'Venti');
 assert.equal(buildQuizMistake(questions[0],{correct:true},'2026-11-15'),null);
 assert.deepEqual(resolveQuizMistake([mistake,{...mistake,id:'other'}],mistake.id,false),[mistake,{...mistake,id:'other'}]);
 assert.deepEqual(resolveQuizMistake([mistake,{...mistake,id:'other'}],mistake.id,true),[{...mistake,id:'other'}]);
});

test('topic revision filters the saved mistakes by the selected clue category',()=>{
 const mistakes=[{id:'a',label:'Élément'},{id:'b',label:'Région'},{id:'c',label:'Élément'},null];
 assert.deepEqual(quizTopicMistakes(mistakes,'Élément'),[mistakes[0],mistakes[2]]);
 assert.deepEqual(quizTopicMistakes(mistakes,'Arme'),[]);
});

test('streak milestones preserve an active series, show its next goal, and reset after a missed day',()=>{
 const active=quizStreakProgress({streak:5,lastDay:'2026-11-15'},'2026-11-16');
 assert.deepEqual({current:active.current,target:active.target,remaining:active.remaining,progress:active.progress},{current:5,target:7,remaining:2,progress:50});
 assert.match(active.status,/prolonger/);
 const done=quizStreakProgress({streak:7,lastDay:'2026-11-16'},'2026-11-16');assert.equal(done.status,'Défi du jour terminé · ta série est à jour.');assert.equal(done.target,14);
 const reset=quizStreakProgress({streak:7,lastDay:'2026-11-14'},'2026-11-16');assert.equal(reset.current,0);assert.equal(reset.target,3);assert.equal(reset.progress,0);
});

test('seven-day quiz view excludes older records and includes today’s in-progress answers',()=>{
 const week=buildQuizWeek('2026-11-16',[{day:'2026-11-09',score:5,total:5},{day:'2026-11-10',score:2,total:5}],{answered:3,score:2,total:5});
 assert.equal(week.length,7);assert.equal(week.filter(day=>day.played).length,2);assert.equal(week[0].day,'2026-11-10');assert.equal(week.at(-1).score,'2/5');
});

test('answer explanation reveals other known profile facts without repeating the clue',()=>{
 const profile={_name:'Furina',elementText:'Hydro',weaponText:'Catalyseur',region:'Fontaine'};
 assert.deepEqual(quizExplanationFacts('gi',profile,'Élément'),[['Arme','Catalyseur'],['Région','Fontaine']]);
 assert.deepEqual(quizExplanationFacts('hsr',{element:'Quantum',path:'The Hunt'},'Type de combat'),[['Voie','The Hunt']]);
 assert.deepEqual(quizExplanationFacts('gi',null,'Élément'),[]);
});

test('quiz hint chooses the fact that best narrows the four visible portraits',()=>{
 const roster=[
  {_id:'furina',_name:'Furina',element:'Hydro',weaponType:'Catalyst',region:'Fontaine'},
  {_id:'mona',_name:'Mona',element:'Hydro',weaponType:'Catalyst',region:'Mondstadt'},
  {_id:'neuvillette',_name:'Neuvillette',element:'Hydro',weaponType:'Catalyst',region:'Fontaine'},
  {_id:'ayato',_name:'Ayato',element:'Hydro',weaponType:'Sword',region:'Inazuma'},
 ];
 const options=roster.map(person=>({id:person._id}));
 assert.deepEqual(chooseQuizHint('gi','furina',options,roster,'Élément'),{label:'Région',value:'Fontaine',remaining:2});
 assert.equal(chooseQuizHint('gi','missing',options,roster,'Élément'),null);
});

test('quiz combo resets on an error, tracks the best chain and advances through milestones',()=>{
 assert.deepEqual(quizComboStats([{correct:true},{correct:true},{correct:false},{correct:true}],2),{current:1,best:2,target:3,remaining:2,progress:33,milestone:0});
 assert.deepEqual(quizComboStats([{correct:true},{correct:true},{correct:true}],0),{current:3,best:3,target:5,remaining:2,progress:60,milestone:3});
 assert.equal(quizComboStats(Array.from({length:5},()=>({correct:true}))).milestone,5);
});
import { buildQuizShareText } from '../src/daily-quiz.js';

test('daily quiz share card text is concise, localized, and spoiler free', () => {
  const text = buildQuizShareText({ game: 'gi', day: '2026-11-15', score: 4, total: 5, streak: 7 });
  assert.match(text, /Genshin Impact/);
  assert.match(text, /✦✦✦✦· 4\/5/);
  assert.match(text, /Série : 7 jour\(s\)/);
  assert.doesNotMatch(text, /Furina|Venti/);
});


test('quiz mastery reports per-topic accuracy and leaves unseen topics clearly unplayed',()=>{
 const gi=quizTopicMastery({topicStats:{Élément:{attempts:4,correct:3},Région:{attempts:0,correct:2},Invalide:{attempts:-2,correct:-4}}},'gi');
 assert.deepEqual(gi,[{label:'Élément',attempts:4,correct:3,accuracy:75},{label:'Arme',attempts:0,correct:0,accuracy:0},{label:'Région',attempts:0,correct:0,accuracy:0}]);
 assert.deepEqual(quizTopicMastery({topicStats:{Voie:{attempts:2,correct:1}}},'hsr')[1],{label:'Voie',attempts:2,correct:1,accuracy:50});
 assert.deepEqual(quizTopicMastery({},'ww'),[{label:'Attribut',attempts:0,correct:0,accuracy:0}]);
});
