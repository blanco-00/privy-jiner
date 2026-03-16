# Proposal: One-Click Local Deploy for Jiner + OpenClaw Integration

## Why

当前Jiner系统的部署流程繁琐，开源用户需要手动配置多项内容才能将Jiner与OpenClaw集成。用户希望在OpenClaw中通过自然语言与Jiner交互（如"我喝了500ml水"），Jiner能理解意图并自动保存数据。这个需求需要打通OpenClaw插件与Jiner NLU API的完整链路，并提供一键部署体验。

## What Changes

1. **打包Jiner为OpenClaw插件** - 生成`dist/openclaw-plugin.js`，用户只需在OpenClaw配置插件路径即可
2. **一键启动脚本** - 创建`start-jiner.sh`脚本，自动安装依赖、构建、启动Jiner服务
3. **配置OpenClaw调用Jiner NLU API** - 更新插件配置，使OpenClaw识别Jiner能力并调用`/api/ai/nlu`接口
4. **统一NLU入口** - Jiner前端聊天页面和OpenClaw都调用同一个`/api/ai/nlu`接口，实现相同的数据保存效果
5. **自动能力发现** - Jiner启动时自动注册能力描述到插件元数据，OpenClaw自动识别新增功能
6. **文档简化** - 创建简明的"5分钟快速开始"文档

## 统一NLU架构说明

### 核心目标
- **Jiner前端说"我喝了500ml水"** → 调用`/api/ai/nlu` → 解析意图 → 保存到健康模块
- **OpenClaw说"我喝了500ml水"** → 调用`/api/ai/nlu` → 解析意图 → 保存到健康模块
- 两者调用**同一个接口**，产生**相同效果**

### 调用链路
```
Jiner前端聊天页面 
    ↓ POST /api/ai/nlu {message: "我喝了500ml水"}
Jiner后端 (NLU解析 + 服务调用)
    ↓ healthService.logWater(500, date)
SQLite数据库
```

```
OpenClaw聊天框
    ↓ POST http://localhost:3001/api/ai/nlu {message: "我喝了500ml水"}
Jiner后端 (NLU解析 + 服务调用)
    ↓ healthService.logWater(500, date)
SQLite数据库
```

### 当前问题
- Jiner前端调用的是 `/api/ai/chat` 接口，该接口只做AI对话，不解析意图，不保存数据
- 需要修改Jiner前端调用 `/api/ai/nlu` 接口，或改造 `/chat` 接口使其具备NLU能力

## Capabilities

### New Capabilities

- **openclaw-plugin-packaging**: 将Jiner核心代码打包为OpenClaw可加载的插件格式
- **one-click-startup**: 一键启动脚本，自动完成环境检查、依赖安装、服务启动
- **nlu-api-integration**: OpenClaw通过HTTP调用Jiner的`/api/ai/nlu`接口实现自然语言交互
- **unified-nlu-entry**: 统一NLU入口，Jiner前端和OpenClaw都调用同一个接口，产生相同的数据保存效果
- **dynamic-capability-discovery**: Jiner运行时自动注册能力到插件元数据，支持热更新

### Modified Capabilities

- 无（现有spec无需修改）

## Impact

- **代码变更**: 
  - `packages/core/src/openclaw/` - 插件入口和打包配置
  - `packages/web/src/api/ai.ts` - 前端API调用（改为调用/nlu）
  - `packages/web/src/views/*/ai-chat*` - 前端聊天页面
- **新增文件**: 
  - `start-jiner.sh` - 一键启动脚本
  - `openclaw.plugin.json` - 插件配置（已存在，需更新）
- **API变更**: 
  - Jiner前端聊天改为调用 `/api/ai/nlu` 而非 `/api/ai/chat`
  - 两者效果一致：自然语言解析 + 结构化数据保存
- **文档更新**: `docs/quickstart.md` - 5分钟快速开始指南
