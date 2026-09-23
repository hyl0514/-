<template>
  <div class="expense-tab">
    <!-- 统计看板 -->
    <div class="stat-grid">
      <div class="stat-card pc-card">
        <div class="stat-label">总预算</div>
        <div class="stat-value brand">
          <input class="budget-input" type="number" v-model.number="state.budget" min="0">
        </div>
        <div class="stat-foot">点击数字可修改</div>
      </div>
      <div class="stat-card pc-card">
        <div class="stat-label">预估总花费</div>
        <div class="stat-value gray">¥{{ estimatedTotal }}</div>
        <div class="stat-foot">来自选中场所与账单</div>
      </div>
      <div class="stat-card pc-card">
        <div class="stat-label">实际已花费</div>
        <div class="stat-value dark">¥{{ actualTotal }}</div>
        <div class="stat-foot">共 {{ state.bills.filter(b => b.actual != null).length }} 笔已结算</div>
      </div>
      <div class="stat-card pc-card" :class="{ danger: isOverrun }">
        <div class="stat-label">剩余金额</div>
        <div class="stat-value" :class="isOverrun ? 'red' : 'green'">
          {{ isOverrun ? '-' : '' }}¥{{ Math.abs(remaining) }}
        </div>
        <div class="stat-foot">{{ isOverrun ? '已超支，请控制花销' : '预算内可支配' }}</div>
      </div>
    </div>

    <!-- 预算使用进度 -->
    <div class="budget-bar pc-card">
      <div class="bb-head">
        <span class="bb-title">预算使用率 {{ usagePercent }}%</span>
        <span class="pc-tag" :class="isOverrun ? 'pc-tag-red' : usagePercent > 85 ? 'pc-tag-orange' : 'pc-tag-green'">
          {{ isOverrun ? '已超支' : usagePercent > 85 ? '临近上限' : '状态正常' }}
        </span>
      </div>
      <div class="bb-track">
        <div class="bb-fill" :class="{ over: isOverrun }" :style="{ width: Math.min(100, usagePercent) + '%' }"></div>
        <div class="bb-mark" style="left: 100%"></div>
      </div>
    </div>

    <!-- AI 操作 -->
    <div class="ai-row">
      <button class="pc-btn" @click="getAdvice">💡 AI 省钱建议</button>
      <button class="pc-btn" @click="getReview">📊 生成消费复盘报告</button>
      <button class="pc-btn pc-btn-primary" style="margin-left:auto" @click="openAdd">➕ 手动记账</button>
    </div>

    <!-- 账单列表 -->
    <div class="bill-card pc-card">
      <div class="bill-head">
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
        <span class="bill-count">共 {{ filteredBills.length }} 条</span>
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

    <!-- AI 文本弹窗 -->
    <teleport to="body">
      <div class="pc-mask" v-if="aiModal.show" @click.self="aiModal.show = false">
        <div class="pc-modal ai-modal-box">
          <div class="pc-modal-header">
            <span class="pc-modal-title">{{ aiModal.title }}</span>
            <span class="pc-modal-close" @click="aiModal.show = false">✕</span>
          </div>
          <div class="pc-modal-body">
            <pre class="ai-text">{{ aiModal.text }}</pre>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useExpenseStore } from '../../store/expenseStore'
import { useTripStore } from '../../store/tripStore'
import { getSavingAdvice, getReviewReport } from '../../utils/budgetApi'
import toast from '../../utils/msg'

const {
    state,
    estimatedTotal,
    actualTotal,
    remaining,
    usagePercent,
    isOverrun,
    addBill,
    updateBill,
    removeBill
} = useExpenseStore()

const { state: tripState } = useTripStore()

const filters = [
    { key: 'all', label: '全部' },
    { key: 'ai', label: '自动预估项' },
    { key: 'manual', label: '手动记账' }
]
const activeFilter = ref('all')

const filteredBills = computed(() => {
    if (activeFilter.value === 'all') return state.bills
    return state.bills.filter(b => b.source === activeFilter.value)
})

const billCats = ['酒店', '景点', '餐饮', '交通', '购物', '娱乐', '其他']

// ---------------- 弹窗表单 ----------------

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
        updateBill(editing.value.id, { ...form })
        toast.success('账单已更新')
    } else {
        addBill({ source: 'manual', ...form })
        toast.success('记账成功')
    }
    showForm.value = false
}

const onActualInput = (b, value) => {
    updateBill(b.id, { actual: value === '' ? null : Number(value) })
}

const onDelete = (b) => {
    removeBill(b.id)
    toast('账单已删除')
}

// ---------------- AI 分析 ----------------

const aiModal = reactive({ show: false, title: '', text: '' })

const buildPayload = () => ({
    destination: tripState.form.destination,
    totalBudget: state.budget,
    estimatedCost: estimatedTotal.value,
    actualCost: actualTotal.value,
    bills: state.bills.map(b => ({
        source: b.source, category: b.category, purpose: b.purpose,
        amount: b.actual != null ? b.actual : b.amount
    }))
})

const loading = ref(false)

const getAdvice = async () => {
    loading.value = true
    try {
        const data = await getSavingAdvice(buildPayload())
        aiModal.title = '💡 AI 省钱建议'
        aiModal.text = data.advice
        aiModal.show = true
    } catch (e) {
        toast.error('建议生成失败，请确认后端服务已启动')
    } finally {
        loading.value = false
    }
}

const getReview = async () => {
    loading.value = true
    try {
        const data = await getReviewReport(buildPayload())
        aiModal.title = '📊 消费复盘报告'
        aiModal.text = data.report
        aiModal.show = true
    } catch (e) {
        toast.error('报告生成失败，请确认后端服务已启动')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.expense-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

/* 统计卡片 */
.stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 13px;
}

.stat-card {
    padding: 16px 18px;
}

.stat-card.danger {
    border-color: #f3c4c6;
}

.stat-label {
    font-size: 13px;
    color: var(--text-3);
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    margin: 9px 0 5px;
    line-height: 1.2;
}

.stat-value.brand { color: var(--brand); }
.stat-value.gray { color: var(--text-3); }
.stat-value.dark { color: var(--text-1); }
.stat-value.red { color: var(--danger); }
.stat-value.green { color: var(--success); }

.budget-input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 24px;
    font-weight: 700;
    color: var(--brand);
    background: transparent;
    font-family: inherit;
    padding: 0;
}

.stat-foot {
    font-size: 12px;
    color: var(--text-3);
}

/* 进度条 */
.budget-bar {
    padding: 15px 18px;
}

.bb-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.bb-title {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-1);
}

.bb-track {
    height: 9px;
    background: #eef1f5;
    border-radius: 6px;
    position: relative;
    overflow: visible;
}

.bb-fill {
    height: 100%;
    background: linear-gradient(90deg, #2374DD, #5a97d6);
    border-radius: 6px;
    transition: width 0.4s ease;
}

.bb-fill.over {
    background: linear-gradient(90deg, #e5484d, #f27b7e);
}

/* AI 行 */
.ai-row {
    display: flex;
    gap: 10px;
}

/* 账单表 */
.bill-card {
    padding: 6px 0 0;
}

.bill-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-bottom: 1px solid var(--divider);
}

.bill-filters {
    display: flex;
    gap: 18px;
}

.bf-item {
    font-size: 13.5px;
    color: var(--text-3);
    cursor: pointer;
    position: relative;
    padding-bottom: 4px;
}

.bf-item.active {
    color: var(--brand);
    font-weight: 600;
}

.bf-item.active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -13px;
    height: 2px;
    background: var(--brand);
    border-radius: 2px;
}

.bill-count {
    font-size: 12.5px;
    color: var(--text-3);
}

.bill-table {
    padding: 4px 18px 14px;
}

.bt-row {
    display: grid;
    grid-template-columns: 90px 1fr 92px 100px 130px 110px;
    align-items: center;
    gap: 10px;
    padding: 12px 4px;
    border-bottom: 1px solid var(--divider);
    font-size: 13.5px;
}

.bt-th {
    font-size: 12.5px;
    color: var(--text-3);
    font-weight: 500;
}

.col-purpose {
    color: var(--text-1);
    font-weight: 500;
}

.col-amount.est {
    color: var(--text-3);
}

.cat-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    margin-right: 7px;
}

.dot-酒店 { background: var(--cat-hotel); }
.dot-景点 { background: var(--cat-view); }
.dot-餐饮 { background: var(--cat-food); }
.dot-娱乐 { background: var(--cat-fun); }
.dot-交通, .dot-购物, .dot-其他 { background: #98A2B1; }

.actual-input {
    width: 90px;
    height: 31px;
    border: 1px solid var(--border);
    border-radius: 7px;
    padding: 0 8px;
    font-size: 13px;
    color: var(--text-1);
    outline: none;
    font-family: inherit;
}

.actual-input:focus {
    border-color: var(--brand);
}

.actual-input::placeholder {
    color: var(--text-3);
}

.col-ops {
    display: flex;
    gap: 12px;
}

.op-link {
    font-size: 13px;
    color: var(--brand);
    cursor: pointer;
}

.op-link.danger {
    color: var(--text-3);
}

.op-link.danger:hover {
    color: var(--danger);
}

.no-bill {
    text-align: center;
    color: var(--text-3);
    font-size: 13px;
    padding: 30px 0;
}

/* 弹窗 */
.form-modal {
    width: 480px;
}

.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.ai-modal-box {
    width: 520px;
}

.ai-text {
    font-family: inherit;
    font-size: 14px;
    line-height: 1.9;
    color: var(--text-1);
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
}
</style>
