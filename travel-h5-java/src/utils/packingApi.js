import { post } from './request'

/**
 * 调用 AI 生成行李打包清单
 * @param {Object} data 行程信息
 * @param {string} data.destination 目的地
 * @param {number} data.travelDays 出行总天数
 * @param {string} data.weatherInfo 7天天气信息（可选）
 * @param {string} data.tripType 出行类型：旅游 / 出差
 */
export function generatePackingList(data) {
    return post('travel/packing/generate', data)
}

/**
 * AI 检测清单中可能遗漏的物品
 * @param {Object} data
 * @param {string} data.destination
 * @param {number} data.travelDays
 * @param {string} data.weatherInfo
 * @param {string} data.tripType
 * @param {string[]} data.itemNames 当前已包含物品名称
 */
export function checkPackingMissing(data) {
    return post('travel/packing/check', data)
}
