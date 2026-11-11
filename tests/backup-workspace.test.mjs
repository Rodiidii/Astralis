import test from 'node:test';
import assert from 'node:assert/strict';
import {backupReminderDue,exportWorkspaceState,restoreWorkspaceState,validateWorkspaceState,WORKSPACE_BACKUP_KEYS} from '../src/backup-workspace.js';
function storage(seed={}){const rows=new Map(Object.entries(seed));return {getItem:k=>rows.get(k)??null,setItem:(k,v)=>rows.set(k,v),removeItem:k=>rows.delete(k)};}
test('objectifs, talents, farm et classeur font un aller-retour sans perte',()=>{
 const input=storage(Object.fromEntries(WORKSPACE_BACKUP_KEYS.map((key,i)=>[key,JSON.stringify({value:i,text:'Français · données'})]))),output=storage();
 const save=exportWorkspaceState(input);assert.equal(restoreWorkspaceState(output,JSON.parse(JSON.stringify(save))),WORKSPACE_BACKUP_KEYS.length);assert.deepEqual(exportWorkspaceState(output),save);
});
test('les sauvegardes anciennes restent acceptées et les clés inattendues sont rejetées avant écriture',()=>{
 assert.deepEqual(validateWorkspaceState(undefined),[]);assert.throws(()=>validateWorkspaceState({version:2,entries:{}}));
 const store=storage({'astralis:gi:farm-xp':'{"purple":5}'});assert.throws(()=>restoreWorkspaceState(store,{version:1,entries:{'astralis:gi:farm-xp':'{"purple":9}','secret-token':'"x"'}}));assert.equal(store.getItem('astralis:gi:farm-xp'),' {"purple":5}'.trim());
 assert.throws(()=>validateWorkspaceState({version:1,entries:{'astralis:gi:farm-xp':'invalid'}}));
});
test('une écriture interrompue restaure les clés déjà remplacées',()=>{
 const base=storage({'astralis:gi:farm-xp':'1'});let calls=0;const store={...base,setItem:(key,value)=>{if(++calls===2)throw new Error('quota');return base.setItem(key,value);}};
 assert.throws(()=>restoreWorkspaceState(store,{version:1,entries:{'astralis:gi:farm-xp':'2','astralis:gi:farm-priority':'[]'}}));assert.equal(store.getItem('astralis:gi:farm-xp'),'1');
});

test('rappel configurable après sept jours, avec report d’une journée',()=>{
 const now=1000000000,store=storage({'astralis:gi:farm-xp':'{"purple":5}'});assert.equal(backupReminderDue(store,true,now),true);assert.equal(backupReminderDue(store,false,now),false);assert.equal(backupReminderDue(storage(),true,now),false);
 store.setItem('astralis:backup:last-export',String(now));assert.equal(backupReminderDue(store,true,now+6*86400000),false);assert.equal(backupReminderDue(store,true,now+7*86400000),true);
 store.setItem('astralis:backup:snooze-until',String(now+8*86400000));assert.equal(backupReminderDue(store,true,now+7*86400000),false);
});
