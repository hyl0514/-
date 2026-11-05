<template>
  <div class="budget-page">
    <!-- 顶部导航 -->
    <header class="bp-header">
      <div class="bp-header-left">
        <div class="bp-header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div>
          <div class="bp-header-title">预算支出管理</div>
          <div class="bp-header-sub">智能预算规划 · 分类统计可视化</div>
        </div>
      </div>
    </header>

    <!-- 预算设置 + 花销概览 -->
    <div class="bp-top-row">
      <div class="bp-card bp-set-card">
        <div class="card-label">本次出行预算</div>
        <div class="budget-input-row">
          <span class="yuan-sign">¥</span>
          <input class="big-budget-input" type="number" min="0" v-model.number="exp.state.budget">
        </div>
        <p class="set-hint">与「行程规划 → 花销记账」实时同步</p>
        <div class="save-plan-row">
          <input class="plan-name-input" v-model="planName" placeholder="为本次方案命名，如 成都5日行">
          <button class="save-plan-btn" @click="onSavePlan">保存方案</button>
        </div>
      </div>

      <div class="bp-card bp-overview-card">
        <div class="card-label">花销概览</div>
        <div class="ov-item">
          <span class="ov-label">预估总花费</span>
          <span class="ov-value gray">¥{{ exp.estimatedTotal.value }}</span>
        </div>
        <div class="ov-item">
          <span class="ov-label">实际已花费</span>
          <span class="ov-value dark">¥{{ exp.actualTotal.value }}</span>
        </div>
        <div class="ov-item">
          <span class="ov-label">剩余可支配</span>
          <span class="ov-value" :class="exp.isOverrun.value ? 'red' : 'green'">
            {{ exp.isOverrun.value ? '-' : '' }}¥{{ Math.abs(exp.remaining.value) }}
          </span>
        </div>
        <!-- 预算进度环 -->
        <div class="budget-ring-wrap">
          <svg class="budget-ring" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#34D399;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FBBF24;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#EF4444;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#F87171;stop-opacity:1" />
              </linearGradient>
            </defs>
            <circle class="ring-bg" cx="60" cy="60" r="50"/>
            <circle class="ring-fill" cx="60" cy="60" r="50"
              :stroke-dasharray="`${ringDash} 314`"
              :class="exp.isOverrun.value ? 'ring-red' : exp.usagePercent.value >= 85 ? 'ring-orange' : 'ring-green'"/>
            <text x="60" y="56" text-anchor="middle" class="ring-pct">{{ exp.usagePercent.value }}%</text>
            <text x="60" y="72" text-anchor="middle" class="ring-label">已使用</text>
          </svg>
        </div>
        <!-- 预警 -->
        <div class="warn-bar" :class="exp.isOverrun.value ? 'w-red' : exp.usagePercent.value >= 85 ? 'w-orange' : 'w-green'">
          <template v-if="exp.isOverrun.value">⚠️ 已超预算 ¥{{ Math.abs(exp.remaining.value) }}，建议暂停非必要消费</template>
          <template v-else-if="exp.usagePercent.value >= 85">💡 接近预算上限（{{ exp.usagePercent.value }}%），请量力而行</template>
          <template v-else>✅ 预算使用合理（{{ exp.usagePercent.value }}%）</template>
        </div>
      </div>
    </div>

    <!-- 分类统计图表 -->
    <div class="bp-card bp-chart-card">
      <div class="card-label">分类统计</div>
      <BudgetTable :data="categoryData" :total="exp.actualTotal.value" />
    </div>

    <!-- 账单列表 -->
    <div class="bp-card bp-bill-card">
      <div class="card-head-row">
        <span class="card-label">账单记录</span>
        <button class="add-bill-btn" @click="openAdd">➕ 手动记账</button>
      </div>
      
      <div class="bill-filters">
        <span
          v-for="f in filters"
          :key="f.key"
          class="bf-item"
          :class="{ active: activeFilter === f.key }"
          @click="activeFilter = f.key"
        >
          {{ f.label }}
        </span>
      </div>

      <div class="bill-table">
        <div class="bt-row bt-th">
          <span class="col-cat">类别</span>
          <span class="col-purpose">消费用途</span>
          <span class="col-source">来源</span>
          <span class="col-amount">预估(元)</span>
          <span class="col-actual">实际花费(元)</span>
          <span class="col-ops">操作</span>
        </div>

        <div class="bt-row" v-for="b in filteredBills" :key="b.id">
          <span class="col-cat">
            <span class="cat-dot" :class="'dot-' + b.category"></span>{{ b.category }}
          </span>
          <span class="col-purpose">{{ b.purpose }}</span>
          <span class="col-source">
            <span class="pc-tag" :class="b.source === 'ai' ? 'pc-tag-gray' : 'pc-tag-orange'">
              {{ b.source === 'ai' ? '自动预估' : '手动' }}
            </span>
          </span>
          <span class="col-amount est">{{ b.amount }}</span>
          <span class="col-actual">
            <input
              class="actual-input"
              type="number"
              min="0"
              :value="b.actual"
              placeholder="未支付"
              @input="onActualInput(b, $event.target.value)"
            >
          </span>
          <span class="col-ops">
            <span class="op-link" @click="openEdit(b)">编辑</span>
            <span class="op-link danger" @click="onDelete(b)">删除</span>
          </span>
        </div>

        <div class="no-bill" v-if="!filteredBills.length">
          暂无账单，添加场所或手动记一笔吧
        </div>
      </div>
    </div>

    <!-- 历史预算方案 -->
    <div class="bp-card bp-history-card">
      <div class="card-head-row">
        <span class="card-label">历史预算方案</span>
        <span class="hist-count">{{ exp.state.planHistory.length }} 份</span>
      </div>
      <div class="hist-table" v-if="exp.state.planHistory.length">
        <div class="ht-th">
          <span>方案名称</span><span>总预算</span><span>账单数</span><span>保存日期</span><span>操作</span>
        </div>
        <div class="ht-row" v-for="p in exp.state.planHistory" :key="p.id">
          <span class="hp-name">{{ p.destination }}</span>
          <span>¥{{ p.budget }}</span>
          <span>{{ p.billCount }} 条</span>
          <span>{{ p.savedAt }}</span>
          <span class="op-del" @click="onRemovePlan(p.id)">删除</span>
        </div>
      </div>
      <div class="hist-empty" v-else>暂无历史方案，保存后可随时调取对比</div>
    </div>

    <!-- 新增/编辑账单弹窗 -->
    <teleport to="body">
      <div class="pc-mask" v-if="showForm" @click.self="showForm = false">
        <div class="pc-modal form-modal">
          <div class="pc-modal-header">
            <span class="pc-modal-title">{{ editing ? '编辑账单' : '手动记账' }}</span>
            <span class="pc-modal-close" @click="showForm = false">✕</span>
          </div>
          <div class="pc-modal-body">
            <label class="pc-label">消费用途</label>
            <input class="pc-input" v-model="form.purpose" placeholder="例如：打车去机场">
            <label class="pc-label" style="margin-top:15px">类别</label>
            <select class="pc-select" v-model="form.category">
              <option v-for="c in billCats" :key="c" :value="c">{{ c }}</option>
            </select>
            <div class="two-col">
              <div>
                <label class="pc-label" style="margin-top:15px">预估金额（元）</label>
                <input class="pc-input" type="number" min="0" v-model.number="form.amount">
              </div>
              <div>
                <label class="pc-label" style="margin-top:15px">实际花费（元，可选）</label>
                <input class="pc-input" type="number" min="0" v-model.number="form.actual" placeholder="未支付留空">
              </div>
            </div>
            <label class="pc-label" style="margin-top:15px">消费日期</label>
            <input class="pc-input" type="date" v-model="form.date">
          </div>
          <div class="pc-modal-footer">
            <button class="pc-btn" @click="showForm = false">取消</button>
            <button class="pc-btn pc-btn-primary" @click="submitForm">确定</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useExpenseStore } from '../store/expenseStore'
import { useTripStore } from '../store/tripStore'
import BudgetTable from '../components/BudgetTable.vue'
import toast from '../utils/msg'

const exp = useExpenseStore()
const trip = useTripStore()

const planName = ref('')
const ringDash = computed(() => {
  const pct = Math.min(exp.usagePercent.value, 100)
  return Math.round((pct / 100) * 314)
})

// 分类统计数据
const categoryData = computed(() => {
  const bills = exp.state.bills
  const data = {
    accommodation: 0,
    food: 0,
    transportation: 0,
    tickets: 0,
    other: 0
  }
  bills.forEach(b => {
    const amount = b.actual != null ? b.actual : b.amount
    if (b.category === '酒店') data.accommodation += amount
    else if (b.category === '餐饮') data.food += amount
    else if (b.category === '交通') data.transportation += amount
    else if (b.category === '景点') data.tickets += amount
    else data.other += amount
  })
  return data
})

// 账单筛选
const filters = [
  { key: 'all', label: '全部' },
  { key: 'ai', label: '自动预估项' },
  { key: 'manual', label: '手动记账' }
]
const activeFilter = ref('all')

const filteredBills = computed(() => {
  if (activeFilter.value === 'all') return exp.state.bills
  return exp.state.bills.filter(b => b.source === activeFilter.value)
})

const billCats = ['酒店', '景点', '餐饮', '交通', '购物', '娱乐', '其他']

// 账单表单
const showForm = ref(false)
const editing = ref(null)
const form = reactive({ purpose: '', category: '其他', amount: 0, actual: null, date: '' })

const resetForm = () => {
  form.purpose = ''
  form.category = '其他'
  form.amount = 0
  form.actual = null
  form.date = new Date().toISOString().slice(0, 10)
}

const openAdd = () => {
  editing.value = null
  resetForm()
  showForm.value = true
}

const openEdit = (b) => {
  editing.value = b
  form.purpose = b.purpose
  form.category = b.category
  form.amount = b.amount
  form.actual = b.actual
  form.date = b.date
  showForm.value = true
}

const submitForm = () => {
  if (!form.purpose.trim()) { toast.error('请填写消费用途'); return }
  if (editing.value) {
    exp.updateBill(editing.value.id, { ...form })
    toast.success('账单已更新')
  } else {
    exp.addBill({ source: 'manual', ...form })
    toast.success('记账成功')
  }
  showForm.value = false
}

const onActualInput = (b, value) => {
  exp.updateBill(b.id, { actual: value === '' ? null : Number(value) })
}

const onDelete = (b) => {
  exp.removeBill(b.id)
  toast('账单已删除')
}

// 预算方案
const onSavePlan = () => {
  if (!exp.state.budget || exp.state.budget <= 0) { toast.error('请先填写有效的总预算'); return }
  exp.savePlan(planName.value.trim() || trip.state.form.destination)
  planName.value = ''
  toast.success('预算方案已保存')
}

const onRemovePlan = (id) => { 
  exp.removePlan(id)
  toast('方案已删除') 
}
</script>

<style scoped>
.budget-page {
  height: 100%;
  overflow-y: auto;
  padding: 22px 26px 40px;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

/* 顶部导航 */
.bp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
  position: relative;
  z-index: 1;
  padding: 18px 24px;
  background: linear-gradient(135deg, rgba(35,116,221,0.08), rgba(14,165,164,0.08));
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}
.bp-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.bp-header-icon {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #2374DD, #0EA5A4);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 20px rgba(35,116,221,0.35);
  transition: all 0.3s ease;
}
.bp-header-icon:hover {
  transform: translateY(-2px) rotate(5deg);
  box-shadow: 0 8px 25px rgba(35,116,221,0.45);
}
.bp-header-title { 
  font-size: 23px; 
  font-weight: 700;
  background: linear-gradient(135deg, #2374DD, #0EA5A4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.bp-header-sub { 
  font-size: 13px; 
  color: var(--text-2); 
  margin-top: 3px;
  font-weight: 500;
}

/* 通用卡片 */
.bp-card {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 18px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.95);
  box-shadow: 0 6px 28px rgba(0,0,0,0.08);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 18px;
  position: relative;
  overflow: hidden;
}
.bp-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2374DD, #0EA5A4);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.bp-card:hover { 
  box-shadow: 0 12px 40px rgba(35,116,221,0.15); 
  transform: translateY(-4px);
}
.bp-card:hover::before {
  opacity: 1;
}
.card-label {
  font-size: 16px; 
  font-weight: 700;
  margin-bottom: 18px;
  display: flex; 
  align-items: center; 
  gap: 10px;
  color: var(--text-1);
  position: relative;
  padding-left: 12px;
}
.card-label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, #2374DD, #0EA5A4);
  border-radius: 2px;
}

/* 顶部两栏 */
.bp-top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}

/* 预算设置 */
.budget-input-row { 
  display: flex; 
  align-items: baseline; 
  gap: 8px; 
  margin: 14px 0 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(35,116,221,0.05), rgba(14,165,164,0.05));
  border-radius: 12px;
  border: 1px solid rgba(35,116,221,0.1);
  transition: all 0.3s ease;
}
.budget-input-row:focus-within {
  border-color: rgba(35,116,221,0.3);
  box-shadow: 0 0 0 3px rgba(35,116,221,0.08);
}
.yuan-sign { 
  font-size: 24px; 
  font-weight: 700; 
  background: linear-gradient(135deg, #2374DD, #0EA5A4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.big-budget-input {
  border: none; outline: none;
  font-size: 42px; font-weight: 700;
  background: linear-gradient(135deg, #2374DD, #0EA5A4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  width: 100%; font-family: inherit;
  background-color: transparent;
}
.set-hint { 
  font-size: 12.5px; 
  color: var(--text-3); 
  padding: 12px 0;
  border-bottom: 1px solid var(--divider);
  display: flex;
  align-items: center;
  gap: 6px;
}
.set-hint::before {
  content: '💡';
  font-size: 14px;
}
.save-plan-row { display: flex; gap: 12px; margin-top: 16px; }
.plan-name-input {
  flex: 1; padding: 12px 16px;
  border: 1.5px solid var(--divider); border-radius: 12px;
  font-size: 14px; outline: none;
  transition: all 0.3s ease;
  background: rgba(255,255,255,0.8);
}
.plan-name-input:focus { 
  border-color: #2374DD;
  box-shadow: 0 0 0 3px rgba(35,116,221,0.08);
  background: #fff;
}
.save-plan-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #2374DD, #0EA5A4);
  color: #fff; border: none; border-radius: 12px;
  font-size: 14px; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(35,116,221,0.3);
  position: relative;
  overflow: hidden;
}
.save-plan-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s ease;
}
.save-plan-btn:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 6px 22px rgba(35,116,221,0.4);
}
.save-plan-btn:hover::before {
  left: 100%;
}
.save-plan-btn:active {
  transform: translateY(0);
}

/* 花销概览 */
.ov-item {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 14px 0; border-bottom: 1px solid var(--divider);
  transition: all 0.2s ease;
}
.ov-item:hover {
  padding-left: 8px;
  background: linear-gradient(90deg, rgba(35,116,221,0.03), transparent);
  border-radius: 8px;
}
.ov-item:last-of-type {
  border-bottom: none;
}
.ov-label { 
  font-size: 14px; 
  color: var(--text-2);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ov-value { font-size: 22px; font-weight: 700; transition: all 0.3s ease; }
.ov-value.gray { color: var(--text-3); }
.ov-value.dark { color: var(--text-1); }
.ov-value.red { color: var(--danger); }
.ov-value.green { color: var(--success); }

/* 预算环 */
.budget-ring-wrap { 
  display: flex; 
  justify-content: center; 
  margin: 20px 0;
  position: relative;
}
.budget-ring-wrap::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(35,116,221,0.05) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
}
.budget-ring { 
  width: 130px; 
  height: 130px;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.08));
}
.ring-bg { fill: none; stroke: #e8ecf1; stroke-width: 12; }
.ring-fill {
  fill: none; stroke-width: 12; stroke-linecap: round;
  transform: rotate(-90deg); transform-origin: 60px 60px;
  transition: stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
}
.ring-green { stroke: url(#greenGradient); }
.ring-orange { stroke: url(#orangeGradient); }
.ring-red { stroke: url(#redGradient); }
.ring-pct { font-size: 26px; font-weight: 700; fill: var(--text-1); }
.ring-label { font-size: 12px; fill: var(--text-3); font-weight: 500; }

/* 预警 */
.warn-bar {
  margin-top: 16px; 
  border-radius: 12px; 
  padding: 14px 16px;
  font-size: 13.5px; 
  line-height: 1.6;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}
.warn-bar:hover {
  transform: translateX(4px);
}
.w-green { 
  background: linear-gradient(135deg, #ECFDF5, #D1FAE5); 
  color: #059669;
  border-color: rgba(16,185,129,0.2);
}
.w-orange { 
  background: linear-gradient(135deg, #FFFBEB, #FEF3C7); 
  color: #D97706;
  border-color: rgba(245,158,11,0.2);
}
.w-red { 
  background: linear-gradient(135deg, #FEF2F2, #FEE2E2); 
  color: #DC2626;
  border-color: rgba(239,68,68,0.2);
}

/* 账单卡片 */
.card-head-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--divider);
}
.add-bill-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #2374DD, #0EA5A4);
  color: #fff; border: none; border-radius: 10px;
  font-size: 13.5px; font-weight: 600;
  cursor: pointer; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(35,116,221,0.3);
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  overflow: hidden;
}
.add-bill-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s ease;
}
.add-bill-btn:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 6px 18px rgba(35,116,221,0.4);
}
.add-bill-btn:hover::before {
  left: 100%;
}
.add-bill-btn:active {
  transform: translateY(0);
}

.bill-filters {
  display: flex; 
  gap: 20px;
  padding: 14px 0;
  margin-bottom: 14px;
  border-bottom: 2px solid var(--divider);
}
.bf-item {
  font-size: 14px; 
  color: var(--text-3);
  cursor: pointer; 
  position: relative;
  padding: 6px 0;
  font-weight: 500;
  transition: all 0.3s ease;
}
.bf-item:hover {
  color: var(--brand);
}
.bf-item.active {
  color: var(--brand); 
  font-weight: 700;
}
.bf-item.active::after {
  content: ''; 
  position: absolute;
  left: 0; 
  right: 0; 
  bottom: -16px;
  height: 3px; 
  background: linear-gradient(90deg, #2374DD, #0EA5A4);
  border-radius: 3px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.bill-table { padding: 6px 0; }
.bt-row {
  display: grid;
  grid-template-columns: 90px 1fr 92px 100px 130px 110px;
  align-items: center; 
  gap: 12px;
  padding: 14px 8px; 
  border-bottom: 1px solid var(--divider);
  font-size: 14px;
  transition: all 0.2s ease;
  border-radius: 8px;
}
.bt-row:hover {
  background: linear-gradient(90deg, rgba(35,116,221,0.04), rgba(14,165,164,0.02));
  padding-left: 12px;
}
.bt-th { 
  font-size: 13px; 
  color: var(--text-3); 
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.col-purpose { color: var(--text-1); font-weight: 600; }
.col-amount.est { color: var(--text-3); font-weight: 500; }

.cat-dot {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%; 
  margin-right: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}
.bt-row:hover .cat-dot {
  transform: scale(1.3);
}
.dot-酒店 { background: linear-gradient(135deg, #8B5CF6, #A78BFA); }
.dot-景点 { background: linear-gradient(135deg, #10B981, #34D399); }
.dot-餐饮 { background: linear-gradient(135deg, #F59E0B, #FBBF24); }
.dot-娱乐 { background: linear-gradient(135deg, #EC4899, #F472B6); }
.dot-交通 { background: linear-gradient(135deg, #3B82F6, #60A5FA); }
.dot-购物 { background: linear-gradient(135deg, #EF4444, #F87171); }
.dot-其他 { background: linear-gradient(135deg, #6B7280, #9CA3AF); }

.actual-input {
  width: 95px; 
  height: 34px;
  border: 1.5px solid var(--border); 
  border-radius: 8px;
  padding: 0 10px; 
  font-size: 13.5px;
  color: var(--text-1); 
  outline: none;
  font-family: inherit;
  transition: all 0.3s ease;
  background: rgba(255,255,255,0.8);
}
.actual-input:focus { 
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(35,116,221,0.08);
  background: #fff;
}
.actual-input::placeholder { color: var(--text-3); }

.col-ops { display: flex; gap: 14px; }
.op-link { 
  font-size: 13.5px; 
  color: var(--brand); 
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}
.op-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--brand);
  transition: width 0.3s ease;
}
.op-link:hover::after {
  width: 100%;
}
.op-link.danger { color: var(--text-3); }
.op-link.danger:hover { color: var(--danger); }
.op-link.danger:hover::after {
  background: var(--danger);
}

.no-bill {
  text-align: center; 
  color: var(--text-3);
  font-size: 14px; 
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.no-bill::before {
  content: '📋';
  font-size: 48px;
  opacity: 0.3;
}

/* 历史表 */
.hist-count { 
  font-size: 13px; 
  color: var(--text-3);
  font-weight: 600;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(35,116,221,0.08), rgba(14,165,164,0.08));
  border-radius: 12px;
}
.ht-th, .ht-row {
  display: grid; 
  grid-template-columns: 1.6fr 1fr 1fr 1fr 70px;
  gap: 12px; 
  padding: 14px 8px; 
  font-size: 14px;
  transition: all 0.2s ease;
  border-radius: 8px;
}
.ht-th { 
  font-size: 13px; 
  color: var(--text-3); 
  font-weight: 600;
  border-bottom: 2px solid var(--divider);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.ht-row { 
  border-bottom: 1px solid var(--divider);
}
.ht-row:hover {
  background: linear-gradient(90deg, rgba(35,116,221,0.04), rgba(14,165,164,0.02));
  padding-left: 12px;
}
.hp-name { font-weight: 700; color: var(--text-1); }
.op-del { 
  color: var(--text-3); 
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}
.op-del:hover { 
  color: var(--danger);
  transform: translateX(2px);
}
.hist-empty { 
  text-align: center; 
  color: var(--text-3); 
  font-size: 14px; 
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.hist-empty::before {
  content: '📁';
  font-size: 48px;
  opacity: 0.3;
}

/* 弹窗 */
.form-modal { 
  width: 520px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes modalSlideIn {
  from {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
</style>
