#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright


CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")


def check(page, url: str, width: int, height: int) -> None:
    errors: list[str] = []
    bad_responses: list[str] = []
    page.on(
        "console",
        lambda msg: errors.append(msg.text)
        if msg.type == "error" and not msg.text.startswith("Failed to load resource")
        else None,
    )
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    page.on(
        "response",
        lambda response: bad_responses.append(f"{response.status} {response.url}")
        if response.status >= 400
        else None,
    )
    page.goto(url, wait_until="networkidle", timeout=60_000)

    section = page.locator("#promos")
    section.scroll_into_view_if_needed()
    section.wait_for(state="visible")
    page.wait_for_timeout(500)

    assert page.locator("#promos .promo-card").count() == 6
    wedding = page.locator("#promo-card-anketa")
    calendar = page.locator("#promo-card-cal")
    assert wedding.locator("#promo-tag").inner_text() == "ПРОДУКТ"
    assert wedding.locator("#promo-price").inner_text() == "7 500 ₽"
    assert "первый год включён" in wedding.inner_text().lower()
    assert "бесплат" not in wedding.inner_text().lower()
    assert wedding.locator("[data-cd-timer]").count() == 0
    assert calendar.locator("[data-cd-timer]").count() == 0
    assert wedding.get_attribute("data-cd-monthly") is None
    assert calendar.get_attribute("data-cd-monthly") is None
    assert wedding.locator(".promo-cta").get_attribute("href") == "https://wedding.twokaif.ru"
    assert calendar.locator(".promo-cta").get_attribute("href") == "https://telegram.me/twokaif_calendar_bot"
    assert page.locator("#promo-card-agent .promo-tag").inner_text() == "ПАУЗА"
    assert page.locator("#promo-card-agent .promo-cta").count() == 0
    assert page.locator("#promo-card-mzh .promo-tag").inner_text() == "РУЧНОЙ ЗАКАЗ"
    overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    assert overflow <= 1, f"Горизонтальное переполнение: {overflow}px"
    assert errors == [], f"Ошибки браузера: {errors}"
    host = urlparse(url).hostname
    unexpected_bad = [
        response
        for response in bad_responses
        if not (
            host in {"127.0.0.1", "localhost"}
            and response.startswith("404 ")
            and "/images/" in response
        )
    ]
    assert unexpected_bad == [], f"Ответы 4xx/5xx: {unexpected_bad}"
    print(f"PASS {width}x{height}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    args = parser.parse_args()

    with sync_playwright() as playwright:
        launch = {"headless": True}
        if CHROME.exists():
            launch["executable_path"] = str(CHROME)
        browser = playwright.chromium.launch(**launch)
        try:
            for width, height in ((428, 926), (1440, 900)):
                context = browser.new_context(viewport={"width": width, "height": height})
                try:
                    check(context.new_page(), args.url, width, height)
                finally:
                    context.close()
        finally:
            browser.close()


if __name__ == "__main__":
    main()
