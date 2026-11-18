import json,threading
from datetime import date
from functools import partial
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 today=date.today().isoformat();options=[{'id':'furina','name':'Furina'},{'id':'neuv','name':'Neuvillette'},{'id':'yelan','name':'Yelan'},{'id':'mona','name':'Mona'}];questions=[{'id':'q1','label':'Élément','value':'Hydro','targetId':'furina','options':options},{'id':'q2','label':'Région','value':'Fontaine','targetId':'neuv','options':options}]
 progress={'games':{'gi':{'day':today,'index':0,'score':0,'answers':[],'hints':{},'questions':questions}},'records':{'gi':{'played':0,'best':0,'streak':0,'lastDay':''}}}
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1366,'height':900},service_workers='block');page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   def route(r):
    url=r.request.url;path=urlsplit(url).path
    if path.startswith('/api/'):r.fulfill(json={})
    elif url.startswith(base):r.continue_()
    elif '/assets/skills/' in url or '/UI/' in url:r.fulfill(path=str(ROOT/'assets/ui/game-genshin.png'))
    else:r.abort()
   page.route('**/*',route)
   seed={'astralis:active-game':'gi','astralis:gi:assistant-profile':json.dumps({'enabled':False,'proactive':False}),'astralis:daily-quiz:v1':json.dumps(progress)}
   page.add_init_script('for(const [key,value]of Object.entries('+json.dumps(seed,ensure_ascii=False)+'))localStorage.setItem(key,value)')
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.locator('[data-nav=daily-quiz]').first.click();page.wait_for_selector('.quiz-question');page.wait_for_selector('[data-daily-quiz][data-quiz-bound="true"]');expect(page.locator('.quiz-game-mark')).to_have_attribute('src','./assets/ui/game-genshin.png');assert page.locator('.quiz-game-mark').evaluate('img=>img.complete&&img.naturalWidth>0');assert page.locator('.quiz-clue-symbol img').evaluate('img=>img.complete&&img.naturalWidth>0')
   expect(page.locator('.quiz-option-key')).to_have_count(4);expect(page.locator('.quiz-combo')).to_have_attribute('data-quiz-combo','0');page.set_viewport_size({'width':390,'height':844});assert page.locator('.daily-quiz-page').evaluate('el=>el.scrollWidth<=el.clientWidth+1');assert page.locator('.quiz-combo').evaluate('el=>el.scrollWidth<=el.clientWidth+1');assert page.locator('.quiz-mastery').evaluate('el=>el.scrollWidth<=el.clientWidth+1');page.set_viewport_size({'width':1366,'height':900});page.locator('.quiz-option').first.focus();page.keyboard.press('2');assert not errors,errors;expect(page.locator('[data-quiz-answer]').nth(1)).to_be_disabled();expect(page.locator('[data-quiz-feedback]')).to_contain_text('Pas cette fois')
   page.locator('[data-quiz-next]').dispatch_event('click');expect(page.locator('.quiz-question-head')).to_contain_text('QUESTION 2')
   page.locator('.quiz-option').first.focus();page.keyboard.press('2');expect(page.locator('[data-quiz-feedback]')).to_contain_text('Exact !');page.locator('[data-quiz-next]').dispatch_event('click');expect(page.locator('.quiz-result')).to_be_visible();expect(page.locator('.quiz-result-best')).to_contain_text('MEILLEURE CHAÎNE · 1');expect(page.locator('.quiz-streak-goal')).to_contain_text('3 jours de série');expect(page.locator('.quiz-streak-goal')).to_contain_text('Défi du jour terminé');expect(page.locator('[data-quiz-share]')).to_be_visible();page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__sharedQuiz=text}}})");page.locator('[data-quiz-share]').click();expect(page.locator('[data-quiz-share]')).to_contain_text('copié');assert '1/2' in page.evaluate('window.__sharedQuiz');assert 'Furina' not in page.evaluate('window.__sharedQuiz')
   expect(page.locator('[data-quiz-practice]')).to_contain_text('Réviser mes erreurs');page.locator('[data-quiz-practice]').click();expect(page.locator('.quiz-practice-banner')).to_contain_text('MODE RÉVISION')
   for _ in range(1):
    page.locator('[data-quiz-answer][data-quiz-correct="true"]').click();page.locator('[data-quiz-next]').click()
   expect(page.locator('.quiz-practice-result')).to_contain_text('Toutes les erreurs sont maîtrisées');saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:daily-quiz:v1'))");assert saved['records']['gi']['mistakes']==[];assert saved['records']['gi']['played']==1;assert saved['records']['gi']['best']==1;assert saved['records']['gi']['bestRun']==1;assert saved['records']['gi']['streak']==1;assert saved['records']['gi']['topicStats']['Élément']=={'attempts':1,'correct':0};assert saved['records']['gi']['topicStats']['Région']=={'attempts':1,'correct':1};expect(page.locator('.quiz-mastery-row').filter(has_text='Élément')).to_contain_text('0/1 justes');expect(page.locator('.quiz-mastery-row').filter(has_text='Région')).to_contain_text('1/1 justes')
   assert not errors,errors;browser.close()
  print('OK: quiz clavier, chaîne de bonnes réponses, record personnel, partage sans spoiler, révision des erreurs, aucune erreur JS.')
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
