const CACHE='astralis-shell-v35';
const SHELL=['/','/index.html','/manifest.webmanifest','/styles.css','/design.css','/design-system.css','/global-refresh.css','/character-polish.css','/character-theme.css','/assistant.css','/dashboard-polish.css','/typography.css','/artifact-layout.css','/ui-refinement.css','/motion-library.css','/binder.css','/binder-static.css','/booster-effects.css','/booster-ui.css','/card-polish.css','/card-dopamine.css','/card-pokemon.css','/updater.css','/repair-suite.css','/lab.css','/launch-screen.css','/profile-editor.css','/team-layout-fix.css','/topbar-resources.css','/src/wish-pulls.js','/src/character-content.js','/src/app.js','/src/lab-page.js','/src/artifact-model.js','/src/damage-engine.js','/src/optimizer.js','/src/optimizer.worker.js','/src/priority-list.js','/src/motion-library.js','/src/data.js','/src/icons.js','/src/persistence.js','/assets/app-icon.svg','/assets/ui/game-genshin.png','/assets/ui/game-starrail.png','/assets/ui/game-wuthering.png','/assets/ui/currency-genshin-primogem.png','/assets/ui/currency-genshin-fate.png','/assets/ui/currency-genshin-resin.png','/assets/ui/currency-starrail-jade.png','/assets/ui/currency-starrail-pass.png','/assets/ui/currency-starrail-special-pass.png','/assets/genshin/elements/gi-anemo.png','/assets/genshin/elements/gi-cryo.png','/assets/genshin/elements/gi-dendro.png','/assets/genshin/elements/gi-electro.png','/assets/genshin/elements/gi-geo.png','/assets/genshin/elements/gi-hydro.png','/assets/genshin/elements/gi-pyro.png','/assets/genshin/weapons/types/bow.png','/assets/genshin/weapons/types/catalyst.png','/assets/genshin/weapons/types/claymore.png','/assets/genshin/weapons/types/polearm.png','/assets/genshin/weapons/types/sword.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL.map(path=>new Request(path,{cache:'reload'}))).catch(()=>{})).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('astralis-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin||url.pathname.startsWith('/api/'))return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('/index.html',copy));return response}).catch(()=>caches.match('/index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>{
    if(cached)return cached;
    return fetch(req).then(response=>{
      if(response.ok)caches.open(CACHE).then(cache=>cache.put(req,response.clone()));
      return response;
    }).catch(()=>caches.match(req,{ignoreSearch:true}));
  }));
});
