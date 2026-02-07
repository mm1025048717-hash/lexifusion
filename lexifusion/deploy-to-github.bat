@echo off
chcp 65001 >nul
echo 将 lexifusion 推送到 GitHub（请在 lexifusion 目录下运行）
echo.

if not exist package.json (
    echo 错误：请在 lexifusion 项目根目录下运行此脚本。
    exit /b 1
)
if not exist app.json (
    echo 错误：请在 lexifusion 项目根目录下运行此脚本。
    exit /b 1
)

if not exist .git (
    echo 正在初始化 Git 仓库...
    git init
)

echo 添加文件并提交...
git add .
git commit -m "feat: 融词 LexiFusion 初始版本"
if errorlevel 1 (
    echo 没有新更改可提交，或已提交过。继续。
)

git remote remove origin 2>nul
git remote add origin https://github.com/mm1025048717-hash/lexifusion.git
git branch -M main
echo 推送到 origin main ...
git push -u origin main

if errorlevel 1 (
    echo.
    echo 推送失败。请确认：
    echo   1. 已在 GitHub 上创建空仓库 https://github.com/mm1025048717-hash/lexifusion
    echo   2. 已登录 GitHub 或配置 Personal Access Token
) else (
    echo 已推送到 GitHub.
)
pause
