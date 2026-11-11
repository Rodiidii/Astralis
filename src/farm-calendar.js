import {materialKind} from './farm-simulator.js?v=20261111-tiers-1';
export function farmSessionPresentation(session,materials,characters=[]){
 const ids=session.characterIds||[session.characterId].filter(Boolean);
 const people=ids.map(id=>characters.find(c=>String(c._id)===String(id)||String(c.id)===String(id))).filter(Boolean);
 const items=[...new Set(session.materialIds||[])].map(id=>materials.find(m=>String(m.id??m._id)===String(id))).filter(Boolean).filter(item=>materialKind(item)!=='specialty'&&!/couronne de (?:la )?sagesse|crown of insight/i.test(item._name||item.name||''));
 const token=(session.kind||session.farmType||session.category||session.title||'').toLocaleLowerCase('fr');
 const kind=/artifact|artéfact|artefact/.test(token)?'artifact':/xp|exp/.test(token)?'xp':/mora/.test(token)?'mora':/aptitude|talent/.test(token)?'talent':/weekly|hebdo/.test(token)?'weekly':/boss/.test(token)?'boss':'other';
 return {people,items,kind,label:({artifact:'Artéfacts',xp:'Livres d’EXP',mora:'Mora',talent:'Aptitudes',weekly:'Boss hebdomadaire',boss:'Boss d’ascension',other:'Session'})[kind],generic:['artifact','xp'].includes(kind)||!items.length};
}
