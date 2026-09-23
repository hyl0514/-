<template>
  <div class="budget-page">
    <!-- 头部 -->
    <header class="page-header">
      <div>
        <h1 class="page-title">预算支出</h1>
        <p class="page-desc">管理出行预算方案，与「行程规划 → 花销记账」实时同步</p>
      </div>
    </header>

    <div class="budget-wrap">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useExpenseStore } from '../store/expenseStore'
import { useTripStore } from '../store/tripStore'
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
</script>

<style scoped>
.budget-page {
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
</style>
