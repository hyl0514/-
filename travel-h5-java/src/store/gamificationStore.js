import { reactive, computed, watch } from 'vue'

/**
 * 游戏化 Store — 成就系统、挑战赛、消费故事、标签云、排行榜
 */

const STORAGE_KEY = 'pc-gamification-v1'

// ---------- 成就徽章定义 ----------
const BADGE_DEFS = [
  { id: 'first_trip', name: '初次启程', icon: '🧭', desc: '完成第一次旅行记账', color: '#2374DD', condition: (s) => s.totalTrips >= 1 },
  { id: 'budget_master', name: '预算达人', icon: '', desc: '单次旅行零超支', color: '#0EA5A4', condition: (s) => s.zeroOverrunTrips >= 1 },
  { id: 'five_trips', name: '旅行老手', icon: '✈️', desc: '累计完成 5 次旅行', color: '#E8912F', condition: (s) => s.totalTrips >= 5 },
  { id: 'saver', name: '精打细算', icon: '🐷', desc: '单次旅行节省预算 30% 以上', color: '#10B981', condition: (s) => s.saved30Trips >= 1 },
  { id: 'big_spender', name: '豪气旅行家', icon: '👑', desc: '单次旅行花费超过 ¥10000', color: '#F59E0B', condition: (s) => s.bigSpendTrips >= 1 },
  { id: 'ten_trips', name: '旅行达人', icon: '🌟', desc: '累计完成 10 次旅行', color: '#8B5CF6', condition: (s) => s.totalTrips >= 10 },
  { id: 'challenge_winner', name: '挑战之王', icon: '🏆', desc: '赢得一次预算挑战', color: '#EF4444', condition: (s) => s.challengeWins >= 1 },
  { id: 'story_teller', name: '故事分享家', icon: '📖', desc: '发布 3 条消费故事', color: '#EC4899', condition: (s) => s.storyCount >= 3 },
  { id: 'frugal_king', name: '省钱之王', icon: '🎯', desc: '单次旅行节省预算 50% 以上', color: '#059669', condition: (s) => s.saved50Trips >= 1 },
  { id: 'all_category', name: '全能旅行者', icon: '🎪', desc: '一次旅行涵盖 5 种消费类别', color: '#6366F1', condition: (s) => s.allCategoryTrips >= 1 },
  { id: 'early_bird', name: '早起鸟儿', icon: '🌅', desc: '在行程开始前完成预算规划', color: '#F97316', condition: (s) => s.earlyPlannerTrips >= 1 },
  { id: 'monthly_traveler', name: '月度旅行家', icon: '📅', desc: '一个月内完成 2 次旅行', color: '#14B8A6', condition: (s) => s.monthlyDoubleTrips >= 1 }
]

// ---------- 挑战赛模板 ----------
const CHALLENGE_TEMPLATES = [
  { id: 'c1', name: '三日穷游', desc: '3 天内总花费不超过 ¥500', target: 500, days: 3, reward: 50, icon: '🎒' },
  { id: 'c2', name: '美食不超支', desc: '餐饮花费控制在总预算 25% 以内', target: 25, days: 0, reward: 30, icon: '' },
  { id: 'c3', name: '零超支旅行', desc: '全程不超预算', target: 0, days: 0, reward: 100, icon: '🎯' },
  { id: 'c4', name: '省钱达人', desc: '实际花费比预算少 30%', target: 30, days: 0, reward: 80, icon: '💡' },
  { id: 'c5', name: '一周背包客', desc: '7 天内总花费不超过 ¥2000', target: 2000, days: 7, reward: 120, icon: '🎒' },
  { id: 'c6', name: '交通控', desc: '交通花费不超过总预算 15%', target: 15, days: 0, reward: 40, icon: '' }
]

// ---------- 模拟排行榜数据 ----------
const MOCK_LEADERBOARD = [
  { rank: 1, name: '旅行小王子', avatar: '🦊', city: '成都', totalSpent: 3200, tripCount: 8, savings: 42, badge: '' },
  { rank: 2, name: '背包客阿杰', avatar: '', city: '成都', totalSpent: 4500, tripCount: 6, savings: 35, badge: '' },
  { rank: 3, name: '美食猎人', avatar: '', city: '成都', totalSpent: 2800, tripCount: 5, savings: 28, badge: '🥉' },
  { rank: 4, name: '文艺青年', avatar: '🦋', city: '成都', totalSpent: 5100, tripCount: 7, savings: 22, badge: '' },
  { rank: 5, name: '探险家小李', avatar: '🦅', city: '成都', totalSpent: 6800, tripCount: 4, savings: 18, badge: '' },
  { rank: 6, name: '摄影达人', avatar: '📷', city: '成都', totalSpent: 3900, tripCount: 9, savings: 31, badge: '' },
  { rank: 7, name: '历史迷', avatar: '', city: '成都', totalSpent: 2200, tripCount: 3, savings: 45, badge: '' },
  { rank: 8, name: '自然爱好者', avatar: '🌿', city: '成都', totalSpent: 4100, tripCount: 6, savings: 20, badge: '' }
]

const defaultState = () => ({
  // 成就
  unlockedBadges: [],
  totalPoints: 0,
  // 挑战赛
  activeChallenge: null,
  challengeHistory: [],
  challengeWins: 0,
  // 消费故事
  stories: [],
  // 标签云
  tags: [],
  // 统计数据
  totalTrips: 0,
  zeroOverrunTrips: 0,
  saved30Trips: 0,
  saved50Trips: 0,
  bigSpendTrips: 0,
  allCategoryTrips: 0,
  earlyPlannerTrips: 0,
  monthlyDoubleTrips: 0,
  storyCount: 0
})

const state = reactive(defaultState())

// ---------- 计算属性 ----------
const allBadges = computed(() => BADGE_DEFS)
const leaderboard = computed(() => MOCK_LEADERBOARD)
const challengeTemplates = computed(() => CHALLENGE_TEMPLATES)

const unlockedBadgeList = computed(() =>
  BADGE_DEFS.filter(b => state.unlockedBadges.includes(b.id))
)

const lockedBadgeList = computed(() =>
  BADGE_DEFS.filter(b => !state.unlockedBadges.includes(b.id))
)

const progressPercent = computed(() => {
  if (!BADGE_DEFS.length) return 0
  return Math.round((state.unlockedBadges.length / BADGE_DEFS.length) * 100)
})

// ---------- 标签云 ----------
const tagCloud = computed(() => {
  const tags = Array.isArray(state.tags) ? state.tags : []
  const map = {}
  tags.forEach(t => { if (t && t.name) map[t.name] = (map[t.name] || 0) + (t.count || 1) })
  const result = Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
  return Array.isArray(result) ? result : []
})

// ---------- 挑战相关 ----------
const startChallenge = (template) => {
  state.activeChallenge = {
    ...template,
    startedAt: new Date().toISOString().slice(0, 10),
    progress: 0,
    status: 'active'
  }
}

const updateChallengeProgress = (progress) => {
  if (state.activeChallenge) {
    state.activeChallenge.progress = progress
  }
}

const completeChallenge = (success) => {
  if (!state.activeChallenge) return
  const record = {
    ...state.activeChallenge,
    completedAt: new Date().toISOString().slice(0, 10),
    success
  }
  state.challengeHistory.unshift(record)
  if (success) {
    state.challengeWins++
    state.totalPoints += state.activeChallenge.reward
  }
  state.activeChallenge = null
}

// ---------- 成就检查 ----------
const checkBadges = () => {
  BADGE_DEFS.forEach(b => {
    if (!state.unlockedBadges.includes(b.id) && b.condition(state)) {
      state.unlockedBadges.push(b.id)
      state.totalPoints += 20
    }
  })
}

// ---------- 消费故事 ----------
const addStory = (story) => {
  state.stories.unshift({
    id: `story-${Date.now()}`,
    createdAt: new Date().toISOString().slice(0, 10),
    likes: Math.floor(Math.random() * 50) + 5,
    comments: Math.floor(Math.random() * 20),
    ...story
  })
  state.storyCount = state.stories.length
  state.totalPoints += 10
}

const removeStory = (id) => {
  const i = state.stories.findIndex(s => s.id === id)
  if (i > -1) state.stories.splice(i, 1)
  state.storyCount = state.stories.length
}

const toggleStoryLike = (id) => {
  const s = state.stories.find(s => s.id === id)
  if (s) s.liked = !s.liked, s.likes += s.liked ? 1 : -1
}

// ---------- 标签管理 ----------
const addTag = (name) => {
  const existing = state.tags.find(t => t.name === name)
  if (existing) { existing.count++ } else { state.tags.push({ name, count: 1 }) }
}

// ---------- 持久化 ----------
watch(
  () => state,
  () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (e) {}
  },
  { deep: true }
)

const restore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    Object.assign(state, defaultState(), JSON.parse(raw))
  } catch (e) {}
}

restore()

export function useGamificationStore() {
  return {
    state,
    allBadges,
    unlockedBadgeList,
    lockedBadgeList,
    progressPercent,
    leaderboard,
    challengeTemplates,
    tagCloud,
    startChallenge,
    updateChallengeProgress,
    completeChallenge,
    checkBadges,
    addStory,
    removeStory,
    toggleStoryLike,
    addTag
  }
}
