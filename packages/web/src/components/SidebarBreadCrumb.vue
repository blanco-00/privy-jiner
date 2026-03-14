<template>
  <div class="sidebar-breadcrumb">
    <span class="breadcrumb-item" v-for="(item, index) in breadcrumbs" :key="item.path">
      <span class="breadcrumb-separator" v-if="index > 0">/</span>
      <router-link 
        :to="item.path" 
        class="breadcrumb-link"
        :class="{ active: index === breadcrumbs.length - 1 }"
      >
        {{ item.title }}
      </router-link>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface BreadcrumbItem {
  path: string
  title: string
}

const route = useRoute()

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/contacts': 'Contacts',
  '/schedule': 'Schedule',
  '/tasks': 'Tasks',
  '/finance': 'Finance',
  '/health': 'Health',
  '/fashion': 'Fashion',
  '/knowledge': 'Knowledge',
  '/news': 'News',
  '/chat': 'Chat',
  '/monitor': 'Monitor',
  '/plugins': 'Plugins',
  '/settings': 'Settings',
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const path = route.path
  const segments = path.split('/').filter(Boolean)
  
  if (segments.length === 0) {
    return [{ path: '/', title: 'Home' }]
  }
  
  const items: BreadcrumbItem[] = []
  let currentPath = ''
  
  for (const segment of segments) {
    currentPath += `/${segment}`
    items.push({
      path: currentPath,
      title: routeTitles[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
    })
  }
  
  return items
})
</script>

<style scoped>
.sidebar-breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1);
  font-size: var(--font-sm);
}

.breadcrumb-separator {
  color: var(--text-tertiary);
  margin: 0 var(--space-xs);
}

.breadcrumb-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.breadcrumb-link:hover {
  color: var(--accent-primary);
}

.breadcrumb-link.active {
  color: var(--text-primary);
  font-weight: var(--weight-medium);
  cursor: default;
}

.breadcrumb-link.active:hover {
  color: var(--text-primary);
}
</style>
