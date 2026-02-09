# LexiFusion 后端服务器

Node.js + Express + TypeScript + Prisma ORM + SQLite

## 快速启动

```bash
# 安装依赖
npm install

# 创建数据库 & 生成 Prisma Client
npx prisma db push

# 导入种子数据（主题、单词、融合规则）
npm run db:seed

# 启动开发服务器
npm run dev
```

服务器运行在 http://localhost:3001

## API 端点

### 认证
- `POST /api/auth/register` - 设备匿名注册（传 deviceId，返回 JWT）
- `POST /api/auth/bind-email` - 绑定邮箱（需认证）

### 主题
- `GET /api/themes` - 获取所有主题列表
- `GET /api/themes/:id` - 获取主题详情（含单词）
- `GET /api/themes/:id/fusions` - 获取主题融合规则

### 融合
- `POST /api/fusions/resolve` - 解析两个词的融合结果
- `POST /api/fusions/discoveries` - 记录发现（需认证）
- `GET /api/fusions/discoveries` - 获取用户所有发现（需认证）

### 收藏
- `POST /api/fusions/favorites/:discoveryId` - 切换收藏（需认证）
- `GET /api/fusions/favorites` - 获取收藏列表（需认证）

### 用户
- `GET /api/users/me` - 获取当前用户信息（需认证）
- `PATCH /api/users/me` - 更新用户信息（需认证）

## 数据库管理

```bash
# 查看数据库
npm run db:studio

# 重新生成 Prisma Client
npx prisma generate

# 重置数据库
npx prisma db push --force-reset && npm run db:seed
```

## 切换到 PostgreSQL（生产环境）

1. 修改 `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. 更新 `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@host:5432/lexifusion"
   ```

3. 重新生成并迁移:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```
