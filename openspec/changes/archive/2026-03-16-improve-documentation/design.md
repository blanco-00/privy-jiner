## Context

jiner 文档改进项目，目标是提升新用户的首次配置体验。当前问题：
- 端口号在 README(3000)、quickstart(3001)、manual(3000) 中不一致
- API Key 配置位置不明确（config.json / CLI / 文档）
- 缺少可视化的步骤指引
- 启动脚本不包含 API Key 配置流程

利益相关者：新用户、contributors、maintainers

## Goals / Non-Goals

**Goals:**
1. 统一所有文档的端口号为 API:3001, OpenClaw:18789
2. 添加 .env.example 模板，提供标准化配置起点
3. 重构 quickstart.md，实现"复制即用"模式
4. 增加可视化指引（截图占位符、架构图）

**Non-Goals:**
- 不修改核心代码逻辑
- 不添加新功能模块
- 不重构现有模块结构
- 不更改数据库 schema

## Decisions

### D1: 端口配置统一
- **决策**: API 服务统一使用 3001 端口，OpenClaw 使用 18789
- **理由**: 与 start-jiner.sh 脚本保持一致，避免用户困惑
- **备选**: 使用 3000 (标准 Node.js 端口) → 排除：与 start-jiner.sh 不一致

### D2: .env.example 内容
- **决策**: 提供最小化模板，只包含必需的配置项
- **内容**:
  ```
  OPENAI_API_KEY=your-api-key-here
  JINER_PORT=3001
  OPENCLAW_URL=http://localhost:18789
  ```
- **理由**: 最小化降低配置门槛，SQLite 默认足够

### D3: quickstart 结构
- **决策**: 采用"5秒→5分钟→深入"三段式结构
- **5秒**: 一行命令启动
- **5分钟**: 完整配置流程
- **深入**: 链接到 manual
- **理由**: 符合 Next.js、TensorFlow 等顶级 OSS 文档模式

### D4: 可视化方案
- **决策**: 使用 ASCII 架构图 + 截图占位符注释
- **理由**: 
  - ASCII 图可即时生成，无需设计资源
  - 截图占位符保留扩展性，后续可补充
  - 不阻塞文档改进进度

## Risks / Trade-offs

- [风险] 现有用户已熟悉当前端口配置 → 缓解：在迁移文档中说明
- [风险] .env 配置与 config.json 优先级不明确 → 缓解：文档中说明 .env 会覆盖 config.json
- [风险] 截图占位符看起来不完整 → 缓解：标注 "TODO: 添加截图" 并给出内容描述

## Migration Plan

1. **Phase 1**: 添加 .env.example 和端口统一（向后兼容）
2. **Phase 2**: 重构 quickstart.md
3. **Phase 3**: 更新 README 中的端口号
4. **Phase 4**: 添加架构图和截图占位符
5. **验证**: 用新文档流程引导一位未接触过 jiner 的用户

## Open Questions

- [ ] 启动脚本是否需要增加 `--ai-key` 参数支持？
- [ ] 是否需要添加 Docker 快速启动指南？
- [ ] 文档语言是否需要区分中文版和英文版独立文件？
