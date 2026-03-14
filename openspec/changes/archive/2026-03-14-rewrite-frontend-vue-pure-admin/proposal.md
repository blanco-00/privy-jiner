## Why

当前前端代码存在设计缺陷和质量问题，需要以专业的 [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin) 管理后台为参考模板进行全面重构。参考项目本地路径: `/Users/hannah/git/vue-pure-admin/`。使用成熟的开源模板可以确保代码质量、一致性和可维护性。

## What Changes

- **删除现有前端代码**: 完全移除 `packages/web/` 整个前端项目的所有文件（这是唯一的前端目录，包含 Vue 组件和页面）
- **重写前端架构**: 参考 `/Users/hannah/git/vue-pure-admin/` 的目录结构和组织方式重新实现
- **保持功能不变**: 所有现有功能模块（Dashboard、Schedule、Tasks、Contacts、Finance、Health、Fashion、Knowledge、News、Chat、Profile、Settings、Plugins、Monitor）必须保留
- **采用现代最佳实践**: 使用 vue-pure-admin 的组件库、路由组织、状态管理、样式规范

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->
- `sidebar-layout`: 侧边栏布局 - 参考 `/Users/hannah/git/vue-pure-admin/src/layout/components/lay-sidebar/` 的侧边栏折叠、菜单配置、图标系统
- `navbar-layout`: 顶部导航栏 - 参考 `/Users/hannah/git/vue-pure-admin/src/layout/components/lay-navbar/` 的导航栏布局、用户菜单、主题切换
- `tags-view`: 标签页视图 - 参考 `/Users/hannah/git/vue-pure-admin/src/layout/components/lay-tag/` 的多标签页切换、缓存策略
- `theme-switching`: 主题切换 - 参考 `/Users/hannah/git/vue-pure-admin/src/layout/hooks/useDataThemeChange.ts` 的深色/浅色主题、主题色配置
- `global-search`: 全局搜索 - 参考 `/Users/hannah/git/vue-pure-admin/src/layout/components/lay-search/` 的命令面板式搜索
- `notice-center`: 通知中心 - 参考 `/Users/hannah/git/vue-pure-admin/src/layout/components/lay-notice/` 的消息通知系统

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `dashboard`: UI 组件样式和布局方式完全重构
- `schedule-management`: UI 组件样式和布局方式完全重构
- `tasks-management`: UI 组件样式和布局方式完全重构
- `contacts-management`: UI 组件样式和布局方式完全重构
- `finance-module`: UI 组件样式和布局方式完全重构
- `health-module`: UI 组件样式和布局方式完全重构
- `fashion-module`: UI 组件样式和布局方式完全重构
- `knowledge-module`: UI 组件样式和布局方式完全重构
- `news-module`: UI 组件样式和布局方式完全重构
- `profile-management`: UI 组件样式和布局方式完全重构
- `plugin-system`: UI 组件样式和布局方式完全重构
- `ai-integration` (chat): UI 组件样式和布局方式完全重构
- `monitor`: UI 组件样式和布局方式完全重构（新增）
- `settings`: UI 组件样式和布局方式完全重构（新增）
- `login`: UI 组件样式和布局方式完全重构（新增）

## Impact

- **受影响代码**: `packages/web/` 整个前端目录（这是项目唯一的前端代码）
- **不受影响**: `packages/ai/` (后端AI服务)、`packages/core/` (后端核心)、`packages/modules/` (共享业务模块)、`packages/i18n/` (国际化)
- **依赖变更**: 可能需要添加/调整 npm 依赖以匹配 vue-pure-admin
- **API 无变化**: 后端 API 保持不变
- **数据模型无变化**: 数据库 schema 保持不变
