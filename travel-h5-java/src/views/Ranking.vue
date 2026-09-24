<template>
  <div class="rank-page">
    <!-- 头部 -->
    <header class="page-header">
      <div>
        <h1 class="page-title">目的地榜单推荐</h1>
        <p class="page-desc">AI 基于真实游客评论自动划分红榜 / 黑榜，帮您避开踩坑、直选好评</p>
      </div>
    </header>

    <!-- 城市搜索 -->
    <div class="search-card pc-card">
      <input class="pc-input city-input" list="rank-city" v-model="city" placeholder="输入目的地城市，如 成都" @keyup.enter="loadBoard">
      <datalist id="rank-city">
        <option v-for="c in cities" :key="c" :value="c"></option>
      </datalist>
      <button class="pc-btn pc-btn-primary" @click="loadBoard">查询榜单</button>
    </div>

    <!-- 三大并列榜单区块：酒店 / 美食 / 景点 -->
    <div class="board-grid" v-if="loaded">
      <section class="board-section pc-card" v-for="b in boards" :key="b.key">
        <!-- 区块头：类别 + 红黑榜切换 -->
        <div class="board-head">
          <div class="bh-title">
            <span class="bh-ico">{{ b.icon }}</span> {{ b.label }}榜单
          </div>
          <div class="bh-tabs">
            <span class="bh-tab tab-red" :class="{ active: b.view === 'red' }" @click="b.view = 'red'">✅ 红榜</span>
            <span class="bh-tab tab-black" :class="{ active: b.view === 'black' }" @click="b.view = 'black'">❌ 黑榜</span>
          </div>
        </div>
        <p class="bh-desc">{{ b.view === 'red' ? '综合热度 · 高分好评场所推荐' : '差评较多 · 踩坑高发场所避雷' }}</p>

        <!-- 榜单条目 -->
        <div class="board-list">
          <div
            v-for="item in b[b.view]"
            :key="item.id"
            class="board-item"
            :class="{ picked: isSelected(item) }"
            @click="openDetail(item)"
          >
            <!-- 复选框：加入对比 / 收藏 -->
            <span
              class="pc-check"
              :class="{ checked: isSelected(item) }"
              @click.stop="toggleSelect(item, b.key)"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M4 12.5l5 5L20 6.5" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>

            <!-- 排名 -->
            <div class="rank-no" :class="'no-' + item.board">{{ item.rank }}</div>

            <!-- 场所缩略图 -->
            <img class="bi-thumb" :src="item.img" :alt="item.name" @error="onImgError($event)">

            <!-- 主信息 -->
            <div class="bi-main">
              <div class="bi-name-row">
                <span class="bi-name">{{ item.name }}</span>
                <span v-if="isFavItem(item)" class="bi-faved" title="已收藏">⭐</span>
              </div>
              <div class="bi-tags">
                <span class="bi-tag" :class="'tag-' + item.board" v-for="t in item.tags" :key="t">{{ t }}</span>
              </div>
              <!-- AI 口碑摘要 -->
              <p class="bi-summary">{{ item.summary }}</p>
            </div>

            <!-- 评分 / 价格 -->
            <div class="bi-side">
              <div class="bi-rating" :class="item.board === 'red' ? 'rate-good' : 'rate-bad'">
                <span class="star">★</span> {{ item.rating }}
              </div>
              <div class="bi-price">{{ item.priceText }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 空态 -->
    <div class="rank-empty" v-else>
      <div class="re-emoji">🏆</div>
      <p>输入城市并查询，AI 将同时生成酒店、美食、景点的红榜与黑榜</p>
    </div>

    <!-- 底部固定操作栏 -->
    <div class="float-bar" v-if="loaded">
      <div class="fb-selected">
        <span class="fb-count" :class="{ full: selected.length >= 3 }">{{ selected.length }}/3</span>
        <span class="fb-hint">已选对比项（可跨类别混选）</span>
        <template v-if="selected.length">
          <span class="fb-chip" v-for="s in selected" :key="s.key + s.name">{{ s.name }}</span>
        </template>
      </div>
      <div class="fb-actions">
        <button class="pc-btn pc-btn-sm" :disabled="!selected.length" @click="clearSelected">🗑 清空已选</button>
        <button class="pc-btn pc-btn-sm fb-fav" :disabled="!selected.length" @click="addToFavorites">
          ⭐ 添加到收藏
        </button>
        <button class="pc-btn pc-btn-sm pc-btn-primary" :disabled="selected.length < 2" @click="startCompare">
          ⚖ 开始对比
        </button>
      </div>
    </div>

    <!-- 详情下钻弹窗 -->
    <teleport to="body">
      <div class="pc-mask" v-if="detail.show" @click.self="detail.show = false">
        <div class="pc-modal detail-modal">
          <div class="pc-modal-header">
            <div class="dm-head">
              <span class="pc-modal-title">{{ detail.item?.name }}</span>
              <span class="dm-board" :class="'db-' + detail.item?.board">
                {{ detail.item?.board === 'red' ? '✅ 红榜' : '❌ 黑榜' }}
              </span>
            </div>
            <span class="pc-modal-close" @click="detail.show = false">✕</span>
          </div>
          <div class="pc-modal-body dm-body">
            <!-- 场所图片画廊：主图可点击切换 -->
            <template v-if="detail.item">
              <img
                v-if="!detailImgFailed"
                class="dm-img"
                :src="detailImg"
                alt=""
                @error="detailImgFailed = true"
              >
              <div class="dm-thumbs" v-if="galleryList.length > 1">
                <img
                  v-for="(g, gi) in galleryList"
                  :key="gi"
                  class="dm-thumb"
                  :class="{ active: detailImg === g }"
                  :src="g"
                  alt=""
                  @click="detailImg = g"
                >
              </div>

              <!-- 基础信息 -->
              <div class="dm-meta-row">
                <span class="dm-rate" :class="detail.item.board === 'red' ? 'rate-good' : 'rate-bad'">
                  <span class="star">★</span> {{ detail.item.rating }}
                </span>
                <span class="dm-price">{{ detail.item.priceText }}</span>
                <span class="dm-loc">📍 {{ detail.item.address }}</span>
              </div>

              <!-- 实用信息：开放时间 / 建议时长 / 交通 -->
              <div class="dm-info-row">
                <span class="dm-info">🕘 {{ detail.item.openTime }}</span>
                <span class="dm-info">⏱ {{ detail.item.duration }}</span>
                <span class="dm-info">🚇 {{ detail.item.traffic }}</span>
              </div>
            </template>
            <p class="dm-intro">{{ detail.item?.intro }}</p>

            <!-- AI 整体评论总结 -->
            <div class="dm-ai" :class="'ai-' + detail.item?.board">
              <div class="dm-ai-title">🤖 AI 整体评论总结</div>
              <p class="dm-ai-text">{{ detail.item?.aiConclusion }}</p>
            </div>

            <!-- 关键词 -->
            <div class="dm-kw-box" v-if="detail.item">
              <span class="kw-label">评论关键词</span>
              <span class="kw-chip" :class="'kw-' + detail.item.board" v-for="k in detail.item.keywords" :key="k">{{ k }}</span>
            </div>

            <!-- 分页原始评论 -->
            <div class="dm-label">💬 原始用户评论 ({{ detail.item?.comments.length }})</div>
            <div class="comment-list">
              <div class="comment-item" v-for="c in pagedComments" :key="c.id">
                <div class="c-head">
                  <span class="c-user">{{ c.reviewer }}</span>
                  <span class="c-date">{{ c.date }}</span>
                </div>
                <p class="c-text">{{ c.content }}</p>
              </div>
            </div>
            <div class="pager">
              <button class="pg-btn" :disabled="cmtPage === 1" @click="cmtPage--">上一页</button>
              <span class="pg-info">{{ cmtPage }} / {{ totalCmtPages }}</span>
              <button class="pg-btn" :disabled="cmtPage === totalCmtPages" @click="cmtPage++">下一页</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 对比弹窗 -->
    <teleport to="body">
      <div class="pc-mask" v-if="compareShow" @click.self="compareShow = false">
        <div class="pc-modal compare-modal">
          <div class="pc-modal-header">
            <span class="pc-modal-title">⚖ 多项目横向对比（{{ selected.length }} 项）</span>
            <span class="pc-modal-close" @click="compareShow = false">✕</span>
          </div>
          <div class="pc-modal-body cmp-body">
            <div class="cmp-grid" :style="{ gridTemplateColumns: '92px repeat(' + selected.length + ', 1fr)' }">
              <!-- 表头：项目名称 -->
              <div class="cmp-cell cmp-head-cell">对比项</div>
              <div class="cmp-cell cmp-head-cell" v-for="s in selected" :key="s.key + s.name">
                <div class="cmp-cat" :class="'cc-' + s.key">{{ catLabel(s.key) }}</div>
                <div class="cmp-name">{{ s.name }}</div>
              </div>

              <!-- 评分 -->
              <div class="cmp-cell cmp-field">综合评分</div>
              <div class="cmp-cell" v-for="s in selected" :key="'r-' + s.key + s.name">
                <span class="cmp-rate" :class="s.item.board === 'red' ? 'rate-good' : 'rate-bad'">★ {{ s.item.rating }}</span>
              </div>

              <!-- 参考价格 -->
              <div class="cmp-cell cmp-field">参考价格</div>
              <div class="cmp-cell" v-for="s in selected" :key="'p-' + s.key + s.name">{{ s.item.priceText }}</div>

              <!-- 位置 -->
              <div class="cmp-cell cmp-field">位置</div>
              <div class="cmp-cell" v-for="s in selected" :key="'l-' + s.key + s.name">{{ s.item.location }}</div>

              <!-- AI 口碑 -->
              <div class="cmp-cell cmp-field">AI 口碑</div>
              <div class="cmp-cell cmp-summary" v-for="s in selected" :key="'s-' + s.key + s.name">{{ s.item.summary }}</div>

              <!-- 优点 -->
              <div class="cmp-cell cmp-field">优点</div>
              <div class="cmp-cell" v-for="s in selected" :key="'pro-' + s.key + s.name">
                <span class="cmp-pro" v-for="p in s.item.pros" :key="p">+ {{ p }}</span>
              </div>

              <!-- 缺点 -->
              <div class="cmp-cell cmp-field">缺点</div>
              <div class="cmp-cell" v-for="s in selected" :key="'con-' + s.key + s.name">
                <span class="cmp-con" v-for="c in s.item.cons" :key="c">- {{ c }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { getCityBoard, fetchRealSeeds } from '../utils/rankData'
import { useTripStore } from '../store/tripStore'
import { useFavoriteStore } from '../store/favoriteStore'
import toast from '../utils/msg'

const { state: tripState } = useTripStore()
const favStore = useFavoriteStore()

const cities = [
    '北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆',
    '南京', '武汉', '苏州', '长沙', '青岛', '厦门', '昆明', '三亚', '丽江', '大理'
]

// ---------------- 三大榜单数据 ----------------
// 默认城市：优先取行程目的地，无则用南昌，保证页面一进来就有榜单内容
const city = ref(tripState.form.destination || '南昌')
const loaded = ref(false)
const loading = ref(false)
const boards = reactive([
    { key: 'hotel', label: '酒店', icon: '🏨', view: 'red', red: [], black: [] },
    { key: 'food', label: '美食', icon: '🍜', view: 'red', red: [], black: [] },
    { key: 'spot', label: '景点', icon: '⛰️', view: 'red', red: [], black: [] }
])

const loadBoard = async () => {
    const c = city.value.trim()
    if (!c) { toast.error('请输入城市名'); return }
    loading.value = true
    // 先尝试数据库（真实场所 + 真实照片），失败/无数据则走本地种子
    const fromDb = await fetchRealSeeds(c)
    const data = getCityBoard(c)
    boards.forEach(b => {
        b.red = data[b.key].red
        b.black = data[b.key].black
    })
    loaded.value = true
    loading.value = false
    toast.success(fromDb ? `已从数据库加载 ${c} 真实榜单（含实景图）` : `已生成 ${c} 酒店 / 美食 / 景点 红黑榜`)
}

const catLabel = (key) => boards.find(b => b.key === key)?.label || key

// 若已有目的地，进入页面自动加载
if (city.value) loadBoard()

// ---------------- 勾选（对比 + 收藏共用） ----------------
const selected = ref([])

const isSelected = (item) => selected.value.some(s => s.key === item.catKey && s.name === item.name)

const toggleSelect = (item, key) => {
    const idx = selected.value.findIndex(s => s.key === key && s.name === item.name)
    if (idx > -1) {
        selected.value.splice(idx, 1)
    } else {
        if (selected.value.length >= 3) {
            toast.error('最多选择 3 个项目进行对比，请取消部分选项')
            return
        }
        selected.value.push({ key, name: item.name, item })
    }
}

const clearSelected = () => {
    selected.value = []
    toast('已清空勾选项')
}

// ---------------- 批量加入收藏 ----------------
const isFavItem = (item) => {
    if (item.catKey === 'hotel') return favStore.state.hotels.some(r => r.name === item.name)
    if (item.catKey === 'food') return favStore.state.foods.some(r => r.name === item.name)
    return favStore.state.spots.some(r => r.name === item.name)
}

const addToFavorites = () => {
    if (!selected.value.length) return
    let added = 0
    selected.value.forEach(({ key, item }) => {
        if (isFavItem(item)) return
        if (key === 'hotel') favStore.addHotel({ ...item })
        else if (key === 'food') favStore.addFood({ ...item })
        else favStore.addSpot({ ...item })
        added++
    })
    if (added > 0) toast.success(`⭐ 添加成功！${added} 项已同步到个人收藏`)
    else toast('所选项目均已收藏过')
}

// ---------------- 详情下钻弹窗 ----------------
const CMT_PAGE_SIZE = 5
const detail = reactive({ show: false, item: null })
const detailImgFailed = ref(false)
const detailImg = ref('')
const cmtPage = ref(1)

// 详情图库：封面 + 细节图，点击缩略图切换主图
const galleryList = computed(() =>
    detail.item ? [detail.item.img, ...(detail.item.gallery || [])] : []
)

const totalCmtPages = computed(() =>
    Math.ceil((detail.item?.comments.length || 0) / CMT_PAGE_SIZE)
)

const pagedComments = computed(() => {
    const all = detail.item?.comments || []
    const start = (cmtPage.value - 1) * CMT_PAGE_SIZE
    return all.slice(start, start + CMT_PAGE_SIZE)
})

const openDetail = (item) => {
    detail.item = item
    detailImg.value = item.img
    detailImgFailed.value = false
    cmtPage.value = 1
    detail.show = true
}

// 缩略图加载失败：隐藏让排名徽章更醒目（自然回退）
const onImgError = (e) => {
    e.target.style.display = 'none'
}

// ---------------- 对比弹窗 ----------------
const compareShow = ref(false)

const startCompare = () => {
    if (selected.value.length < 2) {
        toast.error('请至少勾选 2 个项目进行对比')
        return
    }
    compareShow.value = true
}
</script>

<style scoped>
.rank-page {
    height: 100%;
    overflow-y: auto;
    padding: 22px 26px 96px;
}

.page-header { margin-bottom: 16px; }
.page-title { font-size: 21px; font-weight: 700; }
.page-desc { font-size: 13px; color: var(--text-3); margin-top: 6px; }

/* 搜索卡 */
.search-card {
    display: flex;
    gap: 11px;
    padding: 15px;
    margin-bottom: 16px;
}

.city-input { flex: 1; }

/* 三列榜单 */
.board-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    align-items: start;
}

.board-section {
    padding: 16px;
    display: flex;
    flex-direction: column;
}

.board-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.bh-title {
    font-size: 15.5px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
}

.bh-tabs {
    display: inline-flex;
    background: #f2f4f7;
    border-radius: 9px;
    padding: 3px;
    gap: 3px;
}

.bh-tab {
    padding: 5px 13px;
    font-size: 12.5px;
    border-radius: 7px;
    cursor: pointer;
    color: var(--text-2);
    transition: all 0.16s ease;
    white-space: nowrap;
}

.bh-tab.tab-red.active {
    background: var(--danger);
    color: #fff;
    font-weight: 600;
}

.bh-tab.tab-black.active {
    background: #3d4451;
    color: #fff;
    font-weight: 600;
}

.bh-desc {
    font-size: 12px;
    color: var(--text-3);
    margin: 9px 0 10px;
}

/* 条目列表（列内滚动） */
.board-list {
    display: flex;
    flex-direction: column;
    gap: 9px;
    max-height: 560px;
    overflow-y: auto;
    padding-right: 2px;
}

.board-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.18s ease;
    background: #fff;
}

.board-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
    border-color: var(--brand-light);
}

/* 勾选高亮 */
.board-item.picked {
    border-color: var(--brand);
    background: var(--brand-lighter);
    box-shadow: 0 0 0 2px rgba(35, 116, 221, 0.1);
}

.pc-check {
    width: 17px;
    height: 17px;
    border: 1.5px solid var(--border);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    margin-top: 4px;
    background: #fff;
    transition: all 0.15s;
}

.pc-check:hover { border-color: var(--brand); }

.pc-check.checked {
    background: var(--brand);
    border-color: var(--brand);
}

/* 排名徽章：红榜红标 / 黑榜深灰标 */
.rank-no {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
    flex-shrink: 0;
    margin-top: 2px;
}

.no-red {
    background: var(--danger-bg);
    color: var(--danger);
}
.no-red:nth-child(2) { background: var(--danger); color: #fff; }

.no-black {
    background: #e8eaee;
    color: #3d4451;
}

/* 场所缩略图：紧跟排名徽章后，40×40 圆角，图片加载失败自动隐藏 */
.bi-thumb {
    width: 40px;
    height: 40px;
    border-radius: 9px;
    object-fit: cover;
    flex-shrink: 0;
    margin-left: 8px;
    background: #f5f7fa;
    border: 1px solid var(--divider);
}

/* 主信息 */
.bi-main {
    flex: 1;
    min-width: 0;
}

.bi-name-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.bi-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.bi-faved { font-size: 12px; }

.bi-tags {
    display: flex;
    gap: 5px;
    margin-top: 5px;
    flex-wrap: wrap;
}

.bi-tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 9px;
}

.tag-red { background: #fdecec; color: #c23a3f; }
.tag-black { background: #eceef2; color: #59606d; }

.bi-summary {
    font-size: 12px;
    color: var(--text-3);
    line-height: 1.55;
    margin: 6px 0 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* 评分 / 价格 */
.bi-side {
    text-align: right;
    flex-shrink: 0;
}

.bi-rating {
    font-size: 14px;
    font-weight: 700;
}

.rate-good { color: #e8912f; }
.rate-bad { color: var(--danger); }

.bi-price {
    font-size: 11.5px;
    color: var(--text-3);
    margin-top: 4px;
}

/* 空态 */
.rank-empty {
    text-align: center;
    padding: 70px 0;
}

.re-emoji { font-size: 46px; }

.rank-empty p {
    margin-top: 13px;
    font-size: 13.5px;
    color: var(--text-3);
}

/* ============ 底部固定操作栏 ============ */
.float-bar {
    position: fixed;
    left: 224px;
    right: 0;
    bottom: 0;
    background: #fff;
    border-top: 1px solid var(--border);
    box-shadow: 0 -4px 16px rgba(31, 39, 51, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 13px 26px;
    z-index: 50;
}

.fb-selected {
    display: flex;
    align-items: center;
    gap: 9px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.fb-count {
    min-width: 44px;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--brand);
    background: var(--brand-light);
    border-radius: 9px;
    padding: 5px 0;
}

.fb-count.full { color: var(--danger); background: var(--danger-bg); }

.fb-hint {
    font-size: 12.5px;
    color: var(--text-3);
    white-space: nowrap;
}

.fb-chip {
    font-size: 11.5px;
    color: var(--brand);
    background: var(--brand-light);
    padding: 3px 10px;
    border-radius: 11px;
    white-space: nowrap;
}

.fb-actions {
    display: flex;
    gap: 10px;
}

.fb-fav {
    color: #c77c12;
    border-color: #f0c268;
    background: #fff9eb;
}
.fb-fav:hover { background: #fff3d2; }

/* ============ 详情弹窗 ============ */
.detail-modal { width: 620px; }

.dm-head {
    display: flex;
    align-items: center;
    gap: 10px;
}

.dm-board {
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 10px;
    font-weight: 600;
}

.db-red { background: var(--danger-bg); color: var(--danger); }
.db-black { background: #eceef2; color: #3d4451; }

.dm-body { max-height: 66vh; overflow-y: auto; }

.dm-img {
    width: 100%;
    height: 210px;
    object-fit: cover;
    border-radius: 10px;
    margin-bottom: 10px;
    background: #f5f7fa;
}

/* 缩略图行 */
.dm-thumbs {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
}

.dm-thumb {
    width: 74px;
    height: 54px;
    object-fit: cover;
    border-radius: 7px;
    cursor: pointer;
    border: 2px solid transparent;
    opacity: 0.7;
    background: #f5f7fa;
    transition: all 0.15s;
}

.dm-thumb:hover { opacity: 1; }

.dm-thumb.active {
    border-color: var(--brand);
    opacity: 1;
}

/* 实用信息行 */
.dm-info-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    padding: 10px 13px;
    background: #f7f9fc;
    border-radius: 9px;
    margin-bottom: 13px;
}

.dm-info {
    font-size: 12.3px;
    color: var(--text-2);
}

.dm-meta-row {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 10px;
}

.dm-rate { font-size: 17px; font-weight: 700; }
.dm-price { font-size: 13.5px; color: var(--text-1); font-weight: 600; }
.dm-loc { font-size: 12.5px; color: var(--text-3); }

.dm-intro {
    font-size: 13.5px;
    color: var(--text-2);
    line-height: 1.75;
    margin: 0 0 13px;
}

/* AI 总结块 */
.dm-ai {
    border-radius: 10px;
    padding: 13px 15px;
    margin-bottom: 13px;
}

.ai-red { background: var(--danger-bg); }
.ai-black { background: #eceef2; }

.dm-ai-title {
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 6px;
}

.ai-red .dm-ai-title { color: var(--danger); }
.ai-black .dm-ai-title { color: #3d4451; }

.dm-ai-text {
    font-size: 12.8px;
    line-height: 1.7;
    color: var(--text-2);
    margin: 0;
}

.dm-kw-box {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--divider);
    margin-bottom: 12px;
}

.kw-label { font-size: 13px; color: var(--text-3); }

.kw-chip {
    font-size: 12px;
    padding: 3px 11px;
    border-radius: 12px;
}

.kw-red { background: #fdecec; color: #c23a3f; }
.kw-black { background: #eceef2; color: #59606d; }

.dm-label {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--text-1);
    margin-bottom: 9px;
}

.comment-item {
    padding: 11px 2px;
    border-bottom: 1px solid var(--divider);
}

.c-head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.c-user { font-size: 13px; font-weight: 600; color: var(--text-1); }
.c-date { font-size: 12px; color: var(--text-3); }

.c-text {
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.65;
    margin: 0;
}

/* 分页 */
.pager {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding-top: 14px;
}

.pg-btn {
    height: 31px;
    padding: 0 15px;
    border: 1px solid var(--border);
    background: #fff;
    border-radius: 8px;
    color: var(--text-2);
    cursor: pointer;
    font-size: 12.5px;
}

.pg-btn:hover:not(:disabled) { color: var(--brand); border-color: var(--brand); }
.pg-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.pg-info { font-size: 12.5px; color: var(--text-2); min-width: 50px; text-align: center; }

/* ============ 对比弹窗 ============ */
.compare-modal { width: 780px; }

.cmp-body { max-height: 64vh; overflow-y: auto; }

.cmp-grid {
    display: grid;
    gap: 1px;
    background: var(--divider);
    border: 1px solid var(--divider);
    border-radius: 10px;
    overflow: hidden;
}

.cmp-cell {
    background: #fff;
    padding: 11px 13px;
    font-size: 12.8px;
    color: var(--text-2);
    display: flex;
    flex-direction: column;
    gap: 5px;
    justify-content: center;
}

.cmp-head-cell { background: var(--brand-lighter); }

.cmp-cat {
    font-size: 11px;
    width: fit-content;
    padding: 2px 8px;
    border-radius: 8px;
}

.cc-hotel { background: var(--brand-light); color: var(--brand); }
.cc-food { background: var(--danger-bg); color: var(--cat-food); }
.cc-spot { background: var(--warning-bg); color: var(--cat-view); }

.cmp-name {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--text-1);
}

.cmp-field {
    background: #f7f9fc;
    font-weight: 600;
    color: var(--text-1);
    font-size: 12.5px;
}

.cmp-rate { font-size: 15px; font-weight: 700; }

.cmp-summary { line-height: 1.6; }

.cmp-pro {
    color: var(--success);
    font-size: 12.3px;
}

.cmp-con {
    color: var(--danger);
    font-size: 12.3px;
}
</style>
