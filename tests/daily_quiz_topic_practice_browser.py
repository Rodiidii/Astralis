import threading
from functools import partial

from playwright.sync_api import expect, sync_playwright
from voyage_browser import ROOT, Quiet, Server


def main():
    server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as playwright:
            browser=playwright.chromium.launch()
            page=browser.new_page(viewport={'width':390,'height':844})
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.goto(f'http://127.0.0.1:{server.server_port}/tests/fixtures/daily-quiz-explanation.html')
            row=page.locator('.quiz-mastery-row').filter(has_text='Région')
            expect(row.locator('[data-quiz-practice]')).to_have_text('Réviser · 1')
            row.locator('[data-quiz-practice]').click()
            banner=page.locator('.quiz-practice-banner')
            expect(banner).to_contain_text('RÉVISION · RÉGION')
            expect(page.locator('.quiz-question-head')).to_contain_text('1 / 1')
            expect(page.locator('.quiz-clue')).to_contain_text('Région')
            page.locator('[data-quiz-answer="furina"]').click()
            expect(page.locator('[data-quiz-feedback]')).to_contain_text('Exact')
            page.locator('[data-quiz-next]').click()
            expect(page.locator('.quiz-practice-result')).to_contain_text('1/1')
            saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:daily-quiz:v1'))")
            assert [item['label'] for item in saved['records']['gi']['mistakes']]==['Élément']
            assert saved['records']['gi']['played']==0 and saved['records']['gi']['best']==0
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
            assert not errors,errors
            browser.close()
        print('OK : révision d’un thème, retrait de l’erreur corrigée, score quotidien intact et mobile validés.')
    finally:
        server.shutdown();server.server_close()


if __name__=='__main__':main()
