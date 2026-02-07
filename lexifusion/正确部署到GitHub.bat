@echo off
chcp 65001 >nul
title 将 lexifusion 正确部署到 GitHub 仓库根目录
echo.
echo 目标: https://github.com/mm1025048717-hash/lexifusion
echo 确保仓库根目录直接是项目文件（README、app、package.json 等）
echo.

cd /d "%~dp0"
if not exist package.json (
    echo 错误：请直接双击运行此脚本（确保在 lexifusion 文件夹内）。
    pause
    exit /b 1
)

echo [1/6] 删除旧的 .git（若存在）...
if exist .git (
    rmdir /s /q .git
)

echo [2/6] 初始化新仓库...
git init

echo [3/6] 添加所有文件...
git add .

echo [4/6] 提交...
git commit -m "feat: 融词 LexiFusion 完整项目"

echo [5/6] 设置远程并推送到 main（将覆盖线上当前内容）...
git remote add origin https://github.com/mm1025048717-hash/lexifusion.git
git branch -M main
git push -f -u origin main

if errorlevel 1 (
    echo.
    echo 推送失败。请检查：
    echo   1. 已安装 Git 并在 PATH 中
    echo   2. 已登录 GitHub（或配置 Token）
    echo   3. 网络可访问 github.com
) else (
    echo.
    echo 部署完成: https://github.com/mm1025048717-hash/lexifusion
    echo 仓库根目录现在应显示 README、app、components 等。
)
echo.
pause
