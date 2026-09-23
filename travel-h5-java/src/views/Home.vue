<template>
    <div class="page-container">
        <!-- 动态背景装饰 -->
        <div class="bg-decoration">
            <!-- 太阳 -->
            <div class="sun-wrapper">
                <div class="sun"></div>
                <div class="sun-rays"></div>
            </div>
            
            <!-- 云朵 -->
            <div class="cloud cloud-1"></div>
            <div class="cloud cloud-2"></div>
            <div class="cloud cloud-3"></div>
            
            <!-- 山脉轮廓 -->
            <div class="mountains">
                <div class="mountain m1"></div>
                <div class="mountain m2"></div>
                <div class="mountain m3"></div>
            </div>
            
            <!-- 飞行的飞机 -->
            <div class="flying-plane">✈️</div>
            
            <!-- 漂浮气球 -->
            <div class="balloon balloon-1">🎈</div>
            <div class="balloon balloon-2">🎈</div>
            
            <!-- 浮动云朵装饰 -->
            <div class="bg-cloud bg-cloud-1"></div>
            <div class="bg-cloud bg-cloud-2"></div>
            
            <!-- 星星装饰 -->
            <div class="star star-1">⭐</div>
            <div class="star star-2">✨</div>
            <div class="star star-3">🌟</div>
        </div>
        
        <div class="page-header">
            <van-nav-bar 
                title="智能旅游助手" 
                class="custom-nav"
            />
        </div>
        
        <div class="page-content">
            <!-- 欢迎横幅 -->
            <div class="hero-banner animate-fade-in">
                <div class="hero-content">
                    <div class="hero-badge">✨ AI智能规划</div>
                    <h1 class="hero-title">🌍 开启你的<br><span class="gradient-text">梦想之旅</span></h1>
                    <p class="hero-subtitle">智能生成专属行程，让旅行更简单</p>
                </div>
                <div class="hero-visual">
                    <div class="plane-icon animate-float">✈️</div>
                    <div class="plane-trail"></div>
                </div>
            </div>

            <van-notice-bar
                left-icon="info-o"
                text="🎁 新用户首次规划可获得专属旅行建议"
                style="margin-bottom: 16px"
                class="notice-bar-custom"
            />
            
            <!-- 搜索卡片 -->
            <div class="card search-card animate-slide-left">
                <div class="card-header">
                    <div class="section-title">
                        <span class="title-icon">✈️</span> 规划你的旅程
                    </div>
                    <div class="card-badge">快速规划</div>
                </div>
                
                <div class="form-row">
                    <div class="form-group flex-1">
                        <van-field
                            @click="showCityPicker = true"
                            is-link
                            readonly
                            v-model="formData.city"
                            label="目的地"
                            placeholder="选择城市"
                            :border="false"
                            class="custom-field"
                        />
                    </div>
                    <div class="form-group">
                        <van-field
                            v-model="formData.days"
                            type="digit"
                            label="天数"
                            placeholder="天"
                            :border="false"
                            class="custom-field small-field"
                        />
                    </div>
                </div>
                
                <div class="form-group">
                    <van-field
                        v-model="formData.budget"
                        type="number"
                        label="预算"
                        placeholder="请输入预算金额（元）"
                        :border="false"
                        class="custom-field"
                    >
                        <template #label>
                            <span>💰 预算</span>
                        </template>
                    </van-field>
                </div>
                
                <van-button
                    type="primary"
                    size="large"
                    round
                    block
                    :loading="isLoading"
                    @click="handleSubmit"
                    class="plan-btn"
                >
                    <span class="btn-icon">🚀</span> 开始智能规划
                </van-button>
            </div>

            <!-- 快捷入口 -->
            <div class="card quick-actions animate-slide-right" style="animation-delay: 0.1s">
                <div class="section-title">
                    <span class="title-icon">⚡</span> 快捷入口
                </div>
                <div class="quick-grid">
                    <div
                        class="quick-entry"
                        v-for="entry in quickEntries"
                        :key="entry.text"
                        @click="onQuickEntry(entry)"
                    >
                        <div class="quick-icon" :style="{ background: entry.gradient, boxShadow: entry.shadow }">
                            <van-icon :name="entry.icon" size="24" color="#ffffff" />
                        </div>
                        <span class="quick-text">{{ entry.text }}</span>
                    </div>
                </div>
            </div>

            <!-- 热门目的地 -->
            <div class="card popular-destinations animate-fade-in" style="animation-delay: 0.2s">
                <div class="card-header">
                    <div class="section-title">
                        <span class="title-icon">🔥</span> 热门目的地
                    </div>
                    <van-icon name="arrow" size="14" color="#999" />
                </div>
                <div class="city-scroll-wrapper">
                    <div class="city-scroll">
                        <div 
                            class="city-card" 
                            @click="selectedCity(city)" 
                            v-for="(city, index) in popularCities" 
                            :key="index"
                            :class="{ active: formData.city === city }"
                        >
                            <div class="city-emoji">{{ getCityEmoji(city) }}</div>
                            <div class="city-name">{{ city }}</div>
                            <div class="city-score">
                                <van-icon name="star" size="12" color="#ffd93d" />
                                {{ getCityScore(city) }}
                            </div>
                        </div>
                    </div>
                    <div class="scroll-indicator">
                        <van-icon name="arrow" size="12" color="#ccc" />
                    </div>
                </div>
            </div>

            <!-- 推荐行程 -->
            <div class="card featured-trips animate-fade-in" style="animation-delay: 0.3s">
                <div class="card-header">
                    <div class="section-title">
                        <span class="title-icon">🌟</span> 精选行程
                    </div>
                    <van-icon name="arrow" size="14" color="#999" />
                </div>
                <div class="trip-list">
                    <div 
                        class="trip-item" 
                        v-for="(trip, index) in featuredTrips" 
                        :key="index"
                        @click="selectFeaturedTrip(trip)"
                    >
                        <div class="trip-image">
                            <span class="trip-emoji">{{ trip.emoji }}</span>
                            <div class="trip-overlay"></div>
                        </div>
                        <div class="trip-info">
                            <div class="trip-title">{{ trip.title }}</div>
                            <div class="trip-desc">{{ trip.desc }}</div>
                            <div class="trip-meta">
                                <span class="meta-item">⏱️ {{ trip.days }}天</span>
                                <span class="meta-item">💰 ¥{{ trip.price }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 旅游小贴士 -->
            <div class="card tips-card animate-fade-in" style="animation-delay: 0.4s">
                <div class="section-title">
                    <span class="title-icon">💡</span> 旅行小贴士
                </div>
                <div class="tips-grid">
                    <div 
                        class="tip-card" 
                        v-for="(tip, index) in travelTips" 
                        :key="index"
                        @click="handleTipClick(tip)"
                    >
                        <div class="tip-icon-circle">
                            <span>{{ tip.icon }}</span>
                        </div>
                        <div class="tip-text">{{ tip.text }}</div>
                        <van-icon name="arrow" size="14" color="#ccc" class="tip-arrow" />
                    </div>
                </div>
            </div>
        </div>

        <van-popup
            round
            v-model:show="showCityPicker"
            position="bottom"
            class="city-popup"
        >
            <van-picker
                title="选择目的地"
                :columns="cityColumns"
                @confirm="handleCityConfirm"
                @cancel="showCityPicker = false"
            />
        </van-popup>

        <!-- 天气预报弹窗 -->
        <van-popup
            round
            v-model:show="showWeatherPopup"
            position="bottom"
            :style="{ height: '70%' }"
            class="weather-popup"
        >
            <div class="weather-header">
                <div class="weather-title">🌤️ 天气预报</div>
                <van-icon name="cross" size="20" color="#999" @click="showWeatherPopup = false" />
            </div>
            <div class="weather-content">
                <div class="weather-search">
                    <van-field
                        v-model="weatherCity"
                        placeholder="输入城市查询天气"
                        @keyup.enter="fetchWeather"
                        class="weather-input"
                    >
                        <template #button>
                            <van-button @click="fetchWeather" type="primary" size="small" round>
                                查询
                            </van-button>
                        </template>
                    </van-field>
                </div>
                
                <div class="weather-current" v-if="currentWeather">
                    <div class="weather-main">
                        <div class="weather-icon">{{ currentWeather.icon }}</div>
                        <div class="weather-temp">{{ currentWeather.temperature }}°C</div>
                        <div class="weather-desc">{{ currentWeather.weather }}</div>
                    </div>
                    <div class="weather-info">
                        <div class="info-item">
                            <span class="info-label">最低</span>
                            <span class="info-value">{{ currentWeather.low }}°C</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">最高</span>
                            <span class="info-value">{{ currentWeather.high }}°C</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">湿度</span>
                            <span class="info-value">{{ currentWeather.humidity }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">风向</span>
                            <span class="info-value">{{ currentWeather.wind }}</span>
                        </div>
                    </div>
                    <div class="weather-tips">
                        📝 {{ currentWeather.tips }}
                    </div>
                </div>
                
                <div class="weather-list" v-if="hotWeatherList.length">
                    <div class="list-title">热门城市天气</div>
                    <div 
                        class="weather-item" 
                        v-for="(item, index) in hotWeatherList" 
                        :key="index"
                        @click="selectWeatherCity(item)"
                    >
                        <div class="item-icon">{{ item.icon }}</div>
                        <div class="item-info">
                            <div class="item-city">{{ item.city }}</div>
                            <div class="item-weather">{{ item.weather }}</div>
                        </div>
                        <div class="item-temp">
                            <span class="temp-high">{{ item.high }}°</span>
                            <span class="temp-low">{{ item.low }}°</span>
                        </div>
                    </div>
                </div>
            </div>
        </van-popup>

        <!-- 离线地图弹窗 -->
        <van-popup
            round
            v-model:show="showMapPopup"
            position="center"
            :style="{ width: '85%' }"
            class="map-popup"
        >
            <div class="map-header">
                <div class="map-title">📱 离线地图</div>
                <van-icon name="cross" size="20" color="#999" @click="showMapPopup = false" />
            </div>
            <div class="map-content">
                <div class="map-illustration">🗺️</div>
                <div class="map-desc">下载离线地图，随时随地导航无忧</div>
                <div class="map-features">
                    <div class="feature-item">📍 离线导航</div>
                    <div class="feature-item">📡 无网络可用</div>
                    <div class="feature-item">📦 节省流量</div>
                </div>
                <div class="map-cities">
                    <div class="cities-title">推荐下载城市</div>
                    <div class="city-chips">
                        <van-tag 
                            v-for="city in mapCities" 
                            :key="city" 
                            @click="downloadMap(city)"
                            class="city-chip"
                        >
                            {{ city }}
                        </van-tag>
                    </div>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getWeather, getHotWeather } from '../utils/weatherApi'

const router = useRouter()

const formData = reactive({
    city: '',
    budget: null,
    days: null
})

const showCityPicker = ref(false)

const allCities = [
    '北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆',
    '南京', '武汉', '苏州', '长沙', '天津', '郑州', '济南', '青岛',
    '大连', '沈阳', '哈尔滨', '长春', '福州', '厦门', '南昌', '合肥',
    '昆明', '贵阳', '南宁', '桂林', '海口', '三亚', '丽江', '大理',
    '西安', '兰州', '乌鲁木齐', '拉萨', '呼和浩特', '太原', '石家庄'
]

const popularCities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆']

// 快捷入口：图标名均经过本地 Vant4 图标集校验，gradient 为图标块渐变色
const quickEntries = [
    {
        text: 'AI咨询',
        icon: 'chat-o',
        gradient: 'linear-gradient(135deg, #4a90d9 0%, #7db4f7 100%)',
        shadow: '0 7px 16px rgba(74, 144, 217, 0.38)',
        type: 'route',
        path: '/chat'
    },
    {
        text: '行李清单',
        icon: 'orders-o',
        gradient: 'linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)',
        shadow: '0 7px 16px rgba(13, 148, 136, 0.38)',
        type: 'route',
        path: '/packing'
    },
    {
        text: '攻略',
        icon: 'guide-o',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        shadow: '0 7px 16px rgba(245, 158, 11, 0.38)',
        type: 'toast',
        message: '攻略功能开发中，敬请期待'
    },
    {
        text: '我的',
        icon: 'user-o',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
        shadow: '0 7px 16px rgba(139, 92, 246, 0.38)',
        type: 'route',
        path: '/profile'
    }
]

const onQuickEntry = (entry) => {
    if (entry.type === 'route') {
        goPage(entry.path)
    } else {
        showToast(entry.message)
    }
}

const cityColumns = allCities.map(city => ({ text: city, value: city }))

const travelTips = [
    { icon: '🌤️', text: '出行前查看天气预报' },
    { icon: '💰', text: '提前预订酒店享受优惠' },
    { icon: '📱', text: '下载离线地图备用' },
    { icon: '👜', text: '轻装出行更轻松' }
]

const featuredTrips = [
    { title: '北京深度游', desc: '故宫、长城、颐和园', days: 5, price: 3500, emoji: '🏯' },
    { title: '三亚度假游', desc: '海滩、阳光、海鲜', days: 4, price: 4200, emoji: '🏖️' },
    { title: '成都美食游', desc: '火锅、熊猫、宽窄巷子', days: 3, price: 2800, emoji: '🐼' }
]

const cityEmojis = {
    '北京': '🏯', '上海': '🏙️', '广州': '🗼', '深圳': '🌆',
    '成都': '🐼', '杭州': '🌳', '西安': '🏛️', '重庆': '🌉',
    '南京': '🏯', '武汉': '🌉', '苏州': '🎋', '长沙': '🌶️',
    '天津': '🎡', '郑州': '🏛️', '济南': '⛲', '青岛': '🌊',
    '大连': '⚓', '沈阳': '🏯', '哈尔滨': '❄️', '长春': '🌲',
    '福州': '🏮', '厦门': '🏖️', '南昌': '🏯', '合肥': '🏛️',
    '昆明': '🌸', '贵阳': '⛰️', '南宁': '🌴', '桂林': '⛰️',
    '海口': '🌴', '三亚': '🏖️', '丽江': '🏯', '大理': '🏞️'
}

const cityScores = {
    '北京': '4.9', '上海': '4.8', '广州': '4.7', '深圳': '4.6',
    '成都': '4.9', '杭州': '4.8', '西安': '4.7', '重庆': '4.8'
}

const getCityEmoji = (city) => {
    return cityEmojis[city] || '📍'
}

const getCityScore = (city) => {
    return cityScores[city] || '4.5'
}

const handleCityConfirm = ({ selectedOptions }) => {
    formData.city = selectedOptions[0].value
    showCityPicker.value = false
}

const isLoading = ref(false)

const handleSubmit = async () => {
    isLoading.value = true
    if (!formData.city) {
        showToast('请选择目的地')
        isLoading.value = false
        return
    }
    if (!formData.budget || formData.budget < 100) {
        showToast('预算不能低于100元')
        isLoading.value = false
        return
    }
    if (!formData.days || formData.days < 1 || formData.days > 30) {
        showToast('天数必须在1-30天之间')
        isLoading.value = false
        return
    }
    router.push({
        path: '/detail',
        query: {
            city: formData.city,
            budget: formData.budget,
            days: formData.days
        }
    })
}

const goPage = (path) => {
    router.push(path)
}

const selectedCity = (city) => {
    formData.city = city
}

const selectFeaturedTrip = (trip) => {
    formData.city = trip.title.split('')[0] + trip.title.split('')[1]
    formData.days = trip.days
    formData.budget = trip.price
    router.push({
        path: '/detail',
        query: {
            city: trip.title.replace('游', '').replace('深度', '').replace('度假', '').replace('美食', ''),
            budget: trip.price,
            days: trip.days
        }
    })
}

// 天气相关状态
const showWeatherPopup = ref(false)
const showMapPopup = ref(false)
const weatherCity = ref('')
const currentWeather = ref(null)
const hotWeatherList = ref([])

// 离线地图相关
const mapCities = ['北京', '上海', '广州', '深圳', '成都', '杭州']

// 处理小贴士点击
const handleTipClick = (tip) => {
    if (tip.text.includes('天气预报')) {
        showWeatherPopup.value = true
    } else if (tip.text.includes('离线地图')) {
        showMapPopup.value = true
    } else {
        showToast(tip.text)
    }
}

// 获取天气
const fetchWeather = async () => {
    if (!weatherCity.value.trim()) {
        showToast('请输入城市名称')
        return
    }
    try {
        const result = await getWeather(weatherCity.value)
        currentWeather.value = result
    } catch (error) {
        showToast('获取天气失败')
    }
}

// 获取热门城市天气
const fetchHotWeather = async () => {
    try {
        const result = await getHotWeather()
        hotWeatherList.value = result
        // 默认显示第一个城市的天气
        if (hotWeatherList.value.length > 0) {
            currentWeather.value = hotWeatherList.value[0]
            weatherCity.value = hotWeatherList.value[0].city
        }
    } catch (error) {
        console.error('获取热门天气失败:', error)
    }
}

// 选择天气城市
const selectWeatherCity = (item) => {
    currentWeather.value = item
    weatherCity.value = item.city
}

// 下载离线地图
const downloadMap = (city) => {
    showToast(`${city}离线地图下载中...`)
    setTimeout(() => {
        showToast(`${city}离线地图下载完成`)
    }, 1500)
}

// 页面加载时获取热门天气
onMounted(() => {
    fetchHotWeather()
})
</script>

<style scoped>
.page-container {
    background: linear-gradient(180deg, #e8f4fd 0%, #f5f9ff 40%, #ffffff 100%);
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    padding-bottom: 70px;
}

/* 动态背景装饰 */
.bg-decoration {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 500px;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
}

/* 太阳 */
.sun-wrapper {
    position: absolute;
    top: 20px;
    right: 40px;
}

.sun {
    width: 50px;
    height: 50px;
    background: radial-gradient(circle, #ffd93d 0%, #ff9f43 100%);
    border-radius: 50%;
    animation: sunPulse 4s ease-in-out infinite;
    box-shadow: 0 0 50px rgba(255, 217, 61, 0.5);
}

.sun-rays {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    animation: sunRotate 20s linear infinite;
}

.sun-rays::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 15px;
    background: rgba(255, 217, 61, 0.6);
    border-radius: 2px;
}

@keyframes sunPulse {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.1); opacity: 1; }
}

@keyframes sunRotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* 云朵 */
.cloud {
    position: absolute;
    background: rgba(255, 255, 255, 0.7);
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
    width: 100px;
    height: 35px;
    top: 100px;
    left: -30px;
    animation: floatCloud 18s ease-in-out infinite;
}

.cloud-1::before {
    width: 40px;
    height: 40px;
    top: -20px;
    left: 10px;
}

.cloud-1::after {
    width: 50px;
    height: 50px;
    top: -25px;
    left: 40px;
}

.cloud-2 {
    width: 80px;
    height: 30px;
    top: 140px;
    right: -20px;
    animation: floatCloud 15s ease-in-out infinite reverse;
}

.cloud-2::before {
    width: 35px;
    height: 35px;
    top: -15px;
    left: 8px;
}

.cloud-2::after {
    width: 40px;
    height: 40px;
    top: -20px;
    left: 35px;
}

.cloud-3 {
    width: 70px;
    height: 25px;
    top: 200px;
    left: 40%;
    animation: floatCloud 22s ease-in-out infinite;
}

.cloud-3::before {
    width: 30px;
    height: 30px;
    top: -12px;
    left: 5px;
}

.cloud-3::after {
    width: 35px;
    height: 35px;
    top: -18px;
    left: 30px;
}

@keyframes floatCloud {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(40px); }
}

/* 山脉轮廓 */
.mountains {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    display: flex;
    justify-content: center;
    gap: 40px;
}

.mountain {
    width: 0;
    height: 0;
    border-left: 40px solid transparent;
    border-right: 40px solid transparent;
    border-bottom: 60px solid rgba(74, 144, 217, 0.15);
}

.mountain.m1 {
    border-bottom-width: 50px;
    animation: mountainWave 3s ease-in-out infinite;
}

.mountain.m2 {
    border-bottom-width: 70px;
    animation: mountainWave 3.5s ease-in-out infinite 0.5s;
}

.mountain.m3 {
    border-bottom-width: 45px;
    animation: mountainWave 4s ease-in-out infinite 1s;
}

@keyframes mountainWave {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}

/* 飞行的飞机 */
.flying-plane {
    position: absolute;
    top: 100px;
    left: -50px;
    font-size: 24px;
    animation: flyAcross 25s linear infinite;
}

@keyframes flyAcross {
    0% { left: -50px; top: 100px; transform: rotate(0deg); }
    25% { top: 80px; }
    50% { top: 120px; }
    75% { top: 90px; }
    100% { left: 110%; top: 100px; transform: rotate(0deg); }
}

/* 漂浮气球 */
.balloon {
    position: absolute;
    font-size: 28px;
    animation: balloonFloat 8s ease-in-out infinite;
}

.balloon-1 {
    top: 200px;
    right: 20px;
    animation-delay: 0s;
}

.balloon-2 {
    top: 180px;
    left: 30px;
    animation-delay: -4s;
}

@keyframes balloonFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-15px) rotate(3deg); }
    50% { transform: translateY(-10px) rotate(0deg); }
    75% { transform: translateY(-20px) rotate(-3deg); }
}

/* 背景云朵装饰 */
.bg-cloud {
    position: absolute;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    filter: blur(20px);
}

.bg-cloud-1 {
    width: 200px;
    height: 80px;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    animation: cloudDrift 25s ease-in-out infinite;
}

.bg-cloud-2 {
    width: 150px;
    height: 60px;
    top: 160px;
    left: 20%;
    animation: cloudDrift 30s ease-in-out infinite reverse;
}

@keyframes cloudDrift {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(30px); }
}

/* 星星装饰 */
.star {
    position: absolute;
    font-size: 16px;
    animation: starTwinkle 3s ease-in-out infinite;
}

.star-1 {
    top: 60px;
    left: 20%;
    animation-delay: 0s;
}

.star-2 {
    top: 120px;
    right: 30%;
    animation-delay: 1s;
}

.star-3 {
    top: 180px;
    left: 60%;
    animation-delay: 2s;
}

@keyframes starTwinkle {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.2); }
}

.page-header {
    height: 46px;
    position: relative;
    z-index: 10;
}

.custom-nav {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
}

.page-content {
    padding: 16px;
    position: relative;
    z-index: 10;
}

/* 欢迎横幅 */
.hero-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 40%, #87ceeb 100%);
    border-radius: 24px;
    padding: 28px;
    margin-bottom: 20px;
    color: white;
    box-shadow: 0 12px 40px rgba(74, 144, 217, 0.35);
    overflow: hidden;
    position: relative;
}

.hero-banner::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
}

.hero-badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    margin-bottom: 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-title {
    font-size: 26px;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
    position: relative;
    z-index: 1;
}

.gradient-text {
    background: linear-gradient(135deg, #ffd93d 0%, #ffffff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-subtitle {
    font-size: 14px;
    opacity: 0.9;
    margin-top: 10px;
    position: relative;
    z-index: 1;
}

.hero-visual {
    position: relative;
    z-index: 1;
}

.plane-icon {
    font-size: 56px;
    animation: float 3s ease-in-out infinite;
}

.plane-trail {
    position: absolute;
    top: 50%;
    right: 100%;
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5));
    border-radius: 2px;
}

/* 通知栏 */
.notice-bar-custom {
    background: linear-gradient(90deg, rgba(255, 217, 61, 0.15) 0%, rgba(255, 159, 67, 0.1) 100%);
    border-radius: 12px;
    color: #d97706;
}

/* 卡片通用 */
.card {
    background: #fff;
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 4px 20px rgba(74, 144, 217, 0.08);
    transition: all 0.3s ease;
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
    box-shadow: 0 10px 35px rgba(74, 144, 217, 0.15);
    transform: translateY(-4px);
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

.section-title {
    font-size: 17px;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
}

.title-icon {
    font-size: 18px;
    animation: wave 2s ease-in-out infinite;
}

@keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(8deg); }
    75% { transform: rotate(-8deg); }
}

/* 表单样式 */
.form-row {
    display: flex;
    gap: 12px;
    margin-bottom: 14px;
}

.form-group {
    flex: 1;
}

.flex-1 {
    flex: 1;
}

.custom-field {
    background: #f7f8fa !important;
    border-radius: 12px !important;
    padding: 12px 16px !important;
    transition: all 0.3s ease;
}

.custom-field:active {
    background: #eef2f7 !important;
    transform: scale(0.98);
}

.small-field {
    padding: 12px !important;
}

/* 规划按钮 */
.plan-btn {
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%) !important;
    border: none !important;
    height: 54px;
    font-size: 17px;
    font-weight: 600;
    box-shadow: 0 8px 25px rgba(74, 144, 217, 0.4);
    transition: all 0.3s ease;
    margin-top: 8px;
}

.plan-btn:active {
    transform: scale(0.98);
    box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
}

.btn-icon {
    margin-right: 8px;
}

/* 快捷入口宫格 */
.quick-grid {
    display: flex;
    gap: 8px;
    padding-top: 6px;
}

.quick-entry {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 8px 2px 4px;
    border-radius: 16px;
    transition: transform 0.2s ease;
}

.quick-entry:active {
    transform: scale(0.9);
}

.quick-icon {
    width: 56px;
    height: 56px;
    border-radius: 19px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

/* 图标块顶部高光，增加立体质感 */
.quick-icon::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 48%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0));
    border-radius: 19px 19px 0 0;
}

.quick-icon .van-icon {
    position: relative;
    z-index: 1;
}

.quick-text {
    font-size: 12.5px;
    color: #4a5c58;
    font-weight: 500;
    white-space: nowrap;
}

/* 热门目的地横向滚动 */
.city-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 8px 0;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
}

.city-scroll::-webkit-scrollbar {
    display: none;
}

.city-card {
    flex-shrink: 0;
    width: 76px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    background: linear-gradient(135deg, #f7f9fc 0%, #eef2f7 100%);
    border-radius: 14px;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
}

.city-card:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 6px 20px rgba(74, 144, 217, 0.15);
}

.city-card.active {
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%);
    border-color: rgba(74, 144, 217, 0.4);
    box-shadow: 0 8px 25px rgba(74, 144, 217, 0.3);
}

.city-emoji {
    font-size: 28px;
    margin-bottom: 6px;
}

.city-name {
    font-size: 13px;
    font-weight: 500;
    color: #333;
}

.city-card.active .city-name {
    color: #fff;
}

.city-score {
    font-size: 11px;
    color: #999;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 2px;
}

.city-card.active .city-score {
    color: rgba(255, 255, 255, 0.8);
}

.city-scroll-wrapper {
    position: relative;
}

.scroll-indicator {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    animation: bounceRight 1.5s ease-in-out infinite;
    z-index: 5;
}

@keyframes bounceRight {
    0%, 100% { transform: translateY(-50%) translateX(0); }
    50% { transform: translateY(-50%) translateX(4px); }
}

/* 推荐行程 */
.trip-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.trip-item {
    display: flex;
    gap: 14px;
    padding: 14px;
    background: #f7f9fc;
    border-radius: 16px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.trip-item:hover {
    background: #fff;
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(74, 144, 217, 0.1);
}

.trip-image {
    position: relative;
    width: 70px;
    height: 70px;
    border-radius: 12px;
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.trip-emoji {
    font-size: 32px;
    position: relative;
    z-index: 2;
}

.trip-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 100%);
}

.trip-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.trip-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
}

.trip-desc {
    font-size: 13px;
    color: #999;
    margin-bottom: 8px;
}

.trip-meta {
    display: flex;
    gap: 12px;
}

.meta-item {
    font-size: 12px;
    color: #666;
}

/* 旅游小贴士网格 */
.tips-card {
    background: linear-gradient(135deg, #fff9f0 0%, #fff5eb 100%);
    border: 1px solid #ffe4cc;
}

.tips-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.tip-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 10px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 14px;
    transition: all 0.3s ease;
}

.tip-card:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(255, 159, 67, 0.15);
}

.tip-icon-circle {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #ffd93d 0%, #ff9f43 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    font-size: 18px;
    box-shadow: 0 4px 12px rgba(255, 217, 61, 0.3);
}

.tip-text {
    font-size: 13px;
    color: #666;
    text-align: center;
    line-height: 1.4;
}

/* 城市选择器弹窗 */
.city-popup {
    border-radius: 24px 24px 0 0;
}

/* 小贴士箭头 */
.tip-arrow {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
}

/* 天气预报弹窗 */
.weather-popup {
    border-radius: 24px 24px 0 0;
}

.weather-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
}

.weather-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.weather-content {
    padding: 20px;
    overflow-y: auto;
    height: calc(100% - 70px);
}

.weather-search {
    margin-bottom: 20px;
}

.weather-input {
    background: #f7f8fa !important;
    border-radius: 12px !important;
}

.weather-current {
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%);
    border-radius: 20px;
    padding: 24px;
    color: white;
    margin-bottom: 20px;
    box-shadow: 0 8px 30px rgba(74, 144, 217, 0.3);
}

.weather-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 16px;
}

.weather-icon {
    font-size: 64px;
    margin-bottom: 8px;
}

.weather-temp {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 4px;
}

.weather-desc {
    font-size: 16px;
    opacity: 0.9;
}

.weather-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 12px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 10px;
}

.info-label {
    font-size: 13px;
    opacity: 0.8;
}

.info-value {
    font-size: 13px;
    font-weight: 500;
}

.weather-tips {
    font-size: 14px;
    opacity: 0.9;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
}

.weather-list {
    margin-top: 10px;
}

.list-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
}

.weather-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    background: #f7f9fc;
    border-radius: 14px;
    margin-bottom: 10px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.weather-item:hover {
    background: rgba(74, 144, 217, 0.08);
    transform: translateX(5px);
}

.item-icon {
    font-size: 28px;
}

.item-info {
    flex: 1;
}

.item-city {
    font-size: 15px;
    font-weight: 600;
    color: #333;
}

.item-weather {
    font-size: 13px;
    color: #999;
    margin-top: 2px;
}

.item-temp {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.temp-high {
    font-size: 15px;
    font-weight: 600;
    color: #4a90d9;
}

.temp-low {
    font-size: 12px;
    color: #999;
}

/* 离线地图弹窗 */
.map-popup {
    border-radius: 24px;
    padding: 0;
}

.map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
}

.map-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.map-content {
    padding: 30px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.map-illustration {
    font-size: 80px;
    margin-bottom: 16px;
    animation: float 3s ease-in-out infinite;
}

.map-desc {
    font-size: 16px;
    color: #666;
    text-align: center;
    margin-bottom: 24px;
}

.map-features {
    display: flex;
    gap: 20px;
    margin-bottom: 28px;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #4a90d9;
    padding: 8px 14px;
    background: rgba(74, 144, 217, 0.08);
    border-radius: 20px;
}

.map-cities {
    width: 100%;
}

.cities-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 14px;
    text-align: center;
}

.city-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
}

.city-chip {
    padding: 10px 20px !important;
    background: rgba(74, 144, 217, 0.08) !important;
    color: #4a90d9 !important;
    border: 1px solid rgba(74, 144, 217, 0.2) !important;
    border-radius: 24px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    cursor: pointer;
    transition: all 0.3s ease;
}

.city-chip:hover {
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%) !important;
    color: white !important;
    border-color: transparent !important;
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(74, 144, 217, 0.3);
}

/* 动画 */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
}

.animate-fade-in {
    animation: fadeIn 0.6s ease-out;
}

.animate-slide-left {
    animation: slideInLeft 0.5s ease-out;
}

.animate-slide-right {
    animation: slideInRight 0.5s ease-out;
}

.animate-float {
    animation: float 3s ease-in-out infinite;
}
</style>
