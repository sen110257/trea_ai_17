<template>
  <div class="bottom-nav">
    <router-link 
      v-for="item in navItems" 
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/', label: '树洞', icon: '🏠' },
  { path: '/diary', label: '日记', icon: '📔' },
  { path: '/calendar', label: '日历', icon: '📅' },
  { path: '/private', label: '私密', icon: '🔒' },
  { path: '/profile', label: '我的', icon: '👤' }
]

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>
