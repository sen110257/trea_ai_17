<template>
  <div class="page-container">
    <PageHeader title="私密树洞">
      <template #actions>
        <button class="btn-icon" @click="showCreateModal = true">
          <span>✏️</span>
        </button>
      </template>
    </PageHeader>
    
    <div class="page-content">
      <div class="privacy-notice card">
        <div class="notice-icon">🔒</div>
        <div class="notice-content">
          <h3 class="notice-title">完全私密的空间</h3>
          <p class="notice-text">
            这里是专属于你的私密树洞，所有内容仅你可见。
            可以放心地写下任何心事，不必担心被他人看到。
          </p>
        </div>
      </div>
      
      <div v-if="privatePosts.length === 0" class="empty-state">
        <div class="empty-icon">🔐</div>
        <div class="empty-text">
          还没有私密内容<br />
          点击右上角按钮开始记录
        </div>
        <button class="btn btn-primary" @click="showCreateModal = true">
          写下心事
        </button>
      </div>
      
      <div v-else class="private-posts">
        <div 
          v-for="post in privatePosts" 
          :key="post.id"
          class="private-post card animate-fadeIn"
          @click="goToDetail(post.id)"
        >
          <div class="post-header">
            <div class="post-mood">
              <span class="mood-emoji">{{ getMoodEmoji(post.mood) }}</span>
              <span class="mood-label">{{ getMoodLabel(post.mood) }}</span>
            </div>
            <span class="post-time">{{ formatTime(post.createdAt) }}</span>
          </div>
          
          <div class="post-content">
            <p>{{ truncateContent(post.content) }}</p>
          </div>
          
          <div v-if="post.images && post.images.length > 0" class="post-images">
            <img 
              v-for="(img, index) in post.images.slice(0, 3)" 
              :key="index"
              :src="img" 
              alt="图片"
              class="post-image"
            />
            <div v-if="post.images.length > 3" class="more-images">
              +{{ post.images.length - 3 }}
            </div>
          </div>
          
          <div class="post-actions">
            <button class="action-btn" @click.stop="goToDetail(post.id)">
              查看详情 →
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <BottomNav />
    
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content create-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">写下心事</h3>
          <button class="close-btn" @click="closeCreateModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="mood-selector">
            <p class="input-label">选择心情</p>
            <div class="mood-options">
              <button 
                v-for="mood in quickMoods" 
                :key="mood.key"
                class="mood-option"
                :class="{ selected: newPostMood === mood.key }"
                @click="newPostMood = mood.key"
              >
                <span class="mood-emoji">{{ mood.emoji }}</span>
                <span class="mood-text">{{ mood.label }}</span>
              </button>
            </div>
          </div>
          
          <div class="input-group">
            <label class="input-label">内容</label>
            <textarea 
              v-model="newPostContent"
              class="input-field textarea-field"
              placeholder="在这里写下你的心事... 只有你能看到"
              maxlength="2000"
              rows="6"
            ></textarea>
            <div class="char-count">{{ newPostContent.length }}/2000</div>
          </div>
          
          <div class="image-upload">
            <p class="input-label">添加图片（可选）</p>
            <div class="image-upload-area">
              <div 
                v-for="(img, index) in newPostImages" 
                :key="index"
                class="uploaded-image"
              >
                <img :src="img" alt="图片" />
                <button class="remove-image" @click="removeNewImage(index)">
                  ×
                </button>
              </div>
              <div v-if="newPostImages.length < 6" class="upload-btn" @click="triggerFileUpload">
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
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeCreateModal">取消</button>
          <button 
            class="btn btn-primary" 
            @click="submitNewPost"
            :disabled="!canSubmit || isSubmitting"
          >
            {{ isSubmitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDiaryStore } from '../stores/diary'
import { useAuthStore } from '../stores/auth'
import PageHeader from '../components/PageHeader.vue'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()
const diaryStore = useDiaryStore()
const authStore = useAuthStore()

const showCreateModal = ref(false)
const newPostMood = ref('neutral')
const newPostContent = ref('')
const newPostImages = ref([])
const fileInput = ref(null)
const isSubmitting = ref(false)

const quickMoods = computed(() => diaryStore.availableMoods.slice(0, 8))

const privatePosts = computed(() => {
  if (!authStore.currentUser) return []
  return diaryStore.getUserPrivatePosts(authStore.currentUser.id)
})

const canSubmit = computed(() => {
  return newPostContent.value.trim().length > 0
})

const getMoodEmoji = (mood) => diaryStore.getMoodEmoji(mood)
const getMoodLabel = (mood) => diaryStore.getMoodLabel(mood)

const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  
  return date.toLocaleDateString('zh-CN')
}

const truncateContent = (content) => {
  if (!content) return ''
  return content.length > 100 ? content.slice(0, 100) + '...' : content
}

const goToDetail = (id) => {
  router.push('/private/' + id)
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newPostMood.value = 'neutral'
  newPostContent.value = ''
  newPostImages.value = []
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return
  
  for (const file of files) {
    if (newPostImages.value.length >= 6) break
    
    const reader = new FileReader()
    reader.onload = (event) => {
      newPostImages.value.push(event.target.result)
    }
    reader.readAsDataURL(file)
  }
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeNewImage = (index) => {
  newPostImages.value.splice(index, 1)
}

const submitNewPost = async () => {
  if (!canSubmit.value || isSubmitting.value) return
  if (!authStore.currentUser) return
  
  isSubmitting.value = true
  
  setTimeout(() => {
    const result = diaryStore.createPrivatePost(
      newPostContent.value,
      newPostImages.value,
      newPostMood.value
    )
    
    isSubmitting.value = false
    
    if (result.success) {
      closeCreateModal()
      alert('已保存到私密树洞~')
    }
  }, 800)
}
</script>

<style scoped>
.privacy-notice {
  margin: 16px;
  padding: 16px;
  display: flex;
  gap: 12px;
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
}

.notice-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.notice-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.notice-text {
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-muted);
}

.private-posts {
  padding: 0 16px 80px;
}

.private-post {
  cursor: pointer;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.post-mood {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mood-emoji {
  font-size: 24px;
}

.mood-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.post-time {
  font-size: 12px;
  color: var(--text-muted);
}

.post-content {
  margin-bottom: 12px;
}

.post-content p {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.post-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
}

.more-images {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
}

.post-actions {
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  font-size: 13px;
  color: var(--primary-color);
  font-weight: 500;
}

.create-modal {
  max-width: 90%;
  width: 380px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text-secondary);
}

.modal-body {
  padding: 20px;
}

.mood-selector {
  margin-bottom: 20px;
}

.mood-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.mood-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

.mood-option.selected {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.mood-emoji {
  font-size: 24px;
}

.mood-text {
  font-size: 11px;
  color: var(--text-secondary);
}

.mood-option.selected .mood-text {
  color: var(--primary-color);
  font-weight: 500;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
}

.char-count {
  text-align: right;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
}

.image-upload {
  margin-bottom: 20px;
}

.image-upload-area {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
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
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn {
  aspect-ratio: 1;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--bg-secondary);
}

.upload-btn:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.upload-icon {
  font-size: 20px;
}

.upload-text {
  font-size: 10px;
  color: var(--text-muted);
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

.modal-actions .btn {
  flex: 1;
  padding: 12px;
  font-size: 14px;
}
</style>
