#!/bin/bash
# Деплой twokaif.ru на прод. Запуск: bash deploy.sh
# Делает: бэкап текущего сайта на сервере -> сборка -> заливка dist -> проверка МЖ.
set -e
cd "$(dirname "$0")"

KEY=~/.ssh/twokaif_hetzner
SRV=root@213.165.41.1
ROOT=/var/www/twokaif-new
TS=$(date +%Y%m%d-%H%M%S)

echo "1/4 Бэкап текущего сайта на сервере (index/404)..."
ssh -i "$KEY" "$SRV" "cp $ROOT/index.html $ROOT/index.html.bak-$TS; cp $ROOT/404.html $ROOT/404.html.bak-$TS 2>/dev/null || true; echo '  бэкап: *.bak-$TS'"

echo "2/4 Сборка из блоков..."
bash build.sh >/dev/null
echo "  dist собран"

echo "3/4 Заливка dist на прод (без --delete, чужое не трогаем)..."
rsync -az -e "ssh -i $KEY" dist/ "$SRV:$ROOT/"

echo "4/4 Проверка что МЖ на проде..."
N=$(ssh -i "$KEY" "$SRV" "grep -c twokaif_mzh_bot $ROOT/index.html || true")
echo "  упоминаний twokaif_mzh_bot в проде: $N (должно быть >0)"

echo ""
echo "ГОТОВО. twokaif.ru обновлён."
echo "Откат если что: ssh -i $KEY $SRV \"cp $ROOT/index.html.bak-$TS $ROOT/index.html\""
