import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('./pages/LoginPage.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('./pages/DashboardPage.vue'),
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('./pages/ProfilePage.vue'),
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: () => import('./pages/ContactsPage.vue'),
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('./pages/SchedulePage.vue'),
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('./pages/TasksPage.vue'),
  },
  {
    path: '/finance',
    name: 'Finance',
    component: () => import('./pages/FinancePage.vue'),
  },
  {
    path: '/health',
    name: 'Health',
    component: () => import('./pages/HealthPage.vue'),
  },
  {
    path: '/fashion',
    name: 'Fashion',
    component: () => import('./pages/FashionPage.vue'),
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('./pages/KnowledgePage.vue'),
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('./pages/NewsPage.vue'),
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('./pages/ChatPage.vue'),
  },
  {
    path: '/monitor',
    name: 'Monitor',
    component: () => import('./pages/MonitorPage.vue'),
  },
  {
    path: '/plugins',
    name: 'Plugins',
    component: () => import('./pages/PluginsPage.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('./pages/SettingsPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount('#app');
