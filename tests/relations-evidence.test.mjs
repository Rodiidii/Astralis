import test from 'node:test';
import assert from 'node:assert/strict';
import { relationEvidenceCsv,relationShortcutAction } from '../src/relations.js';
import { searchRelationEvidence } from '../src/relations-reading.js';

test('la recherche transversale trouve titres et extraits sans tenir compte des accents', () => {
  const edges = [
    {a:'furina',b:'neuvillette',proofs:[{title:'Le procès',quote:'Furina évoque le grand procès de Fontaine',kind:'story'}]},
    {a:'nahida',b:'alhaitham',proofs:[{title:'Une conversation',quote:'Une histoire dans la forêt',kind:'voice'}]},
    {a:'furina',b:'navia',proofs:[{title:'Épilogue',quote:'Après le procès',kind:'voice'}]}
  ];
  assert.equal(searchRelationEvidence(edges,'proces').length,2);
  assert.equal(searchRelationEvidence(edges,'Furina Fontaine')[0].edge.b,'neuvillette');
  assert.equal(searchRelationEvidence(edges,'forêt').length,1);
  assert.equal(searchRelationEvidence(edges,'x').length,0);
  assert.equal(searchRelationEvidence([...edges,...edges],'proces',1).length,1);
});

test('le filtre sépare voix, histoire et preuves associées à une quête', () => {
  const edges = [{a:'furina',b:'neuvillette',proofs:[
    {title:'Voix de Furina',quote:'Le Palais Mermonia',kind:'voice'},
    {title:'Après le procès',quote:'Souvenir de Fontaine',kind:'story'},
    {title:'Acte II',quote:'Une audience au tribunal',kind:'story',quest:'Mascarade des coupables'}
  ]}];
  assert.equal(searchRelationEvidence(edges,'fontaine',30,'all').length,1);
  assert.equal(searchRelationEvidence(edges,'fontaine',30,'story').length,1);
  assert.equal(searchRelationEvidence(edges,'palais',30,'voice').length,1);
  assert.equal(searchRelationEvidence(edges,'audience',30,'quest').length,1);
  assert.equal(searchRelationEvidence(edges,'procès',30,'quest').length,0);
});

test('relation evidence CSV escapes fields and exports source references without dialogue excerpts', () => {
  const csv = relationEvidenceCsv([{ a: 'furina', b: 'neuvillette', proofs: [{ kind: 'story', title: 'Procès, acte "final"', id: 'quest-42', lang: 'fr', quest: 'Acte I', source: 'https://example.test/source' }] }], new Map([['furina', 'Furina'], ['neuvillette', 'Neuvillette']]));
  assert.match(csv, /"Furina","Neuvillette","Histoire","Procès, acte ""final""","quest-42","FR","Acte I","https:\/\/example\.test\/source"/);
  assert.doesNotMatch(csv, /dialogue|réplique complète/i);
});

test('empty relation export contains only its headers', () => {
  assert.equal(relationEvidenceCsv([]).split('\r\n').length, 1);
});

test('les raccourcis du réseau mappent recherche, zoom, recentrage et effacement',()=>{
 assert.equal(relationShortcutAction('/'),'focusSearch');assert.equal(relationShortcutAction('+'),'zoomIn');assert.equal(relationShortcutAction('='),'zoomIn');assert.equal(relationShortcutAction('-'),'zoomOut');assert.equal(relationShortcutAction('0'),'resetView');assert.equal(relationShortcutAction('Escape'),'clear');assert.equal(relationShortcutAction('x'),null);
});
