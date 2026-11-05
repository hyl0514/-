/**
 * 前端统一 API 层（前后端 / 数据库对接入口）
 *
 * 后端约定
 * - 基础路径：VITE_API_BASE，默认 /api（本地由 Vite 代理到 VITE_PROXY_TARGET，默认 http://localhost:3200）
 * - 统一响应体：{ success: boolean, code: number, message: string, data: T }
 * - 鉴权：登录后返回 token，前端存 localStorage(pc-token)，请求头 Authorization: Bearer <token>
 * - 时间格式：yyyy-MM-dd HH:mm:ss（前端展示前自行格式化）
 *
 * 各分组注释标注了对应的 MySQL 表，建库建表时按字段对齐即可。
 * 页面 / store 一律从本文件导入接口，不要在组件里直接写 URL。
 */

import { get, post, put, del } from '../utils/request'
import { generateRoutes } from '../utils/routeApi'
import { recommendPoi } from '../utils/poiApi'
import { getSavingAdvice, getReviewReport } from '../utils/budgetApi'
import { generatePackingList, checkPackingMissing } from '../utils/packingApi'
import { addFavorite, removeFavorite, checkFavorite, getFavoriteList, getFavoriteCount } from '../utils/favoriteApi'
import { getWeather, getHotWeather, getWeatherList } from '../utils/weatherApi'
import { achievementApi } from '../utils/achievementApi'

/* ======================= 1. 认证 / 用户 =======================
 * 表：t_user(id, username, password_hash, role, nickname, avatar, sign, origin, budget, interests, created_at)
 *     role: admin | user
 */
export const authApi = {
    /** 登录 → { token, user: { id, username, role, nickname, avatar, ... } } */
    login: (data) => post('/auth/login', data),
    /** 注册 */
    register: (data) => post('/auth/register', data),
    /** 当前登录用户资料 */
    me: () => get('/user/me'),
    /** 更新个人资料（昵称 / 头像 / 签名 / 常住城市 / 预算 / 兴趣标签） */
    updateMe: (data) => put('/user/me', data),
    /** 个人中心统计：行程数、收藏数、动态数、点赞数 */
    stats: () => get('/user/stats')
}

/* ======================= 2. 旅友空间（社区） =======================
 * 表：t_post(id, author_id, author_name, author_avatar, title, content, city, cat, tags_json,
 *            images_json, permission, status, reject_reason, likes, comments, views, created_at)
 *     permission: public | private
 *     status:    pending | approved | rejected
 * 发布规则：普通用户 POST 后落库为 pending，管理员审核通过后才对外可见
 * 表：t_post_like(id, post_id, user_id, created_at) / t_post_favorite(id, post_id, user_id, created_at)
 * 表：t_comment(id, post_id, user_id, content, created_at)
 */
export const postApi = {
    /** 帖子列表：普通用户后端只返回 status=approved 且 permission=public */
    list: (params) => get('/posts', params),
    detail: (id) => get(`/posts/${id}`),
    create: (data) => post('/posts', data),
    update: (id, data) => put(`/posts/${id}`, data),
    remove: (id) => del(`/posts/${id}`),
    /** 管理员审核通过 → 全站可见 */
    approve: (id) => put(`/posts/${id}/approve`),
    /** 管理员驳回并记录理由 */
    reject: (id, reason) => put(`/posts/${id}/reject`, { reason }),
    like: (id) => post(`/posts/${id}/like`),
    fav: (id) => post(`/posts/${id}/fav`),
    comments: (id) => get(`/posts/${id}/comments`),
    addComment: (id, content) => post(`/posts/${id}/comments`, { content })
}

/* ======================= 3. 行程规划 =======================
 * 表：t_trip(id, user_id, name, origin, destination, days, people, cost, status, bg, created_at)
 * 表：t_trip_day(id, trip_id, day_no, title) / t_trip_point(id, day_id, seq, name, type, lng, lat)
 * AI 生成：路由到后端再调用大模型，前端不再直连模型服务
 */
export const tripApi = {
    list: (params) => get('/trips', params),
    create: (data) => post('/trips', data),
    update: (id, data) => put(`/trips/${id}`, data),
    remove: (id) => del(`/trips/${id}`),
    /** AI 生成多套候选路线 → { routes: [{ dayPlans: [...] }] } */
    generateRoutes: (data) => generateRoutes(data),
    /** 路线沿途场所推荐 */
    recommendPoi: (data) => recommendPoi(data)
}

/* ======================= 4. 行李清单 =======================
 * 表：t_packing_item(id, user_id, trip_id, name, category, checked, custom, created_at)
 */
export const packingApi = {
    list: (params) => get('/packing', params),
    save: (data) => post('/packing', data),
    addItem: (data) => post('/packing/item', data),
    toggleItem: (id, checked) => put(`/packing/item/${id}`, { checked }),
    removeItem: (id) => del(`/packing/item/${id}`),
    generateList: (data) => generatePackingList(data),
    checkMissing: (data) => checkPackingMissing(data)
}

/* ======================= 5. 预算支出 =======================
 * 表：t_budget(id, user_id, trip_id, total, currency, created_at)
 * 表：t_bill(id, user_id, trip_id, category, amount, remark, bill_date, created_at)
 */
export const expenseApi = {
    getBudget: (params) => get('/budget', params),
    saveBudget: (data) => post('/budget', data),
    listBills: (params) => get('/bills', params),
    addBill: (data) => post('/bills', data),
    updateBill: (id, data) => put(`/bills/${id}`, data),
    removeBill: (id) => del(`/bills/${id}`),
    /** 分类统计 → [{ category, amount, percent }] */
    categoryStats: (params) => get('/bills/stats', params),
    savingAdvice: (data) => getSavingAdvice(data),
    reviewReport: (data) => getReviewReport(data)
}

/* ======================= 6. 个人收藏 =======================
 * 表：t_favorite(id, user_id, type, city, days, title, payload_json, created_at)
 *     type: trip | spot | food | hotel | post
 */
export const favoriteApi = {
    add: (data) => addFavorite(data),
    remove: (city, days) => removeFavorite(city, days),
    check: (city, days) => checkFavorite(city, days),
    list: (params) => getFavoriteList(params),
    count: () => getFavoriteCount()
}

/* ======================= 7. 榜单排行 =======================
 * 表：t_rank_item(id, city, list_type, name, score, reason, img_url, tags_json, updated_at)
 *     list_type: red | black
 */
export const rankApi = {
    list: (params) => get('/ranks', params),
    detail: (id) => get(`/ranks/${id}`)
}

/* ======================= 8. AI 能力 =======================
 * 对话使用 SSE 流式接口（见 utils/request.js 的 fetchStream），其余为普通 JSON 接口
 */
export const aiApi = {
    /** 流式问答：SSE，事件 data: { type: 'chunk'|'done'|'error', content } */
    chatStreamUrl: '/ai/chat',
    /** 非流式问答（兜底） */
    chat: (data) => post('/ai/chat', data)
}

/* ======================= 9. 天气 =======================
 * 后端可代理第三方天气服务并缓存，前端不直接暴露第三方 Key
 */
export const weatherApi = {
    get: (city) => getWeather(city),
    hot: () => getHotWeather(),
    list: (cities) => getWeatherList(cities)
}

/* ======================= 10. 成就与挑战 =======================
 * 表：user_badges(user_id, badge_key, unlocked_at)  唯一 user_id + badge_key
 * 表：user_challenges(user_id, challenge_key, status, progress, win_count, joined_at, completed_at)
 *     唯一 user_id + challenge_key
 * 徽章与挑战的解锁判定由前端按真实数据计算，再通过本组接口幂等写入服务端
 */
export { achievementApi }

export default {
    authApi,
    postApi,
    tripApi,
    packingApi,
    expenseApi,
    favoriteApi,
    rankApi,
    aiApi,
    weatherApi,
    achievementApi
}
