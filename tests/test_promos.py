#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BLOCK = ROOT / "blocks" / "04b_Акция-баннер.html"
DIST = ROOT / "dist" / "index.html"
PROMOS = ROOT / "promos.json"


def card(html: str, card_id: str) -> str:
    match = re.search(
        rf'<div class="promo-card[^"]*" id="{re.escape(card_id)}".*?(?=\n    <!-- ╭─ Карточка|\n  </div>\n </div>\n</section>)',
        html,
        re.DOTALL,
    )
    if not match:
        raise AssertionError(f"Не найдена карточка {card_id}")
    return match.group(0)


class HonestPromosTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.block = BLOCK.read_text(encoding="utf-8")
        cls.dist = DIST.read_text(encoding="utf-8")
        cls.promos = json.loads(PROMOS.read_text(encoding="utf-8"))

    def test_no_fake_promotion_is_configured(self) -> None:
        self.assertEqual(self.promos["regular_price"], 7500)
        self.assertEqual(self.promos["subscription_price"], 1000)
        self.assertEqual(self.promos["promos"], [])

    def test_wedding_is_a_permanent_product(self) -> None:
        for html in (self.block, self.dist):
            wedding = card(html, "promo-card-anketa")
            self.assertIn('id="promo-tag">ПРОДУКТ</span>', wedding)
            self.assertIn('id="promo-price">7 500 ₽</span>', wedding)
            self.assertIn("первый год включён", wedding.lower())
            self.assertIn("1&nbsp;000&nbsp;₽/год", wedding)
            self.assertIn('href="https://wedding.twokaif.ru"', wedding)
            self.assertNotIn("бесплат", wedding.lower())
            self.assertNotIn("data-cd-", wedding)
            self.assertNotIn("promo-timer", wedding)

    def test_calendar_keeps_price_and_loses_fake_timer(self) -> None:
        for html in (self.block, self.dist):
            calendar = card(html, "promo-card-cal")
            self.assertIn("от&nbsp;290&nbsp;₽", calendar)
            self.assertIn("1&nbsp;990&nbsp;₽", calendar)
            self.assertIn('href="https://telegram.me/twokaif_calendar_bot"', calendar)
            self.assertNotIn("data-cd-", calendar)
            self.assertNotIn("promo-timer", calendar)

    def test_evergreen_countdown_code_is_gone(self) -> None:
        for html in (self.block, self.dist):
            self.assertNotIn("evergreen-2026", html)
            self.assertNotIn("monthly:true", html)
            self.assertNotIn("data-cd-monthly", html)
            self.assertNotIn("data-cd-timer", html)
            self.assertNotIn("endOfMonthMSK", html)
            self.assertNotIn("setInterval(tick", html)
            self.assertIn('aria-label="Текущие предложения"', html)

    def test_other_sales_states_and_destinations_are_unchanged(self) -> None:
        expected = {
            "promo-card-sites": "https://telegram.me/twokaif_ruslan",
            "promo-card-png": "https://png-info.twokaif.ru",
            "promo-card-mzh": "https://telegram.me/twokaif_ruslan",
        }
        for html in (self.block, self.dist):
            for card_id, url in expected.items():
                self.assertIn(f'href="{url}"', card(html, card_id))
            agent = card(html, "promo-card-agent")
            self.assertIn("ПАУЗА", agent)
            self.assertNotIn("promo-cta", agent)
            self.assertIn("РУЧНОЙ ЗАКАЗ", card(html, "promo-card-mzh"))
            self.assertNotIn("tochkaplace.com", html)


if __name__ == "__main__":
    unittest.main(verbosity=2)
