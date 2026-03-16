# Jiner + OpenClaw 快速开始指南

## 5分钟快速部署

### 前置要求

- Node.js 18+
- OpenClaw 已安装并运行在 localhost:18789

### 步骤 1: 克隆项目

```bash
git clone https://github.com/blanco-00/privy-jiner.git
cd privy-jiner
```

### 步骤 2: 一键启动

```bash
./start-jiner.sh
```

脚本会自动：
- 检查 Node.js 版本
- 检查端口可用性
- 安装依赖
- 构建项目
- 打包 OpenClaw 插件
- 启动 Jiner 服务

### 步骤 3: 配置 OpenClaw

1. 打开 OpenClaw: http://localhost:18789
2. 进入 Plugin Settings
3. 添加插件：
   - **Path**: `你的项目路径/dist/openclaw-plugin.js`
   - **Type**: Personal Assistant
4. 保存并重启 OpenClaw

### 步骤 4: 开始使用

现在可以在 OpenClaw 中说：

| 自然语言 | 效果 |
|---------|------|
| "我喝了500ml水" | 记录喝水 |
| "我跑了30分钟" | 记录运动 |
| "我花了100元买咖啡" | 记录支出 |

## 端口配置

| 服务 | 端口 |
|------|------|
| Jiner API | 3001 |
| OpenClaw | 18789 |

## 日志查看

Jiner 日志关键标识：

- `[AI /nlu] Received message:` - 收到NLU请求
- `[AI /nlu] Intent parsed:` - 解析意图结果
- `[AI /nlu] Logging water/exercise/expense:` - 数据保存
- `[Jiner Plugin] === Capability Discovery ===` - 能力发现

## 故障排查

### 问题: OpenClaw 加载插件失败

检查：
1. `dist/openclaw-plugin.js` 是否存在
2. Node.js 版本是否 >= 18

### 问题: 说"喝水"没有反应

检查：
1. Jiner 服务是否运行在 3001 端口
2. AI Provider 是否已配置（访问 http://localhost:3001 配置）
3. 查看日志中是否有 `[AI /nlu] Received message`

### 问题: 端口被占用

```bash
# 查看端口占用
lsof -i :3001
lsof -i :18789

# 修改 Jiner 端口可编辑 start-jiner.sh
```
