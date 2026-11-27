"""Browser journey for the custom character sheet editor and idle delivery."""
import threading,sys
sys.stdout.reconfigure(encoding="utf-8")
from functools import partial
from urllib.parse import parse_qs, urlsplit
from playwright.sync_api import sync_playwright
from voyage_browser import ROOT, Quiet, Server


server = Server(("127.0.0.1", 0), partial(Quiet, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}"
published = {}
read_only_mode = {"value": False}
harness = """<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>
<link rel=stylesheet href=/styles/character-sheets.css><div style='position:fixed;left:5px;top:5px;z-index:3'><small data-sheet-unread-badge hidden></small></div><main id=host></main>
<script type=module>
import {initCharacterSheets} from '/src/character-sheets.js?v=browser-test';
const characters=[{id:'10000032',name:'Bennett',element:'Pyro',image:'/assets/relations/team-portraits/10000032.webp',splash:'/assets/genshin/splashes/10000032.webp',skillIcons:['/assets/genshin/skills/Skill_A_01.png','/assets/genshin/skills/Skill_S_Bennett_01.png','/assets/genshin/skills/Skill_E_Bennett_01.png']},{id:'10000107',name:'Mavuika',element:'Pyro',image:'/assets/relations/team-portraits/10000107.webp',splash:'/assets/genshin/splashes/10000107.webp',skillIcons:['/assets/genshin/skills/Skill_A_01.png','/assets/genshin/skills/Skill_S_Mavuika_01.png','/assets/genshin/skills/Skill_E_Mavuika_01.png']}];
const weapons=[{id:'w-1',name:'Épée de test',image:'/assets/genshin/weapons/types/sword.png'}],artifacts=[{id:'a-1',name:'Artéfacts de test',image:'/assets/sheet-icons/artifact.svg'}];
initCharacterSheets(document.querySelector('#host'),{characters,weapons,artifacts});window.sheetHarnessReady=true;
</script>"""


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=playwright.chromium.executable_path,args=["--enable-unsafe-swiftshader"])
        author = browser.new_page(viewport={"width": 1440, "height": 1000})
        author_errors = []
        author.on("pageerror", lambda error: author_errors.append(str(error)))

        def mock_api(route):
            request = route.request
            path = urlsplit(request.url).path
            if path == "/sheets-harness":
                route.fulfill(body=harness, content_type="text/html")
            elif path == "/api/character-sheets/status":
                route.fulfill(json={"ok": True, "readOnly": read_only_mode["value"], "adminConfigured": not read_only_mode["value"], "authenticated": False, "localAdmin": not read_only_mode["value"], "publishReady": not read_only_mode["value"], "storage": "Stockage de test"})
            elif path == "/api/character-sheets/index":
                rows = [dict(item) for item in published.values()]
                route.fulfill(json={"sheets": sorted(rows, key=lambda item: item["updatedAt"], reverse=True)})
            elif path == "/api/character-sheets/publish":
                payload = request.post_data_json["sheet"]
                previous = published.get(payload["id"])
                version = (previous["version"] + 1) if previous else 1
                payload.update({"version": version, "updatedAt": 1_800_000_000_000 + version, "publishedAt": 1_800_000_000_000 + version})
                metadata = {key: payload.get(key) for key in ("id", "characterId", "characterName", "title", "cover", "theme", "version", "createdAt", "updatedAt", "publishedAt", "tags")}
                metadata["pageCount"] = len(payload.get("pages", []))
                published[payload["id"]] = {"metadata": metadata, "sheet": payload, **metadata}
                route.fulfill(json={"ok": True, "sheet": metadata})
            elif path == "/api/character-sheets/item":
                sheet_id = parse_qs(urlsplit(request.url).query).get("id", [""])[0]
                item = published.get(sheet_id)
                route.fulfill(status=200, json={"sheet": item["sheet"]}) if item else route.fulfill(status=404, json={"error": "Fiche introuvable."})
            elif path == "/api/character-sheets/delete":
                payload = request.post_data_json
                existed = published.pop(payload["id"], None) is not None
                route.fulfill(json={"ok": True, "deleted": existed})
            elif path == "/api/character-sheets/logout":
                route.fulfill(json={"ok": True})
            else:
                route.continue_()

        author.route("**/*", mock_api)
        author.goto(base + "/sheets-harness")
        author.wait_for_function("window.sheetHarnessReady===true")
        author.wait_for_selector(".sheets-hero")
        author.locator('[data-sheet-library-view="published"]').click()
        assert author.locator('#sheets-drafts').count() == 0
        author.locator('[data-sheet-library-view="all"]').click()
        author.locator('[data-sheet-action="new"][data-sheet-template="build"]').click()
        author.locator('[data-person-choice=\"10000032\"]').click()
        guide_count = author.locator('.sheet-editor-guide summary').evaluate("node=>Number(node.textContent.match(/\\d+/)?.[0]||0)")
        assert guide_count >= 40, f"Expected at least 40 discoverable editor tools, found {guide_count}"
        author.locator('[data-sheet-field="title"]').fill("Guide complet de Bennett")
        author.locator('[data-sheet-field="characterId"]').select_option("10000032")
        editor_splash = author.locator('.sheet-document-cover .sheet-character-splash')
        assert editor_splash.get_attribute('src').endswith('/assets/genshin/splashes/10000032.webp'), "The editor uses the character splash art"

        body = author.locator('[data-sheet-block-content]').first
        body.click()
        body.press_sequentially("Rotation Cryo :cryo: ")
        author.wait_for_selector('[data-sheet-token="cryo"]')
        body.press_sequentially(":mavuika: :tc: :dc: ")
        author.wait_for_selector('[data-sheet-token="mavuika"]')
        author.wait_for_selector('[data-sheet-token="tc"]')
        author.wait_for_selector('[data-sheet-token="dc"]')
        assert author.locator('[data-sheet-token="tc"] img').evaluate_all("images=>images.every(image=>image.complete&&image.naturalWidth>0)")
        assert author.locator('[data-sheet-token="dc"] img').evaluate_all("images=>images.every(image=>image.complete&&image.naturalWidth>0)")
        assert author.locator('[data-sheet-token="tc"]').first.evaluate("node=>getComputedStyle(node.querySelector('span')).display==='none'"), "Inline tokens show their icon only"

        icon_library = author.locator('.sheet-icon-library')
        icon_library.locator('summary').click()
        assert icon_library.evaluate("node=>getComputedStyle(node).backgroundColor==='rgb(18, 27, 40)'"), "Icon library uses the dark Astralis surface"
        assert icon_library.locator('[data-sheet-icon-search]').evaluate("node=>getComputedStyle(node.parentElement).backgroundColor==='rgb(13, 21, 31)'"), "Icon search field no longer sits on a white or black patch"
        assert icon_library.locator('[data-sheet-insert-token="skill"]').evaluate("node=>getComputedStyle(node).backgroundColor==='rgb(20, 31, 45)'"), "Icon tiles use the dark surface"
        assert icon_library.locator('[data-sheet-insert-token="skill"] img').get_attribute('src').endswith('Skill_S_Bennett_01.png')
        assert icon_library.locator('[data-sheet-insert-token="burst"] img').get_attribute('src').endswith('Skill_E_Bennett_01.png')
        assert icon_library.locator('[data-sheet-insert-token="skill"] img').evaluate("image=>image.complete&&image.naturalWidth>0"), "Elemental skill icon is a real game asset"
        assert author.locator('[data-sheet-token="cryo"] img').evaluate("image=>image.complete&&image.naturalWidth>0"), "Element icon is a real game asset"
        icon_library.locator('[data-sheet-icon-category="weapons"]').click()
        icon_search = icon_library.locator('[data-sheet-icon-search]')
        icon_search.fill('test')
        test_weapon_icon = icon_library.locator('[data-sheet-insert-token="epee-de-test"]')
        test_weapon_icon.wait_for()
        test_weapon_icon.scroll_into_view_if_needed()
        author.wait_for_function("() => { const button = [...document.querySelectorAll('[data-sheet-insert-token]')].find(item => item.dataset.sheetInsertToken === 'epee-de-test'); const image = button?.querySelector('img'); return image?.complete && image.naturalWidth > 0; }")
        assert test_weapon_icon.locator('img').evaluate("image=>image.complete&&image.naturalWidth>0")
        icon_search.fill('')
        body.click()
        body.press_sequentially(' ')
        test_weapon_icon.click()
        author.wait_for_selector('[data-sheet-token="epee-de-test"]')
        assert author.locator('[data-sheet-token="epee-de-test"] img').evaluate("image=>image.complete&&image.naturalWidth>0")
        assert author.locator('.sheet-editor-outline').evaluate("node=>getComputedStyle(node).position==='sticky'")

        author.locator('[data-sheet-action="add-block"][data-block-type="table"]').click()
        table = author.locator('.sheet-block-table')
        before_rows = table.locator("tr").count()
        table.locator('[data-sheet-action="table-row"]').click()
        assert table.locator("tr").count() == before_rows + 1
        before_columns = table.locator("tr").first.locator("th,td").count()
        table.locator('[data-sheet-action="table-column"]').click()
        assert table.locator("tr").first.locator("th,td").count() == before_columns + 1

        author.locator('[data-sheet-action="page-add"]').click()
        author.locator('[data-sheet-page-title]').last.fill("Variantes et équipe")
        author.locator('[data-sheet-action="add-block"][data-block-type="team"]').click()
        team = author.locator('.sheet-team-composition')
        team.locator('[data-sheet-team-field="characterId"]').first.select_option("10000107")
        team.locator('[data-sheet-team-field="weaponId"]').first.select_option("w-1")
        team.locator('[data-sheet-team-field="artifactId"]').first.select_option("a-1")
        assert team.locator('.sheet-team-portrait img').count() == 1
        assert team.locator('.sheet-team-portrait img').evaluate("image=>getComputedStyle(image).objectFit==='contain'"), "Team portraits show the full character icon"
        assert team.locator('.sheet-team-gear img').count() == 2

        author.locator('[data-sheet-action="add-block"][data-block-type="image"]').click()
        image_file = {"name": "teyvat.png", "mimeType": "image/png", "buffer": bytes([137, 80, 78, 71, 13, 10, 26, 10]) + bytes(32)}
        author.locator('[data-sheet-block-image]').set_input_files(image_file)
        author.wait_for_selector('.sheet-image-preview')
        author.locator('[data-sheet-image-width]').last.fill("60")
        author.locator('[data-sheet-image-align]').last.select_option("right")
        author.set_viewport_size({"width": 390, "height": 844})
        assert author.evaluate("document.documentElement.scrollWidth<=innerWidth+2"), "The editor fits a phone screen"
        author.set_viewport_size({"width": 1440, "height": 1000})

        author.locator('[data-sheet-action="save"]').first.click()
        assert not published
        author.locator('[data-sheet-action="preview"]').click()
        author.locator('[data-sheet-preview-width="phone"]').click()
        assert author.locator('.sheet-reader-page').get_attribute("data-preview-width") == "phone"
        assert author.evaluate("document.documentElement.scrollWidth<=innerWidth+2")
        author.locator('[data-sheet-action="edit"]').click()
        author.locator('[data-sheet-action="publish"]').first.click()
        author.wait_for_function("document.querySelector('.sheet-editor-page')===null || document.querySelector('.sheet-draft-status')?.textContent.includes('non publiées')")
        assert len(published) == 1
        published_id = next(iter(published))
        assert len(published[published_id]["sheet"]["pages"]) == 2
        assert published[published_id]["pageCount"] == 2

        author.locator('[data-sheet-action="back"]').first.click()
        splash_cover = author.locator('.sheet-library-card .sheet-card-cover.has-splash-art img').first
        assert splash_cover.get_attribute('src').endswith('/assets/genshin/splashes/10000032.webp'), "Character sheets use the splash illustration"
        assert splash_cover.evaluate("image=>image.complete&&image.naturalWidth>0"), "Character splash illustration loads"
        author.locator('[data-sheet-action="read"]').click()
        author.wait_for_selector('.sheet-reader-page')
        assert author.locator('.sheet-read-page').count() == 2
        assert author.locator('.sheet-reader-toc .is-page-link').count() == 2
        assert author.locator('.sheet-reader-hero .sheet-character-splash').get_attribute('src').endswith('/assets/genshin/splashes/10000032.webp'), "Published sheet uses the character splash art"
        assert author.locator('.sheet-read-team').count() == 2
        assert author.locator('.sheet-read-team article > img').first.evaluate("image=>getComputedStyle(image).objectFit==='contain'"), "Published team portraits show the full character icon"
        assert not author_errors, author_errors

        recipient_context = browser.new_context(viewport={"width": 390, "height": 844})
        recipient_context.clock.install()
        recipient = recipient_context.new_page()
        recipient_errors = []
        recipient.on("pageerror", lambda error: recipient_errors.append(str(error)))
        recipient.route("**/*", mock_api)
        recipient.goto(base + "/sheets-harness")
        recipient.wait_for_function("window.sheetHarnessReady===true")
        recipient.wait_for_selector(".sheet-library-card.is-published")
        recipient.wait_for_timeout(20)
        recipient_context.clock.fast_forward(120_000)
        recipient.wait_for_function("Object.keys(JSON.parse(localStorage.getItem('astralis:character-sheets:seen-versions:v1')||'{}')).length>0")
        assert recipient.locator(".sheets-hero").is_visible(), "The page remains open during the download"
        badge = recipient.locator("[data-sheet-unread-badge]")
        assert badge.is_visible() and badge.inner_text() == "1"
        recipient.locator('[data-sheet-action="read"]').click()
        recipient.wait_for_selector('.sheet-read-page')
        assert recipient.locator("[data-sheet-unread-badge]").is_hidden()
        assert recipient.evaluate("document.documentElement.scrollWidth<=innerWidth+2")

        author.locator('[data-sheet-action="back"]').first.click()
        author.locator('[data-sheet-action="edit-published"]').click()
        author.locator('[data-sheet-field="title"]').fill("Guide complet de Bennett · édition 2")
        with author.expect_response(lambda response: "/api/character-sheets/publish" in response.url) as publication_update:
            author.locator('[data-sheet-action="publish"]').first.click()
        assert publication_update.value.json()["sheet"]["version"] == 2
        recipient.locator('[data-sheet-action="back"]').first.click()
        recipient.locator('[data-sheet-action="refresh"]').click()
        with recipient.expect_response(lambda response: "/api/character-sheets/item" in response.url and published_id in response.url) as update_response:
            recipient_context.clock.fast_forward(120_000)
        assert update_response.value.json()["sheet"]["version"] == 2
        recipient.wait_for_function("JSON.parse(localStorage.getItem('astralis:character-sheets:unread:v1')||'[]').length===1")
        assert badge.is_visible() and badge.inner_text() == "1", "A new published version raises the unread badge again"
        recipient.locator('[data-sheet-action="read"]').click()
        recipient.wait_for_selector('.sheet-reader-page')
        assert recipient.locator('.sheet-reader-hero h1').inner_text() == "Guide complet de Bennett · édition 2"
        assert "V2" in recipient.locator('.reader-version').inner_text()
        assert recipient.locator("[data-sheet-unread-badge]").is_hidden()
        assert not recipient_errors, recipient_errors
        read_only_mode["value"] = True
        viewer = browser.new_page(viewport={"width": 1440, "height": 1000})
        viewer.route("**/*", mock_api)
        viewer.add_init_script("localStorage.setItem('astralis:character-sheets:drafts:v1', JSON.stringify([{id:'private-local-draft',title:'Brouillon privé',characterName:'Nahida',pages:[{blocks:[]}]}]))")
        viewer.goto(base + "/sheets-harness")
        viewer.wait_for_selector(".sheet-setup-notice")
        assert "lecture seule" in viewer.locator(".sheet-setup-notice").inner_text().lower()
        assert viewer.locator("[data-sheet-library-view]").count() == 1
        assert viewer.locator("#sheets-drafts").count() == 0
        assert viewer.locator(".sheet-library-card").filter(has_text="Brouillon privé").count() == 0
        assert viewer.locator('[data-sheet-action="new"]').count() == 0
        viewer.locator('.sheet-library-card.is-published').click()
        viewer.wait_for_selector('.sheet-reader-page')
        assert viewer.locator('.sheet-editor-page').count() == 0
        print(f"PASS: {guide_count} editor tools; multiple pages, icons, tables, images, styled team, draft/publish, idle delivery, reader/mobile views and a read-only hosted library")
        browser.close()
    server.shutdown()
    server.server_close()


if __name__ == "__main__":
    main()
