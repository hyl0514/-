<template>
  <div class="budget-table">
    <div class="budget-list">
      <div 
        v-for="(value, key) in budgetItems" 
        :key="key"
        class="budget-item"
      >
        <div class="budget-label">
          <span class="budget-icon">{{ getIcon(key) }}</span>
          <span>{{ getLabel(key) }}</span>
        </div>
        <div class="budget-value">
          <span class="amount">¥{{ value }}</span>
          <span class="percent">{{ getPercent(value) }}%</span>
        </div>
        <div class="budget-bar">
          <div class="bar-fill" :style="{ width: getPercent(value) + '%' }"></div>
        </div>
      </div>
    </div>
    <div class="budget-total">
      <span class="total-label">总计</span>
      <span class="total-amount">¥{{ total }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  total: {
    type: [Number, String],
    default: 0
  }
})

const budgetItems = computed(() => {
  return {
    accommodation: props.data.accommodation || 0,
    food: props.data.food || 0,
    transportation: props.data.transportation || 0,
    tickets: props.data.tickets || 0,
    other: props.data.other || 0
  }
})

const labelMap = {
  accommodation: '住宿',
  food: '餐饮',
  transportation: '交通',
  tickets: '门票',
  other: '其他'
}

const iconMap = {
  accommodation: '🏨',
  food: '🍜',
  transportation: '🚗',
  tickets: '🎫',
  other: '📦'
}

const getLabel = (key) => {
  return labelMap[key] || key
}

const getIcon = (key) => {
  return iconMap[key] || '💰'
}

const getPercent = (value) => {
  if (!props.total || value === 0) return 0
  return Math.round((value / props.total) * 100)
}
</script>

<style scoped>
.budget-table {
  margin-top: 8px;
}

.budget-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.budget-item {
  padding: 12px 14px;
  background: #f7f9fc;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.budget-item:hover {
  background: #f0f4f8;
  transform: translateX(4px);
}

.budget-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
}

.budget-icon {
  font-size: 16px;
}

.budget-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.amount {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.percent {
  font-size: 12px;
  color: #4a90d9;
  font-weight: 500;
}

.budget-bar {
  height: 6px;
  background: rgba(74, 144, 217, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a90d9 0%, #6ba3e0 100%);
  border-radius: 3px;
  transition: width 0.8s ease-out;
}

.budget-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 16px;
  background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%);
  border-radius: 12px;
  margin-top: 12px;
  color: white;
  box-shadow: 0 4px 15px rgba(74, 144, 217, 0.25);
}

.total-label {
  font-size: 16px;
  font-weight: 600;
}

.total-amount {
  font-size: 22px;
  font-weight: 700;
}
</style>
