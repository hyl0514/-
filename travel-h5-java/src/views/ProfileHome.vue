<template>
  <div class="profile-home">
    <!-- ① 顶部通知栏（模拟通用导航） -->
    <header class="ph-topbar">
      <div class="ph-top-left">
        <span class="ph-top-title">个人主页</span>
        <span class="ph-top-bread">总览 · {{ auth.state.name || '旅行体验官' }}</span>
      </div>
      <div class="ph-top-right">
        <span class="ph-top-btn" title="消息通知">🔔</span>
        <span class="ph-top-btn" title="主题切换">🎨</span>
        <span class="ph-top-btn" title="退出登录">🚪</span>
      </div>
    </header>

    <!-- ② 渐变 Banner + 数据卡 -->
    <ProfileBanner />

    <!-- ③ 快捷六宫格 -->
    <QuickNav />

    <!-- ④ 个人内容中心（四大卡片） -->
    <div class="content-center">
      <!-- 卡片 1：我的行程方案（整行） -->
      <section class="pc-card pc-trips">
        <div class="pc-head">
          <div>
            <div class="pc-title">🧭 我的全部行程</div>
            <div class="pc-sub">AI 规划出行方案记录</div>
          </div>
          <div class="pc-head-actions">
            <button class="pc-btn pc-btn-sm pc-btn-primary" @click="$router.push('/planner')">➕ 新建行程</button>
            <button class="pc-btn pc-btn-sm" @click="$router.push('/planner')">查看全部 →</button>
          </div>
        </div>

        <div class="trip-scroll" ref="tripScroll">
          <div class="trip-card" v-for="t in trips" :key="t.id">
            <div class="tc-cover" :style="{ background: t.bg || 'linear-gradient(135deg, #2374DD, #4a90e8)' }">
              <span class="tc-status" :class="'ts-' + t.status">{{ t.status }}</span>
            </div>
            <div class="tc-body">
              <div class="tc-name">{{ t.name }}</div>
              <div class="tc-route">{{ t.origin || '出发地' }} → {{ t.destination }}</div>
              <div class="tc-meta">
                <span>📅 {{ t.days }}天</span>
                <span>👥 {{ t.people }}人</span>
                <span>💰 ¥{{ t.budget }}</span>
              </div>
              <div class="tc-actions">
                <span class="tc-act" @click="$router.push('/planner')">查看</span>
                <span class="tc-act">复制</span>
                <span class="tc-act">分享</span>
              </div>
            </div>
          </div>
          <div class="trip-empty" v-if="!trips.length">暂无行程方案，去 AI 规划一个吧</div>
        </div>
      </section>

      <!-- 卡片 2：预算账本（左列） + 卡片 3：收藏好物（右列） -->
      <div class="pc-row">
        <!-- 卡片 2：预算 -->
        <section class="pc-card pc-budget">
          <div class="pc-head">
            <div>
              <div class="pc-title">💰 我的预算账本</div>
              <div class="pc-sub">实时消费追踪</div>
            </div>
          </div>
          <!-- 环形进度 -->
          <div class="pb-ring-wrap">
            <svg class="pb-ring" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" stroke="#eef1f6" stroke-width="10" fill="none" />
              <circle cx="60" cy="60" r="52" stroke="url(#ringGrad)" stroke-width="10" fill="none"
                :stroke-dasharray="326.73"
                :stroke-dashoffset="326.73 - 326.73 * budgetPct / 100"
                stroke-linecap="round"
                transform="rotate(-90 60 60)" />
              <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#2374DD" />
                  <stop offset="100%" stop-color="#4a90e8" />
                </linearGradient>
              </defs>
            </svg>
            <div class="pb-ring-center">
              <div class="pb-pct">{{ budgetPct }}%</div>
              <div class="pb-pct-sub">预算使用率</div>
            </div>
          </div>

          <div class="pb-data">
            <div class="pb-item">
              <span class="pb-label">总预算</span>
              <span class="pb-val">¥{{ budgetTotal }}</span>
            </div>
            <div class="pb-item">
              <span class="pb-label">已消费</span>
              <span class="pb-val blue">¥{{ budgetSpent }}</span>
            </div>
            <div class="pb-item">
              <span class="pb-label">剩余</span>
              <span class="pb-val green">¥{{ budgetRemain }}</span>
            </div>
          </div>

          <div class="pb-actions">
            <button class="pc-btn pc-btn-sm pc-btn-primary" @click="$router.push('/budget')">进入完整账本 →</button>
          </div>
        </section>

        <!-- 卡片 3：收藏好物 -->
        <section class="pc-card pc-fav">
          <div class="pc-head">
            <div>
              <div class="pc-title">❤️ 我的收藏好物</div>
              <div class="pc-sub">酒店 · 景点 · 美食 · 路线</div>
            </div>
            <button class="pc-btn pc-btn-sm pc-btn-primary" @click="$router.push('/favorites')">全部 →</button>
          </div>

          <div class="pf-grid">
            <div class="pf-item" v-for="(f, i) in favPreview" :key="i" @click="$router.push('/favorites')">
              <img class="pf-img" :src="f.img" :alt="f.name" @error="$event.target.style.display='none'">
              <div class="pf-info">
                <div class="pf-name">{{ f.name }}</div>
                <div class="pf-meta" v-if="f.rating">★ {{ f.rating }} · {{ f.priceText }}</div>
                <div class="pf-meta" v-else>{{ f.savedAt }}</div>
              </div>
            </div>
            <div class="pf-empty" v-if="!favPreview.length">暂无收藏，去榜单发现好物吧</div>
          </div>
        </section>
      </div>

      <!-- 卡片 4：社区作品（整行） -->
      <section class="pc-card pc-community">
        <div class="pc-head">
          <div>
            <div class="pc-title">📝 我的社区作品</div>
            <div class="pc-sub">发布旅行攻略与动态</div>
          </div>
          <div class="pc-head-actions">
            <span
              v-for="tab in cmTabs"
              :key="tab"
              class="cm-tab"
              :class="{ active: cmTab === tab }"
              @click="cmTab = tab"
            >{{ tab }}</span>
          </div>
        </div>

        <div class="cm-grid">
          <div class="cm-card" v-for="(p, i) in cmPreview" :key="p.id">
            <div class="cm-cover" :style="{ background: cmBgs[i % cmBgs.length] }">
              <span class="cm-status" :class="'cs-' + p.statusRaw">{{ p.status }}</span>
            </div>
            <div class="cm-body">
              <div class="cm-title">{{ p.title }}</div>
              <div class="cm-meta">
                <span>👍 {{ p.likes }}</span>
                <span>💬 {{ p.comments }}</span>
                <span>👁 {{ p.views }}</span>
              </div>
              <div class="cm-actions">
                <span class="tc-act">编辑</span>
                <span class="tc-act" v-if="p.status === '已驳回'">重新提交</span>
                <span class="tc-act danger">删除</span>
              </div>
            </div>
          </div>
          <div class="cm-empty" v-if="!cmPreview.length">暂无作品，去发布你的第一篇旅行攻略吧</div>
        </div>
      </section>
    </div>

    <!-- ⑤ 底部：账号与设置 -->
    <footer class="pf-footer">
      <div class="pf-card">
        <div class="pfc-title">🔐 账号与安全</div>
        <div class="pfc-list">
          <div class="pfc-row"><span>修改密码</span><span class="pfc-arrow">›</span></div>
          <div class="pfc-row"><span>绑定手机</span><span class="pfc-arrow">›</span></div>
          <div class="pfc-row"><span>隐私设置</span><span class="pfc-arrow">›</span></div>
        </div>
      </div>
      <div class="pf-card">
        <div class="pfc-title">⚙️ 系统设置</div>
        <div class="pfc-list">
          <div class="pfc-row">
            <span>消息通知</span>
            <span class="pfc-switch on" @click="notifyOn = !notifyOn"></span>
          </div>
          <div class="pfc-row">
            <span>界面主题</span>
            <span class="pfc-switch" @click="notifyOn = !notifyOn"></span>
          </div>
          <div class="pfc-row"><span>清除本地缓存</span><span class="pfc-arrow">›</span></div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProfileBanner from '../components/profile/ProfileBanner.vue'
import QuickNav from '../components/profile/QuickNav.vue'
import { useFavoriteStore } from '../store/favoriteStore'
import { useExpenseStore } from '../store/expenseStore'
import { useTripStore } from '../store/tripStore'
import { useAuthStore } from '../store/authStore'
import { useCommunityStore } from '../store/communityStore'

const router = useRouter()
const auth = useAuthStore()
const fav = useFavoriteStore()
const exp = useExpenseStore()
const trip = useTripStore()
const comm = useCommunityStore()

// ---------------- 行程列表 ----------------
const trips = computed(() => trip.state.myTrips.map(t => ({
    ...t,
    budget: t.cost || t.budget || 0
})))

// ---------------- 预算 ----------------
const budgetTotal = computed(() => exp.state.budget || 8000)
const budgetSpent = computed(() => exp.actualTotal || 3280)
const budgetRemain = computed(() => Math.max(0, budgetTotal.value - budgetSpent.value))
const budgetPct = computed(() => Math.min(100, Math.round(budgetSpent.value / budgetTotal.value * 100)))

// ---------------- 收藏预览 ----------------
const favPreview = computed(() => {
    const all = []
    fav.state.hotels.forEach(h => all.push({ ...h, type: '酒店' }))
    fav.state.spots.forEach(s => all.push({ ...s, type: '景点' }))
    fav.state.foods.forEach(f => all.push({ ...f, type: '美食' }))
    fav.state.routes.slice(0, 1).forEach(r => all.push({
        name: r.name, img: r.img, rating: null, priceText: null, savedAt: r.savedAt, type: '路线'
    }))
    return all.slice(0, 8)
})

// ---------------- 社区作品 ----------------
const cmTabs = ['全部作品', '审核中', '已通过', '已驳回']
const cmTab = ref('全部作品')
const cmBgs = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #fa709a, #fee140)'
]
// 状态英文 → 中文
const statusMap = { approved: '已通过', pending: '审核中', rejected: '已驳回' }
const cmPreview = computed(() => {
    let list = comm.myPosts.value || []
    if (cmTab.value === '审核中') list = list.filter(p => p.status === 'pending')
    else if (cmTab.value === '已通过') list = list.filter(p => p.status === 'approved')
    else if (cmTab.value === '已驳回') list = list.filter(p => p.status === 'rejected')
    return list.map(p => ({
        id: p.id,
        title: p.title,
        status: statusMap[p.status] || p.status,
        statusRaw: p.status,
        likes: p.likes || 0,
        comments: p.comments || 0,
        views: p.views || 0
    }))
})

// ---------------- 设置 ----------------
const notifyOn = ref(true)

// 滚动到顶部
onMounted(() => {
    document.querySelector('.profile-home')?.scrollTo?.(0, 0)
})
</script>

<style scoped>
.profile-home {
    height: 100%;
    overflow-y: auto;
    background: #f5f7fb;
    padding: 0 28px 28px;
    scroll-behavior: smooth;
}

/* 顶栏 */
.ph-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 0 14px;
    position: sticky;
    top: 0;
    z-index: 10;
    background: linear-gradient(to bottom, #f5f7fb 60%, transparent);
    backdrop-filter: blur(4px);
}

.ph-top-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-1);
}

.ph-top-bread {
    margin-left: 12px;
    font-size: 13px;
    color: var(--text-3);
}

.ph-top-right {
    display: flex;
    gap: 6px;
}

.ph-top-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.15s;
}

.ph-top-btn:hover {
    background: #eef1f6;
    transform: scale(1.08);
}

/* 内容中心 */
.content-center {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-top: 18px;
}

.pc-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
}

.pc-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid var(--border);
    padding: 18px 22px 20px;
}

.pc-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.pc-title {
    font-size: 15.5px;
    font-weight: 700;
    color: var(--text-1);
}

.pc-sub {
    font-size: 12.5px;
    color: var(--text-3);
    margin-top: 3px;
}

.pc-head-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

/* 行程横向滚动 */
.trip-scroll {
    display: flex;
    gap: 14px;
    overflow-x: auto;
    padding-bottom: 4px;
}

.trip-scroll::-webkit-scrollbar { height: 6px; }
.trip-scroll::-webkit-scrollbar-thumb { background: #dde3ec; border-radius: 3px; }

.trip-card {
    min-width: 280px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.18s;
    flex-shrink: 0;
}

.trip-card:hover {
    box-shadow: 0 6px 20px rgba(35, 116, 221, 0.12);
    transform: translateY(-2px);
}

.tc-cover {
    height: 90px;
    position: relative;
}

.tc-status {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 3px 10px;
    border-radius: 10px;
    font-size: 11.5px;
    font-weight: 600;
    color: #fff;
}

.ts-已完成 { background: rgba(14, 165, 164, 0.9); }
.ts-进行中 { background: rgba(35, 116, 221, 0.9); }
.ts-未出行 { background: rgba(130, 130, 140, 0.85); }

.tc-body {
    padding: 12px 14px 14px;
}

.tc-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-1);
}

.tc-route {
    font-size: 12.5px;
    color: var(--text-3);
    margin-top: 4px;
}

.tc-meta {
    display: flex;
    gap: 12px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--text-2);
}

.tc-actions {
    display: flex;
    gap: 12px;
    margin-top: 10px;
    padding-top: 9px;
    border-top: 1px solid var(--divider);
}

.tc-act {
    font-size: 12.5px;
    color: var(--brand);
    cursor: pointer;
    transition: all 0.15s;
}

.tc-act:hover { color: var(--brand); text-decoration: underline; }
.tc-act.danger { color: var(--danger); }
.tc-act.danger:hover { color: #d03e4f; }

.trip-empty {
    width: 100%;
    text-align: center;
    padding: 30px;
    color: var(--text-3);
    font-size: 13px;
}

/* 预算 */
.pb-ring-wrap {
    display: flex;
    justify-content: center;
    padding: 10px 0 5px;
    position: relative;
}

.pb-ring { width: 140px; height: 140px; }

.pb-ring-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}

.pb-pct {
    font-size: 26px;
    font-weight: 700;
    color: var(--text-1);
}

.pb-pct-sub {
    font-size: 11.5px;
    color: var(--text-3);
}

.pb-data {
    display: flex;
    justify-content: space-around;
    padding: 14px 0;
    border-top: 1px solid var(--divider);
    border-bottom: 1px solid var(--divider);
    margin-top: 4px;
}

.pb-item { text-align: center; }

.pb-label {
    display: block;
    font-size: 11.5px;
    color: var(--text-3);
    margin-bottom: 4px;
}

.pb-val {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-1);
}

.pb-val.blue { color: var(--brand); }
.pb-val.green { color: var(--success); }

.pb-actions {
    text-align: center;
    margin-top: 13px;
}

/* 收藏网格 */
.pf-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

.pf-item {
    cursor: pointer;
    border-radius: 9px;
    overflow: hidden;
    border: 1px solid var(--border);
    transition: all 0.18s;
}

.pf-item:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.pf-img {
    width: 100%;
    height: 60px;
    object-fit: cover;
    background: #f5f7fa;
}

.pf-info {
    padding: 6px 8px 8px;
}

.pf-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pf-meta {
    font-size: 10.5px;
    color: var(--text-3);
    margin-top: 2px;
}

.pf-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 20px;
    color: var(--text-3);
    font-size: 13px;
}

/* 社区 */
.cm-tab {
    padding: 5px 14px;
    font-size: 12.5px;
    border-radius: 14px;
    color: var(--text-3);
    cursor: pointer;
    transition: all 0.15s;
}

.cm-tab:hover { color: var(--text-1); }

.cm-tab.active {
    background: var(--brand);
    color: #fff;
}

.cm-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
}

.cm-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.18s;
    cursor: pointer;
}

.cm-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.cm-cover {
    height: 100px;
    position: relative;
}

.cm-status {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 2px 8px;
    border-radius: 9px;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
}

.cs-已通过 { background: #0ea5a4; }
.cs-审核中 { background: #e8912f; }
.cs-已驳回 { background: #d03e4f; }

.cm-body {
    padding: 10px 12px 12px;
}

.cm-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-1);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    min-height: 36px;
    line-height: 1.35;
}

.cm-meta {
    display: flex;
    gap: 10px;
    margin-top: 8px;
    font-size: 11.5px;
    color: var(--text-3);
}

.cm-actions {
    display: flex;
    gap: 10px;
    margin-top: 9px;
    padding-top: 8px;
    border-top: 1px solid var(--divider);
}

.cm-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 30px;
    color: var(--text-3);
    font-size: 13px;
}

/* 底部设置 */
.pf-footer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin-top: 18px;
}

.pf-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid var(--border);
    padding: 18px 22px;
}

.pfc-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-1);
    margin-bottom: 10px;
}

.pfc-list {
    display: flex;
    flex-direction: column;
}

.pfc-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 11px 0;
    border-bottom: 1px solid var(--divider);
    font-size: 13.5px;
    color: var(--text-2);
    cursor: pointer;
    transition: color 0.15s;
}

.pfc-row:last-child { border-bottom: none; }
.pfc-row:hover { color: var(--brand); }

.pfc-arrow {
    color: var(--text-3);
    font-size: 16px;
}

.pfc-switch {
    width: 36px;
    height: 20px;
    background: #dde3ec;
    border-radius: 10px;
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
}

.pfc-switch.on {
    background: var(--brand);
}

.pfc-switch::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: all 0.2s;
}

.pfc-switch.on::after {
    left: 18px;
}
</style>
