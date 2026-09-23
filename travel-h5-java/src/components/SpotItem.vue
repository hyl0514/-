<template>
  <div class="spot-item" v-if="data">
    <div class="spot-header">
      <div class="spot-name">{{ data.spot || data.name || '待定' }}</div>
      <div class="spot-tags">
        <span class="spot-tag" v-if="data.duration">
          <van-icon name="clock-o" size="12" /> {{ data.duration }}
        </span>
        <span class="spot-tag" v-if="data.ticket">
          <van-icon name="ticket-o" size="12" /> {{ data.ticket }}
        </span>
        <span class="spot-tag" v-if="data.transportation">
          <van-icon name="logistics" size="12" /> {{ data.transportation }}
        </span>
      </div>
    </div>
    <div class="spot-desc" v-if="data.description">{{ data.description }}</div>
  </div>
  <div class="spot-item empty" v-else>
    <van-empty description="暂无安排" :image-size="40" />
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style scoped>
.spot-item {
  padding: 12px 0;
  animation: spotFadeIn 0.4s ease-out;
}

@keyframes spotFadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.spot-item.empty {
  padding: 20px 0;
}

.spot-header {
  margin-bottom: 10px;
}

.spot-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 8px;
}

.spot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spot-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  font-size: 12px;
  color: #666;
  background: rgba(74, 144, 217, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.spot-tag:hover {
  background: rgba(74, 144, 217, 0.15);
  transform: scale(1.02);
}

.spot-desc {
  font-size: 14px;
  color: #969799;
  line-height: 1.6;
  padding-left: 4px;
}
</style>
