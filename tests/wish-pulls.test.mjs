import assert from 'node:assert/strict';
import test from 'node:test';
import { wishPullPresentation } from '../src/wish-pulls.js';

test('l’historique classe correctement les pertes, victoires, radiances et permanents', () => {
  assert.equal(wishPullPresentation({ banner: 'character', result: 'lost' }).kind, 'lost');
  assert.equal(wishPullPresentation({ banner: 'character', result: 'featured' }).kind, 'won');
  assert.equal(wishPullPresentation({ banner: 'character', result: 'radiance' }).kind, 'radiance');
  assert.equal(wishPullPresentation({ banner: 'permanent', result: 'permanent' }).kind, 'standard');
  assert.equal(wishPullPresentation({ banner: 'weapon', result: 'permanent' }).kind, 'lost');
});

test('la teinte de pity est bornée et le plafond dépend de la bannière', () => {
  const low = wishPullPresentation({ banner: 'weapon', pity: 1 });
  const high = wishPullPresentation({ banner: 'weapon', pity: 80 });
  assert.equal(low.cap, 80);
  assert.equal(high.cap, 80);
  assert.ok(low.shade >= .12);
  assert.ok(high.shade <= .74);
  assert.ok(high.shade > low.shade);
  assert.equal(wishPullPresentation({ banner: 'character', pity: 500 }).shade, .74);
});
