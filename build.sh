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

# ─── lazy-loading + async для всех <img> в блоках ниже hero ───
# (блок 04_Главный-экран — hero с большим логотипом, его не трогаем)
for n in 05_Обо-мне 06_Бегущая-полоска-клиентов 07_Услуги 08_Кейсы 09_Цены 11_Портфолио-обложки 12_Портфолио-афиши 13_Победные-презентации; do
  f="$TMP_BLOCKS/${n}.html"
  [ -f "$f" ] || continue
  perl -i -pe '
    # Добавить loading="lazy" decoding="async" к <img> которые их ещё не имеют
    s~<img\b((?:(?!loading=)(?!>).)*)/?>~<img$1 loading="lazy" decoding="async">~gi unless /loading=/;
  ' "$f"
done

# ─── Точечные фиксы производительности ───
# content-visibility ВРЕДНО для блока обложек (ломает sticky+transform sync).
# Применяем только к статичным блокам.
cat > "$TMP_BLOCKS/_perf-styles.html" <<'CSS'
<style>
/* Виртуализация статичных тяжёлых блоков (не-sticky) */
.affiche-section, #affiches,
.presentations, #presentations {
  content-visibility: auto;
  contain-intrinsic-size: auto 800px;
}
/* Обложки: облегчаем тени при движении на мобиле */
@media (max-width: 768px) {
  .twk-cover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.18) !important;
    transition: none !important;
  }
  .twk-cover img {
    filter: none !important;
  }
  .twk-covers__stack {
    will-change: transform;
    transform: translateZ(0);
  }
}
/* GPU-композит для всех картинок */
img { transform: translateZ(0); }
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
