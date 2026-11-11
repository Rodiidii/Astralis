"""Exercise the supplied reference and all five sheets across seven elements."""
import json
import threading
from tempfile import TemporaryDirectory
from functools import partial
from pathlib import Path
from playwright.sync_api import sync_playwright
from voyage_browser import ROOT, Quiet, Server

def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    captures = ROOT / 'docs/captures/fiches'
    captures.mkdir(parents=True, exist_ok=True)
    results = []
    errors = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width':1440,'height':1100}, device_scale_factor=1)
            page.set_default_timeout(120000)
            page.on('pageerror', lambda e: errors.append(str(e)))
            base = f'http://127.0.0.1:{server.server_port}'
            page.goto(base+'/docs/reference/fiches/fiches-astralis.html')
            for tab in page.locator('#tabs button').all():
                tab.click()
                page.screenshot(path=str(captures / ('reference-'+tab.get_attribute('data-k')+'.png')))
            for element in page.locator('#els button').all():
                element.click()
            page.goto(base+'/tests/sheets-harness.html')
            page.wait_for_function('window.ready')
            for kind in ['team','compare','build','lab','farm']:
                for element in ['cryo','pyro','hydro','electro','anemo','geo','dendro']:
                    for mode in ['complete','partial','extreme']:
                        result = page.evaluate('''async ([type,el,mode])=>{
                            const s=await mountOne(type,el,mode);
                            const text=s.root.textContent;
                            const bad=/NaN|undefined|Infinity/.test(text);
                            const data={type,el,mode,...s.audit,bad};
                            s.dispose();return data;
                        }''',[kind,element,mode])
                        assert not result['missingImages'], result
                        assert not result['bad'], result
                        assert not result['overflows'], result
                        results.append(result)
                exported = page.evaluate('''async type=>{
                    const result=await renderOne(type,'cryo','complete',2);
                    const blob=await new Promise(resolve=>lastCanvas.toBlob(resolve,'image/png'));
                    return {...result,bytes:blob.size,mime:blob.type};
                }''',kind)
                assert exported['mime']=='image/png' and exported['bytes']>10000, exported
                with TemporaryDirectory(prefix='astralis-png-') as directory:
                    with page.expect_download() as pending:
                        page.evaluate('''()=>{const link=document.createElement('a');link.href=lastCanvas.toDataURL('image/png');link.download='fiche.png';link.click();}''')
                    target=Path(directory)/'fiche.png'
                    pending.value.save_as(target)
                    assert target.read_bytes()[:8]==b'\x89PNG\r\n\x1a\n'
                page.screenshot(path=str(captures / (kind+'-integrated.png')), full_page=True)
                print(kind, json.dumps(exported), flush=True)
            assert not errors, errors
            (captures/'validation.json').write_text(json.dumps({'cases':results,'errors':errors},ensure_ascii=False,indent=2),encoding='utf-8')
            print(f'{len(results)} cases passed', flush=True)
            browser.close()
    finally:
        server.shutdown()

if __name__=='__main__':
    main()
