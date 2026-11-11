import {EL,ELC,G} from '../sheet-backdrop.js';
import {I,esc,fr,pct,act,shares,statRows,context} from './common.js';
export function template(data,el){
const {CH,IMG,asset}=context(data,el);

 const cards=data.members.map((m,i)=>[String(i),m.role||'',m.weapon?.name||'—',m.set?.name||'—','C'+(m.constellation??'—')+' · '+(m.talents||[]).join('/'),[['ATQ',fr(m.stats?.atk)],['CRIT %',fr(m.stats?.critRate)+' / '+fr(m.stats?.critDmg)],['MÎ',fr(m.stats?.em)]],m.focalX||50]);
 const rot=(data.rotation||[]).map(a=>[esc(a.name||a.label||a.code||'Action'),String(Math.max(0,data.members.findIndex(m=>String(m.id)===String(a.character)))),({E:'skill',Q:'burst',N:'atk',A:'atk',C:'atk',comboStart:'combo',comboEnd:'end'})[a.code||a.type]||a.type||'atk']);
 const share=shares(data.members.map(m=>m.damage)).map((value,i)=>[String(i),value]);
 return `<div class="in">
 <div style="position:absolute;left:78px;top:62px"><div class="kick"><b>Astralis</b> &nbsp;/&nbsp; Équipe</div>
  <div class="ttl" style="margin-top:14px">${esc(data.title||data.name||'Fiche personnelle')}</div>
  <div style="display:flex;gap:14px;margin-top:20px;align-items:center">
   <span class="chip">${Object.values(CH).map(c=>G(c.el,24,ELC[c.el],2)).join('')}&nbsp;Résonance · ${new Set(data.members.map(m=>m.element)).size} éléments</span>
   <span class="chip" style="background:#ffffff0d;border-color:#ffffff30;color:#f3eee4">${I('flag',22)}Rotation de ${fr(data.duration)} s</span></div></div>

 <div style="position:absolute;left:78px;right:78px;top:332px"><div class="sl"><span class="dia"></span>Composition<i></i></div></div>
 <div style="position:absolute;left:78px;right:78px;top:384px;display:grid;grid-template-columns:repeat(4,1fr);gap:26px">
 ${cards.map(([k,role,w,s,c,st,pos])=>{const h=CH[k],col=ELC[h.el];return `<div class="pn" style="height:690px;border-color:${col}99;box-shadow:0 22px 44px #0007,0 0 36px ${col}33">
  <div style="position:relative;height:400px"><img class="art" src="${IMG[h.img]}" style="inset:0;width:100%;height:100%;object-position:${pos}% 35%"/>
   <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0000 42%,#0b0b12f2 100%),radial-gradient(90% 60% at 50% 0%,${col}33,transparent)"></div>
   <div class="ico" style="position:absolute;left:18px;top:18px;width:62px;height:62px;background:#0b0b12cc;border:2.5px solid ${col};box-shadow:0 0 22px ${col}99">${G(h.el,34,col,2)}</div>
   <div style="position:absolute;right:18px;top:22px;height:42px;padding:0 20px;border-radius:999px;font:700 21px/42px var(--sans);background:${col};color:#0b0b12">${esc(role)}</div>
   <div style="position:absolute;left:22px;right:22px;bottom:16px"><div style="font:700 72px/.95 var(--serif);text-shadow:0 3px 16px #000">${h.n}</div>
    <div style="height:3px;width:90px;margin-top:10px;border-radius:2px;background:${col};box-shadow:0 0 12px ${col}"></div></div></div>
  <div style="padding:16px 22px;display:grid;gap:10px">
   <div style="display:flex;gap:16px;align-items:center"><span class="ico" style="width:54px;height:54px;border-radius:14px;background:${col}22;border:1.5px solid ${col}77;color:${col}">${asset(data.members[Number(k)]?.weapon?.image,h.el,'sword')}</span><div><div style="font:600 25px/1.15 var(--sans)">${esc(w)}</div><div class="mut" style="font:500 18px var(--sans)">Arme</div></div></div>
   <div style="display:flex;gap:16px;align-items:center"><span class="ico" style="width:54px;height:54px;border-radius:14px;background:${col}22;border:1.5px solid ${col}77;color:${col}">${asset(data.members[Number(k)]?.set?.image,h.el,'flower')}</span><div><div style="font:600 25px/1.15 var(--sans)">${esc(s)}</div><div class="mut" style="font:500 18px var(--sans)">${esc(data.members[Number(k)]?.set?.detail||'Set équipé')}</div></div></div>
   <div class="sheet-team-stats" style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;padding:9px 0;border-top:1px solid #ffffff25;border-bottom:1px solid #ffffff25">${st.map(([a,b])=>`<div style="padding:3px 8px;text-align:center"><div class="mut" style="font:600 15px var(--sans);letter-spacing:.08em">${a}</div><div style="font:700 21px/1.2 var(--sans)">${b}</div></div>`).join('')}</div>
   <div style="font:700 20px var(--sans);letter-spacing:.16em;color:${col}">${c}</div></div></div>`}).join('')}
 </div>

 <div style="position:absolute;left:78px;right:78px;top:1110px"><div class="sl"><span class="dia"></span>Rotation<i></i><em>${data.rotation?.length||0} étapes</em></div></div>
 <div style="position:absolute;left:78px;right:78px;top:1164px;min-height:170px">
  <div style="position:absolute;left:100px;right:100px;top:41px;height:3px;background:linear-gradient(90deg,transparent,var(--e1) 12%,var(--e1) 88%,transparent);opacity:.55;box-shadow:0 0 14px var(--e1)"></div>
  <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px">
  ${rot.map(([n,k,t],i)=>{const col=ELC[CH[k].el];return `<div style="text-align:center;position:relative">
   <div class="ico" style="width:84px;height:84px;margin:0 auto;background:radial-gradient(circle at 35% 30%,${col}55,#0b0b12 70%);border:3px solid ${col};box-shadow:0 0 22px ${col}77;color:#fff;position:relative">${asset(data.rotation[i]?.image,CH[k].el,act(t)).replace('class="sheet-item-image"','class="sheet-item-image sheet-rotation-skill"')}
    <b style="position:absolute;right:-6px;top:-6px;width:32px;height:32px;border-radius:50%;background:var(--e1);color:#10131a;font:800 18px/32px var(--sans)">${i+1}</b></div>
   <div style="font:600 21px/1.2 var(--sans);margin-top:12px;padding:0 4px">${n}</div>
   <div class="mut" style="font:500 17px var(--sans);margin-top:3px">${CH[k].n}</div></div>`}).join('')}</div></div>

 <div style="position:absolute;left:78px;right:78px;top:1370px;height:126px" class="pn glow">
  <div style="position:absolute;left:32px;top:18px"><div class="mut" style="font:600 17px var(--sans);letter-spacing:.2em;text-transform:uppercase">Dégâts théoriques · cible niv. ${esc(data.enemy?.level??'—')}</div>
   <div class="num" style="font-size:66px;line-height:1.05;margin-top:2px">${fr(data.damage?.total)} <span style="font:600 24px var(--sans);color:var(--e2)">/ rotation</span></div></div>
  <div style="position:absolute;left:760px;right:32px;top:26px"><div style="display:flex;height:28px;border-radius:14px;overflow:hidden;gap:3px">
   ${share.map(([k,p])=>`<div style="width:${p}%;background:${ELC[CH[k].el]};border-radius:6px"></div>`).join('')}</div>
   <div style="display:flex;gap:26px;margin-top:16px;font:600 20px var(--sans)">${share.map(([k,p])=>`<span style="display:flex;gap:9px;align-items:center"><i style="width:14px;height:14px;border-radius:50%;background:${ELC[CH[k].el]}"></i>${CH[k].n} <b>${p} %</b></span>`).join('')}</div></div></div>
 <div class="foot" style="bottom:30px"><span>Signé · <b>${esc(data.signature||'Astralis')}</b></span><span>Astralis · Équipe</span></div></div>`
}
