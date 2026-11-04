<template>
  <!-- 渐变 Banner + 用户信息 + 4 个数据卡 -->
  <section class="pb-wrap">
    <!-- 渐变背景层 -->
    <div class="pb-bg">
      <div class="pb-blob b1"></div>
      <div class="pb-blob b2"></div>
      <div class="pb-blob b3"></div>
      <!-- 3D 漂浮装饰 -->
      <div class="pb-3d-compass">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="rgba(35,116,221,0.25)" stroke-width="2"/>
          <path d="M24 8L20 24L24 20L28 24Z" fill="#2374DD" opacity="0.3"/>
          <path d="M24 40L28 24L24 28L20 24Z" fill="#E8912F" opacity="0.25"/>
          <circle cx="24" cy="24" r="3" fill="#2374DD" opacity="0.2"/>
        </svg>
      </div>
      <div class="pb-3d-globe">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="18" stroke="rgba(14,165,164,0.25)" stroke-width="2"/>
          <ellipse cx="22" cy="22" rx="18" ry="8" stroke="rgba(14,165,164,0.15)" stroke-width="1.5"/>
          <ellipse cx="22" cy="22" rx="8" ry="18" stroke="rgba(14,165,164,0.15)" stroke-width="1.5"/>
          <path d="M22 4v36M4 22h36" stroke="rgba(14,165,164,0.15)" stroke-width="1.5"/>
        </svg>
      </div>
      <div class="pb-3d-map">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M8 12L16 8L24 12L32 8V28L24 32L16 28L8 32V12Z" stroke="rgba(232,145,47,0.2)" stroke-width="2" stroke-linejoin="round"/>
          <path d="M16 8V28M24 12V32" stroke="rgba(232,145,47,0.15)" stroke-width="1.5"/>
        </svg>
      </div>
      <div class="pb-overlay"></div>
    </div>

    <div class="pb-content">
      <!-- 左侧：用户信息 -->
      <div class="pb-user">
        <div class="avatar-wrap">
          <div class="avatar-ring"></div>
          <div class="avatar">
            <div class="avatar-fallback">{{ auth.state.avatar || '旅' }}</div>
          </div>
          <div class="avatar-badge">✈️</div>
        </div>

        <div class="pb-user-info">
          <div class="pb-name">{{ auth.state.name || '旅行体验官' }}
            <span class="pb-badge" v-if="level === '达人'">🏆 攻略达人</span>
            <span class="pb-badge" v-else>🎒 旅行爱好者</span>
          </div>
          <div class="pb-sign">{{ auth.state.sign || '把生活过成一场旅行 ✈️' }}</div>
          <div class="pb-btns">
            <button class="btn-outline" @click="openProfile('basic')">编辑资料</button>
            <button class="btn-solid" @click="openProfile('prefer')">完善信息</button>
          </div>
        </div>
      </div>

      <!-- 右侧：4 个悬浮数据卡 -->
      <div class="pb-stats">
        <div class="stat-card" v-for="s in stats" :key="s.key" @click="go(s.to)">
          <div class="stat-icon" :class="'ic-' + s.key" v-html="s.icon"></div>
          <div class="stat-num">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-hint">点击查看 →</div>
        </div>
      </div>
    </div>

    <!-- 编辑资料弹窗 -->
    <teleport to="body">
      <div class="pc-mask" v-if="showModal" @click.self="showModal = false">
        <div class="pp-modal" @click.stop>
          <div class="pp-head">
            <span class="pp-title">✏️ 编辑个人资料</span>
            <span class="pp-close" @click="showModal = false">✕</span>
          </div>

          <!-- Tab -->
          <div class="pp-tabs">
            <span class="pp-tab" :class="{ active: modalTab === 'basic' }" @click="modalTab = 'basic'">基本资料</span>
            <span class="pp-tab" :class="{ active: modalTab === 'prefer' }" @click="modalTab = 'prefer'">旅行偏好</span>
          </div>

          <div class="pp-body">
            <!-- 基本资料 -->
            <template v-if="modalTab === 'basic'">
              <!-- 头像选择 -->
              <div class="pp-field">
                <label class="pp-label">头像</label>
                <div class="pp-avatars">
                  <span v-for="a in avatars" :key="a" class="pp-avatar-opt"
                    :class="{ active: temp.avatar === a }" @click="temp.avatar = a">{{ a }}</span>
                </div>
              </div>

              <div class="pp-field">
                <label class="pp-label">昵称</label>
                <input class="pc-input" v-model="temp.name" placeholder="输入昵称" maxlength="12">
              </div>

              <div class="pp-field">
                <label class="pp-label">个性签名</label>
                <textarea class="pc-input pp-textarea" v-model="temp.sign" rows="3" maxlength="50"
                  placeholder="一句话介绍自己"></textarea>
                <span class="pp-counter">{{ temp.sign.length }}/50</span>
              </div>
            </template>

            <!-- 旅行偏好 -->
            <template v-else>
              <div class="pp-field">
                <label class="pp-label">出发地</label>
                <input class="pc-input" list="pp-cities" v-model="temp.origin" placeholder="常住城市">
                <datalist id="pp-cities">
                  <option v-for="c in hotCities" :key="c" :value="c"></option>
                </datalist>
              </div>

              <div class="pp-field">
                <label class="pp-label">出行预算</label>
                <select class="pc-select pp-select" v-model="temp.budget">
                  <option value="">请选择</option>
                  <option value="1000以下">¥1000 以下（穷游）</option>
                  <option value="1000-3000">¥1000-3000（经济）</option>
                  <option value="3000-5000">¥3000-5000（舒适）</option>
                  <option value="5000-10000">¥5000-10000（品质）</option>
                  <option value="10000+">¥10000+（奢华）</option>
                </select>
              </div>

              <div class="pp-field">
                <label class="pp-label">兴趣偏好（可多选）</label>
                <div class="pp-interests">
                  <span v-for="t in interestOpts" :key="t" class="pp-interest"
                    :class="{ active: temp.interests.includes(t) }" @click="toggleInterest(t)">{{ t }}</span>
                </div>
              </div>
            </template>
          </div>

          <div class="pp-foot">
            <button class="pc-btn" @click="showModal = false">取消</button>
            <button class="pc-btn pc-btn-primary" @click="onSave">保存</button>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/authStore'
import { useFavoriteStore } from '../../store/favoriteStore'
import { useTripStore } from '../../store/tripStore'
import { useCommunityStore } from '../../store/communityStore'
import toast from '../../utils/msg'

const router = useRouter()
const auth = useAuthStore()
const fav = useFavoriteStore()
const trip = useTripStore()
const comm = useCommunityStore()

const go = (path) => { if (path) router.push(path) }

const level = computed(() => fav.state.foods.length + fav.state.spots.length > 5 ? '达人' : '爱好者')

const stats = computed(() => [
    {
        key: 'trip', label: '已规划行程', to: '/planner',
        value: trip.state.myTrips.length,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5L12 3z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>`
    },
    {
        key: 'pack', label: '已打包方案', to: '/packing',
        value: fav.state.packs.length,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="12" height="17" rx="2" stroke="#fff" stroke-width="2"/><path d="M9 4V2h6v2" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>`
    },
    {
        key: 'fav', label: '好物收藏', to: '/favorites',
        value: fav.state.routes.length + fav.state.foods.length + fav.state.spots.length + fav.state.hotels.length + fav.state.posts.length,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>`
    },
    {
        key: 'post', label: '发布作品', to: '/community',
        value: comm.myPosts.value.length,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`
    }
])

// 弹窗相关
const showModal = ref(false)
const modalTab = ref('basic')
const temp = reactive({ name: '', avatar: '', sign: '', origin: '', budget: '', interests: [] })

const avatars = ['✈️', '🧭', '🌙', '🌊', '🏔️', '🏕️', '🚗', '📷', '🎒', '🛡️', '🧳', '🗺️']
const hotCities = ['南昌', '成都', '北京', '上海', '杭州', '重庆', '西安', '三亚']
const interestOpts = ['自然风光', '历史人文', '美食探店', '小众打卡', '网红打卡', '住宿体验', '海岛度假', '亲子旅行', '徒步登山', '摄影']

const openProfile = (tab) => {
    modalTab.value = tab
    // 从 authStore 复制当前值到 temp
    temp.name = auth.state.name || ''
    temp.avatar = auth.state.avatar || '✈️'
    temp.sign = auth.state.sign || ''
    temp.origin = auth.state.origin || ''
    temp.budget = auth.state.budget || ''
    temp.interests = [...(auth.state.interests || [])]
    showModal.value = true
}

const toggleInterest = (t) => {
    const i = temp.interests.indexOf(t)
    if (i >= 0) temp.interests.splice(i, 1)
    else temp.interests.push(t)
}

const onSave = () => {
    if (!temp.name.trim()) { toast.error('昵称不能为空'); return }
    auth.updateProfile({
        name: temp.name.trim(),
        avatar: temp.avatar,
        sign: temp.sign.trim(),
        origin: temp.origin.trim(),
        budget: temp.budget,
        interests: [...temp.interests]
    })
    toast.success('✅ 资料已更新')
    showModal.value = false
}
</script>

<style scoped>
.pb-wrap { position: relative; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(35, 116, 221, 0.12); }
.pb-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #e8f0ff 0%, #fff 40%, #f0f7ff 100%); overflow: hidden; }
.pb-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.35; }
.pb-blob.b1 { width: 320px; height: 320px; top: -80px; right: -60px; background: radial-gradient(circle, #2374DD, transparent 70%); }
.pb-blob.b2 { width: 240px; height: 240px; bottom: -50px; left: -40px; background: radial-gradient(circle, #0EA5A4, transparent 70%); opacity: 0.25; }
.pb-blob.b3 { width: 200px; height: 200px; top: 20%; left: 40%; background: radial-gradient(circle, #E8912F, transparent 70%); opacity: 0.18; }

/* 3D 漂浮装饰 */
.pb-3d-compass { position: absolute; top: 15%; right: 38%; animation: pbFloat1 6s ease-in-out infinite; }
.pb-3d-globe { position: absolute; bottom: 18%; right: 12%; animation: pbFloat2 7s ease-in-out infinite; }
.pb-3d-map { position: absolute; top: 25%; right: 8%; animation: pbFloat3 5s ease-in-out infinite; }

@keyframes pbFloat1 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(8deg); } }
@keyframes pbFloat2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(-5deg); } }
@keyframes pbFloat3 { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-10px) rotate(5deg); } }

.pb-content { position: relative; padding: 28px 36px; display: flex; align-items: center; justify-content: space-between; gap: 30px; }
.pb-user { display: flex; align-items: center; gap: 22px; }
.avatar-wrap { position: relative; width: 82px; height: 82px; flex-shrink: 0; }
.avatar-ring { position: absolute; inset: -4px; border-radius: 50%; background: linear-gradient(135deg, #2374DD, #0EA5A4, #E8912F); padding: 3px; box-shadow: 0 0 0 1px rgba(255,255,255,0.8); }
.avatar { width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, #2374DD, #4a90e8); display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; }
.avatar-fallback { color: #fff; font-size: 36px; }
.avatar-badge { position: absolute; bottom: 2px; right: 2px; width: 26px; height: 26px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }

.pb-user-info { min-width: 0; }
.pb-name { font-size: 22px; font-weight: 700; color: #1a2a4a; display: flex; align-items: center; gap: 10px; }
.pb-badge { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 10px; background: linear-gradient(135deg, #2374DD, #4a90e8); color: #fff; white-space: nowrap; }
.pb-sign { font-size: 13px; color: #566a8a; margin-top: 6px; }
.pb-btns { display: flex; gap: 10px; margin-top: 14px; }

.btn-outline { padding: 7px 16px; border-radius: 8px; border: 1px solid rgba(35,116,221,0.4); background: rgba(255,255,255,0.6); color: #2374DD; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.btn-outline:hover { background: #fff; border-color: #2374DD; }
.btn-solid { padding: 7px 16px; border-radius: 8px; border: none; background: linear-gradient(135deg, #2374DD, #4a90e8); color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; box-shadow: 0 4px 12px rgba(35,116,221,0.35); transition: all 0.15s; }
.btn-solid:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(35,116,221,0.45); }

.pb-stats { display: flex; gap: 14px; }
.stat-card { background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border-radius: 14px; padding: 16px 20px; width: 120px; text-align: center; box-shadow: 0 4px 16px rgba(35,116,221,0.08); border: 1px solid rgba(255,255,255,0.8); transition: all 0.2s ease; cursor: pointer; }
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(35,116,221,0.15); }
.stat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; background: linear-gradient(135deg, #2374DD, #4a90e8); }
.stat-icon.ic-pack { background: linear-gradient(135deg, #0EA5A4, #38bdbb); }
.stat-icon.ic-fav { background: linear-gradient(135deg, #e94560, #ff6b81); }
.stat-icon.ic-post { background: linear-gradient(135deg, #E8912F, #f2b15c); }
.stat-num { font-size: 24px; font-weight: 700; color: #1a2a4a; line-height: 1; }
.stat-label { font-size: 11.5px; color: #6b7c9a; margin-top: 5px; }
.stat-hint { font-size: 10.5px; color: #2374DD; margin-top: 6px; opacity: 0; transform: translateY(4px); transition: all 0.2s; }
.stat-card:hover .stat-hint { opacity: 1; transform: translateY(0); }

/* ===== 弹窗 ===== */
.pp-modal { width: 480px; background: #fff; border-radius: 18px; box-shadow: 0 24px 60px rgba(0,0,0,0.2); max-height: 85vh; overflow: hidden; display: flex; flex-direction: column; }
.pp-head { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; border-bottom: 1px solid var(--divider); }
.pp-title { font-size: 16px; font-weight: 700; color: var(--text-1); }
.pp-close { color: var(--text-3); cursor: pointer; font-size: 18px; }
.pp-close:hover { color: var(--danger); }

.pp-tabs { display: flex; gap: 4px; padding: 12px 22px; background: #f7f9fc; border-bottom: 1px solid var(--divider); }
.pp-tab { flex: 1; text-align: center; padding: 8px; font-size: 13px; border-radius: 8px; cursor: pointer; color: var(--text-2); transition: all 0.15s; }
.pp-tab.active { background: #fff; color: var(--brand); font-weight: 600; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }

.pp-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }

.pp-field { display: flex; flex-direction: column; gap: 6px; }
.pp-label { font-size: 12.5px; font-weight: 600; color: var(--text-1); }

.pp-avatars { display: flex; flex-wrap: wrap; gap: 8px; }
.pp-avatar-opt { width: 40px; height: 40px; border-radius: 10px; background: #f2f4f7; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; border: 2px solid transparent; transition: all 0.12s; }
.pp-avatar-opt:hover { background: #e8f0ff; }
.pp-avatar-opt.active { border-color: var(--brand); background: var(--brand-light); }

.pp-textarea { resize: none; font-size: 13px; }
.pp-counter { font-size: 11px; color: var(--text-3); text-align: right; }

.pp-select { height: 36px; font-size: 13px; }

.pp-interests { display: flex; flex-wrap: wrap; gap: 8px; }
.pp-interest { padding: 5px 14px; font-size: 12.5px; border-radius: 14px; background: #f2f4f7; color: var(--text-2); cursor: pointer; transition: all 0.12s; }
.pp-interest:hover { background: #e8f0ff; }
.pp-interest.active { background: var(--brand); color: #fff; }

.pp-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 22px; border-top: 1px solid var(--divider); background: #fafbfd; }
</style>
