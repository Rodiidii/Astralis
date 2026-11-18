import json,threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 rows=[
  {'id':'flower-a','slot':'flower','slotIndex':0,'setKey':'15040','mainType':'hpFlat','mainValue':4780,'level':20,'rarity':5,'substats':[]},
  {'id':'goblet-a','slot':'goblet','slotIndex':3,'setKey':'15040','mainType':'cryoDmg','mainValue':46.6,'level':20,'rarity':5,'substats':[]},
  {'id':'circlet-b','slot':'circlet','slotIndex':4,'setKey':'15021','mainType':'critRate','mainValue':31.1,'level':16,'rarity':5,'substats':[]},
 ]
 seed={'astralis:gi:owned-artifacts':json.dumps(rows),'astralis:active-game':'gi','astralis:gi:assistant-profile':'{"enabled":false}','astralis:releases:last-seen':'2026-11-11-atelier-1'}
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1366,'height':900});page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.add_init_script("for(const[k,v]of Object.entries("+json.dumps(seed)+"))localStorage.setItem(k,v)")
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.locator('[data-nav=sets]').first.click();panel=page.locator('.gi-owned-relics');expect(panel).to_be_visible();expect(panel.locator('.gi-owned-relic-overview>span')).to_have_count(6);expect(panel.locator('.gi-owned-piece-row')).to_have_count(3);expect(panel.locator('.gi-owned-relic-overview')).to_contain_text('2');expect(panel.locator('.gi-owned-set-row')).to_have_count(2);page.set_viewport_size({'width':390,'height':844});assert panel.locator('.gi-owned-relic-columns').evaluate("el=>getComputedStyle(el).gridTemplateColumns.split(' ').length")==1;assert panel.locator('.gi-owned-relic-overview').evaluate('el=>el.scrollWidth<=el.clientWidth');assert not errors,errors
   browser.close()
  print('OK : synthèse des 5 emplacements, groupes de sets et reliques récentes affichés sans erreur.')
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
