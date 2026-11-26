"""Verify Genshin catalog synchronization and changelog against live sources."""
import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright

ORIGIN = os.environ.get("ASTRALIS_TEST_ORIGIN", "http://127.0.0.1:8894")
ARTIFACTS = Path("artifacts")
ARTIFACTS.mkdir(exist_ok=True)

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            executable_path=r"C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe",
            headless=True,
        )
        context = await browser.new_context(viewport={"width": 1440, "height": 1000}, service_workers="block")
        await context.add_init_script("""if(!sessionStorage.getItem('astralis:qa-catalog-sync-seeded')){
          localStorage.setItem('astralis:active-game','gi');
          localStorage.setItem('astralis:preferences',JSON.stringify({theme:'midnight',characterThemeMode:'manual',characterThemeId:'nahida',characterThemeIds:{gi:'nahida'},reducedMotion:true,autoRefresh:true,backupReminder:false,shellLaunch:false}));
          localStorage.setItem('astralis:gi:synced-source-version:v1','0.0.0');
          localStorage.removeItem('astralis:gi:catalog-diffs:v3');localStorage.removeItem('astralis:data:additions:v2');
          sessionStorage.setItem('astralis:qa-catalog-sync-seeded','1');
        }""")
        await context.add_init_script("""window.__topToastEvents=[];const observer=new MutationObserver(records=>{for(const record of records){for(const node of record.addedNodes){if(node.nodeType===1&&node.matches?.('.toast-message-top'))window.__topToastEvents.push({node,text:node.textContent,createdAt:Date.now(),removedAt:0})}for(const node of record.removedNodes){const toast=window.__topToastEvents.findLast(row=>row.node===node);if(toast)toast.removedAt=Date.now()}}});observer.observe(document,{childList:true,subtree:true});""")
        page = await context.new_page()
        page.set_default_timeout(30000)
        errors = []
        catalog_requests = []
        def track_catalog_request(request):
            if ("api.lunaris.moe/data/" in request.url and not request.url.endswith("/version.json")) or "genshin-db-api.vercel.app/api/v5/" in request.url:
                catalog_requests.append(request.url)
        page.on("request", track_catalog_request)
        page.on("pageerror", lambda error: errors.append(str(error)))
        await page.goto(ORIGIN, wait_until="domcontentloaded", timeout=60000)
        await page.locator(".shell-v2").wait_for(timeout=45000)
        await page.wait_for_function("()=>window.__topToastEvents?.some(row=>row.text.includes('Mise à jour de données trouvée'))", timeout=20000)
        await page.wait_for_function("()=>window.__topToastEvents?.some(row=>row.text.includes('Mise à jour de données trouvée')&&row.removedAt)", timeout=20000)
        startup = await page.evaluate("""()=>{const toast=window.__topToastEvents.find(row=>row.text.includes('Mise à jour de données trouvée'));return {lastSync:localStorage.getItem('astralis:data:last-sync:gi'),notice:JSON.parse(localStorage.getItem('astralis:gi:update-notice:v1')||'null'),
          notification:toast?.text||'',notificationDuration:toast?.removedAt-toast?.createdAt,badge:document.querySelector('[data-data-update-badge]')?.textContent||'',game:localStorage.getItem('astralis:active-game'),visibility:document.visibilityState,appReady:document.documentElement.dataset.appReady}}""")
        print('STARTUP_DEBUG', json.dumps(startup, ensure_ascii=False))
        assert startup["lastSync"] is None, startup
        assert 'Mise à jour de données trouvée' in startup['notification'], startup
        assert 9900 <= startup['notificationDuration'] <= 15000, startup
        assert startup['badge']=='New', startup

        # Seed the last bundled catalog as the previous local copy. The button
        # must fetch the current catalog itself and preserve the cache format.
        baseline = await page.evaluate("""async()=>{
          const {putLocal}=await import('/src/persistence.js');
          const [characters,weapons,artifacts]=await Promise.all(['characters','weapons','artifacts'].map(name=>fetch('/assets/data/gi-'+name+'.json',{cache:'no-cache'}).then(r=>r.json())));
          const normalize=(rows,category)=>rows.map(row=>({...row,_id:String(row.id),_name:row.name,_game:'gi',_category:category}));
          for(const [category,rows] of Object.entries({character:characters,weapon:weapons,artifact:artifacts}))await putLocal('cache',`catalog:studio64:gi:${category}`,{items:normalize(rows,category),savedAt:0});
          localStorage.removeItem('astralis:gi:catalog-diffs:v3');localStorage.removeItem('astralis:data:additions:v2');localStorage.removeItem('astralis:gi:manual-sync-baseline:v1');
          return {characters:characters.length,weapons:weapons.length,artifacts:artifacts.length};
        }""")
        catalog_requests.clear()
        await page.reload(wait_until="domcontentloaded", timeout=60000)
        await page.locator(".shell-v2").wait_for(timeout=45000)
        await page.evaluate("""async()=>{const data=await import('/src/data.js?v=100');await Promise.all(['character','weapon','artifact'].map(category=>data.catalog('gi',category)))}""")
        await page.wait_for_timeout(700)
        assert not catalog_requests, catalog_requests
        cached_new_character = await page.evaluate("""async()=>{
          const {getLocal,putLocal}=await import('/src/persistence.js');
          const record=await getLocal('cache','catalog:studio64:gi:character');
          record.items.push({_id:'10000136',id:'10000136',_name:'Mitya',name:'Mitya',_game:'gi',_category:'character',element:'Cryo',rarity:5});
          await putLocal('cache','catalog:studio64:gi:character',record);
          return record.items.some(row=>String(row.id||row._id)==='10000136');
        }""")
        assert cached_new_character, "Le scénario ne reproduit pas un catalogue déjà actualisé silencieusement."
        await page.locator('.side-rail [data-nav="changelog"]').click()
        await page.locator('[data-utility-page="changelog"]').wait_for()
        await page.screenshot(path=str(ARTIFACTS / "catalog-journal-before-sync.png"))
        # Simulate a user whose source version is already current but whose old
        # local weapon detail cache predates the r1-r5 normalization. The manual
        # button must upgrade that same-version cache; startup must not do it.
        await page.evaluate("localStorage.setItem('astralis:gi:synced-source-version:v1','7.2.53');localStorage.removeItem('astralis:gi:weapon-passive-schema:v1')")
        before_first_sync = await page.evaluate("localStorage.getItem('astralis:data:last-sync:gi')")
        await page.get_by_role("button", name="Vérifier les nouveautés").click()
        await page.wait_for_function("before => { const current=localStorage.getItem('astralis:data:last-sync:gi'); return current && current!==before; }", arg=before_first_sync, timeout=240000)
        assert catalog_requests, "Le clic manuel n'a déclenché aucun téléchargement de catalogue."

        result = await page.evaluate("""async()=>{
          const {getLocal}=await import('/src/persistence.js');
          const [characters,weapons,artifacts]=await Promise.all([
            getLocal('cache','catalog:studio64:gi:character'),getLocal('cache','catalog:studio64:gi:weapon'),getLocal('cache','catalog:studio64:gi:artifact')]);
          const diffs=JSON.parse(localStorage.getItem('astralis:gi:catalog-diffs:v3')||'[]');
          const syncedVersion=localStorage.getItem('astralis:gi:synced-source-version:v1');
          const notice=JSON.parse(localStorage.getItem('astralis:gi:update-notice:v1')||'null');
          const syncResult=JSON.parse(localStorage.getItem('astralis:data:last-sync-result:gi')||'null');
          const weaponSchema=localStorage.getItem('astralis:gi:weapon-passive-schema:v1');
          const manualBaseline=localStorage.getItem('astralis:gi:manual-sync-baseline:v1');
          const set=artifacts.items.find(row=>String(row.id)==='15050'||String(row.setId)==='15050');
          const grouped=diffs.reduce((out,row)=>{const key=row.category+':'+row.type;out[key]=(out[key]||0)+1;return out;},{});
          const rarityUpdates=diffs.filter(row=>row.type==='updated').flatMap(row=>(row.fields||[]).filter(field=>field.key==='Rareté'||field.key==='rarity').map(field=>({name:row.name,before:field.before,after:field.after})));
          const additions=JSON.parse(localStorage.getItem('astralis:data:additions:v2')||'[]');
          const additionsByCategory=additions.reduce((out,row)=>{out[row.category]=(out[row.category]||0)+1;return out;},{});
          const newArtifacts=diffs.filter(row=>row.category==='artifact'&&row.type==='new').map(row=>({id:row.id,name:row.name}));
          const newCharacters=diffs.filter(row=>row.category==='character'&&row.type==='new').map(row=>({id:row.id,name:row.name}));
          const artifactEffects=artifacts.items.filter(row=>['15004','15049','15050'].includes(String(row.id))).map(row=>({id:String(row.id),name:row._name||row.name,two:row.twoPieceBonus||'',four:row.fourPieceBonus||'',icon:row.images?.filename_icon||row.images?.filename_flower||''}));
          const {imageSet}=await import('/src/data.js?v=99');
          const weapon=weapons.items.find(row=>row._name==='Aube d’argent'||row._name==="Aube d'argent"||row.enName==='Silverdawn');
          const passiveWeapon=weapons.items.find(row=>String(row.id)==='11503');
          const weaponPassive=passiveWeapon?{name:passiveWeapon.passiveName||passiveWeapon.passive?.name||'',sourceVersion:passiveWeapon.sourceVersion||'',ranks:[1,2,3,4,5].map(rank=>({description:passiveWeapon['r'+rank]?.description||'',curatedValues:passiveWeapon['r'+rank]?.values||[],sourceParams:passiveWeapon['r'+rank]?.sourceParams||[]}))}:null;
          const {normalizeGiLevelRow}=await import('/src/gi-level-stats.js');
          const {snapshotWeaponStats}=await import('/src/lab-config.js?v=20261125-weapon-stats-1');
          const sourceSnapshot=await fetch('/data/lab-source-snapshot.json',{cache:'no-cache'}).then(response=>response.json());
          const missingWeaponStats=weapons.items.filter(row=>{const level=Number(row.rarity)<3?'70':'90',normalized=normalizeGiLevelRow(row.statsAtMilestones?.[level]||{}),needsSecondary=!!(row.mainStatType||row.substatType);return !Number.isFinite(Number(normalized.attack))||(needsSecondary&&!Number.isFinite(Number(normalized.specialized)))});
          const noSecondaryStatCount=weapons.items.filter(row=>!row.mainStatType&&!row.substatType).length;
          const floatingDreams=weapons.items.find(row=>String(row.id)==='14511'),floatingDreamsStats=floatingDreams?snapshotWeaponStats(sourceSnapshot,floatingDreams,90):null;
          const weaponIcon=weapon?imageSet('gi',weapon,'weapon')[0]:'';
          const artifactIcons=['15049','15050'].map(id=>{const row=artifacts.items.find(item=>String(item.id)===id);return row?imageSet('gi',row,'artifact')[0]:''});
          const loadImage=src=>new Promise(resolve=>{if(!src){resolve(false);return}const image=new Image();const timer=setTimeout(()=>resolve(false),12000);image.onload=()=>{clearTimeout(timer);resolve(image.naturalWidth>0)};image.onerror=()=>{clearTimeout(timer);resolve(false)};image.src=src});
          const imageLoads=await Promise.all([loadImage(weaponIcon),...artifactIcons.map(loadImage)]);
          const missingEffects=artifacts.items.filter(row=>!row.twoPieceBonus&&!row.fourPieceBonus).map(row=>({id:String(row.id),name:row._name||row.name}));
          const {renderChangesWorkspace}=await import('/src/utility-pages.js?v=20261124-utility-5');
          const html=renderChangesWorkspace({rows:[{type:'updated',category:'character',name:'HTML test',at:Date.now(),imageHTML:'',fields:[{key:'Description',before:'<color=#fff>Avant</color><br/>Suite',after:'&lt;strong&gt;Après&lt;/strong&gt;'}]}],groups:[],updated:Date.now()});
          const probe=document.createElement('div');probe.innerHTML=html;const htmlText=probe.querySelector('.utility-diff-details dd')?.textContent||'';
          return {characterCount:characters.items.length,weaponCount:weapons.items.length,artifactCount:artifacts.items.length,diffs,weaponSchema,
            weaponStatsCoverage:{total:weapons.items.length,complete:weapons.items.length-missingWeaponStats.length,noSecondaryStatCount,missing:missingWeaponStats.map(row=>({id:row.id,name:row._name||row.name})),floatingDreams:floatingDreamsStats},
            grouped,additionsByCategory,rarityUpdates,newArtifacts,newCharacters,artifactEffects,missingEffects,artifactIds:artifacts.items.map(row=>String(row.id)),updatedSamples:diffs.filter(row=>row.type==='updated').slice(0,5).map(row=>({name:row.name,category:row.category,fields:row.fields.slice(0,5)})),
            weaponIcon:weaponIcon,imageLoads,htmlText,syncedVersion,notice,weaponPassive,syncResult,manualBaseline,
            setBonuses:{two:set?.twoPieceBonus||'',four:set?.fourPieceBonus||'',icon:set?.images?.filename_icon||''},
            visibleNew:document.querySelectorAll('[data-utility-page="changelog"] [data-kind="new"]').length,
            visibleUpdated:document.querySelectorAll('[data-utility-page="changelog"] [data-kind="updated"]').length};
        }""")
        print('SYNC_DEBUG',json.dumps({'syncedVersion':result['syncedVersion'],'syncResult':result['syncResult'],'notice':result['notice'],
          'weaponPassive':{'name':result['weaponPassive']['name'],'sourceVersion':result['weaponPassive']['sourceVersion'],'refinements':len(result['weaponPassive']['ranks'])},
          'weaponStatsCoverage':result['weaponStatsCoverage']},ensure_ascii=False))
        assert result["characterCount"] > 120, result["characterCount"]
        assert result["syncedVersion"] and result["syncedVersion"] != '0.0.0', result['syncedVersion']
        assert result["weaponSchema"] == 'lunaris-r1-r5-20261125', result["weaponSchema"]
        assert result["manualBaseline"] == result["syncedVersion"], result["manualBaseline"]
        assert result['notice'] and result['notice']['synced'], result['notice']
        assert result["artifactCount"] >= 65, result["artifactCount"]
        assert all(item in result["artifactIds"] for item in ["15009", "15010", "15011", "15013"]), result["artifactIds"]
        assert result["visibleNew"] > 0, result
        assert result["visibleNew"] < result["characterCount"] + result["artifactCount"], result
        assert result["visibleNew"] == sum(count for key, count in result["grouped"].items() if key.endswith(":new")), result
        assert not result["rarityUpdates"], result["rarityUpdates"]
        assert result["setBonuses"]["two"] and result["setBonuses"]["four"], result["setBonuses"]
        assert len(result["newArtifacts"]) == 2, result["newArtifacts"]
        assert {row["id"] for row in result["newArtifacts"]} == {"15049", "15050"}, result["newArtifacts"]
        assert {row["id"] for row in result["newCharacters"]} == {"10000136", "10000137", "10000147", "10000149"}, result["newCharacters"]
        assert all(row["name"] and row["name"] != "???" for row in result["newArtifacts"]), result["newArtifacts"]
        assert result["weaponPassive"] and result["weaponPassive"]["name"] and result["weaponPassive"]["sourceVersion"], result["weaponPassive"]
        assert all(row["description"] and row["sourceParams"] for row in result["weaponPassive"]["ranks"]), result["weaponPassive"]
        assert all(row["curatedValues"] for row in result["weaponPassive"]["ranks"]), result["weaponPassive"]
        assert result["weaponStatsCoverage"]["complete"] == result["weaponCount"], result["weaponStatsCoverage"]
        assert result["weaponStatsCoverage"]["floatingDreams"] and result["weaponStatsCoverage"]["floatingDreams"]["specialized"] == 265, result["weaponStatsCoverage"]
        assert len(result["artifactEffects"]) == 3 and all(row["two"] and row["four"] and row["icon"] for row in result["artifactEffects"]), result["artifactEffects"]
        assert result["weaponIcon"].startswith('https://static.nanoka.cc/assets/gi/UI_EquipIcon_Bow_Ullr.webp'), result["weaponIcon"]
        assert all(result["imageLoads"]), result["imageLoads"]
        assert all(text in result["htmlText"] for text in ["Avant", "Suite", "Après"]), result["htmlText"]
        assert '<' not in result["htmlText"] and 'color' not in result["htmlText"].lower(), result["htmlText"]
        await page.reload(wait_until="domcontentloaded", timeout=60000)
        await page.locator(".shell-v2").wait_for(timeout=45000)
        await page.locator('.side-rail [data-nav="changelog"]').click()
        await page.locator('[data-utility-page="changelog"]').wait_for()
        persisted_new = await page.locator('[data-utility-page="changelog"] [data-kind="new"]').count()
        assert persisted_new == result["visibleNew"], (result["visibleNew"], persisted_new)
        before_count = len(result["diffs"])
        before_sync = await page.evaluate("localStorage.getItem('astralis:data:last-sync:gi')")
        await page.get_by_role("button", name="Vérifier les nouveautés").click()
        # The toast is intentionally brief in the real UI; wait on the durable
        # sync timestamp instead of racing its disappearance.
        await page.wait_for_function("before => localStorage.getItem('astralis:data:last-sync:gi') !== before", arg=before_sync, timeout=240000)
        after = await page.evaluate("""()=>({diffs:JSON.parse(localStorage.getItem('astralis:gi:catalog-diffs:v3')||'[]'),
          additions:JSON.parse(localStorage.getItem('astralis:data:additions:v2')||'[]'),
          visibleNew:document.querySelectorAll('[data-utility-page="changelog"] [data-kind="new"]').length})""")
        first_by_key = {f"{row.get('category')}:{row.get('id')}": row for row in result["diffs"]}
        repeat_delta = [{"key": f"{row.get('category')}:{row.get('id')}", "type": row.get("type"), "name": row.get("name"), "fields": row.get("fields", [])[:5]}
                        for row in after["diffs"] if f"{row.get('category')}:{row.get('id')}" not in first_by_key]
        print("REPEAT_DELTA", json.dumps(repeat_delta, ensure_ascii=False))
        assert len(after["diffs"]) == before_count, (before_count, len(after["diffs"]))
        assert after["visibleNew"] == result["visibleNew"], (result["visibleNew"], after["visibleNew"])
        assert not errors, errors
        await page.screenshot(path=str(ARTIFACTS / "catalog-journal-after-sync.png"))
        print(json.dumps({"initialBundledCounts": baseline,
          "afterSync": {k:result[k] for k in ["characterCount","weaponCount","artifactCount","grouped","additionsByCategory","newArtifacts","newCharacters","weaponStatsCoverage","artifactEffects","updatedSamples","visibleNew","visibleUpdated","setBonuses"]},
          "repeatSync": {"diffs":len(after["diffs"]),"additions":len(after["additions"]),"visibleNew":after["visibleNew"]},
          "pageErrors":errors},ensure_ascii=False,indent=2))
        await browser.close()

asyncio.run(main())
