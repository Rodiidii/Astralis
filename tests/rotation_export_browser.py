"""Verify action icons and a genuinely unavailable icon in the export preview."""
import threading
from functools import partial
from playwright.sync_api import sync_playwright
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page()
   page.goto(f'http://127.0.0.1:{server.server_port}/tests/sheets-harness.html');page.wait_for_function('window.ready')
   result=page.evaluate("""async()=>{
    const {mountSheet}=await import('/src/sheet-renderer.js');
    const {posterBitmap}=await import('/src/poster-export.js');
    const d=sheetData('cryo','complete');
    const files=['Skill_A_01','Skill_A_01','Skill_S_SkirkNew_01','Skill_E_SkirkNew_01'];
    d.rotation=d.rotation.slice(0,5).map((a,i)=>({...a,code:['N','C','E','Q','E'][i],image:i<4?'/assets/genshin/skills/'+files[i]+'.png':'/missing-action-icon.png'}));
    const sheet=await mountSheet('team',d,{loadImage:src=>src.some(s=>s.includes('missing-action-icon'))?null:posterBitmap(src)});
    const images=[...sheet.root.querySelectorAll('img.sheet-rotation-skill')];
    const result={actualIcons:images.length,broken:[...sheet.root.querySelectorAll('img')].filter(i=>!i.complete||!i.naturalWidth).length,actions:sheet.data.rotation.length,missingResolved:sheet.data.rotation[4].image===null,svgFallback:sheet.root.querySelectorAll('.ico svg').length};
    sheet.dispose();return result;
   }""")
   assert result['actualIcons']==4 and result['actions']==5 and result['missingResolved'] and result['svgFallback']>=1 and result['broken']==0,result
   browser.close();print('NA/CA/E/Q sourcés et repli vectoriel sans image cassée : OK',flush=True)
 finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
