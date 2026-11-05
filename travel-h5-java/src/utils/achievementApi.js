/**
 * 成就 / 挑战服务端接口
 * 路径统一走 utils/request.js 的 baseURL（默认 /api，由 Vite 代理到后端）
 */
import { get, post, put } from './request'

export const achievementApi = {
    /** 我的徽章与挑战进度 → { badges, challenges, wins } */
    mine: () => get('/achievements/me'),
    /** 批量写入已解锁徽章（幂等） → { badges, challenges, wins } */
    unlockBadges: (keys) => post('/achievements/badges', { keys }),
    /** 加入挑战（幂等） */
    joinChallenge: (key) => post(`/achievements/challenges/${key}/join`),
    /** 写入 / 更新挑战进度（幂等 upsert） */
    saveChallengeProgress: (key, data) => put(`/achievements/challenges/${key}/progress`, data),
    /** 完成挑战并累加胜场（仅首次完成累加） */
    completeChallenge: (key, won = true) => post(`/achievements/challenges/${key}/complete`, { won })
}
