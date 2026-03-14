# Proposal: Simplify Deployment

## Problem Statement

当前部署过于复杂:
1. 需要配置数据库类型(SQLite/MySQL/PostgreSQL)
2. OpenClaw插件模式下仍然尝试初始化自己的数据库
3. 多模块架构增加了部署难度
4. 缺乏一键部署能力

## Proposed Solution

简化部署策略:
1. **默认SQLite** - 开箱即用,无需配置
2. **OpenClaw模式** - 完全使用宿主数据库,无独立存储
3. **单文件/镜像部署** - Docker一键启动
4. **零配置** - 默认值满足大多数场景

## Goals

- 部署步骤从5步减少到1步
- 80%用户场景无需任何配置
- OpenClaw插件体积减少50%

## Out of Scope

- 高级数据库集群配置
- 多租户支持
- 大规模分布式部署
