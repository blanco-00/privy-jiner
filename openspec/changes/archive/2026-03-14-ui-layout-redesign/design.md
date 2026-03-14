## Context

### Current State
- 14+ navigation items in horizontal top bar (overflows on smaller screens)
- All colors hardcoded in each component (no design tokens)
- No shared Vue components - every page re-implements cards, buttons, forms
- Only emoji used for icons
- No animations or transitions
- Each page has inconsistent styling

### Technical Constraints
- Pure Vue 3 + TypeScript (no external UI libraries)
- Must maintain all existing API integrations
- i18n already supports EN/中文
- Dark theme is primary (light theme out of scope)

### Stakeholders
- End users of personal AI assistant
- Developers maintaining the codebase

## Goals / Non-Goals

**Goals:**
1. Replace top nav with collapsible sidebar grouped by category
2. Create CSS custom properties (design tokens) for all colors, spacing, typography
3. Build 5+ reusable Vue components (Card, Button, Input, Modal, TabNav)
4. Replace emoji icons with consistent SVG icon set
5. Add smooth CSS transitions for interactions
6. Ensure responsive design works on tablet (768px+) and desktop (1024px+)

**Non-Goals:**
- Light theme support (stay dark-only for simplicity)
- Adding new backend functionality
- Accessibility audit (future improvement)
- PWA/offline support

## Decisions

### 1. Sidebar vs Top Nav
**Decision:** Collapsible left sidebar

**Rationale:**
- Vertical space more valuable than horizontal for content
- Grouping by category reduces cognitive load
- Industry standard (Notion, Linear, etc.)

**Alternatives Considered:**
- Keep top nav + overflow menu → Doesn't solve grouping issue
- Tabs within page → Moves complexity to each page

### 2. CSS Variables Location
**Decision:** Create `src/styles/variables.css` and import in main.ts

**Rationale:**
- Centralized theme management
- Easy to add light theme later
- Scoped styles can reference CSS vars

**Alternatives:**
- Vue provide/inject → Overkill for theming
- CSS modules → Less flexible for runtime changes

### 3. Component Strategy
**Decision:** Create components in `src/components/ui/` folder

**Components to build:**
- `BaseCard.vue` - Card wrapper with slots
- `BaseButton.vue` - Button with variants
- `BaseInput.vue` - Form input styling
- `BaseModal.vue` - Reusable modal
- `StatCard.vue` - Dashboard stats
- `Sidebar.vue` - Navigation sidebar
- `NavGroup.vue` - Sidebar group

**Rationale:** Keep it simple - headless components with slots, no internal state

### 4. Icon Strategy
**Decision:** Use inline SVG icons (no external library)

**Rationale:**
- No dependency bloat
- Full control over styling
- Can animate SVGs

**Icons needed:** ~30 icons for navigation (user, contacts, calendar, etc.)

### 5. Animation Strategy
**Decision:** CSS transitions only (no animation library)

**Rationale:**
- Sidebar expand/collapse
- Button hover states
- Modal fade in/out
- Page content fade

**Keep simple:** No complex keyframe animations

### 6. Responsive Breakpoints
**Decision:** Three-tier approach

| Breakpoint | Sidebar | Content |
|------------|---------|---------|
| < 768px | Hidden (hamburger menu) | Full width |
| 768-1023px | Icons only | Full width |
| ≥ 1024px | Icons + labels | Full width |

## Risks / Trade-offs

### Risk: Sidebar state persistence
**Mitigation:** Use localStorage with reactive sync

### Risk: Component duplication
**Mitigation:** Enforce using base components in new pages via code review

### Risk: Breaking existing pages
**Mitigation:** Keep all existing functionality, only change styling

### Trade-off: More initial development time
**Justification:** Saves time long-term with consistent components

## Migration Plan

### Phase 1: Foundation (Day 1)
1. Create CSS variables file
2. Import in main.ts
3. Update App.vue with sidebar structure

### Phase 2: Components (Day 2)
1. Build Sidebar, NavGroup components
2. Build BaseCard, BaseButton, BaseInput
3. Update FinancePage to use new components (reference)

### Phase 3: Pages (Day 3-4)
1. Update remaining pages to use design tokens
2. Replace emoji with SVG icons
3. Add CSS transitions

### Phase 4: Polish (Day 5)
1. Test responsive behavior
2. Fix edge cases
3. Verify all features work

## Open Questions

1. Should sidebar collapse by default on mobile? → Yes, hamburger menu
2. How to handle very long page names in sidebar? → Truncate with ellipsis
3. Add keyboard shortcuts? → Future enhancement
