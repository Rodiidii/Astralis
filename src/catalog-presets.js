const KEY='astralis:catalog-filter-presets:v1';

export function normalizeCatalogPreset(value={}){
 return {query:String(value.query||'').slice(0,120),element:String(value.element||'all'),weaponType:String(value.weaponType||'all'),rarity:['all','3','4','5'].includes(String(value.rarity))?String(value.rarity):'all',ownedOnly:!!value.ownedOnly,order:['release','name','rarity'].includes(value.order)?value.order:'release',view:value.view==='list'?'list':'grid'};
}
export function readCatalogPresets(storage=globalThis.localStorage,scope=''){
 try{const all=JSON.parse(storage?.getItem(KEY)||'{}'),rows=all?.[String(scope)]||[];return Array.isArray(rows)?rows.filter(row=>row&&typeof row.id==='string'&&typeof row.name==='string').slice(0,20).map(row=>({id:row.id,name:row.name.slice(0,40),filters:normalizeCatalogPreset(row.filters)})):[]}catch{return []}
}
export function saveCatalogPreset(storage,scope,name,filters,idFactory=()=>globalThis.crypto?.randomUUID?.()||`preset-${Date.now()}`){
 const label=String(name||'').trim().slice(0,40);if(!label)throw new Error('Donne un nom à ce filtre.');const all=(()=>{try{return JSON.parse(storage?.getItem(KEY)||'{}')}catch{return {}}})(),rows=readCatalogPresets(storage,scope),id=String(idFactory()),existing=rows.findIndex(row=>row.id===id),duplicate=rows.findIndex(row=>row.name.toLocaleLowerCase('fr')===label.toLocaleLowerCase('fr'));
 const row={id,name:label,filters:normalizeCatalogPreset(filters)};if(duplicate>=0)rows.splice(duplicate,1);if(existing>=0){const old=rows.findIndex(item=>item.id===id);if(old>=0)rows.splice(old,1);}rows.unshift(row);all[String(scope)]=rows.slice(0,20);storage.setItem(KEY,JSON.stringify(all));return row;
}
export function deleteCatalogPreset(storage,scope,id){
 const all=(()=>{try{return JSON.parse(storage?.getItem(KEY)||'{}')}catch{return {}}})(),rows=readCatalogPresets(storage,scope),next=rows.filter(row=>row.id!==String(id));if(next.length===rows.length)return false;if(next.length)all[String(scope)]=next;else delete all[String(scope)];storage.setItem(KEY,JSON.stringify(all));return true;
}
