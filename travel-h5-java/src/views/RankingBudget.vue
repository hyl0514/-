<template>
  <div class="rank-page">
    <!-- 头部 -->
    <header class="page-header">
      <div>
        <h1 class="page-title">榜单 &amp; 预算</h1>
        <p class="page-desc">查看目的地热门榜单与真实评论，管理出行预算方案</p>
      </div>
    </header>

    <!-- 一级 Tab -->
    <div class="main-tabs pc-card">
      <div
        class="mt-item"
        :class="{ active: topTab === 'budget' }"
        @click="topTab = 'budget'"
      >
        💰 基础预算管理
      </div>
      <div
        class="mt-item"
        :class="{ active: topTab === 'rank' }"
        @click="topTab = 'rank'"
      >
        🏆 排行榜与评论
      </div>
    </div>

    <!-- ============ Tab1：预算管理 ============ -->
    <div v-if="topTab === 'budget'" class="budget-wrap">
      <div class="budget-top">
        <!-- 预算设置 -->
        <div class="set-card pc-card">
          <div class="set-title">本次出行预算</div>
          <div class="budget-field">
            <span class="yuan">¥</span>
            <input class="big-budget" type="number" min="0" v-model.number="state.budget">
          </div>
          <p class="set-sub">与「行程规划 → 花销记账」实时同步</p>

          <div class="save-row">
            <input class="pc-input" v-model="planName" placeholder="为本次方案命名，如 成都5日行">
            <button class="pc-btn pc-btn-primary" @click="onSavePlan">保存预算方案</button>
          </div>
        </div>

        <!-- 预算概览 -->
        <div class="overview-card pc-card">
          <div class="ov-title">花销概览</div>
          <div class="ov-row">
            <span class="ov-label">预估总花费</span>
            <span class="ov-val gray">¥{{ estimatedTotal }}</span>
          </div>
          <div class="ov-row">
            <span class="ov-label">实际已花费</span>
            <span class="ov-val dark">¥{{ actualTotal }}</span>
          </div>
          <div class="ov-row">
            <span class="ov-label">剩余可支配</span>
            <span class="ov-val" :class="isOverrun ? 'red' : 'green'">
              {{ isOverrun ? '-' : '' }}¥{{ Math.abs(remaining) }}
            </span>
          </div>

          <!-- 轻量预警 -->
          <div class="warn-box" :class="isOverrun ? 'w-red' : usagePercent >= 85 ? 'w-orange' : 'w-green'">
            <template v-if="isOverrun">
              ⚠️ 实际花费已超过预算 ¥{{ Math.abs(remaining) }}，建议暂停非必要消费
            </template>
            <template v-else-if="usagePercent >= 85">
              💡 花销已接近预算上限（{{ usagePercent }}%），后续支出建议量力而行
            </template>
            <template v-else>
              ✅ 当前花销处于预算合理区间（{{ usagePercent }}%）
            </template>
          </div>
        </div>
      </div>

      <!-- 历史预算方案 -->
      <div class="history-card pc-card">
        <div class="hist-head">
          <span class="hist-title">历史预算方案</span>
          <span class="hist-count">{{ state.planHistory.length }} 份</span>
        </div>
        <div class="hist-table" v-if="state.planHistory.length">
          <div class="ht-th">
            <span>方案名称</span>
            <span>总预算</span>
            <span>账单数</span>
            <span>保存日期</span>
            <span>操作</span>
          </div>
          <div class="ht-row" v-for="p in state.planHistory" :key="p.id">
            <span class="hp-name">{{ p.destination }}</span>
            <span>¥{{ p.budget }}</span>
            <span>{{ p.billCount }} 条</span>
            <span>{{ p.savedAt }}</span>
            <span class="op-link danger" @click="onRemovePlan(p.id)">删除</span>
          </div>
        </div>
        <div class="hist-empty" v-else>暂无历史方案，保存后可随时调取对比</div>
      </div>
    </div>

    <!-- ============ Tab2：排行榜 ============ -->
    <div v-else class="rank-wrap">
      <!-- 城市输入 -->
      <div class="search-card pc-card">
        <input class="pc-input city-input" list="rank-city" v-model="rankCity" placeholder="输入目的地城市，如 成都"
          @keyup.enter="loadRank">
        <datalist id="rank-city">
          <option v-for="c in cities" :key="c" :value="c"></option>
        </datalist>
        <button class="pc-btn pc-btn-primary" @click="loadRank">查看榜单</button>
      </div>

      <template v-if="rankList.length">
        <!-- 二级 Tab -->
        <div class="sub-tabs">
          <div
            v-for="c in rankCats"
            :key="c"
            class="sub-item"
            :class="[{ active: rankCat === c }, 'si-' + c]"
            @click="switchCat(c)"
          >
            {{ catIcon[c] }} {{ c }}排行榜
          </div>
        </div>

        <!-- 榜单卡片 -->
        <div class="rank-list">
          <div
            v-for="item in rankList"
            :key="item.rank"
            class="rank-card pc-card"
            @click="openComments(item)"
          >
            <div class="rank-no" :class="medalClass(item.rank)">{{ item.rank }}</div>
            <div class="rank-main">
              <div class="rank-name">{{ item.name }}</div>
              <div class="rank-tags">
                <span class="pc-tag pc-tag-gray" v-for="(t, i) in item.tags" :key="i">{{ t }}</span>
              </div>
            </div>
            <div class="rank-right">
              <div class="rank-rating">
                <span class="star">★</span> {{ item.rating }}
              </div>
              <div class="rank-price">{{ item.priceText }}</div>
              <button
                class="rk-fav"
                :class="{ 'rk-faved': isFavRank(item) }"
                @click.stop="toggleFavRank(item)"
                title="收藏"
              >
                {{ isFavRank(item) ? '⭐' : '☆' }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- 空态 -->
      <div class="rank-empty" v-else>
        <div class="re-emoji">🏆</div>
        <p>输入城市后即可查看景点、美食、酒店 TOP10 榜单</p>
      </div>
    </div>

    <!-- 评论弹窗 -->
    <teleport to="body">
      <div class="pc-mask" v-if="commentModal.show" @click.self="commentModal.show = false">
        <div class="pc-modal comment-modal">
          <div class="pc-modal-header">
            <div class="cm-head">
              <span class="pc-modal-title">{{ commentModal.item?.name }}</span>
              <span class="cm-rating">★ {{ commentModal.item?.rating }}</span>
            </div>
            <span class="pc-modal-close" @click="commentModal.show = false">✕</span>
          </div>
          <div class="pc-modal-body">
            <!-- 关键词摘要 -->
            <div class="kw-box">
              <span class="kw-label">评论关键词</span>
              <span class="kw-chip" v-for="k in commentModal.item?.keywords" :key="k">{{ k }}</span>
            </div>

            <!-- 分页评论 -->
            <div class="comment-list">
              <div class="comment-item" v-for="c in pagedComments" :key="c.id">
                <div class="c-head">
                  <span class="c-user">{{ c.reviewer }}</span>
                  <span class="c-date">{{ c.date }}</span>
                </div>
                <p class="c-text">{{ c.content }}</p>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pager">
              <button class="pg-btn" :disabled="commentPage === 1" @click="commentPage--">上一页</button>
              <span class="pg-info">{{ commentPage }} / {{ totalCommentPages }}</span>
              <button class="pg-btn" :disabled="commentPage === totalCommentPages" @click="commentPage++">下一页</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { getRanking } from '../utils/rankData'
import { useExpenseStore } from '../store/expenseStore'
import { useTripStore } from '../store/tripStore'
import { useFavoriteStore } from '../store/favoriteStore'
import toast from '../utils/msg'

const {
    state,
    estimatedTotal,
    actualTotal,
    remaining,
    usagePercent,
    isOverrun,
    savePlan,
    removePlan
} = useExpenseStore()

const { state: tripState } = useTripStore()

const topTab = ref('budget')

const cities = [
    '北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆',
    '南京', '武汉', '苏州', '长沙', '青岛', '厦门', '昆明', '三亚', '丽江', '大理'
]

// ---------------- 预算方案 ----------------

const planName = ref('')

const onSavePlan = () => {
    if (!state.budget || state.budget <= 0) { toast.error('请先填写有效的总预算'); return }
    savePlan(planName.value.trim() || tripState.form.destination)
    planName.value = ''
    toast.success('预算方案已保存')
}

const onRemovePlan = (id) => {
    removePlan(id)
    toast('方案已删除')
}

// ---------------- 排行榜 ----------------

const rankCity = ref(tripState.form.destination || '')
const rankCat = ref('景点')
const rankCats = ['景点', '美食', '酒店']
const catIcon = { 景点: '⛰️', 美食: '🍜', 酒店: '🏨' }
const rankList = ref([])

const loadRank = () => {
    if (!rankCity.value.trim()) { toast.error('请输入城市名'); return }
    rankList.value = getRanking(rankCity.value.trim(), rankCat.value)
    toast.success(`已加载 ${rankCity.value} · ${rankCat} TOP10`)
}

const switchCat = (c) => {
    rankCat.value = c
    if (rankCity.value.trim()) rankList.value = getRanking(rankCity.value.trim(), c)
}

const medalClass = (rank) => {
    if (rank === 1) return 'gold'
    if (rank === 2) return 'silver'
    if (rank === 3) return 'bronze'
    return ''
}

// 若已有目的地，进入页面即展示榜单
if (rankCity.value) {
    rankList.value = getRanking(rankCity.value, rankCat.value)
}

// ---------------- 评论弹窗 + 分页 ----------------

const PAGE_SIZE = 5
const commentModal = reactive({ show: false, item: null })
const commentPage = ref(1)

const totalCommentPages = computed(() =>
    Math.ceil((commentModal.item?.comments.length || 0) / PAGE_SIZE)
)

const pagedComments = computed(() => {
    const all = commentModal.item?.comments || []
    const start = (commentPage.value - 1) * PAGE_SIZE
    return all.slice(start, start + PAGE_SIZE)
})

const openComments = (item) => {
    commentModal.item = item
    commentPage.value = 1
    commentModal.show = true
}

// 榜单收藏
const favStore = useFavoriteStore()
const isFavRank = (item) => {
    if (rankCat.value === '景点') return favStore.state.spots.some(s => s.name === item.name)
    return favStore.state.foods.some(f => f.name === item.name)
}
const toggleFavRank = (item) => {
    if (isFavRank(item)) {
        const target = rankCat.value === '景点'
            ? favStore.state.spots.find(s => s.name === item.name)
            : favStore.state.foods.find(f => f.name === item.name)
        if (rankCat.value === '景点') favStore.removeSpot(target.id)
        else favStore.removeFood(target.id)
        toast('已取消收藏')
    } else {
        if (rankCat.value === '景点') favStore.addSpot({ ...item })
        else favStore.addFood({ ...item })
        toast.success('⭐ 已收藏到个人收藏')
    }
}
</script>

<style scoped>
.rank-page {
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

/* 一级 Tab */
.main-tabs {
    display: inline-flex;
    padding: 5px;
    gap: 4px;
    background: #fff;
    border-radius: 11px;
    margin-bottom: 18px;
}

.mt-item {
    padding: 9px 22px;
    font-size: 14px;
    color: var(--text-2);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.18s ease;
}

.mt-item.active {
    background: var(--brand);
    color: #fff;
    font-weight: 600;
}

/* -------- 预算页 -------- */

.budget-wrap {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.budget-top {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.set-card,
.overview-card {
    padding: 22px;
}

.set-title,
.ov-title,
.hist-title {
    font-size: 15px;
    font-weight: 700;
}

.budget-field {
    display: flex;
    align-items: baseline;
    gap: 7px;
    margin: 15px 0 6px;
}

.yuan {
    font-size: 22px;
    font-weight: 700;
    color: var(--brand);
}

.big-budget {
    border: none;
    outline: none;
    font-size: 38px;
    font-weight: 700;
    color: var(--brand);
    width: 100%;
    font-family: inherit;
}

.set-sub {
    font-size: 12.5px;
    color: var(--text-3);
    padding-bottom: 17px;
    border-bottom: 1px solid var(--divider);
}

.save-row {
    display: flex;
    gap: 11px;
    margin-top: 17px;
}

.save-row .pc-input {
    flex: 1;
}

.ov-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 13px 0;
    border-bottom: 1px solid var(--divider);
}

.ov-label {
    font-size: 13.5px;
    color: var(--text-2);
}

.ov-val {
    font-size: 19px;
    font-weight: 700;
}

.ov-val.gray { color: var(--text-3); }
.ov-val.dark { color: var(--text-1); }
.ov-val.red { color: var(--danger); }
.ov-val.green { color: var(--success); }

/* 预警条 */
.warn-box {
    margin-top: 17px;
    border-radius: 9px;
    padding: 13px 15px;
    font-size: 13px;
    line-height: 1.6;
}

.w-green {
    background: var(--success-bg);
    color: var(--success);
}

.w-orange {
    background: var(--warning-bg);
    color: var(--warning);
}

.w-red {
    background: var(--danger-bg);
    color: var(--danger);
}

/* 历史表 */
.history-card {
    padding: 18px 22px 8px;
}

.hist-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
}

.hist-count {
    font-size: 12.5px;
    color: var(--text-3);
}

.ht-th,
.ht-row {
    display: grid;
    grid-template-columns: 1.6fr 1fr 1fr 1fr 70px;
    gap: 10px;
    padding: 12px 6px;
    font-size: 13.5px;
}

.ht-th {
    font-size: 12.5px;
    color: var(--text-3);
    border-bottom: 1px solid var(--divider);
}

.ht-row {
    border-bottom: 1px solid var(--divider);
}

.hp-name {
    font-weight: 600;
    color: var(--text-1);
}

.op-link {
    color: var(--brand);
    cursor: pointer;
}

.op-link.danger {
    color: var(--text-3);
}

.op-link.danger:hover {
    color: var(--danger);
}

.hist-empty {
    text-align: center;
    color: var(--text-3);
    font-size: 13px;
    padding: 28px 0;
}

/* -------- 榜单页 -------- */

.rank-wrap {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.search-card {
    display: flex;
    gap: 11px;
    padding: 15px;
}

.city-input {
    flex: 1;
}

.sub-tabs {
    display: flex;
    gap: 10px;
}

.sub-item {
    padding: 9px 21px;
    font-size: 14px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 9px;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.18s ease;
}

.sub-item.active {
    color: #fff;
    border-color: transparent;
}

.si-景点.active { background: var(--cat-view); }
.si-美食.active { background: var(--cat-food); }
.si-酒店.active { background: var(--cat-hotel); }

.rank-list {
    display: flex;
    flex-direction: column;
    gap: 11px;
}

.rank-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    cursor: pointer;
    transition: all 0.18s ease;
}

.rank-card:hover {
    box-shadow: var(--shadow-hover);
}

.rank-no {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 15px;
    color: var(--text-3);
    background: #f2f4f7;
    flex-shrink: 0;
}

.rank-no.gold { background: linear-gradient(135deg, #f7c948, #f0b429); color: #fff; }
.rank-no.silver { background: linear-gradient(135deg, #c2c8d0, #9aa3ad); color: #fff; }
.rank-no.bronze { background: linear-gradient(135deg, #d8a67a, #c08a5a); color: #fff; }

.rank-main {
    flex: 1;
    min-width: 0;
}

.rank-name {
    font-size: 15.5px;
    font-weight: 700;
    color: var(--text-1);
}

.rank-tags {
    display: flex;
    gap: 7px;
    margin-top: 8px;
}

.rank-price {
    font-size: 12.5px;
    color: var(--text-3);
    margin-top: 5px;
}

.rk-fav {
    margin-top: 6px;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--text-3);
    font-size: 16px;
    cursor: pointer;
    padding: 0;
    border-radius: 7px;
    transition: all 0.15s;
}
.rk-fav:hover { color: #f5a623; background: #fff9eb; }
.rk-fav.rk-faved { color: #f5a623; }

.rank-right {
    text-align: right;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.rank-empty {
    text-align: center;
    padding: 60px 0;
}

.re-emoji {
    font-size: 46px;
}

.rank-empty p {
    margin-top: 13px;
    font-size: 13.5px;
    color: var(--text-3);
}

/* 评论弹窗 */
.comment-modal {
    width: 560px;
}

.cm-head {
    display: flex;
    align-items: center;
    gap: 12px;
}

.cm-rating {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-1);
}

.kw-box {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--divider);
}

.kw-label {
    font-size: 13px;
    color: var(--text-3);
}

.kw-chip {
    font-size: 12.5px;
    color: var(--brand);
    background: var(--brand-light);
    padding: 3px 11px;
    border-radius: 13px;
}

.comment-list {
    margin-top: 5px;
}

.comment-item {
    padding: 14px 2px;
    border-bottom: 1px solid var(--divider);
}

.c-head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 7px;
}

.c-user {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-1);
}

.c-date {
    font-size: 12px;
    color: var(--text-3);
}

.c-text {
    font-size: 13.5px;
    color: var(--text-2);
    line-height: 1.7;
    margin: 0;
}

/* 分页 */
.pager {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding-top: 17px;
}

.pg-btn {
    height: 33px;
    padding: 0 16px;
    border: 1px solid var(--border);
    background: #fff;
    border-radius: 8px;
    color: var(--text-2);
    cursor: pointer;
    font-size: 13px;
}

.pg-btn:hover:not(:disabled) {
    color: var(--brand);
    border-color: var(--brand);
}

.pg-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pg-info {
    font-size: 13px;
    color: var(--text-2);
    min-width: 55px;
    text-align: center;
}
</style>
