#!/bin/bash

WEB_PATH=$(dirname $0)
cd $WEB_PATH
cd ..

echo "[deploy] start proxy"
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
echo "[deploy] start deployment..."
echo "[deploy] git stash..."
git stash
echo "[deploy] fetching..."
echo "[deploy] path:" $(pwd)
echo "[deploy] pulling source code..."
git pull
git checkout master

echo "[deploy] stop service..."
pm2 stop slack-backend

echo "[deploy] pnpm install..."
pnpm i

echo "[deploy] stash pop..."
git stash pop

echo "[deploy] build..."
pnpm prebuild

pnpm build

echo "[deploy] restarting..."
pm2 restart slack-backend

echo "[deploy] finished."