<template>
  <div class="page-container">
    <PageHeader title="发布树洞" showBack>
      <template #actions>
        <button 
          class="btn btn-primary" 
          :style="{ padding: '8px 20px', fontSize: '13px' }"
          @click="submitPost"
          :disabled="!canSubmit || isSubmitting"
        >
          {{ isSubmitting ? '发布中...' : '发布' }}
        </button>
      </template>
    </PageHeader>
    
    <div class="page-content">
      <div class="post-form">
        <div class="input-group">
          <label class="input-label">想说的话</label>
          <textarea 
            v-model="content" 
            placeholder="在这里倾诉你的心事... 所有内容将匿名发布，不必担心被认出来哦~"
            class="input-field textarea-field"
            maxlength="500"
            rows="8"
          ></textarea>
          <div class="char-count">{{ content.length }}/500</div>
        </div>
        
        <div class="input-group">
          <label class="input-label">添加图片 (可选)</label>
          <div class="image-upload-area">
            <div 
              v-for="(img, index) in selectedImages" 
              :key="index"
              class="uploaded-image"
            >
              <img :src="img" alt="图片" />
              <button class="remove-image" @click="removeImage(index)">
                ×
              </button>
            </div>
            <div v-if="selectedImages.length < 9" class="upload-btn" @click="triggerUpload">
              <div class="upload-icon">📷</div>
              <span class="upload-text">添加图片</span>
            </div>
            <input 
              type="file" 
              ref="fileInput"
              accept="image/*"
              multiple
              @change="handleFileSelect"
              style="display: none;"
            />
          </div>
        </div>
        
        <div class="input-group">
          <div class="toggle-option">
            <div class="toggle-info">
              <div class="toggle-icon">🕵️</div>
              <div>
                <div class="toggle-title">匿名发布</div>
                <div class="toggle-desc">发布后将显示随机昵称，保护你的隐私</div>
              </div>
            </div>
            <div 
              class="toggle-switch" 
              :class="{ active: isAnonymous }"
              @click="isAnonymous = !isAnonymous"
            >
              <div class="toggle-thumb"></div>
            </div>
          </div>
        </div>
        
        <div class="privacy-notice">
          <div class="notice-icon">🔒</div>
          <div class="notice-text">
            <p>隐私保护说明</p>
            <ul>
              <li>所有发布内容默认匿名，除非您主动取消匿名</li>
              <li>我们不会收集或分享您的个人信息</li>
              <li>您可以随时删除自己发布的内容</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '../stores/posts'
import { useAuthStore } from '../stores/auth'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const postsStore = usePostsStore()
const authStore = useAuthStore()

const content = ref('')
const selectedImages = ref([])
const isAnonymous = ref(true)
const isSubmitting = ref(false)
const fileInput = ref(null)

const canSubmit = computed(() => {
  return content.value.trim().length > 0
})

const sampleImages = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=peaceful%20sunset%20over%20lake%20pastel%20colors&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=soft%20clouds%20in%20pink%20sky&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20sleeping%20peacefully&image_size=square'
]

const triggerUpload = () => {
  if (selectedImages.value.length >= 3) {
    alert('最多只能添加3张图片哦~')
    return
  }
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return
  
  for (const file of files) {
    if (selectedImages.value.length >= 3) break
    
    const reader = new FileReader()
    reader.onload = (event) => {
      selectedImages.value.push(event.target.result)
    }
    reader.readAsDataURL(file)
  }
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeImage = (index) => {
  selectedImages.value.splice(index, 1)
}

const submitPost = async () => {
  if (!canSubmit.value || isSubmitting.value) return
  
  if (!authStore.isLoggedIn) {
    const result = authStore.anonymousLogin()
    if (!result.success) {
      alert('登录失败，请重试')
      return
    }
  }
  
  isSubmitting.value = true
  
  setTimeout(() => {
    const imagesToUse = selectedImages.value.length > 0 
      ? selectedImages.value 
      : (Math.random() > 0.5 ? [sampleImages[Math.floor(Math.random() * sampleImages.length)]] : [])
    
    const result = postsStore.createPost(
      content.value,
      imagesToUse,
      isAnonymous.value
    )
    
    isSubmitting.value = false
    
    if (result.success) {
      alert('发布成功！AI 正在分析您的情绪...')
      router.push('/')
    } else {
      alert('发布失败：' + result.message)
    }
  }, 1500)
}
</script>

<style scoped>
.post-form {
  padding: 16px;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}

.image-upload-area {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.uploaded-image {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-secondary);
}

.uploaded-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-btn {
  aspect-ratio: 1;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--bg-secondary);
}

.upload-btn:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.upload-icon {
  font-size: 28px;
}

.upload-text {
  font-size: 12px;
  color: var(--text-muted);
}

.toggle-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 12px var(--shadow-light);
}

.toggle-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-icon {
  font-size: 28px;
}

.toggle-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.toggle-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.toggle-switch {
  width: 48px;
  height: 28px;
  background: var(--bg-secondary);
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: background var(--transition-fast);
  border: 1px solid var(--border-color);
}

.toggle-switch.active {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-color: transparent;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: left var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-switch.active .toggle-thumb {
  left: 23px;
}

.privacy-notice {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
  border-radius: var(--radius-md);
  margin-top: 16px;
}

.notice-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.notice-text p {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.notice-text ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notice-text li {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
  position: relative;
  padding-left: 12px;
}

.notice-text li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
}
</style>
