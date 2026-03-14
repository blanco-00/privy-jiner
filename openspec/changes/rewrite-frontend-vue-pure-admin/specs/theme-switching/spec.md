## ADDED Requirements

### Requirement: 主题切换
系统 SHALL 支持深色/浅色主题切换，并记住用户偏好。

#### Scenario: 切换深色主题
- **WHEN** 用户点击深色主题
- **THEN** 界面切换为深色主题

#### Scenario: 切换浅色主题
- **WHEN** 用户点击浅色主题
- **THEN** 界面切换为浅色主题

#### Scenario: 主题偏好持久化
- **WHEN** 用户切换主题后刷新页面
- **THEN** 保持用户选择的主题

#### Scenario: 主题色配置
系统 SHALL 支持用户自定义主题色。

#### Scenario: 选择主题色
- **WHEN** 用户选择主题色
- **THEN** 界面主题色立即变化
