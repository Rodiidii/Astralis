import json, threading
from datetime import date, timedelta
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    today = date.today().isoformat()
    capacity_date = (date.today() + timedelta(days=1 if date.today().weekday() < 6 else -1)).isoformat()
    tasks = [
        {'id':'domaine', 'game':'gi', 'title':'Domaine de maîtrise', 'due':today, 'done':False},
        {'id':'boss', 'game':'gi', 'title':'Cible de boss', 'due':today, 'done':False},
        {'id':'unknown', 'game':'gi', 'title':'Sans historique', 'due':today, 'done':False},
        {'id':'finished', 'game':'gi', 'title':'Domaine de maîtrise', 'due':today, 'done':True},
        {'id':'capacity', 'game':'gi', 'title':'Grosse session', 'due':capacity_date, 'durationMinutes':180, 'done':False},
    ]
    history = {'active':None,'history':[
        {'game':'gi','title':'Domaine de maîtrise','durationMs':20*60_000},
        {'game':'gi','title':'Domaine de maîtrise','durationMs':30*60_000},
        {'game':'gi','title':'Cible de boss','durationMs':40*60_000},
        {'game':'hsr','title':'Sans historique','durationMs':12*60_000},
    ]}
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    errors = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width':1440,'height':1000}, service_workers='block')
            page.on('pageerror', lambda error: errors.append(error.stack or str(error)))
            page.on('console', lambda message: errors.append(message.text) if message.type == 'error' and ('SyntaxError' in message.text or 'template expression' in message.text) else None)
            page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:tasks:gi'," + json.dumps(json.dumps(tasks)) + ");localStorage.setItem('astralis:focus-station:v1'," + json.dumps(json.dumps(history)) + ");")
            page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            try:
                page.wait_for_function("document.documentElement.dataset.appReady==='true'", timeout=30000)
            except Exception as error:
                raise AssertionError(f"Astralis n'a pas terminé son démarrage. Erreurs navigateur : {errors}") from error
            page.evaluate("document.querySelector('[data-nav=planner]')?.click()")
            page.wait_for_selector('.planner-week-grid')
            day = page.locator(f'.planner-day[data-planner-drop-date="{today}"]')
            expect(day.locator('.planner-day-duration')).to_contain_text('1 h 35 / 2 h')
            expect(day).not_to_have_class(__import__('re').compile(r'is-over-capacity'))
            overloaded = page.locator(f'.planner-day[data-planner-drop-date="{capacity_date}"]')
            expect(overloaded).to_have_class(__import__('re').compile(r'is-over-capacity'))
            expect(overloaded.locator('.planner-day-duration')).to_contain_text('3 h / 2 h')
            expect(day.locator('.planner-day-task-row .planner-task-estimate')).to_have_count(2)
            domaine = day.locator('.planner-day-task-row:has([data-planner-drag-task="domaine"]) .planner-task-estimate')
            boss = day.locator('.planner-day-task-row:has([data-planner-drag-task="boss"]) .planner-task-estimate')
            unknown = day.locator('.planner-day-task-row:has([data-planner-drag-task="unknown"]) .planner-task-estimate')
            expect(domaine).to_have_text('~25 min')
            expect(boss).to_have_text('~40 min')
            expect(unknown).to_have_count(0)
            expect(domaine).to_have_attribute('title','Médiane de 2 sessions terminées avec le même titre et le même jeu dans ton historique local')
            page.set_viewport_size({'width':390,'height':844})
            assert day.evaluate('el=>el.scrollWidth<=el.clientWidth+1'), 'un jour déborde horizontalement sur mobile'
            assert overloaded.evaluate('el=>el.scrollWidth<=el.clientWidth+1'), 'un jour surchargé déborde horizontalement sur mobile'
            assert not errors, errors
            browser.close()
            print('Planificateur : estimations personnelles, médianes par tâche, total journalier et rendu mobile vérifiés.')
    finally:
        server.shutdown(); server.server_close()


if __name__ == '__main__':
    main()
