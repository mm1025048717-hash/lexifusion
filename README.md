<p align="center">
  <strong>融词 LexiFusion</strong><br/>
  <em>单词化学反应 · 英语学习 Demo</em>
</p>

<p align="center">
  用「主题场景 + 气泡融合 + 碎片联想」把背单词变成一次轻量的创意实验
</p>

---

## ✨ 这是什么？

**LexiFusion（融词）** 是一个轻量的英语单词学习 Demo：不按字母表、不按词表顺序，而是按**主题场景**（美食、旅行等）把单词做成**可点击的气泡**，任选两个一「融合」，立刻得到复合词、搭配或创意联想。像在实验室里做化学反应一样，在玩的过程中自然记住词义和用法。

适合：想用**场景化、低压力**方式记单词的人，或想快速体验「融合式」词库设计的开发者。

---

## 🎯 核心特性

| 特性 | 说明 |
|------|------|
| **主题实验室** | 按场景划分（美食、旅行等），每个主题有独立词库与融合规则 |
| **气泡融合** | 点击两个单词气泡即可「合成」—— 复合词、短语或创意联想，即时反馈 |
| **融合图鉴** | 已发现的融合自动进入图鉴，支持收藏，方便回顾 |
| **融合记忆库** | 在实验室里的发现会保存到「我的」页，与学习数据、收藏夹一起管理 |
| **无后端** | 词库与规则均在端侧（`data/themes.ts`），可本地扩展或二次开发 |

---

## 📱 产品结构

- **首页 · 实验室**：主题卡片入口，点击进入对应主题的「气泡实验室」
- **主题实验室** ` /lab/[themeId]`：气泡列表 + 选两个气泡融合，下方展示融合结果卡（释义、类型、例句）
- **图鉴**：已发现词汇库，支持收藏与筛选
- **我的**：融合记忆库、学习数据（已发现/收藏统计）、收藏夹

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装与运行

```bash
# 克隆后进入项目
cd lexifusion

# 安装依赖
npm install

# 启动开发服务器
npx expo start
```

- **手机**：用 Expo Go 扫码即可在真机运行  
- **模拟器**：在终端按 `a`（Android）或 `i`（iOS）  
- **Web**：按 `w` 在浏览器中打开

### 本地预览 Web 静态构建（与 Vercel 一致）

```bash
npm run build:web
npx serve dist
```

浏览器打开终端提示的地址即可。

---

## 🛠 技术栈

- **Expo** (SDK 54) + **React Native** + **TypeScript**
- **Expo Router**：基于文件的路由（`app/` 目录）
- **无后端**：词库、融合规则、发现与收藏均在前端/本地存储

---

## 📂 词库与扩展

- 词库与融合规则集中在 **`data/themes.ts`**：主题列表、基础词（气泡）、融合结果（复合词/短语/创意）。
- 扩展方式：在 `themes` 中新增主题，在对应主题的 `fusions` 中增加 `from` + `result` 等字段即可。

---

## 🌐 部署

### 部署到 Vercel（推荐）

1. 在 [Vercel](https://vercel.com) 中 **Import** 本仓库。
2. 使用仓库内已有配置即可：
   - **Build Command:** `npm run build:web`
   - **Output Directory:** `dist`
3. 部署完成后即可获得在线访问链接。

### 部署到 GitHub

若尚未推送到自己的 GitHub：

```bash
git init
git add .
git commit -m "feat: 融词 LexiFusion 完整项目"
git remote add origin https://github.com/你的用户名/lexifusion.git
git branch -M main
git push -u origin main
```

推送时若需登录，可使用 [Personal Access Token](https://github.com/settings/tokens) 作为密码。

---

## 📄 License

MIT · 可自由使用与二次开发。

---

<p align="center">
  <sub>融词 LexiFusion · 单词化学反应 · 英语学习 Demo</sub>
</p>
