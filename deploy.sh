#!/bin/bash
# Деплой twokaif.ru на прод. Запуск: bash deploy.sh
# Делает: бэкап текущего сайта на сервере -> сборка -> проверка МЖ и документов -> заливка dist -> повторная проверка.
set -e
cd "$(dirname "$0")"

KEY=~/.ssh/twokaif_aeza
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
    '2&nbsp;250&nbsp;₽' \
    'оплата после готовой игры' \
    'href="https://telegram.me/twokaif_ruslan"'; do
    if ! printf '%s\n' "$card" | grep -Fq "$expected"; then
      echo "ОШИБКА: карточка МЖ ($where) не содержит: $expected"
      exit 1
    fi
  done

  for forbidden in 'Аванс' 'аванс' 'предоплат' '1&nbsp;990&nbsp;₽'; do
    if printf '%s\n' "$card" | grep -Fq "$forbidden"; then
      echo "ОШИБКА: карточка МЖ ($where) содержит старое условие: $forbidden"
      exit 1
    fi
  done

  if ! printf '%s\n' "$route" | grep -Fq "url: 'https://telegram.me/twokaif_ruslan'"; then
    echo "ОШИБКА: /go/mzh/ ($where) ведёт не к Руслану"
    exit 1
  fi
}

check_mzh_legal() {
  local legal_root="$1"
  local where="$2"
  local slug file

  for slug in oferta privacy consent guest-consent; do
    file="$legal_root/$slug/index.html"
    if [ ! -s "$file" ]; then
      echo "ОШИБКА: страница МЖ ($where) отсутствует: $slug"
      exit 1
    fi
    for expected in \
      '<meta name="robots" content="noindex,nofollow">' \
      'href="/mzh/oferta/"' \
      'href="/mzh/privacy/"' \
      'href="/mzh/consent/"' \
      'href="/mzh/guest-consent/"'; do
      if ! grep -Fq "$expected" "$file"; then
        echo "ОШИБКА: страница МЖ $slug ($where) не содержит: $expected"
        exit 1
      fi
    done
  done

  grep -Fq 'хранить переданный ему файл в личном архиве' "$legal_root/oferta/index.html" || {
    echo "ОШИБКА: оферта МЖ ($where) не разрешает личный архив клиенту"
    exit 1
  }
  grep -Fq 'не позднее 30 календарных дней' "$legal_root/privacy/index.html" || {
    echo "ОШИБКА: политика МЖ ($where) не содержит срок удаления 30 дней"
    exit 1
  }
}

echo "1/5 Бэкап текущего сайта на сервере (index/404/страницы МЖ)..."
ssh -i "$KEY" "$SRV" "cp $ROOT/index.html $ROOT/index.html.bak-$TS; cp $ROOT/404.html $ROOT/404.html.bak-$TS 2>/dev/null || true; if [ -d $ROOT/mzh ]; then cp -a $ROOT/mzh $ROOT/mzh.bak-$TS; fi; echo '  бэкап: *.bak-$TS'"

echo "2/5 Сборка из блоков..."
bash build.sh >/dev/null
echo "  dist собран"

echo "3/5 Проверка МЖ в локальной сборке..."
check_mzh "dist/index.html" "dist/go/mzh/index.html" "локальная сборка"
check_mzh_legal "dist/mzh" "локальная сборка"
echo "  карточка, цена, ссылка и четыре документа МЖ верны"

echo "4/5 Заливка на прод (без --delete, чужое не трогаем)..."
case "${TWOKAIF_DEPLOY_SCOPE:-full}" in
  mzh)
    rsync -az -e "ssh -i $KEY" dist/index.html "$SRV:$ROOT/index.html"
    rsync -az -e "ssh -i $KEY" dist/mzh/ "$SRV:$ROOT/mzh/"
    echo "  загружены только главная и новые страницы МЖ"
    ;;
  full)
    rsync -az -e "ssh -i $KEY" dist/ "$SRV:$ROOT/"
    echo "  загружена полная сборка сайта"
    ;;
  *)
    echo "ОШИБКА: неизвестная область деплоя TWOKAIF_DEPLOY_SCOPE=${TWOKAIF_DEPLOY_SCOPE}"
    exit 1
    ;;
esac

echo "5/5 Проверка МЖ после заливки..."
VERIFY_TMP=$(mktemp -d)
trap 'rm -rf "$VERIFY_TMP"' EXIT
scp -q -i "$KEY" "$SRV:$ROOT/index.html" "$VERIFY_TMP/index.html"
scp -q -i "$KEY" "$SRV:$ROOT/go/mzh/index.html" "$VERIFY_TMP/go-mzh.html"
scp -q -r -i "$KEY" "$SRV:$ROOT/mzh" "$VERIFY_TMP/mzh"
check_mzh "$VERIFY_TMP/index.html" "$VERIFY_TMP/go-mzh.html" "прод"
check_mzh_legal "$VERIFY_TMP/mzh" "прод"
echo "  карточка, цена, ссылка и четыре документа МЖ на проде верны"

echo ""
echo "ГОТОВО. twokaif.ru обновлён."
echo "Откат если что: ssh -i $KEY $SRV \"cp $ROOT/index.html.bak-$TS $ROOT/index.html; [ ! -d $ROOT/mzh.bak-$TS ] || cp -a $ROOT/mzh.bak-$TS/. $ROOT/mzh/\""
