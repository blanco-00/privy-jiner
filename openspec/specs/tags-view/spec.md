# tags-view Specification

## Purpose
TBD - created by archiving change copy-vue-pure-admin-layout. Update Purpose after archive.
## Requirements
### Requirement: Tags view shows open pages as tabs
The tags view SHALL display all open pages as scrollable tabs.

#### Scenario: New page adds tab
- **WHEN** user navigates to a new page
- **THEN** a new tab is added to the tags view
- **AND** active tab is highlighted

#### Scenario: Tab shows active page
- **WHEN** user is on a page
- **THEN** corresponding tab is visually highlighted as active

### Requirement: Tags view has scroll buttons
The tags view SHALL have left/right scroll buttons when tabs overflow.

#### Scenario: Scroll buttons appear when tabs overflow
- **WHEN** there are more tabs than can fit
- **THEN** left and right scroll buttons appear
- **AND** clicking scrolls the tab list

### Requirement: Tags view has context menu
Right-clicking a tab SHALL show a context menu with close options.

#### Scenario: Context menu shows on right-click
- **WHEN** user right-clicks on a tab
- **THEN** context menu appears with: Refresh, Close, Close Others, Close All

#### Scenario: Close current tab
- **WHEN** user clicks "Close" in context menu
- **THEN** tab is removed
- **AND** user navigates to previous tab if closing active tab

#### Scenario: Close other tabs
- **WHEN** user clicks "Close Others"
- **THEN** all tabs except current are closed
- **AND** current tab remains and is navigated to

### Requirement: 标签页视图
系统 SHALL 支持多标签页显示，用户可以在多个页面间快速切换。

#### Scenario: 显示标签页
- **WHEN** 用户打开多个页面
- **THEN** 顶部显示所有已打开页面的标签

#### Scenario: 切换标签页
- **WHEN** 用户点击标签页
- **THEN** 切换到对应页面

#### Scenario: 关闭标签页
- **WHEN** 用户点击标签页关闭按钮
- **THEN** 关闭对应标签页

#### Scenario: 刷新当前页
- **WHEN** 用户右键选择刷新
- **THEN** 刷新当前页面

#### Scenario: 关闭其他标签页
- **WHEN** 用户右键选择关闭其他
- **THEN** 保留当前页和首页，关闭其他标签页

