export function teamRosterProgress(count, capacity = 4) {
  const max = Math.max(1, Math.min(8, Math.floor(Number(capacity) || 4)));
  const filled = Math.max(0, Math.min(max, Math.floor(Number(count) || 0)));
  return {
    filled,
    capacity: max,
    percent: Math.round(filled / max * 100),
    complete: filled === max,
    label: `${filled}/${max} · ${filled === max ? 'équipe complète' : 'personnages sélectionnés'}`
  };
}

export function filterTeamLibrary(teams=[],filter='all'){
 if(filter==='incomplete')return teams.filter(team=>(team.members||[]).filter(member=>member.character).length<4);
 if(filter==='favorites')return teams.filter(team=>team.favorite===true);
 if(filter==='needs-rotation')return teams.filter(team=>!(team.rotation||[]).some(action=>action&&action.type!=='comboEnd'));
 if(filter==='duplicates'){const ids=duplicateTeamIds(teams);return teams.filter(team=>ids.has(String(team.id)));}
 return teams;
}

export function duplicateTeamIds(teams = []) {
 const groups=new Map();
 for(const team of Array.isArray(teams)?teams:[]){
  const members=[...new Set((team?.members||[]).map(member=>String(member?.character||'').trim()).filter(Boolean))].sort();
  if(members.length<2)continue;
  const key=members.join('|');
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(String(team?.id??''));
 }
 return new Set([...groups.values()].filter(group=>group.length>1).flat().filter(Boolean));
}

export function sortTeamLibrary(teams = [], order = 'saved') {
 const source = Array.isArray(teams) ? teams : [];
 const rotationReady = team => (team?.rotation || []).some(action => action && action.type !== 'comboEnd');
 const memberCount = team => (team?.members || []).filter(member => member?.character).length;
 const compareName = (a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'fr', { sensitivity: 'base' });
 const sorted = [...source];
 if (order === 'name') sorted.sort(compareName);
 else if (order === 'complete') sorted.sort((a, b) => memberCount(b) - memberCount(a) || compareName(a, b));
 else if (order === 'rotation') sorted.sort((a, b) => Number(rotationReady(b)) - Number(rotationReady(a)) || compareName(a, b));
 return sorted;
}
