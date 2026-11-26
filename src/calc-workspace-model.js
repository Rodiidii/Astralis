export const CALC_KEY='astralis:gi:calc-sheets';
export const CALC_DESK_KEY='astralis:calc-workbench';
export const numeric=value=>Number(String(value??'').replace(/\s/g,'').replace(',','.'))||0;
export function sheetReport(sheet={}) {
 const members=Array.from({length:4},(_,i)=>sheet.members?.[i]||{}),sum=members.reduce((n,m)=>n+numeric(m.dps),0);
 const duration=Math.max(0,numeric(sheet.time)),dpr=numeric(sheet.dpr),dps=numeric(sheet.dps);
 return {members,sum,duration,dpr,dps,expectedDps:duration?dpr/duration:0,shares:members.map(m=>sum?numeric(m.dps)/sum*100:0),mismatch:!!(duration&&dpr&&dps&&Math.abs(dpr/duration-dps)>Math.max(1,dps*.005))};
}
export function createCalcSheet(team,catalogs={},id=crypto.randomUUID()) {
 const name=(kind,key)=>catalogs[kind]?.find(x=>String(x._id??x.id)===String(key))?._name||'';
 return {id,title:team?.name||'Nouvelle composition',teamId:team?.id||'',color:'#a8cbbb',time:team?.rotationTime||team?.time||20,dpr:team?.dpr||'',dps:team?.dps||'',notes:'',rotation:(team?.rotation||[]).map(a=>[name('character',a.character),a.code+(a.count>1?' ×'+a.count:'')].join(' ')).join(' → ')||team?.rotationNotes||'',members:Array.from({length:4},(_,i)=>{const m=team?.members?.[i]||{};return {name:name('character',m.character),weapon:name('weapon',m.weapon),set:name('artifact',m.set),dps:''};})};
}
export function recalculateSheet(sheet,source='total') {
 const next=structuredClone(sheet),r=sheetReport(sheet);
 if(source==='members'){next.dps=r.sum;if(r.duration)next.dpr=r.sum*r.duration;next.members=r.members.map((m,i)=>({...m,share:r.shares[i].toFixed(1)+' %'}));}
 else if(r.duration)next.dps=r.dpr/r.duration;
 return next;
}
export function sheetCsv(sheet){const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';return [['Personnage','DPS','Arme','Set'],...(sheet.members||[]).map(m=>[m.name,m.dps,m.weapon,m.set]),[],['Rotation',sheet.rotation],['Durée',sheet.time],['DPR',sheet.dpr],['DPS',sheet.dps],['Hypothèses',sheet.notes]].map(row=>row.map(quote).join(';')).join('\r\n');}
