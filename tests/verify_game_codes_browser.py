"""Smoke test the automatic public-code notifications in a clean local browser profile."""
import asyncio
import json
import os
from playwright.async_api import async_playwright

ORIGIN = os.environ.get("ASTRALIS_TEST_ORIGIN", "http://127.0.0.1:8766")
CHROMIUM = r"C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe"

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path=CHROMIUM, headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 1000}, service_workers="block")
        await context.add_init_script("""localStorage.setItem('astralis:active-game','gi');
          localStorage.setItem('astralis:preferences',JSON.stringify({theme:'midnight',reducedMotion:true,shellLaunch:false,backupReminder:false,autoRefresh:false}));
          localStorage.setItem('astralis:gi:synced-source-version:v1','7.2.53');""")
        page = await context.new_page()
        # Exercise the browser-side fallback used when an older local server lacks this route.
        await page.route("**/api/game-codes*", lambda route: route.fulfill(status=404, body="older server"))
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        await page.goto(ORIGIN, wait_until="domcontentloaded", timeout=60000)
        await page.locator(".shell-v2").wait_for(timeout=45000)
        await page.wait_for_function("JSON.parse(localStorage.getItem('astralis:game-codes:unread:v1')||'[]').length > 0", timeout=45000)
        badge = await page.locator("[data-inbox-open] .inbox-badge").inner_text()
        assert int(badge) > 0, badge
        await page.locator("[data-inbox-open]").click()
        dialog = page.locator(".inbox-center-dialog[open]")
        await dialog.wait_for(timeout=10000)
        count = await dialog.locator('[data-inbox-item][data-inbox-kind="code"]').count()
        assert count > 0, "Les codes récupérés ne sont pas affichés dans la Boîte de bord."
        await dialog.locator('[data-inbox-filter="code"]').click()
        filtered = await dialog.locator('[data-inbox-item][data-inbox-kind="code"]:visible').count()
        code = await dialog.locator('[data-code-copy]').first.get_attribute('data-code-copy')
        redeem = await dialog.locator('[data-code-redeem]').first.get_attribute('href')
        assert filtered == count and code, {"all": count, "filtered": filtered}
        assert redeem.startswith("https://genshin.hoyoverse.com/") or redeem.startswith("https://hsr.hoyoverse.com/"), redeem
        await dialog.locator('.inbox-close').click()
        await page.locator('[data-nav="events"]').first.click()
        await page.locator('.events-page').wait_for(timeout=60000)
        calendar_audit = await page.evaluate("""()=>{
          const external=[];
          for(const button of document.querySelectorAll('[data-calendar-items]')){
            for(const row of JSON.parse(button.dataset.calendarItems||'[]'))
              if(['web','community'].includes(row.category)||row.externalEvent)external.push(row.title);
          }
          const listed=[...document.querySelectorAll('.news-card[data-event-category="web"],.news-card[data-event-category="community"]')]
            .map(card=>card.querySelector('h3')?.textContent?.trim()).filter(Boolean);
          return {externalCalendarItems:external,externalListCount:listed.length};
        }""")
        assert not calendar_audit['externalCalendarItems'], calendar_audit
        assert not errors, errors
        print(json.dumps({"origin": ORIGIN, "badge": badge, "notifications": count, "firstCode": code,
                          "officialRedeemLink": redeem, "calendarAudit": calendar_audit,"pageErrors": errors}, ensure_ascii=False))
        await browser.close()

asyncio.run(main())
