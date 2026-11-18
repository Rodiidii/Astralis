import { RELATION_REFERENCE, parseReferencePage, parseReferenceBundle, referenceStoryUrl } from '../src/relation-reference-audit.js';

const response = await fetch(RELATION_REFERENCE.url, { headers: { 'user-agent': 'Astralis reference availability audit' } });
if (!response.ok) throw new Error(`La page de référence répond HTTP ${response.status}.`);
const html = await response.text();
const counts = parseReferencePage(html);
if (!counts) throw new Error('Les compteurs attendus ne sont plus présents dans la page. Vérifie son nouveau format manuellement.');
const pageUrl=new URL(RELATION_REFERENCE.url);
const scriptUrls=[...html.matchAll(/<script[^>]+src="([^"]+)/g)].map(match=>new URL(match[1],pageUrl).href).filter(url=>new URL(url).origin===pageUrl.origin);
const bundles=await Promise.all(scriptUrls.map(async url=>{
  const response=await fetch(url,{headers:{'user-agent':'Astralis reference availability audit'}});
  if(!response.ok)throw new Error(`Une ressource client de la référence répond HTTP ${response.status}.`);
  return {url,text:await response.text()};
}));
const bundle=bundles.map(item=>({url:item.url,stats:parseReferenceBundle(item.text)})).find(item=>item.stats);
if(!bundle)throw new Error('Le compteur agrégé de la base n’a pas été trouvé dans les scripts chargés par la page.');
if(bundle.stats.storyLines!==counts.storyLines||bundle.stats.quests!==counts.quests)throw new Error('Les compteurs de page et de bundle divergent; vérification manuelle nécessaire.');
const sampleResponse = await fetch(referenceStoryUrl('Amber', 'en'));
if (!sampleResponse.ok) throw new Error(`Le JSON témoin répond HTTP ${sampleResponse.status}.`);
const sample = await sampleResponse.json();
if (!Array.isArray(sample)) throw new Error('Le JSON témoin n’a pas la structure attendue.');
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), pageStatus: response.status, counts, staticBundle:bundle, jsonDelivery:{status:sampleResponse.status,character:'Amber',language:'en',sections:sample.length}, bulkDatabaseOrDocumentedApi: false, note:'Les compteurs du bundle sont des agrégats; le JSON est servi par fiche. Ce contrôle ne télécharge pas le corpus narratif.' }, null, 2));
