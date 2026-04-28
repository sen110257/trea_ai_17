<template>
  <div class="page-container">
    <PageHeader title="私密内容" showBack>
      <template #actions>
        <button class="btn-icon" @click="showDeleteConfirm = true">
          <span>🗑️</span>
        </button>
      </template>
    </PageHeader>
    
    <div class="page-content" v-if="post">
      <div class="detail-card card">
        <div class="post-header">
          <div class="post-mood">
            <span class="mood-emoji">{{ getMoodEmoji(post.mood) }}</span>
            <span class="mood-label">{{ getMoodLabel(post.mood) }}</span>
          </div>
          <span class="post-time">{{ formatTime(post.createdAt) }}</span>
        </div>
        
        <div class="post-content">
          <p>{{ post.content }}</p>
        </div>
        
        <div v-if="post.images && post.images.length > 0" class="post-images">
          <img 
            v-for="(img, index) in post.images" 
            :key="index"
            :src="img" 
            :alt="'图片 ' + (index + 1)"
            class="post-image"
          />
        </div>
      </div>
      
      <div class="privacy-hint card">
        <div class="hint-icon">🔒</div>
        <p class="hint-text">
          此内容仅你可见<br />
          你的隐私被完全保护
        </p>
      </div>
    </div>
    
    <div v-else class="empty-state" style="height: calc(100% - 120px);">
      <div class="empty-icon">🔍</div>
      <div class="empty-text">内容不存在或已被删除</div>
      <button class="btn btn-primary" @click="goBack">
        返回
      </button>
    </div>
    
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">确认删除</h3>
        <p class="modal-text">确定要删除这条私密内容吗？删除后无法恢复。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteConfirm = false">取消</button>
          <button class="btn btn-primary" @click="deletePost">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDiaryStore } from '../stores/diary'
import PageHeader from '../components/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const diaryStore = useDiaryStore()

const post = ref(null)
const showDeleteConfirm = ref(false)

const getMoodEmoji = (mood) => diaryStore.getMoodEmoji(mood)
const getMoodLabel = (mood) => diaryStore.getMoodLabel(mood)

const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goBack = () => {
  router.back()
}

const deletePost = () => {
  if (!post.value) return
  
  const result = diaryStore.deletePrivatePost(post.value.id)
  showDeleteConfirm.value = false
  
  if (result.success) {
    alert('已删除')
    router.back()
  }
}

onMounted(() => {
  const postId = route.params.id
  const allPosts = diaryStore.privatePosts
  post.value = allPosts.find(p => p.id === postId) || null
})
</script>

<style scoped>
.detail-card {
  margin: 16px;
  padding: 20px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.post-mood {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mood-emoji {
  font-size: 36px;
}

.mood-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.post-time {
  font-size: 13px;
  color: var(--text-muted);
}

.post-content {
  margin-bottom: 20px;
}

.post-content p {
  font-size: 16px;
  line-height: 2;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.post-images {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-image {
  width: 100%;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  max-height: 500px;
  object-fit: contain;
}

.privacy-hint {
  margin: 0 16px 100px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
}

.hint-icon {
  font-size: 28px;
}

.hint-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
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
