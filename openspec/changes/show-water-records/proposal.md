## Why

用户通过自然语言添加了喝水记录（如"我喝了100ml水"），数据已成功存储到数据库，但健康页面仍显示"正在开发中"，无法查看喝水状况。这导致用户无法看到自己每天的喝水数据，之前的自然语言记录功能也变得没有意义。

## What Changes

1. **实现喝水记录前端页面** - 将 `/health/water` 页面从"开发中"状态改为完整的功能页面
2. **添加喝水数据展示** - 显示今日喝水总量、喝水目标进度
3. **显示喝水历史记录** - 展示喝水记录列表（按日期分组）
4. **添加喝水目标设置** - 允许用户设置每日喝水目标（默认2000ml）
5. **添加日志追踪** - 在关键操作点添加console.log日志，方便问题排查
6. **编写测试用例** - 覆盖API调用、数据展示、交互功能

## Capabilities

### New Capabilities
- `water-records-display`: 喝水记录展示页面，包含今日统计和历史列表

### Modified Capabilities
- 无（现有health模块无前端实现）

## Impact

- **前端**: 修改 `packages/web/src/views/health/water/index.vue`
- **API**: 已有完整后端API (`/api/health/water`, `/api/health/summary`)
- **测试**: 需编写前端组件测试
