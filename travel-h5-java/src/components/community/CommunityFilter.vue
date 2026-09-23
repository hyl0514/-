<template>
  <!-- 筛选导航栏 -->
  <section class="cf-wrap pc-card">
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
        <input class="pc-input cc-search" list="cc-cities" v-model="store.city" placeholder="搜索城市" />
        <datalist id="cc-cities">
          <option v-for="c in store.HOT_CITIES" :key="c" :value="c"></option>
        </datalist>
        <span class="cf-clear" v-if="store.city" @click="store.city = ''">×</span>
        <div class="cf-hot-cities">
          <span class="cf-hot-label">热门：</span>
          <span
            v-for="c in store.HOT_CITIES.slice(0, 6)"
            :key="c"
            class="cf-hot"
            :class="{ active: store.city === c }"
            @click="store.city = store.city === c ? '' : c"
          >{{ c }}</span>
        </div>
      </div>

      <div class="cf-right">
        <select class="pc-select cf-sort" v-model="store.sort">
          <option value="latest">最新发布</option>
          <option value="hot">最热点赞</option>
          <option value="comments">最多评论</option>
        </select>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useCommunityStore } from '../../store/communityStore'
const store = useCommunityStore()
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
</style>
