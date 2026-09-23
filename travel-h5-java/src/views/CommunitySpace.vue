<template>
  <div class="cs-home">
    <!-- 顶部 -->
    <CommunityHero @publish="showPublish = true" />

    <!-- 筛选栏 -->
    <CommunityFilter />

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

        <template v-else-if="store.filteredPosts.length">
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
          <div class="ce-emoji">📭</div>
          <p>暂无动态，换个筛选条件试试？</p>
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
import toast from '../utils/msg'

const store = useCommunityStore()

// 页面挂载时清理筛选残留 + 确保数据正确
onMounted(() => {
    store.resetFilters()
    // 如果数据异常，强制重置
    if (store.state.posts.filter(p => p && p.status === 'approved').length < 5) {
        store.resetData()
    }
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

const onPosted = () => { /* 发布后刷新 */ }
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
