#!/bin/sh
# Демо на GitHub Pages: собирает сайт в подпапку /kaspur-3000/ и кладёт сборку в ветку gh-pages.
# Запуск из корня проекта: sh scripts/deploy-demo.sh
set -e
cd "$(dirname "$0")/.."
VITE_BASE=/kaspur-3000/ VITE_NOINDEX=1 VITE_DEMO=1 npx vite build
TMP=$(mktemp -d)
cp -R dist/. "$TMP"/
touch "$TMP/.nojekyll"
REMOTE=$(git remote get-url origin)
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="Andrew Mironov" -c user.email="AndrewMironov13@users.noreply.github.com" commit -q -m "Демо $(date '+%d.%m.%Y %H:%M')

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>"
for i in 1 2 3 4; do git -c http.postBuffer=157286400 push -q -f "$REMOTE" gh-pages && break; echo "повтор $i"; sleep 5; done
cd - >/dev/null
rm -rf "$TMP"
echo "Готово: https://andrewmironov13.github.io/kaspur-3000/ (обновится через 1–2 минуты)"
