<template>
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol class="breadcrumb__list">
      <li class="breadcrumb__item">
        <router-link to="/dashboard" class="breadcrumb__link">
          <IconHome :size="14" />
        </router-link>
        <IconChevronRight :size="12" class="breadcrumb__separator" v-if="breadcrumbs.length > 0" />
      </li>
      <li 
        v-for="(crumb, index) in breadcrumbs" 
        :key="crumb.path" 
        class="breadcrumb__item"
      >
        <router-link 
          v-if="index < breadcrumbs.length - 1" 
          :to="crumb.path" 
          class="breadcrumb__link"
        >
          {{ crumb.title }}
        </router-link>
        <span v-else class="breadcrumb__current">
          {{ crumb.title }}
        </span>
        <IconChevronRight :size="12" class="breadcrumb__separator" v-if="index < breadcrumbs.length - 1" />
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import IconHome from './icons/IconHome.vue'
import IconChevronRight from './icons/IconChevronRight.vue'

interface Crumb {
  path: string
  title: string
}

const route = useRoute()

const pageTitles: Record<string, string> = {
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
  '/settings': 'Settings'
}

const breadcrumbs = computed<Crumb[]>(() => {
  const path = route.path
  
  if (path === '/dashboard' || path === '/') {
    return []
  }
  
  const segments = path.split('/').filter(Boolean)
  const crumbs: Crumb[] = []
  
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const title = pageTitles[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
    crumbs.push({
      path: currentPath,
      title
    })
  }
  
  return crumbs
})
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
}

.breadcrumb__list {
  display: flex;
  align-items: center;
  list-style: none;
  gap: var(--space-xs);
}

.breadcrumb__item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.breadcrumb__link {
  display: flex;
  align-items: center;
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: var(--font-sm);
  transition: color var(--transition-fast);
}

.breadcrumb__link:hover {
  color: var(--accent-primary);
}

.breadcrumb__separator {
  color: var(--text-tertiary);
}

.breadcrumb__current {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  font-weight: var(--weight-medium);
}
</style>
