import { post, get, del } from './request'

// 行程收藏类型（后端 favorites.fav_type）
const FAV_TYPE = 'trip'

/**
 * 后端 favorites.target_id 为数字类型，这里用「城市 + 天数」生成稳定数字，
 * 保证同一行程的添加 / 检查 / 删除都能命中同一条记录。
 */
const tripTargetId = (city, days) => {
    const text = `${city || ''}-${days || 0}`
    let hash = 0
    for (const ch of text) hash = (hash * 31 + ch.codePointAt(0)) % 2147483647
    return hash || 1
}

// 前端行程对象 → 后端 Favorite 实体
const toFavoritePayload = (travelData) => ({
    favType: FAV_TYPE,
    targetId: tripTargetId(travelData.city, travelData.days),
    targetName: travelData.title || `${travelData.city || ''} ${travelData.days || 0} 天行程`,
    coverImg: travelData.cityImg || travelData.cover || travelData.img || null,
    payload: JSON.stringify(travelData)
})

// 后端 Favorite 实体 → 页面使用的行程收藏结构（字段兼容）
const toTripFavorite = (fav) => {
    let payload = {}
    try { payload = fav.payload ? JSON.parse(fav.payload) : {} } catch { payload = {} }
    return {
        ...fav,
        city: payload.city || '',
        days: payload.days || 0,
        title: fav.targetName || payload.title || '',
        totalBudget: payload.budget ?? payload.totalBudget ?? null,
        createdAt: fav.savedAt
    }
}

// 添加收藏
export function addFavorite(travelData) {
    return post('/favorites', toFavoritePayload(travelData))
}

// 删除收藏（后端按 id 删除，先按城市+天数定位）
export async function removeFavorite(city, days) {
    const list = await getFavoriteList()
    const targetId = tripTargetId(city, days)
    const hit = list.find(f => Number(f.targetId) === targetId)
    if (!hit) return false
    return del(`/favorites/${hit.id}`)
}

// 检查是否已收藏
export function checkFavorite(city, days) {
    return get('/favorites/check', { type: FAV_TYPE, targetId: tripTargetId(city, days) })
}

// 获取收藏列表
export async function getFavoriteList() {
    const list = await get('/favorites', { type: FAV_TYPE })
    return (list || []).map(toTripFavorite)
}

// 获取收藏数量
export async function getFavoriteCount() {
    const list = await getFavoriteList()
    return list.length
}
