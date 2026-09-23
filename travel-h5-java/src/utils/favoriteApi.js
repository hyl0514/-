import { post, get } from './request'

// 添加收藏
export function addFavorite(travelData) {
    return post('favorite/add', travelData)
}

// 删除收藏
export function removeFavorite(city, days) {
    return post(`favorite/remove?city=${encodeURIComponent(city)}&days=${days}`)
}

// 检查是否已收藏
export function checkFavorite(city, days) {
    return get('favorite/check', { city, days })
}

// 获取收藏列表
export function getFavoriteList() {
    return get('favorite/list')
}

// 获取收藏数量
export function getFavoriteCount() {
    return get('favorite/count')
}
