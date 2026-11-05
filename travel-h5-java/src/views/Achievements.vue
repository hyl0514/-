<template>
  <div class="ach-page">
    <!-- 顶部导航 -->
    <header class="ach-header">
      <div class="ach-header-left">
        <div class="ach-header-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 4h10v5a5 5 0 0 1-10 0V4z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M7 6H4.5a2.5 2.5 0 0 0 2.9 2.5M17 6h2.5a2.5 2.5 0 0 1-2.9 2.5M12 14v4M8.5 20.5h7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <div>
          <div class="ach-header-title">旅行成就与挑战赛</div>
          <div class="ach-header-sub">依据行程、预算账本与社区作品实时计算</div>
        </div>
      </div>
      <button class="ach-back" @click="$router.push('/profile-home')">← 返回个人主页</button>
    </header>

    <!-- 数据来源 -->
    <div class="ach-source" :class="{ local: !serverReady }">
      <span v-if="serverReady">数据已保存到账号，换设备或清除缓存后仍然保留</span>
      <span v-else>当前为本地数据：服务端暂不可用，刷新后可能丢失</span>
    </div>

    <!-- 总览 -->
    <section class="ach-summary">
      <div class="as-left">
        <div class="as-num">{{ displayUnlockedCount }}<small> / {{ totalBadges }}</small></div>
        <div class="as-label">已解锁徽章</div>
        <div class="as-bar"><div class="as-fill" :style="{ width: displayProgressPct + '%' }"></div></div>
        <div class="as-pct">完成 {{ displayProgressPct }}%</div>
      </div>
      <div class="as-metrics">
        <div class="as-m"><b>{{ tripCount }}</b><span>条行程</span></div>
        <div class="as-m"><b>{{ postCount }}</b><span>篇作品</span></div>
        <div class="as-m"><b>{{ budgetRatio }}%</b><span>预算使用率</span></div>
        <div class="as-m"><b>{{ displayWins }}</b><span>挑战胜场</span></div>
      </div>
    </section>

    <!-- 成就徽章 -->
    <section class="ach-card">
      <div class="ac-head">
        <span class="ac-title">🏅 成就徽章</span>
        <span class="ac-note">已解锁 {{ displayUnlockedCount }} / {{ totalBadges }}</span>
      </div>
      <div class="badge-grid">
        <div class="badge-item" v-for="b in displayBadges" :key="b.id" :class="{ locked: !b.unlocked }">
          <div class="badge-icon"
            :style="{ background: b.unlocked ? b.color : '#eef1f6', color: b.unlocked ? '#fff' : '#98a2b1' }">
            {{ b.icon || '🎖️' }}
          </div>
          <div class="badge-body">
            <div class="badge-name">{{ b.name }}</div>
            <div class="badge-desc">{{ b.desc }}</div>
          </div>
          <span class="badge-state" :class="{ on: b.unlocked }">{{ b.unlocked ? '已解锁' : '未解锁' }}</span>
        </div>
      </div>
    </section>

    <!-- 预算挑战赛 -->
    <section class="ach-card">
      <div class="ac-head">
        <span class="ac-title">🎯 预算挑战赛</span>
        <button class="ac-btn" @click="$router.push('/budget')">去预算页调整 →</button>
      </div>
      <div class="challenge-grid">
        <div class="challenge-item" v-for="c in displayChallenges" :key="c.id">
          <div class="ch-top">
            <span class="ch-icon">{{ c.icon || '🎯' }}</span>
            <span class="ch-name">{{ c.name }}</span>
            <span class="ch-status"
              :class="{ 'st-ok': c.met, 'st-wait': c.status === '待记录' }">{{ c.status }}</span>
          </div>
          <div class="ch-desc">{{ c.desc }}</div>
          <div class="ch-bar"><div class="ch-fill" :style="{ width: c.pct + '%' }"></div></div>
          <div class="ch-foot">
            <span class="ch-val">当前 {{ c.current }}{{ c.unit }} / 目标 {{ c.target }}{{ c.unit }}</span>
            <span class="ch-reward">达成 +{{ c.reward }} 分</span>
          </div>
        </div>
      </div>
      <p class="ch-tip">挑战进度与「预算支出」页共用同一份账本数据；预算录入与账单管理统一在预算页完成，这里只做进度展示。</p>
    </section>

    <!-- 数据说明 -->
    <section class="ach-note">
      <b>数据说明：</b>徽章条件由行程数、预算账本、社区作品与挑战记录实时计算，未凭空补数据；
      「早起鸟儿」「月度旅行家」需要后端提供行程出发/完成时间，当前行程表无该字段，暂保持未解锁。
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAchievementData, syncAchievementsToServer } from '../utils/achievementUtils'
import { useCommunityStore } from '../store/communityStore'

const {
    badges, unlockedCount, totalBadges, progressPct,
    tripCount, postCount, budgetRatio, challengeWins, challenges
} = useAchievementData()

const comm = useCommunityStore()

// 服务端数据优先；接口不可用时回退本地计算
const serverReady = ref(false)
const serverBadges = ref(new Set())
const serverChallenges = ref(new Map())
const serverWins = ref(0)

const displayBadges = computed(() => badges.value.map(b => ({
    ...b,
    unlocked: serverReady.value ? serverBadges.value.has(b.id) : b.unlocked
})))
const displayUnlockedCount = computed(() => displayBadges.value.filter(b => b.unlocked).length)
const displayChallenges = computed(() => challenges.value.map(c => {
    const s = serverReady.value ? serverChallenges.value.get(c.id) : null
    const completed = !!(s && s.status === 'completed')
    return { ...c, met: completed || c.met, status: completed ? '已达成' : c.status }
}))
const displayWins = computed(() => serverReady.value ? serverWins.value : challengeWins.value)
const displayProgressPct = computed(() =>
    totalBadges.value ? Math.round(displayUnlockedCount.value / totalBadges.value * 100) : 0)

const sync = async () => {
    try { await comm.refreshFromBackend() } catch (e) {}
    const r = await syncAchievementsToServer()
    serverReady.value = r.ok
    serverBadges.value = r.badges
    serverChallenges.value = r.challenges
    serverWins.value = r.wins
}

onMounted(sync)
</script>

<style scoped>
.ach-page {
    height: 100%;
    overflow-y: auto;
    padding: 22px 26px 40px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

/* 顶部 */
.ach-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 18px;
    padding: 18px 24px;
    background: linear-gradient(135deg, rgba(232, 145, 47, 0.1), rgba(35, 116, 221, 0.1));
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.7);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}
.ach-header-left { display: flex; align-items: center; gap: 14px; }
.ach-header-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: linear-gradient(135deg, #E8912F, #e94560);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 20px rgba(232, 145, 47, 0.35);
    flex-shrink: 0;
}
.ach-header-title {
    font-size: 22px; font-weight: 700;
    background: linear-gradient(135deg, #E8912F, #2374DD);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
}
.ach-header-sub { font-size: 13px; color: var(--text-2); margin-top: 3px; }
.ach-back {
    padding: 8px 14px; border-radius: 9px; border: 1px solid #e2e7ef;
    background: #fff; color: #566a8a; font-size: 13px; cursor: pointer;
    transition: all 0.18s;
}
.ach-back:hover { border-color: #2374DD; color: #2374DD; background: #f0f5ff; }

/* 总览 */
.ach-summary {
    display: flex; align-items: center; justify-content: space-between;
    gap: 24px; flex-wrap: wrap;
    background: #fff; border: 1px solid var(--border); border-radius: 16px;
    padding: 22px 26px; margin-bottom: 18px;
    box-shadow: var(--shadow);
}
.as-left { min-width: 220px; flex: 1 1 240px; }
.as-num { font-size: 34px; font-weight: 800; color: #1a2a4a; line-height: 1; }
.as-num small { font-size: 16px; font-weight: 600; color: #98a2b1; }
.as-label { font-size: 12.5px; color: var(--text-3); margin-top: 6px; }
.as-bar { height: 8px; border-radius: 4px; background: #eef1f6; overflow: hidden; margin-top: 12px; }
.as-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #E8912F, #e94560); transition: width 0.6s ease; }
.as-pct { font-size: 12px; color: #E8912F; font-weight: 600; margin-top: 6px; }

/* 数据来源提示 */
.ach-source {
    margin: -6px 0 14px;
    padding: 9px 14px;
    border-radius: 10px;
    font-size: 12.5px;
    line-height: 1.5;
    background: #ecfdf3;
    border: 1px solid #c7f0d8;
    color: #2fa96b;
}
.ach-source.local { background: #fff8ec; border-color: #f6e4c8; color: #8a6d3b; }

.as-metrics { display: grid; grid-template-columns: repeat(4, minmax(78px, 1fr)); gap: 10px; flex: 1 1 320px; }
.as-m {
    text-align: center; padding: 12px 6px; border-radius: 12px;
    background: #f5f8fd; border: 1px solid #eef1f6;
}
.as-m b { display: block; font-size: 20px; color: #2374DD; line-height: 1.1; }
.as-m span { font-size: 11.5px; color: var(--text-3); }

/* 卡片 */
.ach-card {
    background: #fff; border: 1px solid var(--border); border-radius: 16px;
    padding: 20px 24px 22px; margin-bottom: 18px; box-shadow: var(--shadow);
}
.ac-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.ac-title { font-size: 16px; font-weight: 700; color: var(--text-1); }
.ac-note { font-size: 12.5px; color: var(--text-3); }
.ac-btn {
    padding: 7px 14px; border-radius: 9px; border: none; cursor: pointer;
    background: linear-gradient(135deg, #2374DD, #4a90e8); color: #fff;
    font-size: 12.5px; font-weight: 500; box-shadow: 0 4px 12px rgba(35, 116, 221, 0.3);
    transition: all 0.18s;
}
.ac-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(35, 116, 221, 0.4); }

/* 徽章 */
.badge-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
.badge-item {
    display: flex; align-items: center; gap: 12px;
    padding: 14px; border-radius: 13px; border: 1px solid #eef1f6;
    background: #fbfcfe; transition: all 0.2s;
}
.badge-item:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(35, 116, 221, 0.1); }
.badge-item.locked { background: #f7f8fa; }
.badge-icon {
    width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 22px;
}
.badge-body { flex: 1; min-width: 0; }
.badge-name { font-size: 13.5px; font-weight: 700; color: var(--text-1); }
.badge-desc { font-size: 11.5px; color: var(--text-3); margin-top: 3px; line-height: 1.4; }
.badge-state {
    font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 8px;
    background: #f0f2f5; color: #98a2b1; white-space: nowrap; flex-shrink: 0;
}
.badge-state.on { background: #e9f7f0; color: #2fa96b; }

/* 挑战 */
.challenge-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.challenge-item {
    padding: 15px 16px; border-radius: 13px; border: 1px solid #eef1f6;
    background: #fbfcfe;
}
.ch-top { display: flex; align-items: center; gap: 8px; }
.ch-icon { font-size: 17px; }
.ch-name { font-size: 13.5px; font-weight: 700; color: var(--text-1); flex: 1; }
.ch-status { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 8px; background: #eef4ff; color: #2374DD; }
.ch-status.st-ok { background: #e9f7f0; color: #2fa96b; }
.ch-status.st-wait { background: #f0f2f5; color: #98a2b1; }
.ch-desc { font-size: 12px; color: var(--text-2); margin-top: 8px; line-height: 1.5; }
.ch-bar { height: 7px; border-radius: 4px; background: #eef1f6; overflow: hidden; margin-top: 10px; }
.ch-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #E8912F, #e94560); transition: width 0.6s ease; }
.ch-foot { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.ch-val { font-size: 11.5px; color: var(--text-2); font-weight: 600; }
.ch-reward { font-size: 11px; color: #E8912F; font-weight: 600; }
.ch-tip { font-size: 12px; color: var(--text-3); line-height: 1.6; margin-top: 14px; }

/* 说明 */
.ach-note {
    background: #fffaf0; border: 1px solid #f6e4c8; border-radius: 12px;
    padding: 14px 18px; font-size: 12.5px; color: #8a6d3b; line-height: 1.7;
}

@media (max-width: 900px) {
    .ach-page { padding: 14px 12px 28px; }
    .ach-header { padding: 14px 16px; }
    .ach-header-title { font-size: 18px; }
    .ach-summary { padding: 16px; }
    .ach-card { padding: 16px; }
    .badge-grid, .challenge-grid { grid-template-columns: 1fr; }
    .as-metrics { grid-template-columns: repeat(2, 1fr); }
    .ach-back { width: 100%; }
}
</style>
