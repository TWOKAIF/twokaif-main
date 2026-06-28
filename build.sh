#!/bin/bash
# Сборка index.html + 404.html из 17 блоков
# Запуск: bash build.sh
set -e
cd "$(dirname "$0")"

DIST="dist"
BLOCKS_SRC="blocks"
TMP_BLOCKS=$(mktemp -d)
trap "rm -rf $TMP_BLOCKS" EXIT

rm -rf "$DIST"
mkdir -p "$DIST"

# ─── Локализация Tilda CDN → /images/<hash>.webp ───────
for f in "$BLOCKS_SRC"/*.html; do
  name=$(basename "$f")
  perl -pe '
    s~https://static\.tildacdn\.[a-z]+/(tild[A-Za-z0-9-]+)/[^"'"'"' )]+\.(jpg|jpeg|JPG|png|PNG)~/images/$1.webp~g;
    s~<link[^>]+preconnect[^>]+tildacdn[^>]*>\s*~~g;
    s~<link[^>]+dns-prefetch[^>]+tildacdn[^>]*>\s*~~g;
  ' "$f" > "$TMP_BLOCKS/$name"
done

# ─── lazy-loading: ТОЛЬКО для глубоких блоков (8+) ───
# Верхние блоки (05, 06, 07) — eager, грузятся сразу.
# Иначе при первом скролле картинки догружаются — выглядит как тормоз.
for n in 06_Бегущая-полоска-клиентов 07_Услуги 08_Кейсы 09_Цены 11_Портфолио-обложки 12_Портфолио-афиши 13_Победные-презентации; do
  f="$TMP_BLOCKS/${n}.html"
  [ -f "$f" ] || continue
  perl -i -pe '
    s~<img\b((?:(?!loading=)(?!>).)*)/?>~<img$1 loading="lazy" decoding="async">~gi unless /loading=/;
  ' "$f"
done

# ─── Верхние блоки: eager + decoding=sync для НЕМЕДЛЕННОЙ загрузки ───
for n in 05_Обо-мне; do
  f="$TMP_BLOCKS/${n}.html"
  [ -f "$f" ] || continue
  perl -i -pe '
    s~<img\b((?:(?!loading=)(?!>).)*)/?>~<img$1 loading="eager" decoding="async" fetchpriority="high">~gi unless /loading=/;
  ' "$f"
done

# ─── Минимальные фиксы производительности ───
# content-visibility и translateZ(0) на всех img оказались вреднее
# чем полезнее (мигания на iOS, лишние GPU-слои). Оставляем только
# те фиксы которые точно работают.
cat > "$TMP_BLOCKS/_perf-styles.html" <<'CSS'
<style>
/* На мобиле — никаких тяжёлых эффектов на обложках */
@media (max-width: 768px) {
  .twk-cover {
    box-shadow: none !important;
    transition: none !important;
  }
  .twk-cover img {
    filter: none !important;
  }
}
</style>
CSS
BLOCKS="$TMP_BLOCKS"

# ─── INDEX.HTML ────────────────────────────────────────────
{
  echo '<!DOCTYPE html>'
  echo '<html lang="ru">'
  echo '<head>'
  echo '<meta charset="UTF-8">'
  cat "$BLOCKS/00_HEAD-код.html"
  cat "$BLOCKS/_perf-styles.html"
  echo '</head>'
  echo '<body>'
  for f in 01_Глобальные-стили 02_Прелоадер 03_Навигация 04_Главный-экран 04b_Акция-баннер 05_Обо-мне 06_Бегущая-полоска-клиентов 07_Услуги 08_Кейсы 09_Цены 10_Частые-вопросы 11_Портфолио-обложки 12_Портфолио-афиши 13_Победные-презентации 14_Футер 15_Куки-баннер; do
    echo
    echo "<!-- ═══ $f ═══ -->"
    cat "$BLOCKS/${f}.html"
  done
  echo
  echo '</body>'
  echo '</html>'
} > "$DIST/index.html"

# ─── PRIVACY.HTML (00 + 01 + 03 + 17 + 14 + 15) ───────
{
  echo '<!DOCTYPE html>'
  echo '<html lang="ru">'
  echo '<head>'
  echo '<meta charset="UTF-8">'
  cat "$BLOCKS/00_HEAD-код.html" | perl -pe 's~<title>[^<]+</title>~<title>Политика конфиденциальности — ТУКАЙФ</title>~; s~<link rel="canonical"[^>]+>~<link rel="canonical" href="https://twokaif.ru/privacy">~'
  echo '<meta name="robots" content="noindex,follow">'
  echo '</head>'
  echo '<body>'
  for f in 01_Глобальные-стили 03_Навигация 17_Политика 14_Футер 15_Куки-баннер; do
    echo
    echo "<!-- ═══ $f ═══ -->"
    cat "$BLOCKS/${f}.html"
  done
  echo
  echo '</body>'
  echo '</html>'
} > "$DIST/privacy.html"

# ─── OFERTA.HTML (00 + 01 + 03 + 18 + 14 + 15) ───────
{
  echo '<!DOCTYPE html>'
  echo '<html lang="ru">'
  echo '<head>'
  echo '<meta charset="UTF-8">'
  cat "$BLOCKS/00_HEAD-код.html" | perl -pe 's~<title>[^<]+</title>~<title>Публичная оферта — ТУКАЙФ</title>~; s~<link rel="canonical"[^>]+>~<link rel="canonical" href="https://twokaif.ru/oferta">~'
  echo '<meta name="robots" content="noindex,follow">'
  echo '</head>'
  echo '<body>'
  for f in 01_Глобальные-стили 03_Навигация 18_Оферта 14_Футер 15_Куки-баннер; do
    echo
    echo "<!-- ═══ $f ═══ -->"
    cat "$BLOCKS/${f}.html"
  done
  echo
  echo '</body>'
  echo '</html>'
} > "$DIST/oferta.html"

# ─── ПОСАДОЧНЫЕ (SEO landing) — нав-якоря ведут на главную ───
# $1=slug $2=block $3=title $4=description $5=schema-json-file $6=gallery-block(опц.)
build_landing() {
  local slug="$1" block="$2" title="$3" desc="$4" schema="$5" gallery="$6"
  {
    echo '<!DOCTYPE html>'
    echo '<html lang="ru">'
    echo '<head>'
    echo '<meta charset="UTF-8">'
    cat "$BLOCKS/00_HEAD-код.html" \
      | perl -pe "s~<title>[^<]+</title>~<title>$title</title>~" \
      | perl -pe "s~<meta name=\"description\"[^>]*>~<meta name=\"description\" content=\"$desc\">~" \
      | perl -pe "s~<link rel=\"canonical\"[^>]+>~<link rel=\"canonical\" href=\"https://twokaif.ru/$slug\">~" \
      | perl -pe "s~<meta property=\"og:url\"[^>]*>~<meta property=\"og:url\" content=\"https://twokaif.ru/$slug\">~"
    [ -f "$schema" ] && { echo '<script type="application/ld+json">'; cat "$schema"; echo '</script>'; }
    # сброс дефолтного синего у ссылок (стилизованные ссылки задают свой цвет сами)
    echo '<style>a{color:inherit}</style>'
    echo '</head>'
    echo '<body>'
    echo "<!-- ═══ 01_Глобальные-стили ═══ -->"
    cat "$BLOCKS/01_Глобальные-стили.html"
    echo
    # нав: якоря #xxx → /#xxx, лого → / (с посадочной ведём в секцию главной)
    echo "<!-- ═══ 03_Навигация ═══ -->"
    cat "$BLOCKS/03_Навигация.html" | perl -pe 's~href="#"~href="/"~g; s~href="#~href="/#~g'
    echo
    echo "<!-- ═══ $block ═══ -->"
    cat "$BLOCKS/${block}.html"
    echo
    if [ -n "$gallery" ] && [ -f "$BLOCKS/${gallery}.html" ]; then
      echo "<!-- ═══ $gallery ═══ -->"
      cat "$BLOCKS/${gallery}.html"
      echo
    fi
    echo "<!-- ═══ 14_Футер ═══ -->"
    cat "$BLOCKS/14_Футер.html" | perl -pe 's~href="#"~href="/"~g; s~href="#~href="/#~g'
    echo
    echo "<!-- ═══ 15_Куки-баннер ═══ -->"
    cat "$BLOCKS/15_Куки-баннер.html"
    echo
    echo '</body>'
    echo '</html>'
  } > "$DIST/$slug.html"
}

# Schema Service+Breadcrumb для /oblozhki
cat > "$TMP_BLOCKS/_schema-oblozhki.json" <<'JSON'
{"@context":"https://schema.org","@graph":[
{"@type":"Service","name":"Обложки на мероприятия","serviceType":"Графический дизайн","provider":{"@type":"ProfessionalService","name":"ТУКАЙФ","url":"https://twokaif.ru"},"areaServed":"RU","description":"Обложки для заявок, шоурилов и промо мероприятий — для ведущих, артистов и агентств.","url":"https://twokaif.ru/oblozhki"},
{"@type":"BreadcrumbList","itemListElement":[
{"@type":"ListItem","position":1,"name":"Главная","item":"https://twokaif.ru/"},
{"@type":"ListItem","position":2,"name":"Обложки","item":"https://twokaif.ru/oblozhki"}]}
]}
JSON
build_landing "oblozhki" "lp-oblozhki" \
  "Обложки на мероприятия для ведущих и артистов — ТУКАЙФ" \
  "Обложки на мероприятия: для заявок, шоурилов и промо. Цепляющий дизайн под твой ивент без шаблонов. Примеры работ внутри." \
  "$TMP_BLOCKS/_schema-oblozhki.json" "11_Портфолио-обложки"

# ─── /afishi ───
cat > "$TMP_BLOCKS/_schema-afishi.json" <<'JSON'
{"@context":"https://schema.org","@graph":[
{"@type":"Service","name":"Афиши для мероприятий","serviceType":"Графический дизайн","provider":{"@type":"ProfessionalService","name":"ТУКАЙФ","url":"https://twokaif.ru"},"areaServed":"RU","description":"Афиши для концертов, праздников и ивентов — яркий дизайн под любую площадку.","url":"https://twokaif.ru/afishi"},
{"@type":"BreadcrumbList","itemListElement":[
{"@type":"ListItem","position":1,"name":"Главная","item":"https://twokaif.ru/"},
{"@type":"ListItem","position":2,"name":"Афиши","item":"https://twokaif.ru/afishi"}]}
]}
JSON
build_landing "afishi" "lp-afishi" \
  "Афиши для мероприятий, концертов и праздников — ТУКАЙФ" \
  "Афиши для концертов, праздников и ивентов: яркий дизайн под любую площадку, без шаблонов. Примеры работ внутри." \
  "$TMP_BLOCKS/_schema-afishi.json" "12_Портфолио-афиши"

# ─── /prezentacii ───
cat > "$TMP_BLOCKS/_schema-prezentacii.json" <<'JSON'
{"@context":"https://schema.org","@graph":[
{"@type":"Service","name":"Презентации для выступлений","serviceType":"Дизайн презентаций","provider":{"@type":"ProfessionalService","name":"ТУКАЙФ","url":"https://twokaif.ru"},"areaServed":"RU","description":"Презентации для премий, выступлений и мероприятий — дизайн, который усиливает выступление.","url":"https://twokaif.ru/prezentacii"},
{"@type":"BreadcrumbList","itemListElement":[
{"@type":"ListItem","position":1,"name":"Главная","item":"https://twokaif.ru/"},
{"@type":"ListItem","position":2,"name":"Презентации","item":"https://twokaif.ru/prezentacii"}]}
]}
JSON
build_landing "prezentacii" "lp-prezentacii" \
  "Презентации для премий и выступлений — ТУКАЙФ" \
  "Презентации для премий, выступлений и мероприятий: дизайн, который усиливает выступление. Примеры работ внутри." \
  "$TMP_BLOCKS/_schema-prezentacii.json" "13_Победные-презентации"

# ─── /sajty-vedushim ───
cat > "$TMP_BLOCKS/_schema-sajty.json" <<'JSON'
{"@context":"https://schema.org","@graph":[
{"@type":"Service","name":"Сайты ведущим и артистам","serviceType":"Веб-дизайн","provider":{"@type":"ProfessionalService","name":"ТУКАЙФ","url":"https://twokaif.ru"},"areaServed":"RU","description":"Одностраничные и многостраничные сайты для ведущих, артистов и агентств — свой движок, адаптив, анимации.","url":"https://twokaif.ru/sajty-vedushim"},
{"@type":"BreadcrumbList","itemListElement":[
{"@type":"ListItem","position":1,"name":"Главная","item":"https://twokaif.ru/"},
{"@type":"ListItem","position":2,"name":"Сайты ведущим","item":"https://twokaif.ru/sajty-vedushim"}]}
]}
JSON
build_landing "sajty-vedushim" "lp-sajty" \
  "Сайты ведущим, артистам и агентствам — ТУКАЙФ" \
  "Сайты для ведущих, артистов и ивент-агентств: свой движок, адаптив, анимации. Без конструкторов и шаблонов." \
  "$TMP_BLOCKS/_schema-sajty.json" ""

# ─── 404.HTML (00 + 01 + 03 + 16 + 14 + 15) ──────────────
{
  echo '<!DOCTYPE html>'
  echo '<html lang="ru">'
  echo '<head>'
  echo '<meta charset="UTF-8">'
  cat "$BLOCKS/00_HEAD-код.html"
  echo '</head>'
  echo '<body>'
  for f in 01_Глобальные-стили 03_Навигация 16_404 14_Футер 15_Куки-баннер; do
    echo
    echo "<!-- ═══ $f ═══ -->"
    cat "$BLOCKS/${f}.html"
  done
  echo
  echo '</body>'
  echo '</html>'
} > "$DIST/404.html"

# ─── robots.txt (прод — открыто, sitemap + crawl-delay) ────────
cat > "$DIST/robots.txt" <<'EOF'
User-agent: *
Allow: /

User-agent: Yandex
Allow: /
Crawl-delay: 1

Sitemap: https://twokaif.ru/sitemap.xml
EOF

# ─── Копируем assets/ (js, шрифты и т.п.) в dist/ ───
if [ -d assets ]; then
  cp -R assets/* "$DIST/" 2>/dev/null || true
fi

# ─── sitemap: свежий lastmod при каждой сборке ───
if [ -f "$DIST/sitemap.xml" ]; then
  TODAY=$(date +%F)
  sed -i '' "s|<lastmod>[^<]*</lastmod>|<lastmod>$TODAY</lastmod>|g" "$DIST/sitemap.xml" 2>/dev/null \
    || sed -i "s|<lastmod>[^<]*</lastmod>|<lastmod>$TODAY</lastmod>|g" "$DIST/sitemap.xml"
fi

# ─── Общий promos.json (источник правды по акциям) ───
[ -f promos.json ] && cp promos.json "$DIST/" && echo "✓ promos.json скопирован в dist/"
[ -f favicon.svg ] && cp favicon.svg "$DIST/" && echo "✓ favicon.svg скопирован в dist/"

# ─── Копируем images-webp/ → dist/images/ ───
# Это критично, иначе rsync --delete на сервере снесёт всю папку картинок
if [ -d images-webp ]; then
  mkdir -p "$DIST/images"
  cp -R images-webp/* "$DIST/images/" 2>/dev/null || true
fi

echo "✓ dist/index.html:   $(wc -l < $DIST/index.html) строк, $(du -h $DIST/index.html | cut -f1)"
echo "✓ dist/privacy.html: $(wc -l < $DIST/privacy.html) строк"
echo "✓ dist/404.html:     $(wc -l < $DIST/404.html) строк"
echo "✓ dist/robots.txt: noindex"
[ -d "$DIST/js" ] && echo "✓ dist/js:         $(ls $DIST/js | wc -l | tr -d ' ') файлов"
