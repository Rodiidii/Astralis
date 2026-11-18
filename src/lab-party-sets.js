export const PARTY_SET_EFFECTS={
 '15014':{label:'Cristal de l’élément du coup obtenu par le porteur : bonus +35 %, 10 s',bonuses:{dmgBonus:35},elements:['pyro','hydro','cryo','electro']},
 '15037':{label:'Réaction liée à l’élément du porteur ; le coup utilise un élément de cette réaction',bonuses:{dmgBonus:12},tiers:[{label:'Réaction : +12 %',bonuses:{dmgBonus:12}},{label:'Réaction sous bénédiction noctâme : +40 %',bonuses:{dmgBonus:40}}]},
 '15042':{label:'Dégâts élémentaires infligés : Dévotion active, 8 s',bonuses:{em:60},tiers:[{label:'Lueur naissante : +60 ME',bonuses:{em:60}},{label:'Lueur ascendante : +120 ME',bonuses:{em:120}}]},
 '15045':{label:'Devoir de la sorcière accompli et compétence utilisée : 20 s ; élément correspondant',bonuses:{dmgBonus:20},tiers:[{label:'Guidance de la lumière : +20 %',bonuses:{dmgBonus:20}},{label:'Hexerei, Hymne mortel : +40 %',bonuses:{dmgBonus:40}}]},
 '15048':{label:'Réaction astrale déclenchée ou dégâts astraux infligés : bonus astral d’équipe +50 %, 12 s',bonuses:{stellarConductBonus:50,stellarSwirlBonus:50}},
 '15007':{label:'Déchaînement utilisé · ATQ de l’équipe +20 % (12 s)',bonuses:{atkPct:20}},
 '15017':{label:'Compétence ayant touché · ATQ de l’équipe +20 % (3 s)',bonuses:{atkPct:20}},
 '10007':{label:'Réaction déclenchée · maîtrise de l’équipe +120 (8 s)',bonuses:{em:120}},
 '15025':{label:'Compétence ou déchaînement ayant touché · RÉS Dendro −30 %',bonuses:{resReduction:30},elements:['dendro']},
 '15002':{label:'Élément simulé dispersé · RÉS correspondante −40 % (10 s)',bonuses:{resReduction:40},elements:['pyro','hydro','cryo','electro']}
};
export function partySetEffects(p,sets,characters=[]){
 const unique=new Map();
 for(const ally of p.allies||[]){
  if(!ally.character||ally.setMode==='2+2')continue;
  const set=sets.find(set=>[set._id,set._labKey,String(set.id)].includes(ally.set));
  const id=String(set?.id),effect=PARTY_SET_EFFECTS[id];
  if(!effect||!ally.activeSetEffects?.[id]||(effect.elements&&!effect.elements.includes(p.elementKey)))continue;
  if(id==='15045'&&characters.length){
   const character=characters.find(c=>[c.id,c._id].map(String).includes(String(ally.character)));
   const sourceElement=String(character?.elementType||'').replace('ELEMENT_','').toLowerCase();
   if(sourceElement!==p.elementKey&&!(Number(ally.partySetTier)===1&&(p.fightPosition||'on')==='on'))continue;
  }
  const selected=effect.tiers?.[Number(ally.partySetTier)||0]?.bonuses||effect.bonuses;
  unique.set(id,{id,keys:[set._id,set._labKey,id].filter(Boolean),bonuses:Object.fromEntries(Object.entries(selected).map(([key,value])=>[key,Math.max(unique.get(id)?.bonuses[key]||0,value)]))});
 }
 return [...unique.values()];
}
export function additionalPartySetBonuses(rows,counts=new Map(),effects={}){
 const out={};
 for(const row of rows||[]){
  const key=row.keys.find(key=>(counts.get(key)||0)>=4),own=key?effects[key]?.four||{}:{};
  for(const [stat,value]of Object.entries(row.bonuses))out[stat]=(out[stat]||0)+Math.max(0,value-(Number(own[stat])||0));
 }
 return out;
}
