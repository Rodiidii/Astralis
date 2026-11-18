export const CHARACTER_BUFF_IDS={skirk:'10000114',furina:'10000089',escoffier:'10000112',mona:'10000041',yunjin:'10000064',shenhe:'10000063'};
export function syncCharacterBuffTeam(p,characters=[]) {
 const members=[{character:p.character,constellation:p.constellation},...(p.allies||[])].filter(member=>member.character);
 const canonical=id=>String(characters.find(c=>String(c._id)===String(id))?.id||id);
 p.complexTeamElements=members.map(member=>{
  const c=characters.find(c=>String(c._id)===String(member.character));
  return ({'électro':'electro','anémo':'anemo','géo':'geo'})[String(c?.elementText||c?.element||'').toLowerCase()]||String(c?.elementText||c?.element||'').toLowerCase();
 }).filter(element=>['pyro','hydro','cryo','electro','anemo','geo','dendro'].includes(element));
 for(const [key,id] of Object.entries(CHARACTER_BUFF_IDS)) {
  const config=p.complexEffects?.[key];if(!config)continue;
  const member=members.find(member=>canonical(member.character)===id);
  if(!member)config.enabled=false;
  else config.constellation=Number(member.constellation)||0;
 }
 return p;
}
