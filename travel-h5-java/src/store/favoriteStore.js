import { reactive, computed, watch } from 'vue'
import { imgMap } from '../utils/imgMap.js'

/**
 * 个人收藏 Store
 * 4 类收藏：routes / foods / spots / packs（物品包）
 * 全部 localStorage 持久化，单文件组件直接调用 addXxx / removeXxx 即可
 */

const STORAGE_KEY = 'pc-favorites-v9'

const defaultState = () => ({
    routes: [],   // { id, routeData(完整route对象), savedAt, name }
    foods: [],    // { id, name, category, distance, rating, refPrice, feature, reason, tags, comments, priceText }
    spots: [],    // { id, name, category, rating, priceText, tags, keywords, comments }
    hotels: [],   // { id, name, rating, priceText, tags, keywords, location, comments }
    packs: [],    // { id, name, categoryList(完整行李分类), savedAt, note }
    posts: []     // { id, 从 community post 深拷贝, savedAt }
})

const state = reactive(defaultState())

// ---- helpers ----

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const now = () => new Date().toISOString().slice(0, 10)
// 简单字符串哈希（用于图片 lock 稳定绑定）
const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0 } return Math.abs(h) }

// 动态收藏配图：优先用 imgMap 真实场所图，未命中回退 picsum.photos
// index.html 已设 no-referrer meta，无需额外处理防盗链
const seedFromStr = (s) => {
    let h = 0
    const str = String(s || 'travel')
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
    return Math.abs(h).toString(36)
}
const genImg = (name, keywords = 'travel') => {
    if (name && imgMap[name]) return imgMap[name]
    const seed = seedFromStr((name || '') + keywords)
    return `https://picsum.photos/seed/${seed}/400/400`
}

// 种子数据配图：先查 imgMap[name]，未命中回退 picsum
// name 直接传场所名（如 '成都大熊猫繁育研究基地'），lock 仅用于 picsum 回退稳定
const lf = (name, lock) => {
    if (name && imgMap[name]) return imgMap[name]
    const seed = seedFromStr((name || '') + lock)
    return `https://picsum.photos/seed/${seed}/400/400`
}

// -------- routes --------
const addRoute = (route, displayName) => {
    if (!route) return false
    const id = `route-${genId()}`
    state.routes.push({
        id,
        name: displayName || route.routeName || '收藏路线',
        img: route.img || genImg(displayName || route.routeName || '旅行路线', 'travel landscape'),
        routeData: JSON.parse(JSON.stringify(route)),
        savedAt: now()
    })
    return id
}
const removeRoute = (id) => {
    const i = state.routes.findIndex(r => r.id === id)
    if (i > -1) state.routes.splice(i, 1)
}
const hasRoute = (routeName) => state.routes.some(r => r.routeData.routeName === routeName)

// -------- foods --------
const addFood = (item) => {
    if (!item) return false
    const id = `food-${genId()}`
    state.foods.push({ id, img: item.img || genImg(item.name, 'chinese food'), ...item, savedAt: now() })
    return id
}
const removeFood = (id) => {
    const i = state.foods.findIndex(r => r.id === id)
    if (i > -1) state.foods.splice(i, 1)
}

// -------- spots --------
const addSpot = (item) => {
    if (!item) return false
    const id = `spot-${genId()}`
    state.spots.push({ id, img: item.img || genImg(item.name, 'scenic landscape'), ...item, savedAt: now() })
    return id
}
const removeSpot = (id) => {
    const i = state.spots.findIndex(r => r.id === id)
    if (i > -1) state.spots.splice(i, 1)
}

// -------- hotels（榜单收藏酒店） --------
const addHotel = (item) => {
    if (!item) return false
    const id = `hotel-${genId()}`
    state.hotels.push({ id, img: item.img || genImg(item.name, 'hotel bedroom'), ...item, savedAt: now() })
    return id
}
const removeHotel = (id) => {
    const i = state.hotels.findIndex(r => r.id === id)
    if (i > -1) state.hotels.splice(i, 1)
}

// -------- packs --------
const addPack = (name, categoryList, note) => {
    if (!categoryList || !categoryList.length) return false
    const id = `pack-${genId()}`
    state.packs.push({
        id,
        name: name || '物品包',
        img: genImg(name || '物品包', 'travel backpack'),
        categoryList: JSON.parse(JSON.stringify(categoryList)),
        note: note || '',
        savedAt: now()
    })
    return id
}
const removePack = (id) => {
    const i = state.packs.findIndex(r => r.id === id)
    if (i > -1) state.packs.splice(i, 1)
}

// -------- 社区帖子收藏 --------
const addPost = (post) => {
    if (!post) return false
    // 去重：按 post.id
    if (state.posts.some(p => p.id === post.id)) return false
    state.posts.push({
        id: post.id,
        title: post.title,
        author: post.author,
        avatar: post.avatar,
        city: post.city,
        cat: post.cat,
        content: post.content,
        images: post.images || [],
        tags: post.tags || [],
        likes: post.likes || 0,
        comments: post.comments || 0,
        savedAt: now()
    })
    return true
}
const removePost = (id) => {
    const i = state.posts.findIndex(p => p.id === id)
    if (i > -1) state.posts.splice(i, 1)
}
const hasPost = (id) => state.posts.some(p => p.id === id)

// ---- 持久化 ----
watch(() => state, () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (e) { /* ignore */ }
}, { deep: true })

const restore = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) { seed(); return }
        Object.assign(state, defaultState(), JSON.parse(raw))
        // 如果全空，也注入示例（用户可能清过）
        if (!state.routes.length && !state.foods.length && !state.spots.length && !state.hotels.length && !state.packs.length) seed()
    } catch (e) { seed() }
}

// ---------------- 示例种子数据 ----------------
const seed = () => {
    state.routes = [
        {
            id: 'seed-route-1', name: '成都经典三日游', savedAt: '2026-09-15',
            img: lf('成都经典三日游', 1),
            routeData: {
                routeName: '成都经典三日游', summary: '宽窄巷子+锦里+熊猫基地，三天玩转成都代表景点与美食',
                tags: ['经典打卡', '美食体验', '熊猫必看'], estimatedCost: 2800,
                dayPlans: [
                    { dayNo: 1, dayTitle: '市区精华', points: [
                        { name: '宽窄巷子', pointType: '景点', timeSlot: '上午', estCost: 0, note: '老成都街巷' },
                        { name: '人民公园', pointType: '景点', timeSlot: '下午', estCost: 0, note: '鹤鸣茶社品茶' },
                        { name: '锦里古街', pointType: '景点', timeSlot: '晚上', estCost: 0, note: '夜景美食' }
                    ]},
                    { dayNo: 2, dayTitle: '熊猫+美食', points: [
                        { name: '熊猫基地', pointType: '景点', timeSlot: '上午', estCost: 55, note: '看萌宠' },
                        { name: '春熙路', pointType: '购物', timeSlot: '下午', estCost: 200, note: '逛街吃龙抄手' },
                        { name: '小龙坎火锅', pointType: '餐饮', timeSlot: '晚上', estCost: 150, note: '地道成都味' }
                    ]},
                    { dayNo: 3, dayTitle: '文化收尾', points: [
                        { name: '武侯祠', pointType: '景点', timeSlot: '上午', estCost: 50, note: '三国文化' },
                        { name: '杜甫草堂', pointType: '景点', timeSlot: '下午', estCost: 50, note: '诗意园林' }
                    ]}
                ]
            }
        },
        {
            id: 'seed-route-2', name: '杭州西湖深度游', savedAt: '2026-09-12',
            img: lf('杭州西湖深度游', 2),
            routeData: {
                routeName: '杭州西湖深度游', summary: '西湖十景+灵隐寺+宋城，感受江南水乡的温婉韵味',
                tags: ['自然风光', '历史人文'], estimatedCost: 3200,
                dayPlans: [
                    { dayNo: 1, dayTitle: '环湖一日', points: [
                        { name: '断桥残雪', pointType: '景点', timeSlot: '上午', estCost: 0, note: '西湖标志' },
                        { name: '雷峰塔', pointType: '景点', timeSlot: '下午', estCost: 40, note: '登顶看全景' }
                    ]},
                    { dayNo: 2, dayTitle: '灵隐寻禅', points: [
                        { name: '灵隐寺', pointType: '景点', timeSlot: '上午', estCost: 75, note: '千年古刹' },
                        { name: '龙井村', pointType: '景点', timeSlot: '下午', estCost: 0, note: '品狮峰龙井' }
                    ]}
                ]
            }
        },
        {
            id: 'seed-route-3', name: '西安美食之旅', savedAt: '2026-08-30',
            img: lf('西安美食之旅', 3),
            routeData: {
                routeName: '西安美食之旅', summary: '回民街+永兴坊+大唐不夜城，一边逛古迹一边吃遍西安名小吃',
                tags: ['美食主题', '历史人文'], estimatedCost: 2600,
                dayPlans: [
                    { dayNo: 1, dayTitle: '古城初探', points: [
                        { name: '钟鼓楼', pointType: '景点', timeSlot: '上午', estCost: 50, note: '古城地标' },
                        { name: '回民街', pointType: '餐饮', timeSlot: '下午', estCost: 100, note: '肉夹馍+羊肉泡馍' },
                        { name: '大唐不夜城', pointType: '景点', timeSlot: '晚上', estCost: 0, note: '夜景灯光秀' }
                    ]},
                    { dayNo: 2, dayTitle: '秦风唐韵', points: [
                        { name: '秦始皇兵马俑', pointType: '景点', timeSlot: '上午', estCost: 120, note: '世界第八大奇迹' },
                        { name: '永兴坊', pointType: '餐饮', timeSlot: '下午', estCost: 80, note: '摔碗酒+陕西小吃' },
                        { name: '大雁塔', pointType: '景点', timeSlot: '晚上', estCost: 40, note: '音乐喷泉' }
                    ]},
                    { dayNo: 3, dayTitle: '城墙漫步', points: [
                        { name: '西安城墙', pointType: '景点', timeSlot: '上午', estCost: 54, note: '骑行环城墙' },
                        { name: '碑林博物馆', pointType: '景点', timeSlot: '下午', estCost: 65, note: '书法碑刻' }
                    ]}
                ]
            }
        },
        {
            id: 'seed-route-4', name: '北京人文四日', savedAt: '2026-08-18',
            img: lf('北京人文四日', 4),
            routeData: {
                routeName: '北京人文四日', summary: '故宫+长城+颐和园+胡同，四天感受千年古都的皇家气派与烟火气',
                tags: ['历史人文', '经典打卡'], estimatedCost: 3600,
                dayPlans: [
                    { dayNo: 1, dayTitle: '皇城中轴', points: [
                        { name: '天安门广场', pointType: '景点', timeSlot: '上午', estCost: 0, note: '看升旗仪式' },
                        { name: '故宫博物院', pointType: '景点', timeSlot: '下午', estCost: 60, note: '需提前预约' },
                        { name: '王府井', pointType: '购物', timeSlot: '晚上', estCost: 150, note: '小吃街夜市' }
                    ]},
                    { dayNo: 2, dayTitle: '长城好汉', points: [
                        { name: '八达岭长城', pointType: '景点', timeSlot: '上午', estCost: 40, note: '早出发避堵' },
                        { name: '奥林匹克公园', pointType: '景点', timeSlot: '晚上', estCost: 0, note: '鸟巢水立方夜景' }
                    ]},
                    { dayNo: 3, dayTitle: '皇家园林', points: [
                        { name: '颐和园', pointType: '景点', timeSlot: '上午', estCost: 30, note: '昆明湖泛舟' },
                        { name: '圆明园', pointType: '景点', timeSlot: '下午', estCost: 25, note: '遗址公园' }
                    ]},
                    { dayNo: 4, dayTitle: '胡同烟火', points: [
                        { name: '南锣鼓巷', pointType: '景点', timeSlot: '上午', estCost: 0, note: '胡同漫步' },
                        { name: '什刹海', pointType: '景点', timeSlot: '下午', estCost: 0, note: '酒吧街+烟袋斜街' }
                    ]}
                ]
            }
        },
        {
            id: 'seed-route-5', name: '三亚海滨度假', savedAt: '2026-07-08',
            img: lf('三亚海滨度假', 5),
            routeData: {
                routeName: '三亚海滨度假', summary: '亚龙湾+蜈支洲岛+天涯海角，四天阳光沙滩慢节奏海岛度假',
                tags: ['海岛度假', '亲子休闲'], estimatedCost: 4200,
                dayPlans: [
                    { dayNo: 1, dayTitle: '海湾安顿', points: [
                        { name: '亚龙湾沙滩', pointType: '景点', timeSlot: '下午', estCost: 0, note: '天下第一湾' },
                        { name: '百花谷商业街', pointType: '餐饮', timeSlot: '晚上', estCost: 120, note: '海鲜加工店' }
                    ]},
                    { dayNo: 2, dayTitle: '蜈支洲岛', points: [
                        { name: '蜈支洲岛', pointType: '景点', timeSlot: '上午', estCost: 144, note: '浮潜+环岛' },
                        { name: '后海村', pointType: '餐饮', timeSlot: '晚上', estCost: 90, note: '渔村海鲜' }
                    ]},
                    { dayNo: 3, dayTitle: '热带雨林', points: [
                        { name: '热带天堂森林公园', pointType: '景点', timeSlot: '上午', estCost: 158, note: '过江龙索桥' },
                        { name: '第一市场', pointType: '购物', timeSlot: '下午', estCost: 200, note: '买海鲜找加工' }
                    ]},
                    { dayNo: 4, dayTitle: '天涯浪漫', points: [
                        { name: '天涯海角', pointType: '景点', timeSlot: '上午', estCost: 80, note: '打卡地标' },
                        { name: '椰梦长廊', pointType: '景点', timeSlot: '下午', estCost: 0, note: '看最美日落' }
                    ]}
                ]
            }
        }
    ]
    state.foods = [
        { id: 'seed-food-1', name: '成都小龙坎火锅', category: '餐饮', distance: '0.3km', rating: 4.8, refPrice: 128, priceText: '人均 ¥128', feature: '地道牛油锅底，毛肚黄喉招牌', reason: '距春熙路步行5分钟', tags: ['本地人推荐', '氛围热闹'], img: lf('成都小龙坎火锅', 11), savedAt: '2026-09-15' },
        { id: 'seed-food-2', name: '杭州外婆家', category: '餐饮', distance: '0.8km', rating: 4.6, refPrice: 78, priceText: '人均 ¥78', feature: '西湖醋鱼、东坡肉招牌', reason: '湖滨银泰店，吃完逛西湖', tags: ['性价比高', '环境好'], img: lf('杭州外婆家', 12), savedAt: '2026-09-12' },
        { id: 'seed-food-3', name: '重庆朝天门火锅', category: '餐饮', distance: '1.2km', rating: 4.5, refPrice: 118, priceText: '人均 ¥118', feature: '九宫格老火锅', reason: '解放碑附近', tags: ['深夜营业'], img: lf('重庆朝天门火锅', 13), savedAt: '2026-08-28' },
        { id: 'seed-food-4', name: '广州陶陶居', category: '餐饮', distance: '0.6km', rating: 4.7, refPrice: 95, priceText: '人均 ¥95', feature: '百年老字号早茶', reason: '上下九步行街旁', tags: ['历史老店', '早茶必吃'], img: lf('广州陶陶居', 14), savedAt: '2026-08-10' },
        { id: 'seed-food-5', name: '西安老孙家泡馍', category: '餐饮', distance: '0.5km', rating: 4.6, refPrice: 55, priceText: '人均 ¥55', feature: '百年老字号牛羊肉泡馍', reason: '回民街核心地段，掰馍体验感十足', tags: ['老字号', '必吃榜'], img: lf('西安老孙家泡馍', 15), savedAt: '2026-08-30' }
    ]
    state.spots = [
        { id: 'seed-spot-1', name: '成都大熊猫繁育研究基地', category: '景点', rating: 4.9, priceText: '¥55', tags: ['亲子友好', '必去'], keywords: ['熊猫可爱', '园区大', '值得再来'], img: lf('成都大熊猫繁育研究基地', 21), savedAt: '2026-09-15' },
        { id: 'seed-spot-2', name: '杭州西湖风景名胜区', category: '景点', rating: 4.8, priceText: '免费', tags: ['免费开放', '拍照圣地'], keywords: ['景色优美', '环线骑行', '夜景绝'], img: lf('杭州西湖风景名胜区', 22), savedAt: '2026-09-12' },
        { id: 'seed-spot-3', name: '北京故宫博物院', category: '景点', rating: 4.9, priceText: '¥60', tags: ['历史人文', '世界遗产'], keywords: ['历史悠久', '讲解专业', '必看'], img: lf('北京故宫博物院', 23), savedAt: '2026-07-20' },
        { id: 'seed-spot-4', name: '西安秦始皇兵马俑', category: '景点', rating: 4.8, priceText: '¥120', tags: ['世界奇迹', '震撼'], keywords: ['震撼', '讲解必听', '值得一去'], img: lf('西安秦始皇兵马俑', 24), savedAt: '2026-06-05' },
        { id: 'seed-spot-5', name: '上海外滩', category: '景点', rating: 4.6, priceText: '免费', tags: ['夜景绝美', '地标'], keywords: ['夜景绝美', '拍照出片', '繁华'], img: lf('上海外滩', 25), savedAt: '2026-05-18' }
    ]
    state.packs = [
        {
            id: 'seed-pack-1', name: '成都3日游穿搭包', savedAt: '2026-09-15',
            img: lf('travel,backpack', 31),
            note: '9月成都微凉，昼夜温差大，备薄外套',
            categoryList: [
                { categoryName: '证件类', itemList: [
                    { itemName: '身份证', quantity: 1, checkedDefault: true, remark: '国内出行必备' },
                    { itemName: '驾驶证', quantity: 1, checkedDefault: false, remark: '如需租车' }
                ]},
                { categoryName: '衣物类', itemList: [
                    { itemName: '短袖T', quantity: 3, checkedDefault: true, remark: '天气舒适' },
                    { itemName: '薄外套', quantity: 1, checkedDefault: true, remark: '早晚微凉' },
                    { itemName: '牛仔裤', quantity: 2, checkedDefault: true, remark: '百搭' },
                    { itemName: '舒适运动鞋', quantity: 1, checkedDefault: true, remark: '步行多' }
                ]},
                { categoryName: '电子设备类', itemList: [
                    { itemName: '手机+充电器', quantity: 1, checkedDefault: true, remark: '不离身' },
                    { itemName: '充电宝', quantity: 1, checkedDefault: true, remark: '地铁/景区补电' },
                    { itemName: '耳机', quantity: 1, checkedDefault: false, remark: '高铁上用' }
                ]},
                { categoryName: '洗漱护肤类', itemList: [
                    { itemName: '牙刷牙膏', quantity: 1, checkedDefault: true, remark: '酒店可能无' },
                    { itemName: '防晒霜', quantity: 1, checkedDefault: true, remark: '紫外线不弱' },
                    { itemName: '洗面奶', quantity: 1, checkedDefault: true, remark: '分装小瓶' }
                ]},
                { categoryName: '药品类', itemList: [
                    { itemName: '肠胃药', quantity: 1, checkedDefault: true, remark: '吃火锅必备' },
                    { itemName: '创可贴', quantity: 3, checkedDefault: false, remark: '磨脚用' }
                ]},
                { categoryName: '随身杂物类', itemList: [
                    { itemName: '雨伞', quantity: 1, checkedDefault: true, remark: '9月多阵雨' },
                    { itemName: '水杯', quantity: 1, checkedDefault: false, remark: '喝热水' }
                ]}
            ]
        },
        {
            id: 'seed-pack-2', name: '夏日海边度假包', savedAt: '2026-07-10',
            img: lf('beach,summer', 32),
            note: '三亚5天，防晒防水是重点',
            categoryList: [
                { categoryName: '证件类', itemList: [
                    { itemName: '身份证', quantity: 1, checkedDefault: true, remark: '登机入住' }
                ]},
                { categoryName: '衣物类', itemList: [
                    { itemName: '泳衣', quantity: 2, checkedDefault: true, remark: '一天一换' },
                    { itemName: '沙滩裤', quantity: 2, checkedDefault: true, remark: '速干' },
                    { itemName: '短袖衫', quantity: 4, checkedDefault: true, remark: '出汗多' },
                    { itemName: '凉鞋', quantity: 1, checkedDefault: true, remark: '沙滩必备' },
                    { itemName: '遮阳帽', quantity: 1, checkedDefault: true, remark: '防晒' }
                ]},
                { categoryName: '洗漱护肤类', itemList: [
                    { itemName: '高倍防晒霜SPF50', quantity: 1, checkedDefault: true, remark: '海边强紫外线' },
                    { itemName: '晒后修复芦荟胶', quantity: 1, checkedDefault: true, remark: '晚上敷' },
                    { itemName: '防水洗发水沐浴露', quantity: 1, checkedDefault: true, remark: '潜水后清洁' }
                ]},
                { categoryName: '随身杂物类', itemList: [
                    { itemName: '防水手机袋', quantity: 1, checkedDefault: true, remark: '水下拍照' },
                    { itemName: '太阳镜', quantity: 1, checkedDefault: true, remark: '防眩光' },
                    { itemName: '水母服', quantity: 1, checkedDefault: false, remark: '浮潜可选' }
                ]}
            ]
        },
        {
            id: 'seed-pack-3', name: '冬季东北防寒包', savedAt: '2026-12-20',
            img: lf('winter,jacket', 33),
            note: '哈尔滨零下10℃以下，羽绒+发热贴双层防护',
            categoryList: [
                { categoryName: '衣物类', itemList: [
                    { itemName: '长款羽绒服', quantity: 1, checkedDefault: true, remark: '充绒量200g以上' },
                    { itemName: '加绒保暖内衣', quantity: 2, checkedDefault: true, remark: '内外分层' },
                    { itemName: '毛衣', quantity: 2, checkedDefault: true, remark: '中间保暖层' },
                    { itemName: '防水雪地靴', quantity: 1, checkedDefault: true, remark: '防滑鞋底' }
                ]},
                { categoryName: '配件类', itemList: [
                    { itemName: '帽子耳罩', quantity: 1, checkedDefault: true, remark: '护住耳朵' },
                    { itemName: '手套', quantity: 2, checkedDefault: true, remark: '触屏款+滑雪款' },
                    { itemName: '围巾', quantity: 1, checkedDefault: true, remark: '挡风' }
                ]},
                { categoryName: '药品类', itemList: [
                    { itemName: '感冒药', quantity: 1, checkedDefault: true, remark: '温差大易感冒' },
                    { itemName: '冻疮膏', quantity: 1, checkedDefault: false, remark: '应急' }
                ]},
                { categoryName: '电子设备类', itemList: [
                    { itemName: '充电宝', quantity: 1, checkedDefault: true, remark: '低温掉电快' },
                    { itemName: '手机保暖套', quantity: 1, checkedDefault: false, remark: '防自动关机' }
                ]}
            ]
        },
        {
            id: 'seed-pack-4', name: '商务出差极简包', savedAt: '2026-11-05',
            img: lf('business,travel', 34),
            note: '3天2晚标准配置，登机箱一箱搞定',
            categoryList: [
                { categoryName: '证件类', itemList: [
                    { itemName: '身份证', quantity: 1, checkedDefault: true, remark: '值机入住' },
                    { itemName: '名片', quantity: 10, checkedDefault: false, remark: '商务场合' }
                ]},
                { categoryName: '商务装备', itemList: [
                    { itemName: '笔记本电脑+充电器', quantity: 1, checkedDefault: true, remark: '核心生产力' },
                    { itemName: '正装套装', quantity: 1, checkedDefault: true, remark: '会议着装' },
                    { itemName: '衬衫', quantity: 2, checkedDefault: true, remark: '一天一换' }
                ]},
                { categoryName: '洗漱护肤类', itemList: [
                    { itemName: '便携洗漱包', quantity: 1, checkedDefault: true, remark: '分装小瓶' },
                    { itemName: '剃须刀', quantity: 1, checkedDefault: true, remark: '保持形象' }
                ]},
                { categoryName: '随身杂物类', itemList: [
                    { itemName: '保温杯', quantity: 1, checkedDefault: false, remark: '会议室用' },
                    { itemName: 'U盘', quantity: 1, checkedDefault: true, remark: '资料备份' }
                ]}
            ]
        },
        {
            id: 'seed-pack-5', name: '亲子出游欢乐包', savedAt: '2026-10-02',
            img: lf('family,travel', 35),
            note: '带3-6岁娃出行，哄娃神器一个不能少',
            categoryList: [
                { categoryName: '儿童用品', itemList: [
                    { itemName: '儿童水杯', quantity: 1, checkedDefault: true, remark: '防漏设计' },
                    { itemName: '小背包', quantity: 1, checkedDefault: true, remark: '让娃自己背' },
                    { itemName: '安抚玩偶', quantity: 1, checkedDefault: true, remark: '睡觉必备' }
                ]},
                { categoryName: '食品类', itemList: [
                    { itemName: '小饼干零食', quantity: 3, checkedDefault: true, remark: '哄娃神器' },
                    { itemName: '儿童牛奶', quantity: 4, checkedDefault: false, remark: '每日补充' }
                ]},
                { categoryName: '药品类', itemList: [
                    { itemName: '退烧贴', quantity: 2, checkedDefault: true, remark: '应急' },
                    { itemName: '儿童晕车贴', quantity: 1, checkedDefault: true, remark: '长途车用' }
                ]},
                { categoryName: '娱乐装备', itemList: [
                    { itemName: '画本+蜡笔', quantity: 1, checkedDefault: true, remark: '排队打发时间' },
                    { itemName: '泡泡机', quantity: 1, checkedDefault: false, remark: '户外拍照神器' }
                ]}
            ]
        }
    ]

    // 酒店收藏示例：国内热门高奢酒店（按评分降序排）
    state.hotels = [
        { id: 'seed-hotel-1', name: '杭州西子湖四季酒店', rating: 4.9, priceText: '¥4580/晚', tags: ['江南园林', '服务贴心', '湖景房'], keywords: ['江南园林', '管家服务', '私汤温泉', '湖景绝美'], location: '杭州西湖区灵隐路', img: lf('杭州西子湖四季酒店', 41), savedAt: '2026-08-22' },
        { id: 'seed-hotel-2', name: '上海外滩华尔道夫酒店', rating: 4.9, priceText: '¥3888/晚', tags: ['历史建筑', '外滩江景', '老上海风情'], keywords: ['外滩江景', '历史建筑', '老上海风情', '罗莱甜蜜之床'], location: '上海外滩中山东一路', img: lf('上海外滩华尔道夫酒店', 42), savedAt: '2026-08-15' },
        { id: 'seed-hotel-3', name: '北京王府井文华东方酒店', rating: 4.9, priceText: '¥3288/晚', tags: ['城中奢华', '王府井核心', '米其林餐厅'], keywords: ['王府井核心', '管家服务', '米其林餐厅', '城中奢华'], location: '北京东城区王府井大街', img: lf('北京王府井文华东方酒店', 43), savedAt: '2026-07-30' },
        { id: 'seed-hotel-4', name: '三亚亚特兰蒂斯酒店', rating: 4.8, priceText: '¥2688/晚', tags: ['水族馆酒店', '亲子度假', '失落的空间'], keywords: ['水族馆大堂', '失落的空间', '水世界亲子', 'C秀表演'], location: '三亚海棠湾海棠北路', img: lf('三亚亚特兰蒂斯酒店', 44), savedAt: '2026-06-18' },
        { id: 'seed-hotel-5', name: '成都博舍 The Temple House', rating: 4.8, priceText: '¥1880/晚', tags: ['都市秘境', '设计感', '中西合璧'], keywords: ['都市秘境', '设计感强', '中式庭院', 'INNER餐厅'], location: '成都锦江区笔帖式街', img: lf('成都博舍 The Temple House', 45), savedAt: '2026-05-05' }
    ]

    // 帖子收藏示例（images 用 imgMap 真实图）
    state.posts = [
        { id: 'p2', title: '成都一周吃遍老字号：从陈麻婆到贺记蛋烘糕', author: '晚风', avatar: '🌙', city: '成都', cat: '美食探店', content: '按本地人推荐的路线，连续 7 天吃了 14 家店，筛选出真正值得去的 8 家。', images: [lf('成都小龙坎火锅', 4), lf('陈麻婆豆腐（骡马市总店）', 5)], tags: ['美食', '老字号', '成都'], likes: 512, comments: 89, savedAt: '2026-09-16' },
        { id: 'p4', title: '北京 5 天 4 夜：故宫 + 长城 + 胡同深度游', author: '阿树', avatar: '🌳', city: '北京', cat: '行程攻略', content: '避开国庆人流高峰的小众路线，含故宫预约技巧、长城包车攻略。', images: [lf('北京故宫博物院', 10), lf('八达岭长城', 11)], tags: ['攻略', '历史人文', '北京'], likes: 678, comments: 103, savedAt: '2026-09-11' },
        { id: 'p7', title: '西安 3 天 2 夜：兵马俑 + 回民街 + 大唐不夜城', author: '风筝不断线', avatar: '🪁', city: '西安', cat: '行程攻略', content: '含兵马俑讲解预约、回民街美食推荐、不夜城拍照攻略。', images: [lf('西安秦始皇兵马俑', 18), lf('回民街', 19)], tags: ['攻略', '历史人文', '西安'], likes: 298, comments: 51, savedAt: '2026-09-04' }
    ]
}
restore()

export function useFavoriteStore() {
    return {
        state,
        addRoute, removeRoute, hasRoute,
        addFood, removeFood,
        addSpot, removeSpot,
        addHotel, removeHotel,
        addPack, removePack,
        addPost, removePost, hasPost
    }
}
