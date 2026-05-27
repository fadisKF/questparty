@echo off
chcp 65001 >nul
cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ОШИБКА] Node.js / npm не найдены в PATH.
    echo.
    echo 1. Скачайте и установите Node.js LTS:
    echo    https://nodejs.org/
    echo 2. Перезапустите терминал и IntelliJ
    echo 3. Запустите этот файл снова
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Установка зависимостей...
    call npm install
    if errorlevel 1 (
        echo npm install завершился с ошибкой.
        pause
        exit /b 1
    )
)

echo.
echo Запуск сайта QuestParty...
echo Откройте в браузере: http://127.0.0.1:5173
echo Остановка: Ctrl+C
echo.
call npm run dev -- --host 127.0.0.1 --port 5173
