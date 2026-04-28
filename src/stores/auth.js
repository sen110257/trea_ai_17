import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

const defaultAvatars = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20cat%20avatar%20purple%20pastel%20color&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20dog%20avatar%20pink%20pastel%20color&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20rabbit%20avatar%20blue%20pastel%20color&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20panda%20avatar%20soft%20purple%20color&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20fox%20avatar%20orange%20pastel%20color&image_size=square'
]

const defaultNicknames = [
  '温柔的晚风',
  '星空下的梦',
  '治愈系暖阳',
  '安静的云朵',
  '温柔的月光',
  '治愈小天使',
  '温暖的拥抱',
  '柔软的棉花糖',
  '甜美的微笑',
  '安静的角落'
]

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const users = ref([])
  
  const isLoggedIn = computed(() => !!currentUser.value)
  
  const init = () => {
    const savedUsers = localStorage.getItem('users')
    const savedCurrentUser = localStorage.getItem('currentUser')
    
    if (savedUsers) {
      users.value = JSON.parse(savedUsers)
    }
    
    if (savedCurrentUser) {
      currentUser.value = JSON.parse(savedCurrentUser)
    }
  }
  
  const saveToStorage = () => {
    localStorage.setItem('users', JSON.stringify(users.value))
    if (currentUser.value) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    } else {
      localStorage.removeItem('currentUser')
    }
  }
  
  const generateAnonymousUser = () => {
    const avatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
    const nickname = defaultNicknames[Math.floor(Math.random() * defaultNicknames.length)] + 
                     Math.floor(Math.random() * 1000).toString().padStart(4, '0')
    
    return {
      id: generateId(),
      nickname,
      avatar,
      isAnonymous: true,
      createdAt: new Date().toISOString()
    }
  }
  
  const register = (email, password, nickname, avatar) => {
    const existingUser = users.value.find(u => u.email === email)
    if (existingUser) {
      return { success: false, message: '该邮箱已被注册' }
    }
    
    const user = {
      id: generateId(),
      email,
      password,
      nickname: nickname || defaultNicknames[Math.floor(Math.random() * defaultNicknames.length)],
      avatar: avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
      bio: '',
      isAnonymous: false,
      createdAt: new Date().toISOString()
    }
    
    users.value.push(user)
    saveToStorage()
    
    return { success: true, user }
  }
  
  const login = (email, password) => {
    const user = users.value.find(u => u.email === email && u.password === password)
    if (!user) {
      return { success: false, message: '邮箱或密码错误' }
    }
    
    currentUser.value = { ...user, password: undefined }
    saveToStorage()
    
    return { success: true, user: currentUser.value }
  }
  
  const anonymousLogin = () => {
    const user = generateAnonymousUser()
    currentUser.value = user
    users.value.push(user)
    saveToStorage()
    
    return { success: true, user }
  }
  
  const logout = () => {
    currentUser.value = null
    saveToStorage()
  }
  
  const updateProfile = (updates) => {
    if (!currentUser.value) return { success: false, message: '未登录' }
    
    const userIndex = users.value.findIndex(u => u.id === currentUser.value.id)
    if (userIndex === -1) {
      return { success: false, message: '用户不存在' }
    }
    
    users.value[userIndex] = {
      ...users.value[userIndex],
      ...updates
    }
    
    currentUser.value = { ...users.value[userIndex], password: undefined }
    saveToStorage()
    
    return { success: true, user: currentUser.value }
  }
  
  const getUserById = (id) => {
    return users.value.find(u => u.id === id)
  }
  
  init()
  
  return {
    currentUser,
    users,
    isLoggedIn,
    register,
    login,
    anonymousLogin,
    logout,
    updateProfile,
    getUserById,
    defaultAvatars
  }
})
