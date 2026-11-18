import test from 'node:test';
import assert from 'node:assert/strict';
import {appendArcadeResult,normalizeArcadeHistory,renderArcadeHistoryMarkup} from '../src/arcade-score-history.js';
import {moveArcadeTabIndex} from '../src/arcade-mode-tabs.js';

test('arcade mode tabs navigate with arrow keys and Home/End wrapping',()=>{
 assert.equal(moveArcadeTabIndex(4,0,'ArrowLeft'),3);
 assert.equal(moveArcadeTabIndex(4,3,'ArrowRight'),0);
 assert.equal(moveArcadeTabIndex(4,1,'ArrowDown'),2);
 assert.equal(moveArcadeTabIndex(4,2,'ArrowUp'),1);
 assert.equal(moveArcadeTabIndex(4,2,'Home'),0);
 assert.equal(moveArcadeTabIndex(4,0,'End'),3);
 assert.equal(moveArcadeTabIndex(4,2,'Enter'),2);
 assert.equal(moveArcadeTabIndex(0,0,'ArrowRight'),-1);
});

test('keeps the ten latest valid scores per game and does not mix universes',()=>{
 let state=normalizeArcadeHistory({gi:[{id:'bad',at:'bad',score:2}],hsr:[{id:'hsr-old',at:'2026-11-14',score:99}]});
 for(let i=0;i<12;i++)state=appendArcadeResult(state,'gi',{id:`gi-${i}`,at:`2026-11-${String(i+1).padStart(2,'0')}`,score:i*100,lines:i,level:i+1});
 assert.equal(state.gi.length,10);
 assert.equal(state.gi[0].id,'gi-11');
 assert.equal(state.gi.at(-1).id,'gi-2');
 assert.equal(state.hsr[0].id,'hsr-old');
 assert.equal(appendArcadeResult(state,'unknown',{score:500}).unknown,undefined);
});

test('renders an accessible recent-score chart and an honest empty state',()=>{
 const empty=renderArcadeHistoryMarkup('gi',[]);
 assert.match(empty,/Aucun score enregistré/);
 assert.match(empty,/Termine une partie/);
 const html=renderArcadeHistoryMarkup('gi',[{id:'a',at:'2026-11-15T12:00:00.000Z',score:1234,lines:7,level:3}]);
 assert.match(html,/aria-label="Historique local des scores"/);
 assert.match(html,/1\s*234/);
 assert.match(html,/7 lignes · niv\. 3/);
 assert.doesNotMatch(html,/<script/i);
});
