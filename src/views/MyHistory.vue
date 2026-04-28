<template>
  <div class="page-container">
    <PageHeader title="浏览记录" showBack>
      <template #actions>
        <button 
          v-if="history.length > 0" 
          class="btn-icon" 
          @click="showClearConfirm"
          title="清空记录"
        >
          <span>🗑️</span>
        </button>
      </template>
    </PageHeader>
    
    <div class="page-content">
      <div v-if="history.length === 0" class="empty-state">
        <div class="empty-icon">🕐</div>
        <div class="empty-text">
          还没有浏览记录<br />
          去树洞发现更多内容吧~
        </div>
        <button class="btn btn-primary" @click="goToHome">
          去逛逛
        </button>
      </div>
      
      <div v-else>
        <div class="history-header">
          <span class="history-count">共 {{ history.length }} 条浏览记录</span>
        </div>
        
        <div class="history-list">
          <div 
            v-for="(item, index) in history" 
            :key="item.id"
            class="history-item card animate-fadeIn"
            :style="{ animationDelay: (index * 0.05) + 's' }"
          >
            <div class="history-header">
              <div class="user-info">
                <img :src="item.userAvatar" alt="avatar" class="user-avatar" />
                <div class="user-details">
                  <span class="user-name">{{ item.userName }}</span>
                  <span class="view-time">浏览于 {{ formatViewTime(item.viewedAt || item.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <div class="history-content" @click="goToDetail(item.id)">
              <p>{{ truncateContent(item.content) }}</p>
            </div>
            
            <div v-if="item.emotions && item.emotions.length > 0" class="history-tags">
              <span 
                v-for="emotion in item.emotions" 
                :key="emotion"
                class="tag"
                :class="'tag-' + emotion"
              >
                {{ getEmotionLabel(emotion) }}
              </span>
            </div>
            
            <div class="history-footer">
              <div class="history-stats">
                <span>❤️ {{ item.likes }}</span>
                <span>💬 {{ item.comments }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showClearModal" class="modal-overlay" @click="showClearModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">确认清空</h3>
        <p class="modal-text">确定要清空所有浏览记录吗？此操作不可撤销。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showClearModal = false">取消</button>
          <button class="btn btn-primary" @click="clearHistory">确认清空</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '../stores/posts'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const postsStore = usePostsStore()

const showClearModal = ref(false)

const history = computed(() => postsStore.getHistory())

const emotionLabels = {
  happy: '开心',
  sad: '难过',
  angry: '生气',
  anxious: '焦虑',
  calm: '平静',
  neutral: '普通'
}

const getEmotionLabel = (emotion) => emotionLabels[emotion] || emotion

const formatViewTime = (timeStr) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const truncateContent = (content) => {
  if (!content) return ''
  return content.length > 100 ? content.slice(0, 100) + '...' : content
}

const goToHome = () => {
  router.push('/')
}

const goToDetail = (id) => {
  router.push('/post/' + id)
}

const showClearConfirm = () => {
  showClearModal.value = true
}

const clearHistory = () => {
  localStorage.removeItem('history')
  postsStore.history = []
  showClearModal.value = false
}
</script>

<style scoped>
.history-header {
  padding: 0 16px 12px;
}

.history-count {
  font-size: 12px;
  color: var(--text-muted);
}

.history-list {
  padding: 0 16px 100px;
}

.history-item {
  margin-bottom: 16px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-secondary);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.view-time {
  font-size: 11px;
  color: var(--text-muted);
}

.history-content {
  cursor: pointer;
  margin-bottom: 10px;
}

.history-content p {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.history-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.history-stats {
  display: flex;
  gap: 12px;
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
