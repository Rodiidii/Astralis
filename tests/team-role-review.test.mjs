import test from 'node:test';
import assert from 'node:assert/strict';
import { teamRoleReview } from '../src/team-role-coverage.js';

test('le bilan reste neutre si aucun rôle ou seulement une partie est renseigné', () => {
  assert.equal(teamRoleReview([]).tone, 'neutral');
  assert.match(teamRoleReview([{ character: 'a', role: 'main-dps' }, { character: 'b' }]).message, /à préciser/);
});

test('le bilan signale les compositions atypiques sans déduire les rôles du personnage', () => {
  const team = roles => roles.map((role, index) => ({ character: `p${index}`, role }));
  assert.match(teamRoleReview(team(['support', 'sub-dps', 'sustain', 'flex'])).message, /Aucun DPS principal/);
  assert.match(teamRoleReview(team(['main-dps', 'main-dps', 'support', 'sustain'])).message, /temps de terrain/);
  assert.match(teamRoleReview(team(['main-dps', 'support', 'sub-dps', 'flex'])).message, /Aucun soin/);
  assert.equal(teamRoleReview(team(['main-dps', 'support', 'sustain', 'flex'])).tone, 'ready');
});
