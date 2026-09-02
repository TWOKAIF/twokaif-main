#!/bin/bash
# Деплой twokaif.ru на прод. Запуск: bash deploy.sh
# Делает: бэкап текущего сайта на сервере -> сборка -> проверка МЖ -> заливка dist -> повторная проверка МЖ.
set -e
cd "$(dirname "$0")"

KEY=~/.ssh/twokaif_hetzner
SRV=root@213.165.41.1
ROOT=/var/www/twokaif   # боевой докрут twokaif.ru (nginx twokaif-prod). НЕ /var/www/twokaif-new!
TS=$(date +%Y%m%d-%H%M%S)

check_mzh() {
  local index_file="$1"
  local route_file="$2"
  local where="$3"
  local card route

  card=$(sed -n '/id="promo-card-mzh"/,/<!-- ╭─ Карточка 6/p' "$index_file")
  route=$(sed -n '/    mzh: {/,/    },/p' "$route_file")

  for expected in \
    'РУЧНОЙ ЗАКАЗ' \
    '450&nbsp;₽ / пара' \
    '1&nbsp;990&nbsp;₽' \
    '2&nbsp;250&nbsp;₽' \
    'href="https://telegram.me/twokaif_ruslan"'; do
    if ! printf '%s\n' "$card" | grep -Fq "$expected"; then
      echo "ОШИБКА: карточка МЖ ($where) не содержит: $expected"
      exit 1
    fi
  done

  if ! printf '%s\n' "$route" | grep -Fq "url: 'https://telegram.me/twokaif_ruslan'"; then
    echo "ОШИБКА: /go/mzh/ ($where) ведёт не к Руслану"
    exit 1
  fi
}

echo "1/5 Бэкап текущего сайта на сервере (index/404)..."
ssh -i "$KEY" "$SRV" "cp $ROOT/index.html $ROOT/index.html.bak-$TS; cp $ROOT/404.html $ROOT/404.html.bak-$TS 2>/dev/null || true; echo '  бэкап: *.bak-$TS'"

echo "2/5 Сборка из блоков..."
bash build.sh >/dev/null
echo "  dist собран"

echo "3/5 Проверка МЖ в локальной сборке..."
check_mzh "dist/index.html" "dist/go/mzh/index.html" "локальная сборка"
echo "  карточка, цена и ссылка МЖ верны"

echo "4/5 Заливка dist на прод (без --delete, чужое не трогаем)..."
rsync -az -e "ssh -i $KEY" dist/ "$SRV:$ROOT/"

echo "5/5 Проверка МЖ после заливки..."
VERIFY_TMP=$(mktemp -d)
trap 'rm -rf "$VERIFY_TMP"' EXIT
scp -q -i "$KEY" "$SRV:$ROOT/index.html" "$VERIFY_TMP/index.html"
scp -q -i "$KEY" "$SRV:$ROOT/go/mzh/index.html" "$VERIFY_TMP/go-mzh.html"
check_mzh "$VERIFY_TMP/index.html" "$VERIFY_TMP/go-mzh.html" "прод"
echo "  карточка, цена и ссылка МЖ на проде верны"

echo ""
echo "ГОТОВО. twokaif.ru обновлён."
echo "Откат если что: ssh -i $KEY $SRV \"cp $ROOT/index.html.bak-$TS $ROOT/index.html\""
