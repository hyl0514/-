<template>
    <div class="page-container">
        <!-- 背景装饰 -->
        <div class="detail-bg">
            <div class="bg-gradient"></div>
            <div class="bg-blob blob-1"></div>
            <div class="bg-blob blob-2"></div>
            <div class="bg-blob blob-3"></div>
        </div>
        
        <div class="page-header">
            <van-nav-bar 
                fixed 
                left-text="返回" 
                left-arrow 
                class="custom-nav"
                @click-left="onBack" 
                :title="formData.city + '行程规划'" 
            />
        </div>
        
        <div class="page-content">
            <div v-if="isLoading" class="loading-container">
                <div class="loading-wrapper">
                    <div class="loading-avatar">🤖</div>
                    <div class="loading-glow"></div>
                    <van-loading size="32px" type="spinner" color="#4a90d9">
                        正在生成旅游规划...
                    </van-loading>
                    <div class="loading-text">AI正在为您精心规划行程</div>
                    <div class="loading-dots">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </div>
                </div>
            </div>
            
            <div v-else-if="errorMsg">
                <div class="error-card">
                    <div class="error-icon">😢</div>
                    <div class="error-title">获取行程失败</div>
                    <div class="error-desc">{{ errorMsg }}</div>
                    <van-button type="primary" round @click="fetchTripData" class="retry-btn">
                        <span>🔄</span> 重新获取
                    </van-button>
                </div>
            </div>
            
            <template v-else-if="tripData && tripData.successs !== false">
                <!-- 行程概览卡片 -->
                <div class="card overview-card animate-fade-in">
                    <div class="overview-bg"></div>
                    <div class="overview-content">
                        <div class="trip-header">
                            <div class="trip-info">
                                <div class="trip-badge">✨ AI智能规划</div>
                                <h2 class="trip-title">{{ tripData.city }} · {{ tripData.days }}天完整行程</h2>
                                <div class="trip-subtitle">为您定制的专属旅行方案</div>
                            </div>
                            <div class="trip-budget">
                                <div class="budget-icon">💰</div>
                                <div class="budget-text">总预算</div>
                                <div class="budget-amount">¥{{ tripData.totalBudget }}</div>
                            </div>
                        </div>
                        
                        <!-- 统计信息 -->
                        <div class="trip-stats">
                            <div class="stat-box">
                                <div class="stat-icon">📍</div>
                                <div class="stat-value">{{ getSpotCount() }}</div>
                                <div class="stat-label">景点</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-icon">🍜</div>
                                <div class="stat-value">{{ getMealCount() }}</div>
                                <div class="stat-label">餐饮</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-icon">🏨</div>
                                <div class="stat-value">{{ tripData.days }}</div>
                                <div class="stat-label">住宿</div>
                            </div>
                        </div>
                        
                        <!-- 预算进度条 -->
                        <div class="budget-progress">
                            <div class="progress-info">
                                <span>预算使用</span>
                                <span>{{ budgetUsagePercent }}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: budgetUsagePercent + '%' }"></div>
                                <div class="progress-glow"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 每日行程折叠面板 -->
                <van-collapse 
                    v-model="activeDays" 
                    class="trip-collapse"
                    accordion
                >
                    <van-collapse-item 
                        v-for="(day, index) in tripData.dailyItinerary" 
                        :key="day.day" 
                        :title="getDayTitle(day.day)"
                        :name="day.day"
                        class="day-collapse-item"
                        :style="{ animationDelay: `${index * 0.1}s` }"
                    >
                        <div class="day-schedule">
                            <!-- 上午 -->
                            <div class="schedule-section morning-section animate-slide-left">
                                <div class="section-header">
                                    <div class="section-icon-wrap sunrise">🌅</div>
                                    <div class="section-info">
                                        <div class="section-label">上午</div>
                                        <div class="section-time">09:00 - 12:00</div>
                                    </div>
                                </div>
                                <SpotItem :data="day.morning" />
                            </div>
                            
                            <!-- 下午 -->
                            <div class="schedule-section afternoon-section animate-slide-right">
                                <div class="section-header">
                                    <div class="section-icon-wrap sun">☀️</div>
                                    <div class="section-info">
                                        <div class="section-label">下午</div>
                                        <div class="section-time">14:00 - 18:00</div>
                                    </div>
                                </div>
                                <SpotItem :data="day.afternoon" />
                            </div>
                            
                            <!-- 晚上 -->
                            <div class="schedule-section evening-section animate-slide-left">
                                <div class="section-header">
                                    <div class="section-icon-wrap moon">🌙</div>
                                    <div class="section-info">
                                        <div class="section-label">晚上</div>
                                        <div class="section-time">19:00 - 22:00</div>
                                    </div>
                                </div>
                                <SpotItem :data="day.evening" />
                            </div>
                        </div>
                    </van-collapse-item>
                </van-collapse>
                
                <!-- 预算明细卡片 -->
                <div class="card budget-card animate-fade-in" v-if="tripData.budgetBreakdown" style="animation-delay: 0.3s">
                    <div class="card-header">
                        <div class="section-title">
                            <span class="title-icon">📊</span> 预算明细
                        </div>
                        <div class="card-badge">详细分析</div>
                    </div>
                    <BudgetTable :data="tripData.budgetBreakdown" :total="tripData.totalBudget" />
                </div>
                
                <!-- 温馨提示卡片 -->
                <div class="card tips-card animate-fade-in" v-if="tripData.tips && tripData.tips.length" style="animation-delay: 0.4s">
                    <div class="card-header">
                        <div class="section-title">
                            <span class="title-icon">💡</span> 温馨出行提示
                        </div>
                    </div>
                    <div class="tips-grid">
                        <div class="tip-card" v-for="(tip, index) in tripData.tips" :key="index">
                            <div class="tip-number">{{ index + 1 }}</div>
                            <div class="tip-content">{{ tip }}</div>
                        </div>
                    </div>
                </div>
                
                <!-- 注意事项卡片 -->
                <div class="card warnings-card animate-fade-in" v-if="tripData.warnings && tripData.warnings.length" style="animation-delay: 0.5s">
                    <div class="card-header">
                        <div class="section-title">
                            <span class="title-icon">⚠️</span> 出行注意事项
                        </div>
                    </div>
                    <ul class="warnings-list">
                        <li v-for="(warning, index) in tripData.warnings" :key="index" class="warning-item">
                            <div class="warning-icon-wrap">!</div>
                            <div class="warning-content">{{ warning }}</div>
                        </li>
                    </ul>
                </div>
                
                <!-- 出行工具箱卡片 -->
                <div class="card toolkit-card animate-fade-in" style="animation-delay: 0.55s">
                    <div class="toolkit-row" @click="goToPacking">
                        <div class="toolkit-icon">🧳</div>
                        <div class="toolkit-info">
                            <div class="toolkit-title">AI 行李打包清单</div>
                            <div class="toolkit-desc">根据天气与出行天数生成 50+ 物品清单，出发前逐项核对</div>
                        </div>
                        <van-icon name="arrow" size="16" color="#a9c4bd" />
                    </div>
                </div>

                <!-- 分享卡片 -->
                <div class="card share-card animate-fade-in" style="animation-delay: 0.6s">
                    <div class="share-header">
                        <div class="share-title">
                            <span class="share-icon">📤</span> 分享行程
                        </div>
                    </div>
                    <div class="share-buttons">
                        <div class="share-btn" @click="showToast('分享到微信')">
                            <div class="share-icon-wrap wechat">💬</div>
                            <span>微信</span>
                        </div>
                        <div class="share-btn" @click="showToast('分享到朋友圈')">
                            <div class="share-icon-wrap moments">📷</div>
                            <span>朋友圈</span>
                        </div>
                        <div class="share-btn" @click="showToast('复制链接')">
                            <div class="share-icon-wrap copy">🔗</div>
                            <span>复制</span>
                        </div>
                        <div class="share-btn" @click="showToast('保存图片')">
                            <div class="share-icon-wrap save">💾</div>
                            <span>保存</span>
                        </div>
                    </div>
                </div>
            </template>
        </div>
        
        <div class="detail-footer" v-if="tripData && tripData.successs !== false">
            <div class="footer-actions">
                <van-button 
                    :type="isFavorite ? 'primary' : 'default'" 
                    round 
                    @click="toggleFavorite" 
                    class="footer-btn secondary"
                    :class="{ 'favorited': isFavorite }"
                    :loading="favoriteLoading"
                >
                    <span>{{ isFavorite ? '❤️' : '⭐' }}</span> {{ isFavorite ? '已收藏' : '收藏' }}
                </van-button>
                <van-button type="primary" round @click="goToChat" class="footer-btn primary">
                    <span class="btn-icon">💬</span> 咨询 AI 助手
                </van-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { post } from '../utils/request'
import { addFavorite, removeFavorite, checkFavorite } from '../utils/favoriteApi'
import { showToast } from 'vant'
import SpotItem from '../components/SpotItem.vue'
import BudgetTable from '../components/BudgetTable.vue'

const router = useRouter()
const route = useRoute()

const isLoading = ref(true)
const isFavorite = ref(false)
const favoriteLoading = ref(false)

const formData = reactive({
    city: '',
    budget: null,
    days: null
})

const activeDays = ref([])

const tripData = ref(null)

const errorMsg = ref('')

// 计算预算使用百分比
const budgetUsagePercent = computed(() => {
    if (!tripData.value || !tripData.value.totalBudget) return 0
    const budget = tripData.value.budgetBreakdown || {}
    const used = (budget.accommodation || 0) + (budget.food || 0) + (budget.transportation || 0) + (budget.tickets || 0) + (budget.other || 0)
    return Math.min(100, Math.round((used / tripData.value.totalBudget) * 100))
})

// 获取景点数量
const getSpotCount = () => {
    if (!tripData.value?.dailyItinerary) return 0
    let count = 0
    tripData.value.dailyItinerary.forEach(day => {
        if (day.morning?.spot) count++
        if (day.afternoon?.spot) count++
        if (day.evening?.spot) count++
    })
    return count
}

// 获取餐饮数量
const getMealCount = () => {
    if (!tripData.value?.dailyItinerary) return 0
    let count = 0
    tripData.value.dailyItinerary.forEach(day => {
        if (day.evening?.spot) count++
    })
    return tripData.value.days * 3
}

// 获取日期标题
const getDayTitle = (day) => {
    const dayMap = ['第一天', '第二天', '第三天', '第四天', '第五天', '第六天', '第七天']
    return dayMap[day - 1] || `第${day}天`
}

const onBack = () => {
    router.back()
}

const goToChat = () => {
    router.push({
        path: '/chat',
        query: {
            scene: 'detail',
            city: formData.city
        }
    })
}

// 跳转 AI 行李打包清单，携带目的地与天数，清单页自动获取天气并生成
const goToPacking = () => {
    router.push({
        path: '/packing',
        query: {
            city: formData.city,
            days: formData.days
        }
    })
}

// 切换收藏状态
const toggleFavorite = async () => {
    if (favoriteLoading.value || !tripData.value) return
    
    favoriteLoading.value = true
    
    try {
        if (isFavorite.value) {
            // 取消收藏
            await removeFavorite(tripData.value.city, tripData.value.days)
            isFavorite.value = false
            showToast('已取消收藏')
        } else {
            // 添加收藏
            await addFavorite(tripData.value)
            isFavorite.value = true
            showToast('收藏成功')
        }
    } catch (error) {
        showToast('操作失败，请重试')
        console.error('Favorite error:', error)
    } finally {
        favoriteLoading.value = false
    }
}

// 检查收藏状态
const checkFavoriteStatus = async () => {
    if (!tripData.value) return
    try {
        const result = await checkFavorite(tripData.value.city, tripData.value.days)
        isFavorite.value = result || false
    } catch (error) {
        console.error('Check favorite error:', error)
    }
}

const fetchTripData = async () => {
    isLoading.value = true
    errorMsg.value = ''
    try {
        const res = await post('recommend', {
            city: formData.city,
            budget: formData.budget,
            days: formData.days
        })
        isLoading.value = false
        if (res && res.successs != false) {
            tripData.value = res
            // 默认展开第一天
            if (res.dailyItinerary && res.dailyItinerary.length > 0) {
                activeDays.value = [res.dailyItinerary[0].day]
            }
            // 检查收藏状态
            checkFavoriteStatus()
        } else {
            errorMsg.value = res?.error || '获取行程失败'
        }
    } catch (error) {
        isLoading.value = false
        errorMsg.value = '网络请求失败，请重试'
    }
}

onMounted(() => {
    formData.city = route.query.city
    formData.budget = route.query.budget
    formData.days = route.query.days

    if (formData.city && formData.budget && formData.days) {
        fetchTripData()
    }
})
</script>

<style scoped>
.page-header {
   height: 46px;
   position: relative;
   z-index: 20;
}

.custom-nav {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
}

.page-content {
    padding: 16px;
    padding-bottom: 120px;
    background: transparent;
    min-height: calc(100vh - 46px);
    position: relative;
    z-index: 10;
}

/* 背景装饰 */
.detail-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    overflow: hidden;
}

.bg-gradient {
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, #e8f4fd 0%, #f5f9ff 50%, #ffffff 100%);
}

.bg-blob {
    position: absolute;
    border-radius: 50%;
    opacity: 0.2;
    filter: blur(40px);
    animation: blobMove 20s ease-in-out infinite;
}

.blob-1 {
    width: 300px;
    height: 300px;
    background: #4a90d9;
    top: -100px;
    right: -100px;
}

.blob-2 {
    width: 250px;
    height: 250px;
    background: #6ba3e0;
    bottom: 200px;
    left: -80px;
    animation-direction: reverse;
}

.blob-3 {
    width: 200px;
    height: 200px;
    background: #87ceeb;
    bottom: -50px;
    right: 50px;
    animation-delay: -5s;
}

@keyframes blobMove {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.1); }
    66% { transform: translate(-20px, 30px) scale(0.9); }
}

/* 加载动画 */
.loading-container {
    height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    position: relative;
}

.loading-avatar {
    font-size: 80px;
    animation: float 3s ease-in-out infinite;
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 8px 20px rgba(74, 144, 217, 0.3));
}

.loading-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(74, 144, 217, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    animation: glowPulse 2s ease-in-out infinite;
    z-index: 1;
}

@keyframes glowPulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.8; }
}

.loading-text {
    font-size: 14px;
    color: #666;
    animation: fadeInOut 2s ease-in-out infinite;
}

.loading-dots {
    display: flex;
    gap: 8px;
}

.loading-dots .dot {
    width: 10px;
    height: 10px;
    background: #4a90d9;
    border-radius: 50%;
    animation: typingDot 1.4s infinite ease-in-out both;
}

.loading-dots .dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dots .dot:nth-child(2) { animation-delay: -0.16s; }
.loading-dots .dot:nth-child(3) { animation-delay: 0s; }

@keyframes typingDot {
    0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
}

@keyframes fadeInOut {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
}

/* 错误卡片 */
.error-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
}

.error-icon {
    font-size: 64px;
    margin-bottom: 20px;
}

.error-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
}

.error-desc {
    font-size: 14px;
    color: #999;
    margin-bottom: 24px;
}

.retry-btn {
    width: 160px;
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%) !important;
    border: none !important;
    box-shadow: 0 6px 20px rgba(74, 144, 217, 0.3);
}

/* 卡片样式 */
.card {
    background: #ffffff;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(74, 144, 217, 0.08);
    transition: all 0.3s ease;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
}

.card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4a90d9, #6ba3e0, #87ceeb);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.card:hover::before {
    opacity: 1;
}

.card:hover {
    box-shadow: 0 8px 30px rgba(74, 144, 217, 0.15);
    transform: translateY(-3px);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.card-badge {
    font-size: 12px;
    color: #4a90d9;
    background: rgba(74, 144, 217, 0.1);
    padding: 4px 10px;
    border-radius: 12px;
}

/* 概览卡片 */
.overview-card {
    margin-bottom: 20px;
    padding: 0;
    box-shadow: 0 12px 40px rgba(74, 144, 217, 0.3);
}

.overview-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 40%, #87ceeb 100%);
    z-index: 1;
}

.overview-content {
    position: relative;
    z-index: 2;
    padding: 24px;
    color: white;
}

.trip-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
}

.trip-info {
    flex: 1;
}

.trip-badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    margin-bottom: 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.trip-title {
    font-size: 22px;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
}

.trip-subtitle {
    font-size: 14px;
    opacity: 0.9;
    margin-top: 8px;
}

.trip-budget {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 14px 22px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.budget-icon {
    font-size: 26px;
    margin-bottom: 4px;
}

.budget-text {
    font-size: 12px;
    opacity: 0.9;
}

.budget-amount {
    font-size: 22px;
    font-weight: 700;
    margin-top: 4px;
}

/* 统计信息 */
.trip-stats {
    display: flex;
    justify-content: space-around;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    padding: 18px 0;
    border-radius: 16px;
    margin-bottom: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
}

.stat-box:hover {
    transform: translateY(-3px);
}

.stat-icon {
    font-size: 24px;
}

.stat-value {
    font-size: 20px;
    font-weight: 700;
}

.stat-label {
    font-size: 12px;
    opacity: 0.9;
}

/* 预算进度条 */
.budget-progress {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 14px 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 13px;
    opacity: 0.95;
}

.progress-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ffd93d 0%, #ff9f43 100%);
    border-radius: 4px;
    transition: width 0.8s ease-out;
    box-shadow: 0 2px 8px rgba(255, 217, 61, 0.4);
}

.progress-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(255, 217, 61, 0.3) 0%, transparent 100%);
    animation: glowShimmer 2s ease-in-out infinite;
}

@keyframes glowShimmer {
    0%, 100% { opacity: 0; }
    50% { opacity: 0.5; }
}

/* 行程折叠面板 */
.trip-collapse {
    margin-bottom: 20px;
}

.day-collapse-item {
    background: #fff;
    border-radius: 20px;
    margin-bottom: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(74, 144, 217, 0.08);
    animation: fadeInUp 0.5s ease-out backwards;
}

:deep(.van-collapse-item__title) {
    font-weight: 600;
    font-size: 17px;
    color: #333;
    padding: 20px !important;
    background: linear-gradient(90deg, #f7f9fc 0%, #ffffff 100%);
    display: flex;
    align-items: center;
    gap: 10px;
}

:deep(.van-collapse-item__title)::before {
    content: '📅';
    font-size: 18px;
}

:deep(.van-collapse-item__icon) {
    font-size: 16px;
    color: #4a90d9;
}

.day-schedule {
    padding: 12px 0;
}

.schedule-section {
    padding: 18px 20px;
    margin-bottom: 10px;
    border-radius: 16px;
    transition: all 0.3s ease;
}

.schedule-section:last-child {
    margin-bottom: 0;
}

.schedule-section:hover {
    transform: translateX(5px);
}

.section-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 14px;
}

.section-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-icon-wrap.sunrise {
    background: linear-gradient(135deg, #ffd93d 0%, #ff9f43 100%);
    box-shadow: 0 4px 12px rgba(255, 159, 67, 0.3);
}

.section-icon-wrap.sun {
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%);
    box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
}

.section-icon-wrap.moon {
    background: linear-gradient(135deg, #6bcb77 0%, #8ce09a 100%);
    box-shadow: 0 4px 12px rgba(107, 203, 119, 0.3);
}

.section-info {
    flex: 1;
}

.section-label {
    font-size: 16px;
    font-weight: 600;
}

.section-time {
    font-size: 12px;
    color: #999;
    margin-top: 2px;
}

.morning-section {
    background: linear-gradient(135deg, #fff7e6 0%, #fff3d6 100%);
    border-left: 4px solid #fa8c16;
}

.morning-section .section-label {
    color: #fa8c16;
}

.afternoon-section {
    background: linear-gradient(135deg, #e6f7ff 0%, #d6f0ff 100%);
    border-left: 4px solid #1890ff;
}

.afternoon-section .section-label {
    color: #1890ff;
}

.evening-section {
    background: linear-gradient(135deg, #f6ffed 0%, #e6ffd6 100%);
    border-left: 4px solid #52c41a;
}

.evening-section .section-label {
    color: #52c41a;
}

.section-title {
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
}

.title-icon {
    font-size: 18px;
}

/* 提示网格 */
.tips-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.tip-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    background: #f7f9fc;
    border-radius: 14px;
    transition: all 0.3s ease;
}

.tip-card:hover {
    background: #fff;
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(74, 144, 217, 0.1);
}

.tip-number {
    width: 26px;
    height: 26px;
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
}

.tip-content {
    font-size: 13px;
    color: #666;
    line-height: 1.5;
}

/* 注意事项 */
.warnings-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.warning-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid #f5f5f5;
    transition: all 0.3s ease;
}

.warning-item:last-child {
    border-bottom: none;
}

.warning-item:hover {
    background: #fff5f5;
    padding: 14px;
    margin: 0 -14px;
    border-radius: 12px;
}

.warning-icon-wrap {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.warning-content {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    flex: 1;
}

/* 出行工具箱卡片 */
.toolkit-card {
    background: linear-gradient(135deg, #edf9f5 0%, #e1f4ee 100%);
    border: 1px solid rgba(13, 148, 136, 0.2);
}

.toolkit-row {
    display: flex;
    align-items: center;
    gap: 14px;
}

.toolkit-row:active {
    opacity: 0.8;
}

.toolkit-icon {
    width: 48px;
    height: 48px;
    border-radius: 15px;
    background: linear-gradient(135deg, #0d9488, #2dd4bf);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
    box-shadow: 0 5px 14px rgba(13, 148, 136, 0.3);
}

.toolkit-info {
    flex: 1;
}

.toolkit-title {
    font-size: 15.5px;
    font-weight: 700;
    color: #244742;
}

.toolkit-desc {
    font-size: 12.5px;
    color: #7d908c;
    margin-top: 4px;
    line-height: 1.4;
}

/* 分享卡片 */
.share-card {
    background: linear-gradient(135deg, #f7f9fc 0%, #eef2f7 100%);
    border: 1px solid rgba(74, 144, 217, 0.1);
}

.share-header {
    margin-bottom: 16px;
}

.share-title {
    font-size: 17px;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
}

.share-icon {
    font-size: 18px;
}

.share-buttons {
    display: flex;
    justify-content: space-around;
}

.share-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: 16px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.share-btn:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.share-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.share-icon-wrap.wechat {
    background: linear-gradient(135deg, #6bcb77 0%, #8ce09a 100%);
    box-shadow: 0 4px 12px rgba(107, 203, 119, 0.3);
}

.share-icon-wrap.moments {
    background: linear-gradient(135deg, #ffd93d 0%, #ff9f43 100%);
    box-shadow: 0 4px 12px rgba(255, 159, 67, 0.3);
}

.share-icon-wrap.copy {
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%);
    box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
}

.share-icon-wrap.save {
    background: linear-gradient(135deg, #9b59b6 0%, #b57edc 100%);
    box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
}

.share-btn span:last-child {
    font-size: 12px;
    color: #666;
}

/* 底部按钮 */
.detail-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 -4px 20px rgba(74, 144, 217, 0.1);
    max-width: 750px;
    margin: 0 auto;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    z-index: 20;
}

.footer-actions {
    display: flex;
    gap: 12px;
}

.footer-btn {
    flex: 1;
    height: 50px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 24px !important;
    transition: all 0.3s ease;
}

.footer-btn.primary {
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%) !important;
    border: none !important;
    box-shadow: 0 6px 20px rgba(74, 144, 217, 0.3);
}

.footer-btn.secondary {
    background: #f5f7fa !important;
    color: #666 !important;
    border: 1px solid #e0e0e0 !important;
}

.footer-btn.secondary.favorited {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%) !important;
    color: white !important;
    border: none !important;
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
}

.footer-btn:active {
    transform: scale(0.98);
}

.btn-icon {
    margin-right: 8px;
}

/* 动画 */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
}

.animate-fade-in {
    animation: fadeIn 0.6s ease-out;
}

.animate-slide-left {
    animation: slideInLeft 0.4s ease-out;
}

.animate-slide-right {
    animation: slideInRight 0.4s ease-out;
}
</style>
