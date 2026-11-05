<template>
  <div class="route-tab">
    <!-- 规划表单 -->
    <div class="form-card pc-card">
      <div class="form-grid">
        <div class="form-item">
          <label class="pc-label">出发地</label>
          <input class="pc-input" v-model="local.origin" placeholder="选填，如北京">
        </div>
        <div class="form-item">
          <label class="pc-label">目的地 <span class="req">*</span></label>
          <input class="pc-input" v-model="local.destination" list="city-list" placeholder="选择或输入城市">
          <datalist id="city-list">
            <option v-for="c in cities" :key="c" :value="c"></option>
          </datalist>
        </div>
        <div class="form-item small">
          <label class="pc-label">出行天数 <span class="req">*</span></label>
          <input class="pc-input" type="number" min="1" max="30" v-model="local.travelDays" placeholder="天">
        </div>
        <div class="form-item wide">
          <label class="pc-label">出行偏好</label>
          <div class="pref-row">
            <div
              v-for="p in preferences"
              :key="p"
              class="pref-chip"
              :class="{ active: local.preference === p }"
              @click="local.preference = p"
            >
              {{ p }}
            </div>
          </div>
        </div>
      </div>
      <div class="form-action">
        <button class="pc-btn pc-btn-primary pc-btn-lg" :disabled="isLoading.value" @click="onGenerate">
          {{ isLoading.value ? 'AI 正在生成路线...' : '✨ AI 生成多条路线' }}
        </button>
      </div>
    </div>

    <!-- 路线方案列表 -->
    <div class="plan-list" v-if="state.routes.length">
      <div class="list-head">
        <span>共 {{ state.routes.length }} 套候选方案，点击「使用此方案」确定主行程</span>
        <button class="pc-btn pc-btn-sm list-head-btn" @click="favAllRoutes">
          ⭐ 一键收藏全部方案
        </button>
      </div>

      <div
        v-for="(route, i) in state.routes"
        :key="i"
        class="plan-card"
        :class="{ selected: state.selectedIndex === i }"
      >
        <div class="plan-main">
          <div class="plan-title-row">
            <div class="plan-badge" :class="'badge-' + i">{{ ['A', 'B', 'C'][i] || i }}</div>
            <div class="plan-name">{{ route.routeName }}</div>
            <div class="plan-cost">
              <span class="cost-label">预估人均</span>
              <span class="cost-value">¥{{ route.estimatedCost }}</span>
            </div>
          </div>
          <p class="plan-summary">{{ route.summary }}</p>
          <div class="plan-meta">
            <span class="pc-tag-gray pc-tag">{{ route.dayPlans.length }} 天行程</span>
            <span class="pc-tag" v-for="(t, ti) in route.tags" :key="ti">{{ t }}</span>
          </div>
          <!-- 每日点位速览 -->
          <div class="day-chips">
            <span v-for="day in route.dayPlans" :key="day.dayNo" class="day-chip">
              D{{ day.dayNo }} {{ day.points.map(p => p.name).join(' · ') }}
            </span>
          </div>
        </div>
        <div class="plan-side">
          <button
            class="pc-btn"
            :class="state.selectedIndex === i ? 'selected-btn' : 'pc-btn-primary'"
            @click="onSelect(i)"
          >
            {{ state.selectedIndex === i ? '✓ 主行程' : '使用此方案' }}
          </button>
          <button
            class="pc-btn fav-btn"
            :class="{ 'faved-btn': hasFavRoute(route.routeName) }"
            @click="toggleFavRoute(route)"
            title="收藏到个人方案"
          >
            {{ hasFavRoute(route.routeName) ? '⭐' : '☆' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 空提示 -->
    <div class="route-empty" v-else-if="!isLoading">
      <div class="r-empty-icon">🧭</div>
      <p>填写目的地与天数，AI 将一次生成 2-3 套风格不同的路线供比选</p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useTripStore } from '../../store/tripStore'
import { useFavoriteStore } from '../../store/favoriteStore'
import { generateRoutes } from '../../utils/routeApi'
import toast from '../../utils/msg'

const { state, setRoutes, selectRoute } = useTripStore()
const favorite = useFavoriteStore()

// 本地表单与 store 双向同步：进入页面预填已保存信息
const local = reactive({
    origin: state.form.origin,
    destination: state.form.destination,
    travelDays: state.form.travelDays,
    preference: state.form.preference || '休闲'
})

const preferences = ['休闲', '美食', '小众打卡']
const isLoading = reactive({ value: false })

const cities = [
    '北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆',
    '南京', '武汉', '苏州', '长沙', '青岛', '厦门', '昆明', '三亚', '丽江', '大理'
]

const syncFormToStore = () => {
    state.form.origin = local.origin
    state.form.destination = local.destination
    state.form.travelDays = local.travelDays
    state.form.preference = local.preference
}

const onGenerate = async () => {
    if (!local.destination) { toast.error('请填写目的地'); return }
    if (!local.travelDays || local.travelDays < 1 || local.travelDays > 30) {
        toast.error('出行天数需在 1-30 之间')
        return
    }

    syncFormToStore()
    isLoading.value = true
    try {
        const data = await generateRoutes({
            origin: local.origin,
            destination: local.destination,
            travelDays: Number(local.travelDays),
            preference: local.preference
        })
        setRoutes(data.routeList)
        toast.success(`已生成 ${data.routeList.length} 套路线并自动保存到我的行程`)
    } catch (e) {
        console.error(e)
        toast.error('路线生成失败，请确认后端服务已启动')
    } finally {
        isLoading.value = false
    }
}

const onSelect = (i) => {
    selectRoute(i)
    toast.success(`已选择「${state.routes[i].routeName}」，地图已更新`)
}

const hasFavRoute = (name) => favorite.state.routes.some(r => r.routeData.routeName === name)

const toggleFavRoute = (route) => {
    if (hasFavRoute(route.routeName)) {
        const target = favorite.state.routes.find(r => r.routeData.routeName === route.routeName)
        favorite.removeRoute(target.id)
        toast('已取消收藏')
    } else {
        favorite.addRoute(route, route.routeName)
        toast.success('⭐ 已收藏到个人方案')
    }
}

const favAllRoutes = () => {
    let count = 0
    state.routes.forEach(route => {
        if (!hasFavRoute(route.routeName)) {
            favorite.addRoute(route, route.routeName)
            count++
        }
    })
    toast.success(`⭐ 已收藏 ${count} 套新方案${count === 0 ? '（全部已收藏过）' : ''}`)
}
</script>

<style scoped>
.route-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

/* 表单卡片 */
.form-card {
    padding: 18px;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 130px 1.4fr;
    gap: 14px;
}

.form-item.wide {
    grid-column: span 1;
}

.req {
    color: var(--danger);
}

.pref-row {
    display: flex;
    gap: 8px;
}

.pref-chip {
    flex: 1;
    text-align: center;
    height: 38px;
    line-height: 36px;
    font-size: 13.5px;
    color: var(--text-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.18s ease;
    white-space: nowrap;
}

.pref-chip.active {
    color: var(--brand);
    background: var(--brand-light);
    border-color: var(--brand);
    font-weight: 600;
}

.form-action {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
}

/* 方案列表 */
.list-head {
    font-size: 13px;
    color: var(--text-3);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.list-head-btn {
    font-size: 12.5px;
    color: #f5a623;
    border-color: #f5c04a;
    background: #fff9eb;
}
.list-head-btn:hover { background: #fff3d2; }

.plan-card {
    display: flex;
    gap: 16px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    transition: all 0.2s ease;
}

.plan-card:hover {
    box-shadow: var(--shadow-hover);
}

.plan-card.selected {
    border-color: var(--brand);
    box-shadow: 0 0 0 3px rgba(35, 116, 221, 0.1);
}

.plan-main {
    flex: 1;
    min-width: 0;
}

.plan-title-row {
    display: flex;
    align-items: center;
    gap: 11px;
}

.plan-badge {
    width: 30px;
    height: 30px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    color: #fff;
    flex-shrink: 0;
}

.badge-0 { background: linear-gradient(135deg, #2374DD, #4a90e8); }
.badge-1 { background: linear-gradient(135deg, #0EA5A4, #38bdbb); }
.badge-2 { background: linear-gradient(135deg, #E8912F, #f2b15c); }

.plan-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-1);
}

.plan-cost {
    margin-left: auto;
    display: flex;
    align-items: baseline;
    gap: 6px;
}

.cost-label {
    font-size: 12px;
    color: var(--text-3);
}

.cost-value {
    font-size: 19px;
    font-weight: 700;
    color: var(--brand);
}

.plan-summary {
    font-size: 13.5px;
    color: var(--text-2);
    margin: 10px 0 11px;
}

.plan-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
}

.day-chips {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.day-chip {
    font-size: 12.5px;
    color: var(--text-2);
    background: #f7f9fb;
    border-radius: 7px;
    padding: 7px 11px;
    line-height: 1.5;
}

.plan-side {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.selected-btn {
    color: var(--brand);
    border-color: var(--brand);
    background: var(--brand-light);
    cursor: default;
}

.fav-btn {
    min-width: 34px;
    height: 36px;
    padding: 0 10px;
    font-size: 17px;
    border-color: var(--border);
    background: #fff;
}
.fav-btn:hover { border-color: #f5c04a; color: #f5a623; }
.fav-btn.faved-btn { color: #f5a623; border-color: #f5c04a; background: #fff9eb; }

/* 空态 */
.route-empty {
    padding: 55px 0;
    text-align: center;
}

.r-empty-icon {
    font-size: 44px;
    margin-bottom: 12px;
}

.route-empty p {
    font-size: 13.5px;
    color: var(--text-3);
}
@media (max-width: 900px) {
    .form-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
    .form-item.wide { grid-column: 1 / -1; }
}
</style>
