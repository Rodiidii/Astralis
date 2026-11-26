import json,threading,tempfile
from pathlib import Path
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as p,tempfile.TemporaryDirectory() as tmp:
  browser=p.chromium.launch();page=browser.new_page(viewport={'width':1440,'height':1000},permissions=['clipboard-read','clipboard-write']);page.set_default_timeout(15000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(base+'/tests/knowledge-harness.html');page.wait_for_function('window.ready');page.get_by_role('button',name='Furina',exact=True).click();assert page.evaluate('opened[0].id')=='2'
  page.get_by_role('button',name='Mon carnet',exact=True).click();dialog=page.locator('.kw-dialog');expect(dialog).to_be_visible()
  def pane(name):dialog.locator('.kw-tabs').get_by_role('button',name=name,exact=True).click()
  def form(kind):return dialog.locator('[data-kw-form="'+kind+'"]')
  def state():return page.evaluate("JSON.parse(localStorage.getItem('astralis:knowledge:v1'))")
  print('Notes',flush=True)
  form('note').locator('[name=text]').fill('Vérifier les liens avec Fontaine.');form('note').locator('[name=tags]').fill('mémoire, source');form('note').locator('button').click()
  expect(dialog.locator('.kw-note-list textarea')).to_have_value('Vérifier les liens avec Fontaine.')
  dialog.locator('[data-kw=pin-note]').click();dialog.locator('[data-note-text]').fill('Note corrigée');dialog.locator('[data-kw=save-note]').click();doc=next(iter(state()['documents'].values()));assert doc['notes'][0]['text']=='Note corrigée';assert doc['notes'][0]['pinned']
  form('highlight').locator('[name=text]').fill('Les souvenirs sont un fil de lecture.');form('highlight').locator('[name=note]').fill('Un lien à étudier');form('highlight').locator('button').click();dialog.locator('[data-kw=copy-quote]').click();assert 'https://example.com/source' in page.evaluate('navigator.clipboard.readText()')
  assert page.evaluate("CSS.highlights.get('kw-gold').size")==1
  print('Library',flush=True);pane('Bibliothèque');dialog.locator('[data-kw=favorite]').click();form('collection').locator('[name=name]').fill('Mémoire de Teyvat');form('collection').locator('button').click();dialog.locator('[data-collection]').select_option(index=1);dialog.locator('[data-kw=queue]').click();doc=next(iter(state()['documents'].values()));assert doc['favorite'] and doc['queue'] and doc['collection']
  print('Study',flush=True);pane('Étudier');form('question').locator('[name=text]').fill('Quelle source parle de ce souvenir ?');form('question').locator('button').click();dialog.locator('[data-answer]').fill('Le dossier cité.');dialog.locator('[data-kw=answer]').click();form('fact').locator('[name=text]').fill('Relire la source.');form('fact').locator('button').click();dialog.locator('[data-fact]').check();assert next(iter(state()['documents'].values()))['facts'][0]['checked']
  form('timeline').locator('[name=period]').fill('Il y a 500 ans');form('timeline').locator('[name=text]').fill('Repère personnel');form('timeline').locator('[name=source]').fill('https://example.com');form('timeline').locator('button').click();assert len(state()['timeline'])==1
  form('glossary').locator('[name=term]').fill('Irminsul');form('glossary').locator('[name=definition]').fill('Une définition personnelle à vérifier.');form('glossary').locator('button').click();dialog.locator('[data-kw=review]').click();expect(dialog.locator('.kw-flash h3')).to_have_text('Irminsul');dialog.locator('[data-kw=review-ok]').click();assert state()['glossary'][0]['due']>0
  print('Sources and revisions',flush=True);pane('Sources');form('source').locator('[name=title]').fill('Référence personnelle');form('source').locator('[name=url]').fill('https://example.com/second');form('source').locator('button').click();dialog.locator('[data-kw=source-check]').last.click();assert next(iter(state()['documents'].values()))['sources'][-1]['checked'];dialog.locator('[data-kw=bibliography]').click();assert '/second' in page.evaluate('navigator.clipboard.readText()')
  pane('Versions');dialog.locator('[data-kw=snapshot]').click();assert len(next(iter(state()['documents'].values()))['snapshots'])==1;dialog.locator('[data-kw=version-open]').click();expect(dialog.locator('.kw-offline')).to_contain_text('Nahida')
  print('Reading and sessions',flush=True);pane('Lecture');dialog.locator('[data-kw=start-session]').click();page.evaluate("()=>{let s=JSON.parse(localStorage.getItem('astralis:knowledge:v1'));s.session.started-=61000;localStorage.setItem('astralis:knowledge:v1',JSON.stringify(s));}");dialog.locator('[data-kw=stop-session]').click();assert state()['sessions'][0]['seconds']>=60
  dialog.locator('[data-kw=copy-link]').click();assert 'dossier=' in page.evaluate('navigator.clipboard.readText()');dialog.locator('[data-kw=done]').click();assert next(iter(state()['documents'].values()))['read']
  print('Relations',flush=True);pane('Enquêtes');form('path').locator('select').first.select_option('1');form('path').locator('select').last.select_option('2');form('path').locator('button').click();expect(dialog.locator('[data-path-result]')).to_have_text('Nahida → Furina');form('board').locator('[name=title]').fill('Enquête');form('board').locator('[name=text]').fill('Hypothèse personnelle');form('board').locator('button').click();dialog.locator('[data-kw=board-status]').click();assert state()['boards'][0]['status']=='En cours';dialog.locator('[data-kw=graph-summary]').click();expect(dialog.locator('[data-graph-summary]')).to_contain_text('3 personnages')
  with page.expect_download() as d:dialog.locator('[data-kw=backup]').click()
  target=Path(tmp)/'backup.json';d.value.save_as(target);assert json.loads(target.read_text(encoding='utf-8'))['version']==1
  dialog.locator('[data-kw-import]').set_input_files(str(target));expect(dialog.locator('[data-kw-result]')).to_contain_text('Carnet fusionné');assert len(next(iter(state()['documents'].values()))['notes'])==1
  page.set_viewport_size({'width':390,'height':844});assert dialog.evaluate('e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1}')
  page.screenshot(path=str(ROOT/'docs/knowledge-workbench-mobile.png'));dialog.locator('[data-kw=close]').click();page.get_by_role('button',name='Lecture zen',exact=True).click();expect(page.locator('main.lore-page')).to_have_class(__import__('re').compile('kw-focus'))
  page.reload();page.wait_for_function('ready');assert next(iter(state()['documents'].values()))['notes'][0]['text']=='Note corrigée';assert next(iter(state()['documents'].values()))['sources'][-1]['checked']
  assert not errors,errors;print('OK notes, excerpts, citations, library, collections, study, revisions, sessions, paths, boards, backup, mobile and persistence',flush=True);browser.close()
finally:server.shutdown();server.server_close()
