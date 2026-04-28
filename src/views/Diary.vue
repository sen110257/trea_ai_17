<template>
  <div class="page-container">
    <PageHeader title="心情日记">
      <template #actions>
        <button class="btn-icon" @click="goToTodayDiary">
          <span>📝</span>
        </button>
      </template>
    </PageHeader>
    
    <div class="page-content">
      <div class="today-section">
        <div class="today-header">
          <span class="today-label">今天的心情</span>
          <span class="today-date">{{ todayDate }}</span>
        </div>
        
        <div v-if="todayDiary" class="today-diary card" @click="editTodayDiary">
          <div class="diary-mood-display">
            <span class="mood-emoji">{{ getMoodEmoji(todayDiary.mood) }}</span>
            <span class="mood-label">{{ getMoodLabel(todayDiary.mood) }}</span>
          </div>
          <p class="diary-preview">{{ todayDiary.content || '点击编辑今日心情' }}</p>
          <div v-if="todayDiary.tags && todayDiary.tags.length > 0" class="diary-tags">
            <span v-for="tag in todayDiary.tags" :key="tag" class="tag tag-neutral">
              #{{ tag }}
            </span>
          </div>
        </div>
        
        <div v-else class="today-empty card" @click="createTodayDiary">
          <div class="empty-icon">📔</div>
          <p>还没记录今天的心情</p>
          <button class="btn btn-primary">
            记录心情
          </button>
        </div>
      </div>
      
      <div class="history-section">
        <div class="section-header">
          <span class="section-title">历史日记</span>
          <router-link to="/calendar" class="link-text">
            查看日历 →
          </router-link>
        </div>
        
        <div v-if="userDiaries.length === 0" class="empty-state">
          <div class="empty-icon">📖</div>
          <div class="empty-text">
            还没有记录过心情<br />
            从今天开始记录吧~
          </div>
        </div>
        
        <div v-else class="diary-list">
          <div 
            v-for="diary in userDiaries" 
            :key="diary.id"
            class="diary-item card animate-fadeIn"
            @click="goToDiaryDetail(diary.date)"
          >
            <div class="diary-left">
              <div class="diary-date">
                <span class="date-day">{{ getDay(diary.date) }}</span>
                <span class="date-month">{{ getMonth(diary.date) }}</span>
              </div>
            </div>
            <div class="diary-middle">
              <div class="diary-mood">
                <span class="mood-emoji-small">{{ getMoodEmoji(diary.mood) }}</span>
                <span class="mood-label-small">{{ getMoodLabel(diary.mood) }}</span>
              </div>
              <p class="diary-content-preview">{{ truncateContent(diary.content) }}</p>
              <div v-if="diary.tags && diary.tags.length > 0" class="diary-tags-small">
                <span v-for="tag in diary.tags.slice(0, 2)" :key="tag" class="tag-text">
                  #{{ tag }}
                </span>
              </div>
            </div>
            <div class="diary-right">
              <span class="arrow">›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <BottomNav />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDiaryStore } from '../stores/diary'
import { useAuthStore } from '../stores/auth'
import PageHeader from '../components/PageHeader.vue'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()
const diaryStore = useDiaryStore()
const authStore = useAuthStore()

const todayDate = computed(() => {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日`
})

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const todayDiary = computed(() => {
  if (!authStore.currentUser) return null
  return diaryStore.getDiaryByDate(authStore.currentUser.id, today.value)
})

const userDiaries = computed(() => {
  if (!authStore.currentUser) return []
  return diaryStore.getUserDiaries(authStore.currentUser.id).filter(d => d.date !== today.value)
})

const getMoodEmoji = (mood) => diaryStore.getMoodEmoji(mood)
const getMoodLabel = (mood) => diaryStore.getMoodLabel(mood)

const getDay = (dateStr) => {
  return new Date(dateStr).getDate()
}

const getMonth = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月`
}

const truncateContent = (content) => {
  if (!content) return '暂无内容'
  return content.length > 50 ? content.slice(0, 50) + '...' : content
}

const goToTodayDiary = () => {
  router.push('/diary/' + today.value)
}

const editTodayDiary = () => {
  router.push('/diary/' + today.value)
}

const createTodayDiary = () => {
  router.push('/diary/' + today.value)
}

const goToDiaryDetail = (date) => {
  router.push('/diary/' + date)
}
</script>

<style scoped>
.today-section {
  padding: 16px;
}

.today-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.today-label {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.today-date {
  font-size: 14px;
  color: var(--text-muted);
}

.today-diary {
  cursor: pointer;
  transition: all var(--transition-normal);
}

.today-diary:hover {
  transform: translateY(-2px);
}

.diary-mood-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.mood-emoji {
  font-size: 40px;
}

.mood-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.diary-preview {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.diary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.today-empty {
  text-align: center;
  padding: 32px;
  cursor: pointer;
}

.today-empty .empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.today-empty p {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.history-section {
  padding: 0 16px;
  padding-bottom: 80px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.link-text {
  font-size: 13px;
  color: var(--primary-color);
}

.diary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.diary-item {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  padding: 16px;
}

.diary-left {
  flex-shrink: 0;
}

.diary-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.date-day {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.date-month {
  font-size: 11px;
  color: var(--text-muted);
}

.diary-middle {
  flex: 1;
  min-width: 0;
}

.diary-mood {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.mood-emoji-small {
  font-size: 20px;
}

.mood-label-small {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.diary-content-preview {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diary-tags-small {
  display: flex;
  gap: 6px;
}

.tag-text {
  font-size: 11px;
  color: var(--primary-color);
}

.diary-right {
  flex-shrink: 0;
}

.arrow {
  font-size: 20px;
  color: var(--text-muted);
}
</style>
