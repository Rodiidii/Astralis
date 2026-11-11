import threading
from functools import partial
from playwright.sync_api import sync_playwright
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch(args=['--enable-unsafe-swiftshader']);page=browser.new_page(viewport={'width':1440,'height':1900},device_scale_factor=1);page.set_default_timeout(120000);page.emulate_media(reduced_motion='reduce');errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
   page.goto(f'http://127.0.0.1:{server.server_port}/tests/planet-dioramas.html',wait_until='domcontentloaded');page.wait_for_selector('astralis-world[data-engine="webgl-diorama"]');page.wait_for_function("document.querySelectorAll('astralis-world[data-engine=webgl-diorama]').length===10");page.wait_for_function("document.querySelectorAll('astralis-world[data-map-ready=true]').length===9");page.wait_for_function("document.querySelector('[region=teyvat]').diorama.orbits.getObjectByName('ruler-life')");page.wait_for_timeout(800)
   page.screenshot(path=str(ROOT/'docs/planets-3d-contact-sheet.png'),full_page=True)
   assert page.locator('.planet-relief').count()==0
   for world in page.locator('astralis-world').all():
    data=world.evaluate("w=>{let meshes=0;w.diorama.scene.traverse(o=>{if(o.isMesh)meshes++});return {meshes,triangles:w.diorama.terrain.geometry.index.count/3,canvas:w.canvas.width,region:w.getAttribute('region')}}")
    assert data['meshes']>3 and data['triangles']>10000,data
   page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(400);angle=page.locator('astralis-world').first.get_attribute('data-rotation');page.wait_for_timeout(300);assert page.locator('astralis-world').first.get_attribute('data-rotation')==angle
   assert not errors,errors
   fallback=browser.new_page();fallback.emulate_media(reduced_motion='reduce');fallback.add_init_script("const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind.startsWith('webgl')?null:original.call(this,kind,...args)}");fallback.goto(f'http://127.0.0.1:{server.server_port}/tests/planet-dioramas.html',wait_until='domcontentloaded');fallback.wait_for_selector('astralis-world[data-engine=local-fallback]');assert fallback.locator('.regional-diorama').count()==0;fallback.close()
   print('Dix dioramas WebGL, géométrie, captures et mouvement réduit validés.',flush=True);browser.close()
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
