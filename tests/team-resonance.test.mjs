import test from 'node:test';
import assert from 'node:assert/strict';
import { teamElementResonances } from '../src/team-resonance.js';

test('détecte les résonances élémentaires avec noms anglais et français', () => {
  assert.deepEqual(teamElementResonances(['Pyro', 'Feu', 'Hydro', 'Cryo']), [
    { key: 'pyro', label: 'Pyro', count: 2, kind: 'element' },
  ]);
});

test('affiche le Voile protecteur pour quatre éléments différents', () => {
  assert.deepEqual(teamElementResonances(['Pyro', 'Hydro', 'Cryo', 'Dendro']), [
    { key: 'canopy', label: 'Voile protecteur', count: 4, kind: 'all-elements' },
  ]);
});

test('ignore les éléments inconnus et les emplacements non remplis', () => {
  assert.deepEqual(teamElementResonances(['Pyro', '', 'Vision inconnue', 'Hydro']), []);
  assert.deepEqual(teamElementResonances(['Pyro', 'Pyro', 'Hydro']), [
    { key: 'pyro', label: 'Pyro', count: 2, kind: 'element' },
  ]);
});
