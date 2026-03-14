# Proposal: Privy-Jiner Dashboard UI Redesign V2

## Why

当前 Privy-Jiner 后台 UI 存在以下问题：

1. **布局不够专业** - 缺少现代 admin 面板的典型布局元素（tags 导航、面包屑、全局搜索）
2. **主题系统不完善** - 虽然有 CSS variables，但缺少运行时主题切换能力
3. **组件复用不足** - 各页面样式不一致，缺少统一的设计系统
4. **移动端体验差** - 响应式设计不完整
5. **AI 助手特性缺失** - 作为个人 AI 助手，缺少专门的 Chat 界面优化

通过对 vue-element-admin、vue-pure-admin、vue-admin-better 等成熟 admin 模板的研究，我们总结出了最佳实践并应用于本次重新设计。

## What Changes

### 1. 布局升级 (Layout Enhancement)

采用 vue-pure-admin 和 vue-element-admin 的经典布局模式：
- **固定侧边栏** (可折叠: 210px → 54px)
- **固定顶栏** (60px height, 含面包屑和操作按钮)
- **多标签页导航** (TagsView，支持页面缓存)
- **右侧设置面板** (主题切换、布局配置)

### 2. 主题系统增强 (Theme System)

参考 vue-pure-admin 的主题架构：
- **8 套预设主题** (亮色/暗色/紫/粉/红/橙/青/绿)
- **CSS Variables 完整覆盖**
- **运行时主题切换** (无需刷新)
- **深色模式原生支持**
- **主题持久化** (localStorage)

### 3. 组件库完善 (Component Library)

基于现有组件升级：
- **PageHeader** - 页面标题 + 面包屑 + 操作区
- **Card** - 多种变体 (stat/content/form/list)
- **StatCard** - 仪表盘统计卡片
- **EmptyState** - 空状态展示
- **SearchModal** - 全局搜索 (Ctrl+K)
- **ThemePicker** - 主题选择器

### 4. 响应式优化 (Responsive)

参考 vue-admin-better 的响应式策略：
- **移动端自动切换** (< 768px)
- **移动端侧边栏抽屉模式**
- **触摸友好的交互**

### 5. AI 助手特性 (AI Assistant Features)

专为个人 AI 助手定制：
- **Chat 页面优化** - 消息气泡、输入框、Markdown 渲染
- **快捷指令面板** - 常用 AI 命令
- **全局 AI 触发** - 随时唤起 AI 对话

## Capabilities

- `layout-vertical` - 经典左侧导航布局
- `layout-horizontal` - 顶部导航布局
- `theme-dynamic` - 动态主题切换
- `theme-dark` - 深色模式
- `tabs-view` - 多标签页导航
- `search-global` - 全局搜索 (Ctrl+K)
- `sidebar-collapsible` - 侧边栏折叠

## Out of Scope

- 后端 API 改动
- 数据库结构改动
- 权限系统 (单用户场景不需要)

## Research References

- vue-element-admin: https://github.com/PanJiaChen/vue-element-admin
- vue-pure-admin: https://github.com/pure-admin/vue-pure-admin
- vue-admin-better: https://github.com/zxwk1998/vue-admin-better
