<template>
  <div class="page-container">
    <PageHeader title="情绪树洞">
      <template #actions>
        <button class="btn-icon" @click="showSearch = !showSearch">
          <span>🔍</span>
        </button>
      </template>
    </PageHeader>
    
    <div class="page-content">
      <div v-if="showSearch" class="search-bar animate-fadeIn">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索树洞内容..." 
          class="input-field"
          @input="handleSearch"
        />
      </div>
      
      <div class="mood-filter">
        <button 
          v-for="filter in moodFilters" 
          :key="filter.key"
          class="filter-btn"
          :class="{ active: activeFilter === filter.key }"
          @click="activeFilter = filter.key"
        >
          {{ filter.label }}
        </button>
      </div>
      
      <div v-if="filteredPosts.length === 0" class="empty-state">
        <div class="empty-icon">🏠</div>
        <div class="empty-text">
          暂无树洞内容<br />
          来发布第一条心情吧~
        </div>
        <button class="btn btn-primary" @click="goToPost">
          发布心情
        </button>
      </div>
      
      <div v-else class="posts-list">
        <PostCard 
          v-for="post in filteredPosts" 
          :key="post.id" 
          :post="post"
        />
      </div>
      
      <button class="fab" @click="goToPost">
        ✏️
      </button>
    </div>
    
    <BottomNav />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '../stores/posts'
import PageHeader from '../components/PageHeader.vue'
import BottomNav from '../components/BottomNav.vue'
import PostCard from '../components/PostCard.vue'

const router = useRouter()
const postsStore = usePostsStore()

const showSearch = ref(false)
const searchQuery = ref('')
const activeFilter = ref('all')

const moodFilters = [
  { key: 'all', label: '全部' },
  { key: 'happy', label: '😊 开心' },
  { key: 'sad', label: '😢 难过' },
  { key: 'angry', label: '😠 生气' },
  { key: 'anxious', label: '😰 焦虑' },
  { key: 'calm', label: '😌 平静' }
]

const filteredPosts = computed(() => {
  let posts = [...postsStore.visiblePosts]
  
  if (activeFilter.value !== 'all') {
    posts = posts.filter(p => p.emotions?.includes(activeFilter.value))
  }
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    posts = posts.filter(p => 
      p.content.toLowerCase().includes(query) ||
      p.userName.toLowerCase().includes(query)
    )
  }
  
  return posts
})

const goToPost = () => {
  router.push('/post')
}

const handleSearch = () => {
  // 搜索会自动通过 computed 过滤
}
</script>

<style scoped>
.search-bar {
  padding: 0 16px 16px;
}

.mood-filter {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.mood-filter::-webkit-scrollbar {
  display: none;
}

.filter-btn {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.filter-btn.active {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-color: transparent;
}

.posts-list {
  padding: 0 16px;
}

.fab {
  position: fixed;
  right: 20px;
  bottom: calc(80px + env(safe-area-inset-bottom));
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 6px 20px var(--shadow-color);
  z-index: 999;
  transition: all var(--transition-normal);
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px var(--shadow-color);
}

.fab:active {
  transform: scale(0.95);
}
</style>
