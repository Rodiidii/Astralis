import threading
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch()
            page=browser.new_page(service_workers='block')
            page.set_default_timeout(10000)
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.route('**/*',lambda route:route.continue_() if route.request.url.startswith(base) else route.abort())
            page.goto(base+'/tests/fixtures/arcade-reactions.html',wait_until='domcontentloaded')
            page.wait_for_function("document.querySelectorAll('[data-reaction-cell]').length===49")
            move=page.evaluate("""()=>{
              const el=[...document.querySelectorAll('[data-reaction-cell]')],b=el.map(x=>getComputedStyle(x).getPropertyValue('--reaction-color').trim()),n=7;
              const matched=a=>{const s=new Set();for(let r=0;r<n;r++)for(let c=0;c<n;){let e=c+1;while(e<n&&a[r*n+e]===a[r*n+c])e++;if(e-c>=3)for(let x=c;x<e;x++)s.add(r*n+x);c=e}for(let c=0;c<n;c++)for(let r=0;r<n;){let e=r+1;while(e<n&&a[e*n+c]===a[r*n+c])e++;if(e-r>=3)for(let x=r;x<e;x++)s.add(x*n+c);r=e}return s.size};
              for(let i=0;i<49;i++)for(const j of [i+1,i+7]){if(j>=49||(j===i+1&&i%7===6))continue;const a=b.slice();[a[i],a[j]]=[a[j],a[i]];if(matched(a)>=4)return[i,j]}
              return null;
            }""")
            assert move, 'Le plateau déterministe ne contient aucun échange qui crée un résonateur 4+'
            page.locator(f'[data-reaction-cell="{move[0]}"]').click()
            page.locator(f'[data-reaction-cell="{move[1]}"]').click()
            buff=page.locator('.reaction-overcharge')
            expect(buff).to_be_visible()
            expect(buff).to_contain_text('SCORE ×2')
            expect(page.locator('.reaction-overcharge-announcer')).to_contain_text('huit secondes')
            bursts=page.locator('.reaction-burst')
            assert bursts.count() > 0, 'L’alignement ne déclenche pas son effet de particules'
            assert page.locator('.reaction-burst').first.evaluate('(node)=>getComputedStyle(node).animationName')=='reaction-burst-pop'
            page.wait_for_timeout(650)
            expect(bursts).to_have_count(0)
            assert page.locator('[data-reaction-score]').inner_text()!='0'
            first=float(page.locator('[data-reaction-overcharge-time]').inner_text().replace(' s',''))
            page.wait_for_timeout(1250)
            second=float(page.locator('[data-reaction-overcharge-time]').inner_text().replace(' s',''))
            assert 0<second<first<=8, f'timer not decreasing: {first} -> {second}'
            page.locator('[data-reaction-restart]').click()
            expect(buff).to_be_hidden()
            assert not errors, errors
            page.evaluate('window.cleanup()')
            browser.close()
        print('OK : match 4+, score, buff x2 dégressif, remise à zéro et nettoyage vérifiés.')
    finally:
        server.shutdown();server.server_close()


if __name__=='__main__':main()
