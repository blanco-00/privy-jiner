## Why

privy-jiner's dashboard needs a professional admin layout with proper sidebar navigation, tags view, global search, notifications, and theme system. vue-pure-admin provides a mature, production-ready reference implementation with 8+ themes and modern UX patterns. Copying these patterns will accelerate development and ensure a polished user experience.

## What Changes

- **Sidebar Navigation**: Vertical sidebar with collapse/expand, logo, breadcrumb, active state highlighting, nested menu support
- **Navbar**: Top navigation with user avatar dropdown, fullscreen toggle, lock screen
- **Tags View**: Multi-tab page navigation with scroll buttons, context menu (close/refresh/close others)
- **Global Search**: Modal search (Cmd/Ctrl+K) with fuzzy search across pages
- **Notice Center**: Notification bell with list of notifications, read/unread status
- **Theme System**: 8+ theme presets with runtime switching (light, dark, purple, pink, red, orange, cyan, green)
- **Responsive**: Mobile-friendly with automatic sidebar collapse

## Capabilities

### New Capabilities

- `sidebar-layout`: Professional sidebar with logo, navigation items, collapse mode
- `navbar-layout`: Top navigation bar with user menu, breadcrumbs, action buttons
- `tags-view`: Multi-tab page navigation with context menu
- `global-search`: Command palette style search modal
- `notice-center`: Notification center with badge and list
- `theme-switching`: Runtime theme switching with 8+ presets

### Modified Capabilities

- None - this is a new UI layer addition

## Impact

- **Code**: New components in `packages/dashboard/src/components/`
- **Styles**: Enhanced CSS variables in `packages/dashboard/src/styles/`
- **Dependencies**: None - using existing Vue 3 + TypeScript stack
