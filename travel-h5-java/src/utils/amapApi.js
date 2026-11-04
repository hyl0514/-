/**
 * 高德地图 API 服务层（预留接口）
 *
 * 使用方式：
 *   1. 在项目根目录 .env.local 中配置 VITE_AMAP_KEY（申请地址 https://console.amap.com）
 *      可选：VITE_AMAP_SECURITY_CODE（JS API 安全密钥，2021 年后新建的 Key 必须配置）
 *   2. 无需在 index.html 手动引脚本，本模块首次调用时按需注入 JS API 2.0
 *   3. 页面统一从本模块导入 geocode / drivingRoute / createMap 等方法，
 *      不要直接 new AMap.Map，方便后续切换为后端代理调用
 *
 * 未配置 Key 时：isAmapEnabled() 返回 false，各方法抛出可读错误，
 * 页面应进入降级模式（展示提示而不是一直 loading）。
 */

const AMAP_KEY = (import.meta.env.VITE_AMAP_KEY || '').trim()
const AMAP_SECURITY_CODE = (import.meta.env.VITE_AMAP_SECURITY_CODE || '').trim()

// 后端高德代理接口（优先走后端，因为前端 Key 是 JS API 类型，不能调 REST API）
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

/**
 * 后端 IP 定位 —— 后端直接用 ipinfo.io 查真实出口 IP
 * 返回: { lng, lat, province, city, address, source, ip }
 * 注意：高德 /v3/ip 查不到移动宽带 IP（数据库不全），
 *       后端已自动降级用 ipinfo.io，更准。
 */
const fetchBackendIpLocation = async () => {
    try {
        const r = await fetch(`${API_BASE}/amap/ip-location`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${localStorage.getItem('pc-token') || ''}` }
        })
        if (!r.ok) throw new Error('backend amap not ready')
        const json = await r.json()
        if (!json.success || !json.data) throw new Error('backend amap empty')
        const d = json.data
        return {
            lng: d.lng, lat: d.lat,
            province: d.province || '',
            city: d.city || '',
            address: d.address || '',
            source: d.source || 'unknown',
            ip: d.ip || ''
        }
    } catch (e) {
        console.warn('[IP定位] 后端调用失败:', e.message)
        return null
    }
}

/** 后端地理编码（支持 POI 名兜底，都查不到返回 null 不崩） */
const fetchBackendGeocode = async (address, city = '') => {
    try {
        const qs = new URLSearchParams({ address })
        if (city) qs.set('city', city)
        const r = await fetch(`${API_BASE}/amap/geocode?${qs}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('pc-token') || ''}` }
        })
        if (!r.ok) throw new Error('backend not ready')
        const json = await r.json()
        if (!json.success) throw new Error('backend fail')
        const d = json.data

        // 情况 1：标准地理编码返回了 geocodes 数组
        if (d.geocodes && d.geocodes.length > 0) {
            const loc = d.geocodes[0].location // "lng,lat"
            if (loc) {
                const [lng, lat] = loc.split(',').map(Number)
                return { lng, lat, formattedAddress: d.geocodes[0].formatted_address || address, name: address }
            }
        }
        // 情况 2：POI 兜底返回 source="poi-fallback"，location 在顶层
        if (d.location && typeof d.location === 'string' && d.location.includes(',')) {
            const [lng, lat] = d.location.split(',').map(Number)
            return { lng, lat, formattedAddress: d.formatted_address || address, name: address }
        }
        // 情况 3：都没查到（source="empty"），返回 null 让调用方静默跳过
        return null
    } catch (e) {
        console.warn('[地理编码] 后端调用失败:', e.message)
        return null
    }
}

/** 后端逆地理编码 */
const fetchBackendRegeocode = async (lng, lat) => {
    try {
        const r = await fetch(`${API_BASE}/amap/regeocode?lng=${lng}&lat=${lat}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('pc-token') || ''}` }
        })
        if (!r.ok) throw new Error('backend not ready')
        const json = await r.json()
        if (!json.success) throw new Error('backend empty')
        const addr = json.data?.regeocode?.formatted_address || ''
        return { formattedAddress: addr, name: addr }
    } catch {
        return null
    }
}

// 需要的高德插件（按需加载，减少首屏体积）
const PLUGINS = [
    'AMap.Geocoder',
    'AMap.Driving',
    'AMap.Walking',
    'AMap.Riding',
    'AMap.Transfer',
    'AMap.PlaceSearch',
    'AMap.Geolocation',
    'AMap.AutoComplete'
]

const DEFAULT_CENTER = [116.397428, 39.90923] // 北京
const SCRIPT_ID = 'amap-jsapi-script'

/** 是否已配置高德 Key（未配置时页面走降级模式） */
export const isAmapEnabled = () => !!AMAP_KEY

/** 地图初始化所需配置（供 MapPanel 使用） */
export const getAmapConfig = () => ({
    key: AMAP_KEY,
    securityCode: AMAP_SECURITY_CODE,
    version: '2.0',
    plugins: [...PLUGINS],
    center: [...DEFAULT_CENTER]
})

let loadingPromise = null

/**
 * 按需加载高德 JS API（并发调用复用同一个 Promise）
 * @returns {Promise<typeof window.AMap>}
 */
export const loadAMap = () => {
    if (window.AMap) return Promise.resolve(window.AMap)
    if (!AMAP_KEY) {
        return Promise.reject(new Error('未配置高德 Key（VITE_AMAP_KEY），已进入本地演示模式'))
    }
    if (loadingPromise) return loadingPromise

    loadingPromise = new Promise((resolve, reject) => {
        // 安全密钥必须在脚本加载前设置
        if (AMAP_SECURITY_CODE) window._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY_CODE }

        const script = document.createElement('script')
        script.id = SCRIPT_ID
        script.async = true
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=${PLUGINS.join(',')}`
        script.onload = () => {
            if (window.AMap) resolve(window.AMap)
            else reject(new Error('高德 JS API 加载失败'))
        }
        script.onerror = () => {
            loadingPromise = null
            reject(new Error('高德 JS API 加载失败，请检查网络或 Key 是否有效'))
        }
        document.head.appendChild(script)
    })
    return loadingPromise
}

/** 内部：确保 AMap 可用，否则抛出可读错误 */
const ensureAMap = async () => {
    if (window.AMap) return window.AMap
    return loadAMap()
}

/**
 * 创建地图实例（页面应通过此方法创建地图，便于统一配置/降级）
 * @param {HTMLElement} container 容器元素
 * @param {Object} options 覆盖默认配置
 */
export const createMap = async (container, options = {}) => {
    const AMap = await ensureAMap()
    return new AMap.Map(container, {
        zoom: 12,
        center: DEFAULT_CENTER,
        mapStyle: 'amap://styles/normal',
        resizeEnable: true,
        doubleClickZoom: true,
        scrollWheel: true,
        ...options
    })
}

/**
 * 地理编码：地址 → 经纬度
 * 优先走后端 /api/amap/geocode（Web 服务 Key），失败降级到 AMap SDK（JS API Key）
 * 都查不到返回 null（不抛错，让调用方静默跳过）
 */
export const geocode = async (address, city = '') => {
    // 优先后端
    const backend = await fetchBackendGeocode(address, city)
    if (backend) return backend
    // 降级前端 AMap SDK（JS API Key 对 POI 名支持好一些）
    try {
        const AMap = await ensureAMap()
        return await new Promise((resolve) => {
            const geocoder = new AMap.Geocoder({ city: city || '全国' })
            geocoder.getLocation(address, (status, result) => {
                if (status === 'complete' && result.info === 'OK' && result.geocodes?.length) {
                    const location = result.geocodes[0]
                    resolve({
                        lng: location.location.lng,
                        lat: location.location.lat,
                        formattedAddress: location.formattedAddress,
                        name: location.formattedAddress
                    })
                } else {
                    console.warn('[地理编码] AMap SDK 也没找到:', address, result?.info)
                    resolve(null)
                }
            })
        })
    } catch (e) {
        console.warn('[地理编码] AMap SDK 异常:', e.message)
        return null
    }
}

/**
 * 逆地理编码：经纬度 → 地址
 * 优先走后端 /api/amap/regeocode，失败降级到 AMap SDK
 */
export const reverseGeocode = async (lng, lat) => {
    const backend = await fetchBackendRegeocode(lng, lat)
    if (backend) return backend
    const AMap = await ensureAMap()
    return new Promise((resolve, reject) => {
        const geocoder = new AMap.Geocoder()
        geocoder.getAddress([lng, lat], (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
                resolve({
                    formattedAddress: result.regeocode.formattedAddress,
                    name: result.regeocode.formattedAddress
                })
            } else {
                reject(new Error(`逆地理编码失败: ${result?.info || '未知错误'}`))
            }
        })
    })
}

/** 路线规划通用实现（驾车 / 步行 / 骑行） */
const searchRoute = async (Type, waypoints, policy) => {
    const AMap = await ensureAMap()
    return new Promise((resolve, reject) => {
        if (!waypoints || waypoints.length < 2) {
            reject(new Error('至少需要起点和终点两个坐标'))
            return
        }
        const options = policy ? { policy } : {}
        const planner = new Type(options)
        const origin = [waypoints[0].lng, waypoints[0].lat]
        const destination = [waypoints[waypoints.length - 1].lng, waypoints[waypoints.length - 1].lat]
        const midPoints = waypoints.slice(1, -1).map(p => [p.lng, p.lat])

        planner.search(origin, destination, midPoints, (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
                const route = result.routes[0]
                resolve({
                    routes: result.routes,
                    distance: route.distance, // 米
                    duration: route.time,     // 秒
                    steps: route.steps
                })
            } else {
                reject(new Error(`路线规划失败: ${result?.info || '未知错误'}`))
            }
        })
    })
}

/** 驾车路线规划（最快捷策略） */
export const drivingRoute = async (waypoints) => {
    const AMap = await ensureAMap()
    return searchRoute(AMap.Driving, waypoints, AMap.DrivingPolicy?.LEAST_TIME)
}

/** 步行路线规划 */
export const walkingRoute = async (waypoints) => {
    const AMap = await ensureAMap()
    return searchRoute(AMap.Walking, waypoints)
}

/** 骑行路线规划 */
export const ridingRoute = async (waypoints) => {
    const AMap = await ensureAMap()
    return searchRoute(AMap.Riding, waypoints)
}

/**
 * 周边 POI 搜索
 * @param {number} lng 中心点经度
 * @param {number} lat 中心点纬度
 * @param {string} keywords 关键词（餐厅 / 酒店 / 景点…）
 * @param {number} radius 半径（米）
 */
export const searchNearby = async (lng, lat, keywords, radius = 1000) => {
    const AMap = await ensureAMap()
    return new Promise((resolve, reject) => {
        const placeSearch = new AMap.PlaceSearch({ pageSize: 20 })
        placeSearch.searchNearby(keywords, [lng, lat], radius, (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
                resolve((result.poiList?.pois || []).map(mapPoi))
            } else {
                reject(new Error(`POI 搜索失败: ${result?.info || '未知错误'}`))
            }
        })
    })
}

/** 关键词 POI 搜索 */
export const searchByKeyword = async (keywords, city = '') => {
    const AMap = await ensureAMap()
    return new Promise((resolve, reject) => {
        const placeSearch = new AMap.PlaceSearch({ city: city || '全国', pageSize: 20 })
        placeSearch.search(keywords, (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
                resolve((result.poiList?.pois || []).map(mapPoi))
            } else {
                reject(new Error(`POI 搜索失败: ${result?.info || '未知错误'}`))
            }
        })
    })
}

const mapPoi = (poi) => ({
    id: poi.id,
    name: poi.name,
    type: poi.type,
    address: poi.address,
    city: poi.cityname,
    lng: poi.location?.lng,
    lat: poi.location?.lat,
    distance: poi.distance,
    tel: poi.tel,
    rating: poi.biz_ext?.rating ?? null,
    cost: poi.biz_ext?.cost ?? null
})

/** 高德定位（需要 HTTPS 或 localhost，并开启浏览器定位权限） */
export const getCurrentPosition = async () => {
    const AMap = await ensureAMap()
    return new Promise((resolve, reject) => {
        const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000
        })
        geolocation.getCurrentPosition((status, result) => {
            if (status === 'complete') {
                resolve({
                    lng: result.position.lng,
                    lat: result.position.lat,
                    accuracy: result.accuracy,
                    address: result.formattedAddress
                })
            } else {
                reject(new Error(`定位失败: ${result?.message || '未知错误'}`))
            }
        })
    })
}

/**
 * IP 定位降级（无需浏览器权限，优先走后端 /api/amap/ip-location）
 * 后端没配 Web 服务 Key 时降级到 AMap SDK
 * @returns {Promise<{lng:number, lat:number, city:string, address:string}>}
 */
export const getLocationByIP = async () => {
    // 第一优先级：后端高德 Web 服务（最可靠）
    const backend = await fetchBackendIpLocation()
    if (backend) return backend

    // 第二优先级：AMap.AutoComplete + city=自动（走 webapi.amap.com，可能被劫持）
    const AMap = await ensureAMap()
    return new Promise((resolve, reject) => {
        const auto = new AMap.AutoComplete({ city: '自动' })
        auto.search('', (status, result) => {
            if (status === 'complete' && result.tips?.length) {
                const tip = result.tips[0]
                if (tip.location) {
                    resolve({
                        lng: tip.location.lng,
                        lat: tip.location.lat,
                        city: tip.district || '',
                        address: tip.name + '（浏览器 IP 定位）'
                    })
                    return
                }
            }
            reject(new Error('IP 定位失败（后端未配置 + 前端降级也失败）'))
        })
    })
}

/** 计算两点距离（米）：高德未加载时用 Haversine 公式兜底 */
export const calculateDistance = (lng1, lat1, lng2, lat2) => {
    if (window.AMap?.LngLat) {
        return new window.AMap.LngLat(lng1, lat1).distance(new window.AMap.LngLat(lng2, lat2))
    }
    const toRad = (d) => (d * Math.PI) / 180
    const R = 6378137
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return Math.round(2 * R * Math.asin(Math.sqrt(a)))
}

/** 批量地理编码（失败项返回 null，不中断） */
export const batchGeocode = async (addresses, city = '') => {
    const results = []
    for (const address of addresses) {
        try {
            results.push(await geocode(address, city))
        } catch (e) {
            console.warn(`地址 "${address}" 编码失败:`, e.message)
            results.push(null)
        }
    }
    return results
}

export { DEFAULT_CENTER }

export default {
    isAmapEnabled,
    getAmapConfig,
    loadAMap,
    createMap,
    geocode,
    reverseGeocode,
    drivingRoute,
    walkingRoute,
    ridingRoute,
    searchNearby,
    searchByKeyword,
    getCurrentPosition,
    calculateDistance,
    batchGeocode
}
