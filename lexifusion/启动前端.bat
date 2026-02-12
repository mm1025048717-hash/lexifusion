@echo off
chcp 65001 >nul
echo 正在启动融词前端 (Expo Web)...
echo.

cd /d "%~dp0"

if not exist "app" (
    echo 错误：请在 lexifusion 目录下运行（含 app 文件夹）
    pause
    exit /b 1
)

if not exist "package.json" (
    echo 错误：未找到 package.json
    pause
    exit /b 1
)

echo 当前目录: %CD%
echo.
npx expo start --web

pause
