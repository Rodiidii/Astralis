import {EL,ELC,G,I as vectorIcon} from '../sheet-backdrop.js';
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const fr=v=>v==null||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('fr-FR',{maximumFractionDigits:2}).replace(/\u00a0/g,'\u202f');
export const I=(key,size=24,color='currentColor',stroke=2)=>['hp','atk','def','em','er','healing','physical'].includes(key)?'<img alt="" src="'+new URL('../../assets/sheet-icons/'+key+'.png',import.meta.url).href+'" style="width:'+size+'px;height:'+size+'px;object-fit:contain;flex-shrink:0;mix-blend-mode:screen">':vectorIcon(key,size,color,stroke);
export const pct=(a,b)=>b?Math.round(a/b*100):0;
export const act=t=>({atk:'sword',skill:'star',burst:'ring',combo:'x2',end:'flag'})[t]||'sword';
export function shares(values){const nums=values.map(v=>Number.isFinite(Number(v))?Math.max(0,Number(v)):0),total=nums.reduce((a,b)=>a+b,0);if(!total)return nums.map(()=>0);const raw=nums.map(n=>n/total*1000),out=raw.map(Math.floor),order=raw.map((n,i)=>[i,n-out[i]]).sort((a,b)=>b[1]-a[1]);for(let i=0,left=1000-out.reduce((a,b)=>a+b,0);i<left;i++)out[order[i%order.length][0]]++;return out.map(n=>n/10)}
export function statRows(stats={}){return [['hp','PV','hp'],['atk','ATQ','atk'],['def','DÉF','def'],['em','Maîtrise','em'],['cr','Taux CRIT','critRate'],['cd','DGT CRIT','critDmg'],['er','Recharge','er'],['atk','Bonus de dégâts','dmgBonus']].map(([icon,label,key])=>[icon,label,fr(stats[key])+(['critRate','critDmg','er','dmgBonus'].includes(key)&&stats[key]!=null?' %':'')])}

export function context(data,el){
 const CH=Object.fromEntries(data.members.map((m,i)=>[String(i),{n:esc(m.name||'Emplacement libre'),el:EL[m.element]?m.element:el,img:String(i)}]));
 const IMG=Object.fromEntries(data.members.map((m,i)=>[String(i),m.image]));Object.assign(IMG,{ayaka:data.image,skirk:data.image,bennettHero:data.image});
 const asset=(src,el,icon)=>src?'<img class="sheet-item-image" src="'+src+'" alt="">':I(icon,42,EL[el].e2);
return {CH,IMG,asset};
}
