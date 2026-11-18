import test from 'node:test';
import assert from 'node:assert/strict';
import {farmStockDateImpact} from '../src/farm-simulator.js';

test('shows how many days the current inventory saves for a character',()=>{
 assert.deepEqual(farmStockDateImpact('2026-12-20','2026-12-15'),{daysSaved:5,status:'earlier'});
 assert.deepEqual(farmStockDateImpact('2026-12-15','2026-12-20'),{daysSaved:-5,status:'later'});
 assert.deepEqual(farmStockDateImpact('2026-12-15','2026-12-15'),{daysSaved:0,status:'same'});
});

test('keeps unknown or malformed completion dates unknown',()=>{
 assert.deepEqual(farmStockDateImpact(null,'2026-12-15'),{daysSaved:null,status:'unknown'});
 assert.deepEqual(farmStockDateImpact('2026-02-30','2026-03-01'),{daysSaved:null,status:'unknown'});
});
