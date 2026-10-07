#!/usr/bin/env sh
# Instala, compila y abre la app en http://localhost:4173
set -e
[ -d node_modules ] || npm install
npm run build
npx vite preview --host --port 4173 --open
