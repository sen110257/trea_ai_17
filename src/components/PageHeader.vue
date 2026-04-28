<template>
  <header class="page-header safe-area-top">
    <div v-if="showBack" class="btn-icon" @click="goBack">
      <span>←</span>
    </div>
    <div v-else class="btn-icon" style="visibility: hidden;">
      <span>←</span>
    </div>
    
    <h1 class="page-title">{{ title }}</h1>
    
    <div class="header-actions">
      <slot name="actions"></slot>
      <div 
        v-if="showThemeToggle" 
        class="btn-icon" 
        @click="toggleTheme"
        :title="isDarkMode ? '切换到日间模式' : '切换到夜间模式'"
      >
        <span>{{ isDarkMode ? '☀️' : '🌙' }}</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'

const props = defineProps({
  title: { type: String, required: true },
  showBack: { type: Boolean, default: false },
  showThemeToggle: { type: Boolean, default: true }
})

const router = useRouter()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const toggleTheme = () => {
  themeStore.toggleDarkMode()
}
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 8px;
}
</style>
