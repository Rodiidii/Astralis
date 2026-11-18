import test from 'node:test';
import assert from 'node:assert/strict';
import {snoozeUntil} from '../src/inbox-center.js';

test('le rappel différé accepte 1 h, 24 h et 7 jours avec une borne de sécurité',()=>{
 const now=1000;
 assert.equal(snoozeUntil(now,1),now+3600000);
 assert.equal(snoozeUntil(now,24),now+86400000);
 assert.equal(snoozeUntil(now,168),now+168*3600000);
 assert.equal(snoozeUntil(now,9999),now+720*3600000);
});
