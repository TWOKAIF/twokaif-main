# twokaif-main — статус

Главный сайт ТУКАЙФ. Перевозим с Tilda на Aeza.

## 🆕 2026-05-31 — новый прайс + доработка блока акций (commit 2ef03b0)
Блок «Активные акции» (`blocks/04b_Акция-баннер.html`): вечная акция (evergreen-таймер до конца месяца, авто-сброс 1-го). Анкета 7 500 ₽ +1 год бесплатно/потом 1 000 ₽/год; PNG 4 900 ₽ +1 год/потом 500 ₽/год. Таймер с секундами + плюрализация. Карточки — `<div>` (не ссылки), кликабельна только кнопка. Зелёный индикатор «СЕЙЧАС» (#22a35a). «PNG для сторис» (1 строка). Теги по 3. Детали: `_доработка-акций-20260531.md`. promos.json = evergreen (мастер `_shared/promos.json`; `sync-promos.sh` устарел — разносить вручную).

## Где живёт

| Где | URL | Назначение |
|---|---|---|
| **Прод** | `twokaif.ru` (Aeza 213.165.41.1) | **боевой, переехал 2026-05-08** |
| Staging | `new.twokaif.ru` (Aeza) | для тестов перед прод-деплоем |
| Tilda (страховка) | оставлена живой ~7 дней | сносим после полной пропагации DNS |

## Что готово

### OG-карточка чёрная (2026-05-29)
- `dist/images/og-image.jpg` 1200×630 переделан с белой на **чёрную** (фон #0c0c0e, белый заголовок)
- Лого-локап под пропорции навбара: снежинка 25px **меньше** слова ТУКАЙФ (31px), гэп 9px — было наоборот (снежинка крупнее, Руслан «не как на сайте»)
- Большая снежинка справа = водяной знак-фон (opacity 5%), уходит за край осознанно
- Низ не обрезан (была обрезка «РУСЛАН ТУКАЕВ»)
- Исходник для регенерации: `_og-source/ogcard.html` (рендер через Chrome headless 1200×630 → sips jpeg Q88)
- Старая белая сохранена `images-webp/og-image.jpg`. Деплой: scp точечно, md5 совпал. Коммит `d87d81f`
- Telegram кеширует превью — обновить через [@WebpageBot](https://t.me/WebpageBot)

### Аудит качества + доступность + перф (2026-05-29)
- **focus-visible** — глобальное кольцо фокуса с клавиатуры (Tab), мышь не рисует (блок 01)
- **prefers-reduced-motion guards** в 5 блоках: 05 счётчики (мгновенно финал), 06 лента клиентов (стоп), 08 слайдер (мгновенный переход), 12 афиши (стоп авто-скролла, drag живёт), 13 презентации (CSS animation:none + JS не стартует)
- **FAQ доступность** (блок 10): role=button + tabindex + aria-expanded/controls + aria-hidden + клавиатура Enter/Space
- **Слайдер кейсов** (блок 08): aria-label на ←/→ + type=button; точки role=button+tabindex+aria-label+клавиатура
- **lazy-load кейсов** (блок 08): loading=lazy + decoding=async на 32 картинках — секция глубоко ниже фолда. Протестировано: transform-карусель грузит все 32 при входе в зону видимости, 0 белых карточек
- Заголовки head-reveal (выезд секций), счётчик цен, фикс дёрга обложек при скролле, дыхание лого в футере — из ранних правок сессии
- Все правки в `blocks/*` + зеркало `dist/index.html`. SEO признан образцовым (Schema.org полный, OG, sitemap, robots) — не трогали

### Системная настройка направления Анкеты (2026-05-10)
- **Единый источник промо**: `_shared/promos.json` мастер + `_shared/sync-promos.sh` → раскладывает в wedding/main/Мир. Меняешь акцию в одном месте.
- **Динамический ribbon на wedding**: убран хардкод «Майская акция», теперь рендерится из `CLIENT.promos`. До рендера ribbon скрыт (no FOIT).
- **UTM-захват на wedding**: `?utm_source=...` сохраняется в localStorage, при клике на t.me-ссылку пробрасывается в текст сообщения. Виден источник лида.
- **Favicon-эталон**:
  - twokaif.ru — заменён кривой data-URI на `/favicon.svg`
  - brand.twokaif.ru — добавлен файл + спецификация в секции «Звёздочка» (viewBox, цвет, размеры, запреты)
  - Все 5 проектов которые были на эталоне — без изменений
- **Раздел АНКЕТЫ в Услугах** twokaif.ru — 6-я строка после ИНТЕРАКТИВЫ, ведёт на wedding.twokaif.ru
- **Виральная кнопка** в `_template/index.html` для новых анкет — на success-экране «Знакомому ведущему — расскажи про TWOKAIF» с UTM `utm_source=anketa&utm_campaign=referral`. Живые анкеты не трогаем.
- **Yandex.Metrika** — pending, ждём ID счётчика от Руслана.

### Блок «Активные акции» (2026-05-09)
- Новый блок `04b_Акция-баннер.html` после Hero, до «Обо мне»
- Серая подложка #f5f5f7, шапка «● СЕЙЧАС / Активные акции / Закрываются по таймеру»
- Две карточки симметричной компоновки: Свадебная анкета + Приложение ТУКАЙФ—PNG
- Живые таймеры (дни/часы/минуты), tabular-nums, обновление каждые 30 сек
- Календарь PROMOS зашит в JS, авто-смена Майская → Летняя → ЧП → НГ
- Чипы-фишки: домен, лендинг, спеццена, без подписок Tilda / Приложение на телефоне, Свои шрифты, Свои цвета, Спеццена
- На hover карточка чернеет, цена и таймер белые, чипы прозрачные с тонкой рамкой
- Стиль 1-в-1 как pricing-cards: прямые углы, никаких скруглений
- Календарь синхронизирован с wedding.twokaif.ru
- Деплой: коммит `8be846e`, прод: https://twokaif.ru

### nginx — CSP frame-ancestors (2026-05-09)
- Заменён `X-Frame-Options: SAMEORIGIN` на `Content-Security-Policy: frame-ancestors 'self' https://check.twokaif.ru`
- Применено в `/etc/nginx/sites-enabled/twokaif-new` и `twokaif-prod`
- Теперь check.twokaif.ru может встраивать сайт в iframe для проверки

### Перенос
- Все 17 блоков из Tilda извлечены в `blocks/`
- 200 картинок локализованы: `tildacdn.com` → `/var/www/twokaif-new/images/<hash>.webp`
- 128 МБ JPG → 51 МБ WebP (Q75, max 1600px)
- Скрипт `build.sh` собирает `dist/` из блоков с авто-заменой URL

### Производительность (полный аудит 2026-05-08)
- Sticky-параллакс на обложках СНЯТ — был корнем всех тормозов
- Обложки = статичный CSS Grid (4×8 ПК, 3×N iPad, 2×N мобила)
- Lenis убран (конфликтовал с ScrollTrigger pin)
- Lazy/eager картинок: верхние блоки eager+fetchpriority=high, портфолио lazy
- nginx: http2, cache 30d immutable, gzip off для медиа
- 60 FPS при скролле, CLS = 0.0000, FCP 884ms

### SEO + a11y + security
- canonical link → `https://twokaif.ru/`
- og:image, twitter:image, schema.org image — абсолютные URL на свой домен
- 32 кнопки обложек получили aria-label
- Schema.org ProfessionalService с founder, sameAs
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Yandex Metrika 108388166 + Google Search Console verification

### Юридика 152-ФЗ ✓
- `/privacy` страница (блок 17) с реквизитами ИП, 10 разделами, тоном «на ты»
- Кук-баннер (блок 15): 3 кнопки (Принять все / Только необходимые / Настройки) + раскрывающиеся категории с toggle
- Метрика грузится ТОЛЬКО по согласию на аналитику (убрана из HEAD)
- Футер: ссылки на /privacy + «Настройки cookies» (открывает баннер заново)
- Решение хранится 12 мес, потом спрашиваем повторно
- nginx: `try_files $uri $uri.html` — /privacy без расширения работает
- build.sh: копирует images-webp/ → dist/images/ (фикс rsync --delete снёс картинки)

### Self-host всего ✓
- Inter Tight локально: 14 woff2 (cyrillic + latin + greek + vietnam + ext, 348 КБ), вариативный 300-700
- preload основного cyrillic 400 woff2 → нет FOUT
- GSAP 3.12.5 + ScrollTrigger локально в `/js/`
- Lenis уже был локально
- Удалены preconnect к fonts.googleapis.com, fonts.gstatic.com, cdnjs.cloudflare.com
- Сайт работает даже если все CDN мира лягут

### SEO-инфра ✓
- `/sitemap.xml` — 2 URL (/, /privacy) для поисковиков
- Расширенный JSON-LD: `@graph` с ProfessionalService + WebSite, founder с jobTitle, OfferCatalog (6 услуг), priceRange, areaServed RU

### Переезд DNS ✓ (2026-05-08)
- Reg.ru: A @, A *, A www → 213.165.41.1
- SSL Let's Encrypt выпущен на twokaif.ru + www.twokaif.ru
- nginx prod-конфиг: HTTPS, security headers, robots открыт + sitemap
- 301-редиректы со старых Tilda путей: /text → png.twokaif.ru, /generator_dogovor → t.me/twokaif_ruslan
- noindex снят на проде
- Tilda оставлена живой как страховка ~7 дней (пока DNS пропагируется у мобильных операторов)

## Что осталось

1. **Через ~7 дней** — снести проект twokaif.ru на Tilda (когда у всех клиентов DNS обновится)
2. **Бриф** — Руслан решит, нужна ли страница /brif на новом сервере, или просто грохнуть с Tilda
3. **Генератор договора** — переделать на свой движок (jsPDF + Telegram), архив Tilda-версии в `~/Documents/ТУКАЙФ/_АРХИВ_TILDA/dogovor/index.html`

## Деплой

⚠️ **Реальный путь на проде — `/var/www/twokaif/` (БЕЗ `-new`).** Раньше тут был `-new` для staging-режима, после переезда DNS 08.05 nginx был переключён на основную папку `/var/www/twokaif/`, но скрипт деплоя не обновили. Деплоить надо в `/var/www/twokaif/`.

```bash
cd ~/Documents/ТУКАЙФ/twokaif-main
bash build.sh
rsync -avz --delete -e "ssh -i ~/.ssh/twokaif_hetzner" \
  dist/ root@213.165.41.1:/var/www/twokaif/
ssh -i ~/.ssh/twokaif_hetzner root@213.165.41.1 \
  "find /var/www/twokaif -type f -exec chmod 644 {} \;"
```

## Шеф ведёт всю инфру

См. `~/.claude/chef/MAP.md`, `~/.claude/chef/PENDING.md`, `~/.claude/chef/LOG.md`.
В новой сессии: «шеф ты тут?» → продолжаем с юридики.
