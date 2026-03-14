## Context

privy-jiner dashboard currently has a basic layout with Sidebar, Navbar, and TagsView. Need to enhance with professional admin features by referencing vue-pure-admin implementation. Key constraints:
- Using Vue 3 + TypeScript + Vite (existing)
- No additional dependencies preferred
- Must work with existing routing and i18n

## Goals / Non-Goals

**Goals:**
- Implement professional sidebar with collapse/expand, logo, breadcrumb
- Enhance navbar with user dropdown, breadcrumbs, fullscreen toggle
- Improve tags view with scroll buttons and context menu
- Add global search modal (Cmd/Ctrl+K)
- Add notice/notification center
- Implement 8+ theme presets with runtime switching

**Non-Goals:**
- Backend changes - pure frontend enhancement
- Adding new routing - use existing routes
- Changing data layer - presentation only

## Decisions

### 1. CSS Variables vs SCSS
**Decision:** Use CSS variables for theming
**Rationale:** Easier runtime switching, no build tool changes needed. Vue-pure-admin uses SCSS but CSS variables achieve same result with less complexity.

### 2. Theme Architecture
**Decision:** CSS variables with data-theme attribute on html element
**Rationale:** Simple, performant, no JS state management needed for theme. Matches existing privy-jiner approach.

### 3. Component Structure
**Decision:** Flat component structure under src/components/
**Rationale:** Keep it simple, avoid deep nesting. Each feature as separate component file.

### 4. Icons
**Decision:** Inline SVG components (existing pattern)
**Rationale:** No external icon library dependency, matches existing code style.

## Risks / Trade-offs

- [Risk] Some features may be over-engineered for simple use case → Mitigation: Start with essential features, add complexity as needed
- [Risk] Theme switching may not apply everywhere → Mitigation: Use CSS var() for all colors, test each theme
- [Risk] Mobile responsiveness gaps → Mitigation: Test on mobile viewport, add media queries as needed

## Migration Plan

1. First, enhance existing components (Sidebar, Navbar, TagsView)
2. Add global search modal
3. Add notice center
4. Enhance theme system with more presets
5. Test all features together

## Open Questions

- Should we implement "lock screen" feature from vue-pure-admin?
- Do we need horizontal sidebar mode (already have vertical)?
