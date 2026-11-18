"""Checks that the existing planner displays same-day load signals."""
import json, threading
from datetime import date
from functools import partial
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    today = date.today().isoformat()
    tasks = [{'id': f'load-{i}', 'title': f'Objectif {i}', 'category': 'Test',
              'priority': 'Normale', 'due': today, 'done': False} for i in range(4)]
    tasks.append({'id': 'load-completed', 'title': 'Déjà terminé', 'category': 'Test',
                  'priority': 'Normale', 'due': today, 'done': True})
    errors = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width': 1440, 'height': 1000}, service_workers='block')
            page.on('pageerror', lambda error: errors.append(error.stack or str(error)))
            page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:tasks:gi'," + json.dumps(json.dumps(tasks)) + ");")
            page.goto(base, wait_until='domcontentloaded')
            page.wait_for_selector('#astralis-launch-screen', state='detached')
            page.wait_for_function("document.documentElement.dataset.appReady==='true'")
            page.evaluate("document.querySelector('[data-nav=planner]')?.click()")
            page.wait_for_selector('.planner-week-grid', timeout=12000)
            day = page.locator(f'.planner-day[data-planner-drop-date="{today}"]')
            expect(day).to_have_class(__import__('re').compile('has-conflicts'))
            expect(day).to_have_class(__import__('re').compile('is-crowded'))
            expect(day.locator('.planner-conflict-badge')).to_have_text('4 à faire')
            assert day.locator('.planner-conflict-badge').get_attribute('aria-label') == '4 objectifs encore à faire'
            expect(day.locator('.planner-day-task-row')).to_have_count(3)
            expect(day.locator('.planner-day-more')).to_have_text('+ 2 autres')
            day.locator('.planner-day-more').click()
            expect(day.locator('.planner-day-task-row')).to_have_count(5)
            expect(day.locator('.planner-day-more')).to_have_attribute('aria-expanded', 'true')
            day.locator('.planner-day-more').click()
            expect(day.locator('.planner-day-task-row')).to_have_count(3)
            expect(page.locator('.planner-week-progress-summary > span')).to_have_text('1 / 5 objectifs terminés')
            assert page.locator('.planner-week-progress-summary [role=progressbar]').get_attribute('aria-valuenow') == '20'
            today_progress = page.locator(f'.planner-week-progress-day[aria-label*="{today}"]')
            expect(today_progress).to_have_count(1)
            assert '4 à faire' in today_progress.get_attribute('aria-label')
            assert today_progress.locator('[role=progressbar]').get_attribute('aria-valuenow') == '20'
            expect(today_progress.locator('span')).to_have_text('4 à faire')
            page.locator('[data-planner-task-toggle="load-0"]').click()
            page.wait_for_function("JSON.parse(localStorage.getItem('astralis:tasks:gi')).find(task=>task.id==='load-0')?.done===true")
            expect(page.locator('.planner-week-progress-summary > span')).to_have_text('2 / 5 objectifs terminés')
            expect(page.locator(f'.planner-day[data-planner-drop-date="{today}"] .planner-conflict-badge')).to_have_text('3 à faire')
            page.set_viewport_size({'width': 390, 'height': 844})
            page.wait_for_timeout(150)
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'débordement horizontal sur téléphone'
            expect(page.locator('.planner-day-task-row')).to_have_count(3)
            with page.expect_download() as download_info:
                page.locator('[data-action=planner-export-ics]').click()
            download = download_info.value
            contents = Path(download.path()).read_text(encoding='utf-8')
            assert contents.count('BEGIN:VEVENT') == 3
            assert f'DTSTART;VALUE=DATE:{today.replace("-", "")}' in contents
            assert 'SUMMARY:Objectif 1' in contents
            assert not errors, errors
            browser.close()
            print('Planificateur : charge du jour et progression hebdomadaire annoncées; export .ics valide; aucune erreur JavaScript.', flush=True)
    finally:
        server.shutdown(); server.server_close()


if __name__ == '__main__':
    main()
