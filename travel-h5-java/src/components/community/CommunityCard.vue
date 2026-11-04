<template>
  <!-- 瀑布流单张卡片 -->
  <div class="ccard" :class="'cs-' + post.status" @click="$emit('open', post)">
    <!-- 状态提示条 -->
    <div class="cs-bar" v-if="post.status !== 'approved'">
      <span v-if="post.status === 'pending'">⏳ 审核中</span>
      <span v-else>❌ 已驳回：{{ post.rejectReason }}</span>
    </div>

    <!-- 用户信息栏 -->
    <div class="ccard-user">
      <div class="cu-avatar" :style="{ background: avatarBg }">{{ post.avatar }}</div>
      <div class="cu-info">
        <div class="cu-name">{{ post.author }}
          <span class="cu-level" v-if="post.level === '资深玩家'">🏆</span>
          <span class="cu-level" v-else-if="post.level === '旅行达人'">⭐</span>
        </div>
        <div class="cu-meta">{{ post.createdAt }} · <span class="cu-city">{{ post.city }}</span></div>
      </div>
      <!-- 管理员菜单 -->
      <div class="cu-admin-menu" v-if="isAdmin" @click.stop>
        <div class="cu-admin-btn">⋯</div>
        <div class="cu-admin-dropdown" v-if="adminOpen">
          <div v-if="post.status !== 'approved'" @click="onApprove">✅ 审核通过</div>
          <div v-if="post.status !== 'rejected'" @click="onReject">❌ 驳回</div>
          <div class="danger" @click="onDelete">🗑 删除</div>
        </div>
      </div>
    </div>

    <!-- 正文 -->
    <div class="ccard-body">
      <div class="ccard-title">{{ post.title }}</div>
      <div class="ccard-content">{{ post.content }}</div>

      <!-- 图片网格 -->
      <div class="ccard-imgs" :class="'ci-' + imgsClass" v-if="post.images?.length">
        <img
          v-for="(img, i) in post.images.slice(0, 4)"
          :key="i"
          :src="img"
          alt=""
          @error="onImgError"
        >
        <div class="ccard-more" v-if="post.images.length > 4">+{{ post.images.length - 4 }}</div>
      </div>

      <!-- 标签 -->
      <div class="ccard-tags">
        <span class="ct ct-main">{{ post.cat }}</span>
        <span class="ct" v-for="t in post.tags" :key="t">{{ t }}</span>
      </div>

      <!-- 关联内容 -->
      <div class="ccard-link" v-if="post.hasTrip || post.hasSpot">
        <div v-if="post.hasTrip" class="cl-item">🧭 关联行程：{{ post.tripName }}</div>
        <div v-if="post.hasSpot" class="cl-item">📍 关联场所：{{ post.spotName }}</div>
      </div>
    </div>

    <!-- 底部互动栏 -->
    <div class="ccard-foot" @click.stop>
      <span class="cf-item" :class="{ liked: post.liked }" @click="onLike">
        <svg width="16" height="16" viewBox="0 0 24 24" :fill="post.liked ? '#e94560' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M12 21s-7-6.2-7-11a4.5 4.5 0 0 1 9 0c0 4.8-7 11-7 11z"/>
        </svg>
        {{ post.likes }}
      </span>
      <span class="cf-item" @click="$emit('comment', post)">
        💬 {{ post.comments }}
      </span>
      <span class="cf-item" :class="{ faved: post.faved }" @click="onFav">
        <svg width="16" height="16" viewBox="0 0 24 24" :fill="post.faved ? '#2374DD' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"/>
        </svg>
      </span>
      <span class="cf-item" @click="onShare" title="转发/复制链接">
        🔗
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCommunityStore } from '../../store/communityStore'
import { useFavoriteStore } from '../../store/favoriteStore'
import toast from '../../utils/msg'

const props = defineProps({ post: { type: Object, required: true } })
defineEmits(['open', 'comment'])

const store = useCommunityStore()
const favStore = useFavoriteStore()
const isAdmin = computed(() => store.isAdmin.value)
const adminOpen = ref(false)

const colors = ['#2374DD', '#0EA5A4', '#E8912F', '#e94560', '#667eea', '#764ba2']
const avatarBg = computed(() => colors[props.post.avatar.length % colors.length])

// 图片加载失败时的兜底占位（内联 SVG，离线也可见）
const FALLBACK_IMG = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3ecf7"/><stop offset="1" stop-color="#cddced"/></linearGradient></defs><rect width="600" height="450" fill="url(#g)"/><text x="300" y="238" font-size="34" fill="#8fa6c0" text-anchor="middle">✈️</text></svg>'
)
const onImgError = (e) => {
    const t = e.target
    if (t.dataset.fb) return
    t.dataset.fb = '1'
    t.src = FALLBACK_IMG
}

const imgsClass = computed(() => {
    const n = props.post.images?.length || 0
    if (n === 1) return '1'
    if (n === 2) return '2'
    if (n === 3) return '3'
    return '4'
})

const onLike = () => store.toggleLike(props.post.id)
const onFav = () => {
    store.toggleFav(props.post.id)
    // 联动 favoriteStore
    if (store.hasFaved(props.post.id)) {
        favStore.addPost(props.post)
        toast.success('⭐ 已收藏帖子到个人收藏')
    } else {
        favStore.removePost(props.post.id)
    }
}
const onShare = () => {
    const link = `${location.origin}/community?post=${props.post.id}`
    navigator.clipboard?.writeText(link).then(() => toast.success('🔗 链接已复制到剪贴板')).catch(() => toast('链接：' + link))
}
const onApprove = () => { store.approvePost(props.post.id); adminOpen.value = false }
const onReject = () => {
    const reason = prompt('请输入驳回理由', '内容不符合社区规范')
    if (reason !== null) store.rejectPost(props.post.id, reason)
    adminOpen.value = false
}
const onDelete = () => {
    if (confirm('确认删除这条动态吗？')) store.deletePost(props.post.id)
    adminOpen.value = false
}
</script>

<style scoped>
.ccard {
    break-inside: avoid;
    margin-bottom: 14px;
    background: #fff;
    border-radius: 12px;
    border: 1px solid var(--border);
    overflow: hidden;
    transition: all 0.18s ease;
    cursor: pointer;
    position: relative;
}

.ccard:hover {
    box-shadow: 0 8px 24px rgba(35, 116, 221, 0.12);
    transform: translateY(-2px);
}

/* 状态条 */
.cs-bar {
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 500;
    color: #fff;
}
.cs-pending .cs-bar { background: #2374DD; }
.cs-rejected .cs-bar { background: #e94560; }
.cs-approved .cs-bar { background: transparent; padding: 0; }

.cs-pending { opacity: 0.92; }

/* 用户栏 */
.ccard-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px 8px;
}

.cu-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
}

.cu-info { flex: 1; min-width: 0; }

.cu-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-1);
}

.cu-level { margin-left: 4px; font-size: 12px; }

.cu-meta {
    font-size: 11px;
    color: var(--text-3);
    margin-top: 2px;
}

.cu-city {
    padding: 1px 8px;
    border-radius: 8px;
    background: #e8f0ff;
    color: var(--brand);
    font-size: 10.5px;
}

/* 管理员菜单 */
.cu-admin-menu {
    position: relative;
    flex-shrink: 0;
}

.cu-admin-btn {
    width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 6px;
    font-size: 16px;
    color: var(--text-3);
    cursor: pointer;
}

.cu-admin-btn:hover { background: #f2f4f7; color: var(--text-1); }

.cu-admin-dropdown {
    position: absolute;
    top: 32px; right: 0;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 4px 0;
    min-width: 110px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
    z-index: 100;
    font-size: 12.5px;
}

.cu-admin-dropdown > div {
    padding: 7px 12px;
    cursor: pointer;
    color: var(--text-2);
}
.cu-admin-dropdown > div:hover { background: #f2f4f7; color: var(--text-1); }
.cu-admin-dropdown > div.danger { color: var(--danger); }
.cu-admin-dropdown > div.danger:hover { background: #fdf0f2; }

/* 正文 */
.ccard-body { padding: 0 14px 0; }

.ccard-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-1);
    line-height: 1.4;
    margin-bottom: 4px;
}

.ccard-content {
    font-size: 12.5px;
    color: var(--text-2);
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    margin-bottom: 8px;
}

/* 图片网格 */
.ccard-imgs {
    display: grid;
    gap: 3px;
    margin-bottom: 8px;
    border-radius: 8px;
    overflow: hidden;
}

.ccard-imgs img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: zoom-in;
    transition: transform 0.2s;
}

.ccard-imgs img:hover { transform: scale(1.03); }

.ci-1 { grid-template-columns: 1fr; }
.ci-1 img { max-height: 200px; }

.ci-2 { grid-template-columns: 1fr 1fr; }
.ci-2 img { height: 140px; }

.ci-3 { grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; }
.ci-3 img:first-child { grid-row: 1 / span 2; height: 200px; }
.ci-3 img:not(:first-child) { height: 98px; }

.ci-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.ci-4 img { height: 120px; }

.ccard-more {
    position: absolute;
    bottom: 12px; right: 16px;
    background: rgba(0,0,0,0.6);
    color: #fff;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
}

/* 标签 */
.ccard-tags {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    margin-bottom: 8px;
}

.ct {
    padding: 2px 9px;
    border-radius: 8px;
    font-size: 11px;
    background: #f2f4f7;
    color: var(--text-3);
}

.ct-main {
    background: var(--brand-light);
    color: var(--brand);
    font-weight: 500;
}

/* 关联 */
.ccard-link {
    background: #f7f9fc;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 11.5px;
    color: var(--text-2);
    margin-bottom: 8px;
}

.cl-item + .cl-item { margin-top: 3px; }

/* 底部互动 */
.ccard-foot {
    display: flex;
    gap: 18px;
    padding: 10px 14px 12px;
    border-top: 1px solid var(--divider);
}

.cf-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12.5px;
    color: var(--text-3);
    cursor: pointer;
    transition: all 0.15s;
}

.cf-item:hover { color: var(--brand); }
.cf-item.liked { color: #e94560; }
.cf-item.faved { color: var(--brand); }
</style>
