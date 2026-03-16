## Why

用户希望在 OpenClaw 聊天框中通过自然语言（如"我喝了500ml水"）直接记录饮水数据到本地系统。目前系统已具备以下组件：
- `HealthManager`: 提供 `logWater()` 方法用于记录饮水
- `NLUService`: 能解析自然语言并提取关键参数（水量）
- `OpenClawPlugin`: 声明了 `health_log_water` 工具

但这些组件**未连接**，tool handlers 只是返回空成功响应，没有真正调用业务逻辑。导致用户无法通过聊天框记录饮水数据。

## What Changes

1. **修复 tool handlers**: 将 `OpenClawPlugin.getTools()` 中的 handlers 改为真正调用 `HealthManager` 实例
2. **注入依赖**: 在 `OpenClawPlugin` 中注入 `Database` 和 `HealthManager` 实例
3. **配置 NLU 链路**: 确保 NLU 解析结果能正确路由到对应的 tool handler
4. **修复数据库初始化**: 插件模式下正确初始化 SQLite 数据库连接

## Capabilities

### New Capabilities
- `openclaw-water-logging`: 通过 OpenClaw 聊天框的自然语言记录饮水数据

### Modified Capabilities
- (无) 现有 spec 无需求变更

## Impact

修改文件：
- `packages/core/src/openclaw/index.ts` - 修复 tool handlers，注入 HealthManager
- `packages/core/src/main.ts` - 在插件加载时注入依赖

依赖：
- `packages/modules/health/src/index.ts` - HealthManager 类
- `packages/ai/src/nlu.ts` - NLU 服务

涉及系统：
- OpenClaw Gateway 通信
- 本地 SQLite 数据库
