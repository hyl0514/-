/**
 * 本浏览器本地数据归属
 * trip / expense / community / favorite / gamification 等 store 目前共用同一份 localStorage，
 * 无法区分账号。这里记录「这份历史本地数据属于哪个账号」：
 * - 第一个登录的账号接管现有本地数据；
 * - 之后的账号不再把本地计算结果写入服务端，避免把别人的数据算到自己头上。
 */
const OWNER_KEY = 'pc-local-data-owner'

export function claimLocalDataOwner(username) {
    if (!username) return
    try {
        if (!localStorage.getItem(OWNER_KEY)) localStorage.setItem(OWNER_KEY, username)
    } catch (e) {}
}

export function ownsLocalData(username) {
    if (!username) return false
    try {
        return localStorage.getItem(OWNER_KEY) === username
    } catch (e) {
        return false
    }
}
