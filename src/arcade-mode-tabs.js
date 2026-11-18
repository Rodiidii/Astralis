export function moveArcadeTabIndex(count,current,key){
 if(!count)return -1;
 if(key==='Home')return 0;
 if(key==='End')return count-1;
 if(key==='ArrowRight'||key==='ArrowDown')return(current+1+count)%count;
 if(key==='ArrowLeft'||key==='ArrowUp')return(current-1+count)%count;
 return current;
}

const FAVORITES_KEY='astralis:arcade:favorite-modes:v1';

export function mountArcadeModeTabs(root=document.querySelector('[data-astral-arcade]')){
 const tablist=root?.querySelector('[role="tablist"][aria-label="Choisir un jeu"]');
 if(!tablist)return()=>{};
 const tabs=[...tablist.querySelectorAll('[role="tab"][data-arcade-mode]:not([disabled])')],validModes=new Set(tabs.map(tab=>tab.dataset.arcadeMode));
 const readFavorites=()=>{try{const saved=JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]');return Array.isArray(saved)?[...new Set(saved.filter(mode=>validModes.has(mode)))]:[]}catch{return[]}};
 const saveFavorites=favorites=>{try{localStorage.setItem(FAVORITES_KEY,JSON.stringify(favorites))}catch{}};
 const favoriteToggle=document.createElement('button');favoriteToggle.type='button';favoriteToggle.className='arcade-mode-favorite-toggle';favoriteToggle.dataset.arcadeFavoriteToggle='';
 const favoriteBar=document.createElement('nav');favoriteBar.className='arcade-favorite-modes';favoriteBar.dataset.arcadeFavorites='';favoriteBar.setAttribute('aria-label','Modes favoris');
 tablist.before(favoriteToggle);tablist.after(favoriteBar);
 const selectedTab=()=>tabs.find(tab=>tab.getAttribute('aria-selected')==='true')||tabs[0];
 const syncTabStops=()=>{const selected=selectedTab();tabs.forEach(tab=>{tab.tabIndex=tab===selected?0:-1;});};
 const paintFavorites=()=>{const favorites=readFavorites(),selected=selectedTab();favoriteToggle.disabled=!selected;favoriteToggle.setAttribute('aria-pressed',String(favorites.includes(selected?.dataset.arcadeMode)));favoriteToggle.setAttribute('aria-label',`${favorites.includes(selected?.dataset.arcadeMode)?'Retirer':'Ajouter'} ${selected?.textContent.trim()||'ce mode'} ${favorites.includes(selected?.dataset.arcadeMode)?'des':'aux'} favoris`);favoriteToggle.innerHTML=`<span aria-hidden="true">${favorites.includes(selected?.dataset.arcadeMode)?'★':'☆'}</span><span>${favorites.includes(selected?.dataset.arcadeMode)?'Favori':'Ajouter aux favoris'}</span>`;favoriteBar.hidden=!favorites.length;favoriteBar.innerHTML=favorites.map(mode=>{const tab=tabs.find(item=>item.dataset.arcadeMode===mode);return tab?`<button type="button" data-arcade-favorite-open="${mode}" aria-current="${selected===tab?'page':'false'}">${tab.textContent.trim()}</button>`:''}).join('');};
 const onKeyDown=event=>{
  const current=event.target.closest?.('[role="tab"][data-arcade-mode]');
  if(!current||!tablist.contains(current))return;
  const tabs=[...tablist.querySelectorAll('[role="tab"][data-arcade-mode]:not([disabled])')];
  const index=tabs.indexOf(current),next=moveArcadeTabIndex(tabs.length,index,event.key);
  if(next===index||next<0)return;
  event.preventDefault();
  const target=tabs[next];target.focus();target.click();target.focus({preventScroll:true});
 };
 const onClick=()=>queueMicrotask(()=>{syncTabStops();paintFavorites()});
 const onFavoriteToggle=()=>{const mode=selectedTab()?.dataset.arcadeMode;if(!mode)return;const favorites=readFavorites(),next=favorites.includes(mode)?favorites.filter(item=>item!==mode):[...favorites,mode];saveFavorites(next);paintFavorites()};
 const onFavoriteOpen=event=>{const button=event.target.closest?.('[data-arcade-favorite-open]');if(!button||!favoriteBar.contains(button))return;const tab=tabs.find(item=>item.dataset.arcadeMode===button.dataset.arcadeFavoriteOpen);if(tab){tab.click();tab.focus({preventScroll:true})}};
 tablist.addEventListener('keydown',onKeyDown);
 tablist.addEventListener('click',onClick);favoriteToggle.addEventListener('click',onFavoriteToggle);favoriteBar.addEventListener('click',onFavoriteOpen);syncTabStops();paintFavorites();
 return()=>{tablist.removeEventListener('keydown',onKeyDown);tablist.removeEventListener('click',onClick);favoriteToggle.removeEventListener('click',onFavoriteToggle);favoriteBar.removeEventListener('click',onFavoriteOpen);favoriteToggle.remove();favoriteBar.remove();};
}
