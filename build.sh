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
for n in 08_Кейсы 09_Цены 11_Портфолио-обложки 12_Портфолио-афиши 13_Победные-презентации; do
  f="$TMP_BLOCKS/${n}.html"
  [ -f "$f" ] || continue
  perl -i -pe '
    s~<img\b((?:(?!loading=)(?!>).)*)/?>~<img$1 loading="lazy" decoding="async">~gi unless /loading=/;
  ' "$f"
done

# ─── Верхние блоки: eager + decoding=sync для НЕМЕДЛЕННОЙ загрузки ───
for n in 05_Обо-мне 06_Бегущая-полоска-клиентов 07_Услуги; do
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
    box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
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
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
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
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  cat "$BLOCKS/00_HEAD-код.html" | perl -pe 's~<title>[^<]+</title>~<title>Политика конфиденциальности — ТУКАЙФ</title>~; s~<link rel="canonical"[^>]+>~<link rel="canonical" href="https://twokaif.ru/privacy">~'
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

# ─── 404.HTML (00 + 01 + 03 + 16 + 14 + 15) ──────────────
{
  echo '<!DOCTYPE html>'
  echo '<html lang="ru">'
  echo '<head>'
  echo '<meta charset="UTF-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
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

# ─── robots.txt (staging — закрыто от индексации) ────────
cat > "$DIST/robots.txt" <<'EOF'
User-agent: *
Disallow: /
EOF

# ─── Копируем assets/ (js, шрифты и т.п.) в dist/ ───
if [ -d assets ]; then
  cp -R assets/* "$DIST/" 2>/dev/null || true
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
