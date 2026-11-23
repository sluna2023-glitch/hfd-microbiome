@echo off
chcp 65001 >nul
title HFD microbioma
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js no esta instalado o no esta en el PATH.
  echo Descarga e instala la version LTS desde: https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules\.bin\tsx.cmd" (
  echo Instalando dependencias por primera vez ^(puede tardar 1-2 minutos^)...
  call npm install --no-audit --no-fund
  if not exist "node_modules\.bin\tsx.cmd" (
    echo Reintentando instalacion compatible ^(legacy-peer-deps^)...
    call npm install --legacy-peer-deps --no-audit --no-fund
  )
  if not exist "node_modules\.bin\tsx.cmd" (
    echo [ERROR] No se pudieron instalar las dependencias correctamente.
    echo Si esta carpeta esta dentro de OneDrive, muevela a C:\HFD-Microbiome-Analyzer e intentalo de nuevo.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando el servidor local de HFD microbioma...
echo El navegador se abrira automaticamente en http://localhost:3000 cuando este listo.
echo NO cierres esta ventana mientras uses el programa.
echo.

start /b node -e "const h=require('http'),c=require('child_process');const t=setInterval(()=>{h.get('http://127.0.0.1:3000/api/health',r=>{if(r.statusCode===200){clearInterval(t);c.exec('cmd /c start http://localhost:3000');}}).on('error',()=>{});},600);"
call npm run dev
pause
