<template>
  <teleport to="body">
    <div class="pc-mask" v-if="show" @click.self="emit('close')">
      <div class="pm-modal" @click.stop>
        <div class="pm-header">
          <span class="pm-title">✍️ 发布我的旅途</span>
          <span class="pm-close" @click="emit('close')">✕</span>
        </div>

        <div class="pm-body">
          <!-- Tab 切换 -->
          <div class="pm-tabs">
            <span
              v-for="t in tabs"
              :key="t.key"
              class="pm-tab"
              :class="{ active: form.tab === t.key }"
              @click="form.tab = t.key"
            >{{ t.label }}</span>
          </div>

          <!-- 内容输入 -->
          <div class="pm-field">
            <label class="pm-label">标题 <span class="req">*</span></label>
            <input class="pc-input pm-input" v-model="form.title" placeholder="起个吸引人的标题，比如「南昌 4 天 3 夜深度攻略」" maxlength="40">
          </div>

          <div class="pm-field">
            <label class="pm-label">正文内容 <span class="req">*</span> <span class="pm-count">{{ form.content.length }}/500</span></label>
            <textarea class="pc-input pm-textarea" v-model="form.content" rows="5" maxlength="500"
              placeholder="分享你的真实体验——路线安排、踩坑经验、美食推荐……"></textarea>
          </div>

          <!-- 图片上传区 -->
          <div class="pm-field">
            <label class="pm-label">配图（可选，最多 6 张）</label>
            <div class="pm-imgs">
              <div v-for="(img, i) in form.images" :key="i" class="pm-img-item">
                <img :src="img" alt="">
                <span class="pm-img-del" @click="form.images.splice(i, 1)">✕</span>
              </div>
              <div v-if="form.images.length < 6" class="pm-img-add" @click="addImg">
                <span class="pm-add-plus">+</span>
                <span class="pm-add-text">添加图片</span>
              </div>
            </div>
          </div>

          <!-- 城市选择 -->
          <div class="pm-field">
            <label class="pm-label">所在城市</label>
            <input class="pc-input pm-input" list="pm-cities" v-model="form.city" placeholder="选择或输入城市">
            <datalist id="pm-cities">
              <option v-for="c in store.HOT_CITIES" :key="c" :value="c"></option>
            </datalist>
            <div class="pm-city-quick">
              <span v-for="c in store.HOT_CITIES" :key="c" class="pm-city-chip"
                :class="{ active: form.city === c }" @click="form.city = c">{{ c }}</span>
            </div>
          </div>

          <!-- 分类标签 -->
          <div class="pm-field">
            <label class="pm-label">内容分类</label>
            <div class="pm-tags">
              <span v-for="c in catOptions" :key="c" class="pm-tag"
                :class="{ active: form.cat === c }" @click="form.cat = c">{{ c }}</span>
            </div>
          </div>

          <div class="pm-field">
            <label class="pm-label">自定义标签（可选，最多 3 个）</label>
            <div class="pm-tags">
              <span v-for="(t, i) in form.tags" :key="i" class="pm-tag active">
                {{ t }} <span class="pm-tag-x" @click="form.tags.splice(i, 1)">✕</span>
              </span>
              <input v-if="form.tags.length < 3" class="pc-input pm-tag-input"
                v-model="tagInput" placeholder="输入标签回车添加" @keyup.enter="addTag">
            </div>
          </div>

          <!-- 关联 -->
          <div class="pm-field">
            <label class="pm-label">关联内容（可选）</label>
            <div class="pm-link-box">
              <label class="pm-link-check">
                <input type="checkbox" v-model="form.linkTrip">
                <span>🧭 关联我的行程方案</span>
              </label>
              <label class="pm-link-check">
                <input type="checkbox" v-model="form.linkFav">
                <span>❤️ 关联我的收藏场所</span>
              </label>
            </div>
          </div>

          <!-- 权限 -->
          <div class="pm-field">
            <label class="pm-label">可见性</label>
            <div class="pm-perm">
              <label class="pm-perm-opt">
                <input type="radio" v-model="form.perm" value="public">
                <span>🌐 公开（所有人可见）</span>
              </label>
              <label class="pm-perm-opt">
                <input type="radio" v-model="form.perm" value="private">
                <span>🔒 仅自己可见</span>
              </label>
            </div>
          </div>
        </div>

        <div class="pm-footer">
          <span class="pm-tip">提交后进入管理员审核队列 ✅</span>
          <div class="pm-actions">
            <button class="pc-btn" @click="emit('close')">取消</button>
            <button class="pc-btn pc-btn-primary" :disabled="!canSubmit" @click="onSubmit">发布动态</button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useCommunityStore } from '../../store/communityStore'
import toast from '../../utils/msg'

defineProps({ show: Boolean })
const emit = defineEmits(['close', 'posted'])

const store = useCommunityStore()

const tabs = [
    { key: 'photo', label: '📖 图文游记' },
    { key: 'guide', label: '💡 纯攻略' },
    { key: 'warn', label: '⚠️ 避坑吐槽' }
]

const catOptions = ['行程攻略', '美食探店', '景点打卡', '住宿体验', '避雷避坑']

const form = reactive({
    tab: 'photo',
    title: '',
    content: '',
    images: [],
    city: '',
    cat: '行程攻略',
    tags: [],
    linkTrip: false,
    linkFav: false,
    perm: 'public'
})

const tagInput = ref('')

const canSubmit = computed(() => form.title.trim() && form.content.trim())

const addImg = () => {
    const kw = ['chinese,food', 'hotel,bedroom', 'scenic,view', 'hotpot', 'china,pagoda', 'travel,landscape']
    form.images.push(`https://loremflickr.com/600/400/${kw[Math.floor(Math.random() * kw.length)]}?lock=${Date.now()}`)
}

const addTag = () => {
    const t = tagInput.value.trim()
    if (t && !form.tags.includes(t) && form.tags.length < 3) {
        form.tags.push(t)
        tagInput.value = ''
    }
}

const onSubmit = () => {
    if (!canSubmit.value) return
    const post = store.addPost({
        cat: form.cat,
        title: form.title.trim(),
        content: form.content.trim(),
        images: [...form.images],
        city: form.city || '未指定',
        tags: [...form.tags],
        hasTrip: form.linkTrip,
        tripName: form.linkTrip ? '我的行程' : '',
        hasSpot: form.linkFav,
        spotName: form.linkFav ? '我的收藏' : '',
        status: form.perm === 'private' ? 'approved' : 'pending'
    })
    toast.success(form.perm === 'private' ? '已保存（仅自己可见）' : '🎉 发布成功，进入管理员审核')
    // 重置
    form.tab = 'photo'; form.title = ''; form.content = ''; form.images = []
    form.city = ''; form.tags = []; form.linkTrip = false; form.linkFav = false
    form.perm = 'public'
    emit('posted', post)
    emit('close')
}
</script>

<style scoped>
.pm-modal {
    width: 580px;
    max-height: 86vh;
    overflow-y: auto;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
}

.pm-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 22px;
    border-bottom: 1px solid var(--divider);
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 1;
    border-radius: 18px 18px 0 0;
}

.pm-title { font-size: 16px; font-weight: 700; color: var(--text-1); }
.pm-close { color: var(--text-3); cursor: pointer; font-size: 18px; }
.pm-close:hover { color: var(--danger); }

.pm-body { padding: 18px 22px; display: flex; flex-direction: column; gap: 14px; }

.pm-tabs {
    display: flex;
    gap: 8px;
    padding: 4px;
    background: #f2f4f7;
    border-radius: 10px;
}

.pm-tab {
    flex: 1;
    text-align: center;
    padding: 8px 12px;
    font-size: 13px;
    border-radius: 8px;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.15s;
}

.pm-tab.active {
    background: #fff;
    color: var(--brand);
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.pm-field { display: flex; flex-direction: column; gap: 6px; }

.pm-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.req { color: var(--danger); }
.pm-count { font-size: 11.5px; font-weight: 400; color: var(--text-3); }

.pm-input { font-size: 13px; }

.pm-textarea {
    resize: vertical;
    font-size: 13px;
    line-height: 1.6;
}

.pm-imgs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.pm-img-item {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
}

.pm-img-item img { width: 100%; height: 100%; object-fit: cover; }

.pm-img-del {
    position: absolute;
    top: 2px; right: 2px;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.pm-img-add {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    border: 1.5px dashed var(--border);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    cursor: pointer;
    color: var(--text-3);
    transition: all 0.15s;
}

.pm-img-add:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-lighter); }

.pm-add-plus { font-size: 22px; font-weight: 300; }
.pm-add-text { font-size: 11px; }

.pm-city-quick {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.pm-city-chip {
    padding: 3px 10px;
    font-size: 12px;
    border-radius: 10px;
    background: #f2f4f7;
    color: var(--text-2);
    cursor: pointer;
}

.pm-city-chip.active { background: var(--brand); color: #fff; }

.pm-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
}

.pm-tag {
    padding: 4px 12px;
    font-size: 12px;
    border-radius: 10px;
    background: #f2f4f7;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.12s;
}

.pm-tag:hover { background: #e6ebf3; }

.pm-tag.active {
    background: var(--brand-light);
    color: var(--brand);
    font-weight: 500;
}

.pm-tag-x {
    margin-left: 4px;
    font-size: 10px;
    opacity: 0.6;
}

.pm-tag-input {
    width: 140px;
    height: 28px;
    font-size: 12px;
}

.pm-link-box {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.pm-link-check {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-2);
    cursor: pointer;
}

.pm-link-check input { accent-color: var(--brand); }

.pm-perm {
    display: flex;
    gap: 14px;
}

.pm-perm-opt {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-2);
    cursor: pointer;
}

.pm-perm-opt input { accent-color: var(--brand); }

.pm-footer {
    padding: 14px 22px;
    border-top: 1px solid var(--divider);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 0 0 18px 18px;
    background: #fafbfd;
}

.pm-tip { font-size: 12px; color: var(--text-3); }

.pm-actions { display: flex; gap: 8px; }
</style>
