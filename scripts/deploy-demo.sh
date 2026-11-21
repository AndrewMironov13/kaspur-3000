#!/bin/sh
# Сборка проверенного демо и обычный push ветки gh-pages с сохранением истории
set -eu
cd "$(dirname "$0")/.."
VITE_BASE=/kaspur-3000/ VITE_NOINDEX=1 VITE_DEMO=1 npm run build
TASK_DEPLOY_DIR=$(mktemp -d)
cleanup() {
  git worktree remove --force "$TASK_DEPLOY_DIR" >/dev/null 2>&1 || true
}
trap cleanup EXIT HUP INT TERM
git fetch origin gh-pages
git worktree add --detach "$TASK_DEPLOY_DIR" origin/gh-pages
git -C "$TASK_DEPLOY_DIR" rm -r --ignore-unmatch . >/dev/null
cp -R dist/. "$TASK_DEPLOY_DIR"/
touch "$TASK_DEPLOY_DIR/.nojekyll"
git -C "$TASK_DEPLOY_DIR" add -A
if git -C "$TASK_DEPLOY_DIR" diff --cached --quiet; then
  echo "Демо уже соответствует сборке"
  exit 0
fi
git -C "$TASK_DEPLOY_DIR" commit -m "Обновить демо КАСПУР 3000 БАЗИС"
git -C "$TASK_DEPLOY_DIR" push origin HEAD:gh-pages
echo "Опубликовано: https://andrewmironov13.github.io/kaspur-3000/"
