import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/post',
    name: 'Post',
    component: () => import('../views/Post.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: () => import('../views/PostDetail.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/diary',
    name: 'Diary',
    component: () => import('../views/Diary.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/diary/:date',
    name: 'DiaryDetail',
    component: () => import('../views/DiaryDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/Calendar.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/private',
    name: 'Private',
    component: () => import('../views/Private.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/private/:id',
    name: 'PrivateDetail',
    component: () => import('../views/PrivateDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/edit',
    name: 'ProfileEdit',
    component: () => import('../views/ProfileEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my/posts',
    name: 'MyPosts',
    component: () => import('../views/MyPosts.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my/favorites',
    name: 'MyFavorites',
    component: () => import('../views/MyFavorites.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my/history',
    name: 'MyHistory',
    component: () => import('../views/MyHistory.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    authStore.anonymousLogin()
    next()
  } else {
    next()
  }
})

export default router
