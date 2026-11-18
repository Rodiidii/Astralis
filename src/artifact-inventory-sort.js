const weights={critRate:1.9,critDmg:1,atkPct:.72,atkFlat:.28,em:.12,er:.12,hpPct:.25,defPct:.2,dmgBonus:1.1,pyroDmg:1.1,hydroDmg:1.1,cryoDmg:1.1,electroDmg:1.1,anemoDmg:1.1,geoDmg:1.1,dendroDmg:1.1,physicalDmg:1.1};

export function artifactQuickScore(piece={}){
 const stats=[{type:piece.mainType,value:piece.mainValue},...(piece.substats||[])];
 return stats.reduce((sum,row)=>sum+(weights[row.type]||0)*(Number(row.value)||0),0);
}

export function sortArtifactInventory(rows=[],mode='score'){
 return rows.map((row,index)=>({row,index})).sort((a,b)=>{
  if(mode==='level')return (Number(b.row.level)||0)-(Number(a.row.level)||0)||a.index-b.index;
  if(mode==='rarity')return (Number(b.row.rarity)||0)-(Number(a.row.rarity)||0)||(Number(b.row.level)||0)-(Number(a.row.level)||0)||a.index-b.index;
  if(mode==='score')return artifactQuickScore(b.row)-artifactQuickScore(a.row)||(Number(b.row.level)||0)-(Number(a.row.level)||0)||a.index-b.index;
  return a.index-b.index;
 }).map(entry=>entry.row);
}
