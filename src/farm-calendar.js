import {materialKind} from './farm-simulator.js?v=20261123-farm-weapons-9';
export function farmSessionPresentation(session,materials,characters=[],weaponCatalog=[]){
 const ids=session.characterIds||[session.characterId].filter(Boolean);
 const people=ids.map(id=>characters.find(c=>String(c._id)===String(id)||String(c.id)===String(id))).filter(Boolean);
 const weaponIds=session.weaponIds||[session.weaponId].filter(Boolean),weapons=weaponIds.map(id=>weaponCatalog.find(weapon=>String(weapon._id)===String(id)||String(weapon.id)===String(id))).filter(Boolean);
 const primary=String(session.kind||session.farmType||'').toLocaleLowerCase('fr'),token=(primary&&primary!=='rest'?primary:[session.category,session.title].filter(Boolean).join(' ')).toLocaleLowerCase('fr');
 const kind=/artifact|artéfact|artefact/.test(token)?'artifact':/xp|exp/.test(token)?'xp':/mora/.test(token)?'mora':/aptitude|talent/.test(token)?'talent':/weapon|arme/.test(token)?'weapon':/weekly|hebdo/.test(token)?'weekly':/boss/.test(token)?'boss':'other';
 const supplementIds=new Set((session.supplements||[]).map(row=>String(row?.id??''))),items=[...new Set(session.materialIds||[])].map(id=>materials.find(m=>String(m.id??m._id)===String(id))).filter(Boolean).filter(item=>materialKind(item)!=='specialty'&&!(materialKind(item)==='talent'&&Number(item.rarity)<4)&&!/couronne de (?:la )?sagesse|crown of insight/i.test(item._name||item.name||'')&&!(kind==='mora'&&(/mora/i.test(item._name||item.name||'')||String(item.id??item._id)==='202')));
 // Les butins hebdomadaires sont des compléments : les placer d'abord garantit leur icône dans les vues compactes du calendrier.
 items.sort((a,b)=>Number(supplementIds.has(String(b.id??b._id))||materialKind(b)==='weekly')-Number(supplementIds.has(String(a.id??a._id))||materialKind(a)==='weekly'));
 const supplementItems=items.filter(item=>supplementIds.has(String(item.id??item._id))||materialKind(item)==='weekly'),supplementCount=(session.supplements||[]).reduce((sum,row)=>sum+Math.max(0,Number(row?.count)||0),0);
 return {people,weapons,items,supplementItems,supplementCount,kind,label:({artifact:'Artéfacts',xp:'Livres d’EXP',mora:'Mora',talent:'Aptitudes',weapon:'Armes',weekly:'Boss hebdomadaire',boss:'Boss d’ascension',other:'Session'})[kind],generic:['artifact','xp','mora','talent'].includes(kind)||!items.length};
}
