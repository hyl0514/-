<template>
  <!-- 筛选导航栏 -->
  <section class="cf-wrap pc-card">
    <!-- 第一行：浏览范围 + 管理员审核入口 -->
    <div class="cf-scope-row">
      <div class="cf-scope">
        <span class="cf-scope-item" :class="{ active: store.state.scope === 'all' }" @click="store.state.scope = 'all'">
          🌐 社区广场
        </span>
        <span
          v-if="auth.state.isLoggedIn"
          class="cf-scope-item"
          :class="{ active: store.state.scope === 'mine' }"
          @click="store.state.scope = 'mine'"
        >
          📝 我的动态
          <span class="cf-mine-count" v-if="mineCount">{{ mineCount }}</span>
        </span>
      </div>

      <button v-if="admin" class="cf-admin-btn" @click="$router.push('/admin')">
        🛡️ 内容审核
        <span class="cf-admin-badge" v-if="pendingCount">{{ pendingCount }}</span>
      </button>
    </div>

    <!-- Tab 筛选 -->
    <div class="cf-tabs">
      <span
        v-for="c in store.CATS"
        :key="c"
        class="cf-tab"
        :class="{ active: store.cat === c }"
        @click="store.cat = c"
      >{{ c }}</span>
    </div>

    <!-- 第二行：城市 + 排序 + 刷新 -->
    <div class="cf-row">
      <div class="cf-city">
        <input class="pc-input cc-search" list="cc-cities" v-model="store.state.city" placeholder="搜索城市" />
        <datalist id="cc-cities">
          <option v-for="c in store.HOT_CITIES" :key="c" :value="c"></option>
        </datalist>
        <span class="cf-clear" v-if="store.state.city" @click="store.state.city = ''">×</span>
        <div class="cf-hot-cities">
          <span class="cf-hot-label">热门：</span>
          <span
            v-for="c in store.HOT_CITIES.slice(0, 6)"
            :key="c"
            class="cf-hot"
            :class="{ active: store.state.city === c }"
            @click="store.state.city = store.state.city === c ? '' : c"
          >{{ c }}</span>
        </div>
      </div>

      <div class="cf-right">
        <select class="pc-select cf-sort" v-model="store.state.sort">
          <option value="latest">最新发布</option>
          <option value="hot">最热点赞</option>
          <option value="comments">最多评论</option>
        </select>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useCommunityStore } from '../../store/communityStore'
import { useAuthStore } from '../../store/authStore'

const store = useCommunityStore()
const auth = useAuthStore()

const admin = computed(() => auth.isAdmin())
const pendingCount = computed(() => store.pendingCount.value)
const mineCount = computed(() => store.myPosts.value.length)
</script>

<style scoped>
.cf-wrap {
    padding: 14px 18px 16px;
    margin-bottom: 16px;
}

.pc-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid var(--border);
}

.cf-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--divider);
}

.cf-tab {
    padding: 6px 16px;
    font-size: 13px;
    border-radius: 16px;
    background: #f2f4f7;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.15s;
    user-select: none;
}

.cf-tab:hover { background: #e6ebf3; color: var(--text-1); }

.cf-tab.active {
    background: var(--brand);
    color: #fff;
    font-weight: 600;
}

.cf-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
}

.cf-city {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    min-width: 0;
}

.cc-search {
    width: 140px;
    height: 32px;
    font-size: 13px;
}

.cf-clear {
    color: var(--text-3);
    cursor: pointer;
    font-size: 16px;
    padding: 0 4px;
}

.cf-clear:hover { color: var(--danger); }

.cf-hot-cities {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.cf-hot-label {
    font-size: 12px;
    color: var(--text-3);
}

.cf-hot {
    padding: 3px 10px;
    font-size: 12px;
    border-radius: 10px;
    background: #f7f9fc;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.12s;
}

.cf-hot:hover { background: #e6ebf3; }
.cf-hot.active { background: var(--brand-light); color: var(--brand); }

.cf-right { display: flex; gap: 10px; flex-shrink: 0; }

.cf-sort { height: 32px; font-size: 13px; width: 130px; }

/* 浏览范围切换 */
.cf-scope-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--divider);
}

.cf-scope { display: flex; gap: 8px; }

.cf-scope-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 10px;
    color: var(--text-2);
    background: #f7f9fc;
    cursor: pointer;
    transition: all 0.18s ease;
    user-select: none;
}

.cf-scope-item:hover { background: #eef2f8; color: var(--text-1); }

.cf-scope-item.active {
    color: var(--brand);
    background: var(--brand-light);
    font-weight: 600;
    box-shadow: inset 0 0 0 1px rgba(35, 116, 221, 0.25);
}

.cf-mine-count {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--brand);
    color: #fff;
    font-size: 11px;
    line-height: 18px;
    text-align: center;
}

/* 管理员审核入口 */
.cf-admin-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #2374DD, #0EA5A4);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(35, 116, 221, 0.3);
    transition: all 0.2s ease;
}

.cf-admin-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(35, 116, 221, 0.4); }

.cf-admin-badge {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: #e94560;
    color: #fff;
    font-size: 11px;
    line-height: 18px;
    text-align: center;
}
</style>
