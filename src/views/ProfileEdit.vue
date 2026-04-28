<template>
  <div class="page-container">
    <PageHeader title="编辑资料" showBack>
      <template #actions>
        <button 
          class="btn btn-primary" 
          :style="{ padding: '8px 20px', fontSize: '13px' }"
          @click="saveProfile"
          :disabled="isSaving"
        >
          {{ isSaving ? '保存中...' : '保存' }}
        </button>
      </template>
    </PageHeader>
    
    <div class="page-content">
      <div class="avatar-section card">
        <p class="section-label">头像</p>
        <div class="avatar-selector">
          <div 
            v-for="(avatar, index) in avatarOptions" 
            :key="index"
            class="avatar-option"
            :class="{ selected: selectedAvatarIndex === index }"
            @click="selectedAvatarIndex = index"
          >
            <img :src="avatar" :alt="'头像 ' + (index + 1)" />
            <div v-if="selectedAvatarIndex === index" class="avatar-check">
              ✓
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-section card">
        <div class="input-group">
          <label class="input-label">昵称</label>
          <input 
            v-model="formData.nickname" 
            type="text" 
            placeholder="请输入昵称" 
            class="input-field"
            maxlength="12"
          />
          <div class="char-count">{{ formData.nickname.length }}/12</div>
        </div>
        
        <div class="input-group">
          <label class="input-label">个人简介</label>
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
      
      <div v-if="authStore.currentUser?.isAnonymous" class="hint-section card">
        <div class="hint-icon">💡</div>
        <div class="hint-content">
          <p class="hint-title">当前为匿名用户</p>
          <p class="hint-text">
            您当前是以匿名身份使用，资料修改后仅本次会话有效。
            建议注册账号以永久保存您的信息。
          </p>
          <button class="btn btn-outline" @click="goToRegister">
            注册账号
          </button>
        </div>
      </div>
      
      <div class="form-section card">
        <div class="section-header">
          <span class="section-title">账号设置</span>
        </div>
        
        <div class="input-group">
          <label class="input-label">邮箱</label>
          <input 
            :value="authStore.currentUser?.email || '匿名用户无邮箱'" 
            type="email" 
            class="input-field"
            disabled
          />
          <p class="input-hint" v-if="authStore.currentUser?.isAnonymous">
            注册账号后可设置邮箱
          </p>
        </div>
        
        <div v-if="!authStore.currentUser?.isAnonymous" class="input-group">
          <label class="input-label">修改密码</label>
          <div class="password-fields">
            <input 
              v-model="formData.oldPassword" 
              :type="showOldPassword ? 'text' : 'password'" 
              placeholder="原密码" 
              class="input-field"
            />
            <button 
              class="password-toggle" 
              type="button"
              @click="showOldPassword = !showOldPassword"
            >
              {{ showOldPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <div class="password-fields">
            <input 
              v-model="formData.newPassword" 
              :type="showNewPassword ? 'text' : 'password'" 
              placeholder="新密码（至少6位）" 
              class="input-field"
            />
            <button 
              class="password-toggle" 
              type="button"
              @click="showNewPassword = !showNewPassword"
            >
              {{ showNewPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <div class="password-fields">
            <input 
              v-model="formData.confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              placeholder="确认新密码" 
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const authStore = useAuthStore()

const isSaving = ref(false)
const selectedAvatarIndex = ref(0)

const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = ref({
  nickname: '',
  bio: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const avatarOptions = computed(() => authStore.defaultAvatars)

const goToRegister = () => {
  router.push('/register')
}

const saveProfile = async () => {
  if (!authStore.currentUser) return
  
  isSaving.value = true
  
  setTimeout(() => {
    const updates = {
      nickname: formData.value.nickname || authStore.currentUser.nickname,
      bio: formData.value.bio || authStore.currentUser.bio,
      avatar: avatarOptions.value[selectedAvatarIndex.value]
    }
    
    const result = authStore.updateProfile(updates)
    
    isSaving.value = false
    
    if (result.success) {
      alert('保存成功！')
      router.back()
    } else {
      alert('保存失败：' + result.message)
    }
  }, 800)
}

onMounted(() => {
  if (authStore.currentUser) {
    formData.value.nickname = authStore.currentUser.nickname || ''
    formData.value.bio = authStore.currentUser.bio || ''
    
    const avatarIndex = avatarOptions.value.indexOf(authStore.currentUser.avatar)
    if (avatarIndex !== -1) {
      selectedAvatarIndex.value = avatarIndex
    }
  }
})
</script>

<style scoped>
.avatar-section,
.form-section,
.hint-section {
  margin: 16px;
  padding: 16px;
}

.section-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.avatar-selector {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.avatar-option {
  position: relative;
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid transparent;
  transition: all var(--transition-fast);
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

.avatar-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--success-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.input-group {
  margin-bottom: 20px;
  position: relative;
}

.input-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
}

.input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.char-count {
  text-align: right;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
}

.input-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
}

.password-fields {
  position: relative;
  margin-bottom: 12px;
}

.password-fields:last-child {
  margin-bottom: 0;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  padding: 4px;
}

.hint-section {
  display: flex;
  gap: 12px;
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
}

.hint-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.hint-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.hint-text {
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
</style>
