// Corrections kept outside the generated engine, applied once by normalizeLabEngine.
export function applyThirdReviewedBuffs(e){
 const zero=e.constant(0),flag=(key,path)=>({operation:'read',operands:[],path:['conditional',key,path],type:'string'});
 const match=(a,b,on,off=zero)=>({operation:'match',operands:[a,b,on,off],emptyOn:'unmatch'});
 const when=(key,path,on,off=zero)=>match(flag(key,path),e.constant('on'),on,off);
 const rank=(value,on,off=zero)=>({operation:'threshold',operands:[e.input.constellation,e.constant(value),on,off],emptyOn:'l'});
 const register=(key,...paths)=>{for(const path of paths)if(!e.conditionalPaths.characters[key].includes(path))e.conditionalPaths.characters[key].push(path);};
 const guard=(sheet,key,path,wrap)=>{const visited=new WeakSet();const visit=node=>{if(!node||typeof node!=='object'||visited.has(node))return;visited.add(node);if(node.operation==='read'&&node.path?.join('.')===`conditional.${key}.${path}`){const original={...node};Object.keys(node).forEach(key=>delete node[key]);Object.assign(node,wrap(original));return;}for(const child of Object.values(node))if(child&&typeof child==='object')visit(child);};visit(sheet);};
 const wrio=e.characters.Wriothesley.sheetData;
 // Stacks can only exist during Chilling Penalty. Guard every formula that reads them.
 const seen=new WeakSet(),gate=node=>{if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);if(node.operation==='read'&&node.path?.join('.')==='conditional.Wriothesley.a4EdictStacks'){const original={...node};Object.keys(node).forEach(key=>delete node[key]);Object.assign(node,when('Wriothesley','skillActive',original,e.constant('off')));return;}for(const child of Object.values(node))if(child&&typeof child==='object')gate(child);};gate(wrio);
 for(const key of Object.keys(wrio.display.normal)){const enhanced=wrio.display.skill['enhanced_'+key];if(enhanced)wrio.display.normal[key]=when('Wriothesley','skillActive',enhanced,wrio.display.normal[key]);}
 wrio.display.charged.dmg=when('Wriothesley','a1Rebuke',wrio.display.charged.rebukeDmg,wrio.display.charged.dmg);
 const active=()=>({operation:'read',operands:[],path:['activeCharKey'],type:'string'}),target=()=>({operation:'read',operands:[],path:['target','charKey'],type:'string'});
 const radiance=on=>when('Wriothesley','lockRevelation',when('Wriothesley','lockStellarRadianceSc',on));
 const regularSpeed=match(active(),e.constant('Wriothesley'),match(target(),e.constant('Wriothesley'),e.constant(.2)),match(target(),active(),e.constant(.1)));
 const radianceSpeed=match(target(),e.constant('Wriothesley'),e.constant(.2),e.constant(.1));
 wrio.teamBuff.premod.atkSPD_=rank(4,when('Wriothesley','c4Overheal',when('Wriothesley','lockRevelation',when('Wriothesley','lockStellarRadianceSc',radianceSpeed,regularSpeed),regularSpeed)));
 wrio.premod.dmgRed_=rank(4,when('Wriothesley','c4Overheal',radiance(e.constant(.25))));
 register('Wriothesley','skillActive','a1Rebuke','c4Overheal');
 const clorinde=e.characters.Clorinde.sheetData;
 clorinde.premod.dmgRed_=rank(6,when('Clorinde','c6VigilProtection',e.constant(.8)));
 register('Clorinde','c6VigilProtection');
 const arlecchino=e.characters.Arlecchino.sheetData;
 arlecchino.premod.normal_dmgInc={operation:'threshold',operands:[arlecchino.infusion.nonOverridableSelf.operands[0],e.constant(.3),arlecchino.premod.normal_dmgInc,zero],emptyOn:'l'};
 const gaming=e.characters.Gaming.sheetData;
 // The passive increases incoming healing, not the amount of healing Gaming produces.
 gaming.premod.incHeal_=gaming.premod.heal_;delete gaming.premod.heal_;
 const cyno=e.characters.Cyno.sheetData;
 guard(cyno,'Cyno','a1Judication',node=>when('Cyno','afterBurst',node,e.constant('off')));
 cyno.display.skill.skillDmg=when('Cyno','afterBurst',cyno.display.skill.riteDmg,cyno.display.skill.skillDmg);
 for(const key of Object.keys(cyno.display.normal)){const enhanced=cyno.display.burst['normal_'+key];if(enhanced)cyno.display.normal[key]=when('Cyno','afterBurst',enhanced,cyno.display.normal[key]);}
 cyno.display.charged.dmg=when('Cyno','afterBurst',cyno.display.burst.charged,cyno.display.charged.dmg);
 for(const key of ['dmg','low','high'])cyno.display.plunging[key]=when('Cyno','afterBurst',cyno.display.burst['plunging_'+key],cyno.display.plunging[key]);
 cyno.premod.atkSPD_=rank(1,when('Cyno','c1Speed',e.constant(.2)));
 register('Cyno','c1Speed');
 const dori=e.characters.Dori.sheetData;
 for(const stat of ['incHeal_','enerRech_'])if(dori.teamBuff.premod[stat])dori.teamBuff.premod[stat]=when('Dori','burstLinked',dori.teamBuff.premod[stat]);
 register('Dori','burstLinked');
 const xilonen=e.characters.Xilonen.sheetData;
 const converted=e.sum(...['pyro','hydro','cryo','electro'].map(key=>e.input.tally[key]));
 guard(xilonen,'Xilonen','sourceActive',node=>({operation:'threshold',operands:[converted,e.constant(2),node,e.constant('off')],emptyOn:'l'}));
 const enabled=when('Xilonen','sourceActive',e.constant(1));
 for(const [key,value]of [['xilonenElectroEnergy',25],['xilonenElectroBurstCooldown',6]]){
  e.input.nonStacking[key]={operation:'read',operands:[],path:['nonStacking',key],accu:'add',type:'number'};
  xilonen.teamBuff.nonStacking[key]=rank(2,{operation:'threshold',operands:[converted,e.constant(2),match({operation:'read',operands:[],path:['target','charEle'],type:'string'},e.constant('electro'),match(enabled,e.constant(1),e.constant(value))),zero],emptyOn:'l'});
 }
 guard(xilonen,'Xilonen','c6Imperishable',node=>when('Xilonen','nsBlessing',node,e.constant('off')));
 for(const key of ['0','1','2'])xilonen.display.normal[key]=when('Xilonen','nsBlessing',xilonen.display.normal['ns'+key],xilonen.display.normal[key]);
 for(const key of ['dmg','low','high'])xilonen.display.plunging[key]=when('Xilonen','nsBlessing',xilonen.display.plunging['ns_'+key],xilonen.display.plunging[key]);
 const iansan=e.characters.Iansan.sheetData;
 iansan.teamBuff.premod.atk_=match(active(),e.constant('Iansan'),zero,iansan.teamBuff.premod.atk_);
}
