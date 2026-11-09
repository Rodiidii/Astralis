const trustedOrigins = new Set(['https://api.lunaris.moe', 'https://genshin-db-api.vercel.app']);

export const DEFAULT_IMPORT_SOURCES = Object.freeze({
  schemaVersion: 1,
  games: {
    gi: { lunaris: { versionUrl: 'https://api.lunaris.moe/data/version.json', dataTemplate: 'https://api.lunaris.moe/data/{version}/{file}' }, genshinDb: { apiBase: 'https://genshin-db-api.vercel.app/api/v5' } },
    hsr: { catalogBase: '/data/hsr', supplemental: 'assets/data/hsr-nanoka-{file}.json' },
    ww: { catalogBase: '/data/ww', materials: 'assets/data/ww-items.json' },
  },
});

function safeHttpsUrl(value, label) {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${label}: URL invalide.`); }
  if (url.protocol !== 'https:' || !trustedOrigins.has(url.origin) || url.username || url.password || url.hash) throw new Error(`${label}: origine HTTPS non autorisée.`);
  return url.href.replace(/\/$/, '');
}
function safeLocalPath(value, prefix, label) {
  const path = String(value || '');
  if (!path.startsWith(`${prefix}/`) || path.includes('..') || /[?#\\]/.test(path)) throw new Error(`${label}: chemin local invalide.`);
  return path;
}
export function validateImportSources(input) {
  if (!input || input.schemaVersion !== 1 || !input.games || typeof input.games !== 'object') throw new Error('Configuration des sources invalide.');
  const gi=input.games.gi||{}, hsr=input.games.hsr||{}, ww=input.games.ww||{}, template=String(gi.lunaris?.dataTemplate||'');
  if (!template.includes('{version}') || !template.includes('{file}')) throw new Error('Lunaris dataTemplate doit contenir {version} et {file}.');
  const versionUrl=safeHttpsUrl(gi.lunaris?.versionUrl,'Lunaris versionUrl');
  const dataTemplate=safeHttpsUrl(template.replace('{version}','1.0.0').replace('{file}','charlist.json'),'Lunaris dataTemplate');
  const apiBase=safeHttpsUrl(gi.genshinDb?.apiBase,'Genshin-DB apiBase');
  if (!apiBase.endsWith('/api/v5')) throw new Error('Genshin-DB apiBase non reconnu.');
  return {schemaVersion:1,games:{gi:{lunaris:{versionUrl,dataTemplate:template},genshinDb:{apiBase}},hsr:{catalogBase:safeLocalPath(hsr.catalogBase,'/data','HSR catalogBase'),supplemental:safeLocalPath(hsr.supplemental,'assets','HSR supplemental')},ww:{catalogBase:safeLocalPath(ww.catalogBase,'/data','WW catalogBase'),materials:safeLocalPath(ww.materials,'assets','WW materials')}}};
}
let configuredSources;
let sourceConfigStatus={status:'pending',message:'Configuration en attente.'};
export function importSourcesStatus(){return {...sourceConfigStatus};}
export async function importSources() {
  if(configuredSources)return configuredSources;
  try {
    const response=await fetch('./import-sources.json',{cache:'no-cache',signal:AbortSignal.timeout(5000)});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    configuredSources=validateImportSources(await response.json());
    sourceConfigStatus={status:'remote',message:'import-sources.json chargé et validé.'};
  } catch(error) {
    configuredSources=DEFAULT_IMPORT_SOURCES;
    sourceConfigStatus={status:'fallback',message:`Configuration locale de secours utilisée : ${String(error?.message||error)}`};
  }
  return configuredSources;
}
