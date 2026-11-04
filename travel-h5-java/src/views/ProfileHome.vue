<template>
  <div class="profile-home">
    <!-- 3D 漂浮装饰背景层 -->
    <div class="deco-layer">
      <div class="float-cube fc1"></div>
      <div class="float-cube fc2"></div>
      <div class="float-cube fc3"></div>
      <div class="float-orb orb1"></div>
      <div class="float-orb orb2"></div>
      <div class="float-orb orb3"></div>
      <div class="float-plane">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M2 16l8-2 4-10 2 1-1 7 6 2-1 2-6-1-4 5-2-1 1-3-5-2z" fill="#2374DD" opacity="0.5"/></svg>
      </div>
      <div class="float-plane fp2">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M2 16l8-2 4-10 2 1-1 7 6 2-1 2-6-1-4 5-2-1 1-3-5-2z" fill="#0EA5A4" opacity="0.4"/></svg>
      </div>
      <div class="float-ticket">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9z" stroke="#E8912F" stroke-width="2" opacity="0.45"/><path d="M12 7v10" stroke="#E8912F" stroke-width="2" stroke-dasharray="2 2" opacity="0.45"/></svg>
      </div>
    </div>

    <!-- 顶部通知栏（毛玻璃） -->
    <header class="ph-topbar">
      <div class="ph-top-left">
        <div class="ph-top-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        </div>
        <span class="ph-top-title">个人主页</span>
        <span class="ph-top-bread">总览 · {{ auth.state.name || '旅行体验官' }}</span>
      </div>
      <div class="ph-top-right">
        <span class="ph-top-btn" title="消息通知">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.5 19a1.5 1.5 0 0 1-3 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span class="ph-notify-dot"></span>
        </span>
        <span class="ph-top-btn" title="主题切换">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 2a10 10 0 0 0 0 20M2 12h20" stroke="currentColor" stroke-width="2"/></svg>
        </span>
        <span class="ph-top-btn ph-logout" title="退出登录" @click="auth.logout(); $router.push('/login')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </div>
    </header>

    <!-- 渐变 Banner + 数据卡 -->
    <ProfileBanner />

    <!-- 快捷六宫格 -->
    <QuickNav />

    <!-- 主内容栅格：左主右副 -->
    <div class="ph-main">
      <!-- 左主列 -->
      <div class="ph-col-main">
        <!-- 行程方案 -->
        <section class="ph-card ph-trips reveal" style="--delay:0s">
          <div class="ph-card-head">
            <div class="ph-head-title-row">
              <div class="ph-head-icon ph-ic-trip">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5L12 3z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>
              </div>
              <div>
                <div class="ph-head-title">我的全部行程</div>
                <div class="ph-head-sub">AI 规划出行方案记录 · 共 {{ trips.length }} 条</div>
              </div>
            </div>
            <div class="ph-head-actions">
              <button class="ph-btn ph-btn-primary" @click="$router.push('/planner')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                新建行程
              </button>
              <button class="ph-btn" @click="$router.push('/planner')">查看全部 →</button>
            </div>
          </div>

          <div class="trip-scroll">
            <div class="trip-card" v-for="(t, idx) in trips" :key="t.id"
              @mousemove="tiltCard($event, idx)" @mouseleave="resetTilt">
              <!-- 顶部：真实风景图 + 蓝青渐变蒙版 -->
              <div class="tc-cover">
                <img class="tc-cover-img" :src="t.img" :alt="t.name" referrerpolicy="no-referrer" @error="onImgError($event, t.destination || t.name, 'landscape_4_3')">
                <div class="tc-cover-mask"></div>
                <div class="tc-shine"></div>
                <span class="tc-status" :class="'ts-' + t.status">
                  <span class="ts-dot"></span>{{ t.status }}
                </span>
                <span class="tc-city-tag">📍 {{ t.destination || t.name }}</span>
                <div class="tc-deco">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 11l6-9 6 9-3 9H6l-3-9z" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linejoin="round"/></svg>
                </div>
                <div class="tc-big-days">
                  <span class="tcbd-num">{{ t.days }}</span>
                  <span class="tcbd-unit">DAYS</span>
                </div>
              </div>
              <!-- 底部：信息区 -->
              <div class="tc-body">
                <div class="tc-name">{{ t.name }}</div>
                <div class="tc-route">
                  <span class="tcr-from">{{ t.origin || '出发地' }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span class="tcr-to">{{ t.destination }}</span>
                </div>
                <div class="tc-meta">
                  <span class="tcm-chip tcm-people">👥 {{ t.people }}人</span>
                  <span class="tcm-chip tcm-budget">💰 ¥{{ t.budget }}</span>
                </div>
                <div class="tc-actions">
                  <span class="tc-act" @click.stop="$router.push('/planner')">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                    查看
                  </span>
                  <span class="tc-act">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M14 4l6 6-9 9-6 1 1-6 8-10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    编辑
                  </span>
                  <span class="tc-act">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    分享
                  </span>
                </div>
              </div>
            </div>
            <div class="trip-empty" v-if="!trips.length">
              <div class="te-emoji">🧭</div>
              <div class="te-text">暂无行程方案</div>
              <div class="te-hint">去 AI 规划你的第一场旅行 →</div>
            </div>
          </div>
        </section>

        <!-- 社区作品 -->
        <section class="ph-card ph-community reveal" style="--delay:0.15s">
          <div class="ph-card-head">
            <div class="ph-head-title-row">
              <div class="ph-head-icon ph-ic-post">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
              </div>
              <div>
                <div class="ph-head-title">我的社区作品</div>
                <div class="ph-head-sub">发布旅行攻略与动态</div>
              </div>
            </div>
            <div class="ph-head-actions">
              <span v-for="tab in cmTabs" :key="tab" class="cm-tab" :class="{ active: cmTab === tab }"
                @click="cmTab = tab">{{ tab }}</span>
            </div>
          </div>

          <div class="cm-grid">
            <div class="cm-card" v-for="(p, i) in cmPreview" :key="p.id">
              <div class="cm-cover">
                <img class="cm-cover-img" :src="p.coverImg" :alt="p.title" referrerpolicy="no-referrer" @error="onImgError($event, p.title, 'landscape_4_3')">
                <div class="cm-cover-mask"></div>
                <div class="cm-shine"></div>
                <span class="cm-status" :class="'cs-' + p.statusRaw">
                  <span class="cs-dot"></span>{{ p.status }}
                </span>
              </div>
              <div class="cm-body">
                <div class="cm-title">{{ p.title }}</div>
                <div class="cm-meta">
                  <span class="cmm-chip cmm-like">👍 {{ p.likes }}</span>
                  <span class="cmm-chip cmm-comment">💬 {{ p.comments }}</span>
                  <span class="cmm-chip cmm-view">👁 {{ p.views }}</span>
                </div>
                <div class="cm-actions">
                  <span class="cm-act">编辑</span>
                  <span class="cm-act" v-if="p.status === '已驳回'">重提</span>
                  <span class="cm-act danger">删除</span>
                </div>
              </div>
            </div>
            <div class="cm-empty" v-if="!cmPreview.length">
              <div class="ce-emoji">📝</div>
              <div class="ce-text">暂无作品</div>
              <div class="ce-hint">去发布你的第一篇旅行攻略</div>
            </div>
          </div>
        </section>
      </div>

      <!-- 右副列 -->
      <div class="ph-col-side">
        <!-- 预算账本 -->
        <section class="ph-card ph-budget reveal" style="--delay:0.05s">
          <div class="ph-card-head">
            <div class="ph-head-title-row">
              <div class="ph-head-icon ph-ic-budget">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="14" rx="2.5" stroke="#fff" stroke-width="2"/><path d="M3 10.5h18M15.5 15.5H18" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
              </div>
              <div>
                <div class="ph-head-title">我的预算账本</div>
                <div class="ph-head-sub">实时消费追踪</div>
              </div>
            </div>
          </div>

          <!-- 双环 + 装饰背景 -->
          <div class="pb-stage">
            <div class="pb-stage-bg">
              <svg width="180" height="180" viewBox="0 0 160 160" fill="none" opacity="0.14">
                <circle cx="80" cy="80" r="60" stroke="#E8912F" stroke-width="1.5"/>
                <circle cx="80" cy="80" r="40" stroke="#E8912F" stroke-width="1"/>
                <path d="M80 20v120M20 80h120" stroke="#E8912F" stroke-width="1"/>
              </svg>
            </div>
            <div class="pb-ring-3d">
              <svg class="pb-ring" viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="ringGrad2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#E8912F" />
                    <stop offset="50%" stop-color="#f2b15c" />
                    <stop offset="100%" stop-color="#e94560" />
                  </linearGradient>
                  <filter id="ringGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <circle cx="80" cy="80" r="68" stroke="#eef1f6" stroke-width="12" fill="none" />
                <circle cx="80" cy="80" r="68" stroke="url(#ringGrad2)" stroke-width="12" fill="none"
                  :stroke-dasharray="427.26"
                  :stroke-dashoffset="427.26 - 427.26 * budgetPct / 100"
                  stroke-linecap="round"
                  transform="rotate(-90 80 80)"
                  filter="url(#ringGlow)"
                  class="pb-ring-anim" />
                <circle cx="80" cy="80" r="48" stroke="#fff" stroke-width="6" fill="none" />
                <circle cx="80" cy="80" r="48" stroke="#4a90e8" stroke-width="6" fill="none"
                  :stroke-dasharray="301.59"
                  :stroke-dashoffset="301.59 - 301.59 * (budgetPct / 100) * 0.7"
                  stroke-linecap="round"
                  transform="rotate(-90 80 80)"
                  class="pb-ring-anim" />
              </svg>
              <div class="pb-ring-center">
                <div class="pb-pct">{{ budgetPct }}<small>%</small></div>
                <div class="pb-pct-sub">预算使用率</div>
              </div>
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

          <!-- 类别条 -->
          <div class="pb-cat-bars">
            <div class="pb-cat" v-for="(c, i) in budgetCats" :key="i">
              <span class="pbc-label">{{ c.label }}</span>
              <div class="pbc-track">
                <div class="pbc-fill" :style="{ width: c.pct + '%', background: c.color }"></div>
              </div>
              <span class="pbc-val">¥{{ c.val }}</span>
            </div>
          </div>

          <div class="pb-actions">
            <button class="ph-btn ph-btn-primary block" @click="$router.push('/budget')">进入完整账本 →</button>
          </div>
        </section>

        <!-- 收藏好物 -->
        <section class="ph-card ph-fav reveal" style="--delay:0.2s">
          <div class="ph-card-head">
            <div class="ph-head-title-row">
              <div class="ph-head-icon ph-ic-fav">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>
              </div>
              <div>
                <div class="ph-head-title">我的收藏好物</div>
                <div class="ph-head-sub">酒店 · 景点 · 美食 · 路线</div>
              </div>
            </div>
            <button class="ph-btn ph-btn-primary" @click="$router.push('/favorites')">全部 →</button>
          </div>

          <div class="pf-grid">
            <div class="pf-item" v-for="(f, i) in favPreview" :key="i"
              :style="{ '--fav-delay': i * 0.05 + 's' }" @click="$router.push('/favorites')">
              <div class="pf-img-wrap">
                <img class="pf-img" :src="f.img" :alt="f.name" referrerpolicy="no-referrer" @error="$event.target.style.opacity='0.4'">
                <div class="pf-img-mask"></div>
                <div class="pf-type-tag" :class="'pt-' + f.typeClass">{{ f.type }}</div>
                <div class="pf-rating" v-if="f.rating">★ {{ f.rating }}</div>
              </div>
              <div class="pf-info">
                <div class="pf-name">{{ f.name }}</div>
                <div class="pf-meta" v-if="f.priceText">{{ f.priceText }}</div>
                <div class="pf-meta muted" v-else>收藏于 {{ f.savedAt }}</div>
              </div>
            </div>
            <div class="pf-empty" v-if="!favPreview.length">
              <div class="pfe-emoji">❤️</div>
              <div class="pfe-text">暂无收藏</div>
              <div class="pfe-hint">去榜单发现好物</div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- 底部双卡 -->
    <div class="ph-foot">
      <section class="ph-card ph-account reveal" style="--delay:0.3s">
        <div class="pfc-head">
          <div class="pfc-icon-wrap pfc-ic-account">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="#fff" stroke-width="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#fff" stroke-width="2"/></svg>
          </div>
          <div>
            <div class="pfc-title">账号与安全</div>
            <div class="pfc-sub">守护你的旅行账户</div>
          </div>
        </div>
        <div class="pfc-list">
          <div class="pfc-row"><span class="pfc-row-label"><span class="pfc-row-ic">🔑</span>修改密码</span><span class="pfc-arrow">›</span></div>
          <div class="pfc-row"><span class="pfc-row-label"><span class="pfc-row-ic">📱</span>绑定手机</span><span class="pfc-tag">已绑定</span></div>
          <div class="pfc-row"><span class="pfc-row-label"><span class="pfc-row-ic">🛡️</span>隐私设置</span><span class="pfc-arrow">›</span></div>
        </div>
      </section>

      <section class="ph-card ph-setting reveal" style="--delay:0.4s">
        <div class="pfc-head">
          <div class="pfc-icon-wrap pfc-ic-setting">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#fff" stroke-width="2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div>
            <div class="pfc-title">系统设置</div>
            <div class="pfc-sub">个性化你的使用体验</div>
          </div>
        </div>
        <div class="pfc-list">
          <div class="pfc-row"><span class="pfc-row-label"><span class="pfc-row-ic">🔔</span>消息通知</span><span class="pfc-switch" :class="{ on: notifyOn }" @click="notifyOn = !notifyOn"></span></div>
          <div class="pfc-row"><span class="pfc-row-label"><span class="pfc-row-ic">🎨</span>界面主题</span><span class="pfc-switch" :class="{ on: !notifyOn }" @click="notifyOn = !notifyOn"></span></div>
          <div class="pfc-row"><span class="pfc-row-label"><span class="pfc-row-ic">🧹</span>清除本地缓存</span><span class="pfc-arrow">›</span></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
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

// 图片源：picsum.photos（同 seed 返回同图，稳定且国内可访问）
// 旧 trae 文生图 API 已下线（404），改用 picsum + 渐变蒙版统一风格
const seedFromStr = (s) => {
  let h = 0
  const str = String(s || 'travel')
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h).toString(36)
}
const genImg = (keywords, size = 'landscape_4_3') => {
  const seed = seedFromStr(keywords)
  return size === 'square'
    ? `https://picsum.photos/seed/${seed}/400/400`
    : `https://picsum.photos/seed/${seed}/600/400`
}

// 行程图片：优先使用 imgMap 映射，确保照片与目的地匹配
import { imgMap } from '../utils/imgMap.js'
const tripImgCache = {}
const getTripImg = (t) => {
  const key = (t.destination || t.name || 'travel') + ''
  if (tripImgCache[key]) return tripImgCache[key]
  // 优先使用 imgMap 中的真实场所图片
  const img = imgMap[key] || genImg(`${key} city skyline landmark travel destination`, 'landscape_4_3')
  tripImgCache[key] = img
  return img
}

// 行程列表（注入图片）
const trips = computed(() => trip.state.myTrips.map(t => ({
  ...t,
  budget: t.cost || t.budget || 0,
  img: t.img || getTripImg(t)
})))

// ===== NaN 修复：所有数值字段都强制 Number() =====
const toNum = (v) => {
  const n = Number(v)
  return isNaN(n) ? 0 : n
}
const budgetTotal = computed(() => {
  const v = toNum(exp.state.budget)
  return v || 8000
})
const budgetSpent = computed(() => {
  const v = toNum(exp.actualTotal)
  return v || 0
})
const budgetRemain = computed(() => Math.max(0, budgetTotal.value - budgetSpent.value))
const budgetPct = computed(() => {
  const t = budgetTotal.value
  if (!t) return 0
  const p = budgetSpent.value / t * 100
  return isNaN(p) ? 0 : Math.min(100, Math.round(p))
})

// 预算分类条（按 category 拆分，无数据时用占位展示效果）
const budgetCats = computed(() => {
  const cats = exp.state.categories || []
  if (Array.isArray(cats) && cats.length) {
    return cats.slice(0, 4).map(c => ({
      label: c.name || '其他',
      val: toNum(c.spent),
      pct: budgetSpent.value ? Math.min(100, Math.round(toNum(c.spent) / budgetSpent.value * 100)) : 0,
      color: c.color || 'linear-gradient(90deg, #2374DD, #4a90e8)'
    }))
  }
  // 后端没数据 → 给一组示例数据展示效果
  const total = budgetSpent.value || 3280
  return [
    { label: '住宿', val: Math.round(total * 0.4), pct: 40, color: 'linear-gradient(90deg, #2374DD, #4a90e8)' },
    { label: '餐饮', val: Math.round(total * 0.25), pct: 25, color: 'linear-gradient(90deg, #0EA5A4, #38bdbb)' },
    { label: '交通', val: Math.round(total * 0.2), pct: 20, color: 'linear-gradient(90deg, #E8912F, #f2b15c)' },
    { label: '门票', val: Math.round(total * 0.15), pct: 15, color: 'linear-gradient(90deg, #e94560, #ff6b81)' }
  ]
})

// 收藏预览
const typeClassMap = { '酒店': 'hotel', '景点': 'spot', '美食': 'food', '路线': 'route' }
const favPreview = computed(() => {
  const all = []
  fav.state.hotels.forEach(h => all.push({ ...h, type: '酒店', typeClass: typeClassMap['酒店'] }))
  fav.state.spots.forEach(s => all.push({ ...s, type: '景点', typeClass: typeClassMap['景点'] }))
  fav.state.foods.forEach(f => all.push({ ...f, type: '美食', typeClass: typeClassMap['美食'] }))
  fav.state.routes.slice(0, 2).forEach(r => all.push({
    name: r.name, img: r.img, rating: null, priceText: null, savedAt: r.savedAt,
    type: '路线', typeClass: typeClassMap['路线']
  }))
  return all.slice(0, 8)
})

// 社区作品
const cmTabs = ['全部作品', '审核中', '已通过', '已驳回']
const cmTab = ref('全部作品')
const statusMap = { approved: '已通过', pending: '审核中', rejected: '已驳回' }
const cmCoverCache = {}
const getPostCover = (p) => {
  if (p.images && Array.isArray(p.images) && p.images[0]) return p.images[0]
  const key = p.title + ''
  if (cmCoverCache[key]) return cmCoverCache[key]
  const img = genImg(p.title + ' travel landscape scenery', 'landscape_4_3')
  cmCoverCache[key] = img
  return img
}
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
    views: p.views || 0,
    coverImg: getPostCover(p)
  }))
})

// 设置
const notifyOn = ref(true)

// 图片错误兜底：换 trae 文生图
const onImgError = (e, kw, size) => {
  e.target.src = genImg((kw || 'travel') + ' landscape scenery', size || 'landscape_4_3')
}

// 3D 卡片倾斜
const tiltCard = (e, idx) => {
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  const rotateY = x * 8
  const rotateX = -y * 8
  card.style.transform = `perspective(800px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateY(-4px)`
}
const resetTilt = (e) => { e.currentTarget.style.transform = '' }

// 滚动入场动画
let observer = null
onMounted(() => {
  nextTick(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view')
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
  })
  document.querySelector('.profile-home')?.scrollTo?.(0, 0)
})
onUnmounted(() => { if (observer) observer.disconnect() })
</script>

<style scoped>
.profile-home {
    height: 100%;
    overflow-y: auto;
    background: linear-gradient(180deg, #f0f4ff 0%, #f5f7fb 30%, #f5f7fb 100%);
    padding: 0 28px 28px;
    scroll-behavior: smooth;
    position: relative;
    perspective: 1200px;
}

/* ===== 3D 漂浮装饰背景层 ===== */
.deco-layer { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
.float-cube { position: absolute; width: 60px; height: 60px; border-radius: 14px; opacity: 0.12; animation: floatCube 20s ease-in-out infinite; }
.float-cube.fc1 { top: 12%; left: 8%; background: linear-gradient(135deg, #2374DD, #4a90e8); transform: rotate(15deg); animation-delay: 0s; }
.float-cube.fc2 { top: 40%; right: 6%; background: linear-gradient(135deg, #0EA5A4, #38bdbb); width: 44px; height: 44px; transform: rotate(-20deg); animation-delay: -5s; }
.float-cube.fc3 { bottom: 18%; left: 12%; background: linear-gradient(135deg, #E8912F, #f2b15c); width: 50px; height: 50px; transform: rotate(30deg); animation-delay: -10s; }
.float-orb { position: absolute; border-radius: 50%; opacity: 0.08; animation: floatOrb 15s ease-in-out infinite; }
.float-orb.orb1 { top: 25%; right: 15%; width: 120px; height: 120px; background: radial-gradient(circle, #2374DD, transparent 70%); animation-delay: 0s; }
.float-orb.orb2 { top: 55%; left: 5%; width: 80px; height: 80px; background: radial-gradient(circle, #0EA5A4, transparent 70%); animation-delay: -7s; }
.float-orb.orb3 { bottom: 10%; right: 20%; width: 100px; height: 100px; background: radial-gradient(circle, #E8912f, transparent 70%); animation-delay: -3s; }
.float-plane { position: absolute; top: 15%; right: 25%; animation: flyPlane 25s linear infinite; }
.float-plane.fp2 { top: 60%; left: 30%; animation: flyPlane2 30s linear infinite; animation-delay: -10s; }
.float-ticket { position: absolute; bottom: 30%; right: 10%; animation: floatTicket 18s ease-in-out infinite; }
@keyframes floatTicket { 0%, 100% { transform: translateY(0) rotate(-8deg); } 50% { transform: translateY(-15px) rotate(8deg); } }
@keyframes floatCube { 0%, 100% { transform: translateY(0) rotate(15deg); } 25% { transform: translateY(-20px) rotate(25deg); } 50% { transform: translateY(-10px) rotate(-10deg); } 75% { transform: translateY(-25px) rotate(20deg); } }
@keyframes floatOrb { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(30px, -20px); } 66% { transform: translate(-20px, 15px); } }
@keyframes flyPlane { 0% { transform: translate(0, 0) rotate(-15deg); opacity: 0.5; } 50% { transform: translate(-200px, 80px) rotate(-15deg); opacity: 0.3; } 100% { transform: translate(-400px, 160px) rotate(-15deg); opacity: 0; } }
@keyframes flyPlane2 { 0% { transform: translate(0, 0) rotate(20deg); opacity: 0; } 30% { opacity: 0.4; } 100% { transform: translate(300px, -120px) rotate(20deg); opacity: 0; } }

/* ===== 顶栏（毛玻璃） ===== */
.ph-topbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 0 14px; position: sticky; top: 0; z-index: 20; background: rgba(245, 247, 251, 0.85); backdrop-filter: blur(12px) saturate(1.2); border-bottom: 1px solid rgba(232, 235, 240, 0.6); }
.ph-top-left { display: flex; align-items: center; gap: 10px; }
.ph-top-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #2374DD, #4a90e8); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 10px rgba(35, 116, 221, 0.25); }
.ph-top-title { font-size: 20px; font-weight: 700; color: var(--text-1); }
.ph-top-bread { margin-left: 4px; font-size: 13px; color: var(--text-3); }
.ph-top-right { display: flex; gap: 6px; }
.ph-top-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; cursor: pointer; color: #566a8a; transition: all 0.2s; position: relative; }
.ph-top-btn:hover { background: rgba(35, 116, 221, 0.1); color: #2374DD; transform: scale(1.08); }
.ph-logout:hover { background: rgba(229, 72, 77, 0.1); color: #E5484D; }
.ph-notify-dot { position: absolute; top: 8px; right: 8px; width: 7px; height: 7px; background: #e94560; border-radius: 50%; box-shadow: 0 0 0 2px #f5f7fb; animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 2px #f5f7fb, 0 0 0 0 rgba(233, 69, 96, 0.4); } 50% { box-shadow: 0 0 0 2px #f5f7fb, 0 0 0 4px rgba(233, 69, 96, 0); } }

/* ===== 主内容栅格 ===== */
.ph-main { display: grid; grid-template-columns: 1.5fr 1fr; gap: 18px; margin-top: 18px; position: relative; z-index: 1; }
.ph-col-main, .ph-col-side { display: flex; flex-direction: column; gap: 18px; }

/* 通用卡片 */
.ph-card {
    position: relative;
    background: linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%);
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    padding: 22px 26px 24px;
    box-shadow: 0 4px 20px rgba(35, 116, 221, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    overflow: hidden;
}
.ph-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, transparent, #2374DD, transparent);
    opacity: 0.6;
}
.ph-card:hover { box-shadow: 0 12px 40px rgba(35, 116, 221, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04); }

.reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; transition-delay: var(--delay, 0s); }
.reveal.in-view { opacity: 1; transform: translateY(0); }

.ph-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; }
.ph-head-title-row { display: flex; align-items: center; gap: 12px; }
.ph-head-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ph-ic-trip { background: linear-gradient(135deg, #2374DD, #4a90e8); box-shadow: 0 4px 12px rgba(35, 116, 221, 0.3); }
.ph-ic-post { background: linear-gradient(135deg, #667eea, #764ba2); box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3); }
.ph-ic-budget { background: linear-gradient(135deg, #E8912F, #f2b15c); box-shadow: 0 4px 12px rgba(232, 145, 47, 0.3); }
.ph-ic-fav { background: linear-gradient(135deg, #e94560, #ff6b81); box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3); }
.ph-head-title { font-size: 16px; font-weight: 700; color: var(--text-1); line-height: 1.2; }
.ph-head-sub { font-size: 12.5px; color: var(--text-3); margin-top: 4px; }
.ph-head-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }

/* 按钮 */
.ph-btn {
    padding: 7px 14px; border-radius: 10px; font-size: 12.5px; font-weight: 500;
    border: 1px solid #e5e9f0; background: #fff; color: #566a8a;
    cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px;
}
.ph-btn:hover { border-color: #2374DD; color: #2374DD; background: #f0f5ff; }
.ph-btn-primary {
    background: linear-gradient(135deg, #2374DD, #4a90e8); color: #fff; border: none;
    box-shadow: 0 4px 12px rgba(35, 116, 221, 0.3);
}
.ph-btn-primary:hover { background: linear-gradient(135deg, #1a64c8, #3a7de0); color: #fff; box-shadow: 0 6px 16px rgba(35, 116, 221, 0.4); transform: translateY(-1px); }
.ph-btn.block { width: 100%; justify-content: center; }

/* ===== 行程卡片 ===== */
.trip-scroll { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x mandatory; }
.trip-scroll::-webkit-scrollbar { height: 6px; }
.trip-scroll::-webkit-scrollbar-thumb { background: linear-gradient(90deg, #2374DD, #0EA5A4); border-radius: 3px; }
.trip-card {
    min-width: 280px; max-width: 280px;
    background: #fff; border-radius: 14px; overflow: hidden;
    border: 1px solid #eef1f6; flex-shrink: 0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
    scroll-snap-align: start;
}
.trip-card:hover { box-shadow: 0 14px 32px rgba(35, 116, 221, 0.18); }

.tc-cover { height: 120px; position: relative; overflow: hidden; }
.tc-cover-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.trip-card:hover .tc-cover-img { transform: scale(1.1); }
.tc-cover-mask { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(35,116,221,0.7) 0%, rgba(14,165,164,0.4) 60%, rgba(0,0,0,0.25) 100%); }
.tc-shine { position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); animation: shine 3s ease-in-out infinite; }
@keyframes shine { 0% { left: -100%; } 50%, 100% { left: 200%; } }

.tc-status { position: absolute; top: 10px; left: 10px; display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 12px; font-size: 11.5px; font-weight: 600; color: #fff; backdrop-filter: blur(4px); z-index: 2; }
.ts-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; box-shadow: 0 0 4px #fff; }
.ts-已完成 { background: rgba(14, 165, 164, 0.85); }
.ts-进行中 { background: rgba(35, 116, 221, 0.85); }
.ts-未出行 { background: rgba(130, 130, 140, 0.75); }

.tc-city-tag { position: absolute; top: 10px; right: 10px; padding: 4px 10px; border-radius: 12px; font-size: 11.5px; font-weight: 500; color: #fff; background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(4px); z-index: 2; }
.tc-deco { position: absolute; bottom: 8px; right: 12px; z-index: 2; animation: floatDeco 4s ease-in-out infinite; }
@keyframes floatDeco { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(8deg); } }
.tc-big-days { position: absolute; bottom: 8px; left: 12px; z-index: 2; color: #fff; line-height: 1; display: flex; flex-direction: column; align-items: flex-start; text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4); }
.tcbd-num { font-size: 26px; font-weight: 800; }
.tcbd-unit { font-size: 9px; font-weight: 600; opacity: 0.9; letter-spacing: 1px; margin-top: 1px; }

.tc-body { padding: 12px 14px 14px; }
.tc-name { font-size: 14.5px; font-weight: 700; color: var(--text-1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tc-route { display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 12.5px; }
.tcr-from, .tcr-to { color: #566a8a; font-weight: 500; }
.tcr-to { color: #2374DD; font-weight: 600; }
.tc-meta { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.tcm-chip { padding: 3px 9px; border-radius: 10px; font-size: 11.5px; font-weight: 500; background: #f2f5fa; color: #566a8a; }
.tcm-people { background: #e8f4fd; color: #2374DD; }
.tcm-budget { background: #fff4e6; color: #E8912F; }
.tc-actions { display: flex; gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #eef1f6; }
.tc-act { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; color: #2374DD; cursor: pointer; transition: all 0.15s; padding: 2px 4px; border-radius: 6px; }
.tc-act:hover { background: #f0f5ff; }
.tc-act.danger { color: #e5484d; }
.tc-act.danger:hover { background: rgba(229, 72, 77, 0.08); }

.trip-empty { width: 100%; text-align: center; padding: 40px 20px; }
.te-emoji { font-size: 36px; }
.te-text { font-size: 14px; font-weight: 600; color: var(--text-1); margin-top: 8px; }
.te-hint { font-size: 12.5px; color: #2374DD; margin-top: 4px; }

/* ===== 预算 ===== */
.pb-stage { position: relative; display: flex; justify-content: center; padding: 8px 0 4px; }
.pb-stage-bg { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
.pb-ring-3d { position: relative; transform-style: preserve-3d; }
.pb-ring { width: 160px; height: 160px; filter: drop-shadow(0 6px 16px rgba(232, 145, 47, 0.25)); }
.pb-ring-anim { transition: stroke-dashoffset 1.2s ease; }
.pb-ring-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
.pb-pct { font-size: 30px; font-weight: 800; color: #E8912F; line-height: 1; background: linear-gradient(135deg, #E8912F, #e94560); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.pb-pct small { font-size: 14px; font-weight: 600; -webkit-text-fill-color: #E8912F; }
.pb-pct-sub { font-size: 11px; color: var(--text-3); margin-top: 4px; letter-spacing: 1px; }

.pb-data { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 14px 0 8px; border-top: 1px solid #eef1f6; border-bottom: 1px solid #eef1f6; margin-top: 8px; }
.pb-item { text-align: center; }
.pb-label { display: block; font-size: 11px; color: var(--text-3); margin-bottom: 4px; }
.pb-val { font-size: 15px; font-weight: 700; color: var(--text-1); }
.pb-val.blue { color: #2374DD; }
.pb-val.green { color: #0EA5A4; }

.pb-cat-bars { display: flex; flex-direction: column; gap: 8px; margin: 8px 0 12px; }
.pb-cat { display: grid; grid-template-columns: 40px 1fr auto; align-items: center; gap: 10px; font-size: 12px; }
.pbc-label { color: #566a8a; font-weight: 500; }
.pbc-track { height: 6px; background: #f2f4f7; border-radius: 3px; overflow: hidden; }
.pbc-fill { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
.pbc-val { font-size: 11.5px; color: var(--text-1); font-weight: 600; min-width: 50px; text-align: right; }
.pb-actions { text-align: center; margin-top: 6px; }

/* ===== 收藏 ===== */
.pf-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.pf-item { cursor: pointer; border-radius: 12px; overflow: hidden; border: 1px solid #eef1f6; transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94); opacity: 0; animation: fadeInUp 0.5s ease forwards; animation-delay: var(--fav-delay, 0s); background: #fff; }
.pf-item:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1); }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.pf-img-wrap { position: relative; overflow: hidden; height: 84px; }
.pf-img { width: 100%; height: 100%; object-fit: cover; background: #f5f7fa; transition: transform 0.3s; }
.pf-item:hover .pf-img { transform: scale(1.1); }
.pf-img-mask { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.4) 100%); }
.pf-type-tag { position: absolute; top: 6px; left: 6px; padding: 2px 8px; border-radius: 8px; font-size: 10.5px; font-weight: 600; color: #fff; backdrop-filter: blur(4px); }
.pt-hotel { background: linear-gradient(135deg, #667eea, #764ba2); }
.pt-spot { background: linear-gradient(135deg, #0EA5A4, #38bdbb); }
.pt-food { background: linear-gradient(135deg, #E8912F, #f2b15c); }
.pt-route { background: linear-gradient(135deg, #2374DD, #4a90e8); }
.pf-rating { position: absolute; bottom: 6px; right: 6px; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 600; color: #fff; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); }
.pf-info { padding: 8px 10px 10px; }
.pf-name { font-size: 12.5px; font-weight: 600; color: var(--text-1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pf-meta { font-size: 11px; color: #2374DD; margin-top: 3px; font-weight: 500; }
.pf-meta.muted { color: var(--text-3); font-weight: 400; }
.pf-empty { grid-column: 1 / -1; text-align: center; padding: 30px; }
.pfe-emoji { font-size: 30px; }
.pfe-text { font-size: 14px; font-weight: 600; color: var(--text-1); margin-top: 6px; }
.pfe-hint { font-size: 12.5px; color: #2374DD; margin-top: 4px; }

/* ===== 社区 ===== */
.cm-tab { padding: 5px 13px; font-size: 12.5px; border-radius: 14px; color: var(--text-3); cursor: pointer; transition: all 0.2s; background: #f2f4f7; }
.cm-tab:hover { color: var(--text-1); }
.cm-tab.active { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; box-shadow: 0 3px 10px rgba(118, 75, 162, 0.3); }
.cm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.cm-card { background: #fff; border: 1px solid #eef1f6; border-radius: 14px; overflow: hidden; transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94); cursor: pointer; }
.cm-card:hover { box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12); transform: translateY(-4px); }
.cm-cover { height: 110px; position: relative; overflow: hidden; }
.cm-cover-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.cm-card:hover .cm-cover-img { transform: scale(1.08); }
.cm-cover-mask { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.4) 100%); }
.cm-shine { position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); transition: left 0.5s; }
.cm-card:hover .cm-shine { left: 200%; }
.cm-status { position: absolute; top: 8px; right: 8px; display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 10px; font-size: 11px; font-weight: 600; color: #fff; backdrop-filter: blur(4px); z-index: 2; }
.cs-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; box-shadow: 0 0 4px #fff; }
.cs-已通过 { background: rgba(14, 165, 164, 0.85); }
.cs-审核中 { background: rgba(232, 145, 47, 0.85); }
.cs-已驳回 { background: rgba(208, 62, 79, 0.85); }
.cm-body { padding: 10px 12px 12px; }
.cm-title { font-size: 13px; font-weight: 600; color: var(--text-1); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 36px; line-height: 1.35; }
.cm-meta { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
.cmm-chip { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; background: #f2f4f7; color: #566a8a; }
.cmm-like { background: #fff0f3; color: #e94560; }
.cmm-comment { background: #e8f4fd; color: #2374DD; }
.cmm-view { background: #f0f5ff; color: #667eea; }
.cm-actions { display: flex; gap: 8px; margin-top: 9px; padding-top: 8px; border-top: 1px dashed #eef1f6; }
.cm-act { font-size: 12px; color: #2374DD; cursor: pointer; padding: 2px 6px; border-radius: 6px; transition: all 0.15s; }
.cm-act:hover { background: #f0f5ff; }
.cm-act.danger { color: #e5484d; }
.cm-act.danger:hover { background: rgba(229, 72, 77, 0.08); }
.cm-empty { grid-column: 1 / -1; text-align: center; padding: 40px 20px; }
.ce-emoji { font-size: 36px; }
.ce-text { font-size: 14px; font-weight: 600; color: var(--text-1); margin-top: 8px; }
.ce-hint { font-size: 12.5px; color: #2374DD; margin-top: 4px; }

/* ===== 底部双卡 ===== */
.ph-foot { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; position: relative; z-index: 1; }
.pfc-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.pfc-icon-wrap { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; }
.pfc-ic-account { background: linear-gradient(135deg, #0EA5A4, #38bdbb); box-shadow: 0 4px 12px rgba(14, 165, 164, 0.3); }
.pfc-ic-setting { background: linear-gradient(135deg, #667eea, #764ba2); box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3); }
.pfc-title { font-size: 16px; font-weight: 700; color: var(--text-1); line-height: 1.2; }
.pfc-sub { font-size: 12.5px; color: var(--text-3); margin-top: 4px; }
.pfc-list { display: flex; flex-direction: column; }
.pfc-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eef1f6; font-size: 13.5px; color: #566a8a; cursor: pointer; transition: all 0.2s; }
.pfc-row:last-child { border-bottom: none; }
.pfc-row:hover { color: #2374DD; padding-left: 6px; }
.pfc-row-label { display: inline-flex; align-items: center; gap: 6px; }
.pfc-row-ic { font-size: 14px; }
.pfc-arrow { color: var(--text-3); font-size: 16px; transition: transform 0.2s; }
.pfc-row:hover .pfc-arrow { transform: translateX(3px); color: #2374DD; }
.pfc-tag { font-size: 11px; padding: 2px 8px; border-radius: 8px; background: #e8f4fd; color: #2374DD; font-weight: 500; }
.pfc-switch { width: 36px; height: 20px; background: #dde3ec; border-radius: 10px; position: relative; cursor: pointer; transition: all 0.25s; }
.pfc-switch.on { background: linear-gradient(135deg, #2374DD, #4a90e8); box-shadow: 0 2px 8px rgba(35, 116, 221, 0.3); }
.pfc-switch::after { content: ''; position: absolute; width: 16px; height: 16px; background: #fff; border-radius: 50%; top: 2px; left: 2px; transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 2px 4px rgba(0,0,0,0.15); }
.pfc-switch.on::after { left: 18px; }

/* 响应式 */
@media (max-width: 1280px) {
    .ph-main { grid-template-columns: 1fr; }
    .cm-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
