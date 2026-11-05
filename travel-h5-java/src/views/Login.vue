<template>
  <div class="login-page">
    <!-- 背景层 -->
    <div class="lp-bg">
      <div class="lp-blob b1"></div>
      <div class="lp-blob b2"></div>
      <div class="lp-blob b3"></div>
    </div>

    <!-- 登录卡 -->
    <div class="lp-card">
      <div class="lp-logo">
        <div class="lp-logo-icon">✈️</div>
        <div>
          <div class="lp-logo-title">智能旅游规划与预算管理系统</div>
          <div class="lp-logo-sub">设计与实现 · 毕业设计演示版</div>
        </div>
      </div>

      <div class="lp-tabs">
        <span class="lp-tab" :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</span>
        <span class="lp-tab" :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</span>
      </div>

      <div class="lp-form">
        <div class="lp-field">
          <label class="lp-label">用户名</label>
          <input class="lp-input" v-model="form.username"
            :placeholder="mode === 'login' ? 'admin 或 traveler' : '3-20 位字母、数字、下划线或中文'"
            @keyup.enter="onSubmit">
        </div>

        <div class="lp-field" v-if="mode === 'register'">
          <label class="lp-label">昵称（选填）</label>
          <input class="lp-input" v-model="form.name" placeholder="不填则使用用户名" maxlength="12" @keyup.enter="onSubmit">
        </div>

        <div class="lp-field">
          <label class="lp-label">密码</label>
          <input class="lp-input" type="password" v-model="form.password"
            :placeholder="mode === 'login' ? '请输入密码' : '6-20 位密码'" @keyup.enter="onSubmit">
        </div>

        <div class="lp-field" v-if="mode === 'register'">
          <label class="lp-label">确认密码</label>
          <input class="lp-input" type="password" v-model="form.confirmPassword"
            placeholder="请再次输入密码" @keyup.enter="onSubmit">
        </div>

        <div class="lp-error" v-if="error">{{ error }}</div>

        <button class="lp-submit" v-if="mode === 'login'" :disabled="loading" @click="onLogin">
          {{ loading ? '登录中...' : '登 录' }}
        </button>
        <button class="lp-submit" v-else :disabled="loading" @click="onRegister">
          {{ loading ? '注册中...' : '注 册 并 登 录' }}
        </button>

        <!-- 快捷登录 -->
        <div class="lp-quick" v-if="mode === 'login'">
          <div class="lp-quick-title">快捷登录（演示用）</div>
          <div class="lp-quick-btns">
            <button class="lp-quick-btn admin" :disabled="loading" @click="quickLogin('admin', 'admin123')">
              🛡️ 管理员
              <span class="lp-quick-acc">admin / admin123</span>
            </button>
            <button class="lp-quick-btn user" :disabled="loading" @click="quickLogin('traveler', 'travel123')">
              ✈️ 普通用户
              <span class="lp-quick-acc">traveler / travel123</span>
            </button>
          </div>
          <p class="lp-quick-tip">普通用户：发布动态需管理员审核 · 管理员：可审核内容</p>
        </div>
        <p class="lp-tip" v-else>注册成功后自动登录；新账号发布的社区内容仍需管理员审核。</p>
      </div>

      <div class="lp-foot">© 2026 智能旅游规划与预算管理系统 · 本科毕业设计</div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api'
import toast from '../utils/msg'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({ username: '', password: '', confirmPassword: '', name: '' })
const mode = ref('login')
const loading = ref(false)
const error = ref('')

const USERNAME_RE = /^[A-Za-z0-9_\u4e00-\u9fa5]{3,20}$/

const switchMode = (m) => {
    if (loading.value) return
    mode.value = m
    error.value = ''
}

const onSubmit = () => {
    if (mode.value === 'login') onLogin()
    else onRegister()
}

const onLogin = async () => {
    if (loading.value) return
    error.value = ''
    form.username = form.username.trim()
    if (!form.username || !form.password.trim()) {
        error.value = '请输入用户名和密码'
        return
    }
    loading.value = true
    // 注意：login 是异步方法，必须 await 才能拿到 { ok, msg }
    const res = await auth.login(form.username, form.password)
    loading.value = false
    if (res.ok) {
        toast.success(res.msg)
        const redirect = route.query.redirect || '/'
        router.replace(redirect)
    } else {
        error.value = res.msg
    }
}

const onRegister = async () => {
    if (loading.value) return
    error.value = ''
    const username = form.username.trim()
    const nickname = form.name.trim()
    if (!USERNAME_RE.test(username)) {
        error.value = '用户名需为 3-20 位字母、数字、下划线或中文'
        return
    }
    if (!form.password || form.password.length < 6 || form.password.length > 20) {
        error.value = '密码需为 6-20 位'
        return
    }
    if (form.password !== form.confirmPassword) {
        error.value = '两次输入的密码不一致'
        return
    }
    loading.value = true
    try {
        // 后端登录只认 status === "1"；register 默认写入 "normal" 会导致新账号登录被判为禁用。
        // 这里在注册请求里显式带上 "1"，不改后端代码与业务规则。
        await authApi.register({
            username,
            password: form.password,
            name: nickname || username,
            status: '1'
        })
        const res = await auth.login(username, form.password)
        if (res.ok) {
            toast.success('注册成功，已自动登录')
            router.replace(route.query.redirect || '/')
        } else {
            error.value = `注册成功，但自动登录失败：${res.msg}，请手动登录`
            mode.value = 'login'
        }
    } catch (e) {
        error.value = e?.message || '注册失败，请检查网络后重试'
    } finally {
        loading.value = false
    }
}

const quickLogin = (u, p) => {
    if (loading.value) return
    form.username = u
    form.password = p
    onLogin()
}
</script>

<style scoped>
.login-page {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    background: linear-gradient(135deg, #e8f0ff 0%, #f0f7ff 50%, #e8fbfa 100%);
    z-index: 9999;
    overflow-y: auto;
    padding: 24px 16px;
    box-sizing: border-box;
}

.lp-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.lp-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.3;
}
.lp-blob.b1 { width: 420px; height: 420px; top: -120px; right: -80px; background: radial-gradient(circle, #2374DD, transparent 70%); }
.lp-blob.b2 { width: 320px; height: 320px; bottom: -80px; left: -60px; background: radial-gradient(circle, #0EA5A4, transparent 70%); opacity: 0.25; }
.lp-blob.b3 { width: 240px; height: 240px; top: 30%; left: 45%; background: radial-gradient(circle, #E8912F, transparent 70%); opacity: 0.15; }

.lp-card {
    position: relative;
    width: min(420px, 100%);
    flex-shrink: 0;
    margin: auto;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    border-radius: 22px;
    box-shadow: 0 24px 60px rgba(35, 116, 221, 0.18);
    padding: 36px 34px 24px;
    border: 1px solid rgba(255, 255, 255, 0.8);
}

/* 登录 / 注册切换 */
.lp-tabs {
    display: flex;
    gap: 8px;
    padding: 4px;
    margin-bottom: 20px;
    background: #eef2f9;
    border-radius: 11px;
}
.lp-tab {
    flex: 1;
    text-align: center;
    padding: 9px 0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #6b7c9a;
    cursor: pointer;
    transition: all 0.18s;
    user-select: none;
}
.lp-tab.active {
    background: #fff;
    color: #2374DD;
    box-shadow: 0 2px 8px rgba(35, 116, 221, 0.16);
}

.lp-tip {
    font-size: 12px;
    color: #6b7c9a;
    line-height: 1.6;
    text-align: center;
    margin: 0;
}

.lp-logo {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 32px;
}

.lp-logo-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #2374DD, #0EA5A4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    box-shadow: 0 8px 20px rgba(35, 116, 221, 0.35);
}

.lp-logo-title {
    font-size: 20px;
    font-weight: 700;
    color: #1a2a4a;
}

.lp-logo-sub {
    font-size: 12px;
    color: #6b7c9a;
    margin-top: 3px;
}

.lp-form { display: flex; flex-direction: column; gap: 14px; }

.lp-field { display: flex; flex-direction: column; gap: 6px; }

.lp-label {
    font-size: 12.5px;
    font-weight: 600;
    color: #1a2a4a;
}

.lp-input {
    height: 40px;
    padding: 0 14px;
    border: 1px solid #e2e7ef;
    border-radius: 10px;
    background: #fff;
    font-size: 13.5px;
    color: #1a2a4a;
    outline: none;
    transition: all 0.15s;
}

.lp-input:focus {
    border-color: #2374DD;
    box-shadow: 0 0 0 3px rgba(35, 116, 221, 0.12);
}

.lp-error {
    padding: 8px 12px;
    border-radius: 8px;
    background: #fde7ea;
    color: #e94560;
    font-size: 12.5px;
}

.lp-submit {
    height: 44px;
    border: none;
    border-radius: 11px;
    background: linear-gradient(135deg, #2374DD, #0EA5A4);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 6px;
    box-shadow: 0 8px 20px rgba(35, 116, 221, 0.35);
    transition: all 0.18s;
    letter-spacing: 2px;
}

.lp-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px rgba(35, 116, 221, 0.45);
}

.lp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.lp-quick {
    margin-top: 8px;
    padding-top: 18px;
    border-top: 1px dashed #e2e7ef;
}

.lp-quick-title {
    font-size: 12px;
    color: #6b7c9a;
    margin-bottom: 10px;
    text-align: center;
}

.lp-quick-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.lp-quick-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 8px;
    border: 1px solid #e2e7ef;
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: #1a2a4a;
    transition: all 0.15s;
}

.lp-quick-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
}

.lp-quick-btn.admin:hover { border-color: #E8912F; background: #fff8ec; color: #E8912F; }
.lp-quick-btn.user:hover { border-color: #2374DD; background: #e8f0ff; color: #2374DD; }

.lp-quick-acc {
    font-size: 10.5px;
    color: #9ba8bd;
    font-weight: 400;
}

.lp-quick-tip {
    margin: 10px 0 0;
    font-size: 11.5px;
    color: #9ba8bd;
    text-align: center;
}

.lp-quick-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.lp-foot {
    margin-top: 22px;
    text-align: center;
    font-size: 11.5px;
    color: #9ba8bd;
}

@media (max-width: 480px) {
    .login-page { padding: 14px 12px; }
    .lp-card { padding: 24px 18px 18px; border-radius: 18px; }
    .lp-logo { margin-bottom: 20px; }
    .lp-logo-title { font-size: 17px; }
    .lp-quick-btns { grid-template-columns: 1fr; }
}
</style>
