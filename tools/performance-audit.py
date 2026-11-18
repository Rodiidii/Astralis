"""Measure a cold local Astralis page load without using the service-worker cache."""
from __future__ import annotations

import json
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class LocalServer(ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 128


def main() -> None:
    server = LocalServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    origin = f"http://127.0.0.1:{server.server_port}"
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(service_workers="block")
            page.set_default_timeout(90_000)
            errors: list[str] = []
            page.on("pageerror", lambda error: errors.append(str(error)))

            def local_only(route):
                request_url = route.request.url
                if not request_url.startswith(origin):
                    route.abort()
                    return
                path = Path(ROOT, unquote(urlsplit(request_url).path.lstrip("/"))).resolve()
                if path.is_dir():
                    path = path / "index.html"
                if path.is_relative_to(ROOT) and path.is_file():
                    route.fulfill(path=str(path))
                elif "/api/" in urlsplit(request_url).path:
                    route.fulfill(json={})
                else:
                    route.fulfill(status=404, body="")

            page.route("**/*", local_only)
            page.add_init_script("""
              localStorage.setItem('astralis:active-game','gi');
              localStorage.setItem('astralis:gi:assistant-profile','{"enabled":false}');
              window.__astralisLongTasks=[];
              try { new PerformanceObserver(list=>window.__astralisLongTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true}); } catch {}
              const markReady=()=>{if(document.documentElement.dataset.appReady==='true'&&window.__astralisReadyAt==null)window.__astralisReadyAt=performance.now()};
              const watchReady=()=>{if(!document.documentElement){setTimeout(watchReady,0);return;}new MutationObserver(markReady).observe(document.documentElement,{attributes:true,attributeFilter:['data-app-ready']});markReady();};watchReady();
            """)
            response = page.goto(origin, wait_until="domcontentloaded")
            page.wait_for_function("document.documentElement.dataset.appReady==='true'")
            page.evaluate("""() => {
              const samples=[];let previous=0;
              const sample=now=>{if(previous)samples.push(now-previous);previous=now;if(samples.length<240)requestAnimationFrame(sample)};
              window.__dashboardFrameSamples=samples;requestAnimationFrame(sample);
            }""")
            page.wait_for_timeout(4000)
            report = page.evaluate(r"""() => {
              const nav=performance.getEntriesByType('navigation')[0];
              const entries=performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,kind:r.initiatorType,duration:Math.round(r.duration),bytes:r.transferSize||r.encodedBodySize||0}));
              const grouped={};
              for(const row of entries){const ext=row.name.split('.').pop().split('?')[0];const key=ext==='js'?'JS':ext==='css'?'CSS':/\.(png|jpe?g|webp|svg|avif)$/i.test(row.name)?'Images':'Other';const group=grouped[key]||={count:0,bytes:0,duration:0};group.count++;group.bytes+=row.bytes;group.duration=Math.max(group.duration,row.duration);}
              const frames=window.__dashboardFrameSamples||[],sorted=[...frames].sort((a,b)=>a-b),percentile=p=>sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p))]||0;
              const visibleWorlds=[...document.querySelectorAll('astralis-world,astralis-planet')].filter(node=>node.getBoundingClientRect().width>0),engines={};for(const node of visibleWorlds){const key=node.dataset.engine||'pending';engines[key]=(engines[key]||0)+1;}
              return {appReadyMs:Math.round(window.__astralisReadyAt||performance.now()),domContentLoadedMs:Math.round(nav.domContentLoadedEventEnd-nav.startTime),loadEventMs:Math.round(nav.loadEventEnd-nav.startTime),transferBytes:entries.reduce((sum,r)=>sum+r.bytes,0),resourceCount:entries.length,groups:grouped,dashboardRuntime:{visibility:document.visibilityState,frameSamples:frames.length,medianFrameMs:Math.round(percentile(.5)*10)/10,p95FrameMs:Math.round(percentile(.95)*10)/10,framesOver33ms:frames.filter(ms=>ms>33).length,visiblePlanetCount:visibleWorlds.length,engines},largestResources:entries.sort((a,b)=>b.bytes-a.bytes).slice(0,15),longTasks:window.__astralisLongTasks||[]};
            }""")
            report["httpStatus"] = response.status if response else None
            report["pageErrors"] = errors
            print(json.dumps(report, ensure_ascii=False, indent=2))
            browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
