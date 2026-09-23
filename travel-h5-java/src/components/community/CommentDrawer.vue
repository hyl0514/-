<template>
  <!-- 右侧抽屉评论弹窗 -->
  <teleport to="body">
    <div class="cd-mask" v-if="show" @click.self="emit('close')">
      <div class="cd-drawer" :class="{ slidein: show }">
        <!-- 帖子简略信息 -->
        <div class="cd-head">
          <div class="cd-close" @click="emit('close')">✕</div>
          <div class="cd-post-info" v-if="post">
            <div class="cd-post-title">{{ post.title }}</div>
            <div class="cd-post-meta">
              <span>👍 {{ post.likes }}</span>
              <span>💬 {{ post.comments }} 条评论</span>
            </div>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="cd-body">
          <div class="cd-comment" v-for="(c, i) in comments" :key="i">
            <div class="cc-avatar" :style="{ background: c.bg }">{{ c.avatar }}</div>
            <div class="cc-main">
              <div class="cc-head">
                <span class="cc-name">{{ c.name }}</span>
                <span class="cc-meta">{{ c.date }} · {{ c.ip }}</span>
              </div>
              <div class="cc-content">{{ c.content }}</div>
              <div class="cc-foot">
                <span class="cc-act" @click="c.likes++">👍 {{ c.likes }}</span>
                <span class="cc-act">💬 回复</span>
              </div>
              <!-- 二级回复 -->
              <div class="cc-replies" v-if="c.replies?.length">
                <div class="cc-reply" v-for="(r, j) in c.replies" :key="j">
                  <b>{{ r.name }}</b>：{{ r.content }}
                </div>
              </div>
            </div>
          </div>
          <div class="cd-empty" v-if="!comments.length">
            <div class="ce-emoji">💭</div>
            <p>暂无评论，抢沙发吧</p>
          </div>
        </div>

        <!-- 底部输入框 -->
        <div class="cd-input">
          <input class="pc-input ci-input" v-model="input" placeholder="写下你的评论...">
          <span class="ci-emoji" @click="quickEmoji">😊</span>
          <button class="pc-btn pc-btn-sm pc-btn-primary" :disabled="!input.trim()" @click="onSend">发送</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    show: Boolean,
    post: { type: Object, default: null }
})
const emit = defineEmits(['close'])

const colors = ['#2374DD', '#0EA5A4', '#E8912F', '#e94560', '#667eea']
const names = ['晚风', '背包十年', '风筝不断线', '看海的人', '困困鱼', '一路向南', '阿树', '橙子汽水', '不打烊', '橘子汽水']
const avatars = ['🧭', '🌙', '🪁', '🌊', '🐟', '🚗', '🌳', '🍊', '🕐', '🍋']
const ips = ['江西南昌', '四川成都', '广东广州', '浙江杭州', '北京', '上海', '湖北武汉', '湖南长沙', '福建厦门', '云南昆明']

const mockComments = [
    { content: '写得太详细了！收藏了，下次去一定按照这个路线走。', likes: 23, replies: [{ name: '背包十年', content: '哈哈，祝旅途愉快！' }] },
    { content: '武功山那段我也去了，真的震撼，但山上住宿条件确实差，建议带睡袋。', likes: 15, replies: [] },
    { content: '请问滕王阁门票需要提前预约吗？现场买会不会排很久？', likes: 8, replies: [{ name: '旅行体验官', content: '现在都要提前在公众号预约，现场基本买不到票' }] },
    { content: '美食推荐那块有个小错误，瓦罐汤孺子路店已经搬家了！', likes: 12, replies: [] },
    { content: '拍照技术好好看，请问用的什么相机？', likes: 6, replies: [] },
    { content: '周末出发，机票多少钱入手比较合适？', likes: 4, replies: [] }
]

const comments = computed(() => {
    return mockComments.map((c, i) => ({
        ...c,
        name: names[i % names.length],
        avatar: avatars[i % avatars.length],
        ip: ips[i % ips.length],
        date: `${2026}-09-${15 - i}`,
        bg: colors[i % colors.length]
    }))
})

const input = ref('')
const quickEmoji = () => { input.value += ['😊', '👍', '❤️', '🤩', '🔥'][Math.floor(Math.random() * 5)] }
const onSend = () => {
    if (!input.value.trim()) return
    alert('评论已发送（mock）：' + input.value)
    input.value = ''
}
</script>

<style scoped>
.cd-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 9000;
    display: flex;
    justify-content: flex-end;
}

.cd-drawer {
    width: 440px;
    height: 100%;
    background: #fff;
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cd-drawer.slidein {
    transform: translateX(0);
}

.cd-head {
    padding: 18px 22px;
    border-bottom: 1px solid var(--divider);
    position: relative;
}

.cd-close {
    position: absolute;
    top: 14px; right: 18px;
    width: 28px; height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: var(--text-3);
    cursor: pointer;
    font-size: 16px;
}
.cd-close:hover { background: #f2f4f7; color: var(--text-1); }

.cd-post-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-1);
    padding-right: 30px;
    line-height: 1.4;
}

.cd-post-meta {
    font-size: 12px;
    color: var(--text-3);
    margin-top: 5px;
    display: flex;
    gap: 12px;
}

.cd-body {
    flex: 1;
    overflow-y: auto;
    padding: 14px 22px;
}

.cd-comment {
    display: flex;
    gap: 10px;
    padding: 12px 0;
    border-bottom: 1px solid var(--divider);
}

.cc-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
}

.cc-main { flex: 1; min-width: 0; }

.cc-head {
    display: flex;
    align-items: center;
    gap: 8px;
}

.cc-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-1);
}

.cc-meta {
    font-size: 11px;
    color: var(--text-3);
}

.cc-content {
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.6;
    margin-top: 5px;
}

.cc-foot {
    display: flex;
    gap: 14px;
    margin-top: 6px;
}

.cc-act {
    font-size: 11.5px;
    color: var(--text-3);
    cursor: pointer;
}
.cc-act:hover { color: var(--brand); }

.cc-replies {
    margin-top: 8px;
    padding: 8px 12px;
    background: #f5f7fb;
    border-radius: 8px;
}

.cc-reply {
    font-size: 12px;
    color: var(--text-2);
    padding: 2px 0;
    line-height: 1.5;
}

.cc-reply b { color: var(--brand); font-weight: 600; }

.cd-empty {
    text-align: center;
    padding: 50px 0;
    color: var(--text-3);
}

.ce-emoji { font-size: 40px; margin-bottom: 8px; }

.cd-input {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 18px;
    border-top: 1px solid var(--divider);
    background: #fafbfd;
}

.ci-input {
    flex: 1;
    height: 34px;
    font-size: 13px;
}

.ci-emoji {
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
}
</style>
