# Tasks: Simplify Deployment

## 1. OpenClaw Plugin - No Local Database

- [x] 1.1 Modify OpenClawPlugin to skip database initialization in plugin mode
- [x] 1.2 Add method to access Gateway's database connection
- [x] 1.3 Remove DatabaseManager from plugin constructor

## 2. Authentication

### 2.1 Optional Local Account
- [x] 2.1.1 Add local user model in database
- [x] 2.1.2 Create login page UI
- [x] 2.1.3 Implement local auth (simple password hash)
- [x] 2.1.4 Add "no login needed" option for local use

### 2.2 OpenClaw Plugin Auth
- [x] 2.2.1 Add shared secret to openclaw.plugin.json
- [x] 2.2.2 Implement token verification in plugin
- [x] 2.2.3 Add X-Plugin-Secret header validation
- [x] 2.2.4 Get user info from Gateway token

## 3. Default Configuration

- [x] 3.1 Change default port to 3001
- [x] 3.2 Set SQLite as default (no config needed)

## 4. Cross-Platform Deployment

### 4.1 Cross-Platform Binaries (推荐)
- [x] 4.1.1 Add pkg to package.json for single-file build
- [x] 4.1.2 Create .github/workflows/build.yml
- [x] 4.1.3 Configure build for: Windows, macOS, Linux
- [x] 4.1.4 Add release automation
- [x] 4.1.5 Test build produces working exe

### 4.2 npm (全平台)
- [ ] 4.2.1 Publish to npm
- [ ] 4.2.2 Test npx privy-jiner works

### 4.3 Homebrew (Mac)
- [ ] 4.3.1 Create Homebrew formula
- [ ] 4.3.2 Test brew install

### 4.4 Docker
- [x] 4.4.1 Create optimized Dockerfile

## 5. Database Switching UI

### 5.1 Database Settings Page
- [x] 5.1.1 Add database settings page in Dashboard
- [x] 5.1.2 Add MySQL connection form
- [x] 5.1.3 Add PostgreSQL connection form
- [x] 5.1.4 Show current database status
- [x] 5.2.1 Create API: POST /api/database/initialize
- [x] 5.3.1 Create API: POST /api/database/test
- [x] 5.3.2 Test MySQL connection
- [x] 5.3.3 Test PostgreSQL connection

### 5.4 Migration Scripts
- [x] 5.4.1 SQLite → MySQL migration script
- [x] 5.4.2 SQLite → PostgreSQL migration script

## 6. Documentation

- [x] 6.1 5分钟上手指南 (中文)
- [x] 6.2 下载安装教程

---

## 用户体验

### 小白用户:
```
1. 去 Releases 下载 exe
2. 双击运行
3. 打开浏览器 http://localhost:8080
4. 开始使用!
```

### 需要MySQL的用户:
```
1. 打开设置 → 数据库
2. 填写MySQL信息
3. 点击"测试连接" → 成功
4. 点击"初始化数据库"
5. 完成!
```
