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
          <span class="logo-icon">🌟</span>
        </div>
        <h1 class="auth-title">创建账号</h1>
        <p class="auth-subtitle">加入温暖的树洞社区</p>
      </div>
      
      <div class="auth-form card">
        <div class="step-indicator">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="step-item"
            :class="{ active: currentStep === index + 1, completed: currentStep > index + 1 }"
          >
            <span class="step-number">{{ index + 1 }}</span>
            <span class="step-label">{{ step }}</span>
          </div>
        </div>
        
        <div v-if="currentStep === 1" class="step-content animate-fadeIn">
          <div class="input-group">
            <label class="input-label">邮箱</label>
            <input 
              v-model="formData.email" 
              type="email" 
              placeholder="请输入邮箱" 
              class="input-field"
            />
          </div>
          
          <div class="input-group">
            <label class="input-label">设置密码</label>
            <input 
              v-model="formData.password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="请设置密码（至少6位）" 
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
          
          <div class="input-group">
            <label class="input-label">确认密码</label>
            <input 
              v-model="formData.confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              placeholder="请再次输入密码" 
              class="input-field"
            />
            <button 
              class="password-toggle" 
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        
        <div v-if="currentStep === 2" class="step-content animate-fadeIn">
          <div class="avatar-section">
            <p class="input-label">选择头像</p>
            <div class="avatar-options">
              <button 
                v-for="(avatar, index) in avatarOptions" 
                :key="index"
                class="avatar-option"
                :class="{ selected: selectedAvatarIndex === index }"
                @click="selectedAvatarIndex = index"
              >
                <img :src="avatar" :alt="'头像 ' + (index + 1)" />
              </button>
            </div>
          </div>
          
          <div class="input-group">
            <label class="input-label">昵称</label>
            <input 
              v-model="formData.nickname" 
              type="text" 
              placeholder="请输入昵称（可选）" 
              class="input-field"
              maxlength="12"
            />
            <div class="char-count">{{ formData.nickname.length }}/12</div>
          </div>
          
          <div class="input-group">
            <label class="input-label">个人简介（可选）</label>
            <textarea 
              v-model="formData.bio" 
              placeholder="介绍一下自己吧..." 
              class="input-field textarea-field"
              maxlength="100"
              rows="3"
            ></textarea>
            <div class="char-count">{{ formData.bio.length }}/100</div>
          </div>
        </div>
        
        <div class="form-actions">
          <button 
            v-if="currentStep > 1"
            class="btn btn-secondary"
            @click="prevStep"
          >
            上一步
          </button>
          <button 
            class="btn btn-primary"
            :class="{ full: currentStep === 1 }"
            @click="currentStep === 1 ? nextStep() : submitRegister()"
            :disabled="isLoading"
          >
            {{ currentStep === 1 ? '下一步' : (isLoading ? '注册中...' : '完成注册') }}
          </button>
        </div>
        
        <p class="auth-link">
          已有账号？
          <router-link to="/login" class="link-text">立即登录</router-link>
        </p>
      </div>
      
      <div class="auth-footer">
        <p class="privacy-text">
          注册即表示同意
          <a href="#" class="link-text">用户协议</a>
          和
          <a href="#" class="link-text">隐私政策</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const steps = ['账号', '资料']
const currentStep = ref(1)

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const selectedAvatarIndex = ref(0)

const formData = ref({
  email: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  bio: ''
})

const avatarOptions = computed(() => authStore.defaultAvatars)

const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value = 1
  } else if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/login')
  }
}

const nextStep = () => {
  if (!formData.value.email.trim()) {
    alert('请输入邮箱')
    return
  }
  
  if (!formData.value.password) {
    alert('请输入密码')
    return
  }
  
  if (formData.value.password.length < 6) {
    alert('密码至少需要6位')
    return
  }
  
  if (formData.value.password !== formData.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  
  currentStep.value = 2
}

const prevStep = () => {
  currentStep.value = 1
}

const submitRegister = async () => {
  isLoading.value = true
  
  setTimeout(() => {
    const result = authStore.register(
      formData.value.email,
      formData.value.password,
      formData.value.nickname,
      avatarOptions.value[selectedAvatarIndex.value]
    )
    
    isLoading.value = false
    
    if (result.success) {
      authStore.login(formData.value.email, formData.value.password)
      alert('注册成功！欢迎加入树洞社区~')
      router.push('/')
    } else {
      alert(result.message)
    }
  }, 1500)
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
  padding: 20px 0 24px;
}

.logo {
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 48px;
  display: inline-block;
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.auth-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
}

.auth-subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

.auth-form {
  flex-shrink: 0;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 24px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 100%;
  width: 40px;
  height: 2px;
  background: var(--border-color);
}

.step-item.completed:not(:last-child)::after {
  background: var(--success-color);
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  border: 2px solid var(--border-color);
  transition: all var(--transition-normal);
}

.step-item.active .step-number {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-color: transparent;
}

.step-item.completed .step-number {
  background: var(--success-color);
  color: white;
  border-color: transparent;
}

.step-label {
  font-size: 12px;
  color: var(--text-muted);
}

.step-item.active .step-label {
  color: var(--primary-color);
  font-weight: 500;
}

.step-content {
  min-height: 280px;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.char-count {
  text-align: right;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  padding: 4px;
}

.avatar-section {
  margin-bottom: 20px;
}

.avatar-options {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.avatar-option {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid transparent;
  transition: all var(--transition-normal);
}

.avatar-option.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.avatar-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.form-actions .btn {
  flex: 1;
  padding: 14px;
  font-size: 15px;
  font-weight: 500;
}

.form-actions .btn.full {
  flex: 1;
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
