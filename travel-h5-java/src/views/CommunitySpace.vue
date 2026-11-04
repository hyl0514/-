<template>
  <div class="cs-home">
    <!-- 顶部 -->
    <CommunityHero @publish="showPublish = true" />

    <!-- 筛选栏 -->
    <CommunityFilter />

    <!-- 我的动态提示：说明发布 → 审核 → 公开的流程 -->
    <div class="cs-mine-tip" v-if="store.state.scope === 'mine'">
      <span class="cmt-icon">📌</span>
      <span>这里能看到你的全部动态：<b class="done">已通过</b>的会公开到社区广场，<b class="wait">待审核</b>的需管理员批准后才对其他用户展示。</span>
    </div>

    <!-- 主内容区：瀑布流 + 右侧栏 -->
    <div class="cs-main">
      <div class="cs-waterfall">
        <!-- 骨架加载占位（筛选切换时短暂显示） -->
        <div class="skeleton" v-if="loading">
          <div class="sk-card" v-for="i in 6" :key="i">
            <div class="sk-line l1"></div>
            <div class="sk-line l2"></div>
            <div class="sk-line l3"></div>
            <div class="sk-img"></div>
          </div>
        </div>

        <template v-else-if="store.filteredPosts.value.length">
          <div class="wf-col" v-for="(col, ci) in columns" :key="ci">
            <CommunityCard
              v-for="post in col"
              :key="post.id"
              :post="post"
              @open="onOpen"
              @comment="onComment"
            />
          </div>
        </template>

        <div class="cs-empty" v-else>
          <div class="ce-emoji">{{ store.state.scope === 'mine' ? '📝' : '📭' }}</div>
          <p v-if="store.state.scope === 'mine'">你还没有发布过动态，点击右上角「发布我的旅途」开始记录吧</p>
          <p v-else>暂无动态，换个筛选条件试试？</p>
        </div>
      </div>

      <!-- 右侧栏 -->
      <CommunitySidebar />
    </div>

    <!-- 发布弹窗 -->
    <PublishModal :show="showPublish" @close="showPublish = false" @posted="onPosted" />

    <!-- 评论抽屉 -->
    <CommentDrawer :show="showComment" :post="commentPost" @close="showComment = false" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import CommunityHero from '../components/community/CommunityHero.vue'
import CommunityFilter from '../components/community/CommunityFilter.vue'
import CommunityCard from '../components/community/CommunityCard.vue'
import CommunitySidebar from '../components/community/CommunitySidebar.vue'
import PublishModal from '../components/community/PublishModal.vue'
import CommentDrawer from '../components/community/CommentDrawer.vue'
import { useCommunityStore } from '../store/communityStore'
import { useAuthStore } from '../store/authStore'
import toast from '../utils/msg'

const store = useCommunityStore()
const auth = useAuthStore()

// 页面挂载：清理筛选残留 + 异步拉取后端数据（后端不可用时保持本地数据）
onMounted(async () => {
    store.resetFilters()
    await store.refreshFromBackend()
})

const showPublish = ref(false)
const loading = ref(false)

// 瀑布流：按高度分两列（简化：按奇偶分配）
const columns = computed(() => {
    const list = store.filteredPosts.value
    const cols = [[], []]
    list.forEach((p, i) => cols[i % 2].push(p))
    return cols
})

// 筛选切换时短暂显示骨架
watch(() => [store.state.cat, store.state.city, store.state.sort, store.state.status], () => {
    loading.value = true
    setTimeout(() => { loading.value = false }, 400)
})

const showComment = ref(false)
const commentPost = ref(null)

const onOpen = () => { /* 后续做详情页 */ }
const onComment = (post) => { commentPost.value = post; showComment.value = true }

// 发布成功后：提示审核状态，并跳转到「我的动态」让作者看到自己的待审核内容
const onPosted = async (post) => {
    if (post?.status === 'approved') {
        toast.success('发布成功，已对全站用户可见 ✅')
    } else {
        toast.success('发布成功，等待管理员审核通过后即可被其他用户看到 ⏳')
    }
    if (auth.state.isLoggedIn) store.state.scope = 'mine'
    await store.refreshFromBackend()
}
</script>

<style scoped>
.cs-home {
    height: 100%;
    overflow-y: auto;
    background: #f5f7fb;
    padding: 18px 28px 28px;
}

.cs-main {
    display: flex;
    gap: 18px;
    align-items: flex-start;
}

.cs-waterfall {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    min-width: 0;
}

.wf-col {
    display: flex;
    flex-direction: column;
}

/* 骨架 */
.skeleton {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}

.sk-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid var(--border);
    padding: 14px;
    height: 280px;
}

.sk-line {
    background: linear-gradient(90deg, #eef1f6 25%, #f7f9fc 50%, #eef1f6 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 4px;
    margin-bottom: 10px;
}

.sk-line.l1 { height: 14px; width: 80%; }
.sk-line.l2 { height: 12px; width: 60%; }
.sk-line.l3 { height: 12px; width: 45%; }
.sk-img { height: 120px; background: linear-gradient(90deg, #eef1f6 25%, #f7f9fc 50%, #eef1f6 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; margin-top: 10px; }

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.cs-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 0;
    color: var(--text-3);
}

.ce-emoji { font-size: 40px; margin-bottom: 10px; }

/* 我的动态流程提示条 */
.cs-mine-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding: 11px 16px;
    border-radius: 12px;
    background: linear-gradient(135deg, #eef5ff, #f2fbf8);
    border: 1px solid #dce8f8;
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.6;
}

.cmt-icon { font-size: 15px; flex-shrink: 0; }
.cs-mine-tip .done { color: #12a87a; }
.cs-mine-tip .wait { color: #e08a12; }

/* 发布弹窗 */
.publish-modal {
    width: 460px;
}

.pm-tip {
    text-align: center;
    color: var(--text-3);
    margin: 20px 0;
    font-size: 13px;
}
</style>
