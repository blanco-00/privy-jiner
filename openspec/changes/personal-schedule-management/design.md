## Context

当前 Privy-Jiner 系统已有财务、健康、时尚、知识、新闻模块。作为个人管家，需要增加个人信息管理、人际关系管理和日程任务管理功能。这些是秘书的核心功能，帮助用户高效管理生活。

## Goals / Non-Goals

**Goals:**
1. 个人信息管理 - 身高体重、健康档案
2. 联系人管理 - 朋友生日、关系分组
3. 日程管理 - 日历视图、事件提醒
4. 任务管理 - 待办列表、优先级

**Non-Goals:**
- 不实现多用户系统（单人使用）
- 不实现复杂的时间管理（GTD）
- 不实现社交分享功能

## Decisions

### 1. 数据存储
使用 SQLite 存储所有数据，与现有模块保持一致。

### 2. 提醒系统
整合现有的 health-reminders，创建统一的提醒机制：
- 日程提醒
- 任务截止提醒
- 联系人生日提醒

### 3. 前端UI
参考 8081 系统设计：
- 日历组件（使用现有 Chart.js 或简单实现）
- 卡片式联系人列表
- 任务看板布局

### 4. API 设计
RESTful 风格，与现有 API 统一：
- GET/POST/PUT/DELETE 资源操作
- 批量操作支持

## Risks / Trade-offs

### Risk: 日历UI复杂度
→ 使用简化版日历，先实现核心功能

### Risk: 重复日程计算
→ 使用 RRULE 风格简化处理

### Risk: 提醒触发
→ 暂时通过前端轮询，后续可接后台任务

## Migration Plan

Phase 1: Profile + Contacts 模块
Phase 2: Schedule 模块  
Phase 3: Tasks 模块
Phase 4: UI 完善和测试
