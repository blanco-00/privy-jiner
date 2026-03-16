## Why

jiner 私人管家的文档存在体验问题：新用户配置 API Key 困惑（散落在 config.json、CLI、文档多处）、端口号不一致（3000/3001/8080 混用）、缺少可视化指引。对比 Next.js、TensorFlow 等顶级 OSS 的"复制即用"文档模式，现有文档对新手不够友好。现在是改进文档质量的最佳时机——项目功能已稳定，用户增长需要更好的 onboarding 体验。

## What Changes

1. **统一端口配置规范** - 所有文档使用统一端口号（API: 3001, OpenClaw: 18789）
2. **添加 .env.example 模板** - 提供 API Key 配置的标准化起点
3. **重构 quickstart.md** - 改为"复制即用"模式，增加步骤编号和状态检查
4. **增加可视化指引** - 添加关键步骤的截图占位符和架构图
5. **优化 AI 配置流程** - 启动脚本支持 `--ai-key` 参数或启动后引导配置

## Capabilities

### New Capabilities

- `quickstart-overhaul`: 重构快速开始文档为业界最佳实践模式
- `env-template`: 提供 .env.example 模板简化 API Key 配置
- `visual-guides`: 添加关键步骤的可视化指引

### Modified Capabilities

- (无)

## Impact

- **文档文件**: docs/quickstart.md, README.md, docs/manual.md
- **配置文件**: 添加 .env.example
- **脚本文件**: start-jiner.sh（可选增强）
- **用户**: 新用户首次配置体验显著改善
