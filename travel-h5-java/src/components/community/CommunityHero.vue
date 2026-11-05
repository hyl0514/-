<template>
  <!-- 旅友空间 Hero Banner -->
  <section class="ch-wrap">
    <div class="ch-bg">
      <div class="ch-blob b1"></div>
      <div class="ch-blob b2"></div>
      <div class="ch-blob b3"></div>
    </div>

    <div class="ch-content">
      <div class="ch-left">
        <div class="ch-title">✈️ 旅友空间 · 发现千万人的旅行攻略</div>
        <div class="ch-sub">真实游记、避坑指南、美食打卡、行程分享</div>
        <div class="ch-data">
          <span>🔥 社区动态 <b>{{ stats.total }}</b></span>
          <span>📅 今日新发 <b>{{ stats.today }}</b></span>
        </div>
      </div>

      <button class="ch-publish" @click="$emit('publish')">
        <span class="cp-icon">+</span>
        <span class="cp-text">发布我的旅途</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useCommunityStore } from '../../store/communityStore'

defineEmits(['publish'])

const { stats } = useCommunityStore()
</script>

<style scoped>
.ch-wrap {
    position: relative;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(35, 116, 221, 0.12);
    margin-bottom: 16px;
}

.ch-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #e8f0ff 0%, #f0f7ff 50%, #e8fbfa 100%);
    overflow: hidden;
}

.ch-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    opacity: 0.3;
}
.ch-blob.b1 { width: 360px; height: 360px; top: -100px; right: -80px; background: radial-gradient(circle, #2374DD, transparent 70%); }
.ch-blob.b2 { width: 280px; height: 280px; bottom: -60px; left: -50px; background: radial-gradient(circle, #0EA5A4, transparent 70%); opacity: 0.25; }
.ch-blob.b3 { width: 200px; height: 200px; top: 20%; left: 40%; background: radial-gradient(circle, #E8912F, transparent 70%); opacity: 0.2; }

.ch-content {
    position: relative;
    padding: 32px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.ch-title {
    font-size: 22px;
    font-weight: 700;
    color: #1a2a4a;
}

.ch-sub {
    font-size: 13px;
    color: #566a8a;
    margin-top: 8px;
}

.ch-data {
    display: flex;
    gap: 24px;
    margin-top: 14px;
    font-size: 13px;
    color: #6b7c9a;
}

.ch-data b {
    color: #2374DD;
    font-weight: 700;
    margin-left: 4px;
}

.ch-publish {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 13px 28px;
    border: none;
    border-radius: 28px;
    background: linear-gradient(135deg, #2374DD, #0EA5A4);
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(35, 116, 221, 0.4);
    transition: all 0.2s ease;
}

.ch-publish:hover {
    transform: scale(1.04);
    box-shadow: 0 12px 32px rgba(35, 116, 221, 0.5);
}

.cp-icon {
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
}
@media (max-width: 900px) {
    .ch-content { flex-direction: column; align-items: stretch; gap: 16px; padding: 22px 16px; }
    .ch-title { font-size: 19px; line-height: 1.4; }
    .ch-data { gap: 14px; flex-wrap: wrap; }
    .ch-publish { width: 100%; justify-content: center; min-height: 44px; }
}
</style>
