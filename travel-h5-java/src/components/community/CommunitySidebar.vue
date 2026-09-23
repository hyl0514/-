<template>
  <!-- 右侧固定侧边栏 -->
  <aside class="cs-wrap">
    <!-- 模块 1：社区数据 -->
    <div class="cs-card">
      <div class="cs-title">📊 社区数据</div>
      <div class="cs-stat">
        <span class="cs-label">今日新发</span>
        <span class="cs-val blue">{{ store.stats.today }}</span>
      </div>
      <div class="cs-stat">
        <span class="cs-label">本周热门</span>
        <span class="cs-val orange">{{ store.stats.weekHot }}</span>
      </div>
      <div class="cs-stat">
        <span class="cs-label">总动态数</span>
        <span class="cs-val">{{ store.stats.total }}</span>
      </div>
    </div>

    <!-- 模块 2：TOP 3 热门 -->
    <div class="cs-card">
      <div class="cs-title">🏆 本周热门 TOP 3</div>
      <div class="top-list" v-if="store.topHot.length">
        <div v-for="(p, i) in store.topHot" :key="p?.id || ('hot-' + i)" class="top-item" @click="goTop(p)">
          <div class="top-rank" :class="'r' + (i + 1)">{{ i + 1 }}</div>
          <div class="top-info">
            <div class="top-name">{{ p?.title?.slice(0, 18) || '未知标题' }}</div>
            <div class="top-meta">👍 {{ p?.likes ?? 0 }} · 💬 {{ p?.comments ?? 0 }}</div>
          </div>
        </div>
      </div>
      <div class="top-empty" v-else>暂无热门动态</div>
    </div>

    <!-- 模块 3：热门城市 -->
    <div class="cs-card">
      <div class="cs-title">🌆 热门城市速访</div>
      <div class="city-cloud">
        <span
          v-for="c in store.HOT_CITIES"
          :key="c"
          class="city-tag"
          :class="{ active: store.state.city === c }"
          @click="store.state.city = store.state.city === c ? '' : c"
        >{{ c }}</span>
      </div>
    </div>

    <!-- 模块 4：活跃旅友 -->
    <div class="cs-card">
      <div class="cs-title">✨ 活跃旅友</div>
      <div class="active-list">
        <div v-for="(u, i) in activeUsers" :key="i" class="active-item">
          <div class="au-avatar" :style="{ background: u.bg }">{{ u.avatar }}</div>
          <div class="au-info">
            <div class="au-name">{{ u.name }}</div>
            <div class="au-desc">{{ u.desc }}</div>
          </div>
          <button class="au-follow">+ 关注</button>
        </div>
      </div>
    </div>

    <!-- 管理员入口（根据 authStore 角色显示） -->
    <div class="cs-card admin-switch" v-if="store.isAdmin">
      <div class="cs-title">⚡ 管理员快捷入口</div>
      <button class="pc-btn pc-btn-sm pc-btn-primary full" @click="goAdmin">进入审核后台 →</button>
      <button class="pc-btn pc-btn-sm full" @click="onLogout">退出登录</button>
    </div>
    <div class="cs-card admin-switch" v-else>
      <div class="cs-title">🔒 权限提示</div>
      <div class="as-tip">发布动态需管理员审核<br>管理员账号：admin / admin123</div>
      <button class="pc-btn pc-btn-sm full" @click="goLogin">前往登录 →</button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCommunityStore } from '../../store/communityStore'
import { useAuthStore } from '../../store/authStore'

const store = useCommunityStore()
const auth = useAuthStore()
const router = useRouter()

const goTop = (p) => { /* 后续做跳转 */ }
const goAdmin = () => router.push('/admin')
const goLogin = () => router.push('/login')
const onLogout = () => { auth.logout(); router.push('/login') }

const activeUsers = [
    { name: '背包十年', avatar: '🧭', desc: '资深玩家 · 128 篇攻略', bg: '#2374DD' },
    { name: '晚风', avatar: '🌙', desc: '旅行达人 · 探店狂魔', bg: '#0EA5A4' },
    { name: '风筝不断线', avatar: '🪁', desc: '历史人文 · 足迹 23 城', bg: '#E8912F' }
]
</script>

<style scoped>
.cs-wrap {
    width: 280px;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: calc(100vh - 30px);
    overflow-y: auto;
}

.cs-wrap::-webkit-scrollbar { width: 4px; }
.cs-wrap::-webkit-scrollbar-thumb { background: #dde3ec; border-radius: 2px; }

.cs-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid var(--border);
    padding: 14px 16px;
}

.cs-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-1);
    margin-bottom: 10px;
}

.cs-stat {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    font-size: 13px;
}

.cs-label { color: var(--text-3); }

.cs-val { font-weight: 700; color: var(--text-1); }
.cs-val.blue { color: var(--brand); }
.cs-val.orange { color: var(--warning); }

/* TOP 3 */
.top-list { display: flex; flex-direction: column; gap: 8px; }

.top-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
}

.top-item:hover { background: #f7f9fc; transform: translateX(2px); }

.top-rank {
    width: 22px; height: 22px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #fff;
    flex-shrink: 0;
}
.top-rank.r1 { background: linear-gradient(135deg, #f7c948, #f0b429); }
.top-rank.r2 { background: linear-gradient(135deg, #c2c8d0, #9aa3ad); }
.top-rank.r3 { background: linear-gradient(135deg, #d8a67a, #c08a5a); }

.top-name {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 160px;
}

.top-meta {
    font-size: 10.5px;
    color: var(--text-3);
    margin-top: 2px;
}

.top-empty {
    text-align: center;
    padding: 20px;
    color: var(--text-3);
    font-size: 12.5px;
}

/* 城市云 */
.city-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.city-tag {
    padding: 3px 10px;
    font-size: 12px;
    border-radius: 12px;
    background: #f2f4f7;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.12s;
}

.city-tag:hover { background: #e6ebf3; }
.city-tag.active { background: var(--brand); color: #fff; }

/* 活跃旅友 */
.active-list { display: flex; flex-direction: column; gap: 10px; }

.active-item {
    display: flex;
    align-items: center;
    gap: 10px;
}

.au-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0;
}

.au-info { flex: 1; min-width: 0; }

.au-name { font-size: 12.5px; font-weight: 600; color: var(--text-1); }
.au-desc { font-size: 11px; color: var(--text-3); margin-top: 1px; }

.au-follow {
    padding: 3px 10px;
    font-size: 11px;
    border-radius: 10px;
    border: 1px solid var(--brand);
    background: transparent;
    color: var(--brand);
    cursor: pointer;
    transition: all 0.12s;
}
.au-follow:hover { background: var(--brand); color: #fff; }

.admin-switch .full { width: 100%; margin-bottom: 8px; font-size: 12px; }
.admin-switch .full:last-child { margin-bottom: 0; }

.as-tip {
    font-size: 11.5px;
    color: var(--text-3);
    line-height: 1.6;
    margin-bottom: 10px;
    padding: 8px 10px;
    background: #f7f9fc;
    border-radius: 8px;
}
</style>
