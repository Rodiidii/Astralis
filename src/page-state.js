/* Preserve local interaction state while asynchronous data refreshes the same view. */
function pathFor(node,root){
 const parts=[];
 while(node&&node!==root){
  let part=node.localName;if(!part)return null;
  if(node.id){parts.unshift('#'+CSS.escape(node.id));break;}
  const key=['data-build-id','data-team-id','data-build-picker','data-team-details'].find(key=>node.hasAttribute(key));
  if(key)part+='['+key+'="'+CSS.escape(node.getAttribute(key))+'"]';
  else {const siblings=[...node.parentElement.children].filter(el=>el.localName===node.localName);part+=':nth-of-type('+(siblings.indexOf(node)+1)+')';}
  parts.unshift(part);node=node.parentElement;
 }
 return parts.join(' > ');
}
function find(root,path){try{return path?root.querySelector(path):null;}catch{return null;}}
export function capturePageState(root,view){
 if(!root||root.dataset.viewKey!==view||!/(?:^|:)(teams|builds)$/.test(view))return null;
 const focused=root.contains(document.activeElement)?document.activeElement:null,ancestorScrolls=[];
 for(let el=root.parentElement;el;el=el.parentElement)if(el.scrollTop||el.scrollLeft)ancestorScrolls.push({path:pathFor(el,document.documentElement),top:el.scrollTop,left:el.scrollLeft});
 return {view,windowX:window.scrollX,windowY:window.scrollY,ancestorScrolls,
  details:[...root.querySelectorAll('details')].map(el=>({path:pathFor(el,root),open:el.open})),
  teams:[...root.querySelectorAll('[data-team-details]')].map(el=>({id:el.dataset.teamDetails,hidden:el.hidden})),
  searches:[...root.querySelectorAll('[data-image-picker-search]')].map(el=>({path:pathFor(el,root),value:el.value})),
  scrolls:[...root.querySelectorAll('.image-picker-pop,.image-picker-options,.build-relic-piece-list,.build-relic-set-grid,.team-sheet-details')].filter(el=>el.scrollTop||el.scrollLeft).map(el=>({path:pathFor(el,root),top:el.scrollTop,left:el.scrollLeft})),
  focus:focused?{path:pathFor(focused,root),value:'value'in focused?focused.value:null,start:focused.selectionStart,end:focused.selectionEnd}:null};
}
export function restorePageState(root,snapshot,view){
 if(!root)return;root.dataset.viewKey=view;
 if(!snapshot||snapshot.view!==view)return;
 for(const row of snapshot.details){const el=find(root,row.path);if(el)el.open=row.open;}
 for(const row of snapshot.teams){const section=[...root.querySelectorAll('[data-team-details]')].find(el=>el.dataset.teamDetails===row.id);if(section)section.hidden=row.hidden;const button=[...root.querySelectorAll('[data-team-details-toggle]')].find(el=>el.dataset.teamDetailsToggle===row.id);if(button)button.setAttribute('aria-expanded',String(!row.hidden));}
 for(const row of snapshot.searches){const el=find(root,row.path);if(el){el.value=row.value;el.dispatchEvent(new Event('input',{bubbles:true}));}}
 for(const row of snapshot.scrolls){const el=find(root,row.path);if(el){el.scrollTo({top:row.top,left:row.left,behavior:'instant'});}}
 const focus=snapshot.focus,control=focus&&find(root,focus.path);
 if(control){if(focus.value!==null&&control.type!=='file')control.value=focus.value;control.focus({preventScroll:true});if(focus.start!==null&&typeof control.setSelectionRange==='function')try{control.setSelectionRange(focus.start,focus.end);}catch{}}
 window.scrollTo({left:snapshot.windowX,top:snapshot.windowY,behavior:'instant'});
 for(const row of snapshot.ancestorScrolls||[]){const el=find(document,row.path);if(el){el.scrollTo({top:row.top,left:row.left,behavior:'instant'});}}
}
