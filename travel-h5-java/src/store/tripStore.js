import { reactive, computed, watch } from 'vue'

/**
 * 行程共享 Store
 * 三个页面共用：行程规划页设置的目的地、天数等会自动同步到行李清单页
 * 当前先持久化到 localStorage，后续接入数据库时仅需替换读写实现
 */

const STORAGE_KEY = 'pc-trip-context-v2'

const defaultState = () => ({
    // 行程基础表单
    form: {
        origin: '',
        destination: '',
        travelDays: null,
        preference: '休闲'
    },
    // AI 返回的多套候选路线
    routes: [],
    // 当前选中的路线下标
    selectedIndex: -1,
    // 沿途场所：缓存列表 + 缓存标识 + 已添加到行程的场所 id
    poiList: [],
    poiKey: '',
    pickedPoiIds: [],
    // 路线偏离信号（地图监测到偏离时 +1，场所页据此刷新）
    offRouteSignal: 0,
    // 我创建/收藏的真实行程（用于个人主页统计 + 列表展示）
    myTrips: []
})

// 种子：用户已有 3 条真实行程（对应 ProfileHome 的 3 张行程卡）
const SEED_TRIPS = [
    { id: 't-seed-1', name: '成都经典三日游', origin: '成都', destination: '都江堰·熊猫基地',
        days: 3, people: 2, cost: 2800, status: '已完成', bg: 'linear-gradient(135deg, #2374DD, #4a90e8)', createdAt: '2026-09-15' },
    { id: 't-seed-2', name: '南昌本地深度游', origin: '南昌市內', destination: '滕王阁·武功山',
        days: 4, people: 3, cost: 3600, status: '进行中', bg: 'linear-gradient(135deg, #0EA5A4, #38bdbb)', createdAt: '2026-09-20' },
    { id: 't-seed-3', name: '寒假三亚度假', origin: '出发', destination: '三亚亚龙湾',
        days: 5, people: 4, cost: 6800, status: '未出行', bg: 'linear-gradient(135deg, #E8912F, #f2b15c)', createdAt: '2026-01-10' }
]

const state = reactive(defaultState())

// 选中路线对象
const selectedRoute = computed(() => {
    if (state.selectedIndex < 0) return null
    return state.routes[state.selectedIndex] || null
})

// 将选中路线的每日点位按天拼成上下文文本，供 POI 推荐与地图使用
const routeContext = computed(() => {
    if (!selectedRoute.value) return ''
    return selectedRoute.value.dayPlans
        .map(day => `第${day.dayNo}天 ${day.dayTitle}：${day.points.map(p => p.name).join('、')}`)
        .join('；')
})

// 扁平化全部点位（带天数归属），供地图布局
const flatPoints = computed(() => {
    if (!selectedRoute.value) return []
    const list = []
    selectedRoute.value.dayPlans.forEach(day => {
        day.points.forEach((p, i) => {
            list.push({ ...p, dayNo: day.dayNo, indexInDay: i })
        })
    })
    return list
})

const setRoutes = (routes) => {
    state.routes = routes || []
    state.selectedIndex = routes && routes.length ? 0 : -1
    state.poiList = []
    state.poiKey = ''
}

const selectRoute = (index) => {
    if (index >= 0 && index < state.routes.length) {
        state.selectedIndex = index
        // 切换路线后场所缓存失效
        state.poiList = []
        state.poiKey = ''
    }
}

const setPoiList = (list, key) => {
    state.poiList = list || []
    state.poiKey = key || ''
}

const isPoiPicked = (name) => state.pickedPoiIds.includes(name)

const markPoiPicked = (name) => {
    if (!state.pickedPoiIds.includes(name)) state.pickedPoiIds.push(name)
}

const unmarkPoiPicked = (name) => {
    const i = state.pickedPoiIds.indexOf(name)
    if (i > -1) state.pickedPoiIds.splice(i, 1)
}

const bumpOffRoute = () => {
    state.offRouteSignal += 1
}

// ---------------- 持久化 ----------------

const persist = watch(
    () => state,
    (val) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
        } catch (e) {
            // 写入失败不影响使用
        }
    },
    { deep: true }
)

const restore = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) { state.myTrips = [...SEED_TRIPS]; return }
        const saved = JSON.parse(raw)
        Object.assign(state, defaultState(), saved)
        if (!state.myTrips?.length) state.myTrips = [...SEED_TRIPS]
    } catch (e) {
        state.myTrips = [...SEED_TRIPS]
    }
}

// ---------- myTrips actions ----------
const addTrip = (trip) => {
    if (!trip?.name) return false
    state.myTrips.unshift({
        id: trip.id || `t-${Date.now()}`,
        name: trip.name,
        origin: trip.origin || '',
        destination: trip.destination || '',
        days: trip.days || trip.travelDays || 1,
        people: trip.people || 1,
        cost: trip.cost || 0,
        status: trip.status || '未出行',
        bg: trip.bg || 'linear-gradient(135deg, #2374DD, #4a90e8)',
        createdAt: trip.createdAt || new Date().toISOString().slice(0, 10)
    })
    return true
}
const removeTrip = (id) => { const i = state.myTrips.findIndex(t => t.id === id); if (i > -1) state.myTrips.splice(i, 1) }

restore()

export function useTripStore() {
    return {
        state,
        selectedRoute,
        routeContext,
        flatPoints,
        setRoutes,
        selectRoute,
        setPoiList,
        isPoiPicked,
        markPoiPicked,
        unmarkPoiPicked,
        bumpOffRoute,
        addTrip,
        removeTrip
    }
}
