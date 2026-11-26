import assert from 'node:assert/strict';
import test from 'node:test';
import {libraryMatches,libraryText} from '../src/library-workspace.js';

const filters=()=>({query:'',facet:'all',extra:'all',weapon:'all',rarity:'all',scope:'all',watch:[],quantities:{}});
const entry={id:'test',name:'Épée du souvenir',facet:'Épée à une main',extra:'DGT CRIT',weapon:'',rarity:5,description:'Une arme ancienne.',secondary:'DGT CRIT',effects:[{text:'Après une compétence, augmente la maîtrise élémentaire.'}],sources:['Forge de Fontaine'],owned:false,favorite:true};

test('la recherche ignore les accents et trouve plusieurs mots dans le passif et les sources',()=>{
 assert.equal(libraryMatches(entry,{...filters(),query:'epee maitrise fontaine'}),true);
 assert.equal(libraryMatches(entry,{...filters(),query:'fontaine soin'}),false);
});
test('les filtres exacts se combinent avec la rareté et le statut de collection',()=>{
 assert.equal(libraryMatches(entry,{...filters(),facet:'Épée à une main',extra:'DGT CRIT',rarity:'5',scope:'favorites'}),true);
 assert.equal(libraryMatches(entry,{...filters(),rarity:'4'}),false);
 assert.equal(libraryMatches(entry,{...filters(),scope:'owned'}),false);
 assert.equal(libraryMatches(entry,{...filters(),scope:'missing'}),true);
});
test('la liste à réunir utilise le manque réel et exclut un objectif atteint ou absent',()=>{
 assert.equal(Boolean(libraryMatches(entry,{...filters(),scope:'needed'})),false);
 assert.equal(libraryMatches(entry,{...filters(),scope:'needed',quantities:{test:{have:12,target:46}}}),true);
 assert.equal(libraryMatches(entry,{...filters(),scope:'needed',quantities:{test:{have:46,target:46}}}),false);
 assert.equal(libraryMatches(entry,{...filters(),scope:'watch',watch:['test']}),true);
});
test('les descriptions de sources se lisent sans balises ni libellés sérialisés',()=>{
 assert.equal(libraryText({description:'<b>Bonus</b><br>ATQ &amp; maîtrise'}),'Bonus\nATQ & maîtrise');
 assert.equal(libraryText([{name:'Forge'},'Synthèse']),'Forge · Synthèse');
});
