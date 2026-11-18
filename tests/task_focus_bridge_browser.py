import json, threading
from datetime import date
from functools import partial
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    task = {
        'id': 'task-focus-1', 'title': 'Préparer mon prochain build', 'category': 'Build', 'due': date.today().isoformat(),
        'priority': 'Normale', 'done': False, 'character': '10000005', 'characterName': 'Aether',
        'steps': [
            {'id': 'done', 'title': 'Vérifier le niveau', 'done': True},
            {'id': 'open-1', 'title': 'Comparer les reliques', 'done': False},
            {'id': 'open-2', 'title': 'Enregistrer les statistiques', 'done': False},
        ],
    }
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width': 1366, 'height': 900}, service_workers='block')
            page.set_default_timeout(60000)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            def route(request):
                url = request.request.url
                if url.startswith(base):
                    request.continue_()
                elif '/assets/skills/' in url or '/UI/' in url:
                    request.fulfill(path=str(ROOT / 'assets/ui/game-genshin.png'))
                else:
                    request.abort()
            page.route('**/*', route)
            seed = {
                'astralis:active-game': 'gi',
                'astralis:gi:assistant-profile': json.dumps({'enabled': False, 'proactive': False}),
                'astralis:tasks:gi': json.dumps([task]),
            }
            page.add_init_script('for(const [key,value] of Object.entries(' + json.dumps(seed) + ')) localStorage.setItem(key,value)')
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            page.wait_for_function("document.documentElement.dataset.appReady==='true'")
            page.wait_for_function("document.querySelector('[aria-label=\"Personnages du jeu\"] img')")
            page.wait_for_timeout(300)
            page.locator('.rail-link[data-nav="planner"]').evaluate('(button) => button.click()')
            page.wait_for_selector('.planner-week-grid')
            planner_action = page.locator(f'[data-planner-focus-task="{task["id"]}"]')
            expect(planner_action).to_be_visible()
            assert planner_action.get_attribute('aria-label') == f"Démarrer une session sur {task['title']}"
            planner_action.click()
            form = page.locator('[data-focus-form]')
            expect(form).to_be_visible()
            expect(form.locator('[name=mode]')).to_have_value('build')
            expect(form.locator('[name=title]')).to_have_value(task['title'])
            expect(form.locator('[name=characterId]')).to_have_value('aether')
            expect(form.locator('[name=tasks]')).to_have_value('Comparer les reliques\nEnregistrer les statistiques')
            form.locator('button[type=submit]').click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:focus-station:v1')||'{}').active?.title==='Préparer mon prochain build'")
            session = page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active")
            assert session['game'] == 'gi' and session['mode'] == 'build'
            assert session['characterId'] == 'aether' and session['characterName'] == 'Aether', session
            assert [step['text'] for step in session['tasks']] == ['Comparer les reliques', 'Enregistrer les statistiques']
            assert session['tasks'][0].get('sourceStepId') == 'open-1', session
            page.locator('[data-focus-task="0"]').check()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:tasks:gi')||'[]')[0].steps.find(step=>step.id==='open-1')?.done===true")
            return_button = page.locator('[data-focus-return-task]')
            expect(return_button).to_have_attribute('data-focus-return-task', task['id'])
            return_button.click()
            expect(page.locator('.task-card').filter(has_text=task['title'])).to_be_visible()
            page.keyboard.press('Alt+Shift+t')
            expect(page.locator('#task-title')).to_be_visible()
            expect(page.locator('.task-shortcut-hint')).to_have_text('Alt + Maj + T')
            page.locator('.modal-close').click()
            expect(page.locator('[data-task-focus]')).to_have_count(0)
            page.locator('.rail-link[data-nav="dashboard"]').click()
            page.keyboard.press('Alt+Shift+t')
            expect(page.locator('#task-title')).to_be_visible()
            page.locator('.modal-close').click()
            assert not errors, errors
            browser.close()
            print('Le Planificateur a lancé une session liée à la tâche, conservé sa checklist, sans erreur JavaScript.')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
