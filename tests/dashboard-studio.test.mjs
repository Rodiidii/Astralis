import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultLayout,normalizeLayout,weekItems,orbitalPositions,normalizeCosmos,reorderDashboardWidgets,renderDashboardEmptyState} from '../src/dashboard-studio.js';
test('une disposition invalide est bornée et ses widgets restent uniques',()=>{
 const layout=normalizeLayout({name:'Test',widgets:[{id:'week',width:100,height:9999},{id:'week'},{id:'invalid'},{id:'team',width:-1,hidden:true}]});
 assert.equal(layout.widgets.length,2);assert.equal(layout.widgets[0].width,3);assert.equal(layout.widgets[0].height,900);assert.equal(layout.widgets[1].width,1);assert.equal(layout.widgets[1].hidden,true);
});
test('les copies de la disposition initiale sont indépendantes',()=>{
 const a=defaultLayout(),b=defaultLayout();a.widgets[0].hidden=true;assert.equal(b.widgets[0].hidden,false);
});
test('les widgets se réordonnent au clavier, sans sortir des limites ni muter la source',()=>{
 const rows=[{id:'a'},{id:'b'},{id:'c'}];
 assert.deepEqual(reorderDashboardWidgets(rows,'b',-1).map(x=>x.id),['b','a','c']);
 assert.deepEqual(reorderDashboardWidgets(rows,'b',1).map(x=>x.id),['a','c','b']);
 assert.deepEqual(reorderDashboardWidgets(rows,'a',-1).map(x=>x.id),['a','b','c']);
 assert.deepEqual(reorderDashboardWidgets(rows,'missing',1).map(x=>x.id),['a','b','c']);
 assert.deepEqual(rows.map(x=>x.id),['a','b','c']);
});
test('la semaine inclut événements en cours et départs sans inclure le lendemain',()=>{
 const now=new Date(2026,10,9,12),events=[{id:'active',start:new Date(2026,10,8).toISOString(),end:new Date(2026,10,10).toISOString()},{id:'future',start:new Date(2026,10,10).toISOString()},{id:'bad',start:'invalid'}];
 assert.deepEqual(weekItems(events,0,now).map(e=>e.id),['active']);assert.deepEqual(weekItems(events,1,now).map(e=>e.id),['active','future']);
});

test('la roue répartit ses widgets sans chevaucher leurs centres',()=>{
 const positions=orbitalPositions(12);assert.equal(positions.length,12);assert.equal(new Set(positions.map(p=>p.x+':'+p.y)).size,12);assert.ok(positions.every(p=>p.x>=7&&p.x<=93&&p.y>=7&&p.y<=93));assert.deepEqual(orbitalPositions(0),[]);
});

test('les réglages cosmiques sont validés et bornés',()=>{const value=normalizeCosmos({view:'invalid',color:'javascript:x',accent:'#aabbcc',stars:999,speed:-1,background:'invalid'});assert.equal(value.view,'orbit');assert.equal(value.color,'#050508');assert.equal(value.accent,'#aabbcc');assert.equal(value.stars,100);assert.equal(value.speed,.2);assert.equal(value.background,'galaxy');});
test('les préférences confort sont strictement booléennes et restent désactivées par défaut',()=>{assert.equal(normalizeCosmos({revision:6,motion:false}).motion,false);assert.equal(normalizeCosmos({}).softContrast,false);assert.equal(normalizeCosmos({softContrast:true}).softContrast,true);assert.equal(normalizeCosmos({softContrast:'yes'}).softContrast,false);});

test('les états vides guident vers une destination valide et échappent le contenu',()=>{
 const html=renderDashboardEmptyState({iconName:'tasks',title:'Aucun objectif',description:'Prépare <ta session>',nav:'tasks',action:'Organiser'});
 assert.match(html,/studio-guided-empty/);assert.match(html,/data-nav="tasks"/);assert.match(html,/Prépare &lt;ta session&gt;/);assert.match(html,/Organiser/);
 assert.doesNotMatch(renderDashboardEmptyState({title:'X',description:'Y',nav:'javascript:alert(1)',action:'Z'}),/javascript:/);
});

test('l’ancien fond bleu est migré sans écraser un choix récent',()=>{assert.equal(normalizeCosmos({color:'#090b20',motion:false}).color,'#050508');assert.equal(normalizeCosmos({color:'#101d35',motion:false}).motion,true);assert.equal(normalizeCosmos({revision:2,color:'#101d35',motion:false}).color,'#101d35');assert.equal(normalizeCosmos({revision:2,motion:false}).motion,false);});
