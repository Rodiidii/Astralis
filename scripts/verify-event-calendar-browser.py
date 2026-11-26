"""Exercise the live Genshin event feed and its calendar grouping in a disposable browser profile."""
import asyncio
import json
from playwright.async_api import async_playwright

ORIGIN = "http://127.0.0.1:8895"


async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            executable_path=r"C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe",
            headless=True,
        )
        context = await browser.new_context(viewport={"width": 1440, "height": 1000}, service_workers="block")
        await context.add_init_script("""localStorage.setItem('astralis:active-game','gi');
          localStorage.setItem('astralis:preferences',JSON.stringify({theme:'midnight',reducedMotion:true,shellLaunch:false,backupReminder:false,autoRefresh:false}));
          localStorage.setItem('astralis:gi:synced-source-version:v1','7.2.53');""")
        page = await context.new_page()
        page.set_default_timeout(30000)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        await page.goto(ORIGIN, wait_until="domcontentloaded", timeout=60000)
        await page.locator(".shell-v2").wait_for(timeout=45000)
        await page.locator('[data-nav="events"]').first.click()
        await page.locator(".events-page").wait_for(timeout=60000)
        await page.wait_for_function("document.querySelectorAll('.news-card.is-calendar-event').length >= 20", timeout=60000)
        details = await page.evaluate("""()=>({
          cards:[...document.querySelectorAll('.news-card.is-calendar-event')].map(card=>({
            title:card.querySelector('h3')?.textContent?.trim(),
            kind:card.dataset.eventCategory,
            label:card.querySelector('.news-category-pill')?.textContent?.trim(),
            reward:card.querySelector('.news-primo-fact')?.textContent?.trim()||''
          })),
          groups:[...document.querySelectorAll('.news-tag-group')].map(group=>({title:group.querySelector('summary span')?.textContent?.trim(),count:Number(group.querySelector('summary b')?.textContent||0)})),
          errors:[]
        })""")
        assert details["cards"], details
        assert any(row["kind"] == "banner" for row in details["cards"]), details["cards"]
        assert any(row["kind"] == "endgame" for row in details["cards"]), details["cards"]
        assert any(row["kind"] == "event" and "primos" in row["label"].lower() for row in details["cards"]), details["cards"]
        assert any(row["reward"] and ("420" in row["reward"] or "920" in row["reward"]) for row in details["cards"]), details["cards"]
        assert not errors, errors
        payload = await page.request.get(f"{ORIGIN}/api/gi/events")
        feed = await payload.json()
        assert len(feed.get("events", [])) >= 20, len(feed.get("events", []))
        print(json.dumps({"feedSource": feed.get("source"), "feedEvents": len(feed["events"]),
                          "visibleCalendarCards": len(details["cards"]), "groups": details["groups"],
                          "sample": [row for row in details["cards"] if row["reward"]][:5],
                          "pageErrors": errors}, ensure_ascii=False, indent=2))
        await browser.close()


asyncio.run(main())
