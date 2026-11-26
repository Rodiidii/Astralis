import os
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True,args=['--autoplay-policy=no-user-gesture-required'])
  page=await browser.new_page(service_workers='block');await page.goto(os.environ.get('ASTRALIS_TEST_ORIGIN','http://127.0.0.1:8766')+'/health')
  results=await page.evaluate('''async()=>{
   const manifest=await fetch('/assets/express-ultimates/manifest.json?v=audit').then(r=>r.json()),entries=Object.entries(manifest),results=[];let cursor=0;
   await Promise.all(Array.from({length:4},async()=>{while(cursor<entries.length){const [key,item]=entries[cursor++],node=document.createElement(item.kind==='video'?'video':'audio');node.muted=true;node.preload='auto';node.src=item.url;node.style.cssText='width:160px;height:90px';document.body.append(node);
    const result=await new Promise(resolve=>{let done=false,timer=0;const end=data=>{if(done)return;done=true;clearTimeout(timer);node.pause();resolve({key,...data});};node.onerror=()=>end({error:node.error?.message||'media decode'});node.ontimeupdate=()=>{if(node.currentTime>.03)end({played:node.currentTime,duration:node.duration,width:node.videoWidth||0});};timer=setTimeout(()=>end({error:'playback timeout',state:node.readyState}),8000);node.play().catch(e=>end({error:e.message}));});results.push(result);node.removeAttribute('src');node.load();node.remove();}}));return results;
  }''')
  errors=[r for r in results if r.get('error')];report={'played':len(results)-len(errors),'total':len(results),'errors':errors,'results':results};Path('artifacts/expanded-media-browser-verification.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps({k:v for k,v in report.items() if k!='results'}),flush=True);await browser.close();assert not errors
asyncio.run(main())
