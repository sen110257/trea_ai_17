import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(false)
  const isNightModeActive = ref(false)
  
  const init = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark'
    } else {
      const hour = new Date().getHours()
      isDarkMode.value = hour >= 22 || hour < 6
      isNightModeActive.value = isDarkMode.value
    }
    
    updateDocument()
  }
  
  const updateDocument = () => {
    document.documentElement.classList.toggle('dark-mode', isDarkMode.value)
  }
  
  const toggleDarkMode = (value) => {
    isDarkMode.value = value !== undefined ? value : !isDarkMode.value
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    updateDocument()
  }
  
  const checkNightMode = () => {
    const hour = new Date().getHours()
    const shouldBeNight = hour >= 22 || hour < 6
    
    if (shouldBeNight && !isNightModeActive.value) {
      isDarkMode.value = true
      isNightModeActive.value = true
      updateDocument()
    } else if (!shouldBeNight && isNightModeActive.value) {
      isDarkMode.value = false
      isNightModeActive.value = false
      updateDocument()
    }
  }
  
  init()
  
  return {
    isDarkMode,
    isNightModeActive,
    toggleDarkMode,
    checkNightMode
  }
})
