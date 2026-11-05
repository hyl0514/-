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
    background: linear-gradient(135deg, #f8fbff 0%, #f0f5fa 100%);
}

/* 头部 */
.page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-shrink: 0;
    padding: 20px 24px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
    border-radius: 16px;
    border: 1px solid rgba(35, 116, 221, 0.08);
    box-shadow: 0 2px 12px rgba(35, 116, 221, 0.06);
    position: relative;
    overflow: hidden;
}

.page-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #2374DD 0%, #4a90e8 50%, #0EA5A4 100%);
}

.page-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-1);
    background: linear-gradient(135deg, #2374DD 0%, #1a5bb8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.5px;
}

.page-desc {
    font-size: 13px;
    color: var(--text-3);
    margin-top: 8px;
    line-height: 1.6;
}

.header-tags {
    display: flex;
    gap: 10px;
}

.ht-chip {
    font-size: 12.5px;
    color: var(--brand);
    background: linear-gradient(135deg, #eaf2fd 0%, #f4f8fe 100%);
    border: 1px solid rgba(35, 116, 221, 0.15);
    border-radius: 20px;
    padding: 7px 14px;
    font-weight: 500;
    transition: all 0.25s ease;
    box-shadow: 0 2px 6px rgba(35, 116, 221, 0.08);
}

.ht-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(35, 116, 221, 0.15);
}

/* 主体分栏 */
.planner-body {
    flex: 1;
    display: flex;
    gap: 20px;
    min-height: 0;
}

.map-col {
    width: 40%;
    min-width: 340px;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.map-col:hover {
    transform: translateY(-2px);
}

.tabs-col {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    border-radius: 16px;
    border: 1px solid rgba(35, 116, 221, 0.08);
    box-shadow: 0 4px 20px rgba(35, 116, 221, 0.08);
}

/* 标签头 */
.tabs-head {
    display: flex;
    gap: 6px;
    padding: 12px 18px 0;
    border-bottom: 1px solid var(--divider);
    flex-shrink: 0;
    background: linear-gradient(180deg, #fafcff 0%, #ffffff 100%);
}

.top-tab {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 20px 14px;
    font-size: 14px;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.25s ease;
    border-radius: 10px 10px 0 0;
}

.top-tab:hover {
    color: var(--brand);
    background: rgba(35, 116, 221, 0.04);
}

.top-tab.active {
    color: var(--brand);
    font-weight: 600;
    background: rgba(35, 116, 221, 0.06);
}

.top-tab.active::after {
    content: '';
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: -1px;
    height: 3px;
    background: linear-gradient(90deg, #2374DD 0%, #4a90e8 100%);
    border-radius: 3px 3px 0 0;
    box-shadow: 0 -2px 8px rgba(35, 116, 221, 0.3);
}

.tt-icon {
    font-size: 16px;
    transition: transform 0.25s ease;
}

.top-tab:hover .tt-icon {
    transform: scale(1.15);
}

.top-tab.active .tt-icon {
    transform: scale(1.2);
}

.tt-badge {
    font-size: 11px;
    background: linear-gradient(135deg, #2374DD 0%, #4a90e8 100%);
    color: #fff;
    padding: 2px 7px;
    border-radius: 10px;
    font-weight: 600;
}

.tabs-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
}

/* 滚动条美化 */
.tabs-body::-webkit-scrollbar {
    width: 6px;
}

.tabs-body::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #d3d9e1 0%, #b7bfca 100%);
    border-radius: 6px;
}

.tabs-body::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #b7bfca 0%, #9ca5b0 100%);
}
@media (max-width: 900px) {
    .planner-page { padding: 12px; gap: 12px; overflow-y: auto; }
    .planner-body { flex-direction: column; gap: 12px; min-height: auto; }
    .map-col { width: 100%; min-width: 0; flex-shrink: 0; height: 360px; }
    .tabs-col { width: 100%; min-height: 420px; }
    .tabs-head { flex-direction: column; padding: 10px 12px 0; gap: 4px; }
    .top-tab { width: 100%; min-height: 44px; padding: 10px 12px; justify-content: flex-start; white-space: nowrap; }
    .top-tab.active::after { left: 12px; right: 12px; bottom: 0; }
}
</style>
