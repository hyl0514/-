<template>
  <div class="planner-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div>
        <h1 class="page-title">行程规划</h1>
        <p class="page-desc">
          AI 多路线生成 · 沿途场所推荐 · 花销记账，一站式完成出行规划
        </p>
      </div>
      <div class="header-tags">
        <span class="ht-chip" v-if="state.form.destination">
          📍 {{ state.form.destination }}
        </span>
        <span class="ht-chip" v-if="state.form.travelDays">
          📅 {{ state.form.travelDays }} 天
        </span>
        <span class="ht-chip">🎯 {{ state.form.preference || '休闲' }}</span>
      </div>
    </header>

    <!-- 左右分栏 -->
    <div class="planner-body">
      <!-- 左侧 40% 地图 -->
      <section class="map-col">
        <MapPanel />
      </section>

      <!-- 右侧 60% 标签页 -->
      <section class="tabs-col pc-card">
        <div class="tabs-head">
          <div
            v-for="(t, i) in tabs"
            :key="t.key"
            class="top-tab"
            :class="{ active: activeTab === i }"
            @click="activeTab = i"
          >
            <span class="tt-icon">{{ t.icon }}</span>
            {{ t.label }}
            <span class="tt-badge" v-if="t.badge">{{ t.badge }}</span>
          </div>
        </div>

        <div class="tabs-body">
          <RouteTab v-show="activeTab === 0" />
          <PoiTab v-show="activeTab === 1" />
          <ExpenseTab v-show="activeTab === 2" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MapPanel from '../components/planner/MapPanel.vue'
import RouteTab from '../components/planner/RouteTab.vue'
import PoiTab from '../components/planner/PoiTab.vue'
import ExpenseTab from '../components/planner/ExpenseTab.vue'
import { useTripStore } from '../store/tripStore'

const { state } = useTripStore()

const tabs = [
    { key: 'route', icon: '🧭', label: 'AI 路线规划' },
    { key: 'poi', icon: '🏨', label: '沿途场所推荐' },
    { key: 'expense', icon: '💰', label: '行程花销记账' }
]

const activeTab = ref(0)
</script>

<style scoped>
.planner-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 22px 26px;
    gap: 18px;
    overflow: hidden;
}

/* 头部 */
.page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-shrink: 0;
}

.page-title {
    font-size: 21px;
    font-weight: 700;
    color: var(--text-1);
}

.page-desc {
    font-size: 13px;
    color: var(--text-3);
    margin-top: 6px;
}

.header-tags {
    display: flex;
    gap: 9px;
}

.ht-chip {
    font-size: 12.5px;
    color: var(--text-2);
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 17px;
    padding: 6px 13px;
}

/* 主体分栏 */
.planner-body {
    flex: 1;
    display: flex;
    gap: 18px;
    min-height: 0;
}

.map-col {
    width: 40%;
    min-width: 340px;
    flex-shrink: 0;
}

.tabs-col {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 标签头 */
.tabs-head {
    display: flex;
    gap: 4px;
    padding: 10px 14px 0;
    border-bottom: 1px solid var(--divider);
    flex-shrink: 0;
}

.top-tab {
    position: relative;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 17px 12px;
    font-size: 14px;
    color: var(--text-2);
    cursor: pointer;
    transition: color 0.18s ease;
}

.top-tab:hover {
    color: var(--brand);
}

.top-tab.active {
    color: var(--brand);
    font-weight: 600;
}

.top-tab.active::after {
    content: '';
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: -1px;
    height: 2.5px;
    background: var(--brand);
    border-radius: 3px;
}

.tt-icon {
    font-size: 15px;
}

.tabs-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}
</style>
