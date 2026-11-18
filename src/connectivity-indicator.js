function updateConnectivity(){
  const online=navigator.onLine, label=online?'En ligne · espace local prêt':'Hors ligne · sauvegardes locales disponibles';
  document.querySelectorAll('[data-app-connectivity]').forEach(node=>{if(node.textContent!==label)node.textContent=label;if(node.dataset.connectivity!==(online?'online':'offline'))node.dataset.connectivity=online?'online':'offline';if(node.getAttribute('aria-label')!==label)node.setAttribute('aria-label',label);});
  document.querySelectorAll('[data-connectivity-mark]').forEach(node=>{node.dataset.connectivity=online?'online':'offline';node.title=online?'Connexion internet disponible':'Mode hors ligne : les données locales restent accessibles';});
}
window.addEventListener('online',updateConnectivity);
window.addEventListener('offline',updateConnectivity);
new MutationObserver(updateConnectivity).observe(document.documentElement,{childList:true,subtree:true});
updateConnectivity();
