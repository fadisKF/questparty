@echo off
chcp 65001 >nul
cd /d "%~dp0"
title QuestParty - Full Stack

echo ========================================
echo   QuestParty - Backend + Frontend
echo ========================================
echo.

where npm >nul 2>&1
if errorlevel 1 (
    echo [!!] Node.js/npm не найден. Установите: https://nodejs.org/
    echo      Frontend не запустится. Backend можно поднять из IntelliJ.
    echo.
    set SKIP_FRONTEND=1
) else (
    set SKIP_FRONTEND=0
)

echo [1/2] Запуск Backend (Spring Boot)...
start "QuestParty Backend" cmd /k "cd /d "%~dp0" && mvn -q spring-boot:run"

if "%SKIP_FRONTEND%"=="0" (
    timeout /t 3 /nobreak >nul
    echo [2/2] Запуск Frontend (Vite)...
    start "QuestParty Frontend" cmd /k "cd /d "%~dp0frontend" && call start.bat"
    echo.
    echo   Сайт:    http://127.0.0.1:5173
) else (
    echo [2/2] Frontend пропущен (нет npm)
    echo.
    echo   Swagger: http://localhost:8080/api/swagger-ui.html
)

echo   API:     http://localhost:8080/api
echo.
echo Окна Backend и Frontend открыты отдельно. Закройте их для остановки.
pause
