import { reactive, computed, watch } from 'vue'

/**
 * 花销账单 Store
 * 行程规划页 Tab3 与榜单&预算页 Tab1 共用
 */

const STORAGE_KEY = 'pc-expense-v1'

const defaultState = () => ({
    // 本次出行总预算
    budget: 5000,
    // 账单条目
    // {id, source:'ai'|'manual', category, purpose, amount, actual, dayNo, date, poiId}
    bills: [],
    // 已保存的预算方案快照历史
    planHistory: []
})

const state = reactive(defaultState())

// 预估总花费：全部账单金额求和
const estimatedTotal = computed(() =>
    state.bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)
)

// 实际已花费：已填写 actual 的按 actual，否则未实际支付不计入
const actualTotal = computed(() =>
    state.bills.reduce((sum, b) => sum + (b.actual != null ? (Number(b.actual) || 0) : 0), 0)
)

// 剩余金额：预算 - 实际花费
const remaining = computed(() => state.budget - actualTotal.value)

// 预算使用率
const usagePercent = computed(() => {
    if (!state.budget) return 0
    return Math.min(150, Math.round((actualTotal.value / state.budget) * 100))
})

const isOverrun = computed(() => remaining.value < 0)

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const addBill = (bill) => {
    state.bills.push({
        id: genId(),
        source: 'manual',
        category: '其他',
        purpose: '',
        amount: 0,
        actual: null,
        dayNo: null,
        date: new Date().toISOString().slice(0, 10),
        poiId: null,
        ...bill
    })
}

const updateBill = (id, patch) => {
    const bill = state.bills.find(b => b.id === id)
    if (bill) Object.assign(bill, patch)
}

const removeBill = (id) => {
    const i = state.bills.findIndex(b => b.id === id)
    if (i > -1) state.bills.splice(i, 1)
}

// 通过场所 POI 新增预估账单（同一 poiId 不重复添加）
const addPoiBill = (poi) => {
    if (state.bills.some(b => b.poiId === poi.name)) return false
    addBill({
        source: 'ai',
        category: poi.category,
        purpose: poi.name,
        amount: Number(poi.refPrice) || 0,
        poiId: poi.name
    })
    return true
}

const removePoiBill = (poiName) => {
    const i = state.bills.findIndex(b => b.poiId === poiName)
    if (i > -1) state.bills.splice(i, 1)
}

// 保存当前预算方案快照
const savePlan = (destination) => {
    state.planHistory.unshift({
        id: genId(),
        destination: destination || '未命名行程',
        budget: state.budget,
        billCount: state.bills.length,
        savedAt: new Date().toISOString().slice(0, 10)
    })
}

const removePlan = (id) => {
    const i = state.planHistory.findIndex(p => p.id === id)
    if (i > -1) state.planHistory.splice(i, 1)
}

// ---------------- 持久化 ----------------

watch(
    () => state,
    () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch (e) {
            // ignore
        }
    },
    { deep: true }
)

const restore = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        Object.assign(state, defaultState(), JSON.parse(raw))
    } catch (e) {
        // ignore
    }
}

restore()

export function useExpenseStore() {
    return {
        state,
        estimatedTotal,
        actualTotal,
        remaining,
        usagePercent,
        isOverrun,
        addBill,
        updateBill,
        removeBill,
        addPoiBill,
        removePoiBill,
        savePlan,
        removePlan
    }
}
