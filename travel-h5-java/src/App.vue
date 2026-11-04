<script setup>
import SideNav from './components/SideNav.vue'
</script>

<template>
  <div class="layout">
    <!-- 左侧固定导航 -->
    <SideNav />

    <!-- 右侧内容区 -->
    <main class="content">
      <router-view v-slot="{ Component }">
        <component :is="Component" class="fade-enter" />
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  position: relative;
  /* 固定背景图 - 不随页面滚动 */
  background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=3840&q=100');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
</style>
