## Context

Privy-Jiner is a personal AI assistant. Currently it has basic structure but no real functionality. The system needs core modules for financial tracking, health tracking, and a plugin system.

## Goals / Non-Goals

**Goals:**
- Implement Finance module (income/expense tracking with categories)
- Implement Health module (water intake, exercise tracking)
- Create plugin architecture for extensibility
- Integrate all modules into Dashboard

**Non-Goals:**
- Investment portfolio tracking (out of scope for v1)
- Advanced analytics/reporting (future version)
- Cloud sync (local-first, privacy-focused)

## Decisions

### 1. Module Architecture
**Decision**: Use separate packages under `packages/modules/`
**Rationale**: Clean separation, easy to plugin-ize later
**Alternatives**: All in core (too coupled)

### 2. Database Access
**Decision**: Modules access database through core's DatabaseManager
**Rationale**: Single source of truth, easier migrations
**Alternatives**: Each module manages own DB connection (complex)

### 3. API Pattern
**Decision**: Each module registers its own routes via core's plugin system
**Rationale**: Modular, each module self-contained
**Alternatives**: Single monolithic API file (not scalable)

### 4. Frontend Integration
**Decision**: Dashboard imports and uses module components directly
**Rationale**: Simple for v1, no need for dynamic loading
**Alternatives**: Dynamic module loading (over-engineering for now)

## Risks / Trade-offs

- **Risk**: Multiple modules may have schema conflicts
  → **Mitigation**: Use prefixes for table names (finance_, health_)

- **Risk**: Dashboard bundle size grows
  → **Mitigation**: Use dynamic imports for route-based code splitting

- **Trade-off**: Simple in-memory vs persistent
  → **Decision**: Use SQLite directly for simplicity, no ORM layer

## Migration Plan

1. Create module packages with basic structure
2. Add database tables via migrations
3. Implement API routes
4. Add Dashboard pages
5. Test end-to-end flow

## Open Questions

- Should modules be hot-loadable plugins? (deferred to v2)
- How to handle data export/import? (future feature)
