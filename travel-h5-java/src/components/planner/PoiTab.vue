<template>
  <div class="poi-tab">
    <!-- 无路线空态 -->
    <div class="poi-empty" v-if="!selectedRoute">
      <div class="pe-icon">📍</div>
      <p class="pe-title">尚未选择路线方案</p>
      <p class="pe-sub">请先在「AI 路线规划」中生成并选择一套方案，<br>系统将自动推荐沿途的酒店、景点、餐饮与娱乐场所</p>
    </div>

    <template v-else>
      <!-- 分类筛选 + 刷新 -->
      <div class="poi-toolbar">
        <div class="cat-filter">
          <div
            v-for="c in categories"
            :key="c.key"
            class="cat-pill"
            :class="[{ active: activeCat === c.key }, 'pill-' + c.key]"
            @click="activeCat = c.key"
          >
            <span class="cp-icon" v-html="c.icon"></span>
            {{ c.label }}
          </div>
        </div>
        <button class="pc-btn pc-btn-sm" :disabled="loading" @click="loadPoi(true)">
          {{ loading ? '推荐中...' : '🔄 重新推荐' }}
        </button>
        <button class="pc-btn pc-btn-sm poi-fav-all" @click="favAllPoi" :disabled="!state.poiList.length">
          ⭐ 一键收藏全部
        </button>
      </div>

      <!-- 场所卡片网格 -->
      <div class="poi-grid" v-if="filteredPoi.length">
        <div class="poi-card pc-card" v-for="(poi, i) in filteredPoi" :key="poi.name + i">
          <div class="poi-card-head">
            <span class="poi-cat-tag" :class="'tag-' + poi.category">
              {{ categoryLabel(poi.category) }}
            </span>
            <span class="poi-distance">{{ poi.distance }}</span>
          </div>
          <div class="poi-name">{{ poi.name }}</div>
          <div class="poi-rating">
            <span class="star">★</span> {{ poi.rating }}
            <span class="poi-price">¥{{ poi.refPrice }}{{ poi.category === '酒店' ? '/晚' : '/人' }}</span>
          </div>
          <p class="poi-feature">{{ poi.feature }}</p>
          <p class="poi-reason">{{ poi.reason }}</p>
          <div class="poi-card-foot">
            <button
              class="pc-btn pc-btn-sm"
              :class="isPicked(poi.name) ? 'picked-btn' : 'pc-btn-primary'"
              @click="togglePoi(poi)"
            >
              {{ isPicked(poi.name) ? '✓ 已在行程中' : '添加到行程' }}
            </button>
            <button
              class="pc-btn pc-btn-sm poi-fav"
              :class="{ 'poi-faved': isFavPoi(poi) }"
              @click="toggleFavPoi(poi)"
              title="收藏到个人"
            >
              {{ isFavPoi(poi) ? '⭐ 已收藏' : '☆ 收藏' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 加载骨架 -->
      <div class="poi-grid" v-else-if="loading">
        <div class="poi-card pc-card skeleton-card" v-for="i in 4" :key="i">
          <van-skeleton title :row="4" />
        </div>
      </div>

      <div class="poi-empty small" v-else>
        <p class="pe-sub">该类别暂无推荐，点击「重新推荐」试试</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTripStore } from '../../store/tripStore'
import { useExpenseStore } from '../../store/expenseStore'
import { useFavoriteStore } from '../../store/favoriteStore'
import { recommendPoi } from '../../utils/poiApi'
import toast from '../../utils/msg'

const { state, selectedRoute, routeContext, setPoiList, isPoiPicked, markPoiPicked, unmarkPoiPicked } = useTripStore()
const { addPoiBill, removePoiBill } = useExpenseStore()
const favorite = useFavoriteStore()

const categories = [
    { key: '全部', label: '全部', icon: '🗂️' },
    { key: '酒店', label: '酒店', icon: '🏨' },
    { key: '景点', label: '景点', icon: '⛰️' },
    { key: '餐饮', label: '餐饮', icon: '🍜' },
    { key: '娱乐', label: '娱乐', icon: '🎡' }
]

const activeCat = ref('全部')
const loading = ref(false)

const poiData = computed(() => state.poiList)

const filteredPoi = computed(() => {
    if (activeCat.value === '全部') return poiData.value
    return poiData.value.filter(p => p.category === activeCat.value)
})

const categoryLabel = (key) => {
    const map = { '酒店': '酒店', '景点': '景点', '餐饮': '餐饮', '娱乐': '娱乐' }
    return map[key] || key
}

const isPicked = (name) => isPoiPicked(name)

// 加载推荐：路线切换自动调用，或手动刷新
const loadPoi = async (manual) => {
    if (!state.form.destination || !selectedRoute.value) return
    loading.value = true
    try {
        const key = `${state.form.destination}-${state.selectedIndex}`
        const data = await recommendPoi({
            destination: state.form.destination,
            routeContext: routeContext.value
        })
        setPoiList(data.poiList, key)
        if (manual) toast.success('已按当前路线重新推荐场所')
    } catch (e) {
        console.error(e)
        toast.error('场所推荐失败，请确认后端服务已启动')
    } finally {
        loading.value = false
    }
}

// 添加 / 移除行程：同步账单（预估支出）与地图标记
const togglePoi = (poi) => {
    if (isPicked(poi.name)) {
        removePoiBill(poi.name)
        unmarkPoiPicked(poi.name)
        toast('已从行程中移除')
    } else {
        if (addPoiBill(poi)) {
            markPoiPicked(poi.name)
            toast.success(`已添加，预估支出 ¥${poi.refPrice} 已写入账单`)
        }
    }
}

// 选中路线变化（含初始化恢复）时自动加载；缓存命中则跳过
watch(
    () => [state.selectedIndex, state.routes],
    () => {
        if (!selectedRoute.value) return
        const key = `${state.form.destination}-${state.selectedIndex}`
        if (state.poiKey === key && state.poiList.length) return
        loadPoi(false)
    },
    { immediate: true }
)

// 路线偏离信号：位置变化后提示场所刷新
watch(
    () => state.offRouteSignal,
    (v, old) => {
        if (v > old) {
            toast('位置已偏离，已按接驳点重新匹配周边场所')
            loadPoi(false)
        }
    }
)

// 收藏判断：按 category + name 分组存
const favKey = (poi) => `${poi.category}|${poi.name}`
const isFavPoi = (poi) => {
    if (poi.category === '酒店') return false // 酒店不收藏到景点/美食
    if (poi.category === '景点') return favorite.state.spots.some(s => s.name === poi.name)
    return favorite.state.foods.some(f => f.name === poi.name) // 餐饮/娱乐归到美食
}
const toggleFavPoi = (poi) => {
    if (isFavPoi(poi)) {
        const target = poi.category === '景点'
            ? favorite.state.spots.find(s => s.name === poi.name)
            : favorite.state.foods.find(f => f.name === poi.name)
        if (poi.category === '景点') favorite.removeSpot(target.id)
        else favorite.removeFood(target.id)
        toast('已取消收藏')
    } else {
        const payload = {
            name: poi.name, category: poi.category, distance: poi.distance,
            rating: poi.rating, refPrice: poi.refPrice, feature: poi.feature, reason: poi.reason
        }
        if (poi.category === '景点') favorite.addSpot(payload)
        else favorite.addFood(payload)
        toast.success('⭐ 已收藏到个人收藏')
    }
}

const favAllPoi = () => {
    let spotCount = 0, foodCount = 0
    state.poiList.forEach(p => {
        if (p.category === '景点') {
            if (!favorite.state.spots.some(s => s.name === p.name)) {
                favorite.addSpot({ name: p.name, category: p.category, rating: p.rating, priceText: ('¥' + p.refPrice), feature: p.feature })
                spotCount++
            }
        } else {
            if (!favorite.state.foods.some(f => f.name === p.name)) {
                favorite.addFood({ name: p.name, category: p.category, distance: p.distance, rating: p.rating, refPrice: p.refPrice, priceText: ('¥' + p.refPrice), feature: p.feature })
                foodCount++
            }
        }
    })
    toast.success(`⭐ 已收藏 ${spotCount + foodCount} 条（景点 ${spotCount} · 美食 ${foodCount}）`)
}
</script>

<style scoped>
.poi-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

/* 空态 */
.poi-empty {
    padding: 52px 0;
    text-align: center;
}

.poi-empty.small {
    padding: 35px 0;
}

.pe-icon {
    font-size: 42px;
}

.pe-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-1);
    margin: 12px 0 6px;
}

.pe-sub {
    font-size: 13px;
    color: var(--text-3);
    line-height: 1.8;
}

/* 工具栏 */
.poi-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.cat-filter {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.cat-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 34px;
    padding: 0 14px;
    font-size: 13.5px;
    color: var(--text-2);
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 18px;
    cursor: pointer;
    transition: all 0.18s ease;
}

.cat-pill:hover {
    color: var(--brand);
    border-color: #b9d2f2;
}

.cat-pill.active {
    color: #fff;
    border-color: transparent;
}

.cp-icon {
    font-size: 13px;
}

.pill-全部.active { background: var(--brand); }
.pill-酒店.active { background: var(--cat-hotel); }
.pill-景点.active { background: var(--cat-view); }
.pill-餐饮.active { background: var(--cat-food); }
.pill-娱乐.active { background: var(--cat-fun); }

/* 卡片网格 */
.poi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 13px;
}

.poi-card {
    padding: 15px 16px;
    display: flex;
    flex-direction: column;
}

.poi-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 9px;
}

.poi-cat-tag {
    font-size: 12px;
    padding: 2px 9px;
    border-radius: 6px;
    font-weight: 500;
}

.tag-酒店 { background: var(--brand-light); color: var(--cat-hotel); }
.tag-景点 { background: var(--warning-bg); color: var(--cat-view); }
.tag-餐饮 { background: var(--danger-bg); color: var(--cat-food); }
.tag-娱乐 { background: #f0ebfe; color: var(--cat-fun); }

.poi-distance {
    font-size: 12px;
    color: var(--text-3);
}

.poi-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-1);
}

.poi-rating {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 7px;
    font-size: 13.5px;
    color: var(--text-1);
    font-weight: 600;
}

.star {
    color: #f5a623;
}

.poi-price {
    margin-left: auto;
    font-size: 13px;
    color: var(--text-2);
    font-weight: 600;
}

.poi-feature {
    font-size: 13px;
    color: var(--text-2);
    margin-top: 9px;
    line-height: 1.55;
}

.poi-reason {
    font-size: 12px;
    color: var(--text-3);
    margin-top: 4px;
    line-height: 1.5;
}

.poi-card-foot {
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.picked-btn {
    color: var(--brand);
    border-color: var(--brand);
    background: var(--brand-light);
}

.poi-fav {
    background: #fff;
    color: var(--text-2);
}
.poi-fav:hover { color: #f5a623; border-color: #f5c04a; }
.poi-fav.poi-faved {
    color: #f5a623;
    border-color: #f5c04a;
    background: #fff9eb;
}

.skeleton-card {
    padding: 16px;
}
</style>
