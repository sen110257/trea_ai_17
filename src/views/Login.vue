<template>
  <div class="page-container auth-page">
    <div class="auth-background">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>
    
    <div class="auth-content safe-area-top">
      <button class="back-btn" @click="goBack">
        ←
      </button>
      
      <div class="auth-header">
        <div class="logo">
          <span class="logo-icon">🌙</span>
        </div>
        <h1 class="auth-title">情绪治愈树洞</h1>
        <p class="auth-subtitle">在这里，倾诉是安全的</p>
      </div>
      
      <div class="auth-form card">
        <h2 class="form-title">登录</h2>
        
        <div class="input-group">
          <label class="input-label">邮箱</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="请输入邮箱" 
            class="input-field"
          />
        </div>
        
        <div class="input-group">
          <label class="input-label">密码</label>
          <input 
            v-model="password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="请输入密码" 
            class="input-field"
          />
          <button 
            class="password-toggle" 
            type="button"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>
        
        <button 
          class="btn btn-primary submit-btn" 
          @click="handleLogin"
          :disabled="isLoading"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
        
        <div class="divider">
          <span>或者</span>
        </div>
        
        <button class="btn btn-secondary anonymous-btn" @click="handleAnonymousLogin">
          <span class="anonymous-icon">🕵️</span>
          匿名进入
        </button>
        
        <p class="auth-link">
          还没有账号？
          <router-link to="/register" class="link-text">立即注册</router-link>
        </p>
      </div>
      
      <div class="auth-footer">
        <p class="privacy-text">
          登录即表示同意
          <a href="#" class="link-text">用户协议</a>
          和
          <a href="#" class="link-text">隐私政策</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const handleLogin = async () => {
  if (!email.value.trim()) {
    alert('请输入邮箱')
    return
  }
  if (!password.value) {
    alert('请输入密码')
    return
  }
  
  isLoading.value = true
  
  setTimeout(() => {
    const result = authStore.login(email.value, password.value)
    
    isLoading.value = false
    
    if (result.success) {
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      alert(result.message)
    }
  }, 1000)
}

const handleAnonymousLogin = () => {
  const result = authStore.anonymousLogin()
  if (result.success) {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  }
}
</script>

<style scoped>
.auth-page {
  background: var(--bg-color);
  overflow: hidden;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
}

.bg-circle-1 {
  width: 300px;
  height: 300px;
  background: var(--primary-color);
  top: -100px;
  right: -50px;
}

.bg-circle-2 {
  width: 250px;
  height: 250px;
  background: var(--secondary-color);
  bottom: -50px;
  left: -50px;
}

.bg-circle-3 {
  width: 200px;
  height: 200px;
  background: var(--accent-color);
  top: 40%;
  left: -30px;
}

.auth-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--text-primary);
  box-shadow: 0 2px 12px var(--shadow-light);
}

.auth-header {
  text-align: center;
  padding: 40px 0 30px;
}

.logo {
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 64px;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

.auth-form {
  flex-shrink: 0;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  text-align: center;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  padding: 4px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider span {
  padding: 0 16px;
  font-size: 12px;
  color: var(--text-muted);
}

.anonymous-btn {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.anonymous-icon {
  font-size: 18px;
}

.auth-link {
  text-align: center;
  margin-top: 24px;
  font-size: 13px;
  color: var(--text-muted);
}

.link-text {
  color: var(--primary-color);
  font-weight: 500;
}

.auth-footer {
  margin-top: auto;
  padding: 16px 0;
}

.privacy-text {
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.6;
}
</style>
