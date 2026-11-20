export function applyLunarStellarBuffs(e){
 const zero=e.constant(0),flag=(key,path)=>({operation:'read',operands:[],path:['conditional',key,path],type:'string'});
 const match=(a,b,on,off=zero)=>({operation:'match',operands:[a,b,on,off],emptyOn:'unmatch'});
 const when=(key,path,on,off=zero)=>match(flag(key,path),e.constant('on'),on,off);
 const active={operation:'read',operands:[],path:['activeCharKey'],type:'string'},target={operation:'read',operands:[],path:['target','charKey'],type:'string'};
 const gate=(sheet,key,path,wrap)=>{const seen=new WeakSet();function visit(node){if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);if(node.operation==='read'&&node.path?.join('.')===`conditional.${key}.${path}`){const original={...node};Object.keys(node).forEach(key=>delete node[key]);Object.assign(node,wrap(original));return;}for(const child of Object.values(node))if(child&&typeof child==='object')visit(child);}visit(sheet);};
 const columbina=e.characters.Columbina.sheetData;
 for(const path of ['c2Lunarcharged','c2Lunarbloom','c2Lunarcrystallize'])gate(columbina,'Columbina',path,node=>when('Columbina','c2Brilliance',node,e.constant('off')));
 for(const path of ['c6Lunarcharged','c6Lunarbloom','c6Lunarcrystallize'])gate(columbina,'Columbina',path,node=>when('Columbina','burstDomain',node,e.constant('off')));
 const mitya=e.characters.Mitya.sheetData;
 // Explicit core type is shared by A1/C2: no steady-core mastery while overloaded.
 gate(mitya,'Mitya','a1Beacons',node=>match(flag('Mitya','coreType'),e.constant('steady'),node,e.constant('off')));
 gate(mitya,'Mitya','c2CoreType',node=>when('Mitya','c2CoreField',node,e.constant('off')));
 if(mitya.teamBuff.premod.critDMG_)mitya.teamBuff.premod.critDMG_=match(active,target,mitya.teamBuff.premod.critDMG_);
 mitya.flags||={};mitya.flags.coreType=flag('Mitya','coreType');
 if(!e.conditionalPaths.characters.Mitya.includes('coreType'))e.conditionalPaths.characters.Mitya.push('coreType');
}
