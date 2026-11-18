import json,threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page();page.add_init_script('localStorage.setItem("astralis:energy-dock:v1",'+json.dumps(json.dumps({'gi':{'current':80,'max':200,'minutes':8,'updatedAt':4102444800000},'hsr':{'current':300,'max':300,'minutes':6,'updatedAt':4102444800000}},ensure_ascii=False))+')');page.goto(base+'/tests/fixtures/energy-meter.html');page.wait_for_selector('[data-energy-game-meter]')
   gi=page.locator('[data-energy-game="gi"] [data-energy-game-meter]');hsr=page.locator('[data-energy-game="hsr"] [data-energy-game-meter]');expect(gi).to_have_attribute('aria-valuenow','80');expect(gi).to_have_attribute('aria-valuemax','200');expect(gi).to_have_attribute('style','--energy-game-progress:40%');expect(hsr).to_have_attribute('aria-valuenow','300');expect(hsr).to_have_attribute('style','--energy-game-progress:100%');portfolio=page.locator('[data-energy-portfolio]');expect(portfolio).to_be_visible();expect(portfolio.locator('[data-energy-portfolio-count]')).to_have_text('2 / 3 jeux suivis');expect(portfolio.locator('[data-energy-portfolio-status]')).to_contain_text('1 pleine');expect(portfolio.locator('[data-energy-portfolio-next]')).to_contain_text('Genshin Impact')
   goal=page.locator('[data-energy-daily-goal]');expect(goal).to_be_visible();expect(goal.locator('[role="progressbar"]')).to_be_hidden();goal.locator('[name="dailyGoal"]').fill('80');goal.locator('[type="submit"]').click();meter=goal.locator('[role="progressbar"]');expect(meter).to_have_attribute('aria-valuenow','0');expect(goal.locator('[data-energy-goal-message]')).to_contain_text('Encore 80')
   page.locator('[data-energy-spend-form] [name="amount"]').fill('40');page.locator('[data-energy-spend-form] [type="submit"]').click();expect(page.locator('[data-energy-daily-goal] [role="progressbar"]')).to_have_attribute('aria-valuenow','50');expect(page.locator('[data-energy-goal-message]')).to_contain_text('Encore 40')
   page.locator('[data-energy-spend-form] [name="amount"]').fill('40');page.locator('[data-energy-spend-form] [type="submit"]').click();expect(page.locator('[data-energy-daily-goal] [role="progressbar"]')).to_have_attribute('aria-valuenow','100');expect(page.locator('[data-energy-goal-message]')).to_contain_text('Objectif du jour atteint')
   page.locator('[data-energy-goal-clear]').click();expect(page.locator('[data-energy-daily-goal] [role="progressbar"]')).to_be_hidden();browser.close()
  print('OK: jauges multi-jeux et objectif journalier modifiable, actualisé après dépense et effaçable.')
 finally:server.shutdown()
if __name__=='__main__':main()
