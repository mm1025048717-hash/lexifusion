# 融词 LexiFusion · 单词化学反应

基于「主题场景 + 拖拽融合 + 碎片化联想」的英语单词学习移动端 Demo。

## 设计要点

- **绿色 + 白色** 主色，贴合实验室/化学反应氛围
- **按主题划分**：美食、旅行等场景词库，无难度分级
- **单字气泡**：点击选择两个气泡尝试合成，支持复合词与场景搭配
- **融合结果卡**：展示释义、类型（复合词/场景搭配）、例句

## 运行

```bash
cd lexifusion
npm install
npx expo start
```

用 Expo Go 扫码或按 `a`/`i` 打开模拟器。

## 当前结构

- **首页 (实验室)**：主题卡片入口，点击进入对应主题实验室
- **主题实验室** `/lab/[themeId]`：气泡列表 + 选择两个气泡合成，下方展示融合结果卡
- **图鉴**：占位，后续接入「已发现词汇库」
- **我的**：占位，后续接入融合记忆库与学习数据

## 词库

- `data/themes.ts`：主题列表、基础词、融合规则（美食、旅行示例）
- 扩展：在 `themes` 中新增主题，在 `fusions` 中新增 `from` + `result` 即可

## 技术栈

- Expo (SDK 54) + React Native + TypeScript
- Expo Router (file-based)
- 无后端，数据在端侧

---

## 部署到 GitHub

把本项目推到你的 GitHub 仓库（例如 [mm1025048717-hash](https://github.com/mm1025048717-hash)）可以按下面做。

### 1. 在 GitHub 上新建仓库

1. 打开 [GitHub 新建仓库](https://github.com/new)
2. 仓库名填 **`lexifusion`**（或你喜欢的名字）
3. 选择 **Public**，不要勾选 “Add a README”
4. 点 **Create repository**

### 2. 在本地推送代码

在项目根目录 **lexifusion** 下打开终端，依次执行（把 `你的用户名` 换成你的 GitHub 用户名，例如 `mm1025048717-hash`）：

```bash
# 进入项目目录
cd lexifusion

# 若尚未初始化 Git，则执行
git init

# 添加所有文件并提交
git add .
git commit -m "feat: 融词 LexiFusion 初始版本"

# 添加你的 GitHub 远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/mm1025048717-hash/lexifusion.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

若仓库已存在且已有 `origin`，可先删除再添加，或直接改地址：

```bash
git remote remove origin
git remote add origin https://github.com/mm1025048717-hash/lexifusion.git
git push -u origin main
```

### 3. 使用 HTTPS 时需登录

- 推送到 GitHub 时如提示登录，可使用 **Personal Access Token** 作为密码  
- 创建 Token：GitHub → Settings → Developer settings → [Personal access tokens](https://github.com/settings/tokens)
