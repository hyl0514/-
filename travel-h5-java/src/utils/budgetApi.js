import { post } from './request'

/**
 * AI 省钱建议：预算临近上限时调用
 * @param {Object} data { destination, totalBudget, estimatedCost, actualCost, bills }
 */
export function getSavingAdvice(data) {
    return post('travel/budget/advice', data)
}

/**
 * 行程结束一键生成消费复盘报告
 * @param {Object} data { destination, totalBudget, estimatedCost, actualCost, bills }
 */
export function getReviewReport(data) {
    return post('travel/budget/review', data)
}
