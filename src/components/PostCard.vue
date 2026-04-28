<template>
  <div class="card post-card animate-fadeIn" @click="goToDetail">
    <div class="post-header">
      <div class="user-info">
        <img :src="post.userAvatar" alt="avatar" class="user-avatar" @click.stop="handleUserClick" />
        <div class="user-details">
          <span class="user-name">{{ post.userName }}</span>
          <span class="post-time">{{ formatTime(post.createdAt) }}</span>
        </div>
      </div>
      <div class="post-menu">
        <button class="btn-icon menu-btn" @click.stop="toggleMenu">
          <span>⋮</span>
        </button>
        <div v-if="showMenu" class="menu-dropdown">
          <button class="menu-item" @click.stop="blockUser">
            <span>🚫</span> 屏蔽用户
          </button>
          <button class="menu-item" @click.stop="blockPost">
            <span>👁️</span> 屏蔽该动态
          </button>
          <button class="menu-item" @click.stop="showReportModal = true">
            <span>⚠️</span> 举报违规
          </button>
        </div>
      </div>
    </div>
    
    <div class="post-content">
      <p>{{ post.content }}</p>
    </div>
    
    <div v-if="post.images && post.images.length > 0" class="post-images">
      <img 
        v-for="(img, index) in post.images.slice(0, 3)" 
        :key="index"
        :src="img" 
        :alt="'图片 ' + (index + 1)"
        class="post-image"
      />
      <div v-if="post.images.length > 3" class="more-images">
        +{{ post.images.length - 3 }}
      </div>
    </div>
    
    <div v-if="post.emotions && post.emotions.length > 0" class="post-tags">
      <span 
        v-for="emotion in post.emotions" 
        :key="emotion"
        class="tag"
        :class="'tag-' + emotion"
      >
        {{ getEmotionLabel(emotion) }}
      </span>
    </div>
    
    <div v-if="post.aiReply" class="ai-reply">
      <div class="ai-header">
        <span class="ai-badge">🤖 AI 暖心回复</span>
      </div>
      <p class="ai-content">{{ post.aiReply }}</p>
    </div>
    
    <div class="post-actions">
      <button class="action-btn" :class="{ liked: post.isLiked }" @click.stop="handleLike">
        <span class="action-icon">{{ post.isLiked ? '❤️' : '🤍' }}</span>
        <span class="action-count">{{ post.likes }}</span>
      </button>
      
      <button class="action-btn" @click.stop="goToDetail">
        <span class="action-icon">💬</span>
        <span class="action-count">{{ post.comments }}</span>
      </button>
      
      <button class="action-btn" :class="{ favorited: post.isFavorite }" @click.stop="handleFavorite">
        <span class="action-icon">{{ post.isFavorite ? '⭐' : '☆' }}</span>
        <span class="action-count">收藏</span>
      </button>
    </div>
    
    <div v-if="showReportModal" class="modal-overlay" @click.stop="closeReportModal">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">举报违规内容</h3>
        <div class="report-reasons">
          <button 
            v-for="reason in reportReasons" 
            :key="reason"
            class="report-reason-btn"
            :class="{ selected: selectedReason === reason }"
            @click="selectedReason = reason"
          >
            {{ reason }}
          </button>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeReportModal">取消</button>
          <button class="btn btn-primary" @click="submitReport" :disabled="!selectedReason">提交举报</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '../stores/posts'

const props = defineProps({
  post: { type: Object, required: true }
})

const router = useRouter()
const postsStore = usePostsStore()

const showMenu = ref(false)
const showReportModal = ref(false)
const selectedReason = ref('')

const reportReasons = [
  '垃圾广告',
  '色情低俗',
  '暴力恐怖',
  '侮辱谩骂',
  '虚假信息',
  '其他'
]

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

const goToDetail = () => {
  router.push('/post/' + props.post.id)
}

const handleLike = () => {
  postsStore.toggleLike(props.post.id)
}

const handleFavorite = () => {
  postsStore.toggleFavorite(props.post.id)
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const blockUser = () => {
  postsStore.blockUser(props.post.userId)
  showMenu.value = false
}

const blockPost = () => {
  postsStore.blockPost(props.post.id)
  showMenu.value = false
}

const handleUserClick = () => {
  // 匿名模式下不显示用户资料
}

const closeReportModal = () => {
  showReportModal.value = false
  selectedReason.value = ''
}

const submitReport = () => {
  if (selectedReason.value) {
    postsStore.reportPost(props.post.id, selectedReason.value)
    closeReportModal()
    showMenu.value = false
    alert('举报已提交，感谢您的反馈！')
  }
}
</script>

<style scoped>
.post-card {
  cursor: pointer;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
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
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.post-time {
  font-size: 12px;
  color: var(--text-muted);
}

.post-menu {
  position: relative;
}

.menu-btn {
  width: 32px;
  height: 32px;
  font-size: 18px;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 20px var(--shadow-color);
  min-width: 140px;
  z-index: 10;
  padding: 8px 0;
}

.menu-item {
  width: 100%;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-primary);
  transition: background var(--transition-fast);
}

.menu-item:hover {
  background: var(--bg-secondary);
}

.post-content {
  margin-bottom: 12px;
}

.post-content p {
  font-size: 15px;
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

.more-images {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-secondary);
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.ai-reply {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.ai-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  font-size: 12px;
  font-weight: 500;
  border-radius: var(--radius-lg);
}

.ai-content {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.action-btn:hover {
  color: var(--primary-color);
}

.action-btn.liked {
  color: var(--error-color);
}

.action-btn.favorited {
  color: var(--warning-color);
}

.action-icon {
  font-size: 18px;
}

.action-count {
  font-size: 12px;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  text-align: center;
}

.report-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.report-reason-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  transition: all var(--transition-fast);
}

.report-reason-btn.selected {
  border-color: var(--primary-color);
  background: var(--primary-light);
  color: var(--primary-color);
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions .btn {
  flex: 1;
}
</style>
