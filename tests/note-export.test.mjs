import test from 'node:test';
import assert from 'node:assert/strict';
import { notesAsMarkdown } from '../src/note-export.js';
test('export du carnet conserve les liens personnage, étiquettes, épingles et accents',()=>{
 const markdown=notesAsMarkdown([{title:'Rotation Furina',tag:'Build',targetName:'Furina',pinned:true,body:'Énergie : 180 %\nVérifier le boss.'}, {title:'',body:'ignorée'}],'Genshin Impact',new Date('2026-11-15T12:00:00Z'));
 assert.match(markdown,/# Carnet Astralis · Genshin Impact/);
 assert.match(markdown,/Rotation Furina/);
 assert.match(markdown,/Build · Furina · Épinglée/);
 assert.match(markdown,/Énergie : 180 %\nVérifier le boss\./);
 assert.doesNotMatch(markdown,/ignorée/);
});
