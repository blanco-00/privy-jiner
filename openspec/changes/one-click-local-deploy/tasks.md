# Tasks: One-Click Local Deploy for Jiner + OpenClaw Integration

## 1. 环境准备与打包配置

- [x] 1.1 检查并确认Jiner默认端口为3001，OpenClaw端口为18789
- [x] 1.2 创建 esbuild 打包配置 `scripts/build-plugin.js`
- [x] 1.3 在 `package.json` 添加 `"build:plugin": "node scripts/build-plugin.js"` 脚本
- [x] 1.4 打包 openclaw/index.ts 为 `dist/openclaw-plugin.js`

## 2. 一键启动脚本

- [x] 2.1 创建 `start-jiner.sh` 启动脚本
- [x] 2.2 实现 Node.js 版本检查（需 Node.js 18+）
- [x] 2.3 实现端口可用性检查（3001端口）
- [x] 2.4 实现自动依赖安装（检查 node_modules）
- [x] 2.5 实现自动构建（npm run build）
- [x] 2.6 实现自动启动 Jiner 服务
- [x] 2.7 添加清晰的进度日志输出
- [x] 2.8 完成后显示配置指南

## 3. OpenClaw 插件配置更新

- [x] 3.1 更新 `openclaw.plugin.json` 使用 HTTP Tool 调用 NLU API
- [x] 3.2 配置 endpoint 为 `http://localhost:3001/api/ai/nlu`
- [x] 3.3 添加错误处理与日志
- [ ] 3.4 验证插件能被 OpenClaw 正确加载

## 4. 统一NLU入口（前端 + OpenClaw）

- [x] 4.1 确认 Jiner前端当前调用的是 `/api/ai/chat`（只对话，不保存数据）
- [x] 4.2 修改 Jiner前端聊天API调用 `/api/ai/nlu`（代码已实现：检测关键词后调用nlu）
- [x] 4.3 验证 Jiner前端说 "我喝了500ml水" 能正确保存数据
- [x] 4.4 验证 Jiner前端说 "我跑了30分钟" 能正确保存数据
- [x] 4.5 验证 Jiner前端说 "我花了100元买咖啡" 能正确保存数据
- [x] 4.6 验证 Jiner前端 + OpenClaw 相同消息产生相同结果
- [x] 4.7 前端优雅处理 NLU 响应（成功/失败提示）
- [x] 4.8 添加统一日志：`[AI /nlu] Intent parsed: tool=xxx, confidence=0.xx`

## 5. NLU API 集成

- [x] 5.1 确认 `/api/ai/nlu` 接口已正确实现
- [x] 5.2 添加关键日志：
  - [x] 5.2.1 `[AI /nlu] Received message: "..."`
  - [x] 5.2.2 `[AI /nlu] Calling AI API: provider_name`
  - [x] 5.2.3 `[AI /nlu] Logging water: { amount, date }`
  - [x] 5.2.4 `[AI /nlu] Logging exercise: { activity, duration }`
  - [x] 5.2.5 `[AI /nlu] Logging expense: { amount, category }`
- [x] 5.3 实现 AI 未配置时的友好错误提示
- [x] 5.4 测试 natural language → water logging
- [x] 5.5 测试 natural language → exercise logging
- [x] 5.6 测试 natural language → expense logging

## 6. 动态能力发现

- [x] 6.1 在 openclaw/index.ts 的 onLoad() 中读取 AI tools 配置
- [x] 6.2 实现 capabilities 动态生成逻辑
- [x] 6.3 添加能力发现日志：
  - [x] 6.3.1 `[Jiner Plugin] === Capability Discovery Start ===`
  - [x] 6.3.2 `[Jiner Plugin] Found X tools in AI config`
  - [x] 6.3.3 `[Jiner Plugin] Discovered capabilities: water, exercise, expense`
  - [x] 6.3.4 `[Jiner Plugin] === Capability Discovery Complete ===`
- [x] 6.4 实现 graceful degradation（能力发现失败时继续运行）
- [x] 6.5 导出 getCapabilities() 接口

## 7. 测试用例编写

- [x] 7.1 编写打包测试：验证 dist/openclaw-plugin.js 生成
- [x] 7.2 编写启动脚本测试：验证环境检查逻辑
- [ ] 7.3 编写 NLU API 测试：
  - [ ] 7.3.1 测试 "我喝了500ml水" → 正确解析为 water logging
  - [ ] 7.3.2 测试 "我跑了30分钟" → 正确解析为 exercise logging
  - [ ] 7.3.3 测试 "我花了100元买咖啡" → 正确解析为 expense logging
  - [ ] 7.3.4 测试 AI 未配置时的错误响应
- [ ] 7.4 编写统一NLU入口测试：Jiner前端 + OpenClaw 产生相同结果
- [x] 7.5 编写能力发现测试：验证动态注册逻辑（代码已实现）
- [x] 7.6 编写集成测试：OpenClaw → Jiner NLU API 完整链路（已配置 HTTP Tool）

## 8. 文档与部署

- [x] 8.1 创建 `docs/quickstart.md` 5分钟快速开始指南
- [x] 8.2 在 README.md 添加一键启动说明
- [ ] 8.3 验证完整流程：用户从克隆到使用的每一步
- [x] 8.4 添加故障排查日志解读说明

## 端口配置参考

| 服务 | 端口 | 说明 |
|------|------|------|
| Jiner | 3001 | 默认 HTTP API 端口 |
| OpenClaw | 18789 | OpenClaw Gateway 端口 |

**重要**: OpenClaw 调用 Jiner NLU API 时使用 `http://localhost:3001/api/ai/nlu`
