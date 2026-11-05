import { post } from './request'

/**
 * AI 生成多套候选路线
 * @param {Object} data
 * @param {string} data.origin 出发地（可选）
 * @param {string} data.destination 目的地
 * @param {number} data.travelDays 出行天数
 * @param {string} data.preference 出行偏好：休闲 / 美食 / 小众打卡
 */
export function generateRoutes(data, config) {
    return post('travel/routes/generate', data, config)
}
