<template>
    <div class="page-container chat-page">
        <!-- 背景装饰 -->
        <div class="chat-bg">
            <div class="bg-blob blob-1"></div>
            <div class="bg-blob blob-2"></div>
            <div class="bg-blob blob-3"></div>
            <!-- 网格背景 -->
            <div class="grid-bg"></div>
        </div>
        
        <div class="page-header">
            <van-nav-bar
                title="AI 旅游助手"
                left-arrow
                left-text="返回"
                fixed
                class="custom-nav"
                @click-left="onBack"
            >
                <template #right>
                    <div class="online-status" v-if="!isStreaming">
                        <span class="status-dot"></span>
                        <span class="status-text">在线</span>
                    </div>
                    <div class="typing-status" v-else>
                        <van-loading size="14px" type="spinner" color="#4a90d9" />
                        <span class="status-text">思考中</span>
                    </div>
                </template>
            </van-nav-bar>
        </div>
        
        <div class="chat-container" ref="chatContainer">
            <!-- 空状态 -->
            <div v-if="messages.length === 0" class="chat-empty">
                <!-- 主插画区域 -->
                <div class="empty-main">
                    <div class="ai-hero">
                        <div class="hero-avatar">🤖</div>
                        <div class="hero-glow"></div>
                        <div class="hero-ring ring-1"></div>
                        <div class="hero-ring ring-2"></div>
                    </div>
                    
                    <div class="empty-title">开始和 AI 助手对话吧！</div>
                    <div class="empty-desc">告诉我你想去哪里，我来为你规划完美旅程</div>
                    
                    <!-- 功能特性 -->
                    <div class="feature-cards">
                        <div class="feature-card" v-for="(feature, index) in features" :key="index">
                            <div class="feature-icon">{{ feature.icon }}</div>
                            <div class="feature-text">{{ feature.text }}</div>
                        </div>
                    </div>
                </div>
                
                <!-- 热门问题 -->
                <div class="quick-questions">
                    <div class="quick-header">
                        <div class="quick-title">🔥热门旅游问题</div>
                        <van-icon name="sparkles" size="16" color="#ffd93d" />
                    </div>
                    <div class="tag-wrap">
                        <van-tag 
                            @click="handleClickTag(q)" 
                            v-for="(q, index) in quickQuestions" 
                            :key="q" 
                            size="large" 
                            mark 
                            class="quick-tag"
                            :style="{ animationDelay: `${index * 0.1}s` }"
                        >
                            {{ q }}
                        </van-tag>
                    </div>
                </div>
                
                <!-- 近期搜索 -->
                <div class="recent-searches" v-if="recentSearches.length">
                    <div class="recent-header">
                        <div class="recent-title">📖 近期搜索</div>
                        <van-icon name="clock" size="14" color="#999" />
                    </div>
                    <div class="recent-list">
                        <div 
                            class="recent-item" 
                            v-for="(item, index) in recentSearches" 
                            :key="index"
                            @click="handleClickTag(item)"
                        >
                            <van-icon name="search" size="14" color="#999" />
                            <span>{{ item }}</span>
                            <van-icon name="arrow" size="14" color="#ccc" />
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 消息列表 -->
            <div v-else class="message-list">
                <!-- 日期分隔线 -->
                <div class="date-divider" v-if="showDateDivider">
                    <span>{{ currentDate }}</span>
                </div>
                
                <ChatBubble 
                    v-for="(msg, index) in messages" 
                    :key="msg.id" 
                    :message="msg"
                    :class="{ 'message-enter': true }"
                    :style="{ animationDelay: `${index * 0.05}s` }"
                />
                
                <!-- 正在输入指示器 -->
                <div class="streaming-indicator" v-if="isStreaming">
                    <div class="streaming-avatar">🤖</div>
                    <div class="streaming-content">
                        <div class="typing-dots">
                            <span class="dot dot-1"></span>
                            <span class="dot dot-2"></span>
                            <span class="dot dot-3"></span>
                        </div>
                        <span>{{ streamingText }}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 输入区域 -->
        <div class="chat-input-area">
            <div class="input-tools">
                <van-icon name="smile-o" size="24" color="#999" class="tool-icon" @click="showToast('表情功能开发中')" />
                <van-icon name="plus" size="24" color="#999" class="tool-icon" @click="showToast('更多功能开发中')" />
            </div>
            <van-field
                v-model="inputMessage"
                placeholder="输入城市、景点、出行需求..."
                :disabled="isStreaming"
                @keyup.enter="sendMessage"
                class="chat-input"
            >
                <template #button>
                    <van-button 
                        @click="sendMessage" 
                        type="primary" 
                        size="small" 
                        round 
                        :disabled="!inputMessage.trim()"
                        class="send-btn"
                    >
                        <span v-if="!isStreaming">发送</span>
                        <van-loading v-else type="spinner" size="16px" />
                    </van-button>
                </template>
            </van-field>
        </div>
        
        <!-- 快捷操作栏 -->
        <div class="quick-actions" v-if="showQuickActions">
            <div class="action-btn" @click="clearHistory">
                <van-icon name="trash-o" size="18" color="#999" />
                <span>清空记录</span>
            </div>
            <div class="action-btn" @click="showToast('已复制')">
                <van-icon name="copy" size="18" color="#999" />
                <span>复制内容</span>
            </div>
            <div class="action-btn" @click="showToast('已收藏')">
                <van-icon name="star-o" size="18" color="#999" />
                <span>收藏对话</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchStream } from '../utils/request'
import { showToast, Icon as VanIcon } from 'vant'
import ChatBubble from '../components/ChatBubble.vue'

const chatContainer = ref(null)

const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
    })
}

const router = useRouter()

// 功能特性
const features = ref([
    { icon: '📍', text: '景点推荐' },
    { icon: '💰', text: '预算规划' },
    { icon: '🍜', text: '美食推荐' },
    { icon: '🏨', text: '住宿建议' }
])

// 热门问题
const quickQuestions = ref([
    '北京有哪些必去的景点？',
    '上海美食推荐',
    '成都三日游攻略',
    '如何选择旅行保险？',
    '云南自驾游路线',
    '三亚亲子游攻略'
])

// 近期搜索
const recentSearches = ref([])

// 请求控制
let currentRequest = null
let lastRequestTime = 0
const REQUEST_COOLDOWN = 1500 // 1.5秒冷却时间

// 防抖处理
const debounceSend = (fn) => {
    const now = Date.now()
    if (now - lastRequestTime < REQUEST_COOLDOWN) {
        showToast('请稍等片刻，AI正在处理中...')
        return
    }
    lastRequestTime = now
    fn()
}

const handleClickTag = (q) => {
    inputMessage.value = q
    debounceSend(sendMessage)
}

const messages = ref([])

const onBack = () => {
    // 离开页面时取消正在进行的请求
    cancelCurrentRequest()
    router.back()
}

const inputMessage = ref('')

const streamingTexts = [
    'AI正在思考最佳路线...',
    '正在搜索热门景点...',
    '正在规划美食行程...',
    '正在计算预算方案...'
]

const streamingText = ref('AI正在思考最佳路线...')

// 取消当前请求
const cancelCurrentRequest = () => {
    if (currentRequest) {
        currentRequest.abort()
        currentRequest = null
    }
}

const sendMessage = () => {
    const msg = inputMessage.value.trim()
    if (!msg || isStreaming.value) {
        return
    }
    
    // 添加到近期搜索
    if (!recentSearches.value.includes(msg)) {
        recentSearches.value.unshift(msg)
        if (recentSearches.value.length > 5) {
            recentSearches.value.pop()
        }
    }
    
    addUserMessage(msg)
    inputMessage.value = ''
    scrollToBottom()
    fetchAIResponse(msg)
}

const fetchAIResponse = (userMsg) => {
    // 取消之前的请求，避免重复消耗
    cancelCurrentRequest()
    
    isStreaming.value = true
    
    // 随机切换提示文字
    let textIndex = 0
    const textInterval = setInterval(() => {
        textIndex = (textIndex + 1) % streamingTexts.length
        streamingText.value = streamingTexts[textIndex]
    }, 3000) // 延长切换时间，减少干扰
    
    messages.value.push({
        id: Date.now() + 1,
        role: 'ai',
        content: '',
        timestamp: new Date().toISOString(),
        status: 'loading'
    })
    
    let fullResponse = ''

    // 保存当前请求的取消函数
    currentRequest = fetchStream('chat', { message: userMsg }, (chunk) => {
        fullResponse += chunk
        const lastMsg =  messages.value[messages.value.length - 1]
        if (lastMsg && lastMsg.role === 'ai') {
            lastMsg.content = fullResponse
        }
        scrollToBottom()
    }, () => {
        isStreaming.value = false
        clearInterval(textInterval)
        streamingText.value = streamingTexts[0]
        currentRequest = null
        const lastMsg = messages.value[messages.value.length - 1]
        if (lastMsg) {
            lastMsg.status = 'success'
        }
        scrollToBottom()
    }, (errMsg) => {
        clearInterval(textInterval)
        streamingText.value = streamingTexts[0]
        currentRequest = null
        const lastMsg =  messages.value[messages.value.length - 1]
        if (lastMsg && lastMsg.role === 'ai') {
            lastMsg.content = `抱歉，AI发生错误：${errMsg}`
            lastMsg.status = 'error'
        }
        isStreaming.value = false
        showToast('ai回复失败！')
        scrollToBottom()
    })
}

const isStreaming = ref(false)

const addUserMessage = (content) => {
    messages.value.push({
        id: Date.now(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        status: 'success'
    })
}

// 日期分隔线
const currentDate = computed(() => {
    const now = new Date()
    return `${now.getMonth() + 1}月${now.getDate()}日`
})

const showDateDivider = computed(() => {
    return messages.value.length > 0
})

const showQuickActions = computed(() => {
    return messages.value.length > 0
})

const clearHistory = () => {
    cancelCurrentRequest()
    messages.value = []
    showToast('已清空对话记录')
}

const route = useRoute()

// 页面卸载时清理
onUnmounted(() => {
    cancelCurrentRequest()
})

onMounted(() => {
    if (route.query.scene === 'detail' && route.query.city) {
        inputMessage.value = `我想了解一下${route.query.city}的旅游景点`
    }
})
</script>

<style scoped>
.page-header {
    height: 46px;
    position: relative;
    z-index: 20;
}

.custom-nav {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
}

/* 在线状态 */
.online-status, .typing-status {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #6bcb77;
}

.typing-status {
    color: #4a90d9;
}

.status-dot {
    width: 6px;
    height: 6px;
    background: #6bcb77;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-bottom: 0px !important;
  background: linear-gradient(180deg, #e8f4fd 0%, #f5f9ff 50%, #ffffff 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.chat-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
}

.grid-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
        linear-gradient(rgba(74, 144, 217, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(74, 144, 217, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
}

.bg-blob {
    position: absolute;
    border-radius: 50%;
    opacity: 0.25;
    filter: blur(40px);
}

.blob-1 {
    width: 300px;
    height: 300px;
    background: #4a90d9;
    top: -100px;
    right: -100px;
    animation: blobMove 20s ease-in-out infinite;
}

.blob-2 {
    width: 250px;
    height: 250px;
    background: #6ba3e0;
    bottom: 200px;
    left: -80px;
    animation: blobMove 15s ease-in-out infinite reverse;
}

.blob-3 {
    width: 200px;
    height: 200px;
    background: #87ceeb;
    bottom: -50px;
    right: 50px;
    animation: blobMove 18s ease-in-out infinite;
}

@keyframes blobMove {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.1); }
    66% { transform: translate(-20px, 30px) scale(0.9); }
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 130px;
  position: relative;
  z-index: 10;
}

/* 空状态 */
.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 32px;
}

.empty-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

/* AI 英雄区域 */
.ai-hero {
    position: relative;
    margin-bottom: 16px;
}

.hero-avatar {
    font-size: 90px;
    animation: float 3s ease-in-out infinite;
    position: relative;
    z-index: 3;
    filter: drop-shadow(0 8px 20px rgba(74, 144, 217, 0.3));
}

.hero-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(74, 144, 217, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    animation: glowPulse 2s ease-in-out infinite;
    z-index: 1;
}

.hero-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid rgba(74, 144, 217, 0.15);
    animation: ringRotate 8s linear infinite;
    z-index: 2;
}

.ring-1 {
    width: 140px;
    height: 140px;
    animation-duration: 8s;
}

.ring-2 {
    width: 160px;
    height: 160px;
    animation-duration: 10s;
    animation-direction: reverse;
}

@keyframes ringRotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes glowPulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.8; }
}

.empty-title {
    font-size: 22px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
    text-align: center;
}

.empty-desc {
    font-size: 14px;
    color: #999;
    text-align: center;
    max-width: 260px;
}

/* 功能特性卡片 */
.feature-cards {
    display: flex;
    gap: 16px;
    margin-top: 16px;
}

.feature-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    border: 1px solid rgba(74, 144, 217, 0.1);
    transition: all 0.3s ease;
    animation: fadeInUp 0.5s ease-out backwards;
}

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }
.feature-card:nth-child(4) { animation-delay: 0.4s; }

.feature-card:hover {
    background: rgba(74, 144, 217, 0.1);
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 8px 25px rgba(74, 144, 217, 0.15);
}

.feature-icon {
    font-size: 28px;
}

.feature-text {
    font-size: 12px;
    color: #666;
}

/* 热门问题 */
.quick-questions {
    width: 100%;
    padding: 20px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    border: 1px solid rgba(74, 144, 217, 0.1);
    box-shadow: 0 4px 20px rgba(74, 144, 217, 0.08);
}

.quick-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 18px;
}

.quick-title {
    font-size: 16px;
    color: #333;
    font-weight: 600;
}

.tag-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
}

.quick-tag {
    padding: 10px 16px;
    cursor: pointer;
    border-radius: 24px;
    transition: all 0.3s ease;
    background: rgba(74, 144, 217, 0.08) !important;
    border: 1px solid rgba(74, 144, 217, 0.2) !important;
    color: #4a90d9 !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    animation: fadeInUp 0.5s ease-out backwards;
}

.quick-tag:hover {
    transform: translateY(-3px) scale(1.05);
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%) !important;
    color: white !important;
    border-color: transparent !important;
    box-shadow: 0 6px 20px rgba(74, 144, 217, 0.3);
}

/* 近期搜索 */
.recent-searches {
    width: 100%;
    padding: 20px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    border: 1px solid rgba(74, 144, 217, 0.1);
    box-shadow: 0 4px 20px rgba(74, 144, 217, 0.08);
}

.recent-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
}

.recent-title {
    font-size: 15px;
    color: #666;
    font-weight: 500;
}

.recent-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.recent-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: #f7f9fc;
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.recent-item:hover {
    background: rgba(74, 144, 217, 0.08);
    transform: translateX(5px);
}

.recent-item span {
    flex: 1;
    font-size: 14px;
    color: #666;
}

/* 消息列表 */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 日期分隔线 */
.date-divider {
    display: flex;
    justify-content: center;
    padding: 16px 0;
}

.date-divider span {
    font-size: 12px;
    color: #999;
    background: rgba(255, 255, 255, 0.8);
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid rgba(74, 144, 217, 0.1);
}

.message-enter {
    animation: messageFadeIn 0.3s ease-out;
}

@keyframes messageFadeIn {
    from {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* 正在输入指示器 */
.streaming-indicator {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 18px;
  color: #666;
  font-size: 14px;
  background: #ffffff;
  border-radius: 20px;
  width: fit-content;
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.3s ease-out;
  border: 1px solid rgba(74, 144, 217, 0.1);
}

.streaming-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
}

.streaming-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.typing-dots {
    display: flex;
    gap: 6px;
}

.dot {
    width: 8px;
    height: 8px;
    background: #4a90d9;
    border-radius: 50%;
    animation: typingDot 1.4s infinite ease-in-out both;
}

.dot-1 { animation-delay: -0.32s; }
.dot-2 { animation-delay: -0.16s; }
.dot-3 { animation-delay: 0s; }

@keyframes typingDot {
    0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

/* 输入区域 */
.chat-input-area {
  position: fixed;
  bottom: 70px;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  box-shadow: 0 -4px 20px rgba(74, 144, 217, 0.1);
  max-width: 750px;
  margin: 0 auto;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  z-index: 20;
}

.input-tools {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;
    padding: 0 4px;
}

.tool-icon {
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 8px;
    border-radius: 50%;
}

.tool-icon:active {
    background: rgba(74, 144, 217, 0.1);
    transform: scale(0.9);
}

.chat-input {
  background: #f5f7fa !important;
  border-radius: 28px !important;
  padding: 12px 20px !important;
  transition: all 0.3s ease;
}

.chat-input:active {
    background: #eef2f7 !important;
}

.send-btn {
    border-radius: 24px !important;
    padding: 0 20px !important;
    height: 36px !important;
    line-height: 36px !important;
    background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%) !important;
    border: none !important;
    box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
    transition: all 0.3s ease;
}

.send-btn:active {
    transform: scale(0.95);
}

.send-btn:disabled {
    opacity: 0.5;
    box-shadow: none;
}

/* 快捷操作栏 */
.quick-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 12px 16px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    display: flex;
    justify-content: space-around;
    max-width: 750px;
    margin: 0 auto;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    z-index: 20;
}

.action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 20px;
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.action-btn:hover {
    background: rgba(74, 144, 217, 0.08);
    transform: translateY(-2px);
}

.action-btn span {
    font-size: 12px;
    color: #666;
}

/* 动画 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
}

.animate-float {
    animation: float 3s ease-in-out infinite;
}
</style>
