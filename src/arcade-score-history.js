export const ARCADE_HISTORY_KEY='astralis:arcade:score-history:v1';
const GAMES=new Set(['gi','hsr','ww']);
const cleanScore=value=>Math.max(0,Math.min(1_000_000_000,Math.floor(Number(value)||0)));

export function normalizeArcadeHistory(value){
 const source=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 return Object.fromEntries([...GAMES].map(game=>[game,(Array.isArray(source[game])?source[game]:[]).slice(0,10).map(row=>({id:String(row?.id||''),score:cleanScore(row?.score),lines:Math.max(0,Math.min(9999,Math.floor(Number(row?.lines)||0))),level:Math.max(1,Math.min(999,Math.floor(Number(row?.level)||1))),at:Number.isFinite(Date.parse(row?.at))?new Date(row.at).toISOString():''})).filter(row=>row.id&&row.at)]));
}

export function appendArcadeResult(history,game,result){
 const next=normalizeArcadeHistory(history);
 if(!GAMES.has(game))return next;
 const row={id:String(result?.id||`${game}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`),score:cleanScore(result?.score),lines:Math.max(0,Math.min(9999,Math.floor(Number(result?.lines)||0))),level:Math.max(1,Math.min(999,Math.floor(Number(result?.level)||1))),at:Number.isFinite(Date.parse(result?.at))?new Date(result.at).toISOString():new Date().toISOString()};
 next[game]=[row,...next[game].filter(item=>item.id!==row.id)].slice(0,10);
 return next;
}

export function renderArcadeHistoryMarkup(game,rows=[]){
 const recent=rows.slice(0,5),scores=recent.slice().reverse().map(row=>cleanScore(row.score));
 const width=220,height=52,pad=5,min=Math.min(...scores,0),max=Math.max(...scores,1),span=Math.max(1,max-min);
 const points=scores.map((score,index)=>`${pad+(scores.length<2?(width-pad*2)/2:index*(width-pad*2)/(scores.length-1))},${height-pad-((score-min)/span)*(height-pad*2)}`).join(' ');
 const chart=scores.length?`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Évolution des ${scores.length} dernier${scores.length>1?'s':''} score${scores.length>1?'s':''}"><defs><linearGradient id="arcade-history-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d5b6ff" stop-opacity=".35"/><stop offset="1" stop-color="#d5b6ff" stop-opacity="0"/></linearGradient></defs>${scores.length>1?`<polyline points="${points}" fill="none" stroke="#d5b6ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`:''}${scores.map((score,index)=>{const [x,y]=points.split(' ')[index].split(',');return `<circle cx="${x}" cy="${y}" r="3" fill="#ffe39a"><title>${score.toLocaleString('fr-FR')} points</title></circle>`}).join('')}</svg>`:'<div class="arcade-history-empty">Termine une partie pour tracer ta progression.</div>';
 const rowsHtml=recent.map((row,index)=>`<li><span class="arcade-history-rank">${String(index+1).padStart(2,'0')}</span><b>${row.score.toLocaleString('fr-FR')}</b><small>${row.lines} lignes · niv. ${row.level}</small><time datetime="${row.at}">${new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short'}).format(new Date(row.at))}</time></li>`).join('');
 return `<section class="arcade-history-card" data-arcade-history-game="${game}" aria-label="Historique local des scores"><header><div><small>TON PARCOURS · CET APPAREIL</small><b>Scores récents</b></div><span>${rows.length}/10</span></header>${chart}<ol>${rowsHtml||'<li class="arcade-history-first">Aucun score enregistré</li>'}</ol></section>`;
}

export function mountArcadeScoreHistory(root,game){
 const panel=root?.querySelector('[data-arcade-history]');if(!panel)return()=>{};
 let history={};try{history=normalizeArcadeHistory(JSON.parse(localStorage.getItem(ARCADE_HISTORY_KEY)||'{}'))}catch{history=normalizeArcadeHistory({});}
 const draw=()=>{panel.innerHTML=renderArcadeHistoryMarkup(game,history[game]||[]);};
 const onFinish=event=>{if(event.detail?.game!==game)return;history=appendArcadeResult(history,game,event.detail);try{localStorage.setItem(ARCADE_HISTORY_KEY,JSON.stringify(history));}catch{}draw();};
 draw();window.addEventListener('astralis:arcade-tetris-finished',onFinish);
 return()=>window.removeEventListener('astralis:arcade-tetris-finished',onFinish);
}
