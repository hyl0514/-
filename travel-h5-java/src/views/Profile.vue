<template>
  <div class="profile-container">
    <!-- 动态背景装饰 -->
    <div class="profile-bg">
      <!-- 背景圆形装饰 -->
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
      
      <!-- 山脉轮廓 -->
      <div class="mountains">
        <div class="mountain m1"></div>
        <div class="mountain m2"></div>
        <div class="mountain m3"></div>
      </div>
      
      <!-- 漂浮的云朵 -->
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
      
      <!-- 漂浮气球 -->
      <div class="balloon balloon-1">🎈</div>
      <div class="balloon balloon-2">🎈</div>
    </div>
    
    <van-nav-bar 
      title="我的" 
      left-text="" 
      left-arrow="false"
      class="custom-nav"
    />
    
    <!-- 用户信息区域 -->
    <div class="user-info animate-fade-in">
      <div class="user-info-bg"></div>
      <div class="user-info-content">
        <div class="avatar-wrapper">
          <van-image 
            :src="userAvatar" 
            round 
            class="avatar"
          />
          <div class="avatar-badge">✨</div>
          <div class="avatar-ring"></div>
        </div>
        <div class="user-details">
          <h2 class="user-name">{{ userName }}</h2>
          <p class="user-desc">欢迎使用智能旅游助手</p>
        </div>
        
        <!-- 用户等级 -->
        <div class="user-level">
          <div class="level-badge">Lv.{{ userLevel }}</div>
          <div class="level-progress">
            <div class="level-bar">
              <div class="level-fill" :style="{ width: levelProgress + '%' }"></div>
            </div>
            <span class="level-text">再规划 {{ levelProgress }}% 升级</span>
          </div>
        </div>
        
        <!-- 用户统计 -->
        <div class="user-stats">
          <div class="stat-item" @click="showToast('收藏列表')">
            <div class="stat-icon">⭐</div>
            <div class="stat-value">{{ stats.favorites }}</div>
            <div class="stat-label">收藏</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="showToast('行程列表')">
            <div class="stat-icon">🗺️</div>
            <div class="stat-value">{{ stats.trips }}</div>
            <div class="stat-label">行程</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="showToast('足迹地图')">
            <div class="stat-icon">👣</div>
            <div class="stat-value">{{ stats.footprints }}</div>
            <div class="stat-label">足迹</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 旅行成就 -->
    <div class="menu-section animate-slide-up" style="animation-delay: 0.1s">
      <h3 class="menu-title">
        <span class="menu-icon">🏆</span> 旅行成就
      </h3>
      <div class="achievements-grid">
        <div 
          class="achievement-item" 
          v-for="(achievement, index) in achievements" 
          :key="index"
          :class="{ unlocked: achievement.unlocked }"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-name">{{ achievement.name }}</div>
          <div class="achievement-desc">{{ achievement.desc }}</div>
        </div>
      </div>
    </div>
    
    <!-- 功能菜单 -->
    <div class="menu-section animate-slide-up" style="animation-delay: 0.2s">
      <h3 class="menu-title">
        <span class="menu-icon">🎫</span> 我的服务
      </h3>
      <van-cell-group class="menu-group">
        <van-cell 
          title="我的收藏" 
          is-link 
          icon="star-o"
          class="menu-item"
          @click="showToast('功能开发中，敬请期待')"
        >
          <template #right-icon>
            <van-icon name="arrow" size="16" color="#999" />
          </template>
        </van-cell>
        <van-cell 
          title="历史行程记录" 
          is-link 
          icon="history"
          class="menu-item"
          @click="showToast('功能开发中，敬请期待')"
        >
          <template #right-icon>
            <van-icon name="arrow" size="16" color="#999" />
          </template>
        </van-cell>
        <van-cell 
          title="系统设置" 
          is-link 
          icon="settings"
          class="menu-item"
          @click="showToast('功能开发中，敬请期待')"
        >
          <template #right-icon>
            <van-icon name="arrow" size="16" color="#999" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    
    <!-- 我的收藏列表 -->
    <div class="menu-section animate-slide-up" style="animation-delay: 0.25s">
      <h3 class="menu-title">
        <span class="menu-icon">❤️</span> 我的收藏
        <span class="menu-badge">{{ stats.favorites }}</span>
      </h3>
      <div class="favorite-list" v-if="!favoritesLoading">
        <div 
          class="favorite-item" 
          v-for="(item, index) in favorites" 
          :key="index"
          @click="handleViewFavorite(item)"
        >
          <div class="favorite-icon">📍</div>
          <div class="favorite-info">
            <div class="favorite-title">{{ item.city }} · {{ item.days }}天行程</div>
            <div class="favorite-desc">预算 ¥{{ item.totalBudget }}</div>
            <div class="favorite-time">{{ formatTime(item.createdAt) }}</div>
          </div>
          <van-icon 
            name="delete" 
            size="18" 
            color="#ff6b6b" 
            class="favorite-delete"
            @click.stop="handleRemoveFavorite(item, index)"
          />
        </div>
        <div class="favorite-empty" v-if="favorites.length === 0">
          <div class="empty-icon">💝</div>
          <div class="empty-text">暂无收藏的行程</div>
          <div class="empty-hint">去规划一个行程并收藏吧</div>
        </div>
      </div>
      <div class="loading-tip" v-else>
        <van-loading size="20px" /> 加载中...
      </div>
    </div>
    
    <!-- 快捷操作 -->
    <div class="menu-section animate-slide-up" style="animation-delay: 0.3s">
      <h3 class="menu-title">
        <span class="menu-icon">⚡</span> 快捷操作
      </h3>
      <div class="quick-actions-grid">
        <div class="quick-action-item" @click="showToast('功能开发中，敬请期待')">
          <div class="action-icon-wrap action-gold">
            <span class="action-icon">🎁</span>
          </div>
          <div class="action-text">优惠券</div>
        </div>
        <div class="quick-action-item" @click="showToast('功能开发中，敬请期待')">
          <div class="action-icon-wrap action-blue">
            <span class="action-icon">📞</span>
          </div>
          <div class="action-text">客服中心</div>
        </div>
        <div class="quick-action-item" @click="showToast('功能开发中，敬请期待')">
          <div class="action-icon-wrap action-green">
            <span class="action-icon">💬</span>
          </div>
          <div class="action-text">意见反馈</div>
        </div>
        <div class="quick-action-item" @click="showToast('功能开发中，敬请期待')">
          <div class="action-icon-wrap action-purple">
            <span class="action-icon">🏆</span>
          </div>
          <div class="action-text">会员中心</div>
        </div>
      </div>
    </div>
    
    <!-- 最近浏览 -->
    <div class="menu-section animate-slide-up" style="animation-delay: 0.4s">
      <h3 class="menu-title">
        <span class="menu-icon">👀</span> 最近浏览
      </h3>
      <div class="recent-list">
        <div class="recent-item" v-for="(item, index) in recentTrips" :key="index">
          <div class="recent-icon">{{ item.icon }}</div>
          <div class="recent-info">
            <div class="recent-title">{{ item.title }}</div>
            <div class="recent-desc">{{ item.desc }}</div>
          </div>
          <van-icon name="arrow" size="14" color="#ccc" />
        </div>
        <div class="recent-empty" v-if="recentTrips.length === 0">
          <van-empty description="暂无浏览记录" :image-size="40" />
        </div>
      </div>
    </div>
    
    <!-- 关于我们 -->
    <div class="menu-section animate-slide-up" style="animation-delay: 0.5s">
      <h3 class="menu-title">
        <span class="menu-icon">ℹ️</span> 关于平台
      </h3>
      <van-cell-group class="menu-group">
        <van-cell 
          title="关于我们" 
          is-link 
          class="menu-item"
          @click="showAboutDialog"
        >
          <template #right-icon>
            <van-icon name="arrow" size="16" color="#999" />
          </template>
        </van-cell>
        <van-cell 
          title="当前版本" 
          value="v1.0.0"
          class="menu-item"
        />
      </van-cell-group>
    </div>
    
    <!-- 版权信息 -->
    <div class="copyright-info animate-fade-in" style="animation-delay: 0.6s">
      <div class="brand-logo">🌍</div>
      <p>© 2026 智能旅游助手</p>
      <p class="copyright-sub">让旅行更简单</p>
    </div>
    
    <!-- 关于我们对话框 -->
    <van-dialog 
      v-model:show="aboutDialogVisible" 
      title="关于智能旅游助手"
      show-cancel-button
      confirm-text="了解了"
      class="about-dialog"
    >
      <div class="about-content">
        <div class="about-icon-wrap">
          <div class="about-icon">🌍</div>
          <div class="about-glow"></div>
        </div>
        <p class="app-name">智能旅游助手 v1.0.0</p>
        <div class="feature-list">
          <div class="feature-item">🤖 AI智能规划行程</div>
          <div class="feature-item">📊 智能预算分析</div>
          <div class="feature-item">💬 实时问答咨询</div>
          <div class="feature-item">🗺️ 景点推荐攻略</div>
        </div>
        <p class="copyright mt-4 text-center">© 2026 智能旅游助手 版权所有</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getFavoriteList, getFavoriteCount, removeFavorite } from '../utils/favoriteApi'

const router = useRouter()

const userAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg'
const userName = '游客'
const userLevel = 1
const levelProgress = 35

const stats = reactive({
  favorites: 0,
  trips: 0,
  footprints: 0
})

const achievements = [
  { icon: '🌱', name: '初出茅庐', desc: '完成第一次规划', unlocked: false },
  { icon: '🌍', name: '旅行者', desc: '规划3个城市', unlocked: false },
  { icon: '⭐', name: '收藏达人', desc: '收藏10个景点', unlocked: false },
  { icon: '🎯', name: '规划大师', desc: '完成10次规划', unlocked: false }
]

const recentTrips = []

const aboutDialogVisible = ref(false)
const favorites = ref([])
const favoritesLoading = ref(false)

// 加载收藏列表
const loadFavorites = async () => {
  favoritesLoading.value = true
  try {
    const list = await getFavoriteList()
    favorites.value = list || []
    stats.favorites = favorites.value.length
  } catch (error) {
    console.error('Load favorites error:', error)
  } finally {
    favoritesLoading.value = false
  }
}

// 删除收藏
const handleRemoveFavorite = async (item, index) => {
  try {
    await removeFavorite(item.city, item.days)
    favorites.value.splice(index, 1)
    stats.favorites = favorites.value.length
    showToast('已取消收藏')
  } catch (error) {
    showToast('操作失败')
  }
}

// 查看收藏详情
const handleViewFavorite = (item) => {
  router.push({
    path: '/detail',
    query: {
      city: item.city,
      days: item.days,
      budget: item.totalBudget
    }
  })
}

const showAboutDialog = () => {
  aboutDialogVisible.value = true
}

// 格式化时间
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f4fd 0%, #f5f9ff 40%, #ffffff 100%);
  padding-bottom: calc(50px + env(safe-area-inset-bottom));
  position: relative;
  overflow: hidden;
}

/* 动态背景装饰 */
.profile-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 450px;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.2;
  filter: blur(35px);
}

.circle-1 {
  width: 220px;
  height: 220px;
  background: #4a90d9;
  top: -60px;
  right: -60px;
  animation: circleFloat 15s ease-in-out infinite;
}

.circle-2 {
  width: 180px;
  height: 180px;
  background: #6ba3e0;
  top: 80px;
  left: -40px;
  animation: circleFloat 12s ease-in-out infinite reverse;
}

.circle-3 {
  width: 150px;
  height: 150px;
  background: #87ceeb;
  top: 220px;
  right: 80px;
  animation: circleFloat 18s ease-in-out infinite;
}

@keyframes circleFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(25px, -20px) scale(1.1); }
  66% { transform: translate(-20px, 25px) scale(0.9); }
}

/* 山脉轮廓 */
.mountains {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  display: flex;
  justify-content: center;
  gap: 50px;
}

.mountain {
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 70px solid rgba(74, 144, 217, 0.12);
}

.mountain.m1 {
  border-bottom-width: 55px;
  animation: mountainWave 3s ease-in-out infinite;
}

.mountain.m2 {
  border-bottom-width: 80px;
  animation: mountainWave 3.5s ease-in-out infinite 0.5s;
}

.mountain.m3 {
  border-bottom-width: 50px;
  animation: mountainWave 4s ease-in-out infinite 1s;
}

@keyframes mountainWave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* 云朵 */
.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  filter: blur(8px);
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: inherit;
}

.cloud-1 {
  width: 80px;
  height: 30px;
  top: 150px;
  right: 50px;
  animation: floatCloud 18s ease-in-out infinite;
}

.cloud-1::before {
  width: 35px;
  height: 35px;
  top: -15px;
  left: 10px;
}

.cloud-1::after {
  width: 40px;
  height: 40px;
  top: -20px;
  left: 35px;
}

.cloud-2 {
  width: 60px;
  height: 25px;
  top: 220px;
  left: 60px;
  animation: floatCloud 15s ease-in-out infinite reverse;
}

.cloud-2::before {
  width: 25px;
  height: 25px;
  top: -12px;
  left: 5px;
}

.cloud-2::after {
  width: 30px;
  height: 30px;
  top: -15px;
  left: 25px;
}

@keyframes floatCloud {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(30px); }
}

/* 气球 */
.balloon {
  position: absolute;
  font-size: 24px;
  animation: balloonFloat 8s ease-in-out infinite;
}

.balloon-1 {
  top: 200px;
  right: 30px;
  animation-delay: 0s;
}

.balloon-2 {
  top: 180px;
  left: 40px;
  animation-delay: -4s;
}

@keyframes balloonFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(3deg); }
  50% { transform: translateY(-10px) rotate(0deg); }
  75% { transform: translateY(-20px) rotate(-3deg); }
}

.custom-nav {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 10;
}

/* 用户信息区域 */
.user-info {
  position: relative;
  z-index: 10;
  padding: 30px 20px 40px;
  border-radius: 0 0 32px 32px;
  box-shadow: 0 12px 45px rgba(74, 144, 217, 0.3);
  overflow: hidden;
}

.user-info-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 40%, #87ceeb 100%);
  z-index: 1;
}

.user-info-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.avatar {
  width: 95px;
  height: 95px;
  border: 4px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.avatar:hover {
  transform: scale(1.08);
}

.avatar-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: ringRotate 10s linear infinite;
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.avatar-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #ffd93d 0%, #ff9f43 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 3px solid white;
  animation: badgePulse 2s ease-in-out infinite;
  box-shadow: 0 4px 12px rgba(255, 217, 61, 0.4);
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.user-details {
  text-align: center;
  margin-bottom: 16px;
  color: white;
}

.user-name {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
}

.user-desc {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 6px;
}

/* 用户等级 */
.user-level {
  width: 100%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.level-badge {
  display: inline-block;
  background: linear-gradient(135deg, #ffd93d 0%, #ff9f43 100%);
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(255, 217, 61, 0.4);
}

.level-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.level-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.level-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd93d 0%, #ff9f43 100%);
  border-radius: 3px;
  transition: width 0.8s ease-out;
}

.level-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

/* 用户统计 */
.user-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 18px 28px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 12px;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.stat-icon {
  font-size: 22px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  color: white;
}

.stat-divider {
  width: 1px;
  height: 45px;
  background: rgba(255, 255, 255, 0.3);
}

/* 菜单区域 */
.menu-section {
  margin: 18px 14px 0;
  background-color: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(74, 144, 217, 0.08);
  transition: all 0.3s ease;
}

.menu-section:hover {
  box-shadow: 0 8px 30px rgba(74, 144, 217, 0.12);
  transform: translateY(-2px);
}

.menu-title {
  font-size: 15px;
  color: #333;
  padding: 16px 18px;
  border-bottom: 1px solid #f5f7fa;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-icon {
  font-size: 18px;
}

.menu-badge {
  font-size: 12px;
  color: #fff;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
}

.menu-group {
  background: transparent;
}

.menu-item {
  padding: 16px 18px !important;
  border-bottom: 1px solid #f5f7fa !important;
  transition: all 0.3s ease;
}

.menu-item:last-child {
  border-bottom: none !important;
}

.menu-item:active {
  background: #f7f9fc;
}

/* 成就网格 */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 16px 12px;
  gap: 8px;
}

.achievement-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: #f7f9fc;
  border-radius: 16px;
  transition: all 0.3s ease;
  opacity: 0.5;
  filter: grayscale(1);
}

.achievement-item.unlocked {
  opacity: 1;
  filter: grayscale(0);
  background: linear-gradient(135deg, #fff9f0 0%, #fff5eb 100%);
}

.achievement-item:hover {
  transform: translateY(-3px);
}

.achievement-icon {
  font-size: 28px;
}

.achievement-name {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.achievement-desc {
  font-size: 10px;
  color: #999;
  text-align: center;
}

/* 快捷操作网格 */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 16px 0;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.quick-action-item:hover {
  transform: translateY(-5px);
}

.quick-action-item:active {
  transform: scale(0.95);
}

.action-icon-wrap {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.action-icon-wrap:hover {
  transform: scale(1.1);
}

.action-gold {
  background: linear-gradient(135deg, #ffd93d 0%, #ff9f43 100%);
  box-shadow: 0 4px 15px rgba(255, 217, 61, 0.4);
}

.action-blue {
  background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%);
  box-shadow: 0 4px 15px rgba(74, 144, 217, 0.4);
}

.action-green {
  background: linear-gradient(135deg, #6bcb77 0%, #8ce09a 100%);
  box-shadow: 0 4px 15px rgba(107, 203, 119, 0.4);
}

.action-purple {
  background: linear-gradient(135deg, #9b59b6 0%, #b57edc 100%);
  box-shadow: 0 4px 15px rgba(155, 89, 182, 0.4);
}

.action-icon {
  font-size: 26px;
}

.action-text {
  font-size: 12px;
  color: #666;
}

/* 最近浏览 */
.recent-list {
  padding: 0 18px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-item:hover {
  background: #f7f9fc;
  margin: 0 -18px;
  padding: 16px 18px;
  border-radius: 12px;
}

.recent-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #f7f9fc 0%, #eef2f7 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.recent-info {
  flex: 1;
}

.recent-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.recent-desc {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.recent-empty {
  padding: 30px 0;
}

/* 版权信息 */
.copyright-info {
  text-align: center;
  padding: 40px 20px 20px;
  color: #999;
  font-size: 13px;
}

.brand-logo {
  font-size: 32px;
  margin-bottom: 8px;
  animation: float 3s ease-in-out infinite;
}

.copyright-sub {
  font-size: 12px;
  margin-top: 4px;
  color: #bbb;
}

/* 关于对话框 */
.about-dialog {
  border-radius: 24px;
}

.about-content {
  text-align: center;
  line-height: 1.7;
  color: #555;
}

.about-icon-wrap {
  position: relative;
  margin-bottom: 16px;
}

.about-icon {
  font-size: 56px;
  animation: float 3s ease-in-out infinite;
  position: relative;
  z-index: 2;
}

.about-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(74, 144, 217, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 2s ease-in-out infinite;
  z-index: 1;
}

@keyframes glowPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.8; }
}

.app-name {
  font-size: 17px;
  font-weight: 600;
  color: #4a90d9;
  margin-bottom: 16px;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.feature-item {
  padding: 10px;
  background: #f7f9fc;
  border-radius: 12px;
  font-size: 13px;
}

.copyright {
  font-size: 13px;
  color: #999;
}

.mt-4 {
  margin-top: 20px;
}

.text-center {
  text-align: center;
}

/* 收藏列表 */
.favorite-list {
  padding: 0 18px;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.favorite-item:last-child {
  border-bottom: none;
}

.favorite-item:hover {
  background: #f7f9fc;
  margin: 0 -18px;
  padding: 16px 18px;
  border-radius: 12px;
}

.favorite-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ff9f43 0%, #ff6b6b 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.3);
}

.favorite-info {
  flex: 1;
}

.favorite-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.favorite-desc {
  font-size: 13px;
  color: #4a90d9;
  margin-top: 4px;
}

.favorite-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.favorite-delete {
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.favorite-delete:hover {
  background: rgba(255, 107, 107, 0.1);
}

.favorite-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  gap: 8px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.6;
}

.empty-text {
  font-size: 15px;
  color: #666;
}

.empty-hint {
  font-size: 13px;
  color: #999;
}

.loading-tip {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}
</style>
