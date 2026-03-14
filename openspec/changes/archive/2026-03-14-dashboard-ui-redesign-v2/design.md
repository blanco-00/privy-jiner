# Design: Privy-Jiner Dashboard UI Redesign V2

## Design System

### Color Palette

基于现有深色主题，增强为完整的主题系统：

```css
/* 主色调 - 金色/琥珀色 */
--color-primary: #e8a854;
--color-primary-hover: #f0b864;

/* 语义色 */
--color-success: #54e88a;
--color-danger: #e85454;
--color-warning: #e8b854;
--color-info: #54a8e8;

/* 深色主题 (类似 DeviantArt) */
--bg-primary: #0f0f0f;      /* 主背景 */
--bg-secondary: #1a1a1a;     /* 卡片背景 */
--bg-tertiary: #242424;      /* 悬停背景 */
--bg-elevated: #2a2a2a;     /* 浮层背景 */

/* 文字颜色 */
--text-primary: #f5f5f5;
--text-secondary: #888888;
--text-tertiary: #666666;
--text-disabled: #444444;

/* 边框 */
--border-primary: #333333;
--border-hover: #444444;
--border-focus: #e8a854;
```

### 主题预设 (8 套)

参考 vue-pure-admin：
1. **Light** - 亮色主题
2. **Dark (默认)** - 深色主题，类似 DeviantArt
3. **Purple** - 紫色主题
4. **Pink** - 粉红主题
5. **Red** - 红色主题
6. **Orange** - 橙色主题
7. **Cyan** - 青色主题
8. **Green** - 绿色主题

### Typography

```css
--font-xs: 11px;
--font-sm: 13px;
--font-base: 14px;
--font-md: 16px;
--font-lg: 18px;
--font-xl: 20px;
--font-2xl: 24px;
--font-3xl: 28px;
--font-4xl: 32px;
```

### Spacing

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

## Layout Components

### 主布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  Navbar (60px, fixed)                                      │
│  [≡] [面包屑 > 路径]              [🔍] [🌙] [⚙] [👤]     │
├─────────────────────────────────────────────────────────────┤
│ Tags Bar (34px, optional)  [Dashboard] [Chat] [Settings] + │
├────────────┬────────────────────────────────────────────┤
│            │                                             │
│  Sidebar   │   Main Content Area                         │
│  (210px)   │   (router-view)                            │
│            │                                             │
│  ┌──────┐ │   ┌─────────────────────────────────────┐ │
│  │ Logo  │ │   │ Page Header                          │ │
│  └──────┘ │   │ [Title] [Actions]                    │ │
│            │   ├─────────────────────────────────────┤ │
│  Personal  │   │                                     │ │
│  ├ Profile │   │  Content                             │ │
│  ├ Contacts│   │                                     │ │
│  └ Tasks  │   │                                     │ │
│            │   │                                     │ │
│  Life      │   │                                     │ │
│  └ Finance │   └─────────────────────────────────────┘ │
│            │                                             │
│  [◀]      │                                             │
└────────────┴────────────────────────────────────────────┘
```

### Sidebar 组件

- **宽度**: 210px (展开) / 54px (折叠)
- **折叠按钮**: 底部，点击切换
- **持久化**: localStorage 记住状态
- **图标**: SVG 图标，支持折叠后显示 tooltip
- **分组**: Personal / Life / System 三大组

### Navbar 组件

参考 vue-element-admin：
- **左侧**: 汉堡菜单 (侧边栏切换) + 面包屑
- **右侧**: 全局搜索 + 主题切换 + 全屏 + 用户菜单

### TagsView 组件

参考 vue-element-admin：
- **多标签页**: 支持打开多个页面
- **右键菜单**: 刷新 / 关闭 / 关闭其他
- **缓存**: keep-alive 缓存已访问页面
- **可配置**: 可开启/关闭

### ThemePicker 组件

- **位置**: Navbar 右侧 / 设置面板
- **样式**: 主题色块预览
- **切换**: 点击即时切换，无需刷新

### SearchModal 组件

- **触发**: Ctrl+K 或点击搜索图标
- **功能**: 搜索页面/命令
- **样式**: 居中 Modal，带模糊搜索

## 页面模板

### 1. 列表页 (ListPage)

```
┌─────────────────────────────────────────────┐
│ PageHeader                                  │
│ [Title] [Subtitle]           [+ Add] [⋯]  │
├─────────────────────────────────────────────┤
│ Filters                                     │
│ [🔍 Search] [Filter ▼] [Sort ▼]           │
├─────────────────────────────────────────────┤
│                                             │
│  Card / Table                               │
│  ┌─────────────────────────────────────┐   │
│  │ Item 1                    [⋮]      │   │
│  ├─────────────────────────────────────┤   │
│  │ Item 2                    [⋮]      │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│ Pagination                                   │
│ [<] [1] [2] [3] [>]  Total: 100          │
└─────────────────────────────────────────────┘
```

### 2. 仪表盘页 (DashboardPage)

```
┌─────────────────────────────────────────────┐
│ PageHeader                                  │
│ [Dashboard] [Welcome back!]                  │
├─────────────────────────────────────────────┤
│ Stats Row (4 columns)                       │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐   │
│ │ Stat1 │ │ Stat2 │ │ Stat3 │ │ Stat4 │   │
│ └───────┘ └───────┘ └───────┘ └───────┘   │
├─────────────────────────────────────────────┤
│ Content Grid                                │
│ ┌─────────────┐ ┌─────────────┐             │
│ │   Chart    │ │   Chart    │             │
│ └─────────────┘ └─────────────┘             │
│ ┌─────────────┐ ┌─────────────┐             │
│ │   Table     │ │   List     │             │
│ └─────────────┘ └─────────────┘             │
└─────────────────────────────────────────────┘
```

### 3. 聊天页 (ChatPage) - AI 助手特色

```
┌─────────────────────────────────────────────┐
│ PageHeader                                  │
│ [Chat] [AI Assistant]           [⚙️] [🗑️] │
├─────────────────────────────────────────────┤
│                                             │
│  Messages Area (scrollable)                 │
│  ┌─────────────────────────────────────┐   │
│  │ 🤖 AI Message                       │   │
│  │ Hi! How can I help you today?      │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ 👤 User Message                     │   │
│  │ I want to check my schedule...      │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│ Quick Commands                              │
│ [📅 Today's Schedule] [💰 Expenses] [...]  │
├─────────────────────────────────────────────┤
│ Input Area                                 │
│ [+] [                    ] [Send]         │
└─────────────────────────────────────────────┘
```

## 组件设计

### Card 组件

| 变体 | 用途 | 样式 |
|------|------|------|
| stat | 统计卡片 | 图标 + 数值 + 标签 |
| content | 内容卡片 | 标题 + 内容 + 底部 |
| form | 表单卡片 | 大内边距，分组 |
| list | 列表卡片 | 最小内边距 |

### StatCard 组件

```
┌──────────────────┐
│ 💰   $12,450    │
│    Total Income  │
│    ↑ 12%         │
└──────────────────┘
  ↑ Trend indicator
```

### EmptyState 组件

```
┌──────────────────┐
│                  │
│      📭          │
│                  │
│   No data yet    │
│   Get started    │
│  [+ Add Item]   │
│                  │
└──────────────────┘
```

## 响应式断点

```css
/* 移动端 */
@media (max-width: 768px) {
  .sidebar { position: fixed; z-index: 100; }
  .navbar { display: none; }
}

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar { width: 64px !important; }
}

/* 桌面 */
@media (min-width: 1025px) {
  .sidebar { width: 210px; }
}
```

## 动画与过渡

```css
/* 页面切换 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 侧边栏折叠 */
.sidebar-transition {
  transition: width 0.3s ease;
}
```

## 参考实现

| 特性 | 参考模板 | 实现位置 |
|------|----------|----------|
| 布局结构 | vue-element-admin | App.vue |
| TagsView | vue-element-admin | TagsView.vue |
| 主题系统 | vue-pure-admin | variables.css + ThemePicker |
| 侧边栏折叠 | vue-admin-better | Sidebar.vue |
| 响应式 | vue-admin-better | CSS Media Queries |
| 深色主题 | DeviantArt | variables.css |

## 实现文件清单

```
src/
├── components/
│   ├── Sidebar.vue          # 侧边栏导航
│   ├── Navbar.vue          # 顶部导航栏
│   ├── TagsView.vue        # 多标签页
│   ├── ThemePicker.vue      # 主题选择器
│   ├── SearchModal.vue      # 全局搜索
│   ├── PageHeader.vue       # 页面头部
│   ├── Card.vue             # 卡片组件
│   ├── StatCard.vue         # 统计卡片
│   ├── EmptyState.vue       # 空状态
│   └── icons/               # SVG 图标
├── pages/
│   ├── ChatPage.vue        # AI 聊天页 (优化)
│   └── ...
├── styles/
│   ├── variables.css        # CSS 变量 (已扩展)
│   └── transitions.css      # 过渡动画
└── App.vue                 # 主布局
```
