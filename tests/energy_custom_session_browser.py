import json,threading,time
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(service_workers='block');page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   now=int(time.time()*1000);row={'current':50,'max':200,'minutes':8,'updatedAt':now,'history':[{'at':now-60000,'before':90,'after':50,'delta':-40,'label':'Dépense · 40'},{'at':now-30000,'before':50,'after':60,'delta':10,'label':'Ajout manuel'}]}
   page.add_init_script('if(!sessionStorage.getItem("__energySeed")){localStorage.setItem("astralis:energy-dock:v1",'+json.dumps(json.dumps({'gi':row}))+');sessionStorage.setItem("__energySeed","1")}')
   page.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
   page.goto(base+'/tests/fixtures/energy-presets.html',wait_until='domcontentloaded');page.wait_for_selector('[data-energy-plan-form]')
   form=page.locator('[data-energy-plan-form]');form.locator('[name=afterMinutes]').select_option('custom');field=form.locator('[data-energy-custom-start]');expect(field).to_be_visible()
   selected=page.evaluate("()=>{const d=new Date(Date.now()+90*60000);d.setSeconds(0,0);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}")
   field.fill(selected);expect(form.locator('[data-energy-plan-result]')).to_contain_text('Dans 1 h 30');form.locator('[type=submit]').click()
   saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:energy-dock:v1')).gi.sessionPlan")
   chosen=page.evaluate("value=>new Date(value).getTime()",selected);assert abs(saved['startAt']-chosen)<60_000,(saved,selected)
   page.reload(wait_until='domcontentloaded');page.wait_for_selector('[data-energy-plan-form]');form=page.locator('[data-energy-plan-form]');expect(form.locator('[name=afterMinutes]')).to_have_value('custom');expect(form.locator('[data-energy-custom-start]')).to_have_value(selected);expect(page.locator('[data-energy-today] [data-energy-spent]')).to_have_text('−40');expect(page.locator('[data-energy-today] [data-energy-gained]')).to_have_text('+10');page.locator('[data-energy-spend=\"20\"]').click();expect(page.locator('[data-energy-today] [data-energy-spent]')).to_have_text('−60');expect(page.locator('[data-energy-today] [data-energy-count]')).to_have_text('3');assert not errors,errors;browser.close()
  print('OK : horaire libre, prévision à 90 minutes et choix conservé après rechargement.')
 finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
