import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/inventory' },
  { path: '/scan', component: () => import('@/pages/Scan.vue') },
  { path: '/inventory', component: () => import('@/pages/Inventory.vue') },
  { path: '/recipes', component: () => import('@/pages/Recipes.vue') },
  { path: '/settings', component: () => import('@/pages/Settings.vue') },
  { path: '/:pathMatch(.*)*', component: () => import('@/pages/NotFound.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})
