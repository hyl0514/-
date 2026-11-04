<template>
  <div class="admin-page">
    <header class="ap-head">
      <div>
        <h1 class="ap-title">🛡️ 管理员审核后台</h1>
        <p class="ap-desc">多条件筛选 · 批量审核 · 精准管控社区内容</p>
      </div>
      <div class="ap-head-actions">
        <button class="pc-btn pc-btn-sm" @click="$router.push('/community')">← 返回前台</button>
        <button class="pc-btn pc-btn-sm" @click="onExitAdmin">退出登录</button>
      </div>
    </header>

    <div class="ap-card filter-card">
      <div class="af-row">
        <div class="af-item">
          <label class="af-label">城市</label>
          <select class="pc-select" v-model="filter.city">
            <option value="">全部城市</option>
            <option v-for="c in store.HOT_CITIES" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="af-item">
          <label class="af-label">类型</label>
          <select class="pc-select" v-model="filter.cat">
            <option value="">全部类型</option>
            <option v-for="c in cats" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="af-item">
          <label class="af-label">审核状态</label>
          <select class="pc-select" v-model="filter.status">
            <option value="">全部状态</option>
            <option value="pending">⏳ 待审核</option>
            <option value="approved">✅ 已通过</option>
            <option value="rejected">❌ 已驳回</option>
          </select>
        </div>
        <div class="af-item">
          <label class="af-label">时间区间</label>
          <select class="pc-select" v-model="filter.time">
            <option value="">全部时间</option>
            <option value="today">今日</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
          </select>
        </div>
        <div class="af-item">
          <label class="af-label">搜索标题</label>
          <input class="pc-input" v-model="filter.keyword" placeholder="输入标题关键词">
        </div>
      </div>
    </div>

    <div class="ap-card list-card">
      <div class="al-head">
        <div class="al-ops">
          <span class="al-total">共 {{ total }} 条</span>
          <button class="pc-btn pc-btn-sm pc-btn-primary" :disabled="!selected.length" @click="batchApprove">
            ✅ 批量通过 ({{ selected.length }})
          </button>
          <button class="pc-btn pc-btn-sm" :disabled="!selected.length" @click="batchDelete">
            🗑 批量删除
          </button>
        </div>
        <div class="al-select-all">
          <span class="pc-check" :class="{ checked: selectedAll }" @click="toggleSelectAll">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M4 12.5l5 5L20 6.5" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ selectedAll ? '取消全选' : '全选当前' }}</span>
        </div>
      </div>

      <!-- 表格 -->
      <div class="al-table">
        <div class="al-th">
          <span class="col-check"></span>
          <span class="col-img">缩略图</span>
          <span class="col-title">标题 / 作者</span>
          <span class="col-city">城市</span>
          <span class="col-cat">类型</span>
          <span class="col-status">状态</span>
          <span class="col-date">发布时间</span>
          <span class="col-ops">操作</span>
        </div>

        <div class="al-row" v-for="p in filtered" :key="p.id">
          <span class="col-check">
            <span class="pc-check" :class="{ checked: selected.includes(p.id) }" @click="toggleSel(p.id)">
              <svg v-if="selected.includes(p.id)" width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M4 12.5l5 5L20 6.5" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </span>
          <span class="col-img">
            <img v-if="p.images?.[0]" :src="p.images[0]" class="al-thumb" @error="$event.target.style.opacity='0.3'">
            <span v-else class="al-no-img">—</span>
          </span>
          <span class="col-title">
            <div class="at-title">{{ p.title }}</div>
            <div class="at-author">{{ p.author }}</div>
          </span>
          <span class="col-city">{{ p.city }}</span>
          <span class="col-cat">{{ p.cat }}</span>
          <span class="col-status">
            <span class="as-status" :class="'as-' + p.status">
              {{ p.status === 'approved' ? '✅ 已通过' : p.status === 'pending' ? '⏳ 待审核' : '❌ 已驳回' }}
            </span>
            <div class="as-reason" v-if="p.status === 'rejected'">{{ p.rejectReason }}</div>
          </span>
          <span class="col-date">{{ p.createdAt }}</span>
          <span class="col-ops">
            <span class="ao-btn" v-if="p.status !== 'approved'" @click="onApprove(p)">通过</span>
            <span class="ao-btn" v-if="p.status !== 'rejected'" @click="onReject(p)">驳回</span>
            <span class="ao-btn danger" @click="onDelete(p)">删除</span>
          </span>
        </div>

        <div class="al-empty" v-if="!filtered.length">
          <div class="ae-emoji">📋</div>
          <p>暂无符合条件的动态</p>
        </div>
      </div>

      <!-- 分页 -->
      <div class="al-pager" v-if="total > pageSize">
        <span class="ap-btn" :class="{ disabled: page === 1 }" @click="page--">上一页</span>
        <span class="ap-info">{{ page }} / {{ Math.ceil(total / pageSize) }}</span>
        <span class="ap-btn" :class="{ disabled: page >= Math.ceil(total / pageSize) }" @click="page++">下一页</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCommunityStore } from '../store/communityStore'
import { useAuthStore } from '../store/authStore'
import toast from '../utils/msg'

const store = useCommunityStore()
const auth = useAuthStore()
const router = useRouter()

// 只有管理员可进入：非管理员直接退回社区页
onMounted(async () => {
    if (!auth.isAdmin()) {
        toast.error('仅管理员可访问审核后台')
        router.replace('/community')
        return
    }
    await store.refreshFromBackend()
})

const onExitAdmin = () => {
    auth.logout()
    router.replace('/community')
}

const cats = store.CATS.filter(c => c !== '全部')

const filter = reactive({ city: '', cat: '', status: '', time: '', keyword: '' })
const page = ref(1)
const pageSize = 8
const selected = ref([])

const allApproved = computed(() => store.state.posts.filter(p => p.status === 'approved').length)

const total = computed(() => {
    let n = store.state.posts.length
    if (filter.city) n = store.state.posts.filter(p => p.city === filter.city).length
    if (filter.cat) n = store.state.posts.filter(p => p.cat === filter.cat).length
    if (filter.status) n = store.state.posts.filter(p => p.status === filter.status).length
    return n
})

const filtered = computed(() => {
    let list = [...store.state.posts]
    if (filter.city) list = list.filter(p => p.city === filter.city)
    if (filter.cat) list = list.filter(p => p.cat === filter.cat)
    if (filter.status) list = list.filter(p => p.status === filter.status)
    if (filter.keyword) list = list.filter(p => p.title.includes(filter.keyword))
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const start = (page.value - 1) * pageSize
    return list.slice(start, start + pageSize)
})

const selectedAll = computed(() => filtered.value.length > 0 && filtered.value.every(p => selected.value.includes(p.id)))

const toggleSel = (id) => {
    const i = selected.value.indexOf(id)
    if (i >= 0) selected.value.splice(i, 1)
    else selected.value.push(id)
}

const toggleSelectAll = () => {
    if (selectedAll.value) selected.value = selected.value.filter(id => !filtered.value.find(p => p.id === id))
    else filtered.value.forEach(p => { if (!selected.value.includes(p.id)) selected.value.push(p.id) })
}

const onApprove = (p) => { store.approvePost(p.id); toast.success('已通过'); selected.value = selected.value.filter(id => id !== p.id) }
const onReject = (p) => {
    const reason = prompt('请输入驳回理由', '内容不符合社区规范')
    if (reason !== null) { store.rejectPost(p.id, reason); toast.success('已驳回') }
}
const onDelete = (p) => { if (confirm('确认删除？')) store.deletePost(p.id) }
const batchApprove = () => { selected.value.forEach(id => store.approvePost(id)); toast.success(`已批量通过 ${selected.value.length} 条`); selected.value = [] }
const batchDelete = () => { if (confirm(`确认删除 ${selected.value.length} 条？`)) { selected.value.forEach(id => store.deletePost(id)); selected.value = [] } }
</script>

<style scoped>
.admin-page {
    height: 100%;
    overflow-y: auto;
    background: #f5f7fb;
    padding: 18px 28px 28px;
}

.ap-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
}

.ap-title { font-size: 20px; font-weight: 700; }
.ap-desc { font-size: 12.5px; color: var(--text-3); margin-top: 4px; }

.ap-head-actions { display: flex; gap: 8px; }

.ap-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid var(--border);
    padding: 16px 20px;
}

.filter-card { margin-bottom: 14px; }

.af-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
}

.af-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-2);
    margin-bottom: 5px;
}

.list-card { padding: 14px 18px; }

.al-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--divider);
}

.al-ops { display: flex; gap: 8px; align-items: center; }
.al-total { font-size: 12.5px; color: var(--text-3); margin-right: 6px; }

.al-select-all { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--text-2); cursor: pointer; }

.pc-check {
    width: 16px; height: 16px;
    border: 1.5px solid var(--border);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
}
.pc-check.checked { background: var(--brand); border-color: var(--brand); }

/* 表格 */
.al-table {
    margin-top: 8px;
    font-size: 13px;
}

.al-th, .al-row {
    display: grid;
    grid-template-columns: 36px 70px 2.5fr 90px 1fr 1.2fr 100px 180px;
    gap: 10px;
    align-items: center;
    padding: 10px 8px;
}

.al-th {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-3);
    border-bottom: 1px solid var(--divider);
}

.al-row {
    border-bottom: 1px solid var(--divider);
    transition: background 0.12s;
}

.al-row:hover { background: #f7f9fc; }

.al-thumb {
    width: 54px; height: 40px;
    object-fit: cover;
    border-radius: 6px;
    background: #f5f7fa;
}

.al-no-img { color: var(--text-3); text-align: center; }

.at-title {
    font-weight: 600;
    color: var(--text-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.at-author {
    font-size: 11.5px;
    color: var(--text-3);
    margin-top: 2px;
}

.as-status {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 9px;
    font-size: 11.5px;
    font-weight: 500;
}

.as-approved { background: #e7f7f4; color: #0ea5a4; }
.as-pending { background: #fff4e5; color: #e8912f; }
.as-rejected { background: #fde7ea; color: #e94560; }

.as-reason {
    font-size: 10.5px;
    color: var(--text-3);
    margin-top: 3px;
}

.ao-btn {
    padding: 3px 10px;
    font-size: 11.5px;
    border-radius: 8px;
    cursor: pointer;
    background: var(--brand-light);
    color: var(--brand);
    margin-right: 6px;
    transition: all 0.12s;
}

.ao-btn:hover { background: var(--brand); color: #fff; }
.ao-btn.danger { background: #fde7ea; color: #e94560; }
.ao-btn.danger:hover { background: #e94560; color: #fff; }

.al-empty { text-align: center; padding: 40px; color: var(--text-3); }
.ae-emoji { font-size: 36px; margin-bottom: 6px; }

.al-pager {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--divider);
    margin-top: 12px;
}

.ap-btn {
    padding: 5px 14px;
    font-size: 12.5px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    color: var(--text-2);
}

.ap-btn:hover:not(.disabled) { color: var(--brand); border-color: var(--brand); }
.ap-btn.disabled { opacity: 0.5; cursor: not-allowed; }

.ap-info { font-size: 12.5px; color: var(--text-2); }
</style>
