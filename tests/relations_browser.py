"""Exercise relations using the actual local evidence snapshot."""
import threading
from functools import partial
from urllib.parse import urlsplit, unquote

from playwright.sync_api import sync_playwright
from voyage_browser import ROOT, Quiet, Server


def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            context = browser.new_context(accept_downloads=True, permissions=['clipboard-read', 'clipboard-write'])
            page = context.new_page()
            page.set_default_navigation_timeout(120000)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))

            def route(request):
                path = urlsplit(request.request.url).path
                if path == '/data/version.json' and 'api.lunaris.moe' in request.request.url:
                    request.fulfill(json={'version':'test'})
                elif path.startswith('/data/test/fr/char/') and 'api.lunaris.moe' in request.request.url:
                    request.fulfill(json={'info':{'attributes':[]},'skills':{}})
                elif not request.request.url.startswith(base):
                    request.abort()
                elif path == '/api/image':
                    request.fulfill(status=403, body='Proxy désactivé pour ce test')
                elif path not in ('/data/relations.json','/data/relations-official.json') and path.startswith(('/api/', '/data/')):
                    request.fulfill(json={})
                else:
                    file = (ROOT / unquote(path).lstrip('/')).resolve()
                    if file.is_dir():
                        file = file / 'index.html'
                    if file.is_relative_to(ROOT) and file.is_file():
                        request.fulfill(path=str(file))
                    else:
                        request.fulfill(status=404, body='')

            page.route('**/*', route)
            page.add_init_script("""
              localStorage.setItem('astralis:active-game','gi');
              localStorage.setItem('astralis:teams:gi',JSON.stringify([{
                id:'poster-team',name:'Chœur astral',members:[
                  {character:'10000005',role:'Soutien'},{character:'10000121',role:'DPS'},{character:'10000038'},{}
                ],rotation:[{character:'10000005',name:'Compétence',code:'E',count:2}]
              }]));
            """)
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            page.locator('[data-nav=relations]').first.click()
            page.wait_for_selector('.relations-board canvas')
            assert page.locator('.relations-board button').count() > 80
            assert page.locator('.relations-board button[aria-label="Voyageur & Paimon"]').count() == 1
            assert page.locator('.relations-board button[aria-label=Lumine]').count() == 0
            assert page.locator('astralis-relations').evaluate('''g=>{
              const ids=['10000133','10000136','10000137','10000140','10000143','10000148','10000150','danica'];
              return ids.every(id=>g.characters.get(id)?.region==='Snezhnaya') &&
                g.characters.get('10000126')?.region==='Liyue' &&
                g.characters.get('10000136')?.portrait.endsWith('/mitya.png') &&
                g.characters.get('10000137')?.portrait.endsWith('/valeriy.png');
            }''')
            assert page.locator('.relations-board button[aria-label=Manekin]').count() == 0
            page.wait_for_function('''async () => {
              const graph = document.querySelector('astralis-relations');
              const character = graph?.characters?.get('10000021');
              if (!character?.portrait?.endsWith('/team-portraits/10000021.webp')) return false;
              const response = await fetch(character.portrait);
              if (!response.ok) return false;
              const bitmap = await createImageBitmap(await response.blob());
              return bitmap.width > 32 && bitmap.height > 32;
            }''')
            node = page.locator('.relations-board [data-rel-select="10000021"]')
            assert node.evaluate('n=>parseFloat(n.style.width)') >= 4.0
            page.get_by_role('button',name='Zoomer',exact=True).click()
            assert node.evaluate('n=>parseFloat(n.style.width)') >= 4
            page.get_by_role('button',name='Recentrer').click()
            page.wait_for_timeout(1000)
            assert page.locator('.relations-orbits i').count() == 3
            assert page.locator('[data-rel-region=Mondstadt] img').count() == 1
            page.get_by_role('searchbox',name='Rechercher un personnage').fill('Capitano')
            page.locator('[data-rel-search]').get_by_role('button',name='Il Capitano').click()
            selected = page.locator('.relations-board [data-rel-select=capitano]')
            page.wait_for_function("document.querySelector('.relations-board [data-rel-select=capitano]').style.left==='50%'")
            assert selected.evaluate("n=>parseFloat(n.style.width)") > 8
            graph = page.locator('astralis-relations')
            assert page.locator('[data-reading-roster] button').count() > 80
            page.locator('[data-reading=graph]').click()
            assert not page.locator('.relations-sidebar').is_visible()
            page.locator('[data-reading=graph]').click()
            assert page.locator('.relations-sidebar').is_visible()
            assert graph.evaluate('g=>g.visibleEdges.some(e=>e.a==="capitano"||e.b==="capitano")')
            graph.evaluate('''g=>{
              const neighbor=g.visibleEdges.find(e=>[e.a,e.b].includes('capitano'));
              const mid=neighbor.a==='capitano'?neighbor.b:neighbor.a;
              const candidate=g.visibleEdges.map(e=>e.a===mid?e.b:e.b===mid?e.a:null)
                .find(id=>id&&id!=='capitano'&&!g.visibleEdges.some(e=>[e.a,e.b].includes(id)&&[e.a,e.b].includes('capitano')));
              if(!candidate)throw Error('Pas de chemin de test');
              g.select(candidate);
            }''')
            page.get_by_role('heading',name='Chemin le plus court',exact=False).wait_for()
            assert page.locator('.relations-path li').count() == 3
            assert page.locator('dialog.relations-association').evaluate('d=>d.open')
            page.get_by_role('button',name='Retour sans sélection').click()
            assert graph.evaluate('g=>g.selected.length') == 0
            page.get_by_role('searchbox',name='Rechercher un personnage').fill('Amber')
            page.locator('[data-rel-search]').get_by_role('button',name='Amber',exact=True).click()
            page.locator('[data-rel-info]').get_by_role('button',name='Jean',exact=False).click()
            page.locator('dialog.relations-association blockquote').first.wait_for()
            assert 'À propos de Jean' in page.locator('dialog.relations-association').inner_text()
            assert page.locator('[data-rel-info] blockquote').count() == 0
            page.get_by_role('button',name='Voir la carte').click()
            page.get_by_role('button',name='Copier le lien').click()
            assert '#relations?' in page.url and 'id=10000021' in page.url
            page.reload(wait_until='domcontentloaded')
            page.locator('dialog.relations-association blockquote').first.wait_for()
            page.keyboard.press('Escape')
            assert graph.evaluate('g=>g.selected.length') == 0
            assert page.locator('.relations-counters strong').count() == 4
            assert 'id=' not in page.url.split('#',1)[1]
            page.locator('.relations-settings summary').click()
            page.get_by_label('Grouper par').select_option('force')
            page.wait_for_function("document.querySelector('astralis-relations').settings.group === 'force' && !document.querySelector('astralis-relations').worker")
            page.locator('.relations-settings summary').click()
            page.get_by_label('Mon équipe').select_option('poster-team')
            page.get_by_role('heading',name='Entente d’équipe').wait_for()
            page.get_by_role('button',name='Anneau / Liste').click()
            assert page.locator('[data-rel-list] tbody tr').count() > 0
            page.get_by_role('button',name='PNG',exact=True).click()
            page.locator('.astralis-png-preview canvas').wait_for()
            assert page.locator('.astralis-png-preview canvas').evaluate('c=>c.width') == 2000
            page.keyboard.press('Escape')
            page.set_viewport_size({'width':390,'height':844})
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
            captures=ROOT/'docs/captures/relations'
            captures.mkdir(parents=True,exist_ok=True)
            page.set_viewport_size({'width':1440,'height':1000})
            fixtures=[('amber-jean','10000021','10000003'),('diluc-kaeya','10000016','10000015'),('nahida-wanderer','10000073','10000075'),('furina-neuvillette','10000089','10000087'),('columbina-aino','10000125','10000121'),('tsarine-tartaglia','tsaritsa','10000033'),('capitano-mavuika','capitano','10000106'),('voyageur-paimon-zhongli','10000005','10000030'),('alice-klee','alice','10000029'),('ronova-mavuika','ronova','10000106')]
            for name,a,b in fixtures:
                graph.evaluate('(g,pair)=>{g.settings.view="ring";g.settings.group="region";g.settings.spoilers=false;g.selected=pair;g.dismissedDuo="";g.update()}',[a,b])
                page.locator('.relations-paper').wait_for()
                search = page.locator('.relations-lore-search input')
                if search.count():
                    search.fill('zzzz-no-matching-lore-zzzz')
                    assert page.locator('.relations-evidence-group:visible').count() == 0
                    search.fill('')
                    assert page.locator('.relations-evidence-group:visible').count() > 0
                page.screenshot(path=str(captures/(name+'.png')))
                page.keyboard.press('Escape')
            graph.evaluate('g=>{g.selected=["10000021"];g.settings.connectionMode="connection";g.update()}')
            page.screenshot(path=str(captures/'concentric.png'))
            page.get_by_role('button',name='Sources',exact=True).click()
            page.locator('.relations-source-list a').first.wait_for()
            page.keyboard.press('Escape')
            page.get_by_role('button',name='Signaler une preuve',exact=True).click()
            page.locator('textarea[name=description]').fill('Test de signalement local sourcé')
            page.locator('[data-report-form] button').click()
            assert page.evaluate('JSON.parse(localStorage.getItem("astralis:relation-reports")).length')==1
            page.keyboard.press('Escape')
            page.set_viewport_size({'width':390,'height':844})
            graph.evaluate('g=>{g.selected=["10000021","10000003"];g.dismissedDuo="";g.update()}')
            page.screenshot(path=str(captures/'duo-mobile.png'))
            assert page.locator('.relations-paper').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
            html='<html lang="fr"><meta charset="utf-8"><title>Relations — contrôles visuels</title><style>body{background:#101529;color:#eee;font:16px system-ui;margin:30px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:24px}img{width:100%}figure{margin:0;padding:15px;background:#21283c}</style><h1>Dix duos de référence</h1><p>Captures de l’application réelle. Les absences de preuves restent explicites.</p><main>'
            for name,a,b in fixtures:
                html+='<figure><a href="'+name+'.png"><img src="'+name+'.png"></a><figcaption>'+name+'</figcaption></figure>'
            (captures/'index.html').write_text(html+'</main></html>',encoding='utf-8')
            assert not errors, errors
            print('Réseau : preuves, duo, partage, liste, PNG et mobile vérifiés.',flush=True)
            browser.close()
    finally:
        server.shutdown()


if __name__ == '__main__':
    main()
