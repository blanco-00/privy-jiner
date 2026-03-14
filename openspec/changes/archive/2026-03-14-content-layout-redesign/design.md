## Context

### Current State
- Sidebar has navigation groups but visually similar to nav items
- Content area varies wildly between pages (Finance has tabs, Tasks has filters, etc.)
- Each page implements its own layout from scratch
- CSS variables exist but not fully utilized
- No reusable page-level components

### Design Goals
1. Clear visual hierarchy in sidebar
2. Consistent content area layout
3. Reusable page components
4. Better component consistency

## Goals / Non-Goals

**Goals:**
1. Sidebar group headers visually distinct from nav items
2. Create PageHeader component (title + actions + breadcrumbs)
3. Create Card component variants
4. Create EmptyState component
5. Create PageTemplate for consistent layout
6. Update FinancePage as reference implementation

**Non-Goals:**
- Full redesign of all 15 pages
- Adding new functionality
- Changing color palette
- Accessibility audit

## Decisions

### 1. Sidebar Hierarchy
**Decision:** Use visual weight + typography distinction

```css
/* Group headers - muted, uppercase, smaller */
.nav-group-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
}

/* Nav items - larger, normal case */
.nav-item {
  font-size: 14px;
  color: var(--text-secondary);
}
```

**Rationale:** Industry standard pattern (Notion, Linear, etc.)

### 2. Page Header Component
**Decision:** Create reusable PageHeader.vue

```vue
<template>
  <header class="page-header">
    <div class="page-header-main">
      <h1>{{ title }}</h1>
      <div class="page-actions">
        <slot name="actions" />
      </div>
    </div>
    <div v-if="subtitle" class="page-subtitle">{{ subtitle }}</div>
    <div v-if="breadcrumbs" class="page-breadcrumbs">
      <slot name="breadcrumbs" />
    </div>
  </header>
</template>
```

**Rationale:** Every page needs title/actions pattern

### 3. Card Component Strategy
**Decision:** Single Card with variant prop + slots

```vue
<Card variant="stat">...</Card>
<Card variant="content">...</Card>
<Card variant="form">...</Card>
```

**Variants:**
- `stat`: Compact, centered, icon + value
- `content`: Standard padding, header + body
- `form`: Larger padding, section grouping

**Rationale:** Simpler than multiple components

### 4. Content Layout Pattern
**Decision:** Standard three-tier layout

```
PageHeader (sticky)
  ├─ Stats Row (optional)
  ├─ Main Content (primary)
  └─ Secondary (sidebar, optional)
```

**Rationale:** Matches user scanning pattern (overview → details)

### 5. Empty State Design
**Decision:** Component with icon + message + action

```vue
<EmptyState 
  icon="inbox" 
  title="No items" 
  description="Get started by adding..."
  actionLabel="Add Item"
  @action="handleAdd"
/>
```

**Rationale:** Better UX than empty tables/lists

## Component Library

### PageHeader.vue
- Props: title, subtitle, breadcrumbs
- Slots: default (actions)

### Card.vue
- Variants: stat, content, form, list
- Slots: header, default, footer

### EmptyState.vue
- Props: icon, title, description, actionLabel
- Events: action

### StatCard.vue
- Props: label, value, trend, icon
- Variants: default, positive, negative

### PageContainer.vue
- Props: maxWidth
- Layout: header + content slots

## Page Layout Templates

### List Page
```
┌──────────────────────────────────────┐
│ PageHeader                           │
│  [Title]              [+Add]       │
├──────────────────────────────────────┤
│ Filters / Tabs                      │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ Data Table / List               │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ Pagination                          │
└──────────────────────────────────────┘
```

### Dashboard Page
```
┌──────────────────────────────────────┐
│ PageHeader                           │
│  [Welcome]              [Actions]   │
├──────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │ Stat   │ │ Stat   │ │ Stat   │   │
│ └────────┘ └────────┘ └────────┘   │
├──────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────┐ │
│ │ Main Chart/Content │ │ Side    │ │
│ └─────────────────────┘ └─────────┘ │
└──────────────────────────────────────┘
```

### Form Page
```
┌──────────────────────────────────────┐
│ PageHeader                           │
│  [Title]              [Save] [Cancel]│
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ Form Section 1                  │ │
│ │ [Input] [Input]                 │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Form Section 2                  │ │
│ │ [Textarea]                      │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

## Migration Plan

### Week 1: Foundation
1. Expand CSS variables (spacing, typography)
2. Create PageHeader component
3. Create Card component

### Week 2: Core Components
1. Create EmptyState component
2. Create StatCard component
3. Update Sidebar with better hierarchy

### Week 3: Templates
1. Create PageContainer
2. Update FinancePage as reference
3. Test and refine

### Week 4: Rollout
1. Update remaining high-traffic pages
2. Document patterns
3. Create usage guidelines

## Risks / Trade-offs

### Risk: Too many components
**Mitigation:** Start with 3-4 core components, add as needed

### Risk: Breaking existing pages
**Mitigation:** Keep old styles working, migrate incrementally

### Risk: Over-engineering
**Mitigation:** Only create components used 2+ times

### Trade-off: Time vs Perfection
**Decision:** Ship usable version first, refine in subsequent iterations

## Open Questions

1. Should page transitions be animated? → Start simple, add if time permits
2. How to handle mobile table views? → Future enhancement
3. Add skeleton loading states? → Yes, important for UX
