@echo off
chcp 65001 >nul
echo Остановка процессов QuestParty на портах 8080 и 5173...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr LISTENING') do (
    echo Завершение PID %%a (порт 8080 - Backend)
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr LISTENING') do (
    echo Завершение PID %%a (порт 5173 - Frontend)
    taskkill /F /PID %%a 2>nul
)

echo.
echo Готово. Теперь можно снова запустить QuestParty Full Stack.
pause
