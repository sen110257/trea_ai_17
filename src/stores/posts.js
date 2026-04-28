import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

const emotionKeywords = {
  happy: ['开心', '快乐', '高兴', '幸福', '兴奋', '激动', '满足', '愉悦', '喜悦', '开心极了', '美滋滋', '心花怒放', '兴高采烈', '欢欣鼓舞', '喜出望外', '笑', '愉快', '甜蜜', '美好', '欢乐'],
  sad: ['难过', '伤心', '悲伤', '失落', '孤独', '痛苦', '难受', '绝望', '沮丧', '抑郁', '委屈', '想哭', '心痛', '心碎', '悲哀', '忧愁', '苦闷', '心酸', '悲凉', '落寞'],
  angry: ['生气', '愤怒', '恼火', '气愤', '烦躁', '暴躁', '火气', '生气了', '气死我了', '发火', '暴怒', '恼火', '不满', '不爽', '生气', '愤怒', '生气', '恼火', '气愤', '暴躁'],
  anxious: ['焦虑', '紧张', '担心', '不安', '害怕', '恐惧', '心慌', '忐忑', '担忧', '压力', '心累', '疲惫', '焦虑不安', '惴惴不安', '心烦意乱', '心神不宁', '紧张', '担心', '害怕'],
  calm: ['平静', '宁静', '放松', '安心', '舒服', '惬意', '悠闲', '自在', '安详', '从容', '淡定', '平和', '安静', '宁静', '放松', '安心', '舒服', '惬意', '悠闲']
}

const aiResponses = {
  happy: [
    '看到你这么开心，我也跟着笑了呢！😊 愿你的快乐像阳光一样，温暖每一天。记得把这份好心情传递给身边的人哦~',
    '哇，感受到你的喜悦了！✨ 快乐是会传染的，谢谢你分享这份美好。继续保持这份好心情，世界因你而明亮！',
    '你的开心让我也感到温暖呢！🌸 生活中的小确幸值得被珍藏。愿你每一天都能像现在这样，笑容满面！'
  ],
  sad: [
    '亲爱的，我看到了你的难过，让我抱抱你。💝 有时候哭泣也是一种释放，不要压抑自己的情绪。你值得被温柔对待，一切都会好起来的。',
    '我感受到你的悲伤了，这种感觉真的很难受。🌈 但请相信，黑夜再长也会有黎明。让我陪着你，一起度过这段艰难的时光。',
    '看到你这样，我很心疼。🌙 难过的时候，记得给自己一个拥抱。你很坚强，也很勇敢，只是偶尔需要休息一下。我在这里陪着你。'
  ],
  angry: [
    '我理解你的愤怒，这种感觉真的让人不舒服。🍃 试着深呼吸几次，让自己慢慢平静下来。有时候，表达出来也是一种释放。',
    '生气是正常的情绪，不要责怪自己。💫 但请记得，不要让愤怒伤害到自己。找个方式发泄一下，比如写写日记、散散步，或者找朋友聊聊。',
    '我感受到你的火气了。🔥 有时候别人确实会让我们很生气。但请记住，你的情绪是宝贵的，不值得为不值得的人消耗。好好爱自己。'
  ],
  anxious: [
    '我知道焦虑的感觉很不好受。🌿 试着闭上眼睛，做几个深呼吸：吸气... 呼气... 你已经做得很好了，慢慢来，一切都会好的。',
    '你的紧张和不安，我都感受到了。🌟 但请相信，很多事情其实没有想象中那么可怕。你比自己想象的更强大。给自己一点时间，也给自己一点信心。',
    '焦虑的时候，试着把注意力放在当下。🌈 看看窗外的风景，听听喜欢的音乐，或者喝一杯温水。你值得被善待，包括被自己善待。'
  ],
  calm: [
    '感受到你的平静，真好！🌸 这种宁静的状态是多么珍贵。愿你能一直保持这份内心的平和，享受当下的每一刻。',
    '你的平静让我也感到放松。🍃 生活中能有这样的时刻，是多么美好。继续保持这份淡然，让每一天都过得自在舒适。',
    '多么惬意的状态啊！🌙 享受这份宁静，让心灵得到休息。你值得拥有这样平静美好的时光。'
  ],
  neutral: [
    '感谢你分享你的心事。💫 不管心情如何，表达出来都是一件勇敢的事。我在这里陪着你，倾听你的每一句话。',
    '我收到你的分享了。🌸 有时候，不需要强烈的情绪，平淡也是一种真实。继续保持这份真实，做你自己就好。',
    '谢谢你愿意说出来。✨ 倾诉本身就是一种治愈。不管你想说什么，我都在这里，认真地听着。'
  ]
}

const generateSamplePosts = () => {
  const samples = [
    {
      content: '今天终于完成了那个困扰我很久的项目！虽然过程很辛苦，但看到成果的那一刻，所有的努力都值得了。感觉自己又成长了一点呢~',
      images: [],
      emotions: ['happy', 'calm'],
      aiReply: aiResponses.happy[0],
      anonymous: true
    },
    {
      content: '最近压力好大，每天都睡不好。明明很想努力，却总是感觉力不从心。有时候真的想找个地方躲起来，什么都不想...',
      images: [],
      emotions: ['sad', 'anxious'],
      aiReply: aiResponses.anxious[0],
      anonymous: true
    },
    {
      content: '今天去公园散步了，阳光很好，风也很温柔。看着天空中飘过的云朵，突然觉得生活中的那些烦心事也没有那么重要了。',
      images: [],
      emotions: ['calm'],
      aiReply: aiResponses.calm[0],
      anonymous: true
    },
    {
      content: '和朋友吵架了，明明不是我的错，却还是很难过。为什么总是我先妥协？有时候真的觉得自己很委屈...',
      images: [],
      emotions: ['sad', 'angry'],
      aiReply: aiResponses.sad[1],
      anonymous: true
    },
    {
      content: '收到了期待已久的快递！是我一直想要的那本书。迫不及待地想要开始阅读了，好开心呀~',
      images: [],
      emotions: ['happy'],
      aiReply: aiResponses.happy[1],
      anonymous: true
    }
  ]
  
  return samples.map((sample, index) => ({
    id: generateId(),
    userId: 'sample_' + index,
    userName: '匿名用户' + (1000 + index),
    userAvatar: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20avatar%20purple%20pastel%20color%20style%20${index + 1}&image_size=square`,
    ...sample,
    likes: Math.floor(Math.random() * 100) + 10,
    comments: Math.floor(Math.random() * 30) + 1,
    isLiked: false,
    isFavorite: false,
    isBlocked: false,
    commentList: [],
    createdAt: new Date(Date.now() - index * 86400000 - Math.random() * 86400000).toISOString()
  }))
}

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([])
  const blockedUserIds = ref([])
  const blockedPostIds = ref([])
  const favorites = ref([])
  const history = ref([])
  
  const visiblePosts = computed(() => {
    return posts.value.filter(post => 
      !blockedUserIds.value.includes(post.userId) && 
      !blockedPostIds.value.includes(post.id)
    )
  })
  
  const init = () => {
    const savedPosts = localStorage.getItem('posts')
    const savedBlockedUsers = localStorage.getItem('blockedUsers')
    const savedBlockedPosts = localStorage.getItem('blockedPosts')
    const savedFavorites = localStorage.getItem('favorites')
    const savedHistory = localStorage.getItem('history')
    
    if (savedPosts) {
      posts.value = JSON.parse(savedPosts)
    } else {
      posts.value = generateSamplePosts()
      savePosts()
    }
    
    if (savedBlockedUsers) {
      blockedUserIds.value = JSON.parse(savedBlockedUsers)
    }
    
    if (savedBlockedPosts) {
      blockedPostIds.value = JSON.parse(savedBlockedPosts)
    }
    
    if (savedFavorites) {
      favorites.value = JSON.parse(savedFavorites)
    }
    
    if (savedHistory) {
      history.value = JSON.parse(savedHistory)
    }
  }
  
  const savePosts = () => {
    localStorage.setItem('posts', JSON.stringify(posts.value))
  }
  
  const saveBlocked = () => {
    localStorage.setItem('blockedUsers', JSON.stringify(blockedUserIds.value))
    localStorage.setItem('blockedPosts', JSON.stringify(blockedPostIds.value))
  }
  
  const saveFavorites = () => {
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }
  
  const saveHistory = () => {
    localStorage.setItem('history', JSON.stringify(history.value))
  }
  
  const analyzeEmotion = (content) => {
    const foundEmotions = []
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          if (!foundEmotions.includes(emotion)) {
            foundEmotions.push(emotion)
          }
          break
        }
      }
    }
    
    if (foundEmotions.length === 0) {
      return ['neutral']
    }
    
    return foundEmotions
  }
  
  const generateAIReply = (emotions) => {
    const primaryEmotion = emotions[0] || 'neutral'
    const responses = aiResponses[primaryEmotion] || aiResponses.neutral
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  const createPost = (content, images = [], isAnonymous = true) => {
    const authStore = useAuthStore()
    
    if (!authStore.currentUser) {
      return { success: false, message: '请先登录' }
    }
    
    const emotions = analyzeEmotion(content)
    const aiReply = generateAIReply(emotions)
    
    const post = {
      id: generateId(),
      userId: authStore.currentUser.id,
      userName: isAnonymous ? '匿名用户' + Math.floor(Math.random() * 9000 + 1000) : authStore.currentUser.nickname,
      userAvatar: authStore.currentUser.avatar,
      content,
      images,
      emotions,
      aiReply,
      anonymous: isAnonymous,
      likes: 0,
      comments: 0,
      isLiked: false,
      isFavorite: false,
      isBlocked: false,
      commentList: [],
      createdAt: new Date().toISOString()
    }
    
    posts.value.unshift(post)
    savePosts()
    
    return { success: true, post }
  }
  
  const getPostById = (id) => {
    const post = posts.value.find(p => p.id === id)
    if (post) {
      addToHistory(post.id)
    }
    return post
  }
  
  const toggleLike = (postId) => {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return { success: false }
    
    post.isLiked = !post.isLiked
    post.likes += post.isLiked ? 1 : -1
    savePosts()
    
    return { success: true, isLiked: post.isLiked }
  }
  
  const toggleFavorite = (postId) => {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return { success: false }
    
    post.isFavorite = !post.isFavorite
    
    if (post.isFavorite) {
      favorites.value.unshift({
        postId,
        addedAt: new Date().toISOString()
      })
    } else {
      favorites.value = favorites.value.filter(f => f.postId !== postId)
    }
    
    savePosts()
    saveFavorites()
    
    return { success: true, isFavorite: post.isFavorite }
  }
  
  const addComment = (postId, content) => {
    const authStore = useAuthStore()
    const post = posts.value.find(p => p.id === postId)
    
    if (!post) return { success: false, message: '帖子不存在' }
    if (!authStore.currentUser) return { success: false, message: '请先登录' }
    
    const comment = {
      id: generateId(),
      userId: authStore.currentUser.id,
      userName: '匿名用户' + Math.floor(Math.random() * 9000 + 1000),
      userAvatar: authStore.currentUser.avatar,
      content,
      createdAt: new Date().toISOString()
    }
    
    post.commentList.unshift(comment)
    post.comments += 1
    savePosts()
    
    return { success: true, comment }
  }
  
  const blockUser = (userId) => {
    if (!blockedUserIds.value.includes(userId)) {
      blockedUserIds.value.push(userId)
      saveBlocked()
    }
    return { success: true }
  }
  
  const blockPost = (postId) => {
    if (!blockedPostIds.value.includes(postId)) {
      blockedPostIds.value.push(postId)
      saveBlocked()
    }
    return { success: true }
  }
  
  const reportPost = (postId, reason) => {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]')
    reports.push({
      id: generateId(),
      postId,
      reason,
      reportedAt: new Date().toISOString()
    })
    localStorage.setItem('reports', JSON.stringify(reports))
    return { success: true }
  }
  
  const addToHistory = (postId) => {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) return
    
    history.value = history.value.filter(h => h.postId !== postId)
    history.value.unshift({
      postId,
      viewedAt: new Date().toISOString()
    })
    
    if (history.value.length > 100) {
      history.value = history.value.slice(0, 100)
    }
    
    saveHistory()
  }
  
  const getUserPosts = (userId) => {
    return posts.value.filter(p => p.userId === userId)
  }
  
  const getFavorites = () => {
    return favorites.value.map(f => {
      const post = posts.value.find(p => p.id === f.postId)
      return post ? { ...post, favoritedAt: f.addedAt } : null
    }).filter(Boolean)
  }
  
  const getHistory = () => {
    return history.value.map(h => {
      const post = posts.value.find(p => p.id === h.postId)
      return post ? { ...post, viewedAt: h.viewedAt } : null
    }).filter(Boolean)
  }
  
  const deletePost = (postId) => {
    const index = posts.value.findIndex(p => p.id === postId)
    if (index !== -1) {
      posts.value.splice(index, 1)
      savePosts()
      
      favorites.value = favorites.value.filter(f => f.postId !== postId)
      history.value = history.value.filter(h => h.postId !== postId)
      saveFavorites()
      saveHistory()
      
      return { success: true }
    }
    return { success: false }
  }
  
  init()
  
  return {
    posts,
    visiblePosts,
    blockedUserIds,
    blockedPostIds,
    favorites,
    history,
    createPost,
    getPostById,
    toggleLike,
    toggleFavorite,
    addComment,
    blockUser,
    blockPost,
    reportPost,
    getUserPosts,
    getFavorites,
    getHistory,
    deletePost,
    analyzeEmotion,
    generateAIReply
  }
})
