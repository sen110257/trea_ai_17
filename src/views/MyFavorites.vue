<template>
  <div class="page-container">
    <PageHeader title="我的收藏" showBack />
    
    <div class="page-content">
      <div v-if="favorites.length === 0" class="empty-state">
        <div class="empty-icon">⭐</div>
        <div class="empty-text">
          还没有收藏的内容<br />
          在树洞看到喜欢的内容就收藏起来吧~
        </div>
        <button class="btn btn-primary" @click="goToHome">
          去逛逛
        </button>
      </div>
      
      <div v-else class="posts-list">
        <div 
          v-for="(item, index) in favorites" 
          :key="item.id"
          class="post-item card animate-fadeIn"
          :style="{ animationDelay: (index * 0.05) + 's' }"
        >
          <div class="post-header">
            <div class="user-info">
              <img :src="item.userAvatar" alt="avatar" class="user-avatar" />
              <div class="user-details">
                <span class="user-name">{{ item.userName }}</span>
                <span class="post-time">{{ formatTime(item.favoritedAt || item.createdAt) }}</span>
              </div>
            </div>
            <button class="unfavorite-btn" @click="unfavorite(item.id)">
              取消收藏
            </button>
          </div>
          
          <div class="post-content" @click="goToDetail(item.id)">
            <p>{{ truncateContent(item.content) }}</p>
          </div>
          
          <div v-if="item.emotions && item.emotions.length > 0" class="post-tags">
            <span 
              v-for="emotion in item.emotions" 
              :key="emotion"
              class="tag"
              :class="'tag-' + emotion"
            >
              {{ getEmotionLabel(emotion) }}
            </span>
          </div>
          
          <div class="post-footer">
            <div class="post-stats">
              <span>❤️ {{ item.likes }}</span>
              <span>💬 {{ item.comments }}</span>
            </div>
            <span class="view-detail" @click="goToDetail(item.id)">
              查看详情 →
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '../stores/posts'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const postsStore = usePostsStore()

const favorites = computed(() => postsStore.getFavorites())

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
  return content.length > 120 ? content.slice(0, 120) + '...' : content
}

const goToHome = () => {
  router.push('/')
}

const goToDetail = (id) => {
  router.push('/post/' + id)
}

const unfavorite = (id) => {
  if (confirm('确定要取消收藏吗？')) {
    postsStore.toggleFavorite(id)
  }
}
</script>

<style scoped>
.posts-list {
  padding: 16px 16px 100px;
}

.post-item {
  margin-bottom: 16px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
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

.post-time {
  font-size: 11px;
  color: var(--text-muted);
}

.unfavorite-btn {
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
}

.post-content {
  cursor: pointer;
  margin-bottom: 12px;
}

.post-content p {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.post-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.view-detail {
  font-size: 12px;
  color: var(--primary-color);
  cursor: pointer;
}
</style>
