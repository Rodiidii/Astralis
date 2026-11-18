import test from 'node:test';
import assert from 'node:assert/strict';
import {renderReferenceTeaser} from '../src/relations-reading.js';

test('reference teaser shows current published counts and clearly separates local evidence',()=>{
 const html=renderReferenceTeaser();
 assert.match(html,/233\s*308/);
 assert.match(html,/1\s*203/);
 assert.match(html,/1\s*626/);
 assert.match(html,/122/);
 assert.match(html,/ne sont pas importés dans les preuves locales/);
 assert.match(html,/https:\/\/ties\.catforest\.dev\/genshin/);
});
