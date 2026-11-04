import { post } from './request'

/**
 * 根据选中路线推荐沿途周边场所（酒店/景点/餐饮/娱乐）
 * @param {Object} data
 * @param {string} data.destination 目的地
 * @param {string} data.routeContext 每日点位上下文
 */
export function recommendPoi(data) {
    return post('travel/poi/recommend', data)
}
