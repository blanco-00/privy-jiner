## Why

Privy-Jiner 作为个人管家，需要帮助用户管理个人信息，人际关系，日程安排。这些是秘书的核心职责，目前系统缺乏这些功能。用户需要一站式管理自己的健康档案、朋友生日、重要日程等。

同时，系统需要融入 AI 能力，支持通过自然语言对话方式操作系统，实现真正的智能管家体验。

## What Changes

### 个人信息管理 (Profile)
- 用户个人档案：身高，体重，生日、血型、过敏史等
- 健康档案：既往病史，体检记录
- 个人偏好设置

### 人际关系管理 (Contacts)
- 联系人管理：朋友、家人，同事等
- 重要日期：生日、纪念日、节日提醒
- 关系标签和分组

### 日程管理 (Schedule)
- 日程/事件创建：学习，工作，会议、约会等
- 重复日程：每日、每周、每月、年度
- 日程提醒：提前通知
- 日历视图：日/周/月视图

### 任务管理 (Tasks)
- 待办事项列表
- 任务优先级
- 任务状态：待办、进行中、已完成
- 截止日期和提醒

### AI 配置与对话 (AI Integration)
- AI 模型配置：支持 OpenAI、Claude 等
- API Key 管理
- AI Chat 界面：通过对话操作整个系统
- 自然语言理解：理解用户意图并执行操作

### 系统监控 (System Monitoring)
- 数据库监控：连接状态、查询性能、数据量
- 系统资源：CPU、内存、磁盘使用率
- API 使用统计：请求次数、响应时间
- AI 模型使用：调用次数、token 消耗、成本统计

## Capabilities

### New Capabilities
- `profile-management`: 用户个人信息管理
- `contacts-management`: 人际关系和联系人管理
- `schedule-management`: 日程和日历管理
- `tasks-management`: 任务和待办事项管理
- `ai-config`: AI 模型配置和 API 管理
- `ai-chat`: AI 对话界面，自然语言操作系统
- `system-monitoring`: 系统监控（数据库、资源、API、模型使用）

### Modified Capabilities
- `health-tracking`: 扩展健康模块，整合个人健康档案
- `health-reminders`: 扩展健康提醒，整合日程提醒

## Impact

### 新增 Package
- `packages/core/src/modules/profile/` - 个人信息模块
- `packages/core/src/modules/contacts/` - 联系人模块
- `packages/core/src/modules/schedule/` - 日程模块
- `packages/core/src/modules/tasks/` - 任务模块

### 新增数据库表
- `user_profiles` - 用户档案
- `contacts` - 联系人
- `contact_groups` - 联系人分组
- `schedules` - 日程
- `tasks` - 任务

### 前端页面
- `ProfilePage.vue` - 个人中心
- `ContactsPage.vue` - 联系人管理
- `SchedulePage.vue` - 日程日历
- `TasksPage.vue` - 任务管理
