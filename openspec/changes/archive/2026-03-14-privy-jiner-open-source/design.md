# Design: Privy-Jiner Open Source Architecture

## Context

瑾儿私人管家系统目前运行在 OpenClaw 环境下，数据存储分散（MySQL + Markdown 文件），功能模块耦合度高。系统主要服务于个人使用场景，现有测试数据无关紧要。

**当前状态：**
- 后端：Spring Boot 3.2.0 + MySQL 8.0（财务管理）
- 前端：HTML + CSS + Vanilla JS（简单 Dashboard）
- 通讯：OpenClaw Gateway（QQ Bot）
- 数据存储：MySQL 数据库 + Markdown 文件（TASKS.md、记忆等）
- 任务调度：OpenClaw Cron（定时触发）

**约束条件：**
- 必须支持独立部署（不依赖 OpenClaw）
- 必须兼容 OpenClaw 插件模式
- 所有代码开源（MIT 许可证）
- 数据必须本地化（不上传云端）
- 双仓库维护（GitHub + Gitee）
- 不需要任务调度功能（用户明确要求去掉）

**利益相关者：**
- 开源社区用户：需要易部署、易扩展的系统
- 插件开发者：需要清晰的插件接口和文档
- 用户：需要数据隐私保护和高性能体验

---

## Goals / Non-Goals

**Goals:**

1. **统一高效的架构**：独立模式和插件模式共享相同的核心代码和接口
2. **高性能数据存储**：使用 SQLite + WAL 模式，支持高并发读写
3. **模块化设计**：核心框架与功能模块解耦，可独立使用
4. **高可扩展性**：插件系统允许第三方开发者扩展功能
5. **数据隐私保护**：所有数据本地化存储，不上传云端
6. **零依赖部署**：独立模式无需额外安装数据库服务器
7. **双仓库自动化**：GitHub 和 Gitee 自动同步

**Non-Goals:**

1. **不提供任务调度功能**：系统不包含 Cron 或定时任务调度（用户明确要求）
2. **不提供多用户支持**：系统设计为个人使用场景
3. **不提供云端数据同步**：数据完全本地化，不上传到任何云端服务
4. **不提供实时协作**：系统不涉及多用户协作场景

---

## Decisions

### Decision 1: 混合模式架构

**选择：**
- 独立部署模式：系统可独立运行，不依赖 OpenClaw Gateway
- 插件模式：兼容 OpenClaw 插件接口，可一键安装

**理由：**
- 扩大用户覆盖面：既满足独立部署需求，又兼顾 OpenClaw 生态用户
- 代码复用：两种模式共享相同的核心代码，降低维护成本
- 市场验证：OpenClaw 生态快速增长（247K+ GitHub stars），垂直领域插件稀缺

**替代方案考虑：**
1. **仅独立部署**：放弃 OpenClaw 生态，用户覆盖面受限
2. **仅插件模式**：无法满足独立部署需求，灵活性不足
3. **两套独立代码**：维护成本高，功能不一致

**架构设计：**

```
┌─────────────────────────────────────────────────────────┐
│                   用户界面层                         │
│  Web Dashboard / CLI / API / OpenClaw Plugin        │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                 核心框架层                         │
│  Agent 协调器 | 任务管理 | 记忆管理 | 插件系统  │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼─────┐ ┌──▼──────┐ ┌─▼───────┐
│ 功能模块层   │ │ 数据层   │ │ 通讯层   │
│ 财务/健康   │ │ SQLite  │ │ WebSocket│
│ 时尚/知识   │ │         │ │ HTTP     │
│ 新闻       │ │         │ │          │
└─────────────┘ └─────────┘ └──────────┘
```

---

### Decision 2: AI 模型集成（第三方模型）

**选择：** 第三方模型接入架构，支持用户配置 API Key 接入 OpenAI、Claude 等模型

**重要限制：** 本地模型（如 LocalAI/Ollama）暂不接入，因为 OpenClaw 插件环境下无法工作

**理由：**

| 需求 | 方案 |
|------|------|
| **OpenClaw 插件兼容性** | 第三方模型 API 在插件模式下正常工作 |
| **模型选择灵活性** | 用户可自由选择 AI 模型（OpenAI、Claude 等） |
| **成本控制** | Token 消耗管理，用户可查看使用情况 |
| **简化部署** | 用户无需安装本地模型环境，只需配置 API Key |

**模型接入架构：**

```
┌─────────────────────────────────────────────────┐
│                   Web Dashboard                     │
│  (配置模型 | Token 管理 | 对话界面)         │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                 AI 集成层                         │
│  模型配置 | Token 计数 | 提示词管理        │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼─────┐ ┌──▼──────┐ ┌─▼───────┐
│ 文字交互层   │ │ 对话界面  │ │ 消息流    │
│ Chat UI      │ │          │ │          │
└─────────────┘ └──────────┘ └──────────┘
        │
        └────────────┴────────────┘
                     │
        ┌────────────▼────────────────────────────────┐
│           第三方模型提供商层                   │
│  OpenAI | Claude | 其他 API 服务          │
└────────────────────────────────────────────────────┘
```

**功能依赖：**
- **自然语言交互**（文字）：需要配置至少一个文字模型
- **Token 管理**：所有模型接入都启用（用于追踪成本）
- **对话界面**：需要配置至少一个模型
- **OpenClaw 插件优先**：主要作为 OpenClaw 插件部署，独立模式为辅

**部署模式优先级：**
1. **OpenClaw 插件模式**（主要）：利用 OpenClaw 的通讯渠道（QQ Bot、WebChat）
2. **独立部署模式**（次要）：提供自带的 WebSocket 服务器和 Web Dashboard

**语音功能说明：**
- **独立模式**：如果模型支持 STT/TTS，可以提供语音交互
- **插件模式**：语音功能可能受限（取决于 OpenClaw 插件能力），优先提供文字交互

---

### Decision 2.6: 插件数据库共享策略

**选择：** 混合模式 - 核心数据共享 + 插件数据隔离

**理由：**

| 需求 | 共享数据库 | 完全隔离 | 混合模式（推荐） |
|--------|-----------|-----------|--------------|
| **数据安全** | ❌ 插件可互相访问 | ✅ 完全隔离 | ✅ 核心共享，插件隔离 |
| **配置复杂度** | ✅ 简单 | ❌ 每个插件指定路径 | ✅ 插件默认隔离，核心无需配置 |
| **卸载复杂度** | ❌ 需判断表归属 | ✅ 删除文件即可 | ✅ 提示用户选择处理方式 |
| **核心功能共享** | ✅ 自然共享 | ❌ 可能重复 | ✅ 核心数据统一 |

**混合模式架构：**

```
~/.privy-jiner/
├── data/
│   ├── core.db              # 核心共享（用户配置、token、插件列表、事件）
│   └── plugins/
│       ├── finance.db      # 财务插件独有
│       ├── health.db       # 健康插件独有
│       ├── fashion.db      # 时尚插件独有
│       └── ...
```

**插件 Manifest 扩展：**
```json
{
  "id": "finance-plugin",
  "name": "Finance Module",
  "database": {
    "mode": "isolated",    // "isolated" | "shared"
    "path": "~/.privy-jiner/data/plugins/finance.db"
  }
}
```

**数据库模式说明：**

| 数据类型 | 存储位置 | 访问权限 |
|----------|-----------|----------|
| 用户配置 | core.db | 所有模块可读 |
| Token 记录 | core.db | 所有模块可读 |
| 插件列表 | core.db | 所有模块可读 |
| 财务数据 | plugins/finance.db | 仅财务插件 |
| 健康数据 | plugins/health.db | 仅健康插件 |
| 插件间通信 | events 表（core.db）| 通过事件总线 |

**插件卸载策略：**
```
用户卸载插件时提示：
1. 删除数据（删除 plugins/xxx.db）
2. 保留数据（保留数据库文件，后续可重新安装）
3. 归档数据（备份后归档，保留 7 天）
```

**跨插件数据交换：**
- 通过事件总线交换（需要发布事件订阅）
- 严格权限控制（事件发布者声明数据权限）
- 日志审计（记录所有跨插件数据访问）

---

### Decision 2.7: 核心共享数据表结构

**选择：** 独立部署模式支持多种数据库类型，用户可自由选择

**理由：**

| 维度 | SQLite | MySQL/PostgreSQL |
|------|--------|----------------|
| **部署复杂度** | 零依赖，开箱即用 | 需要安装数据库服务器 |
| **性能（个人场景）** | WAL 模式支持高并发 | 性能更强，适合大流量 |
| **数据隐私** | 单文件存储，完全本地化 | 需要服务器配置，但数据仍可本地化 |
| **适用场景** | 单用户、数据量 < 10GB | 多用户、数据量 > 10GB、复杂事务 |

**数据库配置策略：**

```
用户配置文件：
{
  "database": {
    "type": "sqlite",        // "sqlite" | "mysql" | "postgresql"
    "sqlite": {
      "path": "~/.privy-jiner/data/butler.db"
    },
    "mysql": {
      "host": "localhost",
      "port": 3306,
      "database": "privy_jiner",
      "user": "root",
      "password": "encrypted"
    },
    "postgresql": {
      "host": "localhost",
      "port": 5432,
      "database": "privy_jiner",
      "user": "postgres",
      "password": "encrypted"
    }
  }
}
```

**数据库抽象层设计：**

```typescript
// 统一数据库接口
interface Database {
  query(sql: string, params?: any[]): Promise<any[]>;
  execute(sql: string, params?: any[]): Promise<void>;
  transaction<T>(callback: (db) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

// SQLite 实现
class SQLiteDatabase implements Database {
  // 使用 better-sqlite3
}

// MySQL 实现
class MySQLDatabase implements Database {
  // 使用 mysql2/promise
}

// PostgreSQL 实现
class PostgreSQLDatabase implements Database {
  // 使用 pg
}

// 数据库工厂
class DatabaseFactory {
  static create(config: DatabaseConfig): Database {
    switch(config.type) {
      case 'sqlite': return new SQLiteDatabase(config.sqlite);
      case 'mysql': return new MySQLDatabase(config.mysql);
      case 'postgresql': return new PostgreSQLDatabase(config.postgresql);
    }
  }
}
```

**部署模式区分：**

| 模式 | 默认数据库 | 可选数据库 |
|------|----------|----------|
| **OpenClaw 插件模式** | SQLite | ❌ 仅 SQLite（确保轻量化）|
| **独立部署模式** | SQLite | ✅ SQLite/MySQL/PostgreSQL |

**迁移支持：**
- 提供 MySQL → SQLite 数据迁移脚本
- 提供 PostgreSQL → SQLite 数据迁移脚本
- 支持从现有系统导入数据
 
---

### Decision 2.6: 插件数据库共享策略

**选择：** 混合模式 - 核心数据共享 + 插件数据隔离

**理由：**

| 需求 | 共享数据库 | 完全隔离 | 混合模式（推荐） |
|--------|-----------|-----------|--------------|
| **数据安全** | ❌ 插件可互相访问 | ✅ 完全隔离 | ✅ 核心共享，插件隔离 |
| **配置复杂度** | ✅ 简单 | ❌ 每个插件指定路径 | ✅ 插件默认隔离，核心无需配置 |
| **卸载复杂度** | ❌ 需判断表归属 | ✅ 删除文件即可 | ✅ 提示用户选择处理方式 |
| **核心功能共享** | ✅ 自然共享 | ❌ 可能重复 | ✅ 核心数据统一 |

**混合模式架构：**

```
~/.privy-jiner/
├── data/
│   ├── core.db              # 核心共享（用户配置、token、插件列表、事件）
│   └── plugins/
│       ├── finance.db      # 财务插件独有
│       ├── health.db       # 健康插件独有
│       ├── fashion.db      # 时尚插件独有
│       └── ...
```

**插件 Manifest 扩展：**
```json
{
  "id": "finance-plugin",
  "name": "Finance Module",
  "database": {
    "mode": "isolated",    // "isolated" | "shared"
    "path": "~/.privy-jiner/data/plugins/finance.db"
  }
}
```

**数据库模式说明：**

| 数据类型 | 存储位置 | 访问权限 |
|----------|-----------|----------|
| 用户配置 | core.db | 所有模块可读 |
| Token 记录 | core.db | 所有模块可读 |
| 插件列表 | core.db | 所有模块可读 |
| 财务数据 | plugins/finance.db | 仅财务插件 |
| 健康数据 | plugins/health.db | 仅健康插件 |
| 插件间通信 | events 表（core.db）| 通过事件总线 |

**插件卸载策略：**
```
用户卸载插件时提示：
1. 删除数据（删除 plugins/xxx.db）
2. 保留数据（保留数据库文件，后续可重新安装）
3. 归档数据（备份后归档，保留 7 天）
```

**跨插件数据交换：**
- 通过事件总线交换（需要发布事件订阅）
- 严格权限控制（事件发布者声明数据权限）
- 日志审计（记录所有跨插件数据访问）

---

### Decision 2.7: 核心共享数据表结构

**共享表（core.db）：**

```sql
-- 用户配置
CREATE TABLE user_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- AI 模型配置
CREATE TABLE ai_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,        -- openai, claude, etc.
  model_name TEXT NOT NULL,
  api_key TEXT NOT NULL,         -- encrypted
  capabilities TEXT NOT NULL,     -- text, voice, both
  is_default INTEGER DEFAULT 0,
  enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Token 消耗记录
CREATE TABLE token_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id INTEGER,
  tokens INTEGER NOT NULL,
  cost REAL,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES ai_models(id)
);

-- 插件列表
CREATE TABLE plugins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id TEXT NOT NULL,
  plugin_name TEXT NOT NULL,
  version TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  database_mode TEXT DEFAULT 'isolated',  -- isolated | shared
  database_path TEXT,
  installed_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 事件总线记录（跨插件通信）
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  source_plugin TEXT,
  payload TEXT,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

### Decision 3: 数据库选型 - SQLite vs MySQL（仅 OpenClaw 插件模式）

**选择：** SQLite 作为主数据库，MySQL 仅作为财务管理模块的可选扩展

**理由：**

| 维度 | SQLite | MySQL |
|------|--------|-------|
| **部署复杂度** | 零依赖，开箱即用 | 需要安装数据库服务器 |
| **数据隐私** | 单文件存储，完全本地化 | 需要服务器配置 |
| **性能（个人场景）** | WAL 模式支持高并发 | 性能过剩 |
| **备份迁移** | 复制文件即可 | 需要导出导入 |
| **跨平台** | 支持 macOS/Linux/Windows | 需要适配 |
| **并发写入** | WAL 模式支持并发 | 支持高并发 |

**SQLite 适用于以下场景：**
- 个人使用场景（单用户）
- 数据量 < 10GB
- 不需要复杂事务
- 不需要多用户协作

**MySQL 适用于以下场景（可选）：**
- 财务管理模块需要复杂事务
- 未来扩展到多用户场景
- 数据量 > 10GB

**迁移策略：**
1. 核心框架、健康、时尚、知识、新闻模块：完全迁移到 SQLite
2. 财务管理模块：默认使用 SQLite，可选支持 MySQL
3. 提供数据迁移脚本，将现有 MySQL 数据迁移到 SQLite

---

### Decision 5: 插件系统设计

**选择：** 标准化的插件接口 + 生命周期管理

**插件接口定义：**

```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;

  // 生命周期钩子
  onLoad?(context: PluginContext): Promise<void>;
  onUnload?(): Promise<void>;

  // 能力定义
  capabilities: PluginCapability[];

  // 事件监听
  onEvent?(event: Event): Promise<void>;
}

interface PluginContext {
  config: PluginConfig;
  database: Database;
  eventBus: EventBus;
  logger: Logger;
}
```

**插件分类：**

| 类型 | 说明 | 示例 |
|------|------|------|
| 功能插件 | 提供具体功能模块 | 财务管理、健康追踪 |
| 数据源插件 | 提供外部数据接口 | 新闻 API、天气服务 |
| 通讯插件 | 提通讯渠道 | QQ Bot、Telegram Bot |
| UI 插件 | 扩展界面 | 自定义 Dashboard 组件 |

**插件市场设计：**
- 官方插件仓库：GitHub + Gitee
- 社区插件提交：Pull Request + 代码审查
- 插件评分系统：用户评分 + 下载量统计

---

### Decision 6: 事件驱动架构

**选择：** 模块间通过事件总线解耦，避免直接依赖

**事件总线设计：**

```typescript
// 发布事件
eventBus.emit('task:completed', { taskId, result });

// 订阅事件
eventBus.on('task:completed', async (data) => {
  await notificationService.send(data);
});
```

**事件类型：**

| 事件名称 | 说明 | 订阅者 |
|----------|------|--------|
| `task:created` | 任务创建 | 通知服务、日志服务 |
| `task:completed` | 任务完成 | 通知服务、统计服务 |
| `user:login` | 用户登录 | 安全审计、日志服务 |
| `data:changed` | 数据变更 | 备份服务、缓存服务 |

**优势：**
- 模块解耦：新增功能无需修改现有代码
- 易于测试：可以模拟事件进行单元测试
- 异步处理：避免阻塞主线程

---

### Decision 7: 数据隐私保护

**选择：** 所有数据本地化存储，不上传云端

**数据分类：**

| 数据类型 | 存储方式 | 加密策略 |
|----------|----------|----------|
| 用户配置 | JSON 文件 | 不加密（用户可控） |
| 核心数据 | SQLite 数据库 | 可选加密（用户配置） |
| 敏感信息 | 环境变量 | 不存储在代码中 |
| 日志文件 | 本地文件 | 滚动清理（7天） |

**配置文件示例：**

```json
{
  "database": {
    "path": "~/.privy-jiner/data/butler.db",
    "encryption": "aes-256"
  },
  "secrets": {
    "apiKeys": {
      "openai": "sk-xxxxx",
      "anthropic": "sk-ant-xxxxx"
    }
  }
}
```

**备份策略：**
- 自动备份：每日 23:00 备份到 `~/.privy-jiner/backup/`
- 手动备份：一键导出数据（SQLite + 配置文件）
- 版本管理：保留最近 7 天的备份，7 天前的压缩归档

---

### Decision 8: 双仓库维护（手动提交）

**选择：** 手动提交到两个仓库（GitHub + Gitee）

**仓库地址：**
- GitHub 主仓库：`https://github.com/blanco-00/privy-jiner`（国际社区）
- Gitee 镜像仓库：`https://gitee.com/232911373/privy-jiner`（国内社区）

**提交流程：**
1. 修改代码或文档后，先提交到 GitHub
2. 手动拉取 GitHub 更新到本地
3. 手动推送到 Gitee 镜像仓库

**说明：**
- 不提供自动化同步功能
- 由开发者手动维护两个仓库的一致性
- GitHub 和 Gitee 内容应保持同步

---

## Risks / Trade-offs

### Risk 1: SQLite 并发性能不足

**风险：** SQLite 在高并发写入场景下可能出现性能瓶颈

**缓解措施：**
- 使用 WAL 模式提升并发性能
- 批量写入替代单条写入
- 对于高并发场景，提示用户使用 MySQL（财务管理模块可选）

---

### Risk 2: 数据迁移失败

**风险：** 从 MySQL 迁移到 SQLite 可能出现数据丢失或格式错误

**缓解措施：**
- 提供完整的数据迁移脚本
- 迁移前自动备份 MySQL 数据
- 迁移后验证数据完整性
- 提供回滚方案（SQLite → MySQL）

---

### Risk 3: 插件兼容性

**风险：** 第三方插件可能与新版本不兼容

**缓解措施：**
- 插件接口版本化（semver）
- 提供迁移指南和兼容性测试工具
- 官方插件优先适配新版本

---

### Trade-off 1: 性能 vs 易部署性

**权衡：** SQLite 性能低于 MySQL，但部署更简单

**决策：** 选择易部署性，个人场景下 SQLite 性能足够

---

### Trade-off 2: 功能丰富度 vs 开源速度

**权衡：** 过多功能会增加开源时间和复杂度

**决策：** 分阶段开源，先开源核心功能，社区驱动扩展

---

## Migration Plan

### 阶段 1：核心框架重构（Week 1-2）

1. **代码迁移**
   - 从 `~/.openclaw/workspace/projects/butler-system/` 提取核心框架代码
   - 模块化重构：Agent 协调器、任务管理、记忆管理
   - 插件系统实现：定义接口、生命周期管理

2. **数据库迁移**
   - 设计 SQLite 数据库表结构
   - 编写数据迁移脚本（MySQL → SQLite）
   - 测试迁移脚本（使用现有测试数据）

3. **独立部署支持**
   - 移除 OpenClaw Gateway 依赖
   - 实现自带的 WebSocket 服务器
   - 实现 Web Dashboard（独立模式）

---

### 阶段 2：功能模块重构（Week 3-4）

1. **财务管理模块**
   - 迁移到 SQLite（默认）
   - 保留 MySQL 支持（可选）
   - 重构 API 接口

2. **健康管理模块**
   - 迁移到 SQLite
   - 重构为独立模块

3. **时尚管理模块**
   - 迁移到 SQLite
   - 实现穿搭推荐算法

4. **知识推送模块**
   - 迁移到 SQLite
   - 实现推送逻辑

5. **新闻管理模块**
   - 迁移到 SQLite
   - 实现新闻分析算法

---

### 阶段 3：OpenClaw 插件集成（Week 5）

1. **插件接口实现**
   - 实现 OpenClaw 插件接口
   - 配置 `openclaw.plugin.json`

2. **双模式适配**
   - 检测运行模式（独立/插件）
   - 动态加载不同通讯层

3. **测试**
   - 独立模式测试
   - OpenClaw 插件模式测试

---

### 阶段 4：双仓库初始化（Week 6）

1. **Gitee 镜像仓库初始化**
   - 在 Gitee 创建镜像仓库
   - 验证仓库可访问

2. **文档补充**
   - 补充双仓库维护说明
   - 更新 README 添加 Gitee 链接

---

### 阶段 5：开源发布（Week 7）

1. **清理敏感信息**
   - 移除 API Key、凭证
   - 生成测试数据（替代现有测试数据）

2. **文档完善**
   - 用户手册
   - 开发文档
   - API 文档
   - 快速开始指南

3. **发布**
   - 发布 npm 包（@privy-jiner/core）
   - 提交到 GitHub
   - 手动提交到 Gitee
   - 发布公告（博客、社区）

---

### 回滚策略

如果开源过程中出现问题：
1. **代码回滚**：使用 Git 恢复到之前的提交
2. **数据回滚**：使用备份恢复 MySQL 数据
3. **配置回滚**：恢复到之前的配置文件
4. **文档回滚**：回滚到之前的文档版本

---

## Open Questions

1. **财务管理模块是否默认支持 MySQL？**
   - 当前决策：默认 SQLite，可选 MySQL
   - 需要确认：是否完全移除 MySQL 依赖？

2. **插件是否需要代码审查？**
   - 当前决策：社区插件需要 Pull Request + 代码审查
   - 需要确认：是否允许自动发布插件？

3. **是否需要提供 Docker 镜像？**
   - 当前决策：未包含 Docker 镜像
   - 需要确认：是否提供 Docker 化部署方案？

4. **是否需要桌面应用？**
   - 当前决策：仅提供 Web Dashboard
   - 需要确认：是否需要 Electron 桌面应用？

---

**Next Steps**: 本设计文档完成后，将创建规范文档（specs），然后制定实施任务清单（tasks.md）。
