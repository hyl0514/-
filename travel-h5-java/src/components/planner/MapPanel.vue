<template>
  <div class="map-wrap" ref="wrapRef">
    <!-- 地图标题条 -->
    <div class="map-topbar">
      <div class="map-title">
        <span class="map-title-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M9 20l-5.5 2.5V4L9 1.5 15 4l5.5-2.5v18.5L15 22.5 9 20z" stroke="#2374DD" stroke-width="1.8" stroke-linejoin="round" />
          </svg>
        </span>
        <span>路线地图</span>
        <span v-if="locationStatus" class="location-status">
          <span class="status-dot"></span>
          {{ locationStatus }}
        </span>
      </div>
      <!-- 地图控件 -->
      <div class="map-controls">
        <button class="ctrl-btn" title="放大" @click="zoomIn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>
        <button class="ctrl-btn" title="缩小" @click="zoomOut">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>
        <button class="ctrl-btn" title="回到当前位置" @click="centerToCurrentLocation" v-if="currentPosition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <button class="ctrl-btn" title="全屏" @click="toggleFullscreen">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>
      </div>
    </div>

    <!-- 高德地图容器 -->
    <div class="map-canvas" ref="mapContainer">
      <!-- 空态 -->
      <div class="map-empty" v-if="!hasRoute && mapLoaded">
        <div class="empty-icon">🗺️</div>
        <p class="empty-text">在右侧选择方案后，<br>路线与点位将在此渲染</p>
      </div>
      <!-- 加载状态 -->
      <div class="map-loading" v-if="!mapLoaded && !mapUnavailable">
        <div class="loading-spinner"></div>
        <p>地图加载中...</p>
      </div>
      <!-- 未配置高德 Key 时的降级提示 -->
      <div class="map-unconfigured" v-if="mapUnavailable">
        <div class="empty-icon">🗺️</div>
        <p class="uc-title">高德地图未启用</p>
        <p class="uc-desc">
          在项目根目录 <code>.env.local</code> 中配置 <code>VITE_AMAP_KEY</code> 即可启用真实地图<br>
          当前为本地演示模式，实时定位与轨迹逻辑已预留
        </p>
        <p class="uc-err" v-if="mapErrorMsg">{{ mapErrorMsg }}</p>
      </div>
    </div>

    <!-- 底部定位操作 -->
    <div class="map-bottom">
      <button class="locate-btn" v-if="!isNavigating" @click="startNavigation">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" stroke="#2374DD" stroke-width="2" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#2374DD" stroke-width="2" stroke-linecap="round" />
        </svg>
        开启实时导航
      </button>
      <template v-else>
        <button class="locate-btn active">
          <span class="locate-dot"></span> 导航中
        </button>
        <button class="route-type-btn" @click="toggleRouteType">
          {{ routeType === 'driving' ? '🚗 驾车' : '🚶 步行' }}
        </button>
        <button class="deviate-btn" @click="simulateDeviate">模拟偏离路线</button>
        <button class="stop-btn" @click="stopNavigation">停止导航</button>
      </template>
    </div>

    <!-- 路线信息面板 -->
    <div class="route-info-panel" v-if="routeInfo && isNavigating">
      <div class="info-item">
        <span class="info-label">总距离</span>
        <span class="info-value">{{ formatDistance(routeInfo.distance) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">预计时间</span>
        <span class="info-value">{{ formatDuration(routeInfo.duration) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">当前位置</span>
        <span class="info-value">{{ currentAddress || '定位中...' }}</span>
      </div>
    </div>

    <!-- 偏离提醒弹窗 -->
    <teleport to="body">
      <div class="pc-mask" v-if="showOffAlert" @click.self="showOffAlert = false">
        <div class="pc-modal off-modal">
          <div class="off-head">
            <div class="off-emoji">⚠️</div>
            <div>
              <div class="off-title">检测到您已偏离规划路线</div>
              <div class="off-sub">当前位置距最近的路线点位约 {{ offDistance }}m</div>
            </div>
          </div>
          <div class="off-actions">
            <button class="pc-btn pc-btn-primary pc-btn-lg pc-btn-block" @click="recalculateRoute">
              重新规划路线
            </button>
            <button class="pc-btn pc-btn-lg pc-btn-block" @click="showOffAlert = false">
              我知道了
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTripStore } from '../../store/tripStore'
import { useExpenseStore } from '../../store/expenseStore'
import { geocode, drivingRoute, walkingRoute, getCurrentPosition, getLocationByIP, calculateDistance, reverseGeocode, isAmapEnabled, createMap } from '../../utils/amapApi'
import toast from '../../utils/msg'

const { state, flatPoints, bumpOffRoute } = useTripStore()
const { state: expenseState } = useExpenseStore()

const wrapRef = ref(null)
const mapContainer = ref(null)
const mapLoaded = ref(false)
const mapUnavailable = ref(false)
const mapErrorMsg = ref('')
const hasRoute = computed(() => flatPoints.value.length > 0)

// 地图实例
let mapInstance = null
let markerCluster = null
let routePolyline = null
let locationMarker = null
let watchId = null

// 状态
const currentPosition = ref(null)
const currentAddress = ref('')
const locationStatus = ref('')
const isNavigating = ref(false)
const routeType = ref('driving') // 'driving' or 'walking'
const routeInfo = ref(null)
const showOffAlert = ref(false)
const offDistance = ref(0)
const trackPoints = ref([]) // 轨迹点

// 颜色方案
const dayColors = ['#2374DD', '#0EA5A4', '#E8912F', '#8B5CF6', '#2FA96B', '#E5484D', '#0891B2', '#D946EF']
const getDayColor = (dayNo) => dayColors[(dayNo - 1) % dayColors.length]

// ---------------- 地图初始化 ----------------

onMounted(async () => {
    await initMap()
})

onUnmounted(() => {
    stopNavigation()
    if (mapInstance) {
        mapInstance.destroy()
    }
})

const initMap = async () => {
    // 未配置高德 Key：进入降级模式，页面给出配置提示而不是一直 loading
    if (!isAmapEnabled()) {
        mapUnavailable.value = true
        locationStatus.value = '地图未启用'
        return
    }

    try {
        mapInstance = await createMap(mapContainer.value)
        mapLoaded.value = true
        locationStatus.value = '地图已就绪'
        mapInstance.on('complete', () => {
            locationStatus.value = '地图已就绪'
        })
        // 尝试获取初始位置（失败不阻塞地图展示）
        tryGetCurrentLocation()
    } catch (e) {
        mapUnavailable.value = true
        mapErrorMsg.value = e?.message || '高德地图加载失败'
        locationStatus.value = '地图不可用'
        console.warn('[AMap]', e?.message)
    }
}

const tryGetCurrentLocation = async () => {
    if (!mapInstance) return
    try {
        // 第一优先级：浏览器高精度定位（需要用户权限）
        const pos = await getCurrentPosition()
        currentPosition.value = pos
        mapInstance.setCenter([pos.lng, pos.lat])
        mapInstance.setZoom(13)
        addLocationMarker(pos.lng, pos.lat)
        const addr = await reverseGeocode(pos.lng, pos.lat)
        currentAddress.value = addr.formattedAddress
        locationStatus.value = '已定位'
    } catch (e) {
        console.warn('[定位] 浏览器定位失败，降级 IP 定位:', e.message)
        try {
            // 第二优先级：IP 定位（无需权限，定位到城市中心）
            const ipPos = await getLocationByIP()
            currentPosition.value = ipPos
            mapInstance.setCenter([ipPos.lng, ipPos.lat])
            mapInstance.setZoom(11)
            addLocationMarker(ipPos.lng, ipPos.lat)
            currentAddress.value = ipPos.address
            locationStatus.value = 'IP 定位'
        } catch (e2) {
            console.warn('[定位] IP 定位也失败，保持默认视图:', e2.message)
            locationStatus.value = '默认视图'
        }
    }
}

const addLocationMarker = (lng, lat) => {
    if (!mapInstance) return
    if (locationMarker) {
        locationMarker.setMap(null)
    }
    
    locationMarker = new AMap.Marker({
        position: [lng, lat],
        content: `<div class="location-marker">
            <div class="marker-pulse"></div>
            <div class="marker-dot"></div>
        </div>`,
        offset: new AMap.Pixel(-18, -18)
    })
    locationMarker.setMap(mapInstance)
}

// ---------------- 路线渲染 ----------------

watch(flatPoints, async (points) => {
    if (!mapInstance || !points.length) return
    
    await renderRoute(points)
}, { immediate: true })

const renderRoute = async (points) => {
    // 清除旧路线
    clearRoute()
    
    if (!points.length) return
    
    try {
        // 批量地理编码获取坐标
        const coordinates = []
        for (const point of points) {
            try {
                const geo = await geocode(point.name, state.form.destination)
                if (!geo) continue // 静默跳过查不到的点位
                coordinates.push({
                    ...point,
                    lng: geo.lng,
                    lat: geo.lat
                })
            } catch (e) {
                console.warn(`点位 "${point.name}" 编码失败:`, e.message)
            }
        }
        
        if (!coordinates.length) return
        
        // 添加标记点
        const markers = coordinates.map((point, index) => {
            const color = getDayColor(point.dayNo)
            const marker = new AMap.Marker({
                position: [point.lng, point.lat],
                content: `<div class="route-marker" style="background: ${color}">
                    <span>${index + 1}</span>
                </div>`,
                offset: new AMap.Pixel(-15, -15),
                title: `${point.name} (第${point.dayNo}天)`
            })
            
            // 信息窗体
            const infoWindow = new AMap.InfoWindow({
                content: `<div class="marker-info">
                    <h4>${point.name}</h4>
                    <p>第${point.dayNo}天 · ${point.pointType || '景点'}</p>
                </div>`,
                offset: new AMap.Pixel(0, -30)
            })
            
            marker.on('click', () => {
                infoWindow.open(mapInstance, marker.getPosition())
            })
            
            return marker
        })
        
        mapInstance.add(markers)
        
        // 绘制路线
        const path = coordinates.map(p => [p.lng, p.lat])
        routePolyline = new AMap.Polyline({
            path: path,
            strokeColor: '#2374DD',
            strokeWeight: 6,
            strokeOpacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round',
            showDir: true
        })
        mapInstance.add(routePolyline)
        
        // 调整视野
        mapInstance.setFitView(markers, false, [60, 60, 60, 60])
        
        locationStatus.value = `已加载 ${coordinates.length} 个点位`
    } catch (e) {
        console.error('渲染路线失败:', e)
        toast.error('渲染路线失败')
    }
}

const clearRoute = () => {
    if (!mapInstance) return
    if (routePolyline) {
        routePolyline.setMap(null)
        routePolyline = null
    }
    // 清除所有标记
    mapInstance.clearMap()
    if (locationMarker) {
        mapInstance.add(locationMarker)
    }
}

// ---------------- 导航功能 ----------------

const startNavigation = async () => {
    if (!mapInstance) {
        toast.error('请先配置高德 Key 并刷新页面后再使用导航')
        return
    }
    if (!flatPoints.value.length) {
        toast.error('请先选择一套路线方案')
        return
    }
    
    // 如果初始定位没拿到，快速尝试一次 IP 定位
    if (!currentPosition.value) {
        try {
            const ipPos = await getLocationByIP()
            currentPosition.value = ipPos
            mapInstance.setCenter([ipPos.lng, ipPos.lat])
            addLocationMarker(ipPos.lng, ipPos.lat)
        } catch {
            toast.error('定位不可用，无法开始导航')
            return
        }
    }
    
    isNavigating.value = true
    trackPoints.value = []
    locationStatus.value = '导航中'
    
    // 开始监听位置
    startLocationWatch()
    
    // 规划路线
    await planRoute()
    
    toast.success('导航已开始')
}

const stopNavigation = () => {
    isNavigating.value = false
    locationStatus.value = '导航已停止'
    
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
        watchId = null
    }
    
    trackPoints.value = []
}

const startLocationWatch = () => {
    if (!navigator.geolocation) {
        toast.info('当前浏览器不支持持续定位，已用当前位置继续')
        return
    }
    
    watchId = navigator.geolocation.watchPosition(
        async (position) => {
            const { longitude, latitude } = position.coords
            currentPosition.value = { lng: longitude, lat: latitude }
            
            // 更新位置标记
            addLocationMarker(longitude, latitude)
            
            // 记录轨迹
            trackPoints.value.push({ lng: longitude, lat: latitude, time: Date.now() })
            
            // 绘制轨迹
            drawTrack()
            
            // 检测偏离
            checkDeviation(longitude, latitude)
            
            // 更新地址
            try {
                const addr = await reverseGeocode(longitude, latitude)
                currentAddress.value = addr.formattedAddress
            } catch (e) {
                // 忽略
            }
        },
        (error) => {
            console.error('定位错误:', error)
            locationStatus.value = '定位失败'
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
        }
    )
}

const drawTrack = () => {
    if (trackPoints.value.length < 2) return
    
    const trackPolyline = new AMap.Polyline({
        path: trackPoints.value.map(p => [p.lng, p.lat]),
        strokeColor: '#2FA96B',
        strokeWeight: 4,
        strokeOpacity: 0.6,
        lineJoin: 'round',
        lineCap: 'round'
    })
    mapInstance.add(trackPolyline)
}

const planRoute = async () => {
    try {
        // 获取所有点位坐标
        const waypoints = []
        for (const point of flatPoints.value) {
            try {
                const geo = await geocode(point.name, state.form.destination)
                if (!geo) continue
                waypoints.push({ lng: geo.lng, lat: geo.lat })
            } catch (e) {
                // 跳过失败的点位
            }
        }
        
        if (waypoints.length < 2) return
        
        // 根据路线类型规划
        const planFn = routeType.value === 'driving' ? drivingRoute : walkingRoute
        const result = await planFn(waypoints)
        
        routeInfo.value = {
            distance: result.distance,
            duration: result.duration
        }
    } catch (e) {
        console.error('路线规划失败:', e)
    }
}

const checkDeviation = (lng, lat) => {
    if (!flatPoints.value.length) return
    
    // 计算距离最近路线点的距离
    let minDistance = Infinity
    for (const point of flatPoints.value) {
        // 这里简化处理，实际应该用坐标计算
        // 暂时使用固定阈值
        minDistance = 500 // 假设 500 米内算正常
    }
    
    // 简化版：如果距离某个点位太远则提示
    // 实际应该用更复杂的算法
}

const recalculateRoute = async () => {
    showOffAlert.value = false
    await planRoute()
    toast.success('路线已重新规划')
    bumpOffRoute()
}

const simulateDeviate = () => {
    offDistance.value = 300 + Math.floor(Math.random() * 200)
    showOffAlert.value = true
}

// ---------------- 控件操作 ----------------

const zoomIn = () => {
    if (mapInstance) {
        const zoom = mapInstance.getZoom()
        mapInstance.setZoom(Math.min(18, zoom + 1))
    }
}

const zoomOut = () => {
    if (mapInstance) {
        const zoom = mapInstance.getZoom()
        mapInstance.setZoom(Math.max(3, zoom - 1))
    }
}

const centerToCurrentLocation = () => {
    if (currentPosition.value && mapInstance) {
        mapInstance.setCenter([currentPosition.value.lng, currentPosition.value.lat])
        mapInstance.setZoom(15)
    }
}

const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        wrapRef.value?.requestFullscreen?.()
    } else {
        document.exitFullscreen?.()
    }
}

const toggleRouteType = () => {
    routeType.value = routeType.value === 'driving' ? 'walking' : 'driving'
    if (isNavigating.value) {
        planRoute()
    }
}

// ---------------- 工具函数 ----------------

const formatDistance = (meters) => {
    if (meters < 1000) return `${meters}m`
    return `${(meters / 1000).toFixed(1)}km`
}

const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}小时${minutes}分钟`
    return `${minutes}分钟`
}
</script>

<style scoped>
.map-wrap {
    height: 100%;
    background: #fff;
    border: 1px solid rgba(35, 116, 221, 0.1);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(35, 116, 221, 0.08);
    transition: box-shadow 0.3s ease;
}

.map-wrap:hover {
    box-shadow: 0 6px 28px rgba(35, 116, 221, 0.14);
}

.map-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--divider);
    flex-shrink: 0;
    background: linear-gradient(180deg, #fafcff 0%, #ffffff 100%);
}

.map-title {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-1);
}

.location-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-3);
    font-weight: 400;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2FA96B;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.map-controls {
    display: flex;
    gap: 7px;
}

.ctrl-btn {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    border: 1px solid var(--border);
    background: #fff;
    color: var(--text-2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.ctrl-btn:hover {
    color: var(--brand);
    border-color: #b9d2f2;
    background: var(--brand-lighter);
    transform: scale(1.08);
    box-shadow: 0 2px 8px rgba(35, 116, 221, 0.15);
}

.ctrl-btn:active {
    transform: scale(0.96);
}

.map-canvas {
    flex: 1;
    position: relative;
    min-height: 0;
}

.map-empty {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(240, 245, 241, 0.9);
    z-index: 10;
}

.empty-icon {
    font-size: 52px;
    margin-bottom: 14px;
    animation: floatIcon 3s ease-in-out infinite;
}

@keyframes floatIcon {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}

.empty-text {
    font-size: 13.5px;
    color: var(--text-3);
    text-align: center;
    line-height: 1.7;
}

.map-loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    z-index: 10;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--brand);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.map-loading p {
    margin-top: 12px;
    font-size: 13px;
    color: var(--text-3);
}

/* 未配置高德 Key */
.map-unconfigured {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    gap: 6px;
    background:
        radial-gradient(circle at 50% 30%, rgba(35, 116, 221, 0.08), transparent 60%),
        #f7fafd;
    z-index: 10;
}

.uc-title {
    margin: 4px 0 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-1);
}

.uc-desc {
    margin: 0;
    font-size: 12.5px;
    line-height: 1.8;
    color: var(--text-3);
    text-align: center;
}

.uc-desc code {
    padding: 1px 6px;
    border-radius: 5px;
    background: #e8f0fb;
    color: var(--brand);
    font-size: 12px;
}

.uc-err {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--warning);
}

/* 底部定位操作 */
.map-bottom {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid var(--divider);
    flex-shrink: 0;
    background: linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
}

.locate-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 38px;
    padding: 0 16px;
    border-radius: 10px;
    border: 1px solid #b9d2f2;
    background: linear-gradient(135deg, #f4f8fe 0%, #eaf2fd 100%);
    color: var(--brand);
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 2px 6px rgba(35, 116, 221, 0.08);
}

.locate-btn:hover {
    background: linear-gradient(135deg, #eaf2fd 0%, #d4e5fa 100%);
    box-shadow: 0 4px 12px rgba(35, 116, 221, 0.18);
    transform: translateY(-1px);
}

.locate-btn.active {
    cursor: default;
    background: linear-gradient(135deg, #2374DD 0%, #4a90e8 100%);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 4px 14px rgba(35, 116, 221, 0.3);
}

.locate-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: blinkDot 1.2s infinite;
}

@keyframes blinkDot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

.route-type-btn,
.deviate-btn,
.stop-btn {
    height: 38px;
    padding: 0 15px;
    border-radius: 10px;
    font-size: 13.5px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.route-type-btn {
    border: 1px solid var(--border);
    background: #fff;
    color: var(--text-2);
}

.deviate-btn {
    border: 1px solid #f3d2b0;
    background: linear-gradient(135deg, #fdf3e4 0%, #fae8cc 100%);
    color: var(--warning);
}

.stop-btn {
    border: 1px solid var(--border);
    background: #fff;
    color: var(--text-2);
}

.route-type-btn:hover,
.stop-btn:hover {
    border-color: var(--brand);
    color: var(--brand);
}

.deviate-btn:hover {
    border-color: var(--warning);
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(232, 145, 47, 0.15);
}

/* 路线信息面板 */
.route-info-panel {
    position: absolute;
    top: 70px;
    left: 14px;
    right: 14px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    gap: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    z-index: 100;
}

.info-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-label {
    font-size: 11px;
    color: var(--text-3);
}

.info-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-1);
}

/* 偏离弹窗 */
.off-modal {
    width: 400px;
    border-radius: 20px;
    overflow: hidden;
}

.off-head {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 26px 24px 10px;
    background: linear-gradient(135deg, #fff9eb 0%, #fff 100%);
}

.off-emoji {
    font-size: 34px;
    animation: shake 0.6s ease-in-out infinite;
}

@keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-8deg); }
    75% { transform: rotate(8deg); }
}

.off-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-1);
}

.off-sub {
    font-size: 13px;
    color: var(--text-3);
    margin-top: 4px;
}

.off-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 18px 24px 24px;
}
</style>

<style>
/* 全局样式（地图标记） */
.location-marker {
    position: relative;
    width: 36px;
    height: 36px;
}

.marker-pulse {
    position: absolute;
    inset: 0;
    background: rgba(35, 116, 221, 0.3);
    border-radius: 50%;
    animation: markerPulse 2s infinite;
}

@keyframes markerPulse {
    0% {
        transform: scale(0.8);
        opacity: 1;
    }
    100% {
        transform: scale(1.5);
        opacity: 0;
    }
}

.marker-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 14px;
    height: 14px;
    background: #2374DD;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.route-marker {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
    font-size: 13px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    border: 2px solid #fff;
}

.marker-info {
    padding: 8px 12px;
    min-width: 150px;
}

.marker-info h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.marker-info p {
    margin: 0;
    font-size: 12px;
    color: #666;
}

@media (max-width: 900px) {
    .map-topbar { flex-wrap: wrap; row-gap: 8px; padding: 10px 12px; }
    .map-title { flex: 1 1 100%; flex-wrap: wrap; min-width: 0; font-size: 14px; }
    .map-controls { margin-left: auto; }
    .ctrl-btn { width: 44px; height: 44px; }
}
</style>
