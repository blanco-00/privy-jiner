## Why

当前 Privy-Jiner 系统规划了很多功能，但实际实现很少。用户需要一个完整的个人管家系统，包括财务、健康、时尚、知识、新闻等功能。目前只有基础的收支记录和运动记录，缺少预算管理、投资追踪、报表、健康提醒等核心功能，与规划差距很大。

## What Changes

### Finance Module 完善
- 添加预算管理 (Budget) - 按分类/月份设置预算，追踪支出
- 添加投资组合追踪 - 股票、基金、保险、黄金等投资记录
- 添加定期账单管理 -  recurring bills 自动提醒
- 添加财务报表 - 月度总结、分类报表
- 添加 CSV 导出功能

### Health Module 完善
- 添加健康提醒 - 喝水、运动定时提醒
- 添加健康目标追踪 - 每日/每周目标
- 添加健康周报/月报

### Fashion Module 实现
- 衣橱管理 - 衣服添加、分类
- 穿搭记录 - 每日穿搭记录
- 穿搭推荐 - 基于天气、场合的推荐

### Knowledge Module 实现
- 每日知识推送
- 知识库管理

### News Module 实现
- 新闻聚合
- 新闻推荐

### AI Integration 实现
- AI 对话接口
- Agent 协调器

## Capabilities

### New Capabilities
- `finance-budget`: 预算管理，按分类和月份设置预算
- `finance-investment`: 投资组合追踪，股票基金保险等
- `finance-bills`: 定期账单管理，自动提醒
- `finance-reports`: 财务报表生成和导出
- `health-reminders`: 健康提醒系统
- `health-goals`: 健康目标追踪
- `fashion-wardrobe`: 衣橱管理
- `fashion-outfit`: 穿搭记录与推荐
- `knowledge-daily`: 每日知识推送
- `news-aggregation`: 新闻聚合与推荐
- `ai-integration`: AI 对话和 Agent 协调

### Modified Capabilities
- `finance-tracking`: 扩展现有财务追踪功能 (已部分实现)
- `health-tracking`: 扩展现有健康追踪功能 (已部分实现)

## Impact

### 新增 Package
- `packages/modules/fashion` - 时尚模块
- `packages/modules/knowledge` - 知识模块
- `packages/modules/news` - 新闻模块
- `packages/ai` - AI 集成 (已存在)

### 修改 Package
- `packages/core` - 扩展 FinanceService, HealthService
- `packages/web` - 新增页面和组件

### 数据库
- 新增 finance_budgets 表
- 新增 finance_investments 表
- 新增 finance_bills 表
- 新增 health_reminders 表
- 新增 health_goals 表
- 新增 fashion_items 表
- 新增 fashion_outfits 表
- 新增 knowledge_items 表
- 新增 news_articles 表
