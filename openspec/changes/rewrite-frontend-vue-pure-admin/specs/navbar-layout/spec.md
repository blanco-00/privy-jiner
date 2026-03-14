## ADDED Requirements

### Requirement: 顶部导航栏
顶部导航栏 SHALL 包含搜索、国际化、全屏、通知、用户菜单、系统设置等功能。

#### Scenario: 显示顶部导航栏
- **WHEN** 用户登录后进入系统
- **THEN** 顶部显示完整导航栏

#### Scenario: 用户菜单
- **WHEN** 用户点击头像
- **THEN** 显示下拉菜单（账户设置、退出登录）

### Requirement: 国际化切换
导航栏 SHALL 支持中英文切换。

#### Scenario: 切换语言
- **WHEN** 用户点击语言切换
- **THEN** 界面语言立即切换

### Requirement: 全屏切换
导航栏 SHALL 支持全屏切换功能。

#### Scenario: 进入全屏
- **WHEN** 用户点击全屏按钮
- **THEN** 页面进入全屏模式
