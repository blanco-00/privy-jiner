## Context

**当前状态**:
- 系统以 OpenClaw 插件模式部署，监听来自 Gateway 的消息
- 用户发送自然语言消息（如"我喝了500ml水"）时，NLU 解析器能正确识别 `health_log_water` 工具并提取参数
- 但 `OpenClawPlugin.getTools()` 中定义的 handlers 只是返回 `{ success: true }`，没有真正执行业务逻辑

**约束**:
- 插件模式使用共享数据库（`data/privy-jiner.db`）
- 需要保持向后兼容，不能破坏独立模式
- MVP 阶段只实现喝水记录，不包含运动等其他健康数据

## Goals / Non-Goals

**Goals**:
- 打 通 NLU → Tool Handler → HealthManager → SQLite 的完整调用链
- 用户在 OpenClaw 聊天框输入"我喝了Xml水"能正确写入数据库
- 返回有意义的响应（成功/失败/错误信息）

**Non-Goals**:
- 不实现运动记录 (`health_log_exercise`) 的端到端打通
- 不修改前端 UI
- 不添加新的 API endpoint
- 不实现复杂的错误重试机制

## Decisions

### D1: 在 OpenClawPlugin 中直接注入 Database 和 Manager 实例

**选择理由**:
- 最简单直接，不需要引入依赖注入框架
- 与现有代码风格一致（`HealthManager` 已在 `main.ts` 中实例化）
- 避免过度工程

**替代方案**:
- 方案 B: 使用依赖注入框架（如 tsyringe）- 引入额外依赖，MVP 阶段不必要
- 方案 C: 通过事件总线通信 - 增加复杂度，不适合同步调用场景

### D2: 复用现有的 HealthManager 类

**选择理由**:
- `HealthManager` 已实现完整的数据库 Schema 初始化 (`initSchema()`)
- 提供 `logWater()` 方法，接口清晰
- 无需重新设计数据模型

### D3: Tool handler 返回结构化响应

**选择格式**:
```json
{
  "success": true,
  "action": "health_log_water",
  "data": {
    "id": "uuid",
    "amount": 500,
    "unit": "ml",
    "date": "2026-03-16"
  }
}
```

**选择理由**:
- 便于 OpenClaw Gateway 解析和处理
- 与现有返回格式保持一致

## Risks / Trade-offs

| 风险 | 影响 |  Mitigation |
|------|------|-------------|
| 插件模式下 Database 未初始化 | handler 调用时 crash | 在 `onLoad()` 中确保 Database 已初始化 |
| NLU 解析错误（提取不到水量） | 返回解析失败提示 | NLU threshold 检查，低于阈值时返回友好错误 |
| 数据库写入失败 | 用户不知道记录失败 | try-catch 包装，返回具体错误信息 |

## Migration Plan

1. **部署步骤**:
   - 编译新版本 `npm run build`
   - 重启服务（如在独立模式）或重新加载插件（如在插件模式）
   - 测试流程: 发送 "我喝了500ml水" → 检查数据库 `water_logs` 表

2. **回滚方案**:
   - 回滚代码到上一版本
   - 不需要数据迁移（只增不减）

## Open Questions

- [x] 插件模式下数据库初始化时机 - 已确认在 `main.ts` 中处理
- [ ] 是否需要支持语音输入 - MVP 阶段不在范围
- [ ] 是否需要推送通知（如喝水提醒）- 不在当前范围
