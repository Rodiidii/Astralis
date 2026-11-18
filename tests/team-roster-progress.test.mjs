import test from 'node:test';
import assert from 'node:assert/strict';
import { teamRosterProgress,filterTeamLibrary,sortTeamLibrary,duplicateTeamIds } from '../src/team-roster-progress.js';
import { teamRoleCoverage } from '../src/team-role-coverage.js';

test('team roster meter distinguishes an empty, partial and complete team', () => {
  assert.deepEqual(teamRosterProgress(0), {
    filled: 0, capacity: 4, percent: 0, complete: false,
    label: '0/4 · personnages sélectionnés'
  });
  assert.equal(teamRosterProgress(2).percent, 50);
  assert.equal(teamRosterProgress(2).complete, false);
  assert.equal(teamRosterProgress(4).percent, 100);
  assert.equal(teamRosterProgress(4).complete, true);
  assert.equal(teamRosterProgress(4).label, '4/4 · équipe complète');
});

test('team roster meter clamps invalid values and capacity', () => {
  assert.equal(teamRosterProgress(-2).filled, 0);
  assert.equal(teamRosterProgress(99).filled, 4);
  assert.equal(teamRosterProgress(3, 2).capacity, 2);
  assert.equal(teamRosterProgress(3, 2).complete, true);
});

test('team library can isolate compositions that still need a rotation',()=>{
 const teams=[{id:'empty',rotation:[]},{id:'combo-only',rotation:[{type:'comboEnd'}]},{id:'ready',rotation:[{name:'E'}]},{id:'favorite',favorite:true,rotation:[{name:'Q'}]}];
 assert.deepEqual(filterTeamLibrary(teams,'needs-rotation').map(team=>team.id),['empty','combo-only']);
 assert.deepEqual(filterTeamLibrary(teams,'favorites').map(team=>team.id),['favorite']);
 assert.equal(filterTeamLibrary(teams,'all'),teams);
});

test('team library sorts by saved order, name, roster completion or rotation readiness without mutating source',()=>{
 const teams=[
  {id:'later',name:'Zéphyr',members:[{character:'a'}],rotation:[]},
  {id:'ready',name:'Aube',members:[{character:'a'},{character:'b'}],rotation:[{name:'E'}]},
  {id:'full',name:'Braise',members:[{character:'a'},{character:'b'},{character:'c'},{character:'d'}],rotation:[]},
 ];
 assert.deepEqual(sortTeamLibrary(teams).map(team=>team.id),['later','ready','full']);
 assert.deepEqual(sortTeamLibrary(teams,'name').map(team=>team.id),['ready','full','later']);
 assert.deepEqual(sortTeamLibrary(teams,'complete').map(team=>team.id),['full','ready','later']);
 assert.deepEqual(sortTeamLibrary(teams,'rotation').map(team=>team.id),['ready','full','later']);
 assert.deepEqual(teams.map(team=>team.id),['later','ready','full']);
});

test('team library finds repeated lineups regardless of slot order and ignores incomplete one-person teams',()=>{
 const teams=[
  {id:'first',members:[{character:'a'},{character:'b'},{character:'c'},{character:'d'}]},
  {id:'same',members:[{character:'d'},{character:'c'},{character:'b'},{character:'a'}]},
  {id:'other',members:[{character:'a'},{character:'b'}]},
  {id:'one',members:[{character:'a'}]},
  {id:'missing',members:[{},{}]},
 ];
 assert.deepEqual([...duplicateTeamIds(teams)].sort(),['first','same']);
 assert.deepEqual(filterTeamLibrary(teams,'duplicates').map(team=>team.id),['first','same']);
});

test('team role summary counts occupied slots, duplicated roles and missing labels',()=>{
 const members=[
  {character:'a',role:'main-dps'},
  {character:'b',role:'sub-dps'},
  {character:'c',role:'support'},
  {character:'d'},
  {role:'sustain'},
 ];
 assert.deepEqual(teamRoleCoverage(members),{
  occupied:4,assigned:3,unassigned:1,complete:false,
  roles:[{key:'main-dps',label:'DPS principal',count:1},{key:'sub-dps',label:'DPS secondaire',count:1},{key:'support',label:'Support',count:1}],
 });
 assert.deepEqual(teamRoleCoverage([{character:'a',role:'sustain'},{character:'b',role:'sustain'}]),{
  occupied:2,assigned:2,unassigned:0,complete:true,
  roles:[{key:'sustain',label:'Soin / protection',count:2}],
 });
});
