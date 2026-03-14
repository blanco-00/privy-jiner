## ADDED Requirements

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
