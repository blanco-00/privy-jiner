# Tasks: Personal & Schedule Management

## 1. Database Migrations

- [x] 1.1 Add user_profiles table migration
- [x] 1.2 Add health_metrics table migration
- [x] 1.3 Add contacts table migration
- [x] 1.4 Add contact_groups table migration
- [x] 1.5 Add schedules table migration
- [x] 1.6 Add tasks table migration
- [x] 1.7 Add schedule_reminders table migration
- [x] 1.8 Add ai_config table migration
- [x] 1.9 Add chat_history table migration

## 2. Profile Module (Backend)

- [x] 2.1 Create ProfileService class
- [x] 2.2 Implement profile CRUD methods
- [x] 2.3 Implement health metrics methods
- [x] 2.4 Add profile API routes (GET/POST/PUT /api/profile)
- [x] 2.5 Add health metrics API routes

## 3. Contacts Module (Backend)

- [x] 3.1 Create ContactsService class
- [x] 3.2 Implement contact CRUD methods
- [x] 3.3 Implement contact groups methods
- [x] 3.4 Implement upcoming birthdays query
- [x] 3.5 Add contacts API routes (GET/POST/PUT/DELETE /api/contacts)
- [x] 3.6 Add groups API routes

## 4. Schedule Module (Backend)

- [x] 4.1 Create ScheduleService class
- [x] 4.2 Implement schedule CRUD methods
- [x] 4.3 Implement recurring events
- [x] 4.4 Implement calendar queries (day/week/month)
- [x] 4.5 Add schedule API routes
- [x] 4.6 Add schedule reminders integration

## 5. Tasks Module (Backend)

- [x] 5.1 Create TasksService class
- [x] 5.2 Implement task CRUD methods
- [x] 5.3 Implement task status transitions
- [x] 5.4 Implement overdue tasks query
- [x] 5.5 Add tasks API routes

## 6. AI Module (Backend)

- [x] 6.1 Create AIService class
- [x] 6.2 Implement AI config methods (save, get, test)
- [x] 6.3 Implement chat message handling
- [x] 6.4 Implement intent parsing for system operations
- [x] 6.5 Add AI config API routes (GET/POST /api/ai/config)
- [x] 6.6 Add chat API routes (POST /api/ai/chat)
- [x] 6.7 Add chat history API routes

## 7. System Monitoring Module (Backend)

- [x] 7.1 Create MonitoringService class
- [x] 7.2 Implement database metrics (size, tables count, query stats)
- [x] 7.3 Implement system metrics (CPU, memory via os module)
- [x] 7.4 Implement API usage tracking
- [x] 7.5 Implement AI usage stats (calls, tokens, cost)
- [x] 7.6 Add monitoring API routes (GET /api/monitoring/*)

## 8. Profile Page (Frontend)

- [x] 8.1 Create ProfilePage.vue
- [x] 8.2 Add profile form (name, birthday, height, weight, blood type)
- [x] 8.3 Add health metrics history chart
- [x] 8.4 Add profile i18n translations

## 9. Contacts Page (Frontend)

- [x] 9.1 Create ContactsPage.vue
- [x] 9.2 Add contact list with search
- [x] 9.3 Add contact form (name, phone, email, birthday, group)
- [x] 9.4 Add upcoming birthdays widget
- [x] 9.5 Add contacts i18n translations

## 10. Schedule Page (Frontend)

- [x] 10.1 Create SchedulePage.vue
- [x] 10.2 Add calendar view (month/week/day)
- [x] 10.3 Add event creation form
- [x] 10.4 Add event details modal
- [x] 10.5 Add schedule i18n translations

## 11. Tasks Page (Frontend)

- [x] 11.1 Create TasksPage.vue
- [x] 11.2 Add task list with filters (status, priority)
- [x] 11.3 Add task form
- [x] 11.4 Add task completion toggle
- [x] 11.5 Add overdue tasks highlight
- [x] 11.6 Add tasks i18n translations

## 12. AI Chat Page (Frontend)

- [x] 12.1 Create ChatPage.vue
- [x] 12.2 Add chat message list
- [x] 12.3 Add message input with send button
- [x] 12.4 Add AI response rendering (markdown support)
- [x] 12.5 Add clear history button
- [x] 12.6 Add chat i18n translations

## 13. Settings - AI Config (Frontend)

- [x] 13.1 Add AI configuration section in Settings
- [x] 13.2 Add provider selection (OpenAI/Claude)
- [x] 13.3 Add API key input (masked)
- [x] 13.4 Add model selection
- [x] 13.5 Add test connection button
- [x] 13.6 Add AI settings i18n translations

## 14. System Monitor Page (Frontend)

- [x] 14.1 Create MonitorPage.vue
- [x] 14.2 Add dashboard with cards layout
- [x] 14.3 Add database stats (size, tables)
- [x] 14.4 Add system resources (CPU, memory, disk)
- [x] 14.5 Add API usage stats (requests, response time)
- [x] 14.6 Add AI usage stats (calls, tokens, cost)
- [x] 14.7 Add monitoring i18n translations

## 15. Navigation Updates

- [x] 15.1 Add Profile to sidebar navigation
- [x] 15.2 Add Contacts to sidebar navigation
- [x] 15.3 Add Schedule to sidebar navigation
- [x] 15.4 Add Tasks to sidebar navigation
- [x] 15.5 Add Chat (AI) to sidebar navigation
- [x] 15.6 Add Monitor to sidebar navigation
- [x] 15.7 Update navigation i18n translations

## 16. Page Layout Design

- [x] 16.1 Design responsive sidebar (collapsible on mobile)
- [x] 16.2 Design card-based dashboard layout
- [x] 16.3 Design table/list views with pagination
- [x] 16.4 Design modal/drawer for forms
- [x] 16.5 Design notification toasts
- [x] 16.6 Design loading states
- [x] 16.7 Design empty states
