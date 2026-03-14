# Tasks: Complete All Modules

## 1. Finance - Budget Management

- [x] 1.1 Add finance_budgets table migration
- [x] 1.2 Create Budget model interface
- [x] 1.3 Implement FinanceService.budget methods (create, get, update, delete, getByCategory)
- [x] 1.4 Add budget spent amount auto-update on expense creation
- [x] 1.5 Add budget API routes (GET/POST/PUT/DELETE /api/finance/budgets)
- [x] 1.6 Add budget progress calculation

## 2. Finance - Investment Tracking

- [x] 2.1 Add finance_investments table migration
- [x] 2.2 Create Investment model interface
- [x] 2.3 Implement FinanceService.investment methods (create, get, update, delete, getSummary)
- [x] 2.4 Add profit/loss calculation logic
- [x] 2.5 Add investment API routes (GET/POST/PUT/DELETE /api/finance/investments)
- [x] 2.6 Add investment summary endpoint

## 3. Finance - Recurring Bills

- [x] 3.1 Add finance_bills table migration
- [x] 3.2 Create Bill model interface
- [x] 3.3 Implement FinanceService.bill methods (create, get, update, delete, markPaid)
- [x] 3.4 Add next due date calculation
- [x] 3.5 Add bill API routes (GET/POST/PUT/DELETE /api/finance/bills)
- [x] 3.6 Add upcoming bills endpoint

## 4. Finance - Reports & Export

- [x] 4.1 Add monthly summary calculation
- [x] 4.2 Add category breakdown calculation
- [x] 4.3 Add trend analysis calculation
- [x] 4.4 Add CSV export generation
- [x] 4.5 Add reports API endpoints (GET /api/finance/reports/summary, /api/finance/reports/monthly, /api/finance/reports/export)

## 5. Health - Reminders

- [x] 5.1 Add health_reminders table migration
- [x] 5.2 Create Reminder model interface
- [x] 5.3 Implement HealthService.reminder methods (create, get, update, delete, toggle)
- [x] 5.4 Add reminder API routes (GET/POST/PUT/DELETE /api/health/reminders)
- [x] 5.5 Add active reminders endpoint

## 6. Health - Goals

- [x] 6.1 Add health_goals table migration
- [x] 6.2 Create Goal model interface
- [ ] 6.3 Implement HealthService.goal methods (create, get, update, delete, getProgress)
- [ ] 6.4 Add goal progress tracking
- [ ] 6.5 Add goal API routes (GET/POST/PUT/DELETE /api/health/goals)

## 7. Fashion - Wardrobe

- [x] 7.1 Add fashion_items table migration
- [x] 7.2 Create FashionService class
- [x] 7.3 Implement wardrobe methods (add, get, update, delete, getSummary)
- [x] 7.4 Add clothing categories
- [x] 7.5 Add fashion API routes (GET/POST/PUT/DELETE /api/fashion/items)

## 8. Fashion - Outfit

- [x] 8.1 Add fashion_outfits table migration
- [x] 8.2 Implement outfit methods (log, get, delete, getStats)
- [x] 8.3 Add outfit recommendation logic
- [x] 8.4 Add fashion outfit API routes (GET/POST/DELETE /api/fashion/outfits)

## 9. Knowledge - Daily Push

- [x] 9.1 Add knowledge_items table migration
- [x] 9.2 Create KnowledgeService class
- [x] 9.3 Implement knowledge methods (add, get, search, delete, getRandom)
- [x] 9.4 Add knowledge categories
- [x] 9.5 Add knowledge API routes (GET/POST/DELETE /api/knowledge/items)

## 10. News - Aggregation

- [x] 10.1 Add news_articles table migration
- [x] 10.2 Create NewsService class
- [x] 10.3 Implement news methods (add, get, markRead, delete, search)
- [x] 10.4 Add news categories
- [x] 10.5 Add news API routes (GET/POST/DELETE /api/news/articles)

## 11. Dashboard - Finance Page Updates

- [x] 11.1 Add budget management UI
- [x] 11.2 Add investment portfolio UI
- [x] 11.3 Add recurring bills UI
- [x] 11.4 Add reports/charts UI (ECharts)
- [x] 11.5 Add CSV export button

## 12. Dashboard - Health Page Updates

- [x] 12.1 Add reminders management UI
- [x] 12.2 Add goals progress UI
- [x] 12.3 Add health charts (Chart.js)

## 13. Dashboard - Fashion Page

- [x] 13.1 Create FashionPage.vue
- [x] 13.2 Add wardrobe management UI
- [x] 13.3 Add outfit logging UI

## 14. Dashboard - Knowledge Page

- [x] 14.1 Create KnowledgePage.vue
- [x] 14.2 Add knowledge list UI
- [x] 14.3 Add knowledge search

## 15. Dashboard - News Page

- [x] 15.1 Create NewsPage.vue
- [x] 15.2 Add news list UI
- [x] 15.3 Add news categories

## 16. Dashboard - Navigation Updates

- [x] 16.1 Add Fashion to sidebar navigation
- [x] 16.2 Add Knowledge to sidebar navigation
- [x] 16.3 Add News to sidebar navigation

## 17. i18n - Translations

- [x] 17.1 Add budget translations (EN/ZH)
- [x] 17.2 Add investment translations (EN/ZH)
- [x] 17.3 Add bills translations (EN/ZH)
- [x] 17.4 Add reports translations (EN/ZH)
- [x] 17.5 Add health reminders/goals translations (EN/ZH)
- [x] 17.6 Add fashion translations (EN/ZH)
- [x] 17.7 Add knowledge translations (EN/ZH)
- [x] 17.8 Add news translations (EN/ZH)

## 18. Database - Integration

- [x] 18.1 Add all new migrations to DatabaseManager
- [x] 18.2 Initialize all new services in main.ts
- [x] 18.3 Register all new API routes
