<template>
  <aside class="side-nav">
    <!-- 品牌区 -->
    <div class="brand">
      <div class="brand-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" fill="#fff" />
          <circle cx="12" cy="10" r="2.6" fill="#2374DD" />
        </svg>
      </div>
      <div class="brand-text">
        <div class="brand-name">智能旅游规划系统</div>
        <div class="brand-sub">Travel Planner & Budget</div>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="nav-menu">
      <div
        v-for="item in menus"
        :key="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click="go(item.path)"
      >
        <span class="nav-indicator"></span>
        <span class="nav-icon" v-html="item.icon"></span>
        <span class="nav-label">{{ item.label }}</span>
      </div>
    </nav>

    <!-- 底部用户信息 -->
    <div class="nav-footer" @click="toggleUserMenu">
      <div class="user-avatar" :style="{ background: userBg }">{{ auth.state.avatar || '旅' }}</div>
      <div class="user-info">
        <div class="user-name">
          {{ auth.state.name || '未登录' }}
          <span class="user-role" :class="'ur-' + auth.state.role">{{ auth.state.role === 'admin' ? '管理员' : '普通用户' }}</span>
        </div>
        <div class="user-desc">v1.0 毕设演示版</div>
      </div>
      <div class="user-logout" title="退出登录" @click.stop="onLogout">🚪</div>
    </div>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const userBg = auth.state.role === 'admin' ? 'linear-gradient(135deg, #E8912F, #f2b15c)' : 'linear-gradient(135deg, #2374DD, #4a90e8)'

const onLogout = () => { auth.logout(); router.push('/login') }
const toggleUserMenu = () => { /* 后续可加下拉菜单 */ }

const menus = [
    {
        path: '/profile-home',
        label: '个人主页',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5L12 3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`
    },
    {
        path: '/planner',
        label: '行程规划',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 20l-5.5 2.5V4L9 1.5 15 4l5.5-2.5v18.5L15 22.5 9 20z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 1.5V20M15 4v18.5" stroke="currentColor" stroke-width="1.7"/></svg>`
    },
    {
        path: '/packing',
        label: '行李清单',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M10 3V1.5h4V3M9.5 11h5M9.5 15h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`
    },
    {
        path: '/ranking',
        label: '榜单排行',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 4h10v5a5 5 0 0 1-10 0V4z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M7 6H4.5a2.5 2.5 0 0 0 2.9 2.5M17 6h2.5a2.5 2.5 0 0 1-2.9 2.5M12 14v4M8.5 20.5h7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`
    },
    {
        path: '/budget',
        label: '预算支出',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="14" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M3 10.5h18M15.5 15.5H18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`
    },
    {
        path: '/favorites',
        label: '个人收藏',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 7h6M9 10h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`
    },
    {
        path: '/community',
        label: '旅友空间',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="8.5" cy="8" r="3.2" stroke="currentColor" stroke-width="1.7"/><circle cx="16" cy="9" r="2.4" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 19c0-3 2.3-5.2 5-5.2s5 2.2 5 5.2M13 16.5c.3-1.6 1.6-2.8 3-2.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`
    }
]

const isActive = (path) => route.path.startsWith(path)

const go = (path) => {
    if (!isActive(path)) router.push(path)
}
</script>

<style scoped>
.side-nav {
    width: 224px;
    height: 100vh;
    background: #fff;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
}

/* 品牌区 */
.brand {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 22px 20px 20px;
}

.brand-logo {
    width: 40px;
    height: 40px;
    border-radius: 11px;
    background: linear-gradient(135deg, #2374DD, #4a90e8);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 5px 14px rgba(35, 116, 221, 0.35);
}

.brand-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-1);
}

.brand-sub {
    font-size: 11px;
    color: var(--text-3);
    margin-top: 2px;
    letter-spacing: 0.3px;
}

/* 菜单 */
.nav-menu {
    flex: 1;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.nav-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 11px;
    height: 44px;
    padding: 0 14px;
    border-radius: 10px;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.18s ease;
}

.nav-item:hover {
    background: var(--brand-lighter);
    color: var(--brand);
}

.nav-item.active {
    background: var(--brand-light);
    color: var(--brand);
    font-weight: 600;
}

.nav-indicator {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    border-radius: 0 3px 3px 0;
    background: var(--brand);
    transition: height 0.2s ease;
}

.nav-item.active .nav-indicator {
    height: 20px;
}

.nav-icon {
    display: flex;
}

.nav-label {
    font-size: 14px;
}

/* 底部用户 */
.nav-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    margin: 10px 12px 16px;
    background: var(--brand-lighter);
    border-radius: 12px;
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #2374DD, #5a97d6);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.user-name {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-1);
}

.user-desc {
    font-size: 11.5px;
    color: var(--text-3);
    margin-top: 2px;
}

.user-role {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 7px;
    border-radius: 8px;
    margin-left: 5px;
}

.ur-admin { background: #fff4e5; color: #E8912F; }
.ur-user { background: #e8f0ff; color: var(--brand); }

.user-logout {
    opacity: 0;
    font-size: 15px;
    padding: 4px 6px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
}

.nav-footer:hover .user-logout { opacity: 0.7; }
.user-logout:hover { opacity: 1 !important; background: #fde7ea; }
</style>
