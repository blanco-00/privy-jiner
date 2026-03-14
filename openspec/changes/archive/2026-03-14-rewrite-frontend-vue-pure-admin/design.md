## Context

当前前端项目 `packages/web/src/` 使用自行搭建的 Vue 3 技术栈，存在以下问题：
- 组件样式不一致
- 目录结构不够清晰
- 缺乏成熟的管理后台最佳实践

vue-pure-admin 是一个成熟的开源中后台管理模板，采用最新的 Vue 3 + Vite + Element Plus + TypeScript + Pinia + Tailwindcss 技术栈，提供了完整的管理后台解决方案。

## Goals / Non-Goals

**Goals:**
- 完整迁移到 vue-pure-admin 技术栈
- 保持所有现有业务功能不变
- 采用专业的目录结构和组件组织方式
- 实现侧边栏、导航栏、标签页、主题切换、全局搜索、通知中心等核心布局功能

**Non-Goals:**
- 不改变后端 API 接口
- 不修改数据库 schema
- 不添加新的后端服务

## Decisions

### 1. 技术栈选择
**决策**: 完全采用 vue-pure-admin 的技术栈
- Vue 3.5 + TypeScript
- Vite 7.x 作为构建工具
- Element Plus 作为 UI 组件库
- Pinia 作为状态管理
- Tailwindcss 4.x 作为样式方案
- vue-router 5.x 作为路由方案

**备选方案**: 仅参考部分组件，保持现有技术栈
**选择理由**: 用户明确要求以 vue-pure-admin 为参考进行全面重构，整体迁移能确保一致性和质量

### 2. 目录结构
**决策**: 采用 vue-pure-admin 的目录结构
```
src/
├── api/          # API 接口
├── assets/       # 静态资源
├── components/  # 公共组件
├── config/      # 配置文件
├── directives/  # 指令
├── layout/      # 布局组件
├── plugins/     # 插件
├── router/      # 路由配置
├── store/       # 状态管理
├── style/       # 全局样式
├── utils/       # 工具函数
└── views/       # 页面组件
```

### 3. 样式方案
**决策**: 使用 Tailwindcss 作为主要样式方案
**备选方案**: 继续使用 SCSS
**选择理由**: vue-pure-admin 使用 Tailwindcss，生态更丰富

### 4. 布局实现
**决策**: 参考 vue-pure-admin 的布局实现
- 使用 `layout/index.vue` 作为主布局
- 使用 `layout/components` 包含侧边栏、导航栏、标签页等
- 保持与现有功能模块的对应关系

## Risks / Trade-offs

- **样式重构风险**: 原有组件样式可能与 Tailwindcss 冲突 → 解决方案：完全重写组件样式
- **功能适配风险**: 部分自定义功能可能需要额外适配 → 解决方案：按需实现，确保核心功能可用
- **依赖过多**: vue-pure-admin 依赖较多 → 解决方案：按需引入，只保留必要依赖
