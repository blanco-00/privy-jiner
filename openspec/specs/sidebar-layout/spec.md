# sidebar-layout Specification

## Purpose
TBD - created by archiving change copy-vue-pure-admin-layout. Update Purpose after archive.
## Requirements
### Requirement: Sidebar displays navigation menu
The sidebar SHALL display a vertical navigation menu with collapsible sections and active state highlighting.

#### Scenario: Sidebar shows menu items
- **WHEN** user loads the dashboard
- **THEN** sidebar displays all navigation items grouped by category

#### Scenario: Sidebar collapses to icon-only mode
- **WHEN** user clicks collapse button
- **THEN** sidebar shrinks to 64px width showing only icons
- **AND** tooltips appear on hover showing menu labels

#### Scenario: Active menu item is highlighted
- **WHEN** user navigates to a page
- **THEN** the corresponding menu item is highlighted with accent color
- **AND** left border shows accent color

### Requirement: Sidebar logo displays correctly
The sidebar SHALL display a logo at the top that collapses gracefully.

#### Scenario: Logo visible in expanded mode
- **WHEN** sidebar is expanded
- **THEN** logo image and text "Privy-Jiner" are visible

#### Scenario: Logo hidden in collapsed mode
- **WHEN** sidebar is collapsed
- **THEN** logo is hidden, only collapse/expand button visible

### Requirement: 侧边栏菜单系统
侧边栏 SHALL 支持多级菜单配置，能够展示一级和二级菜单项。

#### Scenario: 显示侧边栏菜单
- **WHEN** 用户进入系统
- **THEN** 侧边栏显示所有一级菜单项

#### Scenario: 折叠/展开侧边栏
- **WHEN** 用户点击折叠按钮
- **THEN** 侧边栏收缩为图标模式，再次点击展开

#### Scenario: 展开子菜单
- **WHEN** 用户点击有子菜单的菜单项
- **THEN** 展开显示子菜单项

### Requirement: 侧边栏图标
侧边栏 SHALL 使用图标展示菜单项，参考 vue-pure-admin 的图标系统。

#### Scenario: 菜单图标显示
- **WHEN** 菜单项配置了图标
- **THEN** 显示对应的图标

### Requirement: 侧边栏折叠状态记忆
侧边栏 SHALL 记住用户的折叠偏好，刷新页面后保持状态。

#### Scenario: 状态持久化
- **WHEN** 用户折叠/展开侧边栏后刷新页面
- **THEN** 侧边栏保持用户上次选择的状态

