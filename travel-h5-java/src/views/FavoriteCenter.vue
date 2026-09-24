<template>
  <div class="fav-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">个人收藏</h1>
        <p class="page-desc">收藏路线、酒店、美食、景点与物品包，随时调用</p>
      </div>
    </header>

    <!-- 4 个收藏卡片，可上下滑动 -->
    <div class="fav-grid">
      <!-- ============ 路线收藏 ============ -->
      <div class="fav-card pc-card">
        <div class="fc-head">
          <div class="fc-title">
            <span class="fc-ico">🧭</span> 收藏路线
          </div>
          <span class="fc-count">{{ state.routes.length }}</span>
        </div>

        <div class="fc-scroll" v-if="state.routes.length">
          <div
            v-for="r in state.routes"
            :key="r.id"
            class="fc-row route-row"
            @click="openRoute(r)"
          >
            <img
              v-if="r.img && !r.imgFailed"
              class="fcr-badge fcr-img"
              :src="r.img"
              alt=""
              @error="r.imgFailed = true"
            >
            <div v-else class="fcr-badge">
              {{ r.routeData.dayPlans.length }}D
            </div>
            <div class="fcr-main">
              <div class="fcr-name">{{ r.name }}</div>
              <div class="fcr-sub">
                <span>💰 ¥{{ r.routeData.estimatedCost }}</span>
                <span>·</span>
                <span>{{ r.savedAt }} 收藏</span>
              </div>
            </div>
            <div class="fcr-remove" @click.stop="removeRoute(r.id)">✕</div>
          </div>
        </div>
        <div class="fc-empty" v-else>
          <span class="fe-emoji">🗺️</span>
          <p>在行程规划页收藏路线方案</p>
        </div>
      </div>

      <!-- ============ 美食收藏 ============ -->
      <div class="fav-card pc-card">
        <div class="fc-head">
          <div class="fc-title">
            <span class="fc-ico">🍜</span> 美食收藏
          </div>
          <span class="fc-count fc-food">{{ state.foods.length }}</span>
        </div>

        <div class="fc-scroll" v-if="state.foods.length">
          <div
            v-for="r in state.foods"
            :key="r.id"
            class="fc-row food-row"
            @click="openFood(r)"
          >
            <img v-if="r.img && !r.imgFailed" class="fcr-badge fcr-img" :src="r.img" alt="" @error="r.imgFailed = true">
            <div v-else class="fcr-badge fc-badge-food">🍜</div>
            <div class="fcr-main">
              <div class="fcr-name">{{ r.name }}</div>
              <div class="fcr-sub">
                <span class="star">★</span> {{ r.rating }}
                <span>·</span>
                <span>{{ r.priceText || ('¥' + r.refPrice) }}</span>
              </div>
            </div>
            <div class="fcr-remove" @click.stop="removeFood(r.id)">✕</div>
          </div>
        </div>
        <div class="fc-empty" v-else>
          <span class="fe-emoji">🍽️</span>
          <p>在榜单或路线推荐中收藏美食</p>
        </div>
      </div>

      <!-- ============ 景点收藏 ============ -->
      <div class="fav-card pc-card">
        <div class="fc-head">
          <div class="fc-title">
            <span class="fc-ico">🏔️</span> 景点收藏
          </div>
          <span class="fc-count fc-view">{{ state.spots.length }}</span>
        </div>

        <div class="fc-scroll" v-if="state.spots.length">
          <div
            v-for="r in state.spots"
            :key="r.id"
            class="fc-row spot-row"
            @click="openSpot(r)"
          >
            <img v-if="r.img && !r.imgFailed" class="fcr-badge fcr-img" :src="r.img" alt="" @error="r.imgFailed = true">
            <div v-else class="fcr-badge fc-badge-spot">🏔️</div>
            <div class="fcr-main">
              <div class="fcr-name">{{ r.name }}</div>
              <div class="fcr-sub">
                <span class="star">★</span> {{ r.rating }}
                <span>·</span>
                <span>{{ r.priceText }}</span>
              </div>
            </div>
            <div class="fcr-remove" @click.stop="removeSpot(r.id)">✕</div>
          </div>
        </div>
        <div class="fc-empty" v-else>
          <span class="fe-emoji">⛰️</span>
          <p>在榜单或路线推荐中收藏景点</p>
        </div>
      </div>

      <!-- ============ 酒店收藏 ============ -->
      <div class="fav-card pc-card">
        <div class="fc-head">
          <div class="fc-title">
            <span class="fc-ico">🏨</span> 酒店收藏
          </div>
          <span class="fc-count fc-hotel">{{ state.hotels.length }}</span>
        </div>

        <div class="fc-scroll" v-if="state.hotels.length">
          <div
            v-for="r in state.hotels"
            :key="r.id"
            class="fc-row hotel-row"
            @click="openHotel(r)"
          >
            <img v-if="r.img && !r.imgFailed" class="fcr-badge fcr-img" :src="r.img" alt="" @error="r.imgFailed = true">
            <div v-else class="fcr-badge fc-badge-hotel">🏨</div>
            <div class="fcr-main">
              <div class="fcr-name">{{ r.name }}</div>
              <div class="fcr-sub">
                <span class="star">★</span> {{ r.rating }}
                <span>·</span>
                <span>{{ r.priceText }}</span>
              </div>
            </div>
            <div class="fcr-remove" @click.stop="removeHotel(r.id)">✕</div>
          </div>
        </div>
        <div class="fc-empty" v-else>
          <span class="fe-emoji">🏨</span>
          <p>在榜单排行中收藏心仪酒店</p>
        </div>
      </div>

      <!-- ============ 物品包 ============ -->
      <div class="fav-card pc-card">
        <div class="fc-head">
          <div class="fc-title">
            <span class="fc-ico">🎒</span> 物品包
          </div>
          <span class="fc-count fc-pack">{{ state.packs.length }}</span>
        </div>

        <div class="fc-scroll" v-if="state.packs.length">
          <div
            v-for="r in state.packs"
            :key="r.id"
            class="fc-row pack-row"
            @click="openPack(r)"
          >
            <img v-if="r.img && !r.imgFailed" class="fcr-badge fcr-img" :src="r.img" alt="" @error="r.imgFailed = true">
            <div v-else class="fcr-badge fc-badge-pack">🎒</div>
            <div class="fcr-main">
              <div class="fcr-name">{{ r.name }}</div>
              <div class="fcr-sub">
                <span>{{ r.categoryList.length }} 类物品</span>
                <span>·</span>
                <span>{{ r.savedAt }}</span>
              </div>
            </div>
            <div class="fcr-remove" @click.stop="removePack(r.id)">✕</div>
          </div>
        </div>
        <div class="fc-empty" v-else>
          <span class="fe-emoji">🧳</span>
          <p>在行李清单页保存物品包</p>
        </div>
      </div>

      <!-- ============ 帖子收藏 ============ -->
      <div class="fav-card pc-card">
        <div class="fc-head">
          <div class="fc-title">
            <span class="fc-ico">📝</span> 帖子收藏
          </div>
          <span class="fc-count fc-post">{{ state.posts.length }}</span>
        </div>

        <div class="fc-scroll" v-if="state.posts.length">
          <div
            v-for="p in state.posts"
            :key="p.id"
            class="fc-row post-row"
            @click="openPost(p)"
          >
            <img v-if="p.images?.[0]" class="fcr-badge fcr-img" :src="p.images[0]" alt="" @error="$event.target.style.opacity='0.4'">
            <div v-else class="fcr-badge fc-badge-post">{{ p.avatar || '📝' }}</div>
            <div class="fcr-main">
              <div class="fcr-name">{{ p.title }}</div>
              <div class="fcr-sub">
                <span>{{ p.author }} · {{ p.city }}</span>
                <span>·</span>
                <span>👍 {{ p.likes }} · 💬 {{ p.comments }}</span>
              </div>
            </div>
            <div class="fcr-remove" @click.stop="removePost(p.id)">✕</div>
          </div>
        </div>
        <div class="fc-empty" v-else>
          <span class="fe-emoji">📝</span>
          <p>在旅友空间收藏喜欢的帖子吧</p>
        </div>
      </div>
    </div>

    <!-- ============ 详情弹窗 ============ -->
    <teleport to="body">
      <div class="pc-mask" v-if="detail.show" @click.self="detail.show = false">
        <div class="pc-modal detail-modal" :class="'dm-' + detail.type">
          <div class="pc-modal-header">
            <div class="cm-head">
              <span class="pc-modal-title">{{ detail.title }}</span>
              <span class="dm-meta" v-if="detail.meta">{{ detail.meta }}</span>
            </div>
            <span class="pc-modal-close" @click="detail.show = false">✕</span>
          </div>
          <div class="pc-modal-body detail-body">
            <!-- 详情头图 -->
            <div class="dm-cover" v-if="detail.data?.img || detail.data?.images?.[0]">
              <img :src="detail.data.img || detail.data.images[0]" alt="" @error="$event.target.parentElement.style.display='none'">
            </div>
            <!-- 路线详情 -->
            <template v-if="detail.type === 'route'">
              <div class="dm-section">
                <div class="dm-label">💡 亮点</div>
                <p class="dm-p">{{ detail.data.routeData.summary }}</p>
                <div class="dm-tags">
                  <span class="pc-tag pc-tag-gray" v-for="t in detail.data.routeData.tags" :key="t">{{ t }}</span>
                </div>
              </div>
              <div class="dm-section">
                <div class="dm-label">📅 每日行程</div>
                <div class="dm-day" v-for="d in detail.data.routeData.dayPlans" :key="d.dayNo">
                  <div class="dm-day-head">
                    <span class="dm-day-no">D{{ d.dayNo }}</span>
                    <span class="dm-day-title">{{ d.dayTitle }}</span>
                  </div>
                  <div class="dm-points">
                    <div class="dm-point" v-for="(p, i) in d.points" :key="i">
                      <span class="dm-pt-type pt-{{ p.pointType }}">{{ p.pointType }}</span>
                      <span class="dm-pt-name">{{ p.name }}</span>
                      <span class="dm-pt-note">{{ p.note }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- 食物/景点详情 -->
            <template v-else-if="detail.type === 'spot' || detail.type === 'food' || detail.type === 'hotel'">
              <div class="dm-kw-box" v-if="detail.data.keywords">
                <span class="kw-label">关键词</span>
                <span class="kw-chip" v-for="k in detail.data.keywords" :key="k">{{ k }}</span>
              </div>
              <template v-if="detail.data.category">
                <div class="dm-desc" v-if="detail.data.feature || detail.data.reason">
                  <p v-if="detail.data.feature">特色：{{ detail.data.feature }}</p>
                  <p v-if="detail.data.reason">推荐理由：{{ detail.data.reason }}</p>
                </div>
              </template>

              <div class="dm-label dm-cmt-title">💬 评论 ({{ (detail.data.comments || []).length }})</div>
              <div class="comment-list dm-cmt">
                <div class="comment-item" v-for="c in (detail.data.comments || []).slice(0, 10)" :key="c.id">
                  <div class="c-head">
                    <span class="c-user">{{ c.reviewer }}</span>
                    <span class="c-date">{{ c.date }}</span>
                  </div>
                  <p class="c-text">{{ c.content }}</p>
                </div>
                <div class="dm-cmt-empty" v-if="!(detail.data.comments || []).length">暂无评论</div>
              </div>
            </template>

            <!-- 物品包详情 -->
            <template v-else-if="detail.type === 'pack'">
              <p class="dm-p" v-if="detail.data.note">{{ detail.data.note }}</p>
              <div class="dm-day" v-for="cat in detail.data.categoryList" :key="cat.categoryName">
                <div class="dm-day-head">
                  <span class="dm-day-no">📦</span>
                  <span class="dm-day-title">{{ cat.categoryName }}</span>
                  <span class="dm-count">{{ cat.itemList.length }} 件</span>
                </div>
                <div class="dm-points">
                  <div class="dm-point" v-for="(p, i) in cat.itemList" :key="i">
                    <span class="dm-pt-type">×{{ p.quantity }}</span>
                    <span class="dm-pt-name">{{ p.itemName }}</span>
                    <span class="dm-pt-note">{{ p.remark }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- 帖子详情 -->
            <template v-else-if="detail.type === 'post'">
              <div class="dm-post-head">
                <span class="dp-avatar">{{ detail.data.avatar || '📝' }}</span>
                <div class="dp-author">
                  <div class="dp-name">{{ detail.data.author }}</div>
                  <div class="dp-sub">{{ detail.data.city }} · {{ detail.data.cat }} · 收藏于 {{ detail.data.savedAt }}</div>
                </div>
                <div class="dp-stats">
                  <span>👍 {{ detail.data.likes }}</span>
                  <span>💬 {{ detail.data.comments }}</span>
                </div>
              </div>
              <p class="dm-p dm-post-content">{{ detail.data.content }}</p>
              <div class="dm-post-gallery" v-if="(detail.data.images || []).length">
                <img
                  v-for="(img, i) in detail.data.images"
                  :key="i"
                  :src="img"
                  alt=""
                  @error="$event.target.style.opacity='0.3'"
                >
              </div>
              <div class="dm-tags" v-if="(detail.data.tags || []).length">
                <span class="pc-tag pc-tag-gray" v-for="t in detail.data.tags" :key="t"># {{ t }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useFavoriteStore } from '../store/favoriteStore'

const { state, removeRoute, removeFood, removeSpot, removeHotel, removePack, removePost } = useFavoriteStore()

const detail = reactive({ show: false, type: '', title: '', data: null, meta: '' })

const openRoute = (r) => {
    detail.show = true
    detail.type = 'route'
    detail.title = r.name
    detail.meta = `${r.routeData.dayPlans.length} 天 · ¥${r.routeData.estimatedCost}`
    detail.data = r
}

const openFood = (r) => {
    detail.show = true
    detail.type = 'food'
    detail.title = r.name
    detail.meta = `★ ${r.rating} · ${r.priceText || ('¥' + r.refPrice)}`
    detail.data = r
}

const openSpot = (r) => {
    detail.show = true
    detail.type = 'spot'
    detail.title = r.name
    detail.meta = `★ ${r.rating} · ${r.priceText}`
    detail.data = r
}

const openHotel = (r) => {
    detail.show = true
    detail.type = 'hotel'
    detail.title = r.name
    detail.meta = `★ ${r.rating} · ${r.priceText}`
    detail.data = r
}

const openPack = (r) => {
    detail.show = true
    detail.type = 'pack'
    detail.title = r.name
    detail.meta = `${r.categoryList.length} 类物品`
    detail.data = r
}

const openPost = (p) => {
    detail.show = true
    detail.type = 'post'
    detail.title = p.title
    detail.meta = `${p.author} · ${p.city} · ${p.cat}`
    detail.data = p
}
</script>

<style scoped>
.fav-page {
    height: 100%;
    overflow-y: auto;
    padding: 22px 26px;
}

.page-header { margin-bottom: 18px; }
.page-title { font-size: 21px; font-weight: 700; }
.page-desc { font-size: 13px; color: var(--text-3); margin-top: 6px; }

/* -------- 四宫格 -------- */
.fav-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.fav-card {
    display: flex;
    flex-direction: column;
    min-height: 380px;
    max-height: calc(100vh - 220px);
    overflow: hidden;
}

.fc-head {
    display: flex;
    align-items: center;
    padding: 14px 18px;
    border-bottom: 1px solid var(--divider);
    flex-shrink: 0;
}

.fc-title {
    font-size: 15px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--text-1);
}

.fc-ico { font-size: 16px; }

.fc-count {
    margin-left: auto;
    min-width: 28px;
    text-align: center;
    font-size: 12.5px;
    font-weight: 600;
    background: var(--brand-light);
    color: var(--brand);
    padding: 2px 10px;
    border-radius: 12px;
}

.fc-count.fc-food { background: var(--danger-bg); color: var(--cat-food); }
.fc-count.fc-view { background: var(--warning-bg); color: var(--cat-view); }
.fc-count.fc-hotel { background: var(--brand-light); color: var(--brand); }
.fc-count.fc-pack { background: #f0ebfe; color: var(--cat-fun); }

/* -------- 可滚动列表 -------- */
.fc-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 6px 10px 10px;
}

.fc-scroll::-webkit-scrollbar { width: 6px; }
.fc-scroll::-webkit-scrollbar-thumb { background: #dde3ea; border-radius: 3px; }

.fc-row {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 12px;
    border-radius: 9px;
    cursor: pointer;
    transition: background 0.15s;
    position: relative;
}

.fc-row:hover {
    background: var(--brand-lighter);
}

.fcr-badge {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--brand-light);
    color: var(--brand);
    font-weight: 700;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.fc-badge-food { background: var(--danger-bg); color: var(--cat-food); }
.fc-badge-spot { background: var(--warning-bg); color: var(--cat-view); }
.fc-badge-hotel { background: var(--brand-light); color: var(--brand); }
.fc-badge-pack { background: #f0ebfe; color: var(--cat-fun); }

/* 真实图片徽章 */
.fcr-img {
    object-fit: cover;
    border: 1px solid var(--divider);
    background: #f5f7fa;
}

.fcr-main {
    flex: 1;
    min-width: 0;
}

.fcr-name {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.fcr-sub {
    font-size: 11.5px;
    color: var(--text-3);
    margin-top: 3px;
    display: flex;
    gap: 6px;
    align-items: center;
}

.star { color: #f5a623; }

.fcr-remove {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: var(--text-3);
    opacity: 0;
    transition: all 0.15s;
    flex-shrink: 0;
}

.fc-row:hover .fcr-remove { opacity: 1; }
.fcr-remove:hover { background: #fdecec; color: var(--danger); }

/* 空态 */
.fc-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-3);
    font-size: 13px;
    gap: 10px;
}

.fe-emoji { font-size: 36px; }

/* -------- 详情弹窗 -------- */
.detail-modal { width: 600px; max-height: 80vh; }
.detail-body { max-height: calc(80vh - 70px); overflow-y: auto; padding: 18px 22px 22px; }

.dm-section { margin-bottom: 18px; }

/* 详情头图 */
.dm-cover {
    margin: -18px -22px 16px;
    height: 220px;
    overflow: hidden;
    background: #f5f7fa;
}
.dm-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* 帖子详情 */
.dm-post-head {
    display: flex;
    align-items: center;
    gap: 11px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--divider);
    margin-bottom: 14px;
}
.dp-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--brand-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
}
.dp-name { font-size: 14px; font-weight: 700; color: var(--text-1); }
.dp-sub { font-size: 12px; color: var(--text-3); margin-top: 2px; }
.dp-stats { margin-left: auto; display: flex; gap: 12px; font-size: 12.5px; color: var(--text-2); }
.dm-post-content { font-size: 14px; line-height: 1.8; margin-bottom: 14px; }
.dm-post-gallery {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 14px;
}
.dm-post-gallery img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid var(--divider);
    background: #f5f7fa;
}
.dm-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-1);
    margin-bottom: 8px;
}
.dm-p { font-size: 13.5px; color: var(--text-2); line-height: 1.7; margin: 0; }
.dm-tags { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.dm-desc p { font-size: 13px; color: var(--text-2); line-height: 1.7; margin: 4px 0; }

.dm-day { margin-bottom: 14px; }
.dm-day-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
}
.dm-day-no {
    background: var(--brand);
    color: #fff;
    font-size: 11.5px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 5px;
}
.dm-day-title { font-size: 13.5px; font-weight: 600; }
.dm-count { margin-left: auto; font-size: 12px; color: var(--text-3); }

.dm-points {
    padding-left: 4px;
    border-left: 2px solid var(--divider);
    margin-left: 6px;
    padding-left: 14px;
}

.dm-point {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
}
.dm-pt-type {
    font-size: 11px;
    padding: 2px 7px;
    border-radius: 4px;
    background: #f2f4f7;
    color: var(--text-2);
}
.pt-景点 { background: var(--warning-bg); color: var(--cat-view); }
.pt-美食, .pt-餐饮 { background: var(--danger-bg); color: var(--cat-food); }
.pt-酒店 { background: var(--brand-light); color: var(--brand); }
.pt-娱乐 { background: #f0ebfe; color: var(--cat-fun); }

.dm-pt-name { font-size: 13px; font-weight: 600; color: var(--text-1); }
.dm-pt-note { font-size: 12px; color: var(--text-3); margin-left: auto; max-width: 50%; text-align: right; }

/* 关键词 */
.dm-kw-box {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--divider);
    margin-bottom: 14px;
}
.kw-label { font-size: 12.5px; color: var(--text-3); }
.kw-chip { font-size: 12px; color: var(--brand); background: var(--brand-light); padding: 3px 10px; border-radius: 12px; }

/* 评论 */
.dm-cmt-title { margin-top: 8px; }
.comment-list { display: flex; flex-direction: column; gap: 2px; }
.comment-item {
    padding: 11px 0;
    border-bottom: 1px solid var(--divider);
}
.c-head { display: flex; justify-content: space-between; margin-bottom: 5px; }
.c-user { font-size: 13px; font-weight: 600; color: var(--text-1); }
.c-date { font-size: 12px; color: var(--text-3); }
.c-text { font-size: 13px; color: var(--text-2); line-height: 1.65; margin: 0; }
.dm-cmt-empty { text-align: center; color: var(--text-3); padding: 14px; font-size: 13px; }
</style>
