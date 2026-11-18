import json, threading
from datetime import date
from functools import partial
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    task = {
        'id': 'weekly', 'title': 'Domaine hebdomadaire', 'category': 'Build',
        'priority': 'Haute', 'due': date.today().isoformat(), 'done': False,
        'character': '', 'characterName': '', 'steps': [
            {'id': 'resin', 'title': 'Dépenser la résine', 'done': True},
            {'id': 'boss', 'title': 'Faire le boss', 'done': False},
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
                path = urlsplit(url).path
                if path.startswith('/api/'):
                    request.fulfill(json={})
                elif url.startswith(base):
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
            page.wait_for_function("document.querySelector('[data-nav=tasks].rail-link')")
            page.locator('.rail-link[data-nav="tasks"]').click()
            card = page.locator('.task-card').filter(has_text='Domaine hebdomadaire')
            expect(card).to_be_visible()
            card.locator('[data-task-edit]').click()
            page.locator('#task-schedule-mode').select_option('fixed')
            page.locator('#task-recurrence').select_option('weekly')
            page.locator('[data-save-task]').click()
            expect(card.locator('.task-recurrence-badge')).to_contain_text('Chaque semaine')
            expect(card.locator('.task-mode-fixed')).to_contain_text('Fixe')
            saved = page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))')
            assert saved[0]['recurrence'] == 'weekly'
            assert saved[0]['scheduleMode'] == 'fixed'
            page.locator('[data-task-toggle]').evaluate('(button) => button.click()')
            saved = page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))')
            current = next(row for row in saved if row['id'] == 'weekly')
            generated = next(row for row in saved if row['id'] != 'weekly')
            assert current['done'] is True
            assert generated['due'] == date.fromisoformat(task['due']).fromordinal(date.fromisoformat(task['due']).toordinal() + 7).isoformat()
            assert generated['seriesId'] == 'weekly'
            assert generated['scheduleMode'] == 'fixed'
            assert [step['done'] for step in generated['steps']] == [False, False]
            page.locator('[data-task-filter="done"]').click()
            page.locator('[data-task-toggle="weekly"]').click()
            page.locator('[data-task-filter="active"]').click()
            page.locator('[data-task-toggle="weekly"]').evaluate('(button) => button.click()')
            saved = page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))')
            assert len([row for row in saved if row.get('seriesId') == 'weekly']) == 2
            page.locator('[data-action="new-task"]').click()
            page.locator('#task-title').fill('Récurrence sans date')
            page.locator('#task-recurrence').select_option('daily')
            page.locator('[data-save-task]').click()
            expect(page.locator('.toast-message').last).to_contain_text('Ajoute une échéance')
            assert not any(row['title'] == 'Récurrence sans date' for row in page.evaluate('JSON.parse(localStorage.getItem("astralis:tasks:gi"))'))
            assert not errors, errors
            browser.close()
        print('OK: édition, occurrence créée, étapes remises à zéro, aucun doublon et échéance requise.')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
