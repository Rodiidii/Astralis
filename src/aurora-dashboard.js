import {renderHomePortal,mountHomePortal} from './home-portal.js?v=20261126-portal-play-1';
let context;
export function dashboardBrief(c={},today=new Date().toLocaleDateString('sv-SE')){const tasks=(c.tasks||[]).filter(t=>!t.done),farm=(c.farmRows||[]).filter(r=>!r.done&&r.date===today),events=(c.events||[]).filter(e=>String(e.end||e.start||'').slice(0,10)>=today).sort((a,b)=>String(a.end||a.start).localeCompare(String(b.end||b.start))),p=c.wishes||{};return {tasks,today:tasks.filter(t=>!t.due||t.due<=today),farm,events,wishes:Math.max(0,Number(p.wishes)||0)+Math.floor(Math.max(0,Number(p.currentPrimos??p.primos)||0)/160),builds:c.builds?.length||0,teams:c.savedTeams?.length||0};}
export function renderAuroraDashboard(c){context=c;return renderHomePortal(c,dashboardBrief(c));}
export function mountAuroraDashboard(root){if(root)mountHomePortal(root,context);}
