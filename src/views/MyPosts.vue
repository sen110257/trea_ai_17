<template>
  <div class="page-container">
    <PageHeader title="我的发帖" showBack />
    
    <div class="page-content">
      <div v-if="myPosts.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <div class="empty-text">
          还没有发布过帖子<br />
          去树洞发布你的第一条心情吧~
        </div>
        <button class="btn btn-primary" @click="goToPost">
          发布帖子
        </button>
      </div>
      
      <div v-else class="posts-list">
        <div 
          v-for="post in myPosts" 
          :key="post.id"
          class="post-item card"
        >
          <div class="post-header" @click="goToDetail(post.id)">
            <div class="post-info">
              <span class="post-time">{{ formatTime(post.createdAt) }}</span>
              <div v-if="post.emotions && post.emotions.length > 0" class="post-tags">
                <span 
                  v-for="emotion in post.emotions" 
                  :key="emotion"
                  class="tag"
                  :class="'tag-' + emotion"
                  style="font-size: 11px; padding: 2px 8px;"
                >
                  {{ getEmotionLabel(emotion) }}
                </span>
              </div>
            </div>
            <button class="delete-btn" @click.stop="showDeleteConfirm(post.id)">
              🗑️
            </button>
          </div>
          
          <div class="post-content" @click="goToDetail(post.id)">
            <p>{{ truncateContent(post.content) }}</p>
          </div>
          
          <div v-if="post.images && post.images.length > 0" class="post-images" @click="goToDetail(post.id)">
            <img 
              v-for="(img, index) in post.images.slice(0, 3)" 
              :key="index"
              :src="img" 
              alt="图片"
              class="post-image"
            />
          </div>
          
          <div class="post-stats">
            <div class="stat-item">
              <span>❤️ {{ post.likes }}</span>
            </div>
            <div class="stat-item">
              <span>💬 {{ post.comments }}</span>
            </div>
            <div class="stat-item">
              <span>{{ post.isAnonymous ? '🕵️ 匿名' : '公开' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="deletePostId" class="modal-overlay" @click="deletePostId = null">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">确认删除</h3>
        <p class="modal-text">确定要删除这条帖子吗？删除后无法恢复。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="deletePostId = null">取消</button>
          <button class="btn btn-primary" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePostsStore } from '../stores/posts'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const authStore = useAuthStore()
const postsStore = usePostsStore()

const deletePostId = ref(null)

const myPosts = computed(() => {
  if (!authStore.currentUser) return []
  return postsStore.getUserPosts(authStore.currentUser.id)
})

const emotionLabels = {
  happy: '开心',
  sad: '难过',
  angry: '生气',
  anxious: '焦虑',
  calm: '平静',
  neutral: '普通'
}

const getEmotionLabel = (emotion) => emotionLabels[emotion] || emotion

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

const goToPost = () => {
  router.push('/post')
}

const goToDetail = (id) => {
  router.push('/post/' + id)
}

const showDeleteConfirm = (id) => {
  deletePostId.value = id
}

const confirmDelete = () => {
  if (!deletePostId.value) return
  
  const result = postsStore.deletePost(deletePostId.value)
  deletePostId.value = null
  
  if (result.success) {
    alert('已删除')
  }
}
</script>

<style scoped>
.posts-list {
  padding: 16px 16px 100px;
}

.post-item {
  cursor: pointer;
  margin-bottom: 16px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.post-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.post-time {
  font-size: 12px;
  color: var(--text-muted);
}

.post-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.delete-btn {
  font-size: 18px;
  padding: 4px;
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.delete-btn:hover {
  opacity: 1;
}

.post-content {
  margin-bottom: 12px;
}

.post-content p {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.post-stats {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.stat-item {
  font-size: 12px;
  color: var(--text-muted);
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
