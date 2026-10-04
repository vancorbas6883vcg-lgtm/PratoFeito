@echo off
chcp 65001 >nul
title PratoFeito
cd /d "%~dp0ecommerce-backend"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Tentando instalar automaticamente...
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  if errorlevel 1 (
    echo.
    echo Nao consegui instalar sozinho. Vou abrir a pagina de download do Node.js.
    echo Instale a versao LTS, feche esta janela e de dois cliques em iniciar.bat de novo.
    start https://nodejs.org/pt
    pause
    exit /b 1
  )
  echo.
  echo Node.js instalado! Feche esta janela e de dois cliques em iniciar.bat de novo.
  pause
  exit /b 0
)

if not exist node_modules (
  echo Preparando o PratoFeito pela primeira vez. Pode levar ate um minuto...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo Falha ao instalar. Verifique sua conexao com a internet e tente de novo.
    pause
    exit /b 1
  )
)

set OPEN_BROWSER=1
node server.js
echo.
echo O PratoFeito foi encerrado.
pause
