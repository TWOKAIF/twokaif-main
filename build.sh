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
BLOCKS="$TMP_BLOCKS"

# ─── INDEX.HTML ────────────────────────────────────────────
{
  echo '<!DOCTYPE html>'
  echo '<html lang="ru">'
  echo '<head>'
  echo '<meta charset="UTF-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  cat "$BLOCKS/00_HEAD-код.html"
  echo '</head>'
  echo '<body>'
  for f in 01_Глобальные-стили 02_Прелоадер 03_Навигация 04_Главный-экран 05_Обо-мне 06_Бегущая-полоска-клиентов 07_Услуги 08_Кейсы 09_Цены 10_Частые-вопросы 11_Портфолио-обложки 12_Портфолио-афиши 13_Победные-презентации 14_Футер 15_Куки-баннер; do
    echo
    echo "<!-- ═══ $f ═══ -->"
    cat "$BLOCKS/${f}.html"
  done
  echo
  echo '</body>'
  echo '</html>'
} > "$DIST/index.html"

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

echo "✓ dist/index.html: $(wc -l < $DIST/index.html) строк, $(du -h $DIST/index.html | cut -f1)"
echo "✓ dist/404.html:   $(wc -l < $DIST/404.html) строк"
echo "✓ dist/robots.txt: noindex"
