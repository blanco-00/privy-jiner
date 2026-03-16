# Jiner 快速开始指南

> ⏱️ **5秒** → 🚀 **5分钟** → 📖 **深入了解**

---

## 🚀 5秒开始 (一行命令)

```bash
git clone https://github.com/blanco-00/privy-jiner.git && cd privy-jiner && ./start-jiner.sh
```

> ⚠️ 启动后需要配置 AI Provider（见下文步骤 3）

---

## 🚀 5分钟快速部署

### 前置要求

- ✅ Node.js 20+ (检查: `node -v`)
- ✅ OpenClaw 已安装并运行在 `http://localhost:18789`

### 步骤 1: 克隆项目

```bash
git clone https://github.com/blanco-00/privy-jiner.git
cd privy-jiner
```

✓ **验证**: `ls -la` 应看到 `package.json`、`start-jiner.sh`

### 步骤 2: 一键启动

```bash
./start-jiner.sh
```

脚本会自动执行：
- ✅ 检查 Node.js 版本
- ✅ 检查端口可用性 (3001, 18789)
- ✅ 安装依赖
- ✅ 构建项目
- ✅ 打包 OpenClaw 插件
- ✅ 启动 Jiner 服务

✓ **验证**: 看到 `Jiner service started on port 3001` 即成功

### 步骤 3: 配置 AI Provider

**方式 A: 通过环境变量**
```bash
# 复制模板
cp .env.example .env

# 编辑 .env，填入你的 API Key
# OPENAI_API_KEY=sk-xxx
```

**方式 B: 通过 Web 界面**
1. 打开 http://localhost:3001
2. 进入设置页面
3. 配置你的 AI Provider

✓ **验证**: 访问 `http://localhost:3001/api/monitoring/database` 返回数据库状态

### 步骤 4: 配置 OpenClaw 插件

1. 打开 OpenClaw: http://localhost:18789
2. 进入 **Plugin Settings**
3. 添加插件：
   - **Path**: `/path/to/privy-jiner/dist/openclaw-plugin.js`
   - **Type**: Personal Assistant
4. 保存并重启 OpenClaw

> 📸 **截图占位符**: [TODO: 添加 OpenClaw 插件配置界面截图]

✓ **验证**: 在 OpenClaw 插件列表中看到 "Jiner" 或 "Personal Assistant"

### 步骤 5: 开始使用

现在可以在 OpenClaw 中说：

| 自然语言 | 效果 |
|---------|------|
| "我喝了500ml水" | 记录喝水 |
| "我跑了30分钟" | 记录运动 |
| "我花了100元买咖啡" | 记录支出 |
| "我买了件衬衫" | 记录穿搭 |

✓ **验证**: 说一句话，查看日志有 `[AI /nlu] Received message:`

---

## 📖 深入了解

### 端口配置

| 服务 | 默认端口 | 说明 |
|------|----------|------|
| Jiner API | 3001 | 主 API 服务 |
| OpenClaw | 18789 | QQ Bot 服务 |

**自定义端口:**

```bash
# 方式 1: 通过 .env 文件
echo "JINER_PORT=8080" >> .env

# 方式 2: 修改 start-jiner.sh
# 编辑 start-jiner.sh 中的 JINER_PORT=3001 为你想要的端口
```

### 可用命令

```bash
# 启动服务
./start-jiner.sh

# 查看日志
tail -f ~/.privy-jiner/logs/privy-jiner-*.log

# 停止服务
pkill -f "jiner"
```

### 日志关键标识

| 日志标识 | 含义 |
|---------|------|
| `[AI /nlu] Received message:` | 收到消息 |
| `[AI /nlu] Intent parsed:` | 意图解析结果 |
| `[AI /nlu] Logging water/exercise/expense:` | 数据保存成功 |
| `[Jiner Plugin] === Capability Discovery ===` | 插件能力发现 |

---

## 🔧 故障排查

### 问题: OpenClaw 加载插件失败

检查：
- [ ] `dist/openclaw-plugin.js` 是否存在
- [ ] Node.js 版本是否 >= 20

```bash
# 重新构建插件
npm run build:plugin
```

### 问题: 说"喝水"没有反应

检查：
- [ ] Jiner 服务是否运行在 3001 端口: `lsof -i :3001`
- [ ] AI Provider 是否已配置
- [ ] 日志中是否有 `[AI /nlu] Received message`

```bash
# 验证服务健康
curl http://localhost:3001/api/monitoring/database
```

### 问题: 端口被占用

```bash
# 查看端口占用
lsof -i :3001
lsof -i :18789

# 修改端口: 编辑 start-jiner.sh 中的 JINER_PORT=3001
```

### 更多信息

- 完整文档: [用户手册](./manual.md)
- API 参考: [API 文档](./api.md)
- 插件开发: [插件开发指南](./plugin-dev.md)
