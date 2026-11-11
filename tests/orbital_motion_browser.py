import threading
from functools import partial
from playwright.sync_api import sync_playwright
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1200,'height':820});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.emulate_media(reduced_motion='no-preference');page.goto(f'http://127.0.0.1:{server.server_port}/tests/orbital-motion.html');page.wait_for_function("document.querySelector('.orbit-node').dataset.orbitAngle")
   week=page.locator('[data-orbit-select=week]');wishes=page.locator('[data-orbit-select=wishes]');before=week.get_attribute('data-orbit-angle');page.wait_for_timeout(350);assert week.get_attribute('data-orbit-angle')!=before,page.evaluate("({host:document.querySelector('.dashboard-studio').dataset,visible:document.querySelector('.dashboard-studio')._orbitVisible,hover:[...document.querySelectorAll('.orbit-node:hover')].map(n=>n.dataset.orbitSelect),focus:document.activeElement.tagName,hidden:document.hidden,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches})")
   wishes.focus();page.wait_for_timeout(80);position=wishes.bounding_box();other=week.get_attribute('data-orbit-angle');page.wait_for_timeout(500)
   assert week.get_attribute('data-orbit-angle')!=other,'Le focus arrete les autres pistes'
   after=wishes.bounding_box();assert abs(position['x']-after['x'])<.2 and abs(position['y']-after['y'])<.2,(position,after)
   def no_collision():
    assert page.locator('.celestial-body').evaluate_all("nodes=>nodes.every((node,i)=>nodes.slice(i+1).every(other=>{const a=node.getBoundingClientRect(),b=other.getBoundingClientRect();return Math.hypot(a.x+a.width/2-b.x-b.width/2,a.y+a.height/2-b.y-b.height/2)>=(a.width+b.width)/2-.5}))")
   no_collision();page.evaluate('document.activeElement.blur()');page.mouse.move(0,0);page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(500);no_collision();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');assert not errors,errors
   print('Revolution active, autres pistes actives pendant le focus, cible stable et absence de collision desktop/mobile : OK',flush=True);browser.close()
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
