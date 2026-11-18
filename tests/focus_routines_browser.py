"""Browser check for save, game filtering, restore and delete of focus routines."""
import json
import threading
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server


def main():
    server = Server(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width': 1280, 'height': 900}, service_workers='block')
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.add_init_script("localStorage.removeItem('astralis:focus-routines:v1');localStorage.removeItem('astralis:focus-station:v1')")
            page.goto(base + '/tests/fixtures/focus-routines.html', wait_until='load')
            form = page.locator('[data-focus-form]')
            expect(form).to_be_visible()
            form.locator('[name=mode]').select_option('team')
            form.locator('[name=title]').fill('Rotation Furina')
            form.locator('[name=tasks]').fill('Préparer les buffs\nEnchaîner E puis Q\nVérifier la recharge')
            form.locator('[data-focus-save-routine]').click()
            routine = form.locator('[data-focus-custom=true]')
            expect(routine).to_have_count(1)
            expect(routine).to_contain_text('Rotation Furina')
            search = form.locator('[data-focus-routine-search]')
            search.fill('furina')
            expect(routine).to_be_visible()
            search.fill('absent')
            expect(routine).to_be_hidden()
            expect(form.locator('[data-focus-routine-empty]')).to_be_visible()
            search.fill('')
            form.locator('[name=game]').select_option('hsr')
            expect(form.locator('[data-focus-custom=true]')).to_have_count(0)
            form.locator('[name=game]').select_option('gi')
            routine = form.locator('[data-focus-custom=true]')
            expect(routine).to_have_count(1)
            routine.click()
            expect(form.locator('[name=mode]')).to_have_value('team')
            expect(form.locator('[name=title]')).to_have_value('Rotation Furina')
            expect(form.locator('[name=tasks]')).to_have_value('Préparer les buffs\nEnchaîner E puis Q\nVérifier la recharge')
            page.locator('[data-focus-routine-delete]').click()
            expect(form.locator('[data-focus-custom=true]')).to_have_count(0)
            assert page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-routines:v1')).length") == 0
            goal_mode = page.locator('[data-focus-week-goal-mode]')
            goal_mode.select_option('sessions')
            goal_target = page.locator('[data-focus-week-goal]')
            expect(goal_target).to_have_value('5')
            expect(page.locator('[data-focus-week-goal-label]')).to_contain_text('0 / 5 sessions terminées')
            goal_target.select_option('3')
            expect(page.locator('[data-focus-week-goal-remaining]')).to_contain_text('3 sessions')
            assert page.evaluate("localStorage.getItem('astralis:focus-weekly-sessions-goal:v1')") == '3'
            goal_mode.select_option('minutes')
            expect(goal_target).to_have_value('180')
            expect(page.locator('[data-focus-week-goal-label]')).to_contain_text('0 / 180 min cette semaine')
            assert page.evaluate("localStorage.getItem('astralis:focus-weekly-goal-mode:v1')") == 'minutes'
            page.set_viewport_size({'width': 390, 'height': 844})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
            expect(goal_mode).to_be_visible()
            expect(goal_target).to_be_visible()
            assert not errors, errors
            print('Routine et deux modes d’objectif hebdomadaire validés dans Chromium; aucune erreur JavaScript.')
            browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
