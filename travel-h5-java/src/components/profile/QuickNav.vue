<template>
  <!-- 快捷六宫格 -->
  <section class="qn-wrap">
    <div
      v-for="item in items"
      :key="item.path"
      class="qn-item"
      :class="{ disabled: !item.path }"
      @click="go(item)"
    >
      <div class="qn-icon" :style="{ background: item.bg }">
        <span v-html="item.icon"></span>
      </div>
      <div class="qn-label">{{ item.label }}</div>
      <span class="qn-hot" v-if="item.hot">NEW</span>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const items = [
    {
        label: '行程规划',
        path: '/planner',
        bg: 'linear-gradient(135deg, #2374DD, #4a90e8)',
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 20l-5.5 2.5V4L9 1.5 15 4l5.5-2.5v18.5L15 22.5 9 20z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M9 1.5V20M15 4v18.5" stroke="#fff" stroke-width="2"/></svg>`,
        hot: false
    },
    {
        label: '行李清单',
        path: '/packing',
        bg: 'linear-gradient(135deg, #0EA5A4, #38bdbb)',
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="10" height="18" rx="2" stroke="#fff" stroke-width="2"/><path d="M10 3V1.5h4V3M9.5 11h5M9.5 15h5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,
        hot: false
    },
    {
        label: '榜单排行',
        path: '/ranking',
        bg: 'linear-gradient(135deg, #E8912F, #f2b15c)',
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 4h10v5a5 5 0 0 1-10 0V4z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M7 6H4.5a2.5 2.5 0 0 0 2.9 2.5M17 6h2.5a2.5 2.5 0 0 1-2.9 2.5M12 14v4M8.5 20.5h7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,
        hot: true
    },
    {
        label: '预算支出',
        path: '/budget',
        bg: 'linear-gradient(135deg, #e94560, #ff6b81)',
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="14" rx="2.5" stroke="#fff" stroke-width="2"/><path d="M3 10.5h18M15.5 15.5H18" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,
        hot: false
    },
    {
        label: '个人收藏',
        path: '/favorites',
        bg: 'linear-gradient(135deg, #667eea, #764ba2)',
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M9 7h6M9 10h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,
        hot: false
    },
    {
        label: '旅友空间',
        path: '',
        bg: 'linear-gradient(135deg, #8b9dc3, #b8c6db)',
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.5" stroke="#fff" stroke-width="2"/><circle cx="17" cy="10" r="2.5" stroke="#fff" stroke-width="2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 17c.5-2 2.2-3.5 4-3.5M17.5 20h-5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,
        hot: false
    }
]

const go = (item) => {
    if (item.path) router.push(item.path)
}
</script>

<style scoped>
.qn-wrap {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 18px 14px 14px;
}

.qn-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;
    padding: 8px 4px 10px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.18s ease;
}

.qn-item:hover {
    background: #f5f7fb;
    transform: translateY(-2px);
}

.qn-item.disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.qn-item.disabled:hover {
    transform: none;
    background: transparent;
}

.qn-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 4px 12px rgba(35, 116, 221, 0.2);
    transition: all 0.18s;
}

.qn-item:hover .qn-icon {
    transform: scale(1.08);
    box-shadow: 0 6px 18px rgba(35, 116, 221, 0.28);
}

.qn-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-1);
}

.qn-hot {
    position: absolute;
    top: 4px;
    right: 10px;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 8px;
    background: linear-gradient(135deg, #e94560, #ff6b81);
    color: #fff;
    box-shadow: 0 2px 6px rgba(233, 69, 96, 0.35);
}
</style>
