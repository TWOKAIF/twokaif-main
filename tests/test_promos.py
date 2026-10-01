#!/usr/bin/env python3
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class CurrentServicesTest(unittest.TestCase):
    def test_current_services_and_removed_products(self):
        html = (ROOT / "dist/index.html").read_text()
        names = re.findall(r'<span class="pricing-card-name">(.*?)</span>', html)
        self.assertEqual(names, ["Сайт", "Презентации", "PNG-приложение", "Центр анкет", "Интерактив", "Обложка или афиша"])
        for old in ["service-gpt-agent", "promo-card-agent", "promo-card-anketa", "promo-card-cal", "twokaif_calendar_bot", "wedding.twokaif.ru", "Свадебная анкета"]:
            self.assertNotIn(old, html)
        self.assertIn('id="promo-card-center"', html)
        self.assertIn('ГОТОВИТСЯ', html)
        self.assertNotIn('data-cd-timer', html)
        self.assertNotIn('data-cd-monthly', html)
        self.assertNotIn("fetch('/promos.json'", html)

    def test_schema_matches_visible_prices(self):
        html = (ROOT / "dist/index.html").read_text()
        schema = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)[1])
        services = {item.get("@id", "").split("#")[-1]: item for item in schema["@graph"] if item["@type"] == "Service"}
        expected = {"service-websites": "79000", "service-png": "7000", "service-presentations": "3700", "service-covers-posters": "4000"}
        for name, price in expected.items():
            self.assertEqual(services[name]["offers"]["price"], price)
        self.assertNotIn("offers", services["service-center"])
        self.assertNotIn("offers", services["service-interactives"])

if __name__ == "__main__":
    unittest.main(verbosity=2)
