<template>
  <div class="page-container">
    <PageHeader title="树洞详情" showBack />
    
    <div class="page-content" v-if="post">
      <div class="detail-card card">
        <div class="post-header">
          <div class="user-info">
            <img :src="post.userAvatar" alt="avatar" class="user-avatar" />
            <div class="user-details">
              <span class="user-name">{{ post.userName }}</span>
              <span class="post-time">{{ formatTime(post.createdAt) }}</span>
            </div>
          </div>
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
          <button class="action-btn" :class="{ liked: post.isLiked }" @click="handleLike">
            <span class="action-icon">{{ post.isLiked ? '❤️' : '🤍' }}</span>
            <span class="action-count">{{ post.likes }}</span>
          </button>
          
          <button class="action-btn">
            <span class="action-icon">💬</span>
            <span class="action-count">{{ post.commentList?.length || post.comments }}</span>
          </button>
          
          <button class="action-btn" :class="{ favorited: post.isFavorite }" @click="handleFavorite">
            <span class="action-icon">{{ post.isFavorite ? '⭐' : '☆' }}</span>
            <span class="action-count">收藏</span>
          </button>
        </div>
      </div>
      
      <div class="comments-section">
        <div class="section-header">
          <span class="section-title">评论 ({{ post.commentList?.length || 0 }})</span>
        </div>
        
        <div v-if="!post.commentList || post.commentList.length === 0" class="empty-comments">
          <div class="empty-icon">💬</div>
          <p>还没有评论，来发表第一条吧~</p>
        </div>
        
        <div v-else class="comments-list">
          <div v-for="comment in post.commentList" :key="comment.id" class="comment-item">
            <img :src="comment.userAvatar" alt="avatar" class="comment-avatar" />
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.userName }}</span>
                <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="comment-input-area safe-area-bottom">
      <input 
        v-model="commentText" 
        type="text" 
        placeholder="说点什么..." 
        class="comment-input"
        @keyup.enter="submitComment"
      />
      <button 
        class="btn btn-primary" 
        :style="{ padding: '10px 20px' }"
        @click="submitComment"
        :disabled="!commentText.trim()"
      >
        发送
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePostsStore } from '../stores/posts'
import { useAuthStore } from '../stores/auth'
import PageHeader from '../components/PageHeader.vue'

const route = useRoute()
const postsStore = usePostsStore()
const authStore = useAuthStore()

const post = ref(null)
const commentText = ref('')

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

const handleLike = () => {
  postsStore.toggleLike(post.value.id)
}

const handleFavorite = () => {
  postsStore.toggleFavorite(post.value.id)
}

const submitComment = () => {
  if (!commentText.value.trim()) return
  
  if (!authStore.isLoggedIn) {
    authStore.anonymousLogin()
  }
  
  const result = postsStore.addComment(post.value.id, commentText.value)
  if (result.success) {
    commentText.value = ''
  }
}

onMounted(() => {
  const postId = route.params.id
  post.value = postsStore.getPostById(postId)
})
</script>

<style scoped>
.detail-card {
  margin: 16px;
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
  width: 44px;
  height: 44px;
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

.post-content {
  margin-bottom: 16px;
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
  margin-bottom: 16px;
}

.post-image {
  width: 100%;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  max-height: 400px;
  object-fit: contain;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.ai-reply {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 16px;
}

.ai-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  font-size: 12px;
  font-weight: 500;
  border-radius: var(--radius-lg);
}

.ai-content {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 32px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
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
  font-size: 22px;
}

.action-count {
  font-size: 13px;
}

.comments-section {
  padding: 0 16px 100px;
}

.section-header {
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-comments {
  text-align: center;
  padding: 40px 0;
}

.empty-comments .empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-comments p {
  font-size: 14px;
  color: var(--text-muted);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.comment-author {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.comment-time {
  font-size: 11px;
  color: var(--text-muted);
}

.comment-text {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.comment-input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  z-index: 100;
}

.comment-input {
  flex: 1;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 14px;
  color: var(--text-primary);
}

.comment-input:focus {
  border-color: var(--primary-color);
  background: var(--bg-card);
}

.comment-input::placeholder {
  color: var(--text-muted);
}
</style>
