# Proposal: Content Area & UI Consistency Redesign

## Problem Statement

### Current Issues

1. **Sidebar Navigation**
   - Main menu (Personal/Life/System) and sub-menu (individual pages) visually similar
   - No visual distinction between group headers and items
   - Icons without labels in collapsed mode hard to understand

2. **Content Area Layout**
   - No page header with title, breadcrumbs, or actions
   - Cards lack visual hierarchy (all same size/weight)
   - Inconsistent spacing between sections
   - No empty states or placeholders
   - Forms lack clear grouping

3. **Component Inconsistency**
   - Each page has unique styling
   - Buttons, inputs, cards vary in size/padding
   - No consistent action patterns
   - Tabs look different across pages

4. **Visual Design Issues**
   - Hardcoded colors still used in many pages
   - Typography inconsistent (font sizes, weights)
   - No clear visual states (hover, focus, disabled)
   - Tables/lists lack proper alignment

## Proposed Solution

### 1. Sidebar Navigation Enhancement

**Visual Hierarchy:**
- Group headers: Smaller, uppercase, muted color
- Active item: Highlight background + accent color
- Hover: Subtle background change
- Collapsed mode: Tooltip on hover showing full name

**Styling:**
```css
.nav-group-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  padding: 8px 12px;
}
```

### 2. Content Area Layout Pattern

**Standard Page Structure:**
```
┌─────────────────────────────────────┐
│ Page Title              [Actions]  │  ← Page Header (sticky)
├─────────────────────────────────────┤
│ Breadcrumb                        │  ← Breadcrumb (optional)
├─────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌────────┐ │  ← Stats Cards Row
│ │  Stat   │ │  Stat   │ │  Stat  │ │
│ └─────────┘ └─────────┘ └────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────┐     │
│ │                             │     │  ← Main Content Card
│ │      Primary Content       │     │
│ │                             │     │
│ └─────────────────────────────┘     │
├─────────────────────────────────────┤
│ ┌─────────────────┐ ┌──────────┐   │  ← Secondary Cards
│ │  Secondary      │ │  Side    │   │
│ └─────────────────┘ └──────────┘   │
└─────────────────────────────────────┘
```

**Page Header Component:**
- Page title (h1)
- Optional breadcrumb
- Action buttons (Add, Export, etc.)
- Optional subtitle/description

### 3. Card System

**Card Types:**

| Type | Usage | Padding | Border |
|------|-------|---------|--------|
| **Stat Card** | KPIs, numbers | 20px | subtle |
| **Content Card** | Main data | 24px | normal |
| **Form Card** | Forms, inputs | 24px | normal |
| **List Card** | Tables, lists | 16px | subtle |

**Visual Hierarchy:**
- Primary content: Full width, prominent
- Secondary: 60-70% width or sidebar
- Supporting: Smaller, muted

### 4. Component Consistency

**Button Hierarchy:**
```
Primary Button → Accent color, filled
Secondary Button → Outline, accent border
Ghost Button → No border, text only
Danger Button → Red for destructive actions
```

**Input Fields:**
- Consistent height (40-44px)
- Clear labels above
- Helper text below
- Error states with red border + message

**Form Layout:**
- Label + Input vertical stack
- Group related fields horizontally
- Clear section dividers
- Submit buttons at bottom right

### 5. Design Tokens Expansion

**Spacing Scale:**
```css
--space-xs: 4px;   /* Tight elements */
--space-sm: 8px;    /* Inline elements */
--space-md: 16px;  /* Default spacing */
--space-lg: 24px;  /* Section spacing */
--space-xl: 32px;  /* Major sections */
--space-2xl: 48px; /* Page margins */
```

**Typography Scale:**
```css
--text-xs: 11px;   /* Labels, captions */
--text-sm: 13px;   /* Secondary text */
--text-base: 14px; /* Body text */
--text-lg: 16px;   /* Subheadings */
--text-xl: 20px;   /* Page headings */
--text-2xl: 28px;  /* Hero text */
```

### 6. Visual States

**Interactive Elements:**
- Hover: Slight background change
- Focus: 2px accent outline
- Active: Darker background
- Disabled: 50% opacity, no pointer events

**Feedback:**
- Loading: Skeleton screens
- Empty: Illustrated empty states
- Errors: Red border + message
- Success: Green accent + checkmark

## Implementation Approach

### Phase 1: Foundation
1. Expand CSS variables
2. Create PageHeader component
3. Create Card components

### Phase 2: Sidebar Fix
1. Improve group visual hierarchy
2. Add tooltips
3. Active state enhancement

### Phase 3: Page Templates
1. List page template (table + filters)
2. Form page template
3. Dashboard page template

### Phase 4: Consistency
1. Update all pages to use components
2. Fix form layouts
3. Add empty states

## Benefits

1. **Clear Navigation**: Users instantly see main vs sub-menu
2. **Predictable Layout**: Every page follows same pattern
3. **Efficient Scanning**: Stats → Primary → Secondary hierarchy
4. **Consistent Experience**: Same components everywhere
5. **Professional Look**: Matches modern dashboard standards

## Scope

- Expand CSS variables (spacing, typography)
- Create PageHeader.vue component
- Create Card.vue (variants)
- Create EmptyState.vue component
- Create PageTemplate layout components
- Update Sidebar.vue with better hierarchy
- Update 3-5 key pages as examples
- Add loading states

## Success Metrics

- Sidebar: Group headers distinguishable at a glance
- Content: Page header + content structure consistent
- Components: Buttons/inputs look the same everywhere
- Spacing: Clear visual rhythm (breathing room)
- States: All interactive elements have hover/focus states
