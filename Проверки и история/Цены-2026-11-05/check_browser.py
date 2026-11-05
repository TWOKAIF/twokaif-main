from pathlib import Path
import json
import os
import re
from playwright.sync_api import sync_playwright, expect

TASK = Path(__file__).resolve().parent
BASE = os.environ.get("PRICE_CHECK_URL", "http://127.0.0.1:8783")
LABEL = os.environ.get("PRICE_CHECK_LABEL", "local")
OUT = TASK / "qa" / LABEL
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    results = []
    for width, height in [(1440, 900), (768, 1024), (428, 926)]:
        context = browser.new_context(viewport={"width": width, "height": height}, device_scale_factor=1)
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(BASE + "/", wait_until="domcontentloaded")
        page.evaluate("document.fonts.ready")
        expect(page.locator("#loader")).to_be_hidden(timeout=12000)
        cookie_button = page.locator("#cookieAcceptNecessary")
        if cookie_button.count():
            cookie_button.click()
            expect(page.locator(".cookie-banner")).to_be_hidden()
        cards = page.locator(".pricing-card")
        expect(cards).to_have_count(6)
        expect(page.locator('.pricing-card[data-price="0"] .pricing-card-price')).to_have_text("от 100 000 ₽")
        expect(page.locator('.pricing-card[data-price="3"] .pricing-card-price')).to_have_text("от 2 600 ₽/слайд")
        assert page.evaluate("({width:innerWidth,height:innerHeight})") == {"width": width, "height": height}
        records = []
        for price, name in [("0", "site"), ("3", "slides")]:
            card = page.locator(f'.pricing-card[data-price="{price}"]')
            head = card.locator(".pricing-card-head")
            head.scroll_into_view_if_needed()
            if "active" not in (card.get_attribute("class") or ""):
                head.click()
            expect(card).to_have_class(re.compile(r"\bactive\b"))
            page.wait_for_timeout(1100)
            expect(card.locator('.pricing-card-price')).to_have_text("от 100 000 ₽" if name == "site" else "от 2 600 ₽/слайд")
            card.evaluate("e => window.scrollTo({top:scrollY + e.getBoundingClientRect().top - 100,behavior:'instant'})")
            page.wait_for_timeout(120)
            body = card.locator(".pricing-card-body")
            record = body.evaluate("e => ({height:e.clientHeight,content:e.scrollHeight})")
            assert record["content"] <= record["height"] + 2, (width, name, record)
            content = card.inner_text()
            if name == "slides":
                for phrase in ["1–10", "3 200", "11–20", "2 900", "С 21-го", "2 600", "46 500"]:
                    assert phrase in content.replace("\u00a0", " "), (width, phrase)
                for phrase in ["Wedding Awards", "3 700", "+15%", "+30%", "Месяц бронирования"]:
                    assert phrase not in content, (width, phrase)
            else:
                assert "10 смысловых блоков" in content.replace("\u00a0", " ")
            card.screenshot(path=str(OUT / f"{name}-{width}.png"))
            records.append({"card": name, "body": record, "text": content})
        promo = page.locator(".promo-price").filter(has_text="100")
        expect(promo).to_have_count(1)
        promo.scroll_into_view_if_needed()
        page.wait_for_timeout(250)
        promo.locator("xpath=../..").screenshot(path=str(OUT / f"promo-{width}.png"))
        overflow = page.evaluate("document.documentElement.scrollWidth > innerWidth")
        assert not overflow, width
        assert not errors, errors
        results.append({"viewport": {"width": width, "height": height}, "browser": browser.version, "cards": records, "horizontal_overflow": overflow, "js_errors": errors})
        context.close()
    browser.close()
    (OUT / "results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"label": LABEL, "viewports": len(results), "card_screenshots": 6, "promo_screenshots": 3, "checks": "PASS"}))
