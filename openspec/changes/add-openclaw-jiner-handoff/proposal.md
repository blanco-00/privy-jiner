# Openclaw → Jiner 自然语言自动路由提案

## Why

当前 Openclaw 的 privy-jiner 插件需要用户显式调用 `jiner_nlu` 工具才能处理自然语言输入。用户必须知道系统的能力边界并主动触发，这违反了自然交互的设计目标。

当用户说"我喝了30ml水"或"这个月水电费多少钱"时，系统应该**自动识别意图**并路由到 jiner 处理，而不是等待显式工具调用。

## What Changes

1. **新增 Intent Router 组件**
   - 在 Openclaw Gateway 层实现意图识别
   - 支持配置化意图规则（关键字、正则、语义匹配）
   - 自动判定是否应该转交给 jiner 处理

2. **扩展 privy-jiner 插件能力**
   - 新增 capability: `nlu_handoff` - 自然语言自动路由
   - 声明支持的意图类型（health, finance, fashion, knowledge, task）
   - 提供意图分类 API 供 Gateway 调用

3. **配置化路由规则**
   - 在 `openclaw.json` 中配置意图映射
   - 支持关键字匹配: "喝水" → health
   - 支持语义分类: 调用 jiner NLU 判断意图

## Capabilities

### New Capabilities
- `intent-routing`: 意图自动识别与路由
  - 在 Gateway 层实现
  - 支持关键字 + 语义双模式
  - 可配置路由规则

### Modified Capabilities
- `privy-jiner` (existing): 扩展为支持自动路由模式
  - 新增 `nlu_handoff` capability
  - 提供意图分类端点

## Impact

- **受影响代码**:
  - `~/.openclaw/extensions/privy-jiner/` - 插件扩展
  - Openclaw Gateway - 意图路由层（需要确认是否可扩展）
  - 配置层 `openclaw.json` - 新增路由规则配置

- **依赖**:
  - 现有 privy-jiner 插件已实现的 NLU 端点
  - Openclaw Gateway 的插件扩展机制
