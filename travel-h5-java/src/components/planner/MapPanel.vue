<template>
  <div class="map-wrap" ref="wrapRef">
    <!-- 地图标题条 -->
    <div class="map-topbar">
      <div class="map-title">
        <span class="map-title-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M9 20l-5.5 2.5V4L9 1.5 15 4l5.5-2.5v18.5L15 22.5 9 20z" stroke="#2374DD" stroke-width="1.8" stroke-linejoin="round" />
          </svg>
        </span>
        <span>路线地图</span>
      </div>
      <!-- 地图控件 -->
      <div class="map-controls">
        <button class="ctrl-btn" title="放大" @click="zoomIn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>
        <button class="ctrl-btn" title="缩小" @click="zoomOut">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>
        <button class="ctrl-btn" title="全屏" @click="toggleFullscreen">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>
      </div>
    </div>

    <!-- SVG 地图 -->
    <div class="map-canvas">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" class="map-svg">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M50 0H0V50" fill="none" stroke="#dde7df" stroke-width="1" />
          </pattern>
        </defs>

        <!-- 底图 -->
        <rect width="1000" height="1000" fill="#f0f5f1" />
        <rect width="1000" height="1000" fill="url(#grid)" />

        <!-- 河流 -->
        <path :d="riverPath" fill="none" stroke="#c9e2f0" stroke-width="46" stroke-linecap="round" opacity="0.85" />
        <path :d="riverPath" fill="none" stroke="#b9d8eb" stroke-width="46" stroke-linecap="round" opacity="0.55" />

        <!-- 公园与湖泊 -->
        <g>
          <ellipse cx="830" cy="160" rx="86" ry="60" fill="#d9ecdf" opacity="0.9" />
          <rect x="120" y="560" width="120" height="90" rx="26" fill="#d9ecdf" opacity="0.9" />
          <ellipse cx="858" cy="800" rx="70" ry="48" fill="#d9ecdf" opacity="0.9" />
          <rect x="90" y="820" width="100" height="80" rx="24" fill="#d9ecdf" opacity="0.9" />
        </g>

        <!-- 城市道路（确定性） -->
        <g stroke="#e2e8e3" stroke-width="9">
          <line v-for="(l, i) in roads.h" :key="'h'+i" :x1="l[0]" y1="0" :x2="l[1]" y2="1000" />
          <line v-for="(l, i) in roads.v" :key="'v'+i" x1="0" :y1="l[0]" :x2="1000" :y2="l[1]" />
        </g>

        <!-- 缩放层：路线与标记 -->
        <g :transform="`translate(500 500) scale(${scale}) translate(-500 -500)`">
          <g v-if="layout.length">
            <!-- 每日路线分段（动画虚线） -->
            <g v-for="(seg, i) in segments" :key="'seg'+i">
              <path :d="seg.path" fill="none" :stroke="seg.color" stroke-width="6" stroke-linecap="round"
                stroke-dasharray="2 13" stroke-linejoin="round" opacity="0.9" />
            </g>

            <!-- 点位标记 -->
            <g v-for="(p, i) in layout" :key="'p'+i">
              <circle :cx="p.x" :cy="p.y" r="21" :fill="dayColor(p.dayNo)" />
              <circle :cx="p.x" :cy="p.y" r="21" fill="none" stroke="#fff" stroke-width="3" />
              <text :x="p.x" :y="p.y + 5.5" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">
                {{ i + 1 }}
              </text>
              <text v-if="p.indexInDay === 0" :x="p.x" :y="p.y - 32" text-anchor="middle"
                font-size="17" font-weight="700" fill="#43584f">D{{ p.dayNo }}</text>
              <title>{{ p.name }}（{{ p.pointType }}）</title>
            </g>

            <!-- 已选场所标记 -->
            <g v-for="(m, i) in poiMarkers" :key="'m'+i">
              <path :d="`M${m.x} ${m.y - 4}c-13 0-23 9.5-23 22.5C${m.x - 23} ${m.y + 32} ${m.x} ${m.y + 46} ${m.x} ${m.y + 46}s23-14 23-27.5c0-13-10-22.5-23-22.5z`"
                :fill="m.color" stroke="#fff" stroke-width="2.5" />
              <text :x="m.x" :y="m.y + 19" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">
                {{ m.mark }}
              </text>
            </g>

            <!-- 接驳路线 -->
            <g v-if="connector">
              <path :d="connector.path" fill="none" stroke="#2FA96B" stroke-width="5"
                stroke-dasharray="10 9" stroke-linecap="round" />
              <circle :cx="connector.tx" :cy="connector.ty" r="12" fill="#2FA96B" stroke="#fff" stroke-width="3" />
            </g>

            <!-- 实时定位点 -->
            <g v-if="locating || dotPos">
              <circle :cx="dotPos.x" :cy="dotPos.y" r="30" fill="#2374DD" opacity="0.15">
                <animate attributeName="r" values="22;34;22" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.25;0.05;0.25" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle :cx="dotPos.x" :cy="dotPos.y" r="12" fill="#2374DD" stroke="#fff" stroke-width="3.5" />
            </g>
          </g>
        </g>
      </svg>

      <!-- 空态 -->
      <div class="map-empty" v-if="!layout.length">
        <div class="empty-icon">🗺️</div>
        <p class="empty-text">在右侧选择方案后，<br>路线与点位将在此渲染</p>
      </div>
    </div>

    <!-- 底部定位操作 -->
    <div class="map-bottom">
      <button class="locate-btn" v-if="!locating" @click="startLocating">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" stroke="#2374DD" stroke-width="2" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#2374DD" stroke-width="2" stroke-linecap="round" />
        </svg>
        开启实时定位
      </button>
      <template v-else>
        <button class="locate-btn active">
          <span class="locate-dot"></span> 定位中 · 已沿路线行驶
        </button>
        <button class="deviate-btn" @click="simulateDeviate">模拟偏离路线</button>
        <button class="stop-btn" @click="stopLocating">停止</button>
      </template>
    </div>

    <!-- 偏离提醒弹窗 -->
    <teleport to="body">
      <div class="pc-mask" v-if="showOffAlert" @click.self="showOffAlert = false">
        <div class="pc-modal off-modal">
          <div class="off-head">
            <div class="off-emoji">⚠️</div>
            <div>
              <div class="off-title">检测到您已偏离规划路线</div>
              <div class="off-sub">当前位置距最近的路线点位约 {{ offDistance }}m</div>
            </div>
          </div>
          <div class="off-actions">
            <button class="pc-btn pc-btn-primary pc-btn-lg pc-btn-block" @click="genConnector">
              生成接驳新路线
            </button>
            <button class="pc-btn pc-btn-lg pc-btn-block" @click="showOffAlert = false">
              我知道了
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useTripStore } from '../../store/tripStore'
import { useExpenseStore } from '../../store/expenseStore'
import toast from '../../utils/msg'

const { state, flatPoints, bumpOffRoute } = useTripStore()
const { state: expenseState } = useExpenseStore()

const wrapRef = ref(null)
const scale = ref(1)

// ---------------- 缩放 / 全屏 ----------------

const zoomIn = () => { scale.value = Math.min(1.8, +(scale.value + 0.18).toFixed(2)) }
const zoomOut = () => { scale.value = Math.max(0.8, +(scale.value - 0.18).toFixed(2)) }

const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        wrapRef.value?.requestFullscreen?.()
    } else {
        document.exitFullscreen?.()
    }
}

// ---------------- 底图装饰（确定性） ----------------

const riverPath = 'M-20 260 C 220 330, 320 520, 560 480 S 860 640, 1040 580'
const roads = {
    h: [[-60, 180], [120, 330], [300, 520], [560, 760], [720, 950]],
    v: [[120, 300], [330, 520], [520, 700], [740, 940]]
}

// ---------------- 路线点位布局 ----------------

const dayColors = ['#2374DD', '#0EA5A4', '#E8912F', '#8B5CF6', '#2FA96B', '#E5484D', '#0891B2', '#D946EF']
const dayColor = (dayNo) => dayColors[(dayNo - 1) % dayColors.length]

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

// 点位坐标：按天纵向推进，相邻天数左右交错，同一天的点位横向排开
const layout = computed(() => {
    const route = state.routes[state.selectedIndex]
    const points = flatPoints.value
    if (!route || !points.length) return []

    const totalDays = route.dayPlans.length
    return points.map(p => {
        const dayT = (p.dayNo - 0.5) / totalDays
        const dayPlan = route.dayPlans.find(d => d.dayNo === p.dayNo)
        const k = dayPlan.points.length
        const dir = p.dayNo % 2 ? 1 : -1

        const x = clamp(500 + dir * 150 + (p.indexInDay - (k - 1) / 2) * 108, 120, 880)
        const y = clamp(105 + dayT * 780 + (p.indexInDay % 2) * 48 - 24, 95, 905)
        return { ...p, x, y }
    })
})

// Catmull-Rom 转三次贝塞尔，生成平滑轨迹
const toSmoothPath = (pts) => {
    if (pts.length < 2) return ''
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i]
        const p1 = pts[i]
        const p2 = pts[i + 1]
        const p3 = pts[i + 2] || p2
        const c1x = p1.x + (p2.x - p0.x) / 6
        const c1y = p1.y + (p2.y - p0.y) / 6
        const c2x = p2.x - (p3.x - p1.x) / 6
        const c2y = p2.y - (p3.y - p1.y) / 6
        d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
    }
    return d
}

// 按天分段路径
const segments = computed(() => {
    if (!layout.value.length) return []
    const map = new Map()
    layout.value.forEach(p => {
        if (!map.has(p.dayNo)) map.set(p.dayNo, [])
        map.get(p.dayNo).push(p)
    })
    const segs = []
    map.forEach((pts, dayNo) => {
        segs.push({ dayNo, path: toSmoothPath(pts), color: dayColor(dayNo) })
    })
    return segs
})

// ---------------- 已选场所标记 ----------------

const poiStyle = {
    '酒店': { color: '#2374DD', mark: 'H' },
    '景点': { color: '#E8912F', mark: '★' },
    '餐饮': { color: '#E5484D', mark: '餐' },
    '娱乐': { color: '#8B5CF6', mark: '乐' }
}

const poiMarkers = computed(() => {
    const pts = layout.value
    if (!pts.length) return []
    return expenseState.bills
        .filter(b => b.source === 'ai' && b.poiId)
        .map((b, i) => {
            const anchor = pts[hashStr(b.poiId) % pts.length]
            const ang = (hashStr(b.poiId + i) % 360) * Math.PI / 180
            const r = 62
            const style = poiStyle[b.category] || poiStyle['景点']
            return {
                x: clamp(anchor.x + Math.cos(ang) * r, 70, 930),
                y: clamp(anchor.y + Math.sin(ang) * r - 14, 60, 920),
                ...style
            }
        })
})

function hashStr(str) {
    let h = 0
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
    return Math.abs(h)
}

// ---------------- 实时定位与偏离模拟 ----------------

const locating = ref(false)
const showOffAlert = ref(false)
const offDistance = ref(320)
const dotPos = ref({ x: 500, y: 500 })
const connector = ref(null)

let moveTimer = null
let progress = 0

const interp = (t) => {
    const pts = layout.value
    if (pts.length < 2) return pts[0] || { x: 500, y: 500 }
    const total = pts.length - 1
    const pos = clamp(t, 0, 1) * total
    const i = Math.min(Math.floor(pos), total - 1)
    const f = pos - i
    return {
        x: pts[i].x + (pts[i + 1].x - pts[i].x) * f,
        y: pts[i].y + (pts[i + 1].y - pts[i].y) * f
    }
}

const startLocating = () => {
    if (!layout.value.length) {
        toast('请先选择一套路线方案')
        return
    }
    locating.value = true
    connector.value = null
    progress = 0
    dotPos.value = interp(0)

    moveTimer = setInterval(() => {
        progress += 0.045
        if (progress > 0.75) progress = 0.3
        dotPos.value = interp(progress)
    }, 900)
}

const stopLocating = () => {
    locating.value = false
    clearInterval(moveTimer)
}

// 模拟偏离：定位点漂移到路线远处并弹窗
const simulateDeviate = () => {
    const pts = layout.value
    dotPos.value = {
        x: clamp(pts[0].x + 260, 60, 940),
        y: clamp(pts[0].y + 190, 60, 940)
    }
    offDistance.value = 280 + hashStr('dev') % 200
    showOffAlert.value = true
}

// 生成接驳路线：偏离点 → 最近的路线点位
const genConnector = () => {
    const pts = layout.value
    let nearest = pts[0]
    let minD = Infinity
    pts.forEach(p => {
        const d = (p.x - dotPos.value.x) ** 2 + (p.y - dotPos.value.y) ** 2
        if (d < minD) { minD = d; nearest = p }
    })

    const mx = (dotPos.value.x + nearest.x) / 2 + 90
    const my = (dotPos.value.y + nearest.y) / 2 - 70
    connector.value = {
        path: `M ${dotPos.value.x} ${dotPos.value.y} Q ${mx} ${my} ${nearest.x} ${nearest.y}`,
        tx: nearest.x,
        ty: nearest.y
    }
    showOffAlert.value = false
    bumpOffRoute()
    toast.success('接驳路线已生成，沿途场所同步刷新')
}

onUnmounted(() => clearInterval(moveTimer))
</script>

<style scoped>
.map-wrap {
    height: 100%;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.map-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid var(--divider);
    flex-shrink: 0;
}

.map-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14.5px;
    font-weight: 600;
    color: var(--text-1);
}

.map-controls {
    display: flex;
    gap: 7px;
}

.ctrl-btn {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: #fff;
    color: var(--text-2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
}

.ctrl-btn:hover {
    color: var(--brand);
    border-color: #b9d2f2;
    background: var(--brand-lighter);
}

.map-canvas {
    flex: 1;
    position: relative;
    min-height: 0;
}

.map-svg {
    width: 100%;
    height: 100%;
    display: block;
}

.map-empty {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(240, 245, 241, 0.8);
}

.empty-icon {
    font-size: 46px;
    margin-bottom: 12px;
}

.empty-text {
    font-size: 13.5px;
    color: var(--text-3);
    text-align: center;
    line-height: 1.7;
}

/* 底部定位操作 */
.map-bottom {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 11px 14px;
    border-top: 1px solid var(--divider);
    flex-shrink: 0;
}

.locate-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding: 0 15px;
    border-radius: 9px;
    border: 1px solid #b9d2f2;
    background: var(--brand-lighter);
    color: var(--brand);
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
}

.locate-btn.active {
    cursor: default;
}

.locate-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--brand);
    animation: blinkDot 1.2s infinite;
}

@keyframes blinkDot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

.deviate-btn,
.stop-btn {
    height: 36px;
    padding: 0 14px;
    border-radius: 9px;
    font-size: 13.5px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.deviate-btn {
    border: 1px solid #f3d2b0;
    background: var(--warning-bg);
    color: var(--warning);
}

.stop-btn {
    border: 1px solid var(--border);
    background: #fff;
    color: var(--text-2);
}

.deviate-btn:hover {
    border-color: var(--warning);
}

.stop-btn:hover {
    color: var(--danger);
    border-color: var(--danger);
}

/* 偏离弹窗 */
.off-modal {
    width: 380px;
}

.off-head {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 24px 22px 8px;
}

.off-emoji {
    font-size: 30px;
}

.off-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-1);
}

.off-sub {
    font-size: 13px;
    color: var(--text-3);
    margin-top: 4px;
}

.off-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px 22px 22px;
}
</style>
