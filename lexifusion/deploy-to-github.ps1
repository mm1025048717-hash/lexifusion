# 将 lexifusion 推送到 GitHub（在 lexifusion 目录下运行）
# 用法：在 PowerShell 中先 cd 到 lexifusion，再执行 .\deploy-to-github.ps1

$repoUrl = "https://github.com/mm1025048717-hash/lexifusion.git"

if (-not (Test-Path "package.json") -or -not (Test-Path "app.json")) {
    Write-Host "错误：请在 lexifusion 项目根目录下运行此脚本。" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".git")) {
    Write-Host "正在初始化 Git 仓库..." -ForegroundColor Cyan
    git init
}

Write-Host "添加文件并提交..." -ForegroundColor Cyan
git add .
git status
$commitMsg = "feat: 融词 LexiFusion 初始版本"
git commit -m $commitMsg
if ($LASTEXITCODE -ne 0) {
    Write-Host "没有新更改可提交，或已提交过。继续设置远程并推送。" -ForegroundColor Yellow
}

$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "添加远程仓库: $repoUrl" -ForegroundColor Cyan
    git remote add origin $repoUrl
} else {
    Write-Host "当前远程: $remote" -ForegroundColor Gray
    $change = Read-Host "要改为 $repoUrl 吗？(y/N)"
    if ($change -eq "y" -or $change -eq "Y") {
        git remote remove origin
        git remote add origin $repoUrl
    }
}

git branch -M main
Write-Host "推送到 origin main ..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "已推送到 GitHub: $repoUrl" -ForegroundColor Green
} else {
    Write-Host "推送失败。请确认：" -ForegroundColor Red
    Write-Host "  1. 已在 GitHub 上创建空仓库（如 https://github.com/mm1025048717-hash/lexifusion）"
    Write-Host "  2. 已登录 GitHub（或配置了 Personal Access Token）"
}
