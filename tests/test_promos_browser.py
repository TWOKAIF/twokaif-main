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

    assert page.locator("#promos .promo-card").count() == 3
    assert page.locator("#promo-card-center .promo-tag").inner_text() == "ГОТОВИТСЯ"
    assert page.locator(".pricing-card-name").all_text_contents() == ["Сайт", "Презентации", "PNG-приложение", "Центр анкет", "Интерактив", "Обложка или афиша"]
    for old in ["#promo-card-anketa", "#promo-card-agent", "#promo-card-cal", "#promo-card-mzh"]:
        assert page.locator(old).count() == 0
    for key in ["0", "3", "2", "8", "6", "4"]:
        card = page.locator('.pricing-card[data-price="' + key + '"]')
        head = card.locator(".pricing-card-head")
        if head.get_attribute("aria-expanded") != "true":
            head.click()
        page.wait_for_timeout(700)
        assert card.locator(".pricing-card-body").evaluate("e => e.getBoundingClientRect().height") > 30
        assert page.evaluate("document.documentElement.scrollWidth - innerWidth") <= 1
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
