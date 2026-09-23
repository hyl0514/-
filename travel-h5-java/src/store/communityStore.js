/**
 * 社区旅友空间 Store
 * - 优先读写后端 MySQL，后端不可用时自动 fallback localStorage
 * - 组件调用方式不变（同步本地立即可见 + 异步后端同步）
 */
import { reactive, computed } from 'vue'
import { useAuthStore } from './authStore'
import { get, post, put, del } from '../utils/request'

const STORAGE_KEY = 'pc-community-v5'
const LEGACY_KEYS = ['pc-community-v1', 'pc-community-v2', 'pc-community-v3', 'pc-community-v4']

const genId = () => `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const now = () => new Date().toISOString().slice(0, 10)

const pic = (kw, lock) => `https://loremflickr.com/600/400/${kw}?lock=${lock}`

const SEED_POSTS = [
    { id: 'p1', author: '背包十年', avatar: '🧭', level: '资深玩家', city: '南昌', cat: '行程攻略', title: '南昌 4 天 3 夜深度攻略：滕王阁 + 武功山 + 美食地图', content: '从滕王阁看落霞与孤鹜，到万寿宫逛夜景，再坐 2 小时车去武功山看日出。', images: [pic('china,pagoda', 1), pic('lake,park', 2), pic('road,travel', 3)], tags: ['攻略', '历史人文'], status: 'approved', likes: 238, comments: 47, views: 3280, hasTrip: true, tripName: '南昌本地深度游', hasSpot: true, spotName: '滕王阁', createdAt: '2026-09-18', liked: false, faved: false },
    { id: 'p2', author: '晚风', avatar: '🌙', level: '旅行达人', city: '成都', cat: '美食探店', title: '成都一周吃遍老字号：从陈麻婆到贺记蛋烘糕', content: '按本地人推荐的路线，连续 7 天吃了 14 家店，筛选出真正值得去的 8 家。', images: [pic('hotpot', 4), pic('chinese,food', 5), pic('dumplings', 6), pic('noodles', 7)], tags: ['美食', '老字号'], status: 'approved', likes: 512, comments: 89, views: 5670, hasTrip: false, hasSpot: false, createdAt: '2026-09-15', liked: true, faved: true },
    { id: 'p3', author: '一路向南', avatar: '🌊', level: '旅行达人', city: '三亚', cat: '景点打卡', title: '三亚避坑指南：这些网红点根本不值得去', content: '实测亚龙湾、蜈支洲岛、天涯海角，列出最坑的 3 个和最值的 3 个。', images: [pic('scenic,view', 8), pic('beach', 9)], tags: ['避雷', '景点'], status: 'approved', likes: 345, comments: 72, views: 4120, hasTrip: true, tripName: '寒假三亚度假', hasSpot: true, spotName: '亚龙湾', createdAt: '2026-09-12', liked: false, faved: false },
    { id: 'p4', author: '阿树', avatar: '🌳', level: '资深玩家', city: '北京', cat: '行程攻略', title: '北京 5 天 4 夜：故宫 + 长城 + 胡同深度游', content: '避开国庆人流高峰的小众路线，含故宫预约技巧、长城包车攻略。', images: [pic('china,pagoda', 10), pic('great,wall', 11), pic('temple,old', 12)], tags: ['攻略', '历史人文'], status: 'approved', likes: 678, comments: 103, views: 7890, hasTrip: false, hasSpot: true, spotName: '故宫博物院', createdAt: '2026-09-10', liked: false, faved: false },
    { id: 'p5', author: '看海的人', avatar: '🌊', level: '旅行萌新', city: '杭州', cat: '住宿体验', title: '西湖边 500 元以内酒店实测 10 家', content: '实测了 10 家地铁 1 号线沿线的酒店，给出性价比最高的 3 家。', images: [pic('hotel,bedroom', 13), pic('resort,hotel', 14)], tags: ['住宿', '性价比'], status: 'approved', likes: 189, comments: 34, views: 2340, hasTrip: false, hasSpot: false, createdAt: '2026-09-08', liked: false, faved: false },
    { id: 'p6', author: '困困鱼', avatar: '🐟', level: '旅行达人', city: '重庆', cat: '美食探店', title: '重庆火锅哪家强？实测 6 家网红店', content: '解放碑、观音桥、磁器口各挑 2 家，排队时间、味道、价格全方位对比。', images: [pic('hotpot', 15), pic('cuisine', 16), pic('hotpot,spicy', 17)], tags: ['美食', '火锅'], status: 'approved', likes: 423, comments: 76, views: 4560, hasTrip: false, hasSpot: false, createdAt: '2026-09-05', liked: true, faved: false },
    { id: 'p7', author: '风筝不断线', avatar: '🪁', level: '资深玩家', city: '西安', cat: '行程攻略', title: '西安 3 天 2 夜：兵马俑 + 回民街 + 大唐不夜城', content: '含兵马俑讲解预约、回民街美食推荐、不夜城拍照攻略。', images: [pic('temple,old', 18), pic('china,pagoda', 19), pic('scenic,view', 20)], tags: ['攻略', '历史人文'], status: 'approved', likes: 298, comments: 51, views: 3450, hasTrip: true, tripName: '西安美食之旅', hasSpot: true, spotName: '秦始皇兵马俑', createdAt: '2026-09-03', liked: false, faved: true },
    { id: 'p8', author: '街角咖啡', avatar: '☕', level: '旅行萌新', city: '丽江', cat: '避雷避坑', title: '丽江旅游的 5 个大坑，我替你踩过了', content: '束河古镇骑马、玉龙雪山氧气瓶、拉市海骑马……这些坑千万别踩。', images: [pic('crowded,street', 21), pic('dirty,road', 22)], tags: ['避雷', '踩坑'], status: 'approved', likes: 167, comments: 45, views: 1980, hasTrip: false, hasSpot: false, createdAt: '2026-09-01', liked: false, faved: false },
    { id: 'p9', author: '小陈同学', avatar: '🎒', level: '旅行萌新', city: '厦门', cat: '景点打卡', title: '鼓浪屿一日游实拍', content: '刚从厦门回来，鼓浪屿真的很美，分享一下我的照片。', images: [pic('scenic,view', 23), pic('lake,park', 24)], tags: ['景点', '厦门'], status: 'pending', likes: 0, comments: 0, views: 0, hasTrip: false, hasSpot: false, createdAt: '2026-09-20', liked: false, faved: false },
    { id: 'p10', author: '周末出逃', avatar: '🏃', level: '旅行萌新', city: '广州', cat: '美食探店', title: '广州早茶 Top 5', content: '广州早茶文化真的太棒了，这 5 家值得去。', images: [pic('chinese,food', 25), pic('dumplings', 26)], tags: ['美食', '广州'], status: 'pending', likes: 0, comments: 0, views: 0, hasTrip: false, hasSpot: false, createdAt: '2026-09-20', liked: false, faved: false },
    { id: 'p11', author: '白日梦想家', avatar: '💤', level: '旅行萌新', city: '青岛', cat: '行程攻略', title: '青岛 3 天游路线', content: '栈桥 → 八大关 → 崂山，简单路线分享。', images: [pic('scenic,view', 27), pic('road,travel', 28)], tags: ['攻略', '青岛'], status: 'pending', likes: 0, comments: 0, views: 0, hasTrip: false, hasSpot: false, createdAt: '2026-09-20', liked: false, faved: false },
    { id: 'p12', author: '橘子汽水', avatar: '🍊', level: '旅行萌新', city: '大理', cat: '住宿体验', title: '大理洱海边民宿推荐', content: '住了 3 家洱海边的民宿，各有特色。', images: [pic('hotel,bedroom', 29), pic('resort,hotel', 30)], tags: ['住宿', '大理'], status: 'pending', likes: 0, comments: 0, views: 0, hasTrip: false, hasSpot: false, createdAt: '2026-09-20', liked: false, faved: false },
    { id: 'p13', author: '南方的巷子', avatar: '🏘️', level: '旅行萌新', city: '长沙', cat: '避雷避坑', title: '长沙坡子街天价臭豆腐', content: '50 块钱 6 块，比别处贵 3 倍。', images: [pic('queue,people', 31)], tags: ['避雷', '长沙'], status: 'rejected', rejectReason: '内容过于简短，建议补充更多细节', likes: 23, comments: 5, views: 180, hasTrip: false, hasSpot: false, createdAt: '2026-09-19', liked: false, faved: false },
    { id: 'p14', author: '一半月光', avatar: '🌙', level: '旅行萌新', city: '昆明', cat: '美食探店', title: '过桥米线哪家好吃', content: '都差不多。', images: [], tags: ['美食', '昆明'], status: 'rejected', rejectReason: '内容过短且无图片，无法通过审核', likes: 0, comments: 0, views: 45, hasTrip: false, hasSpot: false, createdAt: '2026-09-18', liked: false, faved: false },
    { id: 'p15', author: '不打烊', avatar: '🕐', level: '旅行萌新', city: '南京', cat: '景点打卡', title: '中山陵实拍', content: '今天去了中山陵，拍照。', images: [pic('temple,old', 32)], tags: ['景点', '南京'], status: 'rejected', rejectReason: '内容过于简单，建议补充游玩体验或路线建议', likes: 0, comments: 0, views: 67, hasTrip: false, hasSpot: false, createdAt: '2026-09-17', liked: false, faved: false }
]

const state = reactive({ posts: [], city: '', cat: '全部', sort: 'latest', status: 'approved', _loadedFromBackend: false })
const CATS = ['全部', '行程攻略', '美食探店', '景点打卡', '住宿体验', '避雷避坑']
const HOT_CITIES = ['南昌', '成都', '北京', '三亚', '杭州', '重庆', '西安', '厦门']

const load = () => {
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k))
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const saved = JSON.parse(raw)
            const clean = (saved.posts || []).filter(p => p && p.id && p.title)
            state.posts = clean.length >= 5 ? clean : SEED_POSTS
        } else {
            state.posts = SEED_POSTS; persist()
        }
    } catch { state.posts = SEED_POSTS }
}
const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify({ posts: state.posts }))

/** 尝试从后端拉取帖子覆盖本地缓存 */
const refreshFromBackend = async () => {
    try {
        const auth = useAuthStore()
        const params = {}
        if (!auth.isAdmin()) params.status = 'approved'
        const list = await get('/posts', params)
        if (Array.isArray(list) && list.length) {
            state.posts = list.map(normalizePost)
            state._loadedFromBackend = true
            persist()
            return true
        }
    } catch { /* 后端不可用，保持本地 */ }
    return false
}

// 后端字段 → 前端字段适配
const normalizePost = (p) => {
    if (!p) return null
    return {
        id: String(p.id),
        author: p.authorName || p.author || '匿名',
        avatar: p.authorAvatar || p.avatar || '✈️',
        level: p.level || '旅行萌新',
        title: p.title,
        content: p.content,
        city: p.city || '',
        cat: p.cat || '行程攻略',
        tags: safeJson(p.tags),
        images: safeJson(p.images),
        status: p.status || 'approved',
        rejectReason: p.rejectReason || '',
        likes: p.likes || 0,
        comments: p.comments || 0,
        views: p.views || 0,
        createdAt: (p.createdAt || '').slice(0, 10),
        liked: false, faved: false
    }
}
const safeJson = (s) => {
    if (Array.isArray(s)) return s
    try { return s ? JSON.parse(s) : [] } catch { return [] }
}

load()

// isAdmin 从 authStore 派生
const isAdmin = computed(() => { try { return useAuthStore().isAdmin() } catch { return false } })

const filteredPosts = computed(() => {
    let list = state.posts.filter(p => p && p.id)
    if (!isAdmin.value) list = list.filter(p => p.status === 'approved')
    else if (state.status !== 'all') list = list.filter(p => p.status === state.status)
    if (state.city) list = list.filter(p => p.city === state.city)
    if (state.cat !== '全部') list = list.filter(p => p.cat === state.cat)
    if (state.sort === 'hot') list = [...list].sort((a, b) => b.likes - a.likes)
    else if (state.sort === 'comments') list = [...list].sort((a, b) => b.comments - a.comments)
    else list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return list
})

const stats = computed(() => ({
    today: state.posts.filter(p => p.createdAt === now()).length,
    weekHot: state.posts.filter(p => p.likes > 100 && p.status === 'approved').length,
    total: state.posts.filter(p => p.status === 'approved').length
}))

const topHot = computed(() =>
    state.posts.filter(p => p && p.id && p.status === 'approved').sort((a, b) => b.likes - a.likes).slice(0, 3)
)

// 当前登录用户自己发布的所有帖子（Banner 统计 + 个人主页可用）
const myPosts = computed(() => {
    try {
        const name = useAuthStore().state.name
        if (!name) return []
        return state.posts.filter(p => p && p.author === name)
    } catch { return [] }
})

// Actions（本地立即可见 + 后端异步同步）
const toggleLike = (id) => {
    const p = state.posts.find(x => x.id === id); if (!p) return
    p.liked = !p.liked; p.likes += p.liked ? 1 : -1; persist()
    try { post(`/posts/${id}/like`).catch(() => {}) } catch {}
}
const toggleFav = (id) => {
    const p = state.posts.find(x => x.id === id); if (!p) return
    p.faved = !p.faved; persist()
    try { post(`/posts/${id}/fav`).catch(() => {}) } catch {}
}
const hasFaved = (id) => { const p = state.posts.find(x => x.id === id); return !!p?.faved }
const addPost = (data) => {
    const auth = useAuthStore()
    const name = auth.state.name || '旅行体验官'
    const avatar = auth.state.avatar || '✈️'
    const postItem = { id: genId(), author: name, avatar, level: auth.isAdmin() ? '官方管理员' : '旅行萌新', status: auth.isAdmin() ? 'approved' : 'pending', likes: 0, comments: 0, views: 0, liked: false, faved: false, createdAt: now(), ...data }
    state.posts.unshift(postItem); persist()
    // 同时发给后端
    try {
        post('/posts', {
            title: postItem.title, content: postItem.content,
            city: postItem.city, cat: postItem.cat,
            tags: JSON.stringify(postItem.tags || []),
            images: JSON.stringify(postItem.images || []),
        }).then(res => { if (res?.id) postItem.id = String(res.id) }).catch(() => {})
    } catch {}
    return postItem
}
const approvePost = (id) => {
    const p = state.posts.find(x => x.id === id); if (!p) return
    p.status = 'approved'; p.rejectReason = ''; persist()
    try { put(`/posts/${id}/approve`).catch(() => {}) } catch {}
}
const rejectPost = (id, reason) => {
    const p = state.posts.find(x => x.id === id); if (!p) return
    p.status = 'rejected'; p.rejectReason = reason || '内容不符合社区规范'; persist()
    try { put(`/posts/${id}/reject`, { reason }).catch(() => {}) } catch {}
}
const deletePost = (id) => {
    const i = state.posts.findIndex(x => x.id === id); if (i >= 0) { state.posts.splice(i, 1); persist() }
    try { del(`/posts/${id}`).catch(() => {}) } catch {}
}
const resetData = () => { localStorage.removeItem(STORAGE_KEY); state.posts = SEED_POSTS; state.city = ''; state.cat = '全部'; state.sort = 'latest'; state.status = 'approved' }
const resetFilters = () => { state.city = ''; state.cat = '全部'; state.sort = 'latest' }

export function useCommunityStore() {
    return { state, isAdmin, filteredPosts, stats, topHot, myPosts, CATS, HOT_CITIES, toggleLike, toggleFav, hasFaved, addPost, approvePost, rejectPost, deletePost, resetData, resetFilters, refreshFromBackend }
}
