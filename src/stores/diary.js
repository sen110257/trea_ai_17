import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

const moodEmojis = {
  'happy': '😊',
  'excited': '🤩',
  'content': '😌',
  'calm': '😌',
  'sad': '😢',
  'angry': '😠',
  'anxious': '😰',
  'tired': '😴',
  'bored': '😐',
  'neutral': '😐',
  'loved': '🥰',
  'grateful': '🙏'
}

const moodLabels = {
  'happy': '开心',
  'excited': '兴奋',
  'content': '满足',
  'calm': '平静',
  'sad': '难过',
  'angry': '生气',
  'anxious': '焦虑',
  'tired': '疲惫',
  'bored': '无聊',
  'neutral': '平静',
  'loved': '被爱',
  'grateful': '感恩'
}

const moodColors = {
  'happy': '#34D399',
  'excited': '#FBBF24',
  'content': '#60A5FA',
  'calm': '#A78BFA',
  'sad': '#60A5FA',
  'angry': '#F87171',
  'anxious': '#FBBF24',
  'tired': '#9CA3AF',
  'bored': '#9CA3AF',
  'neutral': '#A78BFA',
  'loved': '#F472B6',
  'grateful': '#34D399'
}

const generateSampleDiaries = (userId) => {
  const samples = [
    {
      date: new Date(Date.now() - 86400000 * 2),
      mood: 'happy',
      content: '今天和朋友一起去看了电影，很久没有这么放松了。生活中的小确幸真的很珍贵。',
      tags: ['朋友', '电影', '快乐']
    },
    {
      date: new Date(Date.now() - 86400000 * 3),
      mood: 'calm',
      content: '晚上在阳台看星星，突然觉得生活很美好。虽然有很多不如意，但也有很多值得珍惜的。',
      tags: ['星空', '思考', '平静']
    },
    {
      date: new Date(Date.now() - 86400000 * 5),
      mood: 'anxious',
      content: '工作压力很大，感觉自己快要撑不住了。但还是要告诉自己，一切都会好起来的。',
      tags: ['工作', '压力']
    },
    {
      date: new Date(Date.now() - 86400000 * 7),
      mood: 'loved',
      content: '收到了家人的礼物，虽然不贵重，但心里暖暖的。被人惦记的感觉真好。',
      tags: ['家人', '温暖', '感动']
    },
    {
      date: new Date(Date.now() - 86400000 * 10),
      mood: 'sad',
      content: '和朋友闹别扭了，心里很不好受。不知道该怎么处理这段关系...',
      tags: ['朋友', '烦恼']
    }
  ]
  
  return samples.map((sample, index) => ({
    id: generateId(),
    userId,
    date: sample.date.toISOString().split('T')[0],
    mood: sample.mood,
    content: sample.content,
    tags: sample.tags,
    images: [],
    createdAt: sample.date.toISOString(),
    updatedAt: sample.date.toISOString()
  }))
}

export const useDiaryStore = defineStore('diary', () => {
  const diaries = ref([])
  const privatePosts = ref([])
  
  const availableMoods = ref([
    { key: 'happy', emoji: '😊', label: '开心', color: '#34D399' },
    { key: 'excited', emoji: '🤩', label: '兴奋', color: '#FBBF24' },
    { key: 'content', emoji: '😌', label: '满足', color: '#60A5FA' },
    { key: 'calm', emoji: '😌', label: '平静', color: '#A78BFA' },
    { key: 'loved', emoji: '🥰', label: '被爱', color: '#F472B6' },
    { key: 'grateful', emoji: '🙏', label: '感恩', color: '#34D399' },
    { key: 'tired', emoji: '😴', label: '疲惫', color: '#9CA3AF' },
    { key: 'bored', emoji: '😐', label: '无聊', color: '#9CA3AF' },
    { key: 'sad', emoji: '😢', label: '难过', color: '#60A5FA' },
    { key: 'angry', emoji: '😠', label: '生气', color: '#F87171' },
    { key: 'anxious', emoji: '😰', label: '焦虑', color: '#FBBF24' }
  ])
  
  const init = () => {
    const authStore = useAuthStore()
    const savedDiaries = localStorage.getItem('diaries')
    const savedPrivatePosts = localStorage.getItem('privatePosts')
    
    if (savedDiaries) {
      diaries.value = JSON.parse(savedDiaries)
    } else if (authStore.currentUser) {
      diaries.value = generateSampleDiaries(authStore.currentUser.id)
      saveDiaries()
    }
    
    if (savedPrivatePosts) {
      privatePosts.value = JSON.parse(savedPrivatePosts)
    }
  }
  
  const saveDiaries = () => {
    localStorage.setItem('diaries', JSON.stringify(diaries.value))
  }
  
  const savePrivatePosts = () => {
    localStorage.setItem('privatePosts', JSON.stringify(privatePosts.value))
  }
  
  const getUserDiaries = (userId) => {
    return diaries.value.filter(d => d.userId === userId).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )
  }
  
  const getDiaryByDate = (userId, date) => {
    return diaries.value.find(d => d.userId === userId && d.date === date)
  }
  
  const createDiary = (mood, content, tags = [], images = [], date = null) => {
    const authStore = useAuthStore()
    
    if (!authStore.currentUser) {
      return { success: false, message: '请先登录' }
    }
    
    const diaryDate = date || new Date().toISOString().split('T')[0]
    const existingDiary = getDiaryByDate(authStore.currentUser.id, diaryDate)
    
    if (existingDiary) {
      return updateDiary(existingDiary.id, { mood, content, tags, images })
    }
    
    const diary = {
      id: generateId(),
      userId: authStore.currentUser.id,
      date: diaryDate,
      mood,
      content,
      tags,
      images,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    diaries.value.push(diary)
    saveDiaries()
    
    return { success: true, diary }
  }
  
  const updateDiary = (id, updates) => {
    const index = diaries.value.findIndex(d => d.id === id)
    if (index === -1) {
      return { success: false, message: '日记不存在' }
    }
    
    diaries.value[index] = {
      ...diaries.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    saveDiaries()
    return { success: true, diary: diaries.value[index] }
  }
  
  const deleteDiary = (id) => {
    const index = diaries.value.findIndex(d => d.id === id)
    if (index !== -1) {
      diaries.value.splice(index, 1)
      saveDiaries()
      return { success: true }
    }
    return { success: false }
  }
  
  const getCalendarData = (userId, year, month) => {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    
    const monthDiaries = diaries.value.filter(d => {
      if (d.userId !== userId) return false
      const diaryDate = new Date(d.date)
      return diaryDate >= startDate && diaryDate <= endDate
    })
    
    const calendarMap = {}
    monthDiaries.forEach(d => {
      calendarMap[d.date] = d
    })
    
    return calendarMap
  }
  
  const getMoodStats = (userId, year, month) => {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    
    const monthDiaries = diaries.value.filter(d => {
      if (d.userId !== userId) return false
      const diaryDate = new Date(d.date)
      return diaryDate >= startDate && diaryDate <= endDate
    })
    
    const stats = {}
    monthDiaries.forEach(d => {
      stats[d.mood] = (stats[d.mood] || 0) + 1
    })
    
    return stats
  }
  
  const createPrivatePost = (content, images = [], mood = 'neutral') => {
    const authStore = useAuthStore()
    
    if (!authStore.currentUser) {
      return { success: false, message: '请先登录' }
    }
    
    const post = {
      id: generateId(),
      userId: authStore.currentUser.id,
      content,
      images,
      mood,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    privatePosts.value.unshift(post)
    savePrivatePosts()
    
    return { success: true, post }
  }
  
  const getUserPrivatePosts = (userId) => {
    return privatePosts.value.filter(p => p.userId === userId).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  }
  
  const deletePrivatePost = (id) => {
    const index = privatePosts.value.findIndex(p => p.id === id)
    if (index !== -1) {
      privatePosts.value.splice(index, 1)
      savePrivatePosts()
      return { success: true }
    }
    return { success: false }
  }
  
  const getMoodEmoji = (mood) => moodEmojis[mood] || '😐'
  const getMoodLabel = (mood) => moodLabels[mood] || '平静'
  const getMoodColor = (mood) => moodColors[mood] || '#A78BFA'
  
  init()
  
  return {
    diaries,
    privatePosts,
    availableMoods,
    getUserDiaries,
    getDiaryByDate,
    createDiary,
    updateDiary,
    deleteDiary,
    getCalendarData,
    getMoodStats,
    createPrivatePost,
    getUserPrivatePosts,
    deletePrivatePost,
    getMoodEmoji,
    getMoodLabel,
    getMoodColor
  }
})
