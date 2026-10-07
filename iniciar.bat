@echo off
if not exist node_modules call npm install
call npm run build
call npx vite preview --host --port 4173 --open
