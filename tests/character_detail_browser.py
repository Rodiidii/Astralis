"""Real catalog dialog: hierarchy, keyboard tabs, refresh stability and narrow view."""
import json,threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 out=ROOT/'docs/captures/character-dossier';out.mkdir(parents=True,exist_ok=True)
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1440,'height':1000},service_workers='block');page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   def route(r):
    url=r.request.url
    if 'api.lunaris.moe/data/version.json' in url:r.fulfill(json={'version':'test'})
    elif 'api.lunaris.moe/data/test/fr/char/' in url:r.fulfill(json={'description':'Description de fixture pour vérifier la lisibilité.','skills':{'normalattack':{'name':'Attaque normale de test','description':'Un texte de talent suffisamment long pour vérifier la lecture et le retour à la ligne.','icon':'NormalFixture'},'elementalskill':{'name':'Compétence de test','description':'Description du talent.','icon':'SkillFixture'},'elementalburst':{'name':'Déchaînement de test','description':'Description du déchaînement.','icon':'BurstFixture'}}})
    elif url.startswith(base+'/api/'):r.fulfill(json={})
    elif url.startswith(base):r.continue_()
    else:r.abort()
   page.route('**/*',route)
   page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:gi:assistant-profile','{\"enabled\":false}');")
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.locator('[data-nav=characters]').first.click()
   roster=page.locator('.character-catalog-card');
   for index in range(3):roster.nth(index).locator('[data-character-compare]').click()
   comparison=page.locator('.character-compare-panel');expect(comparison).to_be_visible();expect(comparison.locator('.character-compare-card')).to_have_count(3);expect(comparison.locator('.character-compare-count')).to_have_text('3 / 3')
   roster.nth(3).locator('[data-character-compare]').click();expect(comparison.locator('.character-compare-card')).to_have_count(3)
   comparison.locator('[data-character-compare-clear]').click();expect(page.locator('.character-compare-panel')).to_contain_text('Comparer des personnages');expect(page.locator('.character-compare-card')).to_have_count(0)
   weapons=page.locator('.gi-weapon-shortcuts');expect(weapons).to_be_visible();initial_count=int(page.locator('.collection-copy>b').inner_text());sword=weapons.locator('[data-weapon-shortcut=sword]');sword.click();expect(sword).to_have_attribute('aria-pressed','true');assert int(page.locator('.collection-copy>b').inner_text())<initial_count;weapons.locator('[data-weapon-shortcut=all]').click();expect(page.locator('.collection-copy>b')).to_have_text(str(initial_count));shortcuts=page.locator('.gi-element-shortcuts');expect(shortcuts).to_be_visible()
   # Select an actual element button and verify it stays in sync with the regular filter control.
   shortcut=shortcuts.locator('button[data-element-shortcut]:not([data-element-shortcut="all"])').first;shortcut.click()
   expect(shortcut).to_have_attribute('aria-pressed','true');expect(page.locator('#element-filter')).to_have_value(shortcut.get_attribute('data-element-shortcut'))
   shortcuts.locator('[data-element-shortcut="all"]').click();expect(page.locator('#element-filter')).to_have_value('all')
   page.locator('#catalog-search').fill('Skirk');trigger=page.locator('.character-catalog-card').filter(has_text='Skirk').first;trigger.click()
   dialog=page.get_by_role('dialog',name='Skirk');expect(dialog).to_be_visible();expect(dialog.get_by_role('button',name='Fermer la fiche',exact=True)).to_be_focused();roster_nav=dialog.get_by_role('navigation',name='Navigation alphabétique des personnages');expect(roster_nav).to_be_visible();assert '/' in roster_nav.inner_text();before_name=dialog.locator('.detail-title h2').inner_text();roster_nav.get_by_role('button',name='Personnage suivant').click();page.wait_for_function('(name)=>document.querySelector(".detail-title h2")?.textContent!==name',arg=before_name);next_name=page.locator('.detail-title h2').inner_text();assert next_name!=before_name;page.locator('[data-detail-roster-step="-1"]').click();page.wait_for_function('(name)=>document.querySelector(".detail-title h2")?.textContent===name',arg=before_name);
   expect(dialog.locator('.detail-art-main')).to_have_attribute('src',__import__('re').compile(r'10000114.webp'))
   expect(dialog.locator('.detail-art')).to_have_css('height','310px')
   page.wait_for_function("[...document.querySelectorAll('.gi-character-detail,.gi-character-detail *')].every(el=>el.getAnimations().every(a=>a.playState!=='running'||a.effect.getTiming().iterations===Infinity))")
   page.screenshot(path=str(out/'desktop.png'),animations='disabled')
   tabs=dialog.get_by_role('tab');tabs.first.focus();page.keyboard.press('ArrowRight');expect(tabs.nth(1)).to_have_attribute('aria-selected','true');expect(tabs.nth(1)).to_be_focused()
   page.keyboard.press('End');expect(tabs.last).to_have_attribute('aria-selected','true');page.keyboard.press('Home');expect(tabs.first).to_have_attribute('aria-selected','true')
   for button in tabs.all():
    button.click();panel=page.locator('#'+button.get_attribute('aria-controls'));expect(panel).to_be_visible()
    assert dialog.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1')
   build_tab=dialog.locator('[data-detail-tab=personal-builds]');build_tab.click();dialog.locator('[data-detail-favorite]').click()
   expect(dialog.locator('[data-detail-tab=personal-builds]')).to_have_attribute('aria-selected','true')
   page.set_viewport_size({'width':390,'height':844});dialog.locator('[data-detail-tab=kit]').click();dialog.evaluate('(el)=>el.scrollTop=0')
   assert dialog.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1')
   page.screenshot(path=str(out/'mobile.png'),animations='disabled')
   dialog.locator('[data-detail-content=kit]').scroll_into_view_if_needed();page.screenshot(path=str(out/'mobile-kit.png'),animations='disabled')
   close=dialog.get_by_role('button',name='Fermer la fiche',exact=True);close.focus();page.keyboard.press('Shift+Tab');assert dialog.evaluate('(el)=>el.contains(document.activeElement)')
   page.keyboard.press('Escape');expect(dialog).to_have_count(0)
   assert not errors,errors;browser.close();print('Fiche personnage : hiérarchie, onglets clavier, conservation de sélection et mobile vérifiés.',flush=True)
 finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
