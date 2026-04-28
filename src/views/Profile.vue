<template>
  <div class="page-container">
    <PageHeader title="我的">
      <template #actions>
        <button class="btn-icon" @click="goToSettings">
          <span>⚙️</span>
        </button>
      </template>
    </PageHeader>
    
    <div class="page-content">
      <div v-if="authStore.isLoggedIn" class="profile-section card">
        <div class="profile-header">
          <img :src="authStore.currentUser?.avatar" alt="头像" class="avatar" />
          <div class="profile-info">
            <h2 class="nickname">{{ authStore.currentUser?.nickname }}</h2>
            <span v-if="authStore.currentUser?.isAnonymous" class="anonymous-badge">
              🕵️ 匿名用户
            </span>
            <span v-else class="email-badge">
              {{ authStore.currentUser?.email }}
            </span>
          </div>
          <button class="edit-btn" @click="goToEditProfile">
            编辑
          </button>
        </div>
        
        <div v-if="authStore.currentUser?.bio" class="bio-section">
          <p class="bio">{{ authStore.currentUser.bio }}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">{{ myPostsCount }}</span>
            <span class="stat-label">发帖</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ myFavoritesCount }}</span>
            <span class="stat-label">收藏</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ myHistoryCount }}</span>
            <span class="stat-label">浏览</span>
          </div>
        </div>
      </div>
      
      <div v-else class="login-prompt card">
        <div class="prompt-icon">👋</div>
        <h3 class="prompt-title">欢迎来到树洞</h3>
        <p class="prompt-text">登录后可以发布帖子、记录心情、收藏喜欢的内容</p>
        <div class="prompt-actions">
          <button class="btn btn-primary" @click="goToLogin">
            登录
          </button>
          <button class="btn btn-secondary" @click="handleAnonymousLogin">
            匿名进入
          </button>
        </div>
      </div>
      
      <div class="menu-section card">
        <div class="menu-header">
          <span class="menu-title">我的内容</span>
        </div>
        
        <router-link to="/my/posts" class="menu-item">
          <div class="menu-left">
            <span class="menu-icon">📝</span>
            <span class="menu-text">我的发帖</span>
          </div>
          <span class="menu-arrow">›</span>
        </router-link>
        
        <router-link to="/my/favorites" class="menu-item">
          <div class="menu-left">
            <span class="menu-icon">⭐</span>
            <span class="menu-text">我的收藏</span>
          </div>
          <span class="menu-arrow">›</span>
        </router-link>
        
        <router-link to="/my/history" class="menu-item">
          <div class="menu-left">
            <span class="menu-icon">🕐</span>
            <span class="menu-text">浏览记录</span>
          </div>
          <span class="menu-arrow">›</span>
        </router-link>
      </div>
      
      <div class="menu-section card">
        <div class="menu-header">
          <span class="menu-title">设置</span>
        </div>
        
        <div class="menu-item" @click="toggleDarkMode">
          <div class="menu-left">
            <span class="menu-icon">{{ themeStore.isDarkMode ? '🌙' : '☀️' }}</span>
            <span class="menu-text">{{ themeStore.isDarkMode ? '深色模式' : '浅色模式' }}</span>
          </div>
          <div class="menu-right">
            <div 
              class="toggle-switch" 
              :class="{ active: themeStore.isDarkMode }"
            >
              <div class="toggle-thumb"></div>
            </div>
          </div>
        </div>
        
        <div class="menu-item">
          <div class="menu-left">
            <span class="menu-icon">🌙</span>
            <span class="menu-text">深夜模式</span>
          </div>
          <div class="menu-right">
            <span class="menu-desc">22:00-06:00自动开启</span>
          </div>
        </div>
      </div>
      
      <div class="menu-section card">
        <div class="menu-header">
          <span class="menu-title">关于</span>
        </div>
        
        <div class="menu-item">
          <div class="menu-left">
            <span class="menu-icon">ℹ️</span>
            <span class="menu-text">关于我们</span>
          </div>
          <span class="menu-arrow">›</span>
        </div>
        
        <div class="menu-item">
          <div class="menu-left">
            <span class="menu-icon">📜</span>
            <span class="menu-text">用户协议</span>
          </div>
          <span class="menu-arrow">›</span>
        </div>
        
        <div class="menu-item">
          <div class="menu-left">
            <span class="menu-icon">🔒</span>
            <span class="menu-text">隐私政策</span>
          </div>
          <span class="menu-arrow">›</span>
        </div>
      </div>
      
      <button 
        v-if="authStore.isLoggedIn" 
        class="logout-btn card" 
        @click="handleLogout"
      >
        退出登录
      </button>
      
      <div class="version-info">
        <p>情绪树洞 v1.0.0</p>
        <p>一个温暖的倾诉空间</p>
      </div>
    </div>
    
    <BottomNav />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { usePostsStore } from '../stores/posts'
import PageHeader from '../components/PageHeader.vue'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const postsStore = usePostsStore()

const myPostsCount = computed(() => {
  if (!authStore.currentUser) return 0
  return postsStore.getUserPosts(authStore.currentUser.id).length
})

const myFavoritesCount = computed(() => {
  return postsStore.getFavorites().length
})

const myHistoryCount = computed(() => {
  return postsStore.getHistory().length
})

const goToLogin = () => {
  router.push('/login')
}

const goToEditProfile = () => {
  router.push('/profile/edit')
}

const goToSettings = () => {
  // 暂时没有设置页面，使用现有功能已在菜单中
}

const handleAnonymousLogin = () => {
  authStore.anonymousLogin()
}

const toggleDarkMode = () => {
  themeStore.toggleDarkMode()
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
  }
}
</script>

<style scoped>
.profile-section {
  margin: 16px;
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-secondary);
  border: 3px solid var(--primary-light);
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.nickname {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.anonymous-badge,
.email-badge {
  font-size: 12px;
  color: var(--text-muted);
}

.anonymous-badge {
  color: var(--primary-color);
}

.edit-btn {
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.bio-section {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}

.bio {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.stats-grid {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.login-prompt {
  margin: 16px;
  padding: 32px;
  text-align: center;
}

.prompt-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.prompt-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.prompt-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.prompt-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.prompt-actions .btn {
  padding: 10px 24px;
}

.menu-section {
  margin: 0 16px 16px;
  overflow: hidden;
}

.menu-header {
  padding: 12px 16px 8px;
}

.menu-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-top: 1px solid var(--border-color);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.menu-item:hover {
  background: var(--bg-secondary);
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon {
  font-size: 20px;
}

.menu-text {
  font-size: 14px;
  color: var(--text-primary);
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-arrow {
  font-size: 18px;
  color: var(--text-muted);
}

.menu-desc {
  font-size: 11px;
  color: var(--text-muted);
}

.toggle-switch {
  width: 44px;
  height: 26px;
  background: var(--bg-secondary);
  border-radius: 13px;
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
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: left var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-switch.active .toggle-thumb {
  left: 21px;
}

.logout-btn {
  margin: 16px;
  padding: 14px;
  text-align: center;
  color: var(--error-color);
  font-size: 14px;
  font-weight: 500;
}

.version-info {
  text-align: center;
  padding: 20px 0 100px;
}

.version-info p {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}
</style>
