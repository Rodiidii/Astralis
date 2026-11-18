"""Verify planned break setup, countdown, and recovery after closing the app."""
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
            browser=p.chromium.launch();page=browser.new_page()
            started=int(time.time()*1000)-700
            active={'id':'planned-break','game':'gi','mode':'farm','title':'Pause douce','tasks':[],'status':'running','elapsedMs':0,'resumedAt':started,'startedAt':started,'focusDurationMs':1000,'focusRemainingMs':1000,'focusResumedAt':started,'breakDurationMs':2000,'breakRemainingMs':0}
            page.add_init_script("if(!localStorage.getItem('astralis:focus-station:v1'))localStorage.setItem('astralis:focus-station:v1',"+json.dumps(json.dumps({'active':active,'history':[]},ensure_ascii=False))+')')
            page.goto(base+'/tests/fixtures/focus-routines.html')
            expect(page.locator('#status')).to_contain_text('Sprint terminé',timeout=4000)
            saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active")
            assert saved['status']=='paused' and saved['breakAvailable'] and saved['breakRemainingMs']==2000
            page.reload();expect(page.locator('[data-focus-break-start]')).to_be_visible()
            page.locator('[data-focus-break-start]').click()
            running=page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active")
            assert running['status']=='break' and 'breakResumedAt' in running
            page.wait_for_timeout(500)
            page.evaluate("window.dispatchEvent(new PageTransitionEvent('pagehide'))")
            recovered=page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active")
            assert recovered['status']=='paused' and recovered['breakAvailable'] and 0<recovered['breakRemainingMs']<2000
            page.reload();expect(page.locator('[data-focus-break-start]')).to_be_visible()
            browser.close()
    finally:
        server.shutdown();server.server_close()
    print('PASS: planned break starts at sprint completion, counts down, and safely resumes after app closure.')
if __name__=='__main__':main()
