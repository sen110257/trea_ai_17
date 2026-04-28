<template>
  <div class="page-container">
    <PageHeader title="情绪日历" />
    
    <div class="page-content">
      <div class="calendar-header card">
        <div class="month-nav">
          <button class="nav-btn" @click="prevMonth">
            ‹
          </button>
          <div class="month-display">
            <span class="year-text">{{ currentYear }}年</span>
            <span class="month-text">{{ currentMonth + 1 }}月</span>
          </div>
          <button class="nav-btn" @click="nextMonth">
            ›
          </button>
        </div>
        
        <div class="today-btn" @click="goToToday">
          今天
        </div>
      </div>
      
      <div class="calendar-grid card">
        <div class="weekdays">
          <span v-for="day in weekdays" :key="day" class="weekday">
            {{ day }}
          </span>
        </div>
        
        <div class="days-grid">
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            class="day-cell"
            :class="{ 
              'other-month': day.isOtherMonth,
              'today': day.isToday,
              'has-diary': day.hasDiary,
              'selected': selectedDate === day.dateStr
            }"
            :style="day.moodColor ? { '--mood-color': day.moodColor } : {}"
            @click="selectDay(day)"
          >
            <span class="day-number">{{ day.day }}</span>
            <span v-if="day.moodEmoji" class="day-mood">{{ day.moodEmoji }}</span>
          </div>
        </div>
      </div>
      
      <div class="stats-section card">
        <div class="stats-header">
          <span class="stats-title">本月情绪统计</span>
        </div>
        
        <div v-if="moodStatsCount === 0" class="empty-stats">
          <div class="empty-icon">📊</div>
          <p>还没有记录足够的心情数据</p>
        </div>
        
        <div v-else class="stats-content">
          <div class="mood-stats">
            <div 
              v-for="(count, mood) in moodStats" 
              :key="mood"
              class="mood-stat-item"
              v-if="count > 0"
            >
              <span class="stat-emoji">{{ getMoodEmoji(mood) }}</span>
              <div class="stat-info">
                <span class="stat-label">{{ getMoodLabel(mood) }}</span>
                <div class="stat-bar">
                  <div 
                    class="stat-bar-fill" 
                    :style="{ 
                      width: (count / totalDays * 100) + '%',
                      backgroundColor: getMoodColor(mood)
                    }"
                  ></div>
                </div>
              </div>
              <span class="stat-count">{{ count }}天</span>
            </div>
          </div>
          
          <div class="mood-summary">
            <p>本月共记录 <span class="highlight">{{ totalDays }}</span> 天</p>
            <p v-if="mostCommonMood">
              最常见的心情：
              <span class="highlight">
                {{ getMoodEmoji(mostCommonMood) }} {{ getMoodLabel(mostCommonMood) }}
              </span>
            </p>
          </div>
        </div>
      </div>
      
      <div class="legend-section card">
        <p class="legend-title">心情图例</p>
        <div class="legend-items">
          <div v-for="mood in legendMoods" :key="mood.key" class="legend-item">
            <div 
              class="legend-dot" 
              :style="{ backgroundColor: mood.color }"
            ></div>
            <span class="legend-emoji">{{ mood.emoji }}</span>
            <span class="legend-label">{{ mood.label }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <BottomNav />
    
    <div v-if="selectedDiary" class="modal-overlay" @click="closeModal">
      <div class="modal-content diary-modal" @click.stop>
        <div class="modal-header">
          <span class="modal-date">{{ formatDate(selectedDate) }}</span>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div v-if="selectedDiary" class="diary-modal-content">
          <div class="modal-mood">
            <span class="modal-mood-emoji">{{ getMoodEmoji(selectedDiary.mood) }}</span>
            <span class="modal-mood-label">{{ getMoodLabel(selectedDiary.mood) }}</span>
          </div>
          
          <p v-if="selectedDiary.content" class="modal-content-text">{{ selectedDiary.content }}</p>
          
          <div v-if="selectedDiary.tags && selectedDiary.tags.length > 0" class="modal-tags">
            <span v-for="tag in selectedDiary.tags" :key="tag" class="tag tag-neutral">
              #{{ tag }}
            </span>
          </div>
          
          <div v-if="selectedDiary.images && selectedDiary.images.length > 0" class="modal-images">
            <img 
              v-for="(img, index) in selectedDiary.images" 
              :key="index"
              :src="img" 
              alt="图片"
              class="modal-image"
            />
          </div>
        </div>
        
        <div v-else class="empty-diary-modal">
          <div class="empty-icon">📝</div>
          <p>这天还没有记录心情</p>
          <button class="btn btn-primary" @click="editDiary">
            记录心情
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDiaryStore } from '../stores/diary'
import { useAuthStore } from '../stores/auth'
import PageHeader from '../components/PageHeader.vue'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()
const diaryStore = useDiaryStore()
const authStore = useAuthStore()

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const selectedDate = ref(null)
const selectedDiary = ref(null)

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const legendMoods = computed(() => {
  return diaryStore.availableMoods.slice(0, 6).map(mood => ({
    key: mood.key,
    emoji: mood.emoji,
    label: mood.label,
    color: mood.color
  }))
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  const days = []
  
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(currentYear.value, currentMonth.value - 1, day)
    days.push({
      day,
      dateStr: date.toISOString().split('T')[0],
      isOtherMonth: true,
      isToday: false,
      hasDiary: false,
      moodEmoji: null,
      moodColor: null
    })
  }
  
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const calendarData = authStore.currentUser 
    ? diaryStore.getCalendarData(authStore.currentUser.id, currentYear.value, currentMonth.value)
    : {}
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    const dateStr = date.toISOString().split('T')[0]
    const diary = calendarData[dateStr]
    
    days.push({
      day: i,
      dateStr,
      isOtherMonth: false,
      isToday: dateStr === todayStr,
      hasDiary: !!diary,
      moodEmoji: diary ? getMoodEmoji(diary.mood) : null,
      moodColor: diary ? getMoodColor(diary.mood) : null
    })
  }
  
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push({
      day: i,
      dateStr: date.toISOString().split('T')[0],
      isOtherMonth: true,
      isToday: false,
      hasDiary: false,
      moodEmoji: null,
      moodColor: null
    })
  }
  
  return days
})

const moodStats = computed(() => {
  if (!authStore.currentUser) return {}
  return diaryStore.getMoodStats(authStore.currentUser.id, currentYear.value, currentMonth.value)
})

const moodStatsCount = computed(() => {
  return Object.values(moodStats.value).reduce((sum, count) => sum + count, 0)
})

const totalDays = computed(() => moodStatsCount.value)

const mostCommonMood = computed(() => {
  const stats = moodStats.value
  let maxMood = null
  let maxCount = 0
  
  for (const [mood, count] of Object.entries(stats)) {
    if (count > maxCount) {
      maxCount = count
      maxMood = mood
    }
  }
  
  return maxMood
})

const getMoodEmoji = (mood) => diaryStore.getMoodEmoji(mood)
const getMoodLabel = (mood) => diaryStore.getMoodLabel(mood)
const getMoodColor = (mood) => diaryStore.getMoodColor(mood)

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const goToToday = () => {
  const today = new Date()
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
}

const selectDay = (day) => {
  if (day.isOtherMonth) return
  
  selectedDate.value = day.dateStr
  
  if (authStore.currentUser) {
    selectedDiary.value = diaryStore.getDiaryByDate(authStore.currentUser.id, day.dateStr)
  } else {
    selectedDiary.value = null
  }
}

const closeModal = () => {
  selectedDate.value = null
  selectedDiary.value = null
}

const editDiary = () => {
  if (!authStore.currentUser) {
    router.push('/login')
    return
  }
  closeModal()
  router.push('/diary/' + selectedDate.value)
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
}
</script>

<style scoped>
.calendar-header {
  margin: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--text-primary);
}

.month-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.year-text {
  font-size: 12px;
  color: var(--text-muted);
}

.month-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.today-btn {
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  font-size: 13px;
  font-weight: 500;
}

.calendar-grid {
  margin: 0 16px 16px;
  padding: 16px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  padding: 8px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  position: relative;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.day-cell:hover:not(.other-month) {
  background: var(--bg-secondary);
}

.day-cell.other-month {
  cursor: default;
}

.day-cell.other-month .day-number {
  color: var(--text-muted);
  opacity: 0.4;
}

.day-cell.today {
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
}

.day-cell.today .day-number {
  color: var(--primary-color);
  font-weight: 600;
}

.day-cell.has-diary::before {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--mood-color, var(--primary-color));
}

.day-cell.selected {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

.day-cell.selected .day-number,
.day-cell.selected .day-mood {
  color: white;
}

.day-number {
  font-size: 13px;
  color: var(--text-primary);
}

.day-mood {
  font-size: 16px;
  margin-top: 2px;
}

.stats-section,
.legend-section {
  margin: 0 16px 16px;
  padding: 16px;
}

.stats-header {
  margin-bottom: 16px;
}

.stats-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-stats {
  text-align: center;
  padding: 24px;
}

.empty-stats .empty-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.empty-stats p {
  font-size: 13px;
  color: var(--text-muted);
}

.mood-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.mood-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-emoji {
  font-size: 24px;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 4px;
}

.stat-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.stat-count {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.mood-summary {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.mood-summary p {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.highlight {
  font-weight: 600;
  color: var(--primary-color);
}

.legend-title {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-emoji {
  font-size: 14px;
}

.legend-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.diary-modal {
  max-width: 90%;
  width: 360px;
  max-height: 70vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-date {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text-secondary);
}

.diary-modal-content {
  padding: 20px;
}

.modal-mood {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.modal-mood-emoji {
  font-size: 36px;
}

.modal-mood-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.modal-content-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.modal-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.modal-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
}

.empty-diary-modal {
  padding: 40px 20px;
  text-align: center;
}

.empty-diary-modal .empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-diary-modal p {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 16px;
}
</style>
