<template>
  <div class="packing-page">
    <!-- 固定背景层 -->
    <div class="bg-fixed" aria-hidden="true"></div>
    
    <!-- 打印区域（导出PDF用） -->
    <div class="print-area" v-if="items.length" id="print-area">
      <div class="pa-head">
        <div class="pa-brand">智能旅游规划与预算管理系统 · AI 行李清单</div>
        <h1>{{ form.destination }} · {{ form.travelDays }} 天行程打包单</h1>
        <div class="pa-meta">
          <span>{{ form.season }}</span><span>{{ form.tripType }}</span>
          <span v-if="weather">{{ weather.desc }} {{ weather.temp }}</span>
          <span>生成于 {{ generatedAt }}</span>
          <span>打包进度 {{ packedCount }}/{{ items.length }}</span>
        </div>
      </div>
      <div class="pa-grid">
        <section class="pa-cat" v-for="g in groups" :key="g.name">
          <h2 :style="{ borderLeftColor: g.color }">
            {{ g.name }}<em>{{ g.items.length }} 件 · 已备 {{ g.packed }}</em>
          </h2>
          <div class="pa-items">
            <div class="pa-item" v-for="it in g.items" :key="it.id">
              <span class="pa-box" :class="{ fill: it.packed }"></span>
              <span class="pa-name">{{ it.name }}<i v-if="it.optional">选带</i></span>
              <span class="pa-qty">×{{ it.qty }}</span>
            </div>
          </div>
        </section>
      </div>
      <div class="pa-foot">必带 {{ mustCount }} 件 · 选带 {{ items.length - mustCount }} 件，可按实际需要删减 —— 祝旅途愉快</div>
    </div>

    <div class="page-main">
      <header class="page-header">
        <div>
          <h1 class="page-title">行李清单</h1>
          <p class="page-desc">AI 结合目的地天气、天数、季节与出行类型，智能生成打包清单</p>
        </div>
      </header>

      <!-- ============ 模块1：顶部查询卡片 ============ -->
      <div class="query-card pc-card">
        <div class="q-row">
          <div class="q-field q-dest">
            <label class="q-label">
              <svg class="q-ico" viewBox="0 0 24 24" fill="none"><path d="M12 21 C12 21 5 14.5 5 9.5 A7 7 0 0 1 19 9.5 C19 14.5 12 21 12 21 Z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="9.5" r="2.6" stroke="currentColor" stroke-width="1.8"/></svg>
              目的地
            </label>
            <input class="pc-input" v-model="form.destination" list="pack-city-list" placeholder="如：三亚、成都、哈尔滨" @keyup.enter="generate">
            <datalist id="pack-city-list">
              <option v-for="c in HOT_CITIES" :key="c" :value="c"></option>
            </datalist>
          </div>
          <div class="q-field q-days">
            <label class="q-label">
              <svg class="q-ico" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M4 10 H20 M8 3 V7 M16 3 V7" stroke="currentColor" stroke-width="1.8"/></svg>
              出行天数
            </label>
            <input class="pc-input" type="number" min="1" max="30" v-model.number="form.travelDays">
          </div>
          <div class="q-field q-season">
            <label class="q-label">
              <svg class="q-ico" viewBox="0 0 24 24" fill="none"><path d="M12 3 V21 M3 12 H21 M5.6 5.6 L18.4 18.4 M18.4 5.6 L5.6 18.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              季节
            </label>
            <div class="q-select">
              <select class="pc-select" v-model="form.season">
                <option v-for="s in SEASONS" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
          <div class="q-field q-type">
            <label class="q-label">
              <svg class="q-ico" viewBox="0 0 24 24" fill="none"><rect x="6" y="9" width="12" height="11" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M9.5 9 V6.5 a2.5 2.5 0 0 1 2.5-2.5 h0 a2.5 2.5 0 0 1 2.5 2.5 V9" stroke="currentColor" stroke-width="1.8"/></svg>
              出行类型
            </label>
            <div class="q-select">
              <select class="pc-select" v-model="form.tripType">
                <option v-for="t in TRIP_TYPES" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>
          <div class="q-action">
            <button class="btn-ai" :class="{ rippling }" :disabled="loading" @click="onGenerate">
              <svg v-if="!loading" class="ai-ico" viewBox="0 0 24 24" fill="none"><path d="M5 19 L16.5 7.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M15 4.5 l1 2.2 2.2 1 -2.2 1 -1 2.2 -1-2.2 -2.2-1 2.2-1 Z" fill="currentColor"/><path d="M19.5 12.5 l0.6 1.3 1.3 0.6 -1.3 0.6 -0.6 1.3 -0.6-1.3 -1.3-0.6 1.3-0.6 Z" fill="currentColor"/></svg>
              <span v-else class="ai-spinner"></span>
              {{ loading ? 'AI 生成中…' : (items.length ? '重新生成' : 'AI 生成清单') }}
            </button>
          </div>
        </div>

        <!-- 天气提示标签（生成后显示） -->
        <div class="weather-strip" v-if="weather">
          <div class="w-now">
            <span class="w-ico" v-html="weather.icon"></span>
            <div class="w-txt">
              <b>{{ weather.desc }}</b>
              <span>{{ form.destination }} · {{ weather.temp }}</span>
            </div>
          </div>
          <span class="w-tag" v-for="t in weather.tips" :key="t">
            <svg class="wt-ico" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 8 V12.5 L15 14.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            {{ t }}
          </span>
        </div>
      </div>

      <!-- ============ 模块2：打包进度卡片 ============ -->
      <div class="progress-card" v-if="items.length">
        <div class="pg-head">
          <div class="pg-title">
            <svg class="pg-ico" viewBox="0 0 24 24" fill="none"><path d="M4 12.5 L9.5 18 L20 6.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            打包进度
          </div>
          <div class="pg-nums"><b>{{ packedCount }}</b> / {{ items.length }} 件已打包<span class="pg-pct">{{ pct }}%</span></div>
        </div>
        <div class="pg-bar"><div class="pg-fill" :style="{ width: pct + '%' }"></div></div>
      </div>

      <!-- ============ 模块3：清单折叠面板 ============ -->
      <div class="list-wrap">
        <div class="cl-card pc-card" v-for="g in groups" :key="g.name">
          <div class="cl-head" @click="g.open = !g.open">
            <span class="cl-ico" :style="{ background: g.bg, color: g.color }" v-html="g.icon"></span>
            <span class="cl-name">{{ g.name }}</span>
            <span class="cl-count">{{ g.packed }}/{{ g.items.length }}</span>
            <svg class="cl-arrow" :class="{ up: g.open }" viewBox="0 0 24 24" fill="none"><path d="M6 9.5 L12 15.5 L18 9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="cl-body" v-show="g.open">
            <div class="cl-row" v-for="it in g.items" :key="it.id">
              <label class="chk" :class="{ on: it.packed }">
                <input type="checkbox" v-model="it.packed">
                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5 L10 17.5 L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </label>
              <span class="it-name" :class="{ done: it.packed }">{{ it.name }}</span>
              <span class="it-opt" v-if="it.optional">选带</span>
              <span class="it-qty">× {{ it.qty }}</span>
              <button class="it-del" title="删除" @click="removeItem(it)">
                <svg viewBox="0 0 24 24" fill="none"><path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
            </div>
            <div class="cl-empty" v-if="!g.items.length">该分类暂无物品</div>
          </div>
        </div>
      </div>

      <!-- ============ 模块5：空状态 ============ -->
      <div class="empty-state" v-if="!items.length && !loading && !form.destination">
        <svg class="es-suitcase" viewBox="0 0 200 160" fill="none">
          <rect class="es-body" x="55" y="52" width="90" height="72" rx="12" stroke="#2374DD" stroke-width="3"/>
          <path class="es-handle" d="M83 52 V42 a8 8 0 0 1 8-8 h18 a8 8 0 0 1 8 8 V52" stroke="#0EA5A4" stroke-width="3"/>
          <path class="es-line" d="M75 64 V112 M125 64 V112" stroke="#2374DD" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>
          <circle class="es-dot" cx="100" cy="88" r="7" stroke="#E8912F" stroke-width="2.5"/>
          <path class="es-plane" d="M132 40 L162 28 L151 46 L144 39 L138 45" stroke="#0EA5A4" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
          <ellipse class="es-shadow" cx="100" cy="136" rx="52" ry="6" fill="#dbeef0"/>
        </svg>
        <div class="es-clouds">
          <svg class="es-cloud e1" viewBox="0 0 120 60"><path d="M25 45 Q10 45 10 33 Q10 22 22 21 Q24 8 38 8 Q50 8 53 18 Q66 14 71 25 Q84 24 84 35 Q84 45 70 45 Z" fill="#dff1f4"/></svg>
          <svg class="es-cloud e2" viewBox="0 0 120 60"><path d="M25 45 Q10 45 10 33 Q10 22 22 21 Q24 8 38 8 Q50 8 53 18 Q66 14 71 25 Q84 24 84 35 Q84 45 70 45 Z" fill="#e8f6f8"/></svg>
        </div>
        <p class="es-title">行李箱还空着哦～</p>
        <p class="es-desc">填写行程信息后点击「AI 生成清单」，将生成证件、衣物、药品、电子设备等 50+ 物品</p>
      </div>

      <div class="gen-failed" v-if="genFailed">生成失败：请先填写目的地，或稍后重试</div>
    </div>

    <!-- ============ 模块4：底部悬浮操作栏 ============ -->
    <div class="float-bar" v-if="items.length">
      <button class="fb-btn" @click="openAdd">
        <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 8 V16 M8 12 H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        新增物品
      </button>
      <button class="fb-btn" @click="exportPdf">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 4 V15 M12 15 L8 11 M12 15 L16 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 18.5 H19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        导出PDF
      </button>
      <button class="fb-btn fb-danger" @click="resetAll">
        <svg viewBox="0 0 24 24" fill="none"><path d="M5.5 9 A7.5 7.5 0 1 1 4.8 13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M5 4.5 V9 H9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        重置清单
      </button>
    </div>

    <!-- 新增物品弹窗 -->
    <teleport to="body">
      <div class="pc-mask" v-if="add.show" @click.self="add.show = false">
        <div class="add-modal pc-card">
          <div class="pc-modal-header">
            <span class="pc-modal-title">新增物品</span>
            <span class="pc-modal-close" @click="add.show = false">✕</span>
          </div>
          <div class="add-form">
            <label class="pc-label">物品名称</label>
            <input class="pc-input" v-model.trim="add.name" maxlength="20" placeholder="如：便携水壶">
            <label class="pc-label">数量</label>
            <input class="pc-input" type="number" min="1" max="99" v-model.number="add.qty">
            <label class="pc-label">所属分类</label>
            <div class="q-select">
              <select class="pc-select" v-model="add.cat">
                <option v-for="g in CAT_DEFS" :key="g.name" :value="g.name">{{ g.name }}</option>
              </select>
            </div>
          </div>
          <div class="add-foot">
            <button class="pc-btn pc-btn-sm" @click="add.show = false">取消</button>
            <button class="pc-btn pc-btn-sm pc-btn-primary" @click="confirmAdd">保存</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { reactive, computed, watch, ref, onMounted } from 'vue'
import { useTripStore } from '../store/tripStore'

/* ================= 常量 ================= */
const SEASONS = ['春季', '夏季', '秋季', '冬季']
const TRIP_TYPES = ['旅游', '出差', '徒步']
const HOT_CITIES = ['三亚', '成都', '北京', '西安', '杭州', '厦门', '哈尔滨', '丽江', '重庆', '昆明', '青岛', '桂林']

const CAT_DEFS = [
  { name: '证件', color: '#2374DD', bg: '#e8f1fd', icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" stroke-width="1.8"/><circle cx="9.5" cy="11" r="2" stroke="currentColor" stroke-width="1.6"/><path d="M6.5 16.5 c0.7-1.8 5.3-1.8 6 0 M14 10 h4 M14 13.5 h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' },
  { name: '衣物', color: '#0EA5A4', bg: '#e2f6f5', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M8.5 4.5 L12 6.5 L15.5 4.5 L20 8 L17.5 11 L16.5 10 L16.5 19.5 H7.5 V10 L6.5 11 L4 8 Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>' },
  { name: '药品', color: '#e94560', bg: '#fdeaee', icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="9" width="17" height="7" rx="3.5" transform="rotate(-45 12 12.5)" stroke="currentColor" stroke-width="1.8"/><path d="M9.2 9.2 L14.8 14.8" stroke="currentColor" stroke-width="1.8"/></svg>' },
  { name: '电子设备', color: '#E8912F', bg: '#fdf3e4', icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="6.5" y="3.5" width="11" height="17" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 17.5 h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' }
]

/* ================= 状态 ================= */
const form = reactive({ destination: '', travelDays: 5, season: '夏季', tripType: '旅游' })
const items = ref([])          // { id, name, qty, packed, cat }
const weather = ref(null)      // { icon, desc, temp, tips: [] }
const loading = ref(false)
const generatedAt = ref('')
const genFailed = ref(false)
const rippling = ref(false)
const add = reactive({ show: false, name: '', qty: 1, cat: '证件' })

/* ================= 持久化 ================= */
const KEY = 'pc-packing-v1'
watch([items, form], () => {
    localStorage.setItem(KEY, JSON.stringify({ form: { ...form }, items: items.value, weather: weather.value, at: generatedAt.value }))
}, { deep: true })
try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (saved?.items?.length) {
        items.value = saved.items
        weather.value = saved.weather
        generatedAt.value = saved.at
        Object.assign(form, saved.form || {})
    }
} catch { /* 忽略坏缓存 */ }

/* ================= 与行程自动联动 ================= */
const trip = useTripStore()

// 进入页面时若暂无清单，自动取行程规划页的目的地/天数（或“我的行程”最近一条）生成
onMounted(() => {
    if (items.value.length) return
    const ctx = trip.state.form
    const latest = trip.state.myTrips?.[0]
    const rawDest = ctx.destination || latest?.destination || ''
    const days = ctx.travelDays || latest?.days
    if (!rawDest) return
    form.destination = rawDest.split(/[·,，、/|-]/)[0].trim() || rawDest
    if (days) form.travelDays = Number(days)
    onGenerate()
})

/* ================= 计算属性 ================= */
const packedCount = computed(() => items.value.filter(i => i.packed).length)
const mustCount = computed(() => items.value.filter(i => !i.optional).length)
const pct = computed(() => items.value.length ? Math.round(packedCount.value / items.value.length * 100) : 0)
const groups = computed(() => CAT_DEFS.map(def => {
    const g = {
        name: def.name, icon: def.icon, bg: def.bg, color: def.color,
        open: gOpenState[def.name] ?? true,
        items: items.value.filter(i => i.cat === def.name)
    }
    g.packed = g.items.filter(i => i.packed).length
    return g
}))
const gOpenState = reactive({})
watch(groups, gs => gs.forEach(g => { if (!(g.name in gOpenState)) gOpenState[g.name] = true }), { immediate: true })

/* ================= 目的地封面图映射 ================= */
const DEST_IMAGES = {
    '三亚': 'https://picsum.photos/800/400?random=sanya',
    '成都': 'https://picsum.photos/800/400?random=chengdu',
    '北京': 'https://picsum.photos/800/400?random=beijing',
    '西安': 'https://picsum.photos/800/400?random=xian',
    '杭州': 'https://picsum.photos/800/400?random=hangzhou',
    '厦门': 'https://picsum.photos/800/400?random=xiamen',
    '哈尔滨': 'https://picsum.photos/800/400?random=haerbin',
    '丽江': 'https://picsum.photos/800/400?random=lijiang',
    '重庆': 'https://picsum.photos/800/400?random=chongqing',
    '昆明': 'https://picsum.photos/800/400?random=kunming',
    '青岛': 'https://picsum.photos/800/400?random=qingdao',
    '桂林': 'https://picsum.photos/800/400?random=guilin'
}

const destCoverImage = computed(() => {
    const dest = form.destination.trim()
    // 先精确匹配
    if (DEST_IMAGES[dest]) return DEST_IMAGES[dest]
    // 再模糊匹配（如"三亚湾"匹配"三亚"）
    for (const [key, url] of Object.entries(DEST_IMAGES)) {
        if (dest.includes(key) || key.includes(dest)) return url
    }
    // 默认海边风景图
    return 'https://picsum.photos/800/400?random=beach'
})

/* ================= AI 生成逻辑（本地智能模拟） ================= */
const CITY_PROFILE = [
    { keys: ['三亚', '厦门', '青岛', '北海', '日照', '涠洲', '海边'], kind: '海滨', desc: '晴到多云，海风较大', icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.5" stroke="#E8912F" stroke-width="1.8"/><path d="M12 3 V5.5 M12 18.5 V21 M3 12 H5.5 M18.5 12 H21 M5.6 5.6 L7.4 7.4 M16.6 16.6 L18.4 18.4 M18.4 5.6 L16.6 7.4 M7.4 16.6 L5.6 18.4" stroke="#E8912F" stroke-width="1.8" stroke-linecap="round"/></svg>' },
    { keys: ['哈尔滨', '雪乡', '长白山', '漠河', '乌鲁木齐'], kind: '严寒', desc: '寒冷，有降雪可能', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3 V21 M5 7 L19 17 M19 7 L5 17 M12 6 l1.8-1.5 M12 6 l-1.8-1.5 M12 18 l1.8 1.5 M12 18 l-1.8 1.5" stroke="#4aa3df" stroke-width="1.7" stroke-linecap="round"/></svg>' },
    { keys: ['丽江', '拉萨', '香格里拉', '西宁', '稻城', '林芝'], kind: '高原', desc: '高原气候，日照强温差大', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 18 L9 8 L13 14 L16 9.5 L21 18 Z" stroke="#0EA5A4" stroke-width="1.8" stroke-linejoin="round"/><circle cx="17.5" cy="5.5" r="2" stroke="#E8912F" stroke-width="1.6"/></svg>' },
    { keys: ['成都', '重庆', '长沙', '贵阳', '广州'], kind: '湿热', desc: '湿润多雨，饮食辛辣', icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 14 a4 4 0 0 1 0.5-8 A5.5 5.5 0 0 1 17 7 a3.8 3.8 0 0 1 1 7.4" stroke="#4aa3df" stroke-width="1.8" stroke-linecap="round"/><path d="M8 17.5 l-1 2 M12.5 17.5 l-1 2 M17 17.5 l-1 2" stroke="#4aa3df" stroke-width="1.8" stroke-linecap="round"/></svg>' }
]
const SEASON_TEMP = { 春季: '12-22℃', 夏季: '26-34℃', 秋季: '14-24℃', 冬季: '-2-8℃' }
const SEASON_FIX = {
    夏季: { desc: '炎热晴朗，紫外线强', tips: ['已自动增加防晒三件套、防暑药品', '已减少厚重衣物'] },
    冬季: { desc: '寒冷干燥，注意保暖', tips: ['已自动增加保暖装备、润唇膏', '已减少清凉夏装'] },
    春季: { desc: '温和舒适，早晚温差大', tips: ['已自动增加薄外套、防过敏药'] },
    秋季: { desc: '凉爽干燥，适合出行', tips: ['已自动增加风衣外套、保湿用品'] }
}
const KIND_TIPS = {
    海滨: '海滨目的地：已增加泳装、防水装备、晒后修复',
    严寒: '严寒目的地：已加倍增加保暖衣物与暖宝宝',
    高原: '高原目的地：已增加抗高反药品、氧气瓶',
    湿热: '湿热目的地：已增加肠胃药、祛湿防雨用品'
}

const gen = (name, qty, cat, optional = false) => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, qty, cat, packed: false, optional })

function buildItems(dest, days, season, tripType) {
    const d = Math.max(1, Math.min(30, Number(days) || 5))
    const list = []
    const P = (name, qty, cat, optional = false) => list.push(gen(name, qty, cat, optional))

    // —— 证件：身份证/现金/银行卡必带，其余按场景选带 ——
    P('身份证', 1, '证件'); P('护照/通行证', 1, '证件', true); P('机票/车票行程单', 1, '证件', true)
    P('酒店预订单', 1, '证件', true); P('学生证/优惠证件', 1, '证件', true); P('驾驶证', 1, '证件', true)
    P('现金', 1, '证件'); P('银行卡', 2, '证件')
    // —— 衣物基础 10，数量随天数 ——
    P('短袖T恤', Math.min(d + 1, 7), '衣物'); P('内裤', d + 1, '衣物'); P('袜子', d + 1, '衣物')
    P('长裤', 2, '衣物'); P('舒适运动鞋', 1, '衣物'); P('睡衣套装', 1, '衣物')
    P('外套', 1, '衣物'); P('遮阳帽/针织帽', 1, '衣物', true); P('拖鞋', 1, '衣物', true); P('收纳袋', Math.ceil(d / 2), '衣物', true)
    // —— 药品：常备 4 必带，其余选带 ——
    P('创可贴', 5, '药品'); P('感冒药', 1, '药品'); P('肠胃药', 1, '药品'); P('晕车贴', 2, '药品')
    P('退烧贴', 2, '药品', true); P('碘伏棉签', 3, '药品', true); P('止泻药', 1, '药品', true); P('体温计', 1, '药品', true)
    // —— 电子设备：充电四件套必带，其余选带 ——
    P('手机充电器', 1, '电子设备'); P('充电宝', 1, '电子设备'); P('数据线', 2, '电子设备'); P('耳机', 1, '电子设备')
    P('多功能插线板', 1, '电子设备', true); P('手机支架', 1, '电子设备', true)
    P('备用电池', 1, '电子设备', true); P('U型枕', 1, '电子设备', true)
    P('折叠电热水壶', 1, '电子设备', true)

    // —— 季节附加 ——
    if (season === '夏季') {
        P('防晒霜 SPF50', 1, '衣物'); P('太阳镜', 1, '衣物', true); P('防晒衣', 1, '衣物', true)
        P('便携小风扇', 1, '电子设备', true); P('藿香正气水', 2, '药品'); P('凉鞋', 1, '衣物', true)
    } else if (season === '冬季') {
        P('羽绒服', 1, '衣物'); P('保暖内衣', 2, '衣物'); P('围巾', 1, '衣物', true)
        P('手套', 1, '衣物', true); P('暖宝宝', d + 2, '衣物'); P('润唇膏', 1, '药品', true)
    } else {
        P('薄外套/风衣', 1, '衣物'); P('长袖衬衫', Math.min(d, 4), '衣物'); P('抗过敏药', 1, '药品', true)
    }
    // —— 类型附加 ——
    if (tripType === '出差') {
        P('西装套装', 1, '衣物'); P('皮鞋', 1, '衣物'); P('笔记本电脑', 1, '电子设备')
        P('正装衬衫', 2, '衣物'); P('名片', 1, '证件', true); P('文件资料袋', 1, '证件', true)
    } else if (tripType === '徒步') {
        P('登山鞋', 1, '衣物'); P('冲锋衣', 1, '衣物'); P('大容量水壶', 1, '电子设备')
        P('速干衣', 2, '衣物'); P('头灯', 1, '电子设备', true); P('登山杖', 1, '电子设备', true)
        P('防蚊液', 1, '药品')
    } else {
        P('相机', 1, '电子设备', true); P('自拍杆', 1, '电子设备', true); P('旅行枕', 1, '衣物', true); P('小零食', 2, '药品', true)
    }
    // —— 目的地附加 ——
    const prof = CITY_PROFILE.find(p => p.keys.some(k => dest.includes(k)))
    if (prof?.kind === '海滨') { P('泳衣', 1, '衣物'); P('防水手机袋', 1, '电子设备', true); P('晒后修复凝胶', 1, '药品', true); P('沙滩裤', 1, '衣物', true) }
    if (prof?.kind === '严寒') { P('雪地靴', 1, '衣物'); P('耳罩', 1, '衣物', true); P('加强暖宝宝', d + 4, '衣物') }
    if (prof?.kind === '高原') { P('红景天/高原安', 1, '药品'); P('高倍防晒', 1, '药品'); P('便携氧气瓶', 1, '药品', true) }
    if (prof?.kind === '湿热') { P('一次性雨衣', 2, '衣物'); P('祛湿茶', 1, '药品', true); P('防蚊贴', 1, '药品', true) }
    return list
}

function onGenerate() {
    if (!form.destination.trim()) { genFailed.value = true; return }
    genFailed.value = false
    loading.value = true
    rippling.value = true
    setTimeout(() => {
        const dest = form.destination.trim()
        const prof = CITY_PROFILE.find(p => p.keys.some(k => dest.includes(k)))
        const fix = SEASON_FIX[form.season]
        weather.value = {
            icon: prof?.icon || '<svg viewBox="0 0 24 24" fill="none"><path d="M6 14 a4 4 0 0 1 0.5-8 A5.5 5.5 0 0 1 17 7 a3.8 3.8 0 0 1 1 7.4 Z" stroke="#E8912F" stroke-width="1.8" stroke-linejoin="round"/><circle cx="17" cy="5.5" r="1.8" stroke="#E8912F" stroke-width="1.5"/></svg>',
            desc: prof?.desc || fix.desc,
            temp: SEASON_TEMP[form.season],
            tips: [
                KIND_TIPS[prof?.kind] || `${dest}：已按 ${form.season}气候自动调配物品`,
                ...fix.tips,
                `已按 ${form.travelDays} 天行程配齐换洗衣物`
            ].slice(0, 3)
        }
        items.value = buildItems(dest, form.travelDays, form.season, form.tripType)
        generatedAt.value = new Date().toLocaleString('zh-CN', { hour12: false })
        const m = items.value.filter(i => !i.optional).length
        weather.value.tips.push(`共 ${m} 件必带 + ${items.value.length - m} 件选带，可按需删减`)
        loading.value = false
        setTimeout(() => { rippling.value = false }, 600)
    }, 900)
}

/* ================= 操作 ================= */
function removeItem(it) {
    items.value = items.value.filter(i => i.id !== it.id)
}
function openAdd() {
    add.name = ''; add.qty = 1; add.cat = '证件'; add.show = true
}
function confirmAdd() {
    if (!add.name) return
    items.value.push(gen(add.name, Math.max(1, Math.min(99, Number(add.qty) || 1)), add.cat))
    add.show = false
}
function exportPdf() { window.print() }
function resetAll() {
    if (!confirm('确定清空全部清单数据吗？')) return
    items.value = []; weather.value = null; generatedAt.value = ''
    localStorage.removeItem(KEY)
}
</script>

<style scoped>
/* 页面容器：带固定背景 */
.packing-page {
    position: relative;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 22px 26px 96px;
    /* 超高清海边风景大图 - 固定在视口 */
    background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=3840&q=100');
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    background-attachment: fixed;
}

/* 隐藏多余的背景div */
.bg-fixed {
    display: none;
}


.page-main { position: relative; z-index: 1; max-width: 1080px; margin: 0 auto; }

/* 页面标题区 */
.page-header {
    margin-bottom: 20px;
    padding: 20px 24px;
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    animation: fadeSlideIn 0.6s ease both;
}
.page-title {
    font-size: 22px; font-weight: 800;
    background: linear-gradient(135deg, #1a5bb5, #2374DD, #0ea5a4);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
}
.page-desc { font-size: 13px; color: var(--text-2); margin-top: 6px; }

@keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
}

/* ---------- 模块1：查询卡片（玻璃拟态） ---------- */
.query-card {
    padding: 20px 22px;
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    animation: fadeSlideIn 0.6s ease 0.1s both;
}
.query-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(35, 116, 221, 0.1);
}
.q-row { display: flex; gap: 14px; align-items: flex-end; flex-wrap: wrap; }
.q-field { display: flex; flex-direction: column; gap: 6px; }
.q-dest { flex: 1.5; min-width: 180px; }
.q-days { width: 108px; }
.q-season, .q-type { width: 128px; }
.q-label { display: flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 600; color: var(--text-2); }
.q-ico { width: 14px; height: 14px; color: #0ea5a4; }
.q-select { position: relative; }
.q-select select { width: 100%; appearance: none; cursor: pointer; }
.q-select::after {
    content: ''; position: absolute; right: 12px; top: 50%;
    width: 8px; height: 8px; border-right: 1.8px solid #8fa3b8; border-bottom: 1.8px solid #8fa3b8;
    transform: translateY(-70%) rotate(45deg); pointer-events: none;
}
.q-action { margin-left: auto; }

/* AI 主按钮：魔法棒 + hover 变色 + 点击波纹 */
.btn-ai {
    position: relative; overflow: hidden;
    display: inline-flex; align-items: center; gap: 8px;
    height: 40px; padding: 0 22px;
    background: linear-gradient(135deg, #2374DD, #3b8ae0);
    color: #fff; font-size: 14px; font-weight: 600;
    border: none; border-radius: 10px; cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
    box-shadow: 0 4px 14px rgba(35, 116, 221, 0.28);
}
.btn-ai:hover { background: linear-gradient(135deg, #1d63c4, #2f7dd6); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(35, 116, 221, 0.36); }
.btn-ai:active { transform: translateY(0); }
.btn-ai:disabled { opacity: 0.65; cursor: wait; }
.ai-ico { width: 17px; height: 17px; }
.btn-ai.rippling::after {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at center, rgba(255,255,255,0.45) 0%, transparent 65%);
    animation: ripple 0.6s ease-out;
}
@keyframes ripple { from { transform: scale(0.4); opacity: 1; } to { transform: scale(1.6); opacity: 0; } }
.ai-spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
    animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 天气提示条 */
.weather-strip {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    margin-top: 16px; padding-top: 14px; border-top: 1px dashed #d8e9ee;
}
.w-now { display: flex; align-items: center; gap: 9px; padding-right: 14px; border-right: 1px solid #e3eef2; }
.w-ico :deep(svg) { width: 30px; height: 30px; }
.w-txt { display: flex; flex-direction: column; }
.w-txt b { font-size: 13.5px; color: var(--text-1); }
.w-txt span { font-size: 12px; color: var(--text-3); margin-top: 2px; }
.w-tag {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; color: #0c7c7a; background: #e4f6f5;
    border: 1px solid #c5e9e7; padding: 4px 11px; border-radius: 20px;
}
.wt-ico { width: 12px; height: 12px; }

/* ---------- 模块2：进度卡片（玻璃拟态） ---------- */
.progress-card {
    margin-top: 18px; padding: 18px 22px;
    border-radius: 16px;
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.5);
    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    animation: fadeSlideIn 0.6s ease 0.2s both;
}
.progress-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(14, 165, 164, 0.12);
}
.pg-head { display: flex; align-items: center; margin-bottom: 12px; }
.pg-title { display: flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 700; color: #0c7c7a; }
.pg-ico { width: 17px; height: 17px; color: #0ea5a4; }
.pg-nums { margin-left: auto; font-size: 13px; color: var(--text-2); }
.pg-nums b { font-size: 17px; color: #0ea5a4; }
.pg-pct { margin-left: 12px; font-size: 15px; font-weight: 700; color: #2374DD; }
.pg-bar { height: 10px; border-radius: 6px; background: #ffffffaa; overflow: hidden; }
.pg-fill {
    height: 100%; border-radius: 6px;
    background: linear-gradient(90deg, #0ea5a4, #2374DD);
    transition: width 0.45s cubic-bezier(0.22, 0.9, 0.36, 1);
}

/* ---------- 模块3：折叠面板（固定高度可滚动） ---------- */
.list-wrap {
    margin-top: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    align-items: start;
    max-height: 520px;
    overflow-y: auto;
    padding-right: 4px;
    /* 自定义滚动条 */
    scrollbar-width: thin;
    scrollbar-color: rgba(35, 116, 221, 0.2) transparent;
}
.list-wrap::-webkit-scrollbar { width: 5px; }
.list-wrap::-webkit-scrollbar-track { background: transparent; }
.list-wrap::-webkit-scrollbar-thumb { background: rgba(35, 116, 221, 0.2); border-radius: 10px; }
.list-wrap::-webkit-scrollbar-thumb:hover { background: rgba(35, 116, 221, 0.35); }

.cl-card {
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
    height: 250px;
    display: flex;
    flex-direction: column;
    animation: fadeSlideIn 0.6s ease 0.3s both;
}
.cl-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(35, 116, 221, 0.12);
    border-color: rgba(255,255,255,0.7);
}
.cl-head {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 16px; cursor: pointer; user-select: none;
    transition: background 0.2s;
}
.cl-head:hover { background: rgba(35, 116, 221, 0.04); }
.cl-ico {
    width: 32px; height: 32px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}
.cl-ico :deep(svg) { width: 17px; height: 17px; }
.cl-name { font-size: 14px; font-weight: 700; color: var(--text-1); }
.cl-count {
    margin-left: auto; font-size: 12px; font-weight: 600;
    background: linear-gradient(135deg, #eef6f8, #e8f0fe);
    color: var(--brand);
    padding: 3px 12px; border-radius: 14px;
}
.cl-arrow { width: 15px; height: 15px; color: var(--text-3); transition: transform 0.3s ease; }
.cl-arrow.up { transform: rotate(180deg); }
.cl-body {
    padding: 4px 10px 14px;
    border-top: 1px solid var(--divider);
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(35, 116, 221, 0.15) transparent;
}
.cl-body::-webkit-scrollbar { width: 4px; }
.cl-body::-webkit-scrollbar-track { background: transparent; }
.cl-body::-webkit-scrollbar-thumb { background: rgba(35, 116, 221, 0.15); border-radius: 10px; }
.cl-body::-webkit-scrollbar-thumb:hover { background: rgba(35, 116, 221, 0.3); }
.cl-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 10px; border-radius: 10px;
    transition: all 0.2s ease;
    margin-bottom: 2px;
}
.cl-row:hover {
    background: linear-gradient(135deg, rgba(35, 116, 221, 0.03), rgba(35, 116, 221, 0.06));
    transform: translateX(2px);
}
.chk {
    position: relative; width: 20px; height: 20px; flex-shrink: 0;
    border: 2px solid #c3d6e3; border-radius: 6px; cursor: pointer;
    transition: all 0.2s ease; background: #fff;
}
.chk input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.chk svg {
    width: 12px; height: 12px; position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%) scale(0.3); color: #fff;
    opacity: 0; transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chk.on {
    background: linear-gradient(135deg, #2374DD, #4096ff);
    border-color: #2374DD;
    box-shadow: 0 2px 6px rgba(35, 116, 221, 0.3);
}
.chk.on svg { opacity: 1; transform: translate(-50%, -50%) scale(1); }
.it-name { flex: 1; font-size: 13.5px; color: var(--text-1); transition: all 0.2s; }
.it-name.done { color: var(--text-3); text-decoration: line-through; opacity: 0.6; }
.it-opt {
    font-size: 10.5px; color: var(--brand); background: rgba(35, 116, 221, 0.08);
    border: 1px solid rgba(35, 116, 221, 0.15); padding: 2px 8px; border-radius: 10px;
    flex-shrink: 0; font-weight: 500;
}
.it-qty {
    font-size: 12px; color: var(--text-2); background: #f1f6f9;
    padding: 3px 10px; border-radius: 12px; font-weight: 500;
}
.it-del {
    width: 26px; height: 26px; border-radius: 8px; border: none; cursor: pointer;
    background: transparent; color: #b6c6d2; display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: all 0.2s; flex-shrink: 0;
}
.it-del svg { width: 13px; height: 13px; }
.cl-row:hover .it-del { opacity: 1; }
.it-del:hover { background: #fdecec; color: #e94560; transform: scale(1.1); }
.cl-empty { text-align: center; color: var(--text-3); font-size: 12.5px; padding: 16px; }

/* ---------- 模块5：空状态（玻璃拟态） ---------- */
.empty-state {
    position: relative;
    margin-top: 40px;
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 50px 24px 60px;
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 20px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
    animation: fadeSlideIn 0.6s ease 0.2s both;
}
.es-suitcase { width: 210px; height: 170px; animation: bob 5s ease-in-out infinite; }
.es-body { animation: none; }
@keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.es-clouds { position: absolute; top: 20px; width: 100%; pointer-events: none; }
.es-cloud { position: absolute; opacity: 0.9; }
.e1 { width: 90px; left: 12%; animation: drift 24s ease-in-out infinite; }
.e2 { width: 64px; right: 12%; animation: drift 30s ease-in-out infinite reverse; }
.es-title {
    font-size: 18px; font-weight: 700; margin-top: 20px;
    background: linear-gradient(135deg, #1a5bb5, #2374DD);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
}
.es-desc { font-size: 13.5px; color: var(--text-2); margin-top: 10px; max-width: 420px; line-height: 1.8; }
.gen-failed {
    margin-top: 16px; text-align: center; font-size: 13px; color: #e94560;
    padding: 10px 16px; background: rgba(233, 69, 96, 0.08);
    border-radius: 10px; border: 1px solid rgba(233, 69, 96, 0.15);
}

/* ---------- 模块4：底部悬浮操作栏（玻璃拟态） ---------- */
.float-bar {
    position: fixed; left: 60px; right: 0; bottom: 0; z-index: 30;
    display: flex; justify-content: center; gap: 14px;
    padding: 14px 0 18px;
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255,255,255,0.5);
    box-shadow: 0 -4px 24px rgba(0,0,0,0.06);
}
.fb-btn {
    display: inline-flex; align-items: center; gap: 8px;
    height: 42px; padding: 0 22px;
    background: rgba(255,255,255,0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: var(--text-1);
    font-size: 14px; font-weight: 600;
    border: 1px solid rgba(35, 116, 221, 0.12);
    border-radius: 12px; cursor: pointer;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    transition: all 0.25s ease;
}
.fb-btn svg { width: 16px; height: 16px; color: #2374DD; }
.fb-btn:hover {
    transform: translateY(-2px);
    background: rgba(255,255,255,0.95);
    box-shadow: 0 8px 24px rgba(35, 116, 221, 0.15);
    border-color: rgba(35, 116, 221, 0.25);
}
.fb-danger svg { color: #e94560; }
.fb-danger:hover {
    border-color: rgba(233, 69, 96, 0.3);
    box-shadow: 0 8px 24px rgba(233, 69, 96, 0.12);
}

/* 新增物品弹窗（玻璃拟态） */
.add-modal {
    width: 400px; padding: 0;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.add-form { padding: 8px 22px 4px; display: flex; flex-direction: column; gap: 8px; }
.add-foot {
    display: flex; justify-content: flex-end; gap: 10px;
    padding: 16px 22px 20px;
}

/* ---------- 导出PDF打印排版：仅打印清单 ---------- */
.print-area { display: none; }
@media print {
    .print-area { display: block !important; }
    body * { visibility: hidden !important; }
    .print-area, .print-area * { visibility: visible !important; }
    .print-area {
        position: absolute; left: 0; top: 0; width: 100%;
        padding: 8px 14px; color: #24384a;
        font-family: 'Microsoft YaHei', sans-serif;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .pa-head { border-bottom: 2.5px solid #2374DD; padding-bottom: 10px; margin-bottom: 14px; }
    .pa-brand { font-size: 11px; letter-spacing: 1px; color: #0ea5a4; font-weight: 600; margin-bottom: 4px; }
    .pa-head h1 { font-size: 20px; margin: 0 0 8px; }
    .pa-meta { display: flex; flex-wrap: wrap; gap: 6px; }
    .pa-meta span {
        font-size: 10.5px; color: #41618a; background: #eef4fb;
        border: 1px solid #d8e6f5; padding: 2px 10px; border-radius: 10px;
    }
    .pa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 26px; }
    .pa-cat { break-inside: avoid; margin-bottom: 10px; }
    .pa-cat h2 {
        font-size: 13.5px; margin: 0 0 6px; padding: 4px 0 4px 9px;
        border-left: 4px solid; background: #f5f9fc;
        display: flex; align-items: baseline; justify-content: space-between;
    }
    .pa-cat h2 em { font-style: normal; font-size: 10px; color: #7d95ad; font-weight: 400; }
    .pa-item {
        display: flex; align-items: center; gap: 7px;
        padding: 3.5px 2px 3.5px 9px; font-size: 11.5px;
        border-bottom: 1px dotted #dfe9f0;
    }
    .pa-box {
        width: 10px; height: 10px; flex-shrink: 0;
        border: 1.4px solid #9fb6c9; border-radius: 2.5px; position: relative;
    }
    .pa-box.fill { background: #0ea5a4; border-color: #0ea5a4; }
    .pa-box.fill::after {
        content: '✓'; position: absolute; top: -4px; left: 0.5px;
        color: #fff; font-size: 9px; font-weight: 700;
    }
    .pa-name { flex: 1; }
    .pa-name i {
        font-style: normal; font-size: 8.5px; color: #7d95ad;
        border: 1px solid #dde8f1; background: #f2f7fb;
        border-radius: 6px; padding: 0 5px; margin-left: 6px;
    }
    .pa-qty { color: #6c88a3; font-size: 10.5px; }
    .pa-foot {
        margin-top: 14px; padding-top: 9px; border-top: 1px solid #dfe9f0;
        font-size: 10.5px; color: #7d95ad; text-align: center;
    }
}
</style>
