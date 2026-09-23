/**
 * 认证 Store
 * - 优先请求后端 /api/auth/login
 * - 后端不可用时自动 fallback 到本地 mock
 * - localStorage 持久化（key pc-auth-v1）
 */
import { reactive } from 'vue'
import { post, setToken, clearToken } from '../utils/request'

const STORAGE_KEY = 'pc-auth-v1'

const ACCOUNTS = {
    'admin': { password: 'admin123', role: 'admin', name: '系统管理员', avatar: '🛡️',
        sign: '管理全平台内容审核，确保社区健康运营', origin: '北京', budget: '10000+', interests: ['历史人文', '美食探店', '住宿体验'] },
    'traveler': { password: 'travel123', role: 'user', name: '旅行体验官', avatar: '✈️',
        sign: '把生活过成一场旅行，把旅行走成一段生活 ✈️', origin: '南昌', budget: '3000-5000', interests: ['自然风光', '美食探店', '小众打卡'] }
}

const state = reactive({
    isLoggedIn: false,
    username: '',
    role: '',
    name: '',
    avatar: '',
    sign: '',
    origin: '',
    budget: '',
    interests: []
})

// 启动恢复
try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
        const saved = JSON.parse(raw)
        if (saved.isLoggedIn) Object.assign(state, saved)
    }
} catch {}

const persist = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            isLoggedIn: state.isLoggedIn, username: state.username, role: state.role,
            name: state.name, avatar: state.avatar, sign: state.sign,
            origin: state.origin, budget: state.budget, interests: state.interests
        }))
    } catch {}
}

const applyAccount = (username, acc, backend = false) => {
    state.isLoggedIn = true
    state.username = username
    state.role = acc.role || 'user'
    state.name = acc.name || username
    state.avatar = acc.avatar || '✈️'
    state.sign = acc.sign || ''
    state.origin = acc.origin || ''
    state.budget = acc.budget || ''
    state.interests = Array.isArray(acc.interests) ? [...acc.interests] : []
    persist()
}

/**
 * 登录：先尝试后端 /api/auth/login，失败自动 fallback 到本地 mock
 */
const login = async (username, password) => {
    const user = (username || '').trim()
    const pwd = password || ''
    if (!user || !pwd) return { ok: false, msg: '请输入账号和密码' }

    // ① 尝试后端
    try {
        const data = await post('/auth/login', { username: user, password: pwd })
        if (data && data.user) {
            setToken(data.token)
            applyAccount(user, { ...data.user }, true)
            return { ok: true, msg: `✅ 登录成功（后端）` }
        }
    } catch (e) {
        // 后端连不上或账号错误 → fallback 到 mock
        const acc = ACCOUNTS[user]
        if (acc && acc.password === pwd) {
            applyAccount(user, acc, false)
            return { ok: true, msg: `🔌 后端未启用，已切换本地账号` }
        }
        return { ok: false, msg: e?.message || '账号或密码错误' }
    }

    // ② mock fallback
    const acc = ACCOUNTS[user]
    if (!acc) return { ok: false, msg: '账号不存在' }
    if (acc.password !== pwd) return { ok: false, msg: '密码错误' }
    applyAccount(user, acc, false)
    return { ok: true, msg: '🔌 后端未启用，已切换本地账号' }
}

const logout = () => {
    state.isLoggedIn = false
    state.username = ''
    state.role = ''
    state.name = ''
    state.avatar = ''
    state.sign = ''
    state.origin = ''
    state.budget = ''
    state.interests = []
    clearToken()
    localStorage.removeItem(STORAGE_KEY)
}

const isAdmin = () => state.role === 'admin'
const isUser = () => state.role === 'user'

const updateProfile = async (patch) => {
    if (patch.name !== undefined) state.name = patch.name
    if (patch.avatar !== undefined) state.avatar = patch.avatar
    if (patch.sign !== undefined) state.sign = patch.sign
    if (patch.origin !== undefined) state.origin = patch.origin
    if (patch.budget !== undefined) state.budget = patch.budget
    if (patch.interests !== undefined) state.interests = [...patch.interests]
    persist()
    // 同步到后端（失败不阻塞）
    try {
        await post('/user/me', patch)
    } catch {}
}

export function useAuthStore() {
    return { state, login, logout, isAdmin, isUser, updateProfile }
}
