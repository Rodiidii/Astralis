"""Exercise dashboard widget edits and saved layouts at a phone viewport."""
import threading
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent.parent

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

def main():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch()
            page=browser.new_page(viewport={'width':390,'height':844})
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.goto(f'http://127.0.0.1:{server.server_port}/tests/fixtures/dashboard-layout-editor.html')
            scene=page.locator('.studio-scene')
            assert scene.locator('.studio-scene-game img').get_attribute('src')=='/assets/ui/game-genshin.png'
            roster=scene.locator('.studio-scene-people')
            assert roster.is_visible() and roster.locator('.studio-scene-person').count()==2
            assert roster.locator('img[alt="Venti"]').is_visible()
            assert page.evaluate("document.querySelector('.studio-scene-people').scrollWidth <= document.querySelector('.studio-scene-people').clientWidth + 100")
            page.locator('[data-cosmos-open]').click()
            settings=page.locator('.cosmos-settings')
            reduced=settings.locator('[data-cosmos="motion"]')
            reduced.check()
            soft=settings.locator('[data-cosmos="softContrast"]')
            soft.check()
            assert page.locator('.dashboard-studio').get_attribute('data-cosmos-motion')=='off'
            assert page.locator('.dashboard-studio').get_attribute('data-soft-contrast')=='true'
            prefs=page.evaluate("JSON.parse(localStorage.getItem('astralis:cosmos:gi'))")
            assert prefs['motion'] is False and prefs['softContrast'] is True
            settings.locator('form button').click()
            resume=page.locator('[data-studio-widget="resume"]')
            assert resume.count()==1 and resume.locator('[data-nav="farming"]').count()==1
            resume.locator('[data-nav="farming"]').click()
            last_action=page.evaluate("JSON.parse(localStorage.getItem('astralis:studio:last-action:gi'))")
            assert last_action['destination']=='farming' and last_action['label']=='Plan de farm'
            page.locator('[data-studio-edit]').click()
            assert not errors,errors
            assert page.locator('.studio-catalog').is_visible()
            pulse=page.locator('[data-studio-widget="week"] .studio-day-pulse')
            assert pulse.count()==1
            assert 'ÉVÉNEMENTS' in pulse.inner_text() and 'ACTIVITÉS QUOTIDIENNES' in pulse.inner_text()
            assert pulse.locator('[role="progressbar"]').count()==1
            guided=page.locator('.studio-guided-empty')
            assert guided.count()>=4
            assert page.locator('.widget-banners .studio-guided-empty [data-nav="events"]').count()==1
            assert page.locator('.widget-events .studio-guided-empty [data-nav="events"]').count()==1
            assert page.locator('.widget-wall .studio-guided-empty [data-nav="profile"]').count()==1
            assert page.locator('.widget-team .studio-guided-empty [data-nav="characters"]').count()==1
            week=page.locator('[data-studio-widget="week"]')
            week.locator('[data-studio-hide]').click()
            assert not errors,errors
            assert page.locator('[data-studio-widget="week"]').count()==0
            page.locator('[data-studio-add="week"]').click()
            assert not errors,errors
            assert page.locator('[data-studio-widget="week"]').count()==1
            page.locator('[data-studio-add="farm"]').click()
            assert not errors,errors
            assert page.locator('[data-studio-widget="farm"]').count()==1
            resize=page.locator('[data-studio-widget="farm"] [data-studio-resize]')
            resize.focus()
            resize.press('ArrowRight')
            saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:studio:gi'))")
            farm_width=next(widget['width'] for widget in saved['layouts'][0]['widgets'] if widget['id']=='farm')
            assert farm_width==2
            move=page.locator('[data-studio-drag="week"]')
            move.focus()
            move.press('ArrowDown')
            saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:studio:gi'))")
            assert next(i for i,w in enumerate(saved['layouts'][0]['widgets']) if w['id']=='week')==2
            name=page.locator('[data-studio-name]')
            name.fill('Mes objectifs')
            name.dispatch_event('change')
            assert not errors,errors
            page.evaluate("window.prompt=()=> 'Copie téléphone'")
            page.locator('[data-studio-save]').click()
            assert not errors,errors
            saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:studio:gi'))")
            assert len(saved['layouts'])==2 and saved['layouts'][1]['name']=='Copie téléphone'
            assert any(widget['id']=='farm' for widget in saved['layouts'][1]['widgets'])
            assert page.locator('[data-studio-layout] option').count()==2
            overflow=page.evaluate("({width:document.documentElement.scrollWidth,items:[...document.querySelectorAll('body *')].map(n=>({tag:n.tagName,cls:String(n.className||''),right:Math.round(n.getBoundingClientRect().right)})).filter(n=>n.right>innerWidth+1).slice(0,8)})")
            assert overflow['width']<=390,overflow
            page.set_viewport_size({'width':1920,'height':1080})
            assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
            assert page.evaluate("getComputedStyle(document.querySelector('.studio-canvas')).gridTemplateColumns.split(' ').length") == 4
            assert not errors,errors
            loading_page=browser.new_page(viewport={'width':390,'height':844})
            loading_page.on('pageerror',lambda error:errors.append(str(error)))
            loading_page.goto(f'http://127.0.0.1:{server.server_port}/tests/fixtures/dashboard-layout-editor.html?loading=1')
            assert loading_page.locator('.studio-loading[aria-busy="true"]').count()>=4
            assert loading_page.locator('.studio-loading-roster').is_visible()
            loading_page.evaluate('window.resolveFixtureLoading()')
            assert loading_page.locator('.studio-loading').count()==0
            assert loading_page.locator('.studio-scene-person img[alt="Venti"]').is_visible()
            assert not errors,errors
            steps_page=browser.new_page(viewport={'width':390,'height':844})
            steps_page.on('pageerror',lambda error:errors.append(str(error)))
            steps_page.goto(f'http://127.0.0.1:{server.server_port}/tests/fixtures/dashboard-layout-editor.html?steps=1')
            routine=steps_page.locator('.studio-team-routine[aria-label="Routine de l’équipe Équipe de test"]')
            assert routine.locator('ol li').count()==2
            done_step=routine.locator('ol li.is-done')
            assert done_step.count()==1 and done_step.inner_text().find('Activer la compétence')>=0
            assert done_step.locator('button[aria-pressed="true"]').count()==1
            assert not errors,errors
            browser.close()
    finally:
        server.shutdown()
    print('PASS: mobile and 1920px dashboard, progressive loading skeletons, completed dashboard steps, widgets, and saved layouts.')

if __name__=='__main__': main()
