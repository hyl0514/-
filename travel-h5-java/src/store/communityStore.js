/**
 * 社区旅友空间 Store
 *
 * 数据流：本地优先（立即渲染，离线可用）→ 后端异步同步（MySQL）
 *
 * 后端接口约定（后续接入数据库时按此实现即可，前端无需改动）：
 *   GET    /api/posts?status=approved     帖子列表（普通用户只能拿到 approved）
 *   POST   /api/posts                     发布帖子，写入 status=pending 待审核
 *   PUT    /api/posts/{id}/approve        管理员审核通过 → 全站用户可见
 *   PUT    /api/posts/{id}/reject         管理员驳回并记录理由
 *   DELETE /api/posts/{id}                删除帖子
 *   POST   /api/posts/{id}/like           点赞
 *   POST   /api/posts/{id}/fav            收藏
 *
 * 发布规则：普通用户发布 → status=pending（仅自己和管理员可见）
 *          管理员审核通过 → status=approved（所有用户可见）
 *          管理员本人发布 → 直接 approved
 *
 * 所有写操作先改本地（保证立即可见），再异步同步后端；
 * 后端不可用时自动降级为纯 localStorage 模式。
 */
import { reactive, computed } from 'vue'
import { useAuthStore } from './authStore'
import { postApi } from '../api'
import { imgMap } from '../utils/imgMap'

const STORAGE_KEY = 'pc-community-v8'
const LEGACY_KEYS = ['pc-community-v1', 'pc-community-v2', 'pc-community-v3', 'pc-community-v4', 'pc-community-v5', 'pc-community-v6', 'pc-community-v7']

const genId = () => `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const now = () => new Date().toISOString().slice(0, 10)

// 真实场景图（与榜单页同一图源，国内可直接访问）；未命中时回退通用实拍图
const FALLBACK_IMGS = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1545156521-77bd85671d30?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&h=450&fit=crop'
]
/** 按场所名取真实照片；名称未收录时按序号回退 */
const pic = (name, idx = 0) => imgMap[name] || FALLBACK_IMGS[idx % FALLBACK_IMGS.length]

const SEED_POSTS = [
    { id: 'p1', author: '背包十年', avatar: '🧭', level: '资深玩家', city: '南昌', cat: '行程攻略', title: '南昌 4 天 3 夜深度攻略：滕王阁 + 武功山 + 美食地图', content: '从滕王阁看落霞与孤鹜，到万寿宫逛夜景，再坐 2 小时车去武功山看日出。', images: [pic('滕王阁'), pic('万寿宫历史文化街区'), pic('秋水广场')], tags: ['攻略', '历史人文'], status: 'approved', likes: 238, comments: 47, views: 3280, hasTrip: true, tripName: '南昌本地深度游', hasSpot: true, spotName: '滕王阁', createdAt: '2026-09-18', liked: false, faved: false },
    { id: 'p2', author: '晚风', avatar: '🌙', level: '旅行达人', city: '成都', cat: '美食探店', title: '成都一周吃遍老字号：从陈麻婆到贺记蛋烘糕', content: '按本地人推荐的路线，连续 7 天吃了 14 家店，筛选出真正值得去的 8 家。', images: [pic('陈麻婆豆腐（骡马市总店）'), pic('贺记蛋烘糕'), pic('春熙路·太古里'), pic('成都小龙坎火锅')], tags: ['美食', '老字号'], status: 'approved', likes: 512, comments: 89, views: 5670, hasTrip: false, hasSpot: false, createdAt: '2026-09-15', liked: true, faved: true },
    { id: 'p3', author: '一路向南', avatar: '🌊', level: '旅行达人', city: '三亚', cat: '景点打卡', title: '三亚避坑指南：这些网红点根本不值得去', content: '实测亚龙湾、蜈支洲岛、天涯海角，列出最坑的 3 个和最值的 3 个。', images: [pic('亚龙湾'), pic('蜈支洲岛')], tags: ['避雷', '景点'], status: 'approved', likes: 345, comments: 72, views: 4120, hasTrip: true, tripName: '寒假三亚度假', hasSpot: true, spotName: '亚龙湾', createdAt: '2026-09-12', liked: false, faved: false },
    { id: 'p4', author: '阿树', avatar: '🌳', level: '资深玩家', city: '北京', cat: '行程攻略', title: '北京 5 天 4 夜：故宫 + 长城 + 胡同深度游', content: '避开国庆人流高峰的小众路线，含故宫预约技巧、长城包车攻略。', images: [pic('北京故宫博物院'), pic('八达岭长城'), pic('南锣鼓巷')], tags: ['攻略', '历史人文'], status: 'approved', likes: 678, comments: 103, views: 7890, hasTrip: false, hasSpot: true, spotName: '故宫博物院', createdAt: '2026-09-10', liked: false, faved: false },
    { id: 'p5', author: '看海的人', avatar: '🌊', level: '旅行萌新', city: '杭州', cat: '住宿体验', title: '西湖边 500 元以内酒店实测 10 家', content: '实测了 10 家地铁 1 号线沿线的酒店，给出性价比最高的 3 家。', images: [pic('杭州民宿'), pic('杭州西湖风景名胜区')], tags: ['住宿', '性价比'], status: 'approved', likes: 189, comments: 34, views: 2340, hasTrip: false, hasSpot: false, createdAt: '2026-09-08', liked: false, faved: false },
    { id: 'p6', author: '困困鱼', avatar: '🐟', level: '旅行达人', city: '重庆', cat: '美食探店', title: '重庆火锅哪家强？实测 6 家网红店', content: '解放碑、观音桥、磁器口各挑 2 家，排队时间、味道、价格全方位对比。', images: [pic('重庆朝天门火锅'), pic('重庆洪崖洞')], tags: ['美食', '火锅'], status: 'approved', likes: 423, comments: 76, views: 4560, hasTrip: false, hasSpot: false, createdAt: '2026-09-05', liked: true, faved: false },
    { id: 'p7', author: '风筝不断线', avatar: '🪁', level: '资深玩家', city: '西安', cat: '行程攻略', title: '西安 3 天 2 夜：兵马俑 + 回民街 + 大唐不夜城', content: '含兵马俑讲解预约、回民街美食推荐、不夜城拍照攻略。', images: [pic('西安秦始皇兵马俑'), pic('回民街'), pic('大唐不夜城')], tags: ['攻略', '历史人文'], status: 'approved', likes: 298, comments: 51, views: 3450, hasTrip: true, tripName: '西安美食之旅', hasSpot: true, spotName: '秦始皇兵马俑', createdAt: '2026-09-03', liked: false, faved: true },
    { id: 'p8', author: '街角咖啡', avatar: '☕', level: '旅行萌新', city: '丽江', cat: '避雷避坑', title: '丽江旅游的 5 个大坑，我替你踩过了', content: '束河古镇骑马、玉龙雪山氧气瓶、拉市海骑马……这些坑千万别踩。', images: [pic('丽江古城'), pic('束河古镇'), pic('玉龙雪山')], tags: ['避雷', '踩坑'], status: 'approved', likes: 167, comments: 45, views: 1980, hasTrip: false, hasSpot: false, createdAt: '2026-09-01', liked: false, faved: false },
    { id: 'p9', author: '小陈同学', avatar: '🎒', level: '旅行萌新', city: '厦门', cat: '景点打卡', title: '鼓浪屿一日游实拍', content: '刚从厦门回来，鼓浪屿真的很美，分享一下我的照片。', images: [pic('鼓浪屿'), pic('厦门环岛路')], tags: ['景点', '厦门'], status: 'pending', likes: 0, comments: 0, views: 0, hasTrip: false, hasSpot: false, createdAt: '2026-09-20', liked: false, faved: false },
    { id: 'p10', author: '周末出逃', avatar: '🏃', level: '旅行萌新', city: '广州', cat: '美食探店', title: '广州早茶 Top 5', content: '广州早茶文化真的太棒了，这 5 家值得去。', images: [pic('广州陶陶居'), pic('广州早茶')], tags: ['美食', '广州'], status: 'pending', likes: 0, comments: 0, views: 0, hasTrip: false, hasSpot: false, createdAt: '2026-09-20', liked: false, faved: false },
    { id: 'p11', author: '白日梦想家', avatar: '💤', level: '旅行萌新', city: '青岛', cat: '行程攻略', title: '青岛 3 天游路线', content: '栈桥 → 八大关 → 崂山，简单路线分享。', images: [pic('青岛栈桥'), pic('八大关'), pic('崂山')], tags: ['攻略', '青岛'], status: 'pending', likes: 0, comments: 0, views: 0, hasTrip: false, hasSpot: false, createdAt: '2026-09-20', liked: false, faved: false },
    { id: 'p12', author: '橘子汽水', avatar: '🍊', level: '旅行萌新', city: '大理', cat: '住宿体验', title: '大理洱海边民宿推荐', content: '住了 3 家洱海边的民宿，各有特色。', images: [pic('洱海'), pic('大理古城')], tags: ['住宿', '大理'], status: 'pending', likes: 0, comments: 0, views: 0, hasTrip: false, hasSpot: false, createdAt: '2026-09-20', liked: false, faved: false },
    { id: 'p13', author: '南方的巷子', avatar: '🏘️', level: '旅行萌新', city: '长沙', cat: '避雷避坑', title: '长沙坡子街天价臭豆腐', content: '50 块钱 6 块，比别处贵 3 倍。', images: [pic('坡子街'), pic('长沙臭豆腐')], tags: ['避雷', '长沙'], status: 'rejected', rejectReason: '内容过于简短，建议补充更多细节', likes: 23, comments: 5, views: 180, hasTrip: false, hasSpot: false, createdAt: '2026-09-19', liked: false, faved: false },
    { id: 'p14', author: '一半月光', avatar: '🌙', level: '旅行萌新', city: '昆明', cat: '美食探店', title: '过桥米线哪家好吃', content: '都差不多。', images: [pic('昆明过桥米线')], tags: ['美食', '昆明'], status: 'rejected', rejectReason: '内容过短，缺少游玩体验描述，无法通过审核', likes: 0, comments: 0, views: 45, hasTrip: false, hasSpot: false, createdAt: '2026-09-18', liked: false, faved: false },
    { id: 'p15', author: '不打烊', avatar: '🕐', level: '旅行萌新', city: '南京', cat: '景点打卡', title: '中山陵实拍', content: '今天去了中山陵，拍照。', images: [pic('中山陵')], tags: ['景点', '南京'], status: 'rejected', rejectReason: '内容过于简单，建议补充游玩体验或路线建议', likes: 0, comments: 0, views: 67, hasTrip: false, hasSpot: false, createdAt: '2026-09-17', liked: false, faved: false }
]

const state = reactive({
    posts: [],
    city: '',
    cat: '全部',
    sort: 'latest',
    status: 'approved',
    // 浏览范围：all = 社区广场（只看到审核通过的公开内容）
    //          mine = 我的动态（可看到自己待审核 / 已驳回的帖子）
    scope: 'all',
    _loadedFromBackend: false
})
const CATS = ['全部', '行程攻略', '美食探店', '景点打卡', '住宿体验', '避雷避坑']
const HOT_CITIES = ['南昌', '成都', '北京', '三亚', '杭州', '重庆', '西安', '厦门']

// 种子数据补齐默认字段：本地数据（非后端来源）+ 公开可见
const decorate = (list) => (list || []).map(p => ({ perm: 'public', _local: true, ...p }))

// 旧数据里失效的图源（loremflickr 国内无法访问）替换为可用实拍图
const sanitizeImgs = (list) => (list || []).map(p => {
    if (!p) return p
    const imgs = Array.isArray(p.images) ? p.images : []
    return {
        ...p,
        images: imgs.map((u, i) => (typeof u === 'string' && u.includes('loremflickr'))
            ? FALLBACK_IMGS[i % FALLBACK_IMGS.length]
            : u)
    }
})

const load = () => {
    // 旧版本数据迁移：保留用户自己发布的内容，官方种子帖重新生成（换用可用图源）
    const legacyRaw = LEGACY_KEYS.map(k => localStorage.getItem(k)).find(Boolean)
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k))
    const isLegacy = !localStorage.getItem(STORAGE_KEY) && !!legacyRaw
    try {
        const raw = localStorage.getItem(STORAGE_KEY) || legacyRaw
        if (raw) {
            const saved = JSON.parse(raw)
            const clean = sanitizeImgs(decorate(saved.posts || [])).filter(p => p && p.id && p.title)
            if (isLegacy) {
                const mine = clean.filter(p => !/^p\d+$/.test(String(p.id)))
                state.posts = [...decorate(SEED_POSTS), ...mine]
            } else {
                state.posts = clean.length >= 5 ? clean : decorate(SEED_POSTS)
            }
            persist()
        } else {
            state.posts = decorate(SEED_POSTS); persist()
        }
    } catch { state.posts = decorate(SEED_POSTS) }
}
const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify({ posts: state.posts }))

/** 尝试从后端（MySQL）拉取帖子，合并尚未同步到后端的本地帖子 */
const refreshFromBackend = async () => {
    try {
        const auth = useAuthStore()
        const params = {}
        if (!auth.isAdmin()) params.status = 'approved'
        const list = await postApi.list(params)
        if (Array.isArray(list)) {
            const remote = list.map(normalizePost).filter(Boolean)
            // 未同步到后端的本地帖子（刚发布、后端还没写入）继续保留
            const localOnly = state.posts.filter(p => p._local && !remote.some(r => r.id === String(p.id)))
            state.posts = [...remote, ...localOnly]
            state._loadedFromBackend = true
            persist()
            return true
        }
    } catch { /* 后端不可用，保持本地模式 */ }
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
        images: sanitizeImgs([{ images: safeJson(p.images) }])[0].images,
        status: p.status || 'approved',
        rejectReason: p.rejectReason || '',
        likes: p.likes || 0,
        comments: p.comments || 0,
        views: p.views || 0,
        createdAt: (p.createdAt || '').slice(0, 10),
        perm: p.perm || 'public',
        // 后端来源的数据支持直接调用审核 / 删除接口
        _local: false,
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
// 当前登录用户名（用于「我的动态」过滤）
const currentUser = computed(() => { try { return useAuthStore().state.name || '' } catch { return '' } })

const filteredPosts = computed(() => {
    let list = state.posts.filter(p => p && p.id)
    const admin = isAdmin.value
    const me = currentUser.value

    if (state.scope === 'mine') {
        // 我的动态：自己的帖子全部可见（含待审核 / 已驳回）
        list = list.filter(p => me && p.author === me)
    } else if (!admin) {
        // 社区广场：必须审核通过且为公开内容，才对所有用户可见
        list = list.filter(p => p.status === 'approved' && p.perm !== 'private')
    } else if (state.status !== 'all') {
        list = list.filter(p => p.status === state.status)
    }

    if (state.city) list = list.filter(p => p.city === state.city)
    if (state.cat !== '全部') list = list.filter(p => p.cat === state.cat)
    if (state.sort === 'hot') list = [...list].sort((a, b) => b.likes - a.likes)
    else if (state.sort === 'comments') list = [...list].sort((a, b) => b.comments - a.comments)
    else list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return list
})

// 管理员待审核数量（用于后台入口角标）
const pendingCount = computed(() => state.posts.filter(p => p && p.status === 'pending').length)

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
// 只有后端来源的帖子才调用后端写接口（本地种子 / 离线帖子调用会 404）
const isRemote = (p) => !!p && !p._local && /^\d+$/.test(String(p.id))

const toggleLike = (id) => {
    const p = state.posts.find(x => x.id === id); if (!p) return
    p.liked = !p.liked; p.likes += p.liked ? 1 : -1; persist()
    if (isRemote(p)) { try { postApi.like(id).catch(() => {}) } catch {} }
}
const toggleFav = (id) => {
    const p = state.posts.find(x => x.id === id); if (!p) return
    p.faved = !p.faved; persist()
    if (isRemote(p)) { try { postApi.fav(id).catch(() => {}) } catch {} }
}
const hasFaved = (id) => { const p = state.posts.find(x => x.id === id); return !!p?.faved }
/**
 * 发布帖子
 * 普通用户 → status='pending'：仅本人与管理员可见，等待管理员审核
 * 管理员   → status='approved'：发布即对所有用户可见
 */
const addPost = (data) => {
    const auth = useAuthStore()
    // 未登录不允许发布（路由层已拦截，这里做数据层兜底）
    if (!auth.state.isLoggedIn) return null
    const admin = auth.isAdmin()
    const name = auth.state.name || '旅行体验官'
    const avatar = auth.state.avatar || '✈️'
    const postItem = {
        // 用户输入字段在前，身份 / 审核相关字段在后，避免被覆盖
        ...data,
        id: genId(), author: name, avatar,
        level: admin ? '官方管理员' : '旅行萌新',
        status: admin ? 'approved' : 'pending',
        perm: data?.perm === 'private' ? 'private' : 'public',
        likes: 0, comments: 0, views: 0,
        liked: false, faved: false,
        createdAt: now(),
        _local: true
    }
    state.posts.unshift(postItem); persist()
    // 异步写入后端（失败不影响本地使用）
    try {
        postApi.create({
            title: postItem.title, content: postItem.content,
            city: postItem.city, cat: postItem.cat, perm: postItem.perm,
            tags: JSON.stringify(postItem.tags || []),
            images: JSON.stringify(postItem.images || []),
        }).then(res => {
            if (res?.id) {
                // 同步成功后切换为后端 id，后续审核 / 删除走真实接口
                postItem.id = String(res.id)
                postItem._local = false
                persist()
            }
        }).catch(() => {})
    } catch {}
    return postItem
}
const approvePost = (id) => {
    if (!isAdmin.value) return false
    const p = state.posts.find(x => x.id === id); if (!p) return false
    p.status = 'approved'; p.rejectReason = ''; persist()
    if (isRemote(p)) { try { postApi.approve(id).catch(() => {}) } catch {} }
    return true
}
const rejectPost = (id, reason) => {
    if (!isAdmin.value) return false
    const p = state.posts.find(x => x.id === id); if (!p) return false
    p.status = 'rejected'; p.rejectReason = reason || '内容不符合社区规范'; persist()
    if (isRemote(p)) { try { postApi.reject(id, reason).catch(() => {}) } catch {} }
    return true
}
const deletePost = (id) => {
    const p = state.posts.find(x => x.id === id)
    if (!p) return false
    // 仅管理员或作者本人可删除
    if (!isAdmin.value && p.author !== currentUser.value) return false
    const i = state.posts.findIndex(x => x.id === id)
    if (i >= 0) { state.posts.splice(i, 1); persist() }
    if (isRemote(p)) { try { postApi.remove(id).catch(() => {}) } catch {} }
    return true
}
const resetData = () => {
    localStorage.removeItem(STORAGE_KEY)
    state.posts = decorate(SEED_POSTS)
    state.city = ''; state.cat = '全部'; state.sort = 'latest'; state.status = 'approved'; state.scope = 'all'
    persist()
}
const resetFilters = () => { state.city = ''; state.cat = '全部'; state.sort = 'latest' }

export function useCommunityStore() {
    return {
        state, isAdmin, currentUser, filteredPosts, pendingCount,
        stats, topHot, myPosts, CATS, HOT_CITIES, FALLBACK_IMGS,
        toggleLike, toggleFav, hasFaved, addPost, approvePost, rejectPost, deletePost,
        resetData, resetFilters, refreshFromBackend
    }
}
