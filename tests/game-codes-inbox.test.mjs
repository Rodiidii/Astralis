import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = {
  getItem(){ return null; },
  setItem(){},
};
const {collectInboxItems,inboxCount,inboxMatches,renderInboxCenter} = await import('../src/inbox-center.js');

test('active codes become per-game inbox notifications with copy and redeem actions', () => {
  const items = collectInboxItems({game:'gi',codes:[{
    id:'hsr:JADE2026',game:'hsr',code:'JADE2026',isNew:true,
    rewards:['Stellar Jade ×60'],redeemUrl:'https://hsr.hoyoverse.com/gift?code=JADE2026',
  }]});
  assert.equal(items.length,1);
  assert.equal(items[0].kind,'code');
  assert.equal(items[0].game,'hsr');
  assert.equal(items[0].rank,0);
  assert.equal(items[0].codeValue,'JADE2026');
  assert.match(items[0].redeemUrl,/hsr\.hoyoverse\.com/);
  assert.equal(inboxCount({codes:[{id:'hsr:JADE2026',game:'hsr',code:'JADE2026',isNew:true}]}),1);
  assert.equal(inboxMatches(items[0],{filter:'code'}),true);
  const markup=renderInboxCenter({game:'gi',codes:[{id:'hsr:JADE2026',game:'hsr',code:'JADE2026',isNew:true,rewards:['Stellar Jade ×60'],redeemUrl:'https://hsr.hoyoverse.com/gift?code=JADE2026'}]});
  assert.match(markup,/data-inbox-filter=\"code\"/);
  assert.match(markup,/data-code-copy=\"JADE2026\"/);
  assert.match(markup,/data-code-redeem=\"hsr:JADE2026\"/);
});
