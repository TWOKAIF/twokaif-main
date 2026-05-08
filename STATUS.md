# twokaif-main — статус

Главный сайт ТУКАЙФ. Перевозим с Tilda на собственный сервер Aeza.

## Где сейчас живёт

| Где | URL | Назначение |
|---|---|---|
| Прод (старый) | `twokaif.ru` (Tilda) | пока работает, отключим после переезда |
| Staging (новый) | `new.twokaif.ru` (Aeza) | боевой staging для отладки |

## Структура

```
blocks/              — 17 HTML-блоков, склеиваются в index.html
build.sh             — сборщик из блоков в dist/
dist/                — собранный сайт (index.html, 404.html, robots.txt)
README.md            — детальное описание блоков и плана переноса
.gitignore           — исключения для git
```

## Картинки

Картинки сейчас тащатся с Tilda CDN (`static.tildacdn.com`). Локальные копии лежат на Mac в исходной папке `01_Главный мозг/01_Мой сайт/02_САЙТ/04_Сайт-без-Тильды/images_sorted/` (не в git — слишком тяжёлые).

План: сконвертить в WebP, положить в `/var/www/twokaif-new/images/` на Aeza, заменить URL в HTML.

## Деплой

```bash
bash build.sh
rsync -avz --delete -e "ssh -i ~/.ssh/twokaif_hetzner" \
  dist/ root@213.165.41.1:/var/www/twokaif-new/
```

## Что осталось

См. `~/.claude/chef/PENDING.md` или спроси Шефа.
