import axios from 'axios'

// 后端基础地址：默认走 Vite 代理 /api（见 vite.config.js），可用环境变量 VITE_API_BASE 覆盖
export const API_BASE = import.meta.env.VITE_API_BASE || '/api'

// 创建 axios 实例
const request = axios.create({
    baseURL: API_BASE,
    timeout: 300000,  // 5 分钟，AI 大模型生成路线/预算/行李清单耗时较长
    headers: { 'Content-Type': 'application/json' }
})

// ====== JWT token 拦截 ======
const TOKEN_KEY = 'pc-token'

const getToken = () => {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
const setToken = (t) => { try { localStorage.setItem(TOKEN_KEY, t) } catch {} }
const clearToken = () => { try { localStorage.removeItem(TOKEN_KEY) } catch {} }

request.interceptors.request.use(config => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
}, error => Promise.reject(error))

request.interceptors.response.use(
    response => {
        // 后端统一 Result<T>：{ success, code, message, data }
        const body = response.data
        if (body && typeof body === 'object' && 'success' in body) {
            if (body.success) return body.data
            // 业务失败
            const err = new Error(body.message || '请求失败')
            err.code = body.code
            if (body.code === 401) { clearToken() }
            return Promise.reject(err)
        }
        // 非统一响应（兼容流式等），直接返回
        return body
    },
    error => {
        if (error?.response?.status === 401) clearToken()
        return Promise.reject(error)
    }
)

export function post(url, data) { return request.post(url, data) }
export function get(url, params) { return request.get(url, { params }) }
export function del(url) { return request.delete(url) }
export function put(url, data) { return request.put(url, data) }
export { getToken, setToken, clearToken }

// ====== 流式请求 ======
export function fetchStream(url, data, onChunk, onComplete, onError) {
    const controller = new AbortController()
    const abort = () => controller.abort()
    const start = async () => {
        try {
            const token = getToken()
            const headers = { 'Content-Type': 'application/json' }
            if (token) headers.Authorization = `Bearer ${token}`
            const response = await fetch(`${API_BASE}${url}`, {
                method: 'POST', headers, body: JSON.stringify(data), signal: controller.signal
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const chunk = decoder.decode(value, { stream: true })
                for (const line of chunk.split('\n').filter(l => l.trim())) {
                    try {
                        if (line.startsWith('data:')) {
                            const j = JSON.parse(line.substring(5))
                            if (j.type === 'chunk') onChunk(j.content)
                            else if (j.done) onComplete()
                            else if (j.error) onError(j.error)
                        }
                    } catch {}
                }
            }
        } catch (e) { if (e.name !== 'AbortError') onError(e.message) }
    }
    start()
    return { abort }
}
