#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js no está instalado en este computador."
  echo "Descarga e instala la versión LTS desde: https://nodejs.org/"
  read -r -p "Presiona Enter para salir..."
  exit 1
fi

if [ ! -x "node_modules/.bin/tsx" ]; then
  echo "Instalando dependencias por primera vez (puede tardar 1-2 minutos)..."
  npm install --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund
fi

echo ""
echo "Iniciando el servidor local de HFD Microbiome Analyzer..."
echo "El navegador se abrirá automáticamente en http://localhost:3000 cuando esté listo."
echo "Para cerrar el programa, presiona Ctrl+C o cierra esta terminal."
echo ""

(
  for _ in $(seq 1 60); do
    if node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
      if command -v open >/dev/null 2>&1; then
        open "http://localhost:3000"
      elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:3000"
      fi
      break
    fi
    sleep 1
  done
) &

npm run dev
