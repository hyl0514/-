/**
 * 全局轻提示 Toast
 * 用法：toast('内容') / toast.success('成功') / toast.error('失败')
 */

let wrap = null

function ensureWrap() {
    if (wrap) return wrap
    wrap = document.createElement('div')
    wrap.className = 'pc-toast-wrap'
    document.body.appendChild(wrap)
    return wrap
}

function show(text, type = '') {
    const box = ensureWrap()
    const el = document.createElement('div')
    el.className = type ? `pc-toast ${type}` : 'pc-toast'
    el.textContent = text
    box.appendChild(el)

    setTimeout(() => {
        el.classList.add('hide')
        setTimeout(() => el.remove(), 300)
    }, 2200)
}

export function toast(text) {
    show(text)
}

toast.success = (text) => show(text, 'success')
toast.error = (text) => show(text, 'error')

export default toast
