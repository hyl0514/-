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
}
</style>
