# twokaif-main — статус

Главный сайт ТУКАЙФ. Перевозим с Tilda на Aeza.

## Где живёт

| Где | URL | Назначение |
|---|---|---|
| Прод (старый) | `twokaif.ru` (Tilda) | пока работает |
| Staging (новый) | `new.twokaif.ru` (Aeza) | боевой staging — почти прод |

## Что готово

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

## Что осталось перед переездом twokaif.ru

1. **Self-host шрифтов** — Inter Tight локально вместо Google Fonts
2. **Self-host GSAP + ScrollTrigger** — локально вместо cdnjs
3. **sitemap.xml + JSON-LD расширенный** — для индексации
4. **На проде убрать noindex** — снять `X-Robots-Tag: noindex` в nginx
5. **Перенести /generator_dogovor** с Tilda на `/dogovor` в Aeza
6. **DNS-переключение** twokaif.ru с Tilda на 213.165.41.1 + 301-редиректы для /text → png.twokaif.ru

## Деплой

```bash
cd ~/Documents/ТУКАЙФ/twokaif-main
bash build.sh
rsync -avz --delete -e "ssh -i ~/.ssh/twokaif_hetzner" \
  dist/ root@213.165.41.1:/var/www/twokaif-new/
ssh -i ~/.ssh/twokaif_hetzner root@213.165.41.1 \
  "find /var/www/twokaif-new -type f -exec chmod 644 {} \;"
```

## Шеф ведёт всю инфру

См. `~/.claude/chef/MAP.md`, `~/.claude/chef/PENDING.md`, `~/.claude/chef/LOG.md`.
В новой сессии: «шеф ты тут?» → продолжаем с юридики.
