## 1. 基础设施 - Manager 依赖注入

- [x] 1.1 在 OpenClawPlugin 中添加 Database 实例属性
- [x] 1.2 在 OpenClawPlugin 中添加 HealthService 实例
- [x] 1.3 在 OpenClawPlugin 中添加 FinanceService 实例
- [x] 1.4 在 OpenClawPlugin 中添加 FashionService 实例
- [x] 1.5 修改 tool handlers，使用 manager 实例执行业务逻辑

## 2. Health 模块集成

- [x] 2.1 实现 health_log_water tool handler → 调用 HealthService.logWater()
- [x] 2.2 实现 health_log_exercise tool handler → 调用 HealthService.logExercise()
- [x] 2.3 实现 health_query tool handler → 调用 HealthService 查询方法

## 3. Finance 模块集成

- [x] 3.1 实现 finance_record tool handler → 调用 FinanceService.createTransaction()
- [x] 3.2 实现 finance_query tool handler → 调用 FinanceService.getTransactions()
- [x] 3.3 实现 finance_report tool handler → 调用 FinanceService.getSummary()

## 4. Fashion 模块集成

- [x] 4.1 实现 fashion_add_item tool handler → 调用 FashionService.createItem()
- [x] 4.2 实现 fashion_log_outfit tool handler → 调用 FashionService.logOutfit()
- [x] 4.3 实现 fashion_recommend tool handler → 调用 FashionService.getOutfits()

## 5. 构建验证

- [x] 5.1 TypeScript 编译通过
- [x] 5.2 所有模块正确导出

## 6. 未来扩展（无需改动核心逻辑）

当需要添加新模块时，只需：
- 在 NLU ToolDefinition 中注册新 keywords
- 在 OpenClawPlugin.getTools() 中添加新 tool
- 在 handler 中调用对应的 Service
