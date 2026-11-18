import json, threading
from datetime import date
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    today = date.today().isoformat()
    tasks = [
        {'id':'gi-work','title':'Domaine Genshin','due':today,'done':False,'durationMinutes':25},
        {'id':'hsr-work','title':'Cavernes Star Rail','due':today,'done':False,'durationMinutes':20},
    ]
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    errors = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width':1366,'height':900}, service_workers='block')
            page.on('pageerror', lambda error: errors.append(error.stack or str(error)))
            page.add_init_script("const today=new Date().toLocaleDateString('sv-SE');const gi=JSON.parse(" + json.dumps(json.dumps(tasks[:1])) + ");const hsr=JSON.parse(" + json.dumps(json.dumps(tasks[1:])) + ");[...gi,...hsr].forEach(task=>task.due=today);localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:tasks:gi',JSON.stringify(gi));localStorage.setItem('astralis:tasks:hsr',JSON.stringify(hsr));")
            page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            page.wait_for_function("document.documentElement.dataset.appReady==='true'")
            page.evaluate("document.querySelector('[data-nav=planner]')?.click()")
            result = page.locator('.planner-availability-result')
            expect(result).to_contain_text('PROCHAINE SESSION')
            page.locator('[data-planner-task-filter="game"]').select_option('hsr')
            expect(page.locator('.planner-day-task').first).to_have_attribute('data-planner-game', 'hsr')
            expect(page.locator('.planner-day-task')).to_have_count(1)
            expect(page.locator('[data-planner-task-filter="game"]')).to_have_value('hsr')
            assert page.evaluate("JSON.parse(localStorage.getItem('astralis:planner:task-filters:v1')).game") == 'hsr'
            page.locator('[data-planner-task-filter="game"]').select_option('all')
            time_input = page.locator('[data-planner-availability="startTime"]')
            time_input.fill('18:30'); time_input.dispatch_event('change')
            expect(page.locator('[data-planner-availability="startTime"]')).to_have_value('18:30')
            page.locator('[data-action="planner-reserve-slot"]').click()
            expect(page.locator('.planner-day-task[title^="Session Astralis"]')).to_have_count(1)
            page.locator('[data-planner-week-view="list"]').click()
            expect(page.locator('.planner-week-grid')).to_have_class('planner-week-grid is-list')
            assert page.evaluate("localStorage.getItem('astralis:planner:week-view:v1')") == 'list'
            page.set_viewport_size({'width':390,'height':844})
            assert page.locator('.planner-availability').evaluate('el=>el.scrollWidth<=el.clientWidth+1'), 'le panneau de créneau déborde sur téléphone'
            assert page.locator('.planner-week-grid').evaluate('el=>el.scrollWidth<=el.clientWidth+1'), 'la vue liste déborde sur téléphone'
            assert not errors, errors
            browser.close()
            print('Planificateur : filtres, créneau, réservation, vue liste mémorisée et rendu sans débordement sur téléphone vérifiés.')
    finally:
        server.shutdown(); server.server_close()


if __name__ == '__main__':
    main()
