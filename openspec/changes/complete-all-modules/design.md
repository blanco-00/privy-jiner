## Context

当前 Privy-Jiner 系统已实现基础的财务和健康追踪功能，但功能不完整。用户希望参考 8081 端口的系统来完善所有功能。

### 当前状态
- **已完成**: 基础收支记录、分类管理、喝水/运动记录
- **未完成**: 预算管理、投资追踪、定期账单、报表、时尚、知识、新闻、AI集成

### 约束
- 使用 SQLite 作为本地数据库
- 保持模块化架构，支持插件扩展
- 前后端分离架构
- 支持中英文国际化

## Goals / Non-Goals

**Goals:**
1. 完善财务模块 - 预算、投资、账单、报表
2. 完善健康模块 - 提醒、目标、报告
3. 实现时尚模块 - 衣橱、穿搭
4. 实现知识模块 - 每日推送
5. 实现新闻模块 - 聚合推荐
6. 实现AI集成 - 对话接口

**Non-Goals:**
- 不实现复杂的多用户系统
- 不实现云端同步 (保持本地隐私)
- 不实现支付功能

## Decisions

### 1. 模块架构
每个功能模块独立，使用统一的服务层模式:
- `FinanceService` - 扩展支持预算、投资、账单
- `HealthService` - 扩展支持提醒、目标
- `FashionService` - 新建
- `KnowledgeService` - 新建
- `NewsService` - 新建

**理由**: 参考8081系统，功能清晰分类，便于维护和扩展

### 2. 数据库设计
使用 SQLite + better-sqlite3，保持事务支持:
- 财务表: finance_budgets, finance_investments, finance_bills
- 健康表: health_reminders, health_goals  
- 时尚表: fashion_items, fashion_outfits
- 知识表: knowledge_items
- 新闻表: news_articles

**理由**: 个人使用SQLite足够，better-sqlite3支持同步API

### 3. 前端页面设计
参考8081系统设计:
- 仪表盘: 综合展示所有模块关键指标
- 财务管理: 卡片式布局，ECharts图表
- 健康管理: 进度环、图表
- 侧边栏导航

**理由**: 8081系统经过用户验证，交互良好

### 4. API 设计
RESTful 风格，与现有API保持一致:
- GET /summary - 获取汇总数据
- GET /reports - 获取报表
- POST /export - 导出CSV

**理由**: 与现有Finance/Health API风格统一

## Risks / Trade-offs

### Risk: 功能范围过大
→ **Mitigation**: 分阶段实现，先完成核心功能

### Risk: SQLite 并发
→ **Mitigation**: 个人使用场景下单用户OK

### Risk: 前端页面复杂度
→ **Mitigation**: 使用组件化开发，复用现有组件

### Risk: 新闻模块数据源
→ **Mitigation**: 先实现本地新闻管理，后续可接入API

## Migration Plan

1. **Phase 1**: 完善财务模块 (预算、投资、账单)
2. **Phase 2**: 完善健康模块 (提醒、目标)
3. **Phase 3**: 实现时尚模块
4. **Phase 4**: 实现知识模块
5. **Phase 5**: 实现新闻模块
6. **Phase 6**: AI集成

每个Phase独立可测试，逐步上线。
