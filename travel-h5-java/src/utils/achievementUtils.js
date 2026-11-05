/**
 * 成就 / 挑战赛数据计算
 * 复用 gamificationStore 里的徽章定义与挑战模板；
 * 指标全部由现有真实数据（行程、预算账本、社区作品、挑战记录）推导，
 * 后端缺字段的两项指标保持 0，不做假数据。
 */
import { computed } from 'vue'
import { useGamificationStore } from '../store/gamificationStore'
import { useTripStore } from '../store/tripStore'
import { useExpenseStore } from '../store/expenseStore'
import { useCommunityStore } from '../store/communityStore'
import { useAuthStore } from '../store/authStore'
import { achievementApi } from './achievementApi'
import { ownsLocalData } from './localDataOwner'

const sumByCategory = (bills, cat) =>
    bills.filter(b => b && b.category === cat)
        .reduce((sum, b) => sum + (Number(b.actual != null ? b.actual : b.amount) || 0), 0)

export function useAchievementData() {
    const gam = useGamificationStore()
    const trip = useTripStore()
    const exp = useExpenseStore()
    const comm = useCommunityStore()

    const budget = computed(() => Number(exp.state.budget) || 0)
    const spent = computed(() => Number(exp.actualTotal.value) || 0)
    const billCount = computed(() => (exp.state.bills || []).length)
    // 展示用的行程数包含演示种子；成就统计排除种子，避免新账号凭空解锁
    const tripCount = computed(() => (trip.state.myTrips || []).length)
    const realTrips = computed(() =>
        (trip.state.myTrips || []).filter(t => !String(t.id || '').startsWith('t-seed-')))
    const realTripCount = computed(() => realTrips.value.length)
    const postCount = computed(() => (comm.myPosts.value || []).length)
    const categoryCount = computed(() => new Set((exp.state.bills || []).map(b => b.category)).size)
    const bigSpendTrips = computed(() =>
        realTrips.value.filter(t => Number(t.cost || t.budget || 0) > 10000).length)

    // 只有账本里有真实花费时才判定超支 / 节省，避免「0 花费 = 省 100%」的假解锁
    const hasSpend = computed(() => billCount.value > 0 && budget.value > 0 && spent.value > 0)

    const stats = computed(() => ({
        totalTrips: realTripCount.value,
        zeroOverrunTrips: hasSpend.value && spent.value <= budget.value ? 1 : 0,
        saved30Trips: hasSpend.value && spent.value <= budget.value * 0.7 ? 1 : 0,
        saved50Trips: hasSpend.value && spent.value <= budget.value * 0.5 ? 1 : 0,
        bigSpendTrips: bigSpendTrips.value,
        allCategoryTrips: categoryCount.value >= 5 ? 1 : 0,
        challengeWins: Number(gam.state.challengeWins) || 0,
        storyCount: postCount.value,
        // 后端行程表没有「完成时间 / 出发时间」字段，以下两项无法统计
        earlyPlannerTrips: 0,
        monthlyDoubleTrips: 0
    }))

    const badges = computed(() => gam.allBadges.value.map(b => ({
        id: b.id,
        name: b.name,
        icon: b.icon,
        desc: b.desc,
        color: b.color,
        unlocked: !!b.condition(stats.value)
    })))

    const unlockedCount = computed(() => badges.value.filter(b => b.unlocked).length)
    const totalBadges = computed(() => badges.value.length)
    const progressPct = computed(() =>
        totalBadges.value ? Math.round(unlockedCount.value / totalBadges.value * 100) : 0)

    const foodSpent = computed(() => sumByCategory(exp.state.bills || [], '餐饮'))
    const transportSpent = computed(() => sumByCategory(exp.state.bills || [], '交通'))
    const budgetRatio = computed(() =>
        budget.value ? Math.round(spent.value / budget.value * 100) : 0)

    const challenges = computed(() => gam.challengeTemplates.value.map(t => {
        let current = 0
        let target = Number(t.target) || 0
        let unit = '元'
        let ready = hasSpend.value

        if (t.id === 'c1' || t.id === 'c5') {
            current = spent.value
        } else if (t.id === 'c2') {
            current = budget.value ? Math.round(foodSpent.value / budget.value * 100) : 0
            target = 25
            unit = '%'
            ready = hasSpend.value && foodSpent.value > 0
        } else if (t.id === 'c3') {
            // 零超支：当前花费 vs 本次预算
            current = spent.value
            target = budget.value
            unit = '元'
        } else if (t.id === 'c4') {
            // 省钱达人：节省比例（目标 ≥30%）
            current = budget.value ? Math.max(0, 100 - budgetRatio.value) : 0
            target = 30
            unit = '%'
        } else if (t.id === 'c6') {
            current = budget.value ? Math.round(transportSpent.value / budget.value * 100) : 0
            target = 15
            unit = '%'
            ready = hasSpend.value && transportSpent.value > 0
        }

        const pct = target > 0 ? Math.min(100, Math.round(current / target * 100)) : 0
        const met = ready && current <= target
        return {
            ...t,
            current,
            target,
            unit,
            pct,
            met,
            status: !ready ? '待记录' : (met ? '已达成' : '进行中')
        }
    }))

    return {
        budget, spent, billCount, tripCount, postCount, categoryCount,
        budgetRatio, foodSpent, transportSpent,
        challengeWins: computed(() => Number(gam.state.challengeWins) || 0),
        stats, badges, unlockedCount, totalBadges, progressPct, challenges
    }
}

/**
 * 读取服务端成就数据，并把前端按真实数据算出的解锁状态幂等写入服务端。
 * 接口不可用时返回 ok=false，调用方回退到本地计算结果。
 */
export async function syncAchievementsToServer() {
    const { badges, challenges } = useAchievementData()
    const empty = {
        ok: false, unlockedCount: 0, badges: new Set(), challenges: new Map(), wins: 0
    }
    try {
        const server = await achievementApi.mine()
        const auth = useAuthStore()
        const username = auth.state.username || ''
        // 本地数据不属于当前账号时只读服务端，避免把别人的数据写进自己的成就
        const canWrite = ownsLocalData(username)

        const serverBadges = new Set((server?.badges || []).map(b => b.badgeKey))
        const localUnlocked = badges.value.filter(b => b.unlocked).map(b => b.id)
        const missing = canWrite ? localUnlocked.filter(k => !serverBadges.has(k)) : []
        if (missing.length) await achievementApi.unlockBadges(missing)

        const serverChallenges = new Map((server?.challenges || []).map(c => [c.challengeKey, c]))
        if (canWrite) {
            for (const c of challenges.value) {
                // 没有真实账本数据时不写入，避免把「待记录」变成假的 0 进度
                if (c.status === '待记录') continue
                const exists = serverChallenges.get(c.id)
                if (c.met) {
                    if (!exists || exists.status !== 'completed') {
                        await achievementApi.completeChallenge(c.id, true)
                    }
                } else if (!exists || exists.status !== 'completed') {
                    await achievementApi.saveChallengeProgress(c.id, { progress: c.current })
                }
            }
        }

        const final = await achievementApi.mine()
        const unlockedKeys = new Set((final?.badges || []).map(b => b.badgeKey))
        return {
            ok: true,
            unlockedCount: unlockedKeys.size,
            badges: unlockedKeys,
            challenges: new Map((final?.challenges || []).map(c => [c.challengeKey, c])),
            wins: Number(final?.wins) || 0
        }
    } catch (e) {
        return empty
    }
}
