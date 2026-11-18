"""Verify an interrupted focus session is safely paused and can resume."""
import json, threading, time
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
            page=browser.new_page()
            started=int(time.time()*1000)-5000
            session={'id':'resume-check','game':'gi','mode':'farm','title':'Session interrompue','tasks':[{'text':'Récupérer les matériaux','done':False}], 'status':'running','elapsedMs':10000,'resumedAt':started,'startedAt':started,'focusDurationMs':300000,'focusRemainingMs':200000,'focusResumedAt':started}
            page.add_init_script("if(!localStorage.getItem('astralis:focus-station:v1'))localStorage.setItem('astralis:focus-station:v1',"+json.dumps(json.dumps({'active':session,'history':[]},ensure_ascii=False))+')')
            page.goto(base+'/tests/fixtures/focus-routines.html')
            expect(page.locator('[data-focus-console]')).to_contain_text('SESSION EN COURS')
            page.evaluate("window.dispatchEvent(new PageTransitionEvent('pagehide'))")
            saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active")
            assert saved['status']=='paused' and saved['elapsedMs']>=15000
            assert 'resumedAt' not in saved and saved['tasks'][0]['text']=='Récupérer les matériaux'
            page.reload()
            expect(page.locator('[data-focus-console]')).to_contain_text('SESSION EN PAUSE')
            expect(page.locator('[data-focus-resume]')).to_be_visible()
            page.locator('[data-focus-resume]').click()
            resumed=page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active")
            assert resumed['status']=='running' and resumed['resumedAt']>0
            browser.close()
    finally:
        server.shutdown();server.server_close()
    print('PASS: interrupted session saved as paused and resumes without counting closed-app time.')
if __name__=='__main__': main()
