import fs from 'node:fs';
import {REVIEWED_BUFFS} from '../src/lab-reviewed-buffs.js';
import {loadWrEngine,buildWrCharacterData,evaluateWrTeam} from '../src/lab-wr-adapter.js';
const manifest=JSON.parse(fs.readFileSync('data/lab-character-conditions.json','utf8'));
const engine=await loadWrEngine();
const build=(key,condition)=>buildWrCharacterData(engine,{character:key,level:90,constellation:6,conditionals:condition?{[key]:{[condition.path]:condition.options.at(-1)}}:{}});
const active=build('Diluc'),report=[];
for(const [key,record]of Object.entries(manifest.characters)){
 if(!REVIEWED_BUFFS[key])throw Error('Unreviewed character: '+key);
 const conditions=[];
 for(const condition of record.conditions){
  if(!condition.description&&condition.path!=='moonsignAfterSkillBurst')throw Error('Missing description: '+key+'.'+condition.path);
  const source=build(key,condition),own=evaluateWrTeam(engine,source),team=evaluateWrTeam(engine,active,[source]);
  const finite=Object.values(own.members).concat(Object.values(team.members)).every(member=>Object.values(member.stats).every(Number.isFinite));
  if(!finite)throw Error('Invalid calculation: '+key+'.'+condition.path);
  conditions.push({path:condition.path,talent:condition.talent,value:condition.options.at(-1),description:!!condition.description,finiteOwnAndTeam:finite});
 }
 report.push({character:key,talents:record.kitBuffs,conditions});
}
const result={characters:report.length,reviewedCharacters:report.length,individuallyReviewed:report.map(row=>row.character),conditions:report.reduce((n,row)=>n+row.conditions.length,0),validation:{numericCases:'tests/lab-reviewed-*.test.mjs',actionsAndWeapons:'tests/lab-catalog-completeness.test.mjs',liveControls:'tests/lab_twenty_browser.py --final',receivedBuffs:'tests/lab-buff-receipts.test.mjs',liveRecipients:'tests/lab_buff_receipts_browser.py',finiteOwnAndTeam:true},report};
fs.writeFileSync('data/lab-kit-buff-audit.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({characters:result.characters,reviewed:result.reviewedCharacters,conditions:result.conditions}));
