# Design: One-Click Local Deploy for Jiner + OpenClaw Integration

## Context

当前Jiner系统需要手动配置多项内容才能与OpenClaw集成：
1. 用户需要手动安装依赖、构建项目
2. 需要配置数据库路径、API端口
3. 需要手动在OpenClaw中配置插件路径和环境变量
4. OpenClaw目前使用Exec工具执行shell命令记录数据，未调用Jiner的NLU API

**目标用户**: 开源社区的开发者/普通用户，希望简单部署私人管家系统并通过OpenClaw交互

**约束**:
- 用户本地已有Node.js环境
- 用户已安装OpenClaw
- 用户需要自行准备大模型API Key

## Goals / Non-Goals

**Goals:**
1. 用户下载仓库后，只需运行一个命令即可启动Jiner服务
2. 用户只需在OpenClaw配置插件路径，即可自动发现Jiner能力
3. 用户在OpenClaw发送自然语言，OpenClaw自动调用Jiner的NLU API处理
4. Jiner新增功能后，无需修改OpenClaw配置，自动被发现

**Non-Goals:**
- 不提供大模型API Key的托管服务
- 不提供云端部署方案
- 不修改Jiner核心业务逻辑

## Decisions

### 1. 插件打包方案: 使用esbuild打包为单文件

**决定**: 使用esbuild将`packages/core/src/openclaw/`打包为`dist/openclaw-plugin.js`

**理由**:
- esbuild比webpack/rollup更快
- 打包后为单文件，易于分发
- 支持TypeScript原生

**替代方案考虑**:
- webpack: 打包速度慢，配置复杂
- rollup: 对TypeScript支持一般

### 2. 一键启动脚本: Bash脚本 + 内置检查

**决定**: 创建`start-jiner.sh`，包含：
- Node.js版本检查
- 依赖安装（如果node_modules不存在）
- 构建项目
- 启动服务
- 提示配置信息

**理由**:
- 兼容macOS/Linux/WSL
- 用户只需运行一个命令
- 提供清晰的进度反馈

### 3. OpenClaw插件配置: HTTP Tool调用NLU API

**决定**: 在`openclaw.plugin.json`中定义HTTP Tool，调用Jiner的`/api/ai/nlu`接口

**理由**:
- 使用OpenClaw原生HTTP Tool，无需Exec
- 符合OpenClaw插件开发规范
- 支持NLU能力：自然语言解析 + 服务调用

**配置示例**:
```json
{
  "tools": [
    {
      "name": "jiner_nlu",
      "description": "处理自然语言请求（喝水、运动、支出等）",
      "endpoint": "http://localhost:18788/api/ai/nlu",
      "method": "POST"
    }
  ]
}
```

### 4. 能力自动发现: 运行时注册

**决定**: Jiner启动时，从AI Service的配置中读取能力列表，动态生成插件元数据

**理由**:
- 新增能力只需在AI Service中配置keywords
- 无需手动更新插件配置
- 天然适配扩展

**实现方式**:
- 在`openclaw/index.ts`的`onLoad()`中读取AI tools配置
- 生成`capabilities`字段到插件元数据
- OpenClaw加载时自动发现

## Risks / Trade-offs

| 风险 | 描述 |  Mitigation |
|------|------|-------------|
| 端口冲突 | 18788端口可能被占用 | 启动脚本检测端口，提供备选端口 |
| 大模型配置 | 用户首次需要配置API Key | 启动后自动打开配置页面 |
| 网络隔离 | 用户可能在内网环境 | 支持离线模式（基础功能） |
| Windows兼容性 | Bash脚本不直接支持Windows | 提供PowerShell版本或WSL说明 |

## Migration Plan

### 用户升级路径（从现有版本）

1. 用户拉取最新代码
2. 运行`start-jiner.sh`
3. 脚本自动处理依赖和构建
4. 用户重新配置OpenClaw插件路径（指向新的dist目录）

### 回滚方案

- 如果新版本有问题，用户可以使用`git checkout`回滚到旧版本
- 旧版本的插件配置仍然有效

## Open Questions

1. **Q: 是否需要支持Docker部署？**
   - A: 暂时不在MVP范围内，但可以在文档中提及作为未来方向

2. **Q: 如何处理多语言（中文/英文）？**
   - A: NLU接口已经支持多语言关键词识别，OpenClaw侧无特殊处理

3. **Q: 是否需要认证机制？**
   - A: MVP阶段暂不添加，使用本地localhost访问。未来可考虑API Key认证
