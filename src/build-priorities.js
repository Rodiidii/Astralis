import catalogue from '../data/build-priorities.json' with {type:'json'};
export function buildPriority(character,weapon,role='default') {
 const candidates=[character?.id,character?._id].filter(v=>v!=null).map(v=>String(v).replace(/^gi:/,'')),id=candidates.find(key=>catalogue.characters[key])||candidates.find(key=>/^10000/.test(key))||candidates[0]||'',entry=(()=>{const raw=String(character?.elementText||character?.element||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase(),element=({anemo:'Anemo',geo:'Geo',electro:'Electro',dendro:'Dendro',hydro:'Hydro',pyro:'Pyro',cryo:'Cryo'})[raw];return /^(?:10000005|10000007)/.test(id)&&element?catalogue.characters['Traveler'+element+(id.startsWith('10000007')?'F':'M')]:null;})()||catalogue.characters[id]||Object.values(catalogue.characters).find(row=>String(row.name).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'')===String(character?._name||character?.name||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,''));
 const result=entry?structuredClone(entry):{priority:[],conditional:[],label:'Rôle à préciser',reason:'Aucun profil fiable dans le kit local.',reviewed:false};
 const fav=/favonius/i.test(String(weapon?._name||weapon?.name||''));
 if(fav&&!result.priority.includes('critRate'))result.priority.push('critRate');
 if(role==='reaction'){result.priority=['em',...(result.priority.includes('er')?['er']:[])];result.label='Réactions transformatives · maîtrise';}
 if(role==='damage'&&!['noCrit','hpBloom','noEnergy'].includes(result.profile))result.priority=[...new Set([...result.priority,'critRate','critDmg'])];
 if(role==='amplify'){if(!result.priority.includes('em'))result.priority.push('em');result.label='Fonte / évaporation · dégâts et maîtrise';}
 if(fav&&!result.priority.includes('critRate'))result.priority.push('critRate');
 result.favonius=fav;return result;
}
