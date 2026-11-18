"""Check that session history imports through the visible toolbar and deduplicates."""
import json, threading, time
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server

def main():
    server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch();page=browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            page.add_init_script("if(!localStorage.getItem('astralis:focus-station:v1'))localStorage.setItem('astralis:focus-station:v1',JSON.stringify({active:null,history:[]}))")
            page.goto(f'http://127.0.0.1:{server.server_port}/tests/fixtures/focus-history.html')
            rows=[{'id':'imported-1','game':'gi','mode':'farm','title':'Farm Furina','durationMs':125000,'startedAt':int(time.time()*1000)-300000,'endedAt':int(time.time()*1000)-175000,'done':2,'total':3}]
            payload={'schema':'astralis-focus-history','version':1,'history':rows+rows+[{'game':'bogus','mode':'free','title':'invalid','durationMs':2,'endedAt':int(time.time()*1000)}]}
            page.locator('[data-focus-import-file]').set_input_files({'name':'sessions.json','mimeType':'application/json','buffer':json.dumps(payload).encode()})
            expect(page.locator('[data-focus-history-row]')).to_have_count(1)
            saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-station:v1'))")
            assert len(saved['history'])==1 and saved['history'][0]['id']=='imported-1'
            page.reload();expect(page.locator('[data-focus-history-row]')).to_have_count(1)
            with page.expect_download() as download:
                page.locator('[data-focus-export]').click()
            file=download.value.suggested_filename
            assert file.endswith('.json')
            assert not errors,errors;browser.close()
    finally:
        server.shutdown();server.server_close()
    print('PASS: focus history import skips duplicates, persists, and export downloads JSON.')
if __name__=='__main__':main()
