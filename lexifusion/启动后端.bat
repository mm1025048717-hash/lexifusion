@echo off
chcp 65001 >nul
echo 正在启动融词后端 API...
echo.

cd /d "%~dp0server"

if not exist "src" (
    echo 错误：未找到 server 目录
    pause
    exit /b 1
)

echo 当前目录: %CD%
echo.
npm run dev

pause
