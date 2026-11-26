import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright


async def main():
    rows=json.loads(Path('artifacts/character-identities-verification.json').read_text(encoding='utf8'))['results']
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True)
        page=await browser.new_page(service_workers='block',viewport={'width':1200,'height':1000})
        await page.goto(os.environ.get('ASTRALIS_TEST_ORIGIN','http://127.0.0.1:8877')+'/health')
        report=await page.evaluate('''async(rows)=>{
            let cursor=0;const output=[];
            await Promise.all(Array.from({length:6},async()=>{while(cursor<rows.length){const row=rows[cursor++],image=new Image();image.src=row.portrait;try{await image.decode();output.push({id:row.id,width:image.naturalWidth,height:image.naturalHeight,decoded:true});}catch(e){output.push({id:row.id,error:String(e)});}}}));
            return {decoded:output.filter(r=>r.decoded).length,total:rows.length,errors:output.filter(r=>r.error),results:output};
        }''',rows)
        Path('artifacts/character-portraits-browser-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
        print(json.dumps({k:v for k,v in report.items() if k!='results'}),flush=True)
        # A local gallery makes face framing inspectable without network dependencies.
        await page.evaluate('''rows=>{document.body.innerHTML='';document.body.style.cssText='background:#11171e;color:#edf3f7;font-family:Arial;padding:25px;display:grid;grid-template-columns:repeat(10,1fr);gap:15px';for(const row of rows){const el=document.createElement('article');el.style.cssText='text-align:center;font-size:10px;min-width:0';const img=document.createElement('img');img.src=row.portrait;img.alt=row.id;img.style.cssText='width:80px;height:85px;object-fit:contain;border-radius:10px;background:#24303c';const name=document.createElement('p');name.textContent=row.id;el.append(img,name);document.body.append(el);}}''',rows)
        await page.locator('img').evaluate_all('(images)=>Promise.all(images.map(i=>i.decode()))')
        await page.screenshot(path='artifacts/all-character-portraits-gallery.png',full_page=True)
        await browser.close()
        assert report['decoded']==300 and not report['errors'],report


asyncio.run(main())
