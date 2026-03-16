# Privy-Jiner 私人管家

Personal AI Assistant - Open Source Edition

[English](#english) | [中文](#中文)

---

## English

### Overview

Privy-Jiner is an open-source personal AI assistant system designed for individual use. It supports both standalone deployment and OpenClaw plugin modes, providing features like finance management, health tracking, fashion recommendations, knowledge push, and news aggregation.

### Features

- **Core Framework**: Agent coordination, task management, memory system, event bus
- **AI Integration**: Support for OpenAI, Claude, and other third-party models
- **Modules**:
  - Finance: Income/expense tracking, budgets, investments
  - Health: Water intake, exercise tracking, health goals
  - Fashion: Wardrobe management, outfit recommendations
  - Knowledge: Daily knowledge push
  - News: Smart news aggregation and recommendations
- **Deployment**: Standalone mode or OpenClaw plugin
- **i18n**: Chinese and English support
- **Data Privacy**: Local SQLite storage, no cloud sync

### Quick Start

```bash
# Clone and start (recommended)
git clone https://github.com/blanco-00/privy-jiner.git
cd privy-jiner
./start-jiner.sh

# Configure AI (copy .env.example to .env and add your API key)
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

#### OpenClaw Integration

1. Run `./start-jiner.sh` to start Jiner service (port 3001)
2. Open OpenClaw at http://localhost:18789
3. Add plugin: `path/to/privy-jiner/dist/openclaw-plugin.js`
4. Say "我喝了500ml水" to log water!

### Documentation

- [Quick Start](./docs/quickstart.md) - 5分钟快速部署
- [User Manual](./docs/manual.md)
- [API Reference](./docs/api.md)
- [Plugin Development](./docs/plugin-dev.md)

### Configuration

Copy `.env.example` to `.env` and configure your AI provider:

```bash
cp .env.example .env
```

### License

MIT License - see [LICENSE](./LICENSE)

### Mirror Repositories

- GitHub: https://github.com/blanco-00/privy-jiner
- Gitee: https://gitee.com/232911373/privy-jiner

---

## 中文

### 简介

jiner私人管家是一个开源的个人 AI 助手系统，专为个人使用场景设计。支持独立部署和 OpenClaw 插件模式，提供财务管理、健康追踪、时尚推荐、知识推送和新闻聚合等功能。

### 功能特性

- **核心框架**: Agent 协调器、任务管理、记忆系统、事件总线
- **AI 集成**: 支持 OpenAI、Claude 等第三方模型
- **功能模块**:
  - 财务: 收支记录、预算管理、投资组合
  - 健康: 喝水记录、运动追踪、健康目标
  - 时尚: 衣橱管理、穿搭推荐
  - 知识: 每日知识推送
  - 新闻: 智能新闻聚合与推荐
- **部署方式**: 独立部署模式或 OpenClaw 插件
- **国际化**: 支持中文和英文
- **数据隐私**: 本地 SQLite 存储，不上传云端

### 快速开始

```bash
# 克隆并一键启动（推荐）
git clone https://github.com/blanco-00/privy-jiner.git
cd privy-jiner
./start-jiner.sh

# 配置 AI（复制 .env.example 为 .env 并填入 API Key）
cp .env.example .env
# 编辑 .env 添加你的 OPENAI_API_KEY
```

### 文档

- [快速开始](./docs/quickstart.md) - 5分钟快速部署
- [用户手册](./docs/manual.md)
- [API 参考](./docs/api.md)
- [插件开发](./docs/plugin-dev.md)

### 配置

复制 `.env.example` 为 `.env` 并配置你的 AI Provider：

```bash
cp .env.example .env
```

### 许可证

MIT 许可证 - 见 [LICENSE](./LICENSE)

### 镜像仓库

- GitHub: https://github.com/blanco-00/privy-jiner
- Gitee: https://gitee.com/232911373/privy-jiner
