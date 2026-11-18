import json, threading, time
from datetime import datetime, timedelta
from functools import partial

from playwright.sync_api import expect, sync_playwright
from voyage_browser import ROOT, Quiet, Server


def main():
    server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        now=int(time.time()*1000)
        today_date=datetime.now().date()
        local_today=today_date.strftime('%Y-%m-%d')
        previous_date=today_date-timedelta(days=1)
        previous=previous_date.strftime('%Y-%m-%d')
        previous_at=int(datetime.combine(previous_date,datetime.min.time()).timestamp()*1000+12*60*60*1000)
        row={'current':80,'max':200,'minutes':8,'updatedAt':now,'history':[
            {'at':now-60*60*1000,'delta':-40,'label':'Domaine des reliques'},
            {'at':now-20*60*1000,'delta':60,'label':'Récompense quotidienne'},
            {'at':previous_at,'delta':-20,'label':'Boss hebdomadaire'},
        ]}
        with sync_playwright() as playwright:
            browser=playwright.chromium.launch()
            page=browser.new_page(viewport={'width':1100,'height':900})
            page.add_init_script('localStorage.setItem("astralis:energy-dock:v1",'+json.dumps(json.dumps({'gi':row},ensure_ascii=False))+')')
            page.goto(f'http://127.0.0.1:{server.server_port}/tests/fixtures/energy-meter.html')
            grid=page.locator('[data-energy-month]')
            today=grid.locator(f'[data-energy-month-date="{local_today}"]')
            expect(today).to_have_attribute('aria-pressed','true')
            detail=grid.locator('[data-energy-month-detail]')
            expect(detail).to_contain_text('Domaine des reliques')
            expect(detail).to_contain_text('Récompense quotidienne')
            expect(detail).to_contain_text('−40')
            expect(detail).to_contain_text('+60')
            yesterday_cell=grid.locator(f'[data-energy-month-date="{previous}"]')
            yesterday_cell.focus()
            page.keyboard.press('Enter')
            expect(yesterday_cell).to_have_attribute('aria-pressed','true')
            expect(detail).to_contain_text('Boss hebdomadaire')
            expect(detail).to_contain_text('−20')
            page.set_viewport_size({'width':390,'height':844})
            assert grid.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1')
            assert detail.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1')
            browser.close()
        print('OK : sélection quotidienne, détail des actions, clavier et affichage mobile validés.')
    finally:
        server.shutdown();server.server_close()


if __name__=='__main__':main()
