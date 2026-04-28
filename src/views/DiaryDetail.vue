<template>
  <div class="page-container">
    <PageHeader :title="pageTitle" showBack>
      <template #actions>
        <button v-if="diary" class="btn-icon" @click="showDeleteConfirm = true">
          <span>🗑️</span>
        </button>
      </template>
    </PageHeader>
    
    <div class="page-content">
      <div class="date-section card">
        <div class="date-display">
          <span class="date-number">{{ dateDay }}</span>
          <div class="date-info">
            <span class="date-month">{{ dateMonth }}</span>
            <span class="date-weekday">{{ dateWeekday }}</span>
          </div>
        </div>
      </div>
      
      <div class="mood-section card">
        <p class="section-label">今天的心情</p>
        <div class="mood-grid">
          <button 
            v-for="mood in availableMoods" 
            :key="mood.key"
            class="mood-item"
            :class="{ selected: selectedMood === mood.key }"
            @click="selectedMood = mood.key"
          >
            <span class="mood-emoji">{{ mood.emoji }}</span>
            <span class="mood-text">{{ mood.label }}</span>
          </button>
        </div>
      </div>
      
      <div class="content-section card">
        <p class="section-label">写下你的心情</p>
        <textarea 
          v-model="content"
          class="input-field textarea-field diary-textarea"
          placeholder="今天发生了什么？有什么感受？记录下来吧..."
          maxlength="1000"
          rows="8"
        ></textarea>
        <div class="char-count">{{ content.length }}/1000</div>
      </div>
      
      <div class="tags-section card">
        <p class="section-label">添加标签（可选）</p>
        <div class="tags-input">
          <div class="selected-tags">
            <span v-for="tag in selectedTags" :key="tag" class="selected-tag">
              #{{ tag }}
              <button @click="removeTag(tag)">×</button>
            </span>
          </div>
          <input 
            v-model="newTag"
            type="text"
            placeholder="输入标签后按回车添加"
            class="tag-input"
            @keyup.enter="addTag"
          />
        </div>
        <div class="recommended-tags">
          <span class="recommend-label">推荐：</span>
          <button 
            v-for="tag in recommendedTags" 
            :key="tag"
            class="recommend-tag"
            @click="toggleRecommendTag(tag)"
            :class="{ active: selectedTags.includes(tag) }"
          >
            #{{ tag }}
          </button>
        </div>
      </div>
      
      <div class="images-section card">
        <p class="section-label">添加图片（可选）</p>
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
          <div v-if="selectedImages.length < 6" class="upload-btn" @click="triggerUpload">
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
      
      <div class="action-section">
        <button 
          class="btn btn-primary submit-btn" 
          @click="saveDiary"
          :disabled="!canSave"
        >
          {{ isSaving ? '保存中...' : '保存日记' }}
        </button>
      </div>
    </div>
    
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">确认删除</h3>
        <p class="modal-text">确定要删除这篇日记吗？删除后无法恢复。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteConfirm = false">取消</button>
          <button class="btn btn-primary" @click="deleteDiary">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDiaryStore } from '../stores/diary'
import { useAuthStore } from '../stores/auth'
import PageHeader from '../components/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const diaryStore = useDiaryStore()
const authStore = useAuthStore()

const date = ref('')
const diary = ref(null)

const selectedMood = ref('neutral')
const content = ref('')
const selectedTags = ref([])
const newTag = ref('')
const selectedImages = ref([])
const fileInput = ref(null)

const isSaving = ref(false)
const showDeleteConfirm = ref(false)

const recommendedTags = ['工作', '学习', '生活', '朋友', '家人', '恋爱', '运动', '旅行']

const availableMoods = computed(() => diaryStore.availableMoods)

const pageTitle = computed(() => {
  return date.value === new Date().toISOString().split('T')[0] ? '今日心情' : '编辑日记'
})

const dateDay = computed(() => {
  return new Date(date.value).getDate()
})

const dateMonth = computed(() => {
  const d = new Date(date.value)
  return `${d.getMonth() + 1}月`
})

const dateWeekday = computed(() => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[new Date(date.value).getDay()]
})

const canSave = computed(() => {
  return selectedMood.value !== 'neutral' || content.value.trim()
})

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return
  
  for (const file of files) {
    if (selectedImages.value.length >= 6) break
    
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

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !selectedTags.value.includes(tag) && selectedTags.value.length < 5) {
    selectedTags.value.push(tag)
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index !== -1) {
    selectedTags.value.splice(index, 1)
  }
}

const toggleRecommendTag = (tag) => {
  if (selectedTags.value.includes(tag)) {
    removeTag(tag)
  } else if (selectedTags.value.length < 5) {
    selectedTags.value.push(tag)
  }
}

const saveDiary = async () => {
  if (!canSave.value) return
  if (!authStore.currentUser) return
  
  isSaving.value = true
  
  setTimeout(() => {
    const result = diaryStore.createDiary(
      selectedMood.value,
      content.value,
      selectedTags.value,
      selectedImages.value,
      date.value
    )
    
    isSaving.value = false
    
    if (result.success) {
      alert('日记已保存~')
      router.back()
    } else {
      alert('保存失败：' + result.message)
    }
  }, 800)
}

const deleteDiary = async () => {
  if (!diary.value) return
  
  const result = diaryStore.deleteDiary(diary.value.id)
  showDeleteConfirm.value = false
  
  if (result.success) {
    alert('日记已删除')
    router.back()
  }
}

onMounted(() => {
  date.value = route.params.date || new Date().toISOString().split('T')[0]
  
  if (authStore.currentUser) {
    const existing = diaryStore.getDiaryByDate(authStore.currentUser.id, date.value)
    if (existing) {
      diary.value = existing
      selectedMood.value = existing.mood
      content.value = existing.content || ''
      selectedTags.value = existing.tags ? [...existing.tags] : []
      selectedImages.value = existing.images ? [...existing.images] : []
    }
  }
})
</script>

<style scoped>
.date-section {
  margin: 16px;
  padding: 20px;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-number {
  font-size: 40px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-month {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.date-weekday {
  font-size: 13px;
  color: var(--text-muted);
}

.mood-section,
.content-section,
.tags-section,
.images-section {
  margin: 0 16px 16px;
  padding: 16px;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

.mood-item.selected {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.mood-emoji {
  font-size: 28px;
}

.mood-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.mood-item.selected .mood-text {
  color: var(--primary-color);
  font-weight: 500;
}

.diary-textarea {
  min-height: 160px;
  font-size: 15px;
  line-height: 2;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
  border-radius: var(--radius-lg);
  font-size: 13px;
  color: var(--text-secondary);
}

.selected-tag button {
  font-size: 14px;
  color: var(--text-muted);
  padding: 0 2px;
}

.tag-input {
  flex: 1;
  min-width: 80px;
  font-size: 13px;
  color: var(--text-primary);
  background: transparent;
}

.tag-input::placeholder {
  color: var(--text-muted);
}

.recommended-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.recommend-label {
  font-size: 12px;
  color: var(--text-muted);
}

.recommend-tag {
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 10px;
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  transition: all var(--transition-fast);
}

.recommend-tag.active {
  background: var(--primary-light);
  color: var(--primary-color);
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
}

.upload-btn {
  aspect-ratio: 1;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--bg-secondary);
}

.upload-btn:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.upload-icon {
  font-size: 24px;
}

.upload-text {
  font-size: 11px;
  color: var(--text-muted);
}

.action-section {
  padding: 16px 16px 100px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 500;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  text-align: center;
}

.modal-text {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions .btn {
  flex: 1;
}
</style>
