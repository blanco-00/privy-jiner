# Implementation Tasks - Rewrite Frontend with vue-pure-admin

**参考项目路径**: `/Users/hannah/git/vue-pure-admin/`

## 1. Setup and Configuration

- [x] 1.1 删除现有前端项目 `packages/web/` 下所有文件（整个前端目录）
- [x] 1.2 复制 vue-pure-admin 的目录结构到 `packages/web/`
  - 参考: `/Users/hannah/git/vue-pure-admin/src/` 整个目录结构
- [x] 1.3 复制 vue-pure-admin 的 package.json 依赖配置并调整
  - 参考: `/Users/hannah/git/vue-pure-admin/package.json`
- [x] 1.4 复制配置文件
  - 参考: `/Users/hannah/git/vue-pure-admin/vite.config.ts`
  - 参考: `/Users/hannah/git/vue-pure-admin/tsconfig.json`
  - 参考: `/Users/hannah/git/vue-pure-admin/.env`, `.env.development`, `.env.production`
- [x] 1.5 安装依赖 `pnpm install`

## 2. Core Layout Structure (Reference: /Users/hannah/git/vue-pure-admin/src/layout/)

- [x] 2.1 创建 `src/layout/index.vue` 主布局组件
  - 参考: `/Users/hannah/git/vue-pure-admin/src/layout/index.vue`
- [x] 2.2 创建 `src/layout/components/lay-sidebar/` 侧边栏组件
  - 参考: `/Users/hannah/git/vue-pure-admin/src/layout/components/lay-sidebar/NavVertical.vue`
  - 参考: `/Users/hannah/git/vue-pure-admin/src/layout/components/lay-sidebar/components/SidebarItem.vue`
- [x] 2.3 创建 `src/layout/components/lay-navbar/` 导航栏组件
  - 参考: `/Users/hannah/git/vue-pure-admin/src/layout/components/lay-navbar/index.vue`
- [x] 2.4 创建 `src/layout/components/lay-tag/` 标签页组件
  - 参考: `/Users/hannah/git/vue-pure-admin/src/layout/components/lay-tag/index.vue`
- [x] 2.5 创建 `src/layout/components/lay-content/` 内容区组件
  - 参考: `/Users/hannah/git/vue-pure-admin/src/layout/components/lay-content/index.vue`
- [x] 2.6 创建 `src/layout/components/lay-setting/` 设置面板组件
  - 参考: `/Users/hannah/git/vue-pure-admin/src/layout/components/lay-setting/index.vue`

## 3. Layout Features

- [x] 3.1 实现侧边栏折叠/展开功能 (参考 vue-pure-admin 的 sidebar state management)
- [x] 3.2 实现侧边栏菜单图标系统（使用 @iconify/vue）
- [x] 3.3 实现侧边栏折叠状态记忆 (参考 `/Users/hannah/git/vue-pure-admin/src/utils/responsive-storage.ts`)
- [x] 3.4 实现导航栏用户菜单
- [x] 3.5 实现导航栏国际化切换（中文/英文）
  - 参考: `/Users/hannah/git/vue-pure-admin/src/plugins/i18n/`
- [x] 3.6 实现导航栏全屏切换
- [x] 3.7 实现标签页多页面切换
- [x] 3.8 实现标签页刷新、关闭、关闭其他功能

## 4. Theme and Search

- [x] 4.1 实现深色/浅色主题切换
  - 参考: `/Users/hannah/git/vue-pure-admin/src/layout/hooks/useDataThemeChange.ts`
- [x] 4.2 实现主题色配置
- [x] 4.3 实现主题偏好持久化（localStorage）
- [x] 4.4 实现全局搜索面板
  - 参考: `/Users/hannah/git/vue-pure-admin/src/layout/components/lay-search/index.vue`
- [x] 4.5 实现通知中心
  - 参考: `/Users/hannah/git/vue-pure-admin/src/layout/components/lay-notice/index.vue`

## 5. Router and Store (Reference: /Users/hannah/git/vue-pure-admin/src/router/, src/store/)

- [x] 5.1 配置 vue-router 路由系统
  - 参考: `/Users/hannah/git/vue-pure-admin/src/router/index.ts`
- [x] 5.2 创建 `src/router/modules/` 路由模块
  - 参考: `/Users/hannah/git/vue-pure-admin/src/router/modules/*.ts`
- [x] 5.3 配置 Pinia 状态管理
  - 参考: `/Users/hannah/git/vue-pure-admin/src/store/index.ts`
- [x] 5.4 创建 `src/store/modules/app.ts` 应用状态
  - 参考: `/Users/hannah/git/vue-pure-admin/src/store/modules/app.ts`
- [x] 5.5 创建 `src/store/modules/permission.ts` 权限状态
  - 参考: `/Users/hannah/git/vue-pure-admin/src/store/modules/permission.ts`
- [x] 5.6 创建 `src/store/modules/multiTags.ts` 标签页状态
  - 参考: `/Users/hannah/git/vue-pure-admin/src/store/modules/multiTags.ts`
- [x] 5.7 创建 `src/store/modules/user.ts` 用户状态
  - 参考: `/Users/hannah/git/vue-pure-admin/src/store/modules/user.ts`

## 6. Common Components (Reference: /Users/hannah/git/vue-pure-admin/src/components/)

- [x] 6.1 复制基础通用组件
  - 参考目录: `/Users/hannah/git/vue-pure-admin/src/components/`
  - 核心组件: ReDialog, ReDrawer, ReAuth (权限), RePerms
  - 增强组件: ReCountTo (数字动画), ReQrcode, ReBarcode
  - 图标组件: ReIcon (图标管理)
- [x] 6.2 创建 `src/components/ReIcon/` 图标组件
  - 参考: `/Users/hannah/git/vue-pure-admin/src/components/ReIcon/`
- [x] 6.3 复制 `src/components/ReIcon/src/offlineIcon.ts` 图标配置

## 7. Styles (Reference: /Users/hannah/git/vue-pure-admin/src/style/)

- [x] 7.1 复制全局样式文件
  - 参考目录: `/Users/hannah/git/vue-pure-admin/src/style/`
  - `src/style/index.scss` - 全局入口
  - `src/style/reset.scss` - 重置样式
  - `src/style/element-plus.scss` - Element Plus 定制
  - `src/style/dark.scss` - 深色主题样式
  - `src/style/theme.scss` - 主题配置
  - `src/style/sidebar.scss` - 侧边栏样式
  - `src/style/transition.scss` - 过渡动画
  - `src/style/tailwind.css` - Tailwind CSS
- [x] 7.2 复制登录页样式
  - 参考: `/Users/hannah/git/vue-pure-admin/src/style/login.css`

## 8. Utils and Plugins

- [x] 8.1 复制工具函数
  - 参考目录: `/Users/hannah/git/vue-pure-admin/src/utils/`
  - 重点: `src/utils/http/` (Axios 封装)
  - 重点: `src/utils/localforage.ts`
  - 重点: `src/utils/responsive-storage.ts`
  - 重点: `src/utils/progress.ts` (NProgress)
- [x] 8.2 配置插件
  - 参考目录: `/Users/hannah/git/vue-pure-admin/src/plugins/`
  - 重点: `src/plugins/i18n/` (国际化)
  - 重点: `src/plugins/index.ts`

## 9. Page Components - Core Pages

- [x] 9.1 重构 Dashboard 首页
  - 参考: `/Users/hannah/git/vue-pure-admin/src/views/welcome/index.vue`
- [x] 9.2 重构 Login 登录页
  - 参考: `/Users/hannah/git/vue-pure-admin/src/views/login/index.vue`
- [x] 9.3 重构 Profile 个人中心页
  - 参考: `/Users/hannah/git/vue-pure-admin/src/views/account-settings/index.vue`
- [x] 9.4 重构 Settings 设置页
  - 参考: `/Users/hannah/git/vue-pure-admin/src/views/account-settings/index.vue`

## 10. Page Components - Business Modules

- [x] 10.1 重构 Schedule 日程管理页
- [x] 10.2 重构 Tasks 任务管理页
- [x] 10.3 重构 Contacts 联系人页
- [x] 10.4 重构 Finance 财务模块页
- [x] 10.5 重构 Health 健康模块页
- [x] 10.6 重构 Fashion 时尚模块页
- [x] 10.7 重构 Knowledge 知识模块页
- [x] 10.8 重构 News 新闻模块页
- [x] 10.9 重构 Chat AI 对话页
  - 参考: `/Users/hannah/git/vue-pure-admin/src/views/chatai/index.vue`
- [x] 10.10 重构 Plugins 插件页
- [x] 10.11 重构 Monitor 监控页
  - 参考: `/Users/hannah/git/vue-pure-admin/src/views/monitor/index.vue`

## 11. Integration and Testing

- [x] 11.1 连接后端 API 接口
- [x] 11.2 测试所有页面功能
- [x] 11.3 修复样式问题
- [x] 11.4 构建测试 `pnpm build`
