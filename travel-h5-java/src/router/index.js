import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import toast from '../utils/msg'

// PC 版应用：登录 / 个人主页 / 行程规划 / 行李清单 / 榜单排行 / 预算支出 / 个人收藏 / 旅友空间 / 管理员后台
const routes = [
    { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
    { path: '/', redirect: '/profile-home' },
    { path: '/profile-home', name: 'ProfileHome', component: () => import('../views/ProfileHome.vue') },
    { path: '/achievements', name: 'Achievements', component: () => import('../views/Achievements.vue') },
    { path: '/planner', name: 'TripPlanner', component: () => import('../views/TripPlanner.vue') },
    { path: '/packing', name: 'PackingList', component: () => import('../views/PackingList.vue') },
    { path: '/ranking', name: 'Ranking', component: () => import('../views/Ranking.vue') },
    { path: '/budget', name: 'BudgetCenter', component: () => import('../views/Budget.vue') },
    { path: '/favorites', name: 'FavoriteCenter', component: () => import('../views/FavoriteCenter.vue') },
    { path: '/community', name: 'CommunitySpace', component: () => import('../views/CommunitySpace.vue') },
    // 管理员审核后台（仅 admin 角色可访问）
    { path: '/admin', name: 'AdminReview', component: () => import('../views/AdminReview.vue'), meta: { adminOnly: true } },
    // 旧版移动端路由统一指向个人主页
    { path: '/home', redirect: '/profile-home' },
    { path: '/detail', redirect: '/profile-home' },
    { path: '/chat', name: 'Chat', component: () => import('../views/Chat.vue') },
    { path: '/profile', redirect: '/profile-home' }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 全局守卫
router.beforeEach((to) => {
    const auth = useAuthStore()
    // 未登录 → 跳转登录页
    if (!auth.state.isLoggedIn && to.path !== '/login') {
        return { path: '/login', query: { redirect: to.fullPath } }
    }
    // 已登录 + 访问 login → 跳首页
    if (auth.state.isLoggedIn && to.path === '/login') {
        return { path: '/' }
    }
    // adminOnly 路由：普通用户无权限访问
    if (to.meta.adminOnly && auth.state.role !== 'admin') {
        toast.error('该页面仅管理员可访问')
        return { path: '/community' }
    }
})

export default router
