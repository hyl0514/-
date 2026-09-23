<template>
  <div class="chat-bubble" :class="messageClass">
    <!-- AI Avatar -->
    <div class="avatar-wrap" v-if="message.role === 'ai'">
      <div class="avatar ai-avatar">
        <span>🤖</span>
        <div class="avatar-glow"></div>
      </div>
    </div>
    
    <div class="bubble-main">
      <div class="message-header" v-if="showTime">
        <span class="message-time">{{ formatTime }}</span>
        <span class="message-role">{{ message.role === 'user' ? '我' : 'AI助手' }}</span>
      </div>
      
      <div class="bubble-content">
        <div class="message-text" v-if="message.role === 'user'">{{ message.content }}</div>
        <div class="message-text ai-message" v-else>
          <template v-if="message.content">{{ message.content }}</template>
          <template v-else>
            <span class="typing-cursor"></span>
          </template>
        </div>
      </div>
      
      <!-- Message Status -->
      <div class="message-footer" v-if="message.role === 'user'">
        <span class="status-icon" :class="{ 'status-success': message.status === 'success' }">
          <van-icon name="success" size="12" color="#999" />
        </span>
      </div>
    </div>
    
    <!-- User Avatar -->
    <div class="avatar-wrap" v-if="message.role === 'user'">
      <div class="avatar user-avatar">
        <span>👤</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Icon as VanIcon } from 'vant'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const messageClass = computed(() => {
  return props.message.role === 'user' ? 'user-message' : 'ai-message'
})

const showTime = computed(() => {
  return props.message.timestamp && props.message.content
})

const formatTime = computed(() => {
  if (!props.message.timestamp) return ''
  const date = new Date(props.message.timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
})
</script>

<style scoped>
.chat-bubble {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 90%;
  animation: bubbleFadeIn 0.3s ease-out;
  padding: 8px 0;
}

@keyframes bubbleFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.user-message .bubble-main {
  align-items: flex-end;
}

.ai-message {
  align-self: flex-start;
}

.ai-message .bubble-main {
  align-items: flex-start;
}

/* Avatar */
.avatar-wrap {
  flex-shrink: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  position: relative;
  z-index: 2;
}

.ai-avatar {
  background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%);
  box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
}

.ai-avatar .avatar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  background: radial-gradient(circle, rgba(74, 144, 217, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: avatarGlow 2s ease-in-out infinite;
  z-index: -1;
}

@keyframes avatarGlow {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
}

.user-avatar {
  background: linear-gradient(135deg, #6bcb77 0%, #8ce09a 100%);
  box-shadow: 0 4px 12px rgba(107, 203, 119, 0.3);
}

/* Bubble Main */
.bubble-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 6px;
}

.message-time {
  font-size: 11px;
  color: #999;
}

.message-role {
  font-size: 11px;
  color: #4a90d9;
  background: rgba(74, 144, 217, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
}

.user-message .message-role {
  color: #6bcb77;
  background: rgba(107, 203, 119, 0.1);
}

/* Bubble Content */
.bubble-content {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
  transition: all 0.3s ease;
  position: relative;
  min-width: 40px;
}

.user-message .bubble-content {
  background: linear-gradient(135deg, #4a90d9 0%, #6ba3e0 100%);
  color: #fff;
  border-bottom-right-radius: 6px;
  box-shadow: 0 4px 15px rgba(74, 144, 217, 0.3);
}

.user-message .bubble-content::after {
  content: '';
  position: absolute;
  right: -8px;
  bottom: 8px;
  width: 0;
  height: 0;
  border-left: 10px solid #6ba3e0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.user-message .bubble-content:hover {
  box-shadow: 0 6px 20px rgba(74, 144, 217, 0.4);
  transform: translateY(-1px);
}

.ai-message .bubble-content {
  background: #ffffff;
  color: #323233;
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(74, 144, 217, 0.1);
}

.ai-message .bubble-content::after {
  content: '';
  position: absolute;
  left: -8px;
  bottom: 8px;
  width: 0;
  height: 0;
  border-right: 10px solid #ffffff;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.ai-message .bubble-content:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: rgba(74, 144, 217, 0.2);
}

.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 16px;
  background: #4a90d9;
  animation: blink 1s infinite;
  margin-left: 2px;
  vertical-align: middle;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Message Footer */
.message-footer {
  padding: 0 6px;
}

.status-icon {
  opacity: 0.5;
}

.status-success {
  opacity: 1;
}
</style>
