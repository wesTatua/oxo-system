@echo off
chcp 65001 >nul
title OXO App — Expo Dev Server
cd /d C:\jarvis-claude\OXO_System

echo ============================================
echo   OXO_System — React Native / Expo
echo   Node necessário: 18 ou 20 LTS
echo ============================================

:: Verificar versão do Node
for /f "tokens=1" %%v in ('node --version 2^>nul') do set NODEVER=%%v
echo Node instalado: %NODEVER%

:: Node 26 é incompatível com Metro — tentar Node 20 se disponível
set NODE20="C:\Program Files\nodejs-20\node.exe"
if exist %NODE20% (
    echo [OK] Usando Node 20 LTS
    set PATH=C:\Program Files\nodejs-20;%PATH%
) else (
    echo [AVISO] Node 26 detectado. Metro pode travar.
    echo         Instale Node 20 LTS em: https://nodejs.org/en/download
    echo         Ou aguarde instalação automática via winget.
)

echo.
echo [INICIANDO] Expo Dev Server...
echo [AGUARDE]   Pode levar 30-60 segundos para o QR aparecer.
echo.
npx expo start

pause
