export const WORKSPACE_BACKUP_KEYS=Object.freeze(['astralis:gi:objectives-v2','astralis:gi:talent-targets','astralis:gi:farm-priority','astralis:gi:farm-xp','astralis:gi:farm-simulation','astralis:local-profile:v1','astralis:collection-binder:v1','astralis:booster-quests:v1','astralis:astral-seal:v1','astralis:studio:gi','astralis:studio:hsr','astralis:studio:ww']);
export function exportWorkspaceState(storage){
 const entries={};for(const key of WORKSPACE_BACKUP_KEYS){const raw=storage.getItem(key);if(raw!=null){try{JSON.parse(raw);}catch{throw new Error('Données locales illisibles : '+key);}entries[key]=raw;}}
 return {version:1,entries};
}
export function validateWorkspaceState(value){
 if(value==null)return [];
 if(value.version!==1||!value.entries||typeof value.entries!=='object'||Array.isArray(value.entries))throw new Error('Extension de sauvegarde invalide.');
 const entries=Object.entries(value.entries);
 for(const[key,raw]of entries){if(!WORKSPACE_BACKUP_KEYS.includes(key)||typeof raw!=='string')throw new Error('Clé de sauvegarde non autorisée : '+key);try{JSON.parse(raw);}catch{throw new Error('Donnée JSON invalide : '+key);}}
 return entries;
}
export function restoreWorkspaceState(storage,value){
 const entries=validateWorkspaceState(value),previous=new Map(entries.map(([key])=>[key,storage.getItem(key)]));
 try{for(const[key,raw]of entries)storage.setItem(key,raw);}catch(error){for(const[key,raw]of previous)try{if(raw==null)storage.removeItem(key);else storage.setItem(key,raw);}catch{}throw error;}
 return entries.length;
}

export function backupReminderDue(storage,enabled=true,now=Date.now()){
 if(!enabled)return false;
 const last=Number(storage.getItem('astralis:backup:last-export'))||0,snooze=Number(storage.getItem('astralis:backup:snooze-until'))||0;
 const content=WORKSPACE_BACKUP_KEYS.some(key=>{const raw=storage.getItem(key);return raw&&raw!=='{}'&&raw!=='[]';});
 return content&&now>=snooze&&(!last||now-last>=7*86400000);
}
