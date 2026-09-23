/**
 * 榜单数据（红榜 / 黑榜）& 评论 Mock
 * 按「城市名 + 类别 + 榜单色」做确定性种子生成，同一城市每次刷新数据稳定；
 * 数据结构按「AI 分析评论后输出红黑榜」的目标设计，后续接入后端 AI 接口时用同结构替换本模块即可。
 */

// 字符串哈希
function hashString(str) {
    let h = 1779033703 ^ str.length
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
        h = (h << 13) | (h >>> 19)
    }
    return h >>> 0
}

// 确定性伪随机
function mulberry32(seed) {
    return function () {
        seed |= 0
        seed = (seed + 0x6D2B79F5) | 0
        let t = seed ^ (seed >>> 15) | 1
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)]

// 生成条目真实配图：loremflickr 按英文关键词即时返回真实照片，lock 值绑定场所名保证图片稳定
const genImg = (name, keywords, idx = 0) =>
    `https://loremflickr.com/640/480/${keywords}?lock=${hashString(name) % 500 + idx * 7}`

// ---------------- 名称池 ----------------

const GOOD_POOL = {
    spot: [
        '城市森林公园', '老城历史文化街区', '滨江观景长廊', '市博物馆',
        '城市地标观光塔', '古城墙遗址公园', '湖滨湿地公园', '民俗文化村',
        '城市规划展览馆', '名人故居纪念馆', '文化艺术中心', '登山步道景区'
    ],
    food: [
        '老街私房菜', '江畔小馆', '本地人食堂', '巷子口小吃铺',
        '老字号面馆', '院子里餐厅', '鲜味砂锅居', '古镇农家饭庄',
        '清晨早茶店', '烟火气烧烤店', '特色米粉世家', '山里人家土菜馆'
    ],
    hotel: [
        '城市国际酒店', '全季商旅酒店', '湖畔度假酒店', '亚朵精选酒店',
        '老城精品民宿', '滨江皇冠酒店', '桔子水晶酒店', '庭院设计酒店',
        '希尔顿欢朋酒店', '温泉度假酒店', '城市天际酒店', '巷里艺术酒店'
    ]
}

// 黑榜坑店池（与红榜名称天然不重复）
const BAD_POOL = {
    spot: ['小商品批发城', '人工假山公园', '缩微景观园', '网红打卡馆', '民俗表演馆', '商圈顶层乐园'],
    food: ['景区门口大排档', '网红排队餐厅', '商业街连锁快餐', '夜市烧烤摊', '码头海鲜大排档', '车站快餐店'],
    hotel: ['指尖轻奢公寓', '车站边快捷宾馆', '低价家庭旅馆', '照骗网红民宿', '临街闹市酒店', '老楼招待所']
}

const LOCATION_POOL = [
    '市中心商圈', '地铁2号线沿线', '老城区步行街中段', '滨湖景观带',
    '火车站南侧 500 米', '景区南门旁', '高铁站商圈', '文创园区内'
]

// 地址尾号 / 开放时间 / 建议时长 / 交通（详情弹窗实用信息）
const ADDRESS_TAIL = ['88号', '16-2号', '广场西侧', '大厦B座', '巷内3号', '路27号']

const OPEN_TIME = {
    hotel: ['全天营业，14:00 后入住、12:00 前退房', '24 小时前台，15:00 后办理入住'],
    food: ['10:30-21:30（节假日照常营业）', '11:00-22:00（最后点单 21:00）', '09:00-次日 02:00（含夜宵场）'],
    spot: ['08:30-17:30（17:00 停止入园）', '09:00-18:00（周一闭馆）', '全天开放（夜间亮化至 22:00）']
}

const DURATION = {
    hotel: ['建议入住 1-2 晚'],
    food: ['建议用餐 1-1.5 小时', '建议用餐 1.5 小时'],
    spot: ['建议游玩 2-3 小时', '建议游玩 3-4 小时', '建议游玩半天']
}

const TRAFFIC = ['地铁 1 号线可达', '地铁 2 号线步行 5 分钟', '公交 32 路直达', '建议打车或公交前往', '自驾可达，周边有收费停车场']

// 下钻详情图库场景（封面图 + 2 张细节图）
const GALLERY_SCENES = {
    hotel: [['温馨客房实拍', 'hotel,bedroom'], ['酒店大堂', 'hotel,lobby']],
    food: [['招牌菜特写', 'chinese,cuisine'], ['店内环境', 'restaurant,interior']],
    spot: [['核心景观', 'scenic,view'], ['园内步道', 'park,garden']]
}

// ---------------- 标签 / 关键词 ----------------

const CATEGORY_META = {
    hotel: {
        label: '酒店', scene: 'hotel',
        priceText: (rng) => `¥${pick(rng, [268, 328, 398, 468, 568, 698, 888])}/晚`,
        goodTags: ['交通便利', '早餐丰富', '干净整洁', '江景房', '服务贴心', '设施较新', '安静好眠', '近地铁'],
        badTags: ['隔音差', '卫生堪忧', '照骗严重', '设施老旧', '服务态度差', '位置嘈杂', '溢价严重'],
        goodKeywords: ['床很舒服', '隔音好', '前台热情', '卫生到位', '性价比高', '入住顺畅', '早餐不错'],
        badKeywords: ['隔音很差', '房间有味', '图片与实物不符', '前台敷衍', '卫生死角', '退房扯皮', '加床收费']
    },
    food: {
        label: '美食', scene: 'chinese,food',
        priceText: (rng) => `人均 ¥${pick(rng, [38, 48, 58, 68, 88, 108, 138])}`,
        goodTags: ['本地人推荐', '环境温馨', '分量十足', '上菜快', '适合聚餐', '深夜营业', '老字号'],
        badTags: ['排队超久', '溢价严重', '服务差', '分量缩水', '味道一般', '强制消费', '食材不新鲜'],
        goodKeywords: ['味道正宗', '服务热情', '性价比高', '食材新鲜', '招牌必点', '口味地道'],
        badKeywords: ['又贵又难吃', '排队两小时', '服务态度差', '缺斤少两', '食材不新鲜', '旅游刺客']
    },
    spot: {
        label: '景点', scene: 'scenic,landscape',
        priceText: (rng) => (rng() < 0.5 ? '免费' : `¥${pick(rng, [30, 45, 60, 80, 100, 120])}`),
        goodTags: ['免费开放', '适合拍照', '亲子友好', '夜景绝美', '历史人文', '自然风光', '地铁可达'],
        badTags: ['门票虚高', '名不副实', '人多拥挤', '商业化的坑', '位置偏远', '体验项目坑'],
        goodKeywords: ['景色优美', '值得再来', '人少清静', '讲解专业', '空气清新', '性价比高'],
        badKeywords: ['根本不值得', '全程人挤人', '到处是购物点', '十分钟逛完', '门票不值', '体验极差']
    }
}

// ---------------- 评论池 ----------------

const GOOD_COMMENTS = {
    hotel: ['{k}，房间比图片还舒服，这次入住很满意。', '出差连住三晚，{k}，下楼就是地铁站太方便了。', '{k}，晚上睡得很安静，早餐种类也够用。', '前台办理入住很快，{k}，还主动给升级了高楼层。', '{k}，卫生细节做得好，带孩子住也放心。', '住过同价位七八家，这家在{city}体验最好，{k}。', '{k}，洗漱区还配了免费小零食，细节好评。', '约了朋友一起住，{k}，大家都很满意。', '返程前最后一晚住的这里，{k}，给旅程画上完美句号。', '{k}，隔音真的好，马路对面就是夜市也听不到。'],
    food: ['{k}，招牌菜名不虚传，两个人吃得很满足。', '本地朋友强烈推荐的店，{k}，果然没让我失望。', '{k}，饭点需排队建议提前取号，服务态度很好。', '地道的本地口味，{k}，价格实在不宰客。', '{k}，小店氛围很棒，聚餐首选，已经三刷了。', '下了高铁直奔这家，{k}，值这一小时的车程。', '{k}，老板娘热情送了例汤，人情味满满。', '拍照发朋友圈被追问店名，{k}，出片又好吃。', '{k}，分量给得实在，两个人点三个菜刚好。', '带爸妈来吃，{k}，长辈赞不绝口。'],
    spot: ['{k}，逛了大半天也不觉得累。', '{k}，长辈和小朋友都很喜欢，下次还来。', '体验超出预期，{k}，建议早点来人少。', '{k}，随手一拍都出片。', '门票合理，{k}，工作人员很负责。', '来{city}必打卡，{k}，不虚此行。', '{k}，租个讲解器体验直接翻倍。', '傍晚来人少光线好，{k}，还赶上了演出。', '{k}，园区指引清晰，洗手间也好找。', '特意留了一整天，{k}，还是没逛够。']
}

const BAD_COMMENTS = {
    hotel: ['{k}，一晚上没睡好，隔壁走廊声音全听得见。', '实景和照片差距太大，{k}，感觉被骗了。', '{k}，前台爱答不理，问题解决得很慢。', '房间打扫不干净，{k}，毛巾有异味。', '退房时各种找理由扣钱，{k}，体验很差。', '预订的房型到店说没有，{k}，加钱才给换。', '空调坏了报修没人来，{k}，大热天一夜没睡。', '{k}，热水等了十分钟才有，洗澡全靠忍耐。', '楼下就是烧烤摊，{k}，凌晨两点还有人唱歌。', '一次性用品全是三无的，{k}，牙刷都不敢用。'],
    food: ['{k}，一盘青菜卖 58，纯纯景区价。', '排了 1 个半小时，{k}，完全不值。', '{k}，服务员催着点单，上菜还慢。', '招牌菜全是预制味，{k}，失望。', '{k}，结账时发现多收了茶位费。', '看着满屏好评来的，{k}，怀疑都是刷的。', '{k}，避雷，隔壁店便宜一半还好吃。', '锅底是料包冲的，{k}，吃完口干得厉害。', '{k}，说是老字号，纯粹情怀收割游客。', '称重有猫腻，{k}，一斤变一斤三。'],
    spot: ['{k}，门口拍照就是全部体验了。', '{k}，一半区域在装修还不提前说明。', '里面全是购物点，{k}，绕都绕不出去。', '{k}，排队 40 分钟看 5 分钟表演。', '门票 120 就看几个假模型，{k}。', '跟着拉客的来，{k}，全程被安排购物。', '{k}，所谓网红点就是个铁皮棚。', '说好免费结果处处收费，{k}，处处是坑。', '{k}，工作人员态度还特别差，问啥都说不知道。', '景区门口停车乱收费，{k}，进去十分钟就想走。']
}

// 短评池（30% 概率出现，让评论长短错落更像真实数据）
const SHORT_GOOD = ['环境不错，值得来！', '三刷了，稳定好吃', '很惊喜的一次体验', '拍照太出片了', '服务没得挑', '性价比之王', '下次还来', '闭眼冲就行', '本地人都爱来', '体验感拉满']
const SHORT_BAD = ['踩雷，快跑', '不会再来了', '服务太差劲', '完全名不副实', '巨坑，避雷', '劝退，别来', '体验很差', '不如不去', '全是套路', '贵还难吃']

const SUMMARY_GOOD = {
    hotel: '口碑稳定，{k1}与{k2}被反复提及，适合商旅与亲子入住。',
    food: '本地回头客多，{k1}、{k2}是高频好评词，招牌菜基本不踩雷。',
    spot: '游览体验佳，{k1}、{k2}好评集中，建议错峰前往体验更佳。'
}

const SUMMARY_BAD = {
    hotel: '差评集中在{k1}与{k2}，同价位有更多靠谱选择，建议谨慎预订。',
    food: '游客差评高发，{k1}、{k2}被多次投诉，本地人一般不去。',
    spot: '实际体验与宣传落差大，{k1}、{k2}是主要槽点，不推荐专程前往。'
}

const INTRO = {
    red: '{name}位于{city}{loc}，是本次 AI 综合近一年上万条真实游客评论分析后，评选出的{city}{label}类高分口碑场所。整体经营稳定、评价真实可信，在评分、服务与环境三个维度均位于同类前列。',
    black: '{name}位于{city}{loc}。AI 对近一年真实游客评论进行情感分析后发现，该场所负反馈占比明显高于同类均值，主要问题集中在服务与体验环节，属于典型的游客踩坑高发场所，建议谨慎选择。'
}

const CONCLUSION = {
    red: 'AI 总结：基于 {n} 条真实评论的情感分析，好评率约 {pct}%。游客普遍认可{k1}，{k2}也被高频提及；少量中评主要提到节假日人多、需排队等非场地本身的问题。综合判断口碑真实可靠，可放心安排进行程。',
    black: 'AI 总结：基于 {n} 条真实评论的情感分析，差评率约 {pct}%。投诉集中在{k1}与{k2}，且近三个月无改善迹象；个别好评多来自开业初期，参考价值有限。综合判断踩坑概率高，建议替换为同类红榜场所。'
}

const RED_CONS = ['节假日人流较大', '高峰期需排队', '旺季价格上涨']
const BLACK_PROS = ['位置相对方便', '价格看起来便宜', '宣传噱头足']

const REVIEWERS = ['旅行者', '晚风', '一路向南', '山那边', '慢半拍', '阿树', '不打烊', '看海的人', '小陈同学', '周末出逃', '行舟', '白日梦想家', '橘子汽水', '路过人间', '风筝不断线', '南方的巷子', '一半月光', '街角咖啡', '背包十年', '困困鱼']

const CAT_KEYS = ['hotel', 'food', 'spot']
const RED_COUNT = 8
const BLACK_COUNT = 6

// ---------------- 真实场所种子（南昌 / 成都演示城市） ----------------
// 红榜：真实场所名 + 真实参考价 + 专属图片关键词；黑榜：描述性名称（不指向具体商家）
// 字段：name 场所名 / rating 评分 / priceText 参考价 / tags 标签 / kw 评论关键词 / loc 位置 / imgKw 图片关键词
const REAL_PLACE_SEEDS = {
    '成都': {
        spot: {
            red: [
                { name: '成都大熊猫繁育研究基地', rating: 4.9, priceText: '¥55', tags: ['亲子友好', '必去', '地铁直达'], kw: ['熊猫可爱', '园区大', '值得再来', '讲解专业'], loc: '成华区外北熊猫大道1375号', imgKw: 'chengdu,panda' },
                { name: '宽窄巷子', rating: 4.7, priceText: '免费', tags: ['免费开放', '拍照圣地', '历史人文'], kw: ['老成都味', '巷子有格调', '盖碗茶', '人多热闹'], loc: '青羊区金河路口宽窄巷子', imgKw: 'china,old,street' },
                { name: '锦里古街', rating: 4.6, priceText: '免费', tags: ['夜景绝美', '小吃多'], kw: ['夜景好看', '小吃街', '红灯笼', '川剧表演'], loc: '武侯区武侯祠大街231号', imgKw: 'chengdu,night,street' },
                { name: '都江堰景区', rating: 4.8, priceText: '¥80', tags: ['世界遗产', '震撼'], kw: ['水利工程', '古人智慧', '讲解必听', '空气清新'], loc: '都江堰市公园路76号', imgKw: 'china,river,dam' },
                { name: '武侯祠博物馆', rating: 4.7, priceText: '¥50', tags: ['历史人文', '三国迷必去'], kw: ['三国文化', '红墙拍照', '讲解专业', '银杏'], loc: '武侯区武侯祠大街231号', imgKw: 'china,temple' },
                { name: '春熙路·太古里', rating: 4.6, priceText: '免费', tags: ['逛街购物', '网红打卡'], kw: ['繁华', '熊猫爬墙', '街拍', '美食集中'], loc: '锦江区春熙路', imgKw: 'chengdu,city,night' }
            ],
            black: [
                { name: '春熙路地铁口一日游拉客点', rating: 2.8, priceText: '¥99起', tags: ['强制购物', '行程缩水'], kw: ['强制购物', '行程缩水', '拉客缠人'], loc: '锦江区春熙路地铁站B口', imgKw: 'chengdu,street' },
                { name: '熊猫基地门口野生导游', rating: 3.0, priceText: '¥60/次', tags: ['无证带团'], kw: ['讲解乱编', '乱收费', '带去购物点'], loc: '成华区熊猫大道', imgKw: 'panda,zoo' },
                { name: '锦里门口化妆照相摊', rating: 2.9, priceText: '¥199起', tags: ['隐形消费'], kw: ['拍完加价', '底片勒索', '妆面敷衍'], loc: '武侯区武侯祠大街', imgKw: 'china,portrait' },
                { name: '火车站旁黑车一日游', rating: 2.6, priceText: '面议', tags: ['漫天要价'], kw: ['不打表', '绕路', '中途加价'], loc: '成都站南广场', imgKw: 'train,station,china' },
                { name: '宽窄巷子口“免费喝茶”体验店', rating: 2.7, priceText: '免费进店', tags: ['套路推销'], kw: ['进店套路', '茶叶刺客', '话术洗脑'], loc: '青羊区宽窄巷子北口', imgKw: 'tea,shop' }
            ]
        },
        food: {
            red: [
                { name: '蜀大侠火锅（春熙路店）', rating: 4.8, priceText: '人均 ¥128', tags: ['本地人推荐', '江湖风'], kw: ['牛油锅香', '毛肚脆', '排队火爆', '侠客主题'], loc: '锦江区春熙路南段', imgKw: 'hotpot' },
                { name: '陈麻婆豆腐（骡马市总店）', rating: 4.6, priceText: '人均 ¥75', tags: ['老字号', '川菜正宗'], kw: ['麻婆豆腐正宗', '性价比高', '历史老店'], loc: '青羊区西玉龙街197号', imgKw: 'sichuan,food' },
                { name: '马路边边串串香（致民路店）', rating: 4.7, priceText: '人均 ¥80', tags: ['市井风', '排队王'], kw: ['锅底香', '串串新鲜', '还原老成都'], loc: '武侯区致民路56号', imgKw: 'skewer,bbq' },
                { name: '钟水饺（提督街店）', rating: 4.5, priceText: '人均 ¥30', tags: ['老字号', '成都小吃'], kw: ['红油水饺', '甜辣口', '皮薄馅足'], loc: '锦江区提督街7号', imgKw: 'dumplings' },
                { name: '贺记蛋烘糕', rating: 4.6, priceText: '人均 ¥10', tags: ['街头小吃', '便宜大碗'], kw: ['外脆内软', '馅料多', '本地人从小吃'], loc: '青羊区文庙西街', imgKw: 'street,food,china' },
                { name: '成都吃客（致民路店）', rating: 4.7, priceText: '人均 ¥95', tags: ['创意川菜', '网红餐厅'], kw: ['裸奔坨坨虾', '特色菜', '摆盘出片'], loc: '武侯区致民路', imgKw: 'chinese,cuisine' }
            ],
            black: [
                { name: '景区门口“正宗成都小吃”大排档', rating: 2.7, priceText: '人均 ¥95', tags: ['溢价严重', '味道一般'], kw: ['又贵又难吃', '缺斤少两', '回头客为零'], loc: '青羊区长顺街', imgKw: 'street,food' },
                { name: '春熙路自助烤肉引流店', rating: 2.8, priceText: '人均 ¥118', tags: ['隐形收费'], kw: ['茶位费刺客', '食材不新鲜', '引流套路'], loc: '锦江区春熙路', imgKw: 'bbq' },
                { name: '火车站旁24小时快餐店', rating: 2.5, priceText: '人均 ¥45', tags: ['食材不新鲜'], kw: ['吃完拉肚子', '预制菜', '环境油腻'], loc: '成都站南广场', imgKw: 'fastfood' },
                { name: '太古里网红奶茶排队店', rating: 3.0, priceText: '人均 ¥42', tags: ['排队超久', '溢价'], kw: ['排两小时', '味道一般', '黄牛加价'], loc: '锦江区太古里', imgKw: 'bubble,tea' },
                { name: '夜市野生烧烤摊', rating: 2.9, priceText: '人均 ¥88', tags: ['缺斤少两'], kw: ['先烤后算价', '强卖', '卫生堪忧'], loc: '武侯区倪家桥', imgKw: 'bbq,night' }
            ]
        },
        hotel: {
            red: [
                { name: '成都博舍 The Temple House', rating: 4.9, priceText: '¥1888/晚', tags: ['设计酒店', '闹中取静'], kw: ['网红泳池', '服务贴心', '太古里旁'], loc: '锦江区笔帖式街81号', imgKw: 'luxury,hotel' },
                { name: '成都富力丽思卡尔顿', rating: 4.8, priceText: '¥1288/晚', tags: ['奢华五星', '早餐丰富'], kw: ['行政酒廊', '床品舒服', '下午茶棒'], loc: '青羊区顺城大街269号', imgKw: 'luxury,hotel' },
                { name: '成都瑞吉酒店', rating: 4.8, priceText: '¥1100/晚', tags: ['服务贴心', '近太古里'], kw: ['管家服务', '下午茶', '健身设施新'], loc: '锦江区崇德里1号', imgKw: 'hotel,lobby' },
                { name: '亚朵S酒店（春熙路店）', rating: 4.7, priceText: '¥520/晚', tags: ['性价比高', '设施较新'], kw: ['床很舒服', '深睡枕', '前台热情'], loc: '锦江区春熙路', imgKw: 'hotel,bedroom' },
                { name: '全季酒店（天府广场店）', rating: 4.6, priceText: '¥420/晚', tags: ['交通便利', '干净整洁'], kw: ['近地铁', '安静好眠', '早餐不错'], loc: '青羊区天府广场东侧', imgKw: 'hotel,room' },
                { name: '成都岷山饭店', rating: 4.5, priceText: '¥480/晚', tags: ['老牌五星', '位置好'], kw: ['早餐丰富', '近机场大巴', '服务稳定'], loc: '锦江区人民南路二段55号', imgKw: 'hotel,building' }
            ],
            black: [
                { name: '春熙路“三无”低价旅馆', rating: 2.7, priceText: '¥89/晚', tags: ['卫生堪忧', '照骗严重'], kw: ['房间有味', '图片与实物不符', '床单发黄'], loc: '锦江区春熙路背街', imgKw: 'old,hotel' },
                { name: '火车站旁拉客小宾馆', rating: 2.5, priceText: '¥79/晚', tags: ['隔音差', '设施老旧'], kw: ['隔音很差', '空调不制冷', '态度差'], loc: '成都站北广场', imgKw: 'old,building' },
                { name: '景区边“江景房”民宿', rating: 2.9, priceText: '¥328/晚', tags: ['照骗严重'], kw: ['根本看不到江', '退房扯皮', '设施坏了没人修'], loc: '都江堰市幸福路', imgKw: 'apartment,interior' },
                { name: '太古里旁胶囊公寓', rating: 2.8, priceText: '¥98/晚', tags: ['空间小', '位置嘈杂'], kw: ['翻身都难', '整晚吵', '储物不便'], loc: '锦江区东大街', imgKw: 'capsule,hotel' },
                { name: '车站边“特价”招待所', rating: 2.6, priceText: '¥69/晚', tags: ['押金套路', '服务态度差'], kw: ['前台敷衍', '扣押金', '门窗老旧'], loc: '成都站南广场', imgKw: 'hostel' }
            ]
        }
    },
    '南昌': {
        spot: {
            red: [
                { name: '滕王阁', rating: 4.8, priceText: '¥70', tags: ['江南名楼', '历史人文'], kw: ['落霞与孤鹜', '登楼望远', '讲解必听', '赣江景'], loc: '东湖区仿古街58号', imgKw: 'china,pagoda' },
                { name: '万寿宫历史文化街区', rating: 4.7, priceText: '免费', tags: ['免费开放', '夜景绝美'], kw: ['南昌味', '夜市热闹', '灯笼夜景', '小吃多'], loc: '西湖区中山路1号', imgKw: 'china,night,street' },
                { name: '秋水广场', rating: 4.6, priceText: '免费', tags: ['免费开放', '音乐喷泉'], kw: ['亚洲最大喷泉', '赣江夜景', '适合散步'], loc: '红谷滩区赣江中大道', imgKw: 'fountain,night' },
                { name: '南昌八一起义纪念馆', rating: 4.8, priceText: '免费（需预约）', tags: ['红色旅游', '免费'], kw: ['历史厚重', '讲解专业', '需要提前预约'], loc: '西湖区中山路380号', imgKw: 'museum,china' },
                { name: '江西省博物馆新馆', rating: 4.7, priceText: '免费（需预约）', tags: ['文物丰富', '亲子友好'], kw: ['海昏侯展', '青铜器', '免费讲解'], loc: '红谷滩区凤凰洲赣江北大道698号', imgKw: 'museum' },
                { name: '艾溪湖湿地公园', rating: 4.5, priceText: '免费', tags: ['自然风光', '适合骑行'], kw: ['湖景开阔', '空气清新', '适合遛娃'], loc: '青山湖区艾溪湖北路', imgKw: 'lake,park' }
            ],
            black: [
                { name: '火车站旁“滕王阁一日游”黑车', rating: 2.6, priceText: '面议', tags: ['漫天要价', '绕路'], kw: ['不打表', '带去购物点', '中途加价'], loc: '南昌站东广场', imgKw: 'train,station,china' },
                { name: '八一广场周边野导服务点', rating: 2.8, priceText: '¥50/次', tags: ['讲解乱编'], kw: ['乱收费', '无证带团', '带进店消费'], loc: '东湖区八一广场', imgKw: 'china,street' },
                { name: '秋水广场“观景台”收费点', rating: 2.7, priceText: '¥30', tags: ['隐形收费'], kw: ['喷泉本免费', '占位置收费', '态度差'], loc: '红谷滩区赣江边', imgKw: 'fountain' },
                { name: '万寿宫口“特产大甩卖”店', rating: 2.9, priceText: '人均 ¥150', tags: ['套路推销'], kw: ['切糕刺客', '试吃强卖', '价格翻倍'], loc: '西湖区中山路', imgKw: 'market,china' },
                { name: '郊区“鄱阳湖观鸟园”私家景点', rating: 2.5, priceText: '¥60', tags: ['名不副实'], kw: ['就一个池塘', '门票不值', '路程超远'], loc: '南昌近郊', imgKw: 'wetland' }
            ]
        },
        food: {
            red: [
                { name: '民间瓦罐汤（孺子路店）', rating: 4.7, priceText: '人均 ¥25', tags: ['老字号', '本地人推荐'], kw: ['瓦罐汤鲜', '拌粉够味', '早餐必吃'], loc: '西湖区孺子路', imgKw: 'soup,china' },
                { name: '味福记（红谷滩万达店）', rating: 4.6, priceText: '人均 ¥70', tags: ['赣菜代表', '环境好'], kw: ['南昌炒粉', '白糖糕', '赣味十足'], loc: '红谷滩区万达广场', imgKw: 'chinese,cuisine' },
                { name: '周真真南昌粉店', rating: 4.5, priceText: '人均 ¥20', tags: ['便宜管饱', '市井风'], kw: ['拌粉爽滑', '汤底浓', '本地人从小吃'], loc: '东湖区胜利路', imgKw: 'noodles' },
                { name: '打平火（船山路店）', rating: 4.7, priceText: '人均 ¥90', tags: ['小龙虾人气店', '夜宵'], kw: ['油焖大虾', '排队火爆', '蒜香浓郁'], loc: '西湖区船山路', imgKw: 'crayfish' },
                { name: '老三样（系马桩店）', rating: 4.6, priceText: '人均 ¥65', tags: ['家常赣菜', '分量足'], kw: ['红烧肉', '打屁冲', '下饭'], loc: '西湖区系马桩', imgKw: 'chinese,food' },
                { name: '英娥水煮（系马桩店）', rating: 4.5, priceText: '人均 ¥35', tags: ['特色水煮', '老南昌味道'], kw: ['水煮串', '学生时代回忆', '辣得过瘾'], loc: '西湖区系马桩', imgKw: 'chinese,street,food' }
            ],
            black: [
                { name: '滕王阁门口“正宗拌粉”摊', rating: 2.7, priceText: '人均 ¥48', tags: ['溢价严重'], kw: ['景区价', '难吃', '分量少'], loc: '东湖区仿古街', imgKw: 'street,food' },
                { name: '火车站旁24小时大排档', rating: 2.5, priceText: '人均 ¥78', tags: ['缺斤少两', '食材不新鲜'], kw: ['先烤后算', '吃完拉肚子', '强卖'], loc: '南昌站东广场', imgKw: 'street,night' },
                { name: '中山路“网红”奶茶引流店', rating: 2.8, priceText: '人均 ¥38', tags: ['排队超久'], kw: ['排一小时', '味道一般', '宣传夸大'], loc: '西湖区中山路', imgKw: 'bubble,tea' },
                { name: '秋水广场夜市串串摊', rating: 2.9, priceText: '人均 ¥65', tags: ['强制消费'], kw: ['竹签刺客', '强卖', '不新鲜'], loc: '红谷滩区秋水广场', imgKw: 'skewer,night' },
                { name: '绳金塔旁“老字号”餐厅', rating: 2.8, priceText: '人均 ¥85', tags: ['名不副实'], kw: ['预制菜', '服务差', '专坑游客'], loc: '西湖区绳金塔街', imgKw: 'restaurant,empty' }
            ]
        },
        hotel: {
            red: [
                { name: '南昌香格里拉大酒店', rating: 4.8, priceText: '¥880/晚', tags: ['江景房', '服务贴心'], kw: ['赣江景观', '行政酒廊', '早餐丰富'], loc: '东湖区沿江北大道', imgKw: 'luxury,hotel' },
                { name: '南昌喜来登酒店', rating: 4.7, priceText: '¥760/晚', tags: ['近秋水广场', '设施新'], kw: ['红谷滩核心', '泳池好', '床品舒服'], loc: '红谷滩区赣江北大道', imgKw: 'hotel,lobby' },
                { name: '南昌瑞颐大酒店', rating: 4.6, priceText: '¥560/晚', tags: ['性价比高', '近滕王阁'], kw: ['步行到滕王阁', '早餐丰富', '江景房'], loc: '东湖区抚河北路', imgKw: 'hotel,building' },
                { name: '南昌万达嘉华酒店', rating: 4.6, priceText: '¥620/晚', tags: ['万达商圈', '亲子友好'], kw: ['床品舒服', '自助餐棒', '儿童友好'], loc: '红谷滩区凤凰中大道', imgKw: 'hotel,room' },
                { name: '全季酒店（八一广场店）', rating: 4.5, priceText: '¥380/晚', tags: ['交通便利', '干净整洁'], kw: ['近地铁口', '安静好眠', '性价比高'], loc: '东湖区八一广场', imgKw: 'hotel,bedroom' },
                { name: '亚朵酒店（红谷滩万达店）', rating: 4.6, priceText: '¥450/晚', tags: ['服务贴心', '设施较新'], kw: ['深睡枕', '入住快', '前台热情'], loc: '红谷滩区万达广场旁', imgKw: 'modern,hotel' }
            ],
            black: [
                { name: '火车站旁拉客小旅馆', rating: 2.5, priceText: '¥69/晚', tags: ['卫生堪忧', '押金套路'], kw: ['床单有味', '扣押金', '态度恶劣'], loc: '南昌站东广场', imgKw: 'old,hotel' },
                { name: '八一广场“特价”招待所', rating: 2.6, priceText: '¥79/晚', tags: ['设施老旧', '隔音差'], kw: ['热水时有时无', '整晚吵', '家具破损'], loc: '东湖区广场北路', imgKw: 'hostel' },
                { name: '滕王阁旁“江景”民宿', rating: 2.8, priceText: '¥288/晚', tags: ['照骗严重'], kw: ['窗对着墙', '图片与实物不符', '卫生死角'], loc: '东湖区榕门路', imgKw: 'apartment,interior' },
                { name: '中山路胶囊青年旅舍', rating: 2.7, priceText: '¥59/晚', tags: ['空间小', '不安全'], kw: ['储物柜坏', '行李没处放', '门锁松动'], loc: '西湖区中山路', imgKw: 'capsule,hotel' },
                { name: '万寿宫旁无窗快捷宾馆', rating: 2.6, priceText: '¥89/晚', tags: ['无窗', '味道重'], kw: ['白天也开灯', '潮湿', '通风差'], loc: '西湖区船山路', imgKw: 'old,building' }
            ]
        }
    }
}

/**
 * 生成某城市完整红黑榜数据
 * @param {string} city 城市名
 * @returns {Object} { hotel: { red, black }, food: { red, black }, spot: { red, black } }
 */
export function getCityBoard(city) {
    const board = {}
    for (const catKey of CAT_KEYS) {
        const meta = CATEGORY_META[catKey]
        board[catKey] = {
            red: buildList(city, catKey, 'red', meta),
            black: buildList(city, catKey, 'black', meta)
        }
    }
    return board
}

function buildList(city, catKey, color, meta) {
    const pool = color === 'red' ? GOOD_POOL[catKey] : BAD_POOL[catKey]
    const tagPool = color === 'red' ? meta.goodTags : meta.badTags
    const kwPool = color === 'red' ? meta.goodKeywords : meta.badKeywords
    const commentTpl = color === 'red' ? GOOD_COMMENTS[catKey] : BAD_COMMENTS[catKey]
    const summaryTpl = color === 'red' ? SUMMARY_GOOD[catKey] : SUMMARY_BAD[catKey]
    const seeds = REAL_PLACE_SEEDS[city]?.[catKey]?.[color]
    const useReal = Array.isArray(seeds) && seeds.length > 0
    const count = useReal ? seeds.length : (color === 'red' ? RED_COUNT : BLACK_COUNT)
    const baseTop = color === 'red' ? 4.9 : 3.8
    const baseFloor = color === 'red' ? 4.2 : 2.7

    const rng = mulberry32(hashString(`${city}-${catKey}-${color}${useReal ? '-real' : ''}`))
    const used = new Set()
    const list = []

    while (list.length < count) {
        const seedItem = useReal ? seeds[list.length] : null
        let name, rating, tags, keywords, loc, imgKw = null

        if (seedItem) {
            // 真实场所：名称 / 评分 / 价格 / 标签 / 关键词 / 位置 / 图片关键词由种子给定
            name = seedItem.name
            rating = seedItem.rating
            tags = [...seedItem.tags]
            keywords = [...seedItem.kw]
            loc = seedItem.loc
            imgKw = seedItem.imgKw
        } else {
            const shortName = pick(rng, pool)
            if (used.has(shortName)) continue
            used.add(shortName)

            // 评分：榜内越靠前越高
            const base = baseTop - list.length * ((baseTop - baseFloor) / Math.max(1, count - 1))
            rating = Math.min(5, Math.max(baseFloor - 0.1, base + (rng() * 0.16 - 0.08)))

            tags = []
            while (tags.length < 3) {
                const t = pick(rng, tagPool)
                if (!tags.includes(t)) tags.push(t)
            }

            keywords = []
            while (keywords.length < 4) {
                const k = pick(rng, kwPool)
                if (!keywords.includes(k)) keywords.push(k)
            }

            loc = pick(rng, LOCATION_POOL)
            name = `${city}${shortName}`
        }

        // 评论 10-15 条（30% 概率为短评，长短错落更像真实数据；日期跨 2025-2026）
        const commentCount = 10 + Math.floor(rng() * 6)
        const comments = []
        for (let i = 0; i < commentCount; i++) {
            const isShort = rng() < 0.3
            const content = isShort
                ? pick(rng, color === 'red' ? SHORT_GOOD : SHORT_BAD)
                : pick(rng, commentTpl).replace('{k}', pick(rng, kwPool)).replace('{city}', city)
            comments.push({
                id: `${city}-${catKey}-${color}-${list.length + 1}-${i}`,
                reviewer: pick(rng, REVIEWERS),
                date: `${2025 + Math.floor(rng() * 2)}-${String(1 + Math.floor(rng() * 12)).padStart(2, '0')}-${String(1 + Math.floor(rng() * 27)).padStart(2, '0')}`,
                content
            })
        }

        // 优缺点
        const pros = color === 'red' ? tags.slice(0, 2) : [pick(rng, BLACK_PROS)]
        const cons = color === 'red' ? [pick(rng, RED_CONS)] : tags.slice(0, 2)

        // AI 短口碑摘要
        const summary = summaryTpl
            .replace('{k1}', keywords[0])
            .replace('{k2}', keywords[1] || keywords[0])

        // AI 整体评论总结（详情页）
        const pct = color === 'red' ? 82 + Math.floor(rng() * 12) : 38 + Math.floor(rng() * 22)
        const aiConclusion = CONCLUSION[color]
            .replace('{n}', commentCount)
            .replace('{pct}', color === 'red' ? pct : 100 - pct)
            .replace('{k1}', keywords[0])
            .replace('{k2}', keywords[1] || keywords[0])

        const intro = INTRO[color]
            .replace('{name}', name)
            .replaceAll('{city}', city)
            .replace('{loc}', loc)
            .replace('{label}', meta.label)

        list.push({
            id: `${city}-${catKey}-${color}-${list.length + 1}`,
            catKey,
            board: color,
            rank: list.length + 1,
            name,
            rating: Number(rating.toFixed(1)),
            priceText: meta.priceText(rng),
            tags,
            location: loc,
            summary,
            intro,
            pros,
            cons,
            keywords,
            aiConclusion,
            comments,
            img: genImg(name, imgKw || meta.scene),
            gallery: GALLERY_SCENES[catKey].map(([label, scene], gi) => genImg(`${name} ${label}`, scene, gi + 1)),
            address: useReal ? loc : `${city}${loc}${pick(rng, ADDRESS_TAIL)}`,
            openTime: pick(rng, OPEN_TIME[catKey]),
            duration: pick(rng, DURATION[catKey]),
            traffic: pick(rng, TRAFFIC)
        })
    }

    return list
}
