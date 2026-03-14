# Design: Simplify Deployment

## 核心理念

**让任何人都能轻松使用本地应用**
- 默认SQLite，无需配置数据库
- 跨平台可执行文件，双击运行

---

## 部署方式 (按推荐顺序)

### 1. 跨平台可执行文件 (最佳) ⭐⭐⭐⭐⭐

```
用户操作:
1. 去 Releases 下载 exe/app
2. 双击运行
3. 打开浏览器 http://localhost:8080
4. 开始使用!
```

构建方式: GitHub Actions 自动打包
```
代码提交 → CI自动构建 → 生成
                ↓
        ├── Windows: privy-jiner.exe
        ├── Mac:     privy-jiner.app
        └── Linux:   privy-jiner
```

### 2. npm (全平台)

```bash
# 需要Node.js
npx privy-jiner
```

### 3. Homebrew (Mac专用)

```bash
# Mac用户
brew install privy-jiner
```

### 4. Docker (技术人员)

```bash
docker run -d -p 8080:8080 privy-jiner
```

---

## 用户认证设计

### 1. 网页版/独立模式

**可选的本地账户:**
```
首次使用:
□ 不需要登录 (仅本地访问) ← 默认
□ 设置本地账户
```

- 本地运行，只有你自己能访问

### 2. OpenClaw插件模式

**共享密钥 + Token验证**

```typescript
// openclaw.plugin.json
{
  "auth": {
    "type": "shared-secret", 
    "secret": "${OPENCLOW_PLUGIN_SECRET}"
  }
}
```
首次使用:
□ 不需要登录 (仅本地访问) ← 默认
□ 设置本地账户
```

- 本地运行，只有你自己访问
- 类似iPhone"信任此电脑"

### 2. OpenClaw插件模式 - 认证

**问题:** Gateway如何验证插件身份?

**方案: 共享密钥 + Token**

```typescript
// openclaw.plugin.json
{
  "auth": {
    "type": "shared-secret",
    "secret": "${OPENCLOW_PLUGIN_SECRET}"
  }
}
```

**通信流程:**
```
Gateway ──发送请求──> Privy-Jiner插件
  + Authorization: Bearer <token>
  + X-Plugin-Secret: <shared_secret>
```

**Token包含:**
```json
{
  "sub": "gateway-user-id",
  "plugin": "privy-jiner",
  "capabilities": ["finance", "health"]
}
```

### 3. 账号获取

| 模式 | 认证方式 |
|------|----------|
| 独立模式 | 可选本地账户 或 无需登录 |
| OpenClaw插件 | Gateway已登录，插件用共享密钥 |

---

## 部署方式对比

| 方式 | 难度 | 适用用户 |
|------|------|----------|
| Docker | ⭐⭐ | 技术人员 |
| **预装安装包** | ⭐ | 普通用户 |
| **网页版服务** | ⭐⭐⭐⭐⭐ | 所有人 |

### 1. 预编译二进制 (推荐)

```bash
# 下载就能用
Windows: 双击 privy-jiner.exe
Mac:    双击 privy-jiner.app
Linux:  ./privy-jiner
```

包含:
- 预编译的程序
- 内置SQLite数据库
- 默认配置

### 2. 一键网页部署

支持一键部署平台:
- **Railway** - 点击部署
- **Render** - 点击部署  
- **Fly.io** - 点击部署

用户只需:
1. 点击部署按钮
2. 等待完成
3. 获取URL

### 3. Docker (技术用户)

```bash
docker run -d -p 8080:8080 privy-jiner
```

## Architecture Changes

### 1. Default to SQLite Only

```
Before: User must choose SQLite/MySQL/PostgreSQL
After:  SQLite is the only option, auto-initialized
```

- Remove database type selection UI
- Remove MySQL/PostgreSQL connection code from core
- Database file stored in `~/.privy-jiner/data/`

### 2. OpenClaw Plugin - No Local Database

```
Before: Plugin tries to initialize its own database
After:  Plugin uses Gateway's database via shared access
```

Changes to `packages/core/src/openclaw/index.ts`:
- Remove `database.initialize()` call in plugin mode
- Add method to access Gateway's database connection
- Remove `DatabaseManager` instantiation in plugin constructor

### 3. One-Click Docker Deployment

```bash
# Before: 5 steps
git clone → npm install → npm build → configure → npm run dev

# After: 1 step
docker run -d -p 8080:8080 privy-jiner
```

Docker improvements:
- Pre-built image with all dependencies
- Auto-create data directory
- Default configuration embedded
- Health check included

### 4. Zero-Config Standalone Mode

```typescript
// config/index.ts - Default config
const defaultConfig = {
  deployment: {
    mode: 'standalone',
    port: 8080,  // Changed from 3000 to common web port
  },
  database: {
    type: 'sqlite',  // Only option
    path: '~/.privy-jiner/data/privy-jiner.db',
  },
  // All optional fields have sensible defaults
};
```

## Implementation Plan

1. Modify OpenClaw plugin to not initialize database
2. Create Dockerfile with pre-built image
3. Update default port to 8080
4. Simplify config to only allow SQLite
5. Add health check endpoint

## Files to Modify

- `packages/core/src/openclaw/index.ts` - Remove DB init in plugin mode
- `packages/core/src/config/index.ts` - Simplify defaults
- `Dockerfile` - Create one-click deployment
- `docker-compose.yml` - Optional docker-compose

## Backward Compatibility

- Existing SQLite users: Works unchanged
- Existing MySQL/PostgreSQL users: Migration script provided
- OpenClaw users: Benefits from zero-config
