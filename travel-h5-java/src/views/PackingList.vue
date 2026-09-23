<template>
  <div class="packing-page">
    <!-- 头部 -->
    <header class="page-header">
      <div>
        <h1 class="page-title">行李清单</h1>
        <p class="page-desc">AI 根据目的地、天数与天气生成打包清单，出发前逐项核对</p>
      </div>
    </header>

    <div class="packing-body">
      <!-- 左侧：表单 + 清单 -->
      <div class="left-col">
        <!-- 顶部表单 -->
        <div class="form-card pc-card">
          <div class="form-grid">
            <div>
              <label class="pc-label">目的地</label>
              <input class="pc-input" v-model="form.destination" list="pack-city" placeholder="选择或输入">
              <datalist id="pack-city">
                <option v-for="c in cities" :key="c" :value="c"></option>
              </datalist>
            </div>
            <div class="w110">
              <label class="pc-label">天数</label>
              <input class="pc-input" type="number" min="1" max="60" v-model.number="form.travelDays">
            </div>
            <div class="w130">
              <label class="pc-label">季节</label>
              <select class="pc-select" v-model="form.season">
                <option v-for="s in seasons" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="w130">
              <label class="pc-label">出行类型</label>
              <select class="pc-select" v-model="form.tripType">
                <option value="旅游">旅游</option>
                <option value="出差">出差</option>
              </select>
            </div>
            <div class="gen-wrap">
              <button class="pc-btn pc-btn-primary pc-btn-lg" :disabled="loading" @click="generate(false)">
                {{ loading ? '生成中...' : categories.length ? '🔄 重新生成' : '✨ AI 生成清单' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 操作按钮组 -->
        <div class="tool-row" v-if="categories.length">
          <button class="pc-btn pc-btn-sm" @click="openAdd">➕ 新增物品</button>
          <button class="pc-btn pc-btn-sm" @click="checkAll">☑️ 一键全选</button>
          <button class="pc-btn pc-btn-sm" @click="clearChecked">⬜ 清空勾选</button>
          <button class="pc-btn pc-btn-sm" @click="aiCheck">🔍 AI 检测缺失</button>
          <button class="pc-btn pc-btn-sm" style="margin-left:auto" @click="saveList">💾 保存清单</button>
          <button class="pc-btn pc-btn-sm pc-btn-primary" @click="saveAsPack">⭐ 保存为物品包</button>
        </div>

        <!-- 分类折叠面板 -->
        <div class="cat-list">
          <div class="cat-card pc-card" v-for="(cat, ci) in categories" :key="ci">
            <div class="cat-head" @click="toggleCat(ci)">
              <span class="cat-arrow" :class="{ open: openCats.includes(ci) }">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="cat-title">{{ cat.categoryName }}</span>
              <span class="cat-count">{{ getCatPacked(cat) }}/{{ getCatTotal(cat) }} 件</span>
            </div>

            <div class="cat-items" v-show="openCats.includes(ci)">
              <div class="pack-row" v-for="(item, ii) in cat.itemList" :key="ii"
                :class="{ checked: item.checked }">
                <span class="pc-check" :class="{ checked: item.checked }" @click="item.checked = !item.checked">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12.5l5 5L20 6.5" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="item-name">{{ item.itemName }}</span>
                <span class="item-remark">{{ item.remark }}</span>
                <span class="stepper">
                  <button class="st-btn" @click="item.quantity = Math.max(1, item.quantity - 1)">−</button>
                  <span class="st-num">{{ item.quantity }}</span>
                  <button class="st-btn" @click="item.quantity += 1">+</button>
                </span>
                <button v-if="item.isCustom" class="del-x" @click="removeItem(cat, item)">✕</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空态 -->
        <div class="pack-empty" v-if="!categories.length && !loading">
          <div class="pe-emoji">🧳</div>
          <p>填写行程信息后点击「AI 生成清单」</p>
          <p class="sub">将生成证件、衣物、药品、电子设备等 50+ 物品</p>
        </div>
      </div>

      <!-- 右侧：进度 + 重量 + 提示 -->
      <aside class="right-col" v-if="categories.length">
        <!-- 打包进度 -->
        <div class="sum-card pc-card">
          <div class="sum-title">📦 打包进度</div>
          <div class="ring" :style="ringStyle">
            <div class="ring-mid">
              <span class="ring-pct">{{ progressPct }}%</span>
              <span class="ring-sub">{{ packedQty }}/{{ totalQty }}件</span>
            </div>
          </div>
        </div>

        <!-- 行李重量预估 -->
        <div class="sum-card pc-card">
          <div class="sum-title">⚖️ 行李重量预估</div>
          <div class="weight-total">
            约 <span class="w-num">{{ totalWeight.toFixed(1) }}</span> kg
          </div>
          <div class="weight-bar">
            <div class="w-fill" :class="{ over: totalWeight > 7 }"
              :style="{ width: Math.min(100, totalWeight / 10 * 100) + '%' }"></div>
            <span class="w-threshold" style="left:70%">7kg</span>
          </div>
          <div class="w-tip">
            {{ totalWeight > 7 ? '超过随身登机 7kg 建议托运或精简' : '在随身登机 7kg 以内' }}
          </div>
          <div class="w-breakdown">
            <div v-for="w in weightBreakdown" :key="w.name" class="wb-row">
              <span class="wb-name">{{ w.name }}</span>
              <span class="wb-val">{{ w.weight.toFixed(1) }}kg</span>
            </div>
          </div>
        </div>

        <!-- 温馨提示 -->
        <div class="sum-card pc-card tips-card">
          <div class="sum-title">💡 温馨提示</div>
          <ul class="tip-list">
            <li>液体单瓶不超过 100ml 可随身登机</li>
            <li>充电宝必须随身、不可托运</li>
            <li>证件建议拍照云备份一份</li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- 新增物品弹窗 -->
    <teleport to="body">
      <div class="pc-mask" v-if="showAdd" @click.self="showAdd = false">
        <div class="pc-modal add-modal">
          <div class="pc-modal-header">
            <span class="pc-modal-title">➕ 新增自定义物品</span>
            <span class="pc-modal-close" @click="showAdd = false">✕</span>
          </div>
          <div class="pc-modal-body">
            <label class="pc-label">物品名称</label>
            <input class="pc-input" v-model="addForm.itemName" placeholder="例如：便携烧水杯">
            <div class="add-two">
              <div>
                <label class="pc-label" style="margin-top:15px">数量</label>
                <input class="pc-input" type="number" min="1" v-model.number="addForm.quantity">
              </div>
              <div>
                <label class="pc-label" style="margin-top:15px">所属分类</label>
                <select class="pc-select" v-model="addForm.categoryName">
                  <option v-for="c in categoryNames" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="pc-modal-footer">
            <button class="pc-btn" @click="showAdd = false">取消</button>
            <button class="pc-btn pc-btn-primary" @click="confirmAdd">确定</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- AI 缺失检测弹窗 -->
    <teleport to="body">
      <div class="pc-mask" v-if="showCheck" @click.self="showCheck = false">
        <div class="pc-modal check-modal">
          <div class="pc-modal-header">
            <span class="pc-modal-title">🔍 AI 缺失物品检测</span>
            <span class="pc-modal-close" @click="showCheck = false">✕</span>
          </div>
          <div class="pc-modal-body">
            <p class="check-summary">{{ checkResult.summary }}</p>
            <div v-if="checkResult.missingList.length" class="miss-list">
              <div class="miss-item" v-for="(m, i) in checkResult.missingList" :key="i">
                <span class="miss-name">{{ m.itemName }}</span>
                <span class="miss-reason">{{ m.reason }}</span>
              </div>
            </div>
            <div class="no-miss" v-else>清单很完整，没有发现明显遗漏 ✅</div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { generatePackingList, checkPackingMissing } from '../utils/packingApi'
import { useTripStore } from '../store/tripStore'
import { useFavoriteStore } from '../store/favoriteStore'
import toast from '../utils/msg'

const favorite = useFavoriteStore()

const { state: tripState } = useTripStore()

const STORAGE_KEY = 'pc-packing-list-v1'

const form = reactive({
    destination: '',
    travelDays: null,
    season: '夏季',
    tripType: '旅游',
    weatherInfo: ''
})

const categories = ref([])
const openCats = ref([])
const loading = ref(false)

const showAdd = ref(false)
const addForm = reactive({ itemName: '', quantity: 1, categoryName: '' })

const showCheck = ref(false)
const checkResult = reactive({ summary: '', missingList: [] })

const cities = tripState ? [
    '北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆',
    '南京', '武汉', '苏州', '长沙', '青岛', '厦门', '昆明', '三亚', '丽江', '大理'
] : []
const seasons = ['春季', '夏季', '秋季', '冬季']

// ---------------- 生成 ----------------

const generate = async () => {
    if (!form.destination) { toast.error('请填写目的地'); return }
    if (!form.travelDays || form.travelDays < 1) { toast.error('请填写正确天数'); return }

    loading.value = true
    try {
        const data = await generatePackingList({
            destination: form.destination,
            travelDays: Number(form.travelDays),
            weatherInfo: form.weatherInfo,
            tripType: form.tripType
        })

        const newCats = (data.categoryList || []).map(c => ({
            categoryName: c.categoryName,
            itemList: (c.itemList || []).map(i => ({
                itemName: i.itemName,
                quantity: Number(i.quantity) || 1,
                checkedDefault: !!i.checkedDefault,
                remark: i.remark || '',
                checked: !!i.checkedDefault,
                isCustom: false
            }))
        }))

        // 重新生成：保留用户自定义物品
        const customMap = new Map()
        categories.value.forEach(c => {
            c.itemList.filter(i => i.isCustom).forEach(i => {
                if (!customMap.has(c.categoryName)) customMap.set(c.categoryName, [])
                customMap.get(c.categoryName).push(i)
            })
        })
        customMap.forEach((items, name) => {
            const t = newCats.find(c => c.categoryName === name)
            if (t) t.itemList.push(...items)
            else newCats.push({ categoryName: name, itemList: items })
        })

        categories.value = newCats
        openCats.value = newCats.map((_, i) => i)
        toast.success('清单已生成')
    } catch (e) {
        console.error(e)
        toast.error('生成失败，请确认后端服务已启动')
    } finally {
        loading.value = false
    }
}

// ---------------- 折叠与操作 ----------------

const toggleCat = (i) => {
    const idx = openCats.value.indexOf(i)
    if (idx > -1) openCats.value.splice(idx, 1)
    else openCats.value.push(i)
}

const checkAll = () => {
    categories.value.forEach(c => c.itemList.forEach(i => { i.checked = true }))
    toast.success('已全部勾选')
}

const clearChecked = () => {
    categories.value.forEach(c => c.itemList.forEach(i => { i.checked = false }))
    toast('已清空全部勾选')
}

const removeItem = (cat, item) => {
    const idx = cat.itemList.indexOf(item)
    if (idx > -1) cat.itemList.splice(idx, 1)
    if (!cat.itemList.length) {
        const ci = categories.value.indexOf(cat)
        if (ci > -1) categories.value.splice(ci, 1)
    }
}

const saveList = () => {
    persist()
    toast.success('清单已保存')
}

const saveAsPack = () => {
    if (!categories.value.length) { toast.error('暂无物品可保存'); return }
    const name = form.destination
        ? `${form.destination}${form.travelDays || ''}日${form.season || ''}物品包`
        : `我的物品包 ${new Date().toLocaleDateString()}`
    favorite.addPack(name, categories.value, form.weatherInfo)
    toast.success(`⭐ 已保存为「${name}」`)
}

// ---------------- 自定义物品 ----------------

const categoryNames = computed(() => {
    const names = categories.value.map(c => c.categoryName)
    if (!names.includes('随身杂物类')) names.push('随身杂物类')
    return names
})

const openAddFn = () => {
    addForm.itemName = ''
    addForm.quantity = 1
    addForm.categoryName = categoryNames.value[0]
    showAdd.value = true
}
const openAdd = openAddFn

const confirmAdd = () => {
    if (!addForm.itemName.trim()) { toast.error('请填写名称'); return }
    const name = addForm.categoryName
    let cat = categories.value.find(c => c.categoryName === name)
    if (!cat) {
        cat = { categoryName: name, itemList: [] }
        categories.value.push(cat)
        openCats.value.push(categories.value.length - 1)
    }
    cat.itemList.push({
        itemName: addForm.itemName.trim(),
        quantity: Number(addForm.quantity) || 1,
        checkedDefault: true,
        remark: '自定义物品',
        checked: true,
        isCustom: true
    })
    showAdd.value = false
    toast.success('已添加')
}

// ---------------- AI 缺失检测 ----------------

const aiCheck = async () => {
    const itemNames = []
    categories.value.forEach(c => c.itemList.forEach(i => itemNames.push(i.itemName)))
    try {
        const data = await checkPackingMissing({
            destination: form.destination,
            travelDays: Number(form.travelDays),
            weatherInfo: form.weatherInfo,
            tripType: form.tripType,
            itemNames
        })
        checkResult.summary = data.summary
        checkResult.missingList = data.missingList || []
        showCheck.value = true
    } catch (e) {
        toast.error('检测失败，请确认后端服务已启动')
    }
}

// ---------------- 进度与重量 ----------------

const getCatTotal = (c) => c.itemList.reduce((s, i) => s + (Number(i.quantity) || 0), 0)
const getCatPacked = (c) => c.itemList.reduce((s, i) => s + (i.checked ? Number(i.quantity) || 0 : 0), 0)

const totalQty = computed(() => categories.value.reduce((s, c) => s + getCatTotal(c), 0))
const packedQty = computed(() => categories.value.reduce((s, c) => s + getCatPacked(c), 0))
const progressPct = computed(() => totalQty.value ? Math.min(100, Math.round(packedQty.value / totalQty.value * 100)) : 0)

const ringStyle = computed(() => ({
    background: `conic-gradient(#2374DD 0%, #5a97d6 ${progressPct.value}%, #edf1f5 ${progressPct.value}%, #edf1f5 100%)`
}))

// 各分类单件参考重量（kg），用于行李重量预估
const unitWeightMap = {
    '证件类': 0.05,
    '衣物类': 0.28,
    '药品类': 0.08,
    '电子设备类': 0.22,
    '洗漱护肤类': 0.15,
    '随身杂物类': 0.12
}

const weightOf = (catName, qty) => (unitWeightMap[catName] ?? 0.12) * qty

const weightBreakdown = computed(() =>
    categories.value.map(c => ({
        name: c.categoryName,
        weight: c.itemList.reduce((s, i) => s + weightOf(c.categoryName, Number(i.quantity) || 1), 0)
    }))
)

const totalWeight = computed(() => weightBreakdown.value.reduce((s, w) => s + w.weight, 0))

// ---------------- 持久化 ----------------

const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ form: { ...form }, categories: categories.value }))
}

watch([form, categories], persist, { deep: true })

onMounted(() => {
    // 1. 恢复本地保存的清单
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const saved = JSON.parse(raw)
            if (saved.categories?.length) {
                Object.assign(form, saved.form)
                categories.value = saved.categories
                openCats.value = saved.categories.map((_, i) => i)
                return
            }
        }
    } catch (e) { /* ignore */ }

    // 2. 无本地清单：从行程规划页自动同步目的地与天数
    if (tripState.form.destination) {
        form.destination = tripState.form.destination
        form.travelDays = tripState.form.travelDays
    }
})
</script>

<style scoped>
.packing-page {
    height: 100%;
    overflow-y: auto;
    padding: 22px 26px;
}

.page-header {
    margin-bottom: 18px;
}

.page-title {
    font-size: 21px;
    font-weight: 700;
}

.page-desc {
    font-size: 13px;
    color: var(--text-3);
    margin-top: 6px;
}

.packing-body {
    display: flex;
    gap: 18px;
    align-items: flex-start;
}

.left-col {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.right-col {
    width: 290px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: sticky;
    top: 0;
}

/* 表单 */
.form-card {
    padding: 18px;
}

.form-grid {
    display: flex;
    gap: 13px;
    align-items: flex-end;
}

.w110 { width: 110px; }
.w130 { width: 135px; }

.gen-wrap {
    margin-left: auto;
}

/* 工具行 */
.tool-row {
    display: flex;
    gap: 9px;
}

/* 分类折叠 */
.cat-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.cat-card {
    overflow: hidden;
}

.cat-head {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 15px 18px;
    cursor: pointer;
}

.cat-arrow {
    color: var(--text-3);
    transition: transform 0.2s ease;
    display: flex;
}

.cat-arrow.open {
    transform: rotate(90deg);
    color: var(--brand);
}

.cat-title {
    font-size: 15px;
    font-weight: 700;
}

.cat-count {
    margin-left: auto;
    font-size: 12.5px;
    color: var(--brand);
    background: var(--brand-light);
    padding: 3px 10px;
    border-radius: 12px;
}

.cat-items {
    border-top: 1px solid var(--divider);
}

.pack-row {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 11px 18px;
    border-bottom: 1px solid var(--divider);
}

.pack-row:last-child {
    border-bottom: none;
}

.pack-row.checked {
    background: #f8fbff;
}

.item-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-1);
    min-width: 110px;
}

.pack-row.checked .item-name {
    color: var(--text-3);
}

.item-remark {
    flex: 1;
    font-size: 12.5px;
    color: var(--text-3);
}

/* 步进器 */
.stepper {
    display: flex;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: 7px;
    overflow: hidden;
}

.st-btn {
    width: 27px;
    height: 28px;
    border: none;
    background: #f7f9fb;
    color: var(--text-2);
    cursor: pointer;
    font-size: 14px;
}

.st-btn:hover {
    color: var(--brand);
}

.st-num {
    min-width: 34px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
}

.del-x {
    border: none;
    background: none;
    color: var(--text-3);
    cursor: pointer;
    font-size: 12px;
    padding: 4px;
}

.del-x:hover {
    color: var(--danger);
}

/* 空态 */
.pack-empty {
    text-align: center;
    padding: 60px 0;
}

.pe-emoji {
    font-size: 48px;
}

.pack-empty p {
    margin-top: 13px;
    font-size: 14px;
    color: var(--text-2);
}

.pack-empty .sub {
    font-size: 12.5px;
    color: var(--text-3);
    margin-top: 5px;
}

/* 右侧汇总 */
.sum-card {
    padding: 17px 18px;
}

.sum-title {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 15px;
}

.ring {
    width: 118px;
    height: 118px;
    border-radius: 50%;
    margin: 4px auto 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ring-mid {
    width: 92px;
    height: 92px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
}

.ring-pct {
    font-size: 21px;
    font-weight: 700;
    color: var(--brand);
}

.ring-sub {
    font-size: 11.5px;
    color: var(--text-3);
}

/* 重量 */
.weight-total {
    font-size: 13.5px;
    color: var(--text-2);
}

.w-num {
    font-size: 24px;
    font-weight: 700;
    color: var(--brand);
}

.weight-bar {
    position: relative;
    height: 9px;
    background: #edf1f5;
    border-radius: 6px;
    margin: 13px 0 8px;
}

.w-fill {
    height: 100%;
    background: linear-gradient(90deg, #2374DD, #5a97d6);
    border-radius: 6px;
}

.w-fill.over {
    background: linear-gradient(90deg, #e5484d, #f27b7e);
}

.w-threshold {
    position: absolute;
    top: -4px;
    font-size: 10.5px;
    color: var(--text-3);
    transform: translateX(-50%);
}

.w-tip {
    font-size: 12px;
    color: var(--text-3);
}

.w-breakdown {
    margin-top: 13px;
    border-top: 1px solid var(--divider);
    padding-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.wb-row {
    display: flex;
    justify-content: space-between;
    font-size: 12.5px;
}

.wb-name {
    color: var(--text-2);
}

.wb-val {
    color: var(--text-1);
    font-weight: 600;
}

/* 提示卡 */
.tip-list {
    margin: 0;
    padding-left: 17px;
    color: var(--text-2);
    font-size: 12.5px;
    line-height: 2;
}

/* 弹窗 */
.add-modal,
.check-modal {
    width: 460px;
}

.add-two {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.check-summary {
    font-size: 14px;
    color: var(--text-1);
    margin-bottom: 15px;
    line-height: 1.7;
}

.miss-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.miss-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: var(--warning-bg);
    border-radius: 9px;
    padding: 11px 14px;
}

.miss-name {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--warning);
}

.miss-reason {
    font-size: 12.5px;
    color: var(--text-2);
}

.no-miss {
    text-align: center;
    color: var(--success);
    font-size: 14px;
    padding: 20px 0;
}
</style>
