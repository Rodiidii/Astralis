const steps=[['checking','Vérification de la version'],['downloading','Téléchargement de l’archive'],['verifying','Vérification des fichiers'],['extracting','Décompression'],['closing','Fermeture de l’ancienne fenêtre et du serveur'],['replacing','Remplacement du dossier'],['starting','Démarrage du nouveau serveur'],['cleaning','Suppression de l’archive et nettoyage'],['opening','Ouverture de la nouvelle fenêtre']];
const active=new Set([...steps.map(([id])=>id),'staged','installing','restarting']);
const text=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const duration=value=>{const seconds=Math.max(0,Math.round(value));return seconds>=60?`${Math.floor(seconds/60)} min ${seconds%60} s`:`${seconds} s`;};
export function renderUpdateSteps(){return '<div class="update-step-tracker" data-update-steps hidden><div class="update-timing"><span data-update-elapsed></span><span data-update-eta></span></div><progress max="100" value="0" data-update-total aria-label="Progression totale de la mise à jour"></progress><ol>'+steps.map(([id,label])=>`<li data-update-step="${id}"><span class="update-step-dot" aria-hidden="true"></span><span>${label}</span><small data-step-state>À venir</small></li>`).join('')+'</ol><p>Le dossier garde son nom et son emplacement. Une estimation peut varier selon la connexion et la vitesse du disque.</p></div>';}
let latest=null,receivedAt=0,timer=null,closingJob='',openedSettings=false;
export function showUpdateProgress(status){
 const changed=!latest||status.updatedAt!==latest.updatedAt||status.state!==latest.state;latest=status;if(changed)receivedAt=Date.now();
 for(const tracker of document.querySelectorAll('[data-update-steps]')){
  tracker.hidden=!active.has(status.state)&&!['done','error'].includes(status.state);
  const entries=status.steps||steps.map(([id,label])=>({id,label,status:id===status.state?'active':'pending'}));
  for(const entry of entries){const row=tracker.querySelector(`[data-update-step="${entry.id}"]`);if(!row)continue;row.dataset.state=entry.status;row.querySelector('[data-step-state]').textContent=({done:'Terminé',active:'En cours',pending:'À venir'})[entry.status]||'À venir';}
  tracker.querySelector('[data-update-total]').value=Number(status.overallPercent)||0;
 }
 updateTimers();
 if(status.state==='closing'&&status.jobId&&closingJob!==status.jobId){closingJob=status.jobId;window.close();}
}
function updateTimers(){if(!latest)return;const delta=active.has(latest.state)?(Date.now()-receivedAt)/1000:0;document.querySelectorAll('[data-update-elapsed]').forEach(el=>el.textContent='Temps écoulé : '+duration((Number(latest.elapsedSeconds)||0)+delta));document.querySelectorAll('[data-update-eta]').forEach(el=>el.textContent=latest.state==='done'?'Installation terminée':latest.remainingSeconds!=null?(latest.remainingSeconds-delta<=0&&active.has(latest.state)?'Finalisation de l’étape…':'Temps restant estimé : '+duration(Math.max(0,latest.remainingSeconds-delta))):'Estimation en cours…');}
export function initUpdateProgress(){
 setInterval(updateTimers,1000);
 const poll=async()=>{if(!openedSettings&&new URLSearchParams(location.search).has('updated')){const button=document.querySelector('[data-nav=customize],[data-nav=settings]');if(button){openedSettings=true;button.click();}}try{const response=await fetch('/api/update/status',{cache:'no-store'});if(response.ok){const status=await response.json();showUpdateProgress(status);}}catch{/* The local server is expected to disconnect during replacement. */}finally{timer=setTimeout(poll,latest&&active.has(latest.state)?750:4000);}};
 poll();
 new MutationObserver(()=>{if(latest&&document.querySelector('[data-update-steps][hidden]')&&(active.has(latest.state)||['done','error'].includes(latest.state)))showUpdateProgress(latest);}).observe(document.documentElement,{childList:true,subtree:true});
}
