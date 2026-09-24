/**
 * 生成 rank_items 表种子 SQL（6 城市 × 酒店/美食/景点 × 红黑榜）
 * 图片：trae-api 文生图，prompt 按场所英文关键词定制
 * 运行：node gen_rank_seeds.mjs  > rank_seeds.sql
 */
import fs from 'fs'

// 图片 URL（prompt 定制，同城市同关键词不同条目用 view n 区分）
const genImg = (imgKw, cat, color, pos) => {
    const style = color === 'red'
        ? (cat === 'food' ? ', delicious food photography, appetizing, high quality'
            : cat === 'hotel' ? ', elegant hotel, professional photography, high quality'
                : ', beautiful scenery, professional travel photography, high quality')
        : (cat === 'hotel' ? ', shabby rundown room, dim light'
            : cat === 'food' ? ', messy cheap food stall, unappetizing'
                : ', crowded tourist trap, dull scenery')
    const prompt = encodeURIComponent(`${imgKw}${style}, view ${pos}`)
    return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=landscape_4_3`
}

// ---------------- 南昌 / 成都（与前端 REAL_PLACE_SEEDS 同源） ----------------
const NANCHANG = {
    spot: {
        red: [
            { name: '滕王阁', rating: 4.8, priceText: '¥70', tags: ['江南名楼', '历史人文'], kw: ['落霞与孤鹜', '登楼望远', '讲解必听', '赣江景'], loc: '东湖区仿古街58号', imgKw: 'china ancient pagoda tower by river' },
            { name: '万寿宫历史文化街区', rating: 4.7, priceText: '免费', tags: ['免费开放', '夜景绝美'], kw: ['南昌味', '夜市热闹', '灯笼夜景', '小吃多'], loc: '西湖区中山路1号', imgKw: 'china old town night street lanterns' },
            { name: '秋水广场', rating: 4.6, priceText: '免费', tags: ['免费开放', '音乐喷泉'], kw: ['亚洲最大喷泉', '赣江夜景', '适合散步'], loc: '红谷滩区赣江中大道', imgKw: 'fountain show at night city' },
            { name: '南昌八一起义纪念馆', rating: 4.8, priceText: '免费（需预约）', tags: ['红色旅游', '免费'], kw: ['历史厚重', '讲解专业', '需要提前预约'], loc: '西湖区中山路380号', imgKw: 'china history museum exterior' },
            { name: '江西省博物馆新馆', rating: 4.7, priceText: '免费（需预约）', tags: ['文物丰富', '亲子友好'], kw: ['海昏侯展', '青铜器', '免费讲解'], loc: '红谷滩区凤凰洲赣江北大道698号', imgKw: 'modern museum building china' },
            { name: '艾溪湖湿地公园', rating: 4.5, priceText: '免费', tags: ['自然风光', '适合骑行'], kw: ['湖景开阔', '空气清新', '适合遛娃'], loc: '青山湖区艾溪湖北路', imgKw: 'lake wetland park green' }
        ],
        black: [
            { name: '火车站旁“滕王阁一日游”黑车', rating: 2.6, priceText: '面议', tags: ['漫天要价', '绕路'], kw: ['不打表', '带去购物点', '中途加价'], loc: '南昌站东广场', imgKw: 'old train station street china' },
            { name: '八一广场周边野导服务点', rating: 2.8, priceText: '¥50/次', tags: ['讲解乱编'], kw: ['乱收费', '无证带团', '带进店消费'], loc: '东湖区八一广场', imgKw: 'crowded street vendors china' },
            { name: '秋水广场“观景台”收费点', rating: 2.7, priceText: '¥30', tags: ['隐形收费'], kw: ['喷泉本免费', '占位置收费', '态度差'], loc: '红谷滩区赣江边', imgKw: 'crowded fountain viewpoint' },
            { name: '万寿宫口“特产大甩卖”店', rating: 2.9, priceText: '人均 ¥150', tags: ['套路推销'], kw: ['切糕刺客', '试吃强卖', '价格翻倍'], loc: '西湖区中山路', imgKw: 'tourist souvenir shop cluttered' },
            { name: '郊区“鄱阳湖观鸟园”私家景点', rating: 2.5, priceText: '¥60', tags: ['名不副实'], kw: ['就一个池塘', '门票不值', '路程超远'], loc: '南昌近郊', imgKw: 'small muddy pond rural' }
        ]
    },
    food: {
        red: [
            { name: '民间瓦罐汤（孺子路店）', rating: 4.7, priceText: '人均 ¥25', tags: ['老字号', '本地人推荐'], kw: ['瓦罐汤鲜', '拌粉够味', '早餐必吃'], loc: '西湖区孺子路', imgKw: 'chinese clay pot soup traditional' },
            { name: '味福记（红谷滩万达店）', rating: 4.6, priceText: '人均 ¥70', tags: ['赣菜代表', '环境好'], kw: ['南昌炒粉', '白糖糕', '赣味十足'], loc: '红谷滩区万达广场', imgKw: 'stir fried rice noodles chinese' },
            { name: '周真真南昌粉店', rating: 4.5, priceText: '人均 ¥20', tags: ['便宜管饱', '市井风'], kw: ['拌粉爽滑', '汤底浓', '本地人从小吃'], loc: '东湖区胜利路', imgKw: 'rice noodles bowl street food' },
            { name: '打平火（船山路店）', rating: 4.7, priceText: '人均 ¥90', tags: ['小龙虾人气店', '夜宵'], kw: ['油焖大虾', '排队火爆', '蒜香浓郁'], loc: '西湖区船山路', imgKw: 'spicy crayfish dish' },
            { name: '老三样（系马桩店）', rating: 4.6, priceText: '人均 ¥65', tags: ['家常赣菜', '分量足'], kw: ['红烧肉', '打屁冲', '下饭'], loc: '西湖区系马桩', imgKw: 'braised pork chinese home dish' },
            { name: '英娥水煮（系马桩店）', rating: 4.5, priceText: '人均 ¥35', tags: ['特色水煮', '老南昌味道'], kw: ['水煮串', '学生时代回忆', '辣得过瘾'], loc: '西湖区系马桩', imgKw: 'spicy skewer hot pot street' }
        ],
        black: [
            { name: '滕王阁门口“正宗拌粉”摊', rating: 2.7, priceText: '人均 ¥48', tags: ['溢价严重'], kw: ['景区价', '难吃', '分量少'], loc: '东湖区仿古街', imgKw: 'cheap food stall tourist area' },
            { name: '火车站旁24小时大排档', rating: 2.5, priceText: '人均 ¥78', tags: ['缺斤少两', '食材不新鲜'], kw: ['先烤后算', '吃完拉肚子', '强卖'], loc: '南昌站东广场', imgKw: 'dirty night food stall' },
            { name: '中山路“网红”奶茶引流店', rating: 2.8, priceText: '人均 ¥38', tags: ['排队超久'], kw: ['排一小时', '味道一般', '宣传夸大'], loc: '西湖区中山路', imgKw: 'bubble tea shop crowded' },
            { name: '秋水广场夜市串串摊', rating: 2.9, priceText: '人均 ¥65', tags: ['强制消费'], kw: ['竹签刺客', '强卖', '不新鲜'], loc: '红谷滩区秋水广场', imgKw: 'night market skewer stall' },
            { name: '绳金塔旁“老字号”餐厅', rating: 2.8, priceText: '人均 ¥85', tags: ['名不副实'], kw: ['预制菜', '服务差', '专坑游客'], loc: '西湖区绳金塔街', imgKw: 'empty old restaurant interior' }
        ]
    },
    hotel: {
        red: [
            { name: '南昌香格里拉大酒店', rating: 4.8, priceText: '¥880/晚', tags: ['江景房', '服务贴心'], kw: ['赣江景观', '行政酒廊', '早餐丰富'], loc: '东湖区沿江北大道', imgKw: 'luxury hotel exterior river view' },
            { name: '南昌喜来登酒店', rating: 4.7, priceText: '¥760/晚', tags: ['近秋水广场', '设施新'], kw: ['红谷滩核心', '泳池好', '床品舒服'], loc: '红谷滩区赣江北大道', imgKw: 'modern hotel lobby luxury' },
            { name: '南昌瑞颐大酒店', rating: 4.6, priceText: '¥560/晚', tags: ['性价比高', '近滕王阁'], kw: ['步行到滕王阁', '早餐丰富', '江景房'], loc: '东湖区抚河北路', imgKw: 'hotel building exterior modern' },
            { name: '南昌万达嘉华酒店', rating: 4.6, priceText: '¥620/晚', tags: ['万达商圈', '亲子友好'], kw: ['床品舒服', '自助餐棒', '儿童友好'], loc: '红谷滩区凤凰中大道', imgKw: 'hotel room comfortable bed' },
            { name: '全季酒店（八一广场店）', rating: 4.5, priceText: '¥380/晚', tags: ['交通便利', '干净整洁'], kw: ['近地铁口', '安静好眠', '性价比高'], loc: '东湖区八一广场', imgKw: 'clean hotel room interior' },
            { name: '亚朵酒店（红谷滩万达店）', rating: 4.6, priceText: '¥450/晚', tags: ['服务贴心', '设施较新'], kw: ['深睡枕', '入住快', '前台热情'], loc: '红谷滩区万达广场旁', imgKw: 'modern hotel bedroom minimalist' }
        ],
        black: [
            { name: '火车站旁拉客小旅馆', rating: 2.5, priceText: '¥69/晚', tags: ['卫生堪忧', '押金套路'], kw: ['床单有味', '扣押金', '态度恶劣'], loc: '南昌站东广场', imgKw: 'shabby old hotel room' },
            { name: '八一广场“特价”招待所', rating: 2.6, priceText: '¥79/晚', tags: ['设施老旧', '隔音差'], kw: ['热水时有时无', '整晚吵', '家具破损'], loc: '东湖区广场北路', imgKw: 'old worn hostel room' },
            { name: '滕王阁旁“江景”民宿', rating: 2.8, priceText: '¥288/晚', tags: ['照骗严重'], kw: ['窗对着墙', '图片与实物不符', '卫生死角'], loc: '东湖区榕门路', imgKw: 'cramped apartment room window wall' },
            { name: '中山路胶囊青年旅舍', rating: 2.7, priceText: '¥59/晚', tags: ['空间小', '不安全'], kw: ['储物柜坏', '行李没处放', '门锁松动'], loc: '西湖区中山路', imgKw: 'capsule hostel cramped beds' },
            { name: '万寿宫旁无窗快捷宾馆', rating: 2.6, priceText: '¥89/晚', tags: ['无窗', '味道重'], kw: ['白天也开灯', '潮湿', '通风差'], loc: '西湖区船山路', imgKw: 'dark damp motel corridor' }
        ]
    }
}

const CHENGDU = {
    spot: {
        red: [
            { name: '成都大熊猫繁育研究基地', rating: 4.9, priceText: '¥55', tags: ['亲子友好', '必去', '地铁直达'], kw: ['熊猫可爱', '园区大', '值得再来', '讲解专业'], loc: '成华区外北熊猫大道1375号', imgKw: 'giant panda cute zoo' },
            { name: '宽窄巷子', rating: 4.7, priceText: '免费', tags: ['免费开放', '拍照圣地', '历史人文'], kw: ['老成都味', '巷子有格调', '盖碗茶', '人多热闹'], loc: '青羊区金河路口宽窄巷子', imgKw: 'china old alley street teahouse' },
            { name: '锦里古街', rating: 4.6, priceText: '免费', tags: ['夜景绝美', '小吃多'], kw: ['夜景好看', '小吃街', '红灯笼', '川剧表演'], loc: '武侯区武侯祠大街231号', imgKw: 'china night street red lanterns' },
            { name: '都江堰景区', rating: 4.8, priceText: '¥80', tags: ['世界遗产', '震撼'], kw: ['水利工程', '古人智慧', '讲解必听', '空气清新'], loc: '都江堰市公园路76号', imgKw: 'ancient dam river china landscape' },
            { name: '武侯祠博物馆', rating: 4.7, priceText: '¥50', tags: ['历史人文', '三国迷必去'], kw: ['三国文化', '红墙拍照', '讲解专业', '银杏'], loc: '武侯区武侯祠大街231号', imgKw: 'china temple red wall bamboo' },
            { name: '春熙路·太古里', rating: 4.6, priceText: '免费', tags: ['逛街购物', '网红打卡'], kw: ['繁华', '熊猫爬墙', '街拍', '美食集中'], loc: '锦江区春熙路', imgKw: 'chengdu city shopping street night' }
        ],
        black: [
            { name: '春熙路地铁口一日游拉客点', rating: 2.8, priceText: '¥99起', tags: ['强制购物', '行程缩水'], kw: ['强制购物', '行程缩水', '拉客缠人'], loc: '锦江区春熙路地铁站B口', imgKw: 'crowded subway exit touts' },
            { name: '熊猫基地门口野生导游', rating: 3.0, priceText: '¥60/次', tags: ['无证带团'], kw: ['讲解乱编', '乱收费', '带去购物点'], loc: '成华区熊猫大道', imgKw: 'tourist crowd zoo gate' },
            { name: '锦里门口化妆照相摊', rating: 2.9, priceText: '¥199起', tags: ['隐形消费'], kw: ['拍完加价', '底片勒索', '妆面敷衍'], loc: '武侯区武侯祠大街', imgKw: 'street photo costume stall' },
            { name: '火车站旁黑车一日游', rating: 2.6, priceText: '面议', tags: ['漫天要价'], kw: ['不打表', '绕路', '中途加价'], loc: '成都站南广场', imgKw: 'old train station square china' },
            { name: '宽窄巷子口“免费喝茶”体验店', rating: 2.7, priceText: '免费进店', tags: ['套路推销'], kw: ['进店套路', '茶叶刺客', '话术洗脑'], loc: '青羊区宽窄巷子北口', imgKw: 'tea shop sales counter' }
        ]
    },
    food: {
        red: [
            { name: '蜀大侠火锅（春熙路店）', rating: 4.8, priceText: '人均 ¥128', tags: ['本地人推荐', '江湖风'], kw: ['牛油锅香', '毛肚脆', '排队火爆', '侠客主题'], loc: '锦江区春熙路南段', imgKw: 'sichuan hotpot spicy red broth' },
            { name: '陈麻婆豆腐（骡马市总店）', rating: 4.6, priceText: '人均 ¥75', tags: ['老字号', '川菜正宗'], kw: ['麻婆豆腐正宗', '性价比高', '历史老店'], loc: '青羊区西玉龙街197号', imgKw: 'mapo tofu sichuan dish' },
            { name: '马路边边串串香（致民路店）', rating: 4.7, priceText: '人均 ¥80', tags: ['市井风', '排队王'], kw: ['锅底香', '串串新鲜', '还原老成都'], loc: '武侯区致民路56号', imgKw: 'skewer hotpot street style' },
            { name: '钟水饺（提督街店）', rating: 4.5, priceText: '人均 ¥30', tags: ['老字号', '成都小吃'], kw: ['红油水饺', '甜辣口', '皮薄馅足'], loc: '锦江区提督街7号', imgKw: 'chinese dumplings chili oil' },
            { name: '贺记蛋烘糕', rating: 4.6, priceText: '人均 ¥10', tags: ['街头小吃', '便宜大碗'], kw: ['外脆内软', '馅料多', '本地人从小吃'], loc: '青羊区文庙西街', imgKw: 'chinese street pancake snack' },
            { name: '成都吃客（致民路店）', rating: 4.7, priceText: '人均 ¥95', tags: ['创意川菜', '网红餐厅'], kw: ['裸奔坨坨虾', '特色菜', '摆盘出片'], loc: '武侯区致民路', imgKw: 'creative sichuan cuisine plating' }
        ],
        black: [
            { name: '景区门口“正宗成都小吃”大排档', rating: 2.7, priceText: '人均 ¥95', tags: ['溢价严重', '味道一般'], kw: ['又贵又难吃', '缺斤少两', '回头客为零'], loc: '青羊区长顺街', imgKw: 'tourist trap food stall' },
            { name: '春熙路自助烤肉引流店', rating: 2.8, priceText: '人均 ¥118', tags: ['隐形收费'], kw: ['茶位费刺客', '食材不新鲜', '引流套路'], loc: '锦江区春熙路', imgKw: 'greasy bbq buffet restaurant' },
            { name: '火车站旁24小时快餐店', rating: 2.5, priceText: '人均 ¥45', tags: ['食材不新鲜'], kw: ['吃完拉肚子', '预制菜', '环境油腻'], loc: '成都站南广场', imgKw: 'dirty fast food shop' },
            { name: '太古里网红奶茶排队店', rating: 3.0, priceText: '人均 ¥42', tags: ['排队超久', '溢价'], kw: ['排两小时', '味道一般', '黄牛加价'], loc: '锦江区太古里', imgKw: 'long queue bubble tea shop' },
            { name: '夜市野生烧烤摊', rating: 2.9, priceText: '人均 ¥88', tags: ['缺斤少两'], kw: ['先烤后算价', '强卖', '卫生堪忧'], loc: '武侯区倪家桥', imgKw: 'smoky night bbq stall street' }
        ]
    },
    hotel: {
        red: [
            { name: '成都博舍 The Temple House', rating: 4.9, priceText: '¥1888/晚', tags: ['设计酒店', '闹中取静'], kw: ['网红泳池', '服务贴心', '太古里旁'], loc: '锦江区笔帖式街81号', imgKw: 'boutique luxury hotel courtyard' },
            { name: '成都富力丽思卡尔顿', rating: 4.8, priceText: '¥1288/晚', tags: ['奢华五星', '早餐丰富'], kw: ['行政酒廊', '床品舒服', '下午茶棒'], loc: '青羊区顺城大街269号', imgKw: 'grand luxury hotel lobby' },
            { name: '成都瑞吉酒店', rating: 4.8, priceText: '¥1100/晚', tags: ['服务贴心', '近太古里'], kw: ['管家服务', '下午茶', '健身设施新'], loc: '锦江区崇德里1号', imgKw: 'five star hotel suite interior' },
            { name: '亚朵S酒店（春熙路店）', rating: 4.7, priceText: '¥520/晚', tags: ['性价比高', '设施较新'], kw: ['床很舒服', '深睡枕', '前台热情'], loc: '锦江区春熙路', imgKw: 'modern hotel room cozy bed' },
            { name: '全季酒店（天府广场店）', rating: 4.6, priceText: '¥420/晚', tags: ['交通便利', '干净整洁'], kw: ['近地铁', '安静好眠', '早餐不错'], loc: '青羊区天府广场东侧', imgKw: 'clean minimal hotel room' },
            { name: '成都岷山饭店', rating: 4.5, priceText: '¥480/晚', tags: ['老牌五星', '位置好'], kw: ['早餐丰富', '近机场大巴', '服务稳定'], loc: '锦江区人民南路二段55号', imgKw: 'classic hotel building exterior' }
        ],
        black: [
            { name: '春熙路“三无”低价旅馆', rating: 2.7, priceText: '¥89/晚', tags: ['卫生堪忧', '照骗严重'], kw: ['房间有味', '图片与实物不符', '床单发黄'], loc: '锦江区春熙路背街', imgKw: 'stained shabby hotel bed' },
            { name: '火车站旁拉客小宾馆', rating: 2.5, priceText: '¥79/晚', tags: ['隔音差', '设施老旧'], kw: ['隔音很差', '空调不制冷', '态度差'], loc: '成都站北广场', imgKw: 'old rundown guesthouse room' },
            { name: '景区边“江景房”民宿', rating: 2.9, priceText: '¥328/晚', tags: ['照骗严重'], kw: ['根本看不到江', '退房扯皮', '设施坏了没人修'], loc: '都江堰市幸福路', imgKw: 'disappointing small apartment room' },
            { name: '太古里旁胶囊公寓', rating: 2.8, priceText: '¥98/晚', tags: ['空间小', '位置嘈杂'], kw: ['翻身都难', '整晚吵', '储物不便'], loc: '锦江区东大街', imgKw: 'cramped capsule bed pod' },
            { name: '车站边“特价”招待所', rating: 2.6, priceText: '¥69/晚', tags: ['押金套路', '服务态度差'], kw: ['前台敷衍', '扣押金', '门窗老旧'], loc: '成都站南广场', imgKw: 'dingy old hostel corridor' }
        ]
    }
}

// ---------------- 新增 4 城（红 5 + 黑 3） ----------------
const BEIJING = {
    spot: {
        red: [
            { name: '故宫博物院', rating: 4.9, priceText: '¥60', tags: ['世界遗产', '必去'], kw: ['建筑震撼', '文物丰富', '需提前预约'], loc: '东城区景山前街4号', imgKw: 'forbidden city beijing palace' },
            { name: '八达岭长城', rating: 4.8, priceText: '¥40', tags: ['世界遗产', '雄伟壮观'], kw: ['不到长城非好汉', '视野开阔', '缆车方便'], loc: '延庆区八达岭镇', imgKw: 'great wall china mountains' },
            { name: '颐和园', rating: 4.8, priceText: '¥30', tags: ['皇家园林', '适合散步'], kw: ['昆明湖景', '长廊精美', '四季皆美'], loc: '海淀区新建宫门路19号', imgKw: 'summer palace beijing lake' },
            { name: '天坛公园', rating: 4.7, priceText: '¥34', tags: ['历史人文', '世界遗产'], kw: ['祈年殿震撼', '古柏参天', '晨练氛围好'], loc: '东城区天坛路甲1号', imgKw: 'temple of heaven beijing' },
            { name: '南锣鼓巷·什刹海', rating: 4.6, priceText: '免费', tags: ['免费开放', '胡同风情'], kw: ['老北京味', '酒吧街', '夜景好看'], loc: '东城区南锣鼓巷', imgKw: 'beijing hutong street night' }
        ],
        black: [
            { name: '前门“老北京一日游”拉客团', rating: 2.6, priceText: '¥120起', tags: ['强制购物'], kw: ['购物点超多', '行程缩水', '导游甩脸'], loc: '东城区前门大街', imgKw: 'crowded tourist group street' },
            { name: '王府井“老北京特产”刺客店', rating: 2.8, priceText: '人均 ¥180', tags: ['溢价严重'], kw: ['果脯刺客', '称重猫腻', '专坑游客'], loc: '东城区王府井大街', imgKw: 'tourist souvenir shop crowded' },
            { name: '长城“免费巴士”黑车点', rating: 2.5, priceText: '面议', tags: ['漫天要价'], kw: ['半路加价', '拉去假长城', '态度恶劣'], loc: '德胜门公交站周边', imgKw: 'old bus station china' }
        ]
    },
    food: {
        red: [
            { name: '四季民福烤鸭店（故宫店）', rating: 4.8, priceText: '人均 ¥160', tags: ['烤鸭必吃', '本地人推荐'], kw: ['鸭皮酥脆', ' view好', '排队火爆'], loc: '东城区南池子大街', imgKw: 'peking duck roast dish' },
            { name: '聚宝源（牛街总店）', rating: 4.7, priceText: '人均 ¥120', tags: ['铜锅涮肉', '老字号'], kw: ['手切鲜羊肉', '麻酱地道', '排队两小时'], loc: '西城区牛街5-2号', imgKw: 'copper pot hotpot lamb' },
            { name: '姚记炒肝店（鼓楼店）', rating: 4.5, priceText: '人均 ¥35', tags: ['京味小吃', '便宜管饱'], kw: ['炒肝浓稠', '包子个大', '豆浆地道'], loc: '东城区鼓楼东大街311号', imgKw: 'chinese breakfast pork liver bowl' },
            { name: '南门涮肉（天坛店）', rating: 4.6, priceText: '人均 ¥110', tags: ['清真涮肉', '肉质新鲜'], kw: ['鲜切羊肉', '麻酱香', '环境干净'], loc: '东城区天坛北门对面', imgKw: 'lamb hotpot slices plate' },
            { name: '护国寺小吃（总店）', rating: 4.4, priceText: '人均 ¥30', tags: ['老字号', '小吃全家福'], kw: ['豌豆黄细腻', '驴打滚软糯', '品类齐全'], loc: '西城区护国寺大街93号', imgKw: 'traditional beijing snacks plate' }
        ],
        black: [
            { name: '王府井“老字号”炸酱面引流店', rating: 2.7, priceText: '人均 ¥68', tags: ['名不副实'], kw: ['酱是甜面酱', '分量少', '专坑游客'], loc: '东城区王府井大街', imgKw: 'disappointing noodle bowl' },
            { name: '前门大街“果木烤鸭”快餐店', rating: 2.6, priceText: '人均 ¥98', tags: ['溢价严重'], kw: ['冻鸭肉', '皮不脆', '预制味'], loc: '东城区前门大街', imgKw: 'greasy roast duck cheap' },
            { name: '南锣鼓巷“网红”小吃街摊', rating: 2.8, priceText: '人均 ¥55', tags: ['排队超久'], kw: ['大鱿鱼刺客', '全国同款', '不新鲜'], loc: '东城区南锣鼓巷', imgKw: 'tourist snack street stall' }
        ]
    },
    hotel: {
        red: [
            { name: '北京饭店（王府井）', rating: 4.8, priceText: '¥1100/晚', tags: ['百年老店', '位置绝佳'], kw: ['长安街景', '历史底蕴', '服务稳重'], loc: '东城区东长安街33号', imgKw: 'grand classic hotel facade beijing' },
            { name: '北京瑰丽酒店', rating: 4.9, priceText: '¥2600/晚', tags: ['奢华五星', '设计感强'], kw: ['大堂艺术感', '下午茶精致', '健身房顶级'], loc: '朝阳区呼家楼京广中心', imgKw: 'luxury design hotel lobby' },
            { name: '亚朵S酒店（前门店）', rating: 4.7, priceText: '¥560/晚', tags: ['近前门', '设施较新'], kw: ['步行到前门', '床品舒服', '前台热情'], loc: '东城区珠市口东大街', imgKw: 'modern hotel room warm light' },
            { name: '全季酒店（天安门广场店）', rating: 4.6, priceText: '¥490/晚', tags: ['交通便利', '干净整洁'], kw: ['近地铁2号线', '安静好眠', '早餐合口'], loc: '东城区前门东路', imgKw: 'clean hotel room minimal' },
            { name: '四合院精品民宿（南锣鼓巷店）', rating: 4.7, priceText: '¥780/晚', tags: ['京味体验', '庭院安静'], kw: ['灰砖红门', '枣树院子', '房东热情'], loc: '东城区南锣鼓巷胡同内', imgKw: 'beijing courtyard siheyuan house' }
        ],
        black: [
            { name: '北京站旁“特价”地下室旅馆', rating: 2.5, priceText: '¥89/晚', tags: ['潮湿昏暗'], kw: ['半地下无窗', '霉味重', '隔音差'], loc: '北京站西街', imgKw: 'dark damp basement room' },
            { name: '前门“四合院”照骗民宿', rating: 2.7, priceText: '¥368/晚', tags: ['照骗严重'], kw: ['院子是违建', '卫生间公用', '退房扯皮'], loc: '东城区前门东侧路', imgKw: 'narrow shabby courtyard room' },
            { name: '天通苑“地铁房”公寓', rating: 2.6, priceText: '¥128/晚', tags: ['位置偏远'], kw: ['通勤两小时', '周边荒凉', '图片与实物不符'], loc: '昌平区立汤路', imgKw: 'empty suburb apartment block' }
        ]
    }
}

const XIAN = {
    spot: {
        red: [
            { name: '秦始皇兵马俑博物馆', rating: 4.9, priceText: '¥120', tags: ['世界遗产', '必去'], kw: ['震撼', '讲解必请', '一号坑最壮观'], loc: '临潼区秦陵镇', imgKw: 'terracotta army xian warriors' },
            { name: '西安城墙', rating: 4.8, priceText: '¥54', tags: ['历史人文', '骑行推荐'], kw: ['日落骑车', '城砖厚重', '夜景灯亮绝美'], loc: '碑林区南大街', imgKw: 'xian city wall ancient gate' },
            { name: '大唐不夜城', rating: 4.7, priceText: '免费', tags: ['免费开放', '夜景绝美'], kw: ['不倒翁小姐姐', '灯光秀', '汉服氛围拉满'], loc: '雁塔区大雁塔脚下', imgKw: 'xian tang dynasty night street lights' },
            { name: '陕西历史博物馆', rating: 4.8, priceText: '免费（需预约）', tags: ['文物丰富', '亲子友好'], kw: ['何家村窖藏', '讲解专业', '一票难求'], loc: '雁塔区小寨东路91号', imgKw: 'china museum artifacts bronze' },
            { name: '华清宫（骊山）', rating: 4.6, priceText: '¥120', tags: ['历史人文', '演出值得'], kw: ['长恨歌演出', '温泉遗址', '骊山晚照'], loc: '临潼区华清路38号', imgKw: 'chinese imperial palace hot spring' }
        ],
        black: [
            { name: '兵马俑门口“一日游”黑团', rating: 2.5, priceText: '¥88起', tags: ['强制购物'], kw: ['拉去玉器店', '假兵马俑', '导游态度差'], loc: '临潼区旅游专线沿途', imgKw: 'tourist bus trap crowd' },
            { name: '回民街口“老字号”泡馍引流店', rating: 2.7, priceText: '人均 ¥65', tags: ['名不副实'], kw: ['汤是料包', '馍死硬', '本地人不去'], loc: '莲湖区北院门', imgKw: 'disappointing noodle soup bowl' },
            { name: '大雁塔北广场“祈福”推销点', rating: 2.8, priceText: '¥99起', tags: ['套路推销'], kw: ['开光骗局', '强卖高香', '话术洗脑'], loc: '雁塔区大雁塔北广场', imgKw: 'incense temple stall crowded' }
        ]
    },
    food: {
        red: [
            { name: '老孙家泡馍（东关正街店）', rating: 4.6, priceText: '人均 ¥55', tags: ['老字号', '泡馍正宗'], kw: ['馍要手掰', '汤浓味醇', '糖蒜解腻'], loc: '碑林区东关正街', imgKw: 'xian paomo bread soup' },
            { name: '樊记肉夹馍（竹笆市店）', rating: 4.7, priceText: '人均 ¥20', tags: ['老字号', '腊汁肉香'], kw: ['馍脆肉香', '肥瘦相间', '排队快'], loc: '碑林区竹笆市街', imgKw: 'chinese burger roujiamo street food' },
            { name: '魏家凉皮（连锁）', rating: 4.5, priceText: '人均 ¥25', tags: ['连锁稳定', '凉皮地道'], kw: ['秘制凉皮', '肉夹馍搭着吃', '环境干净'], loc: '各区均有门店', imgKw: 'cold noodle liangpi dish' },
            { name: '醉长安（钟楼店）', rating: 4.6, priceText: '人均 ¥90', tags: ['陕菜代表', '环境好'], kw: ['葫芦鸡必点', '陕菜摆盘精', '适合宴请'], loc: '碑林区南院门', imgKw: 'shaanxi cuisine chicken dish' },
            { name: '盛志望麻酱酿皮铺', rating: 4.5, priceText: '人均 ¥15', tags: ['回坊味道', '便宜管饱'], kw: ['麻酱厚', '酿皮筋道', '本地人排队'], loc: '莲湖区大皮院', imgKw: 'sesame noodle bowl street' }
        ],
        black: [
            { name: '回民街主街“红柳烤肉”刺客摊', rating: 2.7, priceText: '人均 ¥95', tags: ['溢价严重'], kw: ['一串卖88', '肉柴', '本地人都在巷子里吃'], loc: '莲湖区北院门主街', imgKw: 'overpriced kebab stall' },
            { name: '景区门口“biangbiang面”快餐店', rating: 2.6, priceText: '人均 ¥58', tags: ['味道一般'], kw: ['面是机制的', '浇头少', '宣传照骗'], loc: '临潼区兵马俑景区门口', imgKw: 'thick noodle plain bowl' },
            { name: '火车站旁“老孙家”高仿店', rating: 2.5, priceText: '人均 ¥48', tags: ['山寨名店'], kw: ['蹭名牌', '卫生差', '吃完拉肚子'], loc: '新城区解放路', imgKw: 'shabby fake restaurant front' }
        ]
    },
    hotel: {
        red: [
            { name: '西安索菲特传奇酒店', rating: 4.8, priceText: '¥980/晚', tags: ['欧式奢华', '近钟楼'], kw: ['建筑百年', '下午茶出名', '位置核心'], loc: '新城区东新街319号', imgKw: 'grand european style hotel' },
            { name: '西安W酒店', rating: 4.7, priceText: '¥1280/晚', tags: ['设计酒店', '近大唐不夜城'], kw: ['夜景无边泳池', '潮流大堂', '年轻氛围'], loc: '雁塔区曲江新区', imgKw: 'trendy design hotel night' },
            { name: '亚朵酒店（钟楼店）', rating: 4.7, priceText: '¥470/晚', tags: ['性价比高', '近钟楼'], kw: ['步行到钟楼', '深睡枕', '前台送水'], loc: '莲湖区北大街', imgKw: 'modern hotel bedroom cozy' },
            { name: '全季酒店（大雁塔店）', rating: 4.6, priceText: '¥420/晚', tags: ['交通便利', '干净整洁'], kw: ['看得到大雁塔', '安静', '早餐合口'], loc: '雁塔区雁引路', imgKw: 'clean hotel room simple' },
            { name: '长安小镇民宿（南门店）', rating: 4.6, priceText: '¥520/晚', tags: ['汉服体验', '古风装修'], kw: ['免费汉服拍照', '院子里喝茶', '房东会攻略'], loc: '碑林区湘子庙街', imgKw: 'chinese style guesthouse courtyard' }
        ],
        black: [
            { name: '西安站旁“钟楼景”小旅馆', rating: 2.5, priceText: '¥79/晚', tags: ['照骗严重'], kw: ['根本看不到钟楼', '床单发黄', '热水小'], loc: '新城区环城北路', imgKw: 'worn out hotel room dim' },
            { name: '回民街旁无窗快捷宾馆', rating: 2.6, priceText: '¥99/晚', tags: ['无窗', '隔音差'], kw: ['白天开灯', '隔壁打呼听得见', '潮味重'], loc: '莲湖区化觉巷', imgKw: 'dark narrow motel room' },
            { name: '临潼“景区房”农家旅馆', rating: 2.7, priceText: '¥128/晚', tags: ['设施老旧'], kw: ['热水器时好时坏', '被子潮', ' WIFI 没有'], loc: '临潼区秦陵路', imgKw: 'rural guesthouse old room' }
        ]
    }
}

const HANGZHOU = {
    spot: {
        red: [
            { name: '西湖风景名胜区', rating: 4.9, priceText: '免费', tags: ['免费开放', '世界遗产'], kw: ['十景经典', '苏堤漫步', '雨天更美'], loc: '西湖区龙井路1号', imgKw: 'west lake hangzhou pagoda bridge' },
            { name: '灵隐寺·飞来峰', rating: 4.8, priceText: '¥75', tags: ['历史人文', '香火旺'], kw: ['石窟造像', '古树参天', '早去人少'], loc: '西湖区灵隐路法云弄1号', imgKw: 'lingyin temple buddha forest' },
            { name: '西溪国家湿地公园', rating: 4.7, priceText: '¥80', tags: ['自然风光', '适合摇橹'], kw: ['摇橹船舒服', '芦苇荡', '非诚勿扰取景地'], loc: '西湖区天目山路518号', imgKw: 'wetland park boat reeds' },
            { name: '京杭大运河·拱宸桥', rating: 4.6, priceText: '免费', tags: ['免费开放', '夜游推荐'], kw: ['运河夜景', '老桥韵味', '博物馆免费'], loc: '拱墅区拱宸桥', imgKw: 'grand canal hangzhou stone bridge night' },
            { name: '龙井村·九溪十八涧', rating: 4.7, priceText: '免费', tags: ['自然风光', '适合徒步'], kw: ['茶田层层', '溪水清凉', '空气极好'], loc: '西湖区龙井村', imgKw: 'tea plantation village green hills' }
        ],
        black: [
            { name: '西湖边“手划船”野船点', rating: 2.7, priceText: '¥150/半小时', tags: ['漫天要价'], kw: ['不按时计费', '绕湖半圈就收摊', '无救生衣'], loc: '西湖区湖滨路边野码头', imgKw: 'small boat lake vendor' },
            { name: '河坊街“龙井茶”现炒店', rating: 2.8, priceText: '¥198/两', tags: ['茶叶刺客'], kw: ['天价茶叶', '试喝偷换', '文化衫套路'], loc: '上城区河坊街', imgKw: 'tea shop crowded tourist' },
            { name: '雷峰塔“快速通道”黄牛点', rating: 2.6, priceText: '加价¥50', tags: ['黄牛加价'], kw: ['排队被插队', '票是假的', '进不去再收费'], loc: '西湖区南山路雷峰塔下', imgKw: 'crowded ticket queue scenic' }
        ]
    },
    food: {
        red: [
            { name: '楼外楼（孤山总店）', rating: 4.6, priceText: '人均 ¥180', tags: ['百年老店', '西湖醋鱼'], kw: ['湖景位', '醋鱼经典', '东坡肉酥烂'], loc: '西湖区孤山路30号', imgKw: 'hangzhou cuisine fish dish' },
            { name: '知味观（湖滨总店）', rating: 4.5, priceText: '人均 ¥85', tags: ['老字号', '点心全'], kw: ['小笼包汁多', '猫耳朵', '蟹黄汤包'], loc: '上城区仁和路83号', imgKw: 'chinese dim sum steamer' },
            { name: '外婆家（湖滨银泰店）', rating: 4.5, priceText: '人均 ¥78', tags: ['杭帮菜', '性价比高'], kw: ['茶香鸡', '麻婆豆腐3元', '排队取号'], loc: '上城区湖滨银泰in77', imgKw: 'hangzhou home style dishes' },
            { name: '新白鹿餐厅（西湖银泰店）', rating: 4.6, priceText: '人均 ¥70', tags: ['家常杭帮菜', '便宜大碗'], kw: ['蛋黄鸡翅', '酸汤鱼', '环境明亮'], loc: '上城区西湖银泰城', imgKw: 'chinese family restaurant dishes' },
            { name: '菊英面店（中山南路店）', rating: 4.6, priceText: '人均 ¥35', tags: ['片儿川', '本地人食堂'], kw: ['片儿川鲜', '面有嚼劲', '中午排队'], loc: '上城区中山南路', imgKw: 'noodle soup bowl chinese' }
        ],
        black: [
            { name: '河坊街“西湖醋鱼”快餐店', rating: 2.6, priceText: '人均 ¥88', tags: ['名不副实'], kw: ['鱼腥土重', '糖醋汁预制', '本地人摇头'], loc: '上城区河坊街', imgKw: 'disappointing fish dish sauce' },
            { name: '湖滨“龙井虾仁”引流店', rating: 2.7, priceText: '人均 ¥128', tags: ['溢价严重'], kw: ['虾仁是冻的', '茶味没有', '分量缩水'], loc: '上城区延安路', imgKw: 'overpriced shrimp dish' },
            { name: '灵隐寺口“素面”天价店', rating: 2.8, priceText: '人均 ¥68', tags: ['强制消费'], kw: ['一碗素面68', '加料另收费', '环境油腻'], loc: '西湖区灵隐路', imgKw: 'plain noodle bowl cheap shop' }
        ]
    },
    hotel: {
        red: [
            { name: '杭州西子湖四季酒店', rating: 4.9, priceText: '¥3800/晚', tags: ['园林酒店', '顶级度假'], kw: ['私家湖景', '江南园林', '服务无懈可击'], loc: '西湖区灵隐路5号', imgKw: 'luxury resort garden lake hangzhou' },
            { name: '杭州君悦酒店（湖滨）', rating: 4.8, priceText: '¥1500/晚', tags: ['湖景房', '位置绝佳'], kw: ['推窗见西湖', '湖滨商圈', '早餐丰富'], loc: '上城区湖滨路28号', imgKw: 'luxury hotel room lake view' },
            { name: '亚朵S酒店（西湖店）', rating: 4.7, priceText: '¥620/晚', tags: ['近西湖', '设施较新'], kw: ['步行到湖滨', '床品舒服', '前台热情'], loc: '上城区南山路', imgKw: 'modern hotel room green accent' },
            { name: '全季酒店（武林广场店）', rating: 4.6, priceText: '¥450/晚', tags: ['交通便利', '干净整洁'], kw: ['近地铁', '安静好眠', '商务首选'], loc: '下城区武林广场', imgKw: 'clean business hotel room' },
            { name: '青芝坞精品民宿', rating: 4.7, priceText: '¥580/晚', tags: ['近植物园', '设计民宿'], kw: ['白墙黛瓦', '房东做早餐', '夜景小院'], loc: '西湖区玉古路青芝坞', imgKw: 'boutique guesthouse courtyard china' }
        ],
        black: [
            { name: '西湖景区口“湖景”农民房', rating: 2.6, priceText: '¥238/晚', tags: ['照骗严重'], kw: ['房顶水箱响', '下水道反味', '图片是别人家的'], loc: '西湖区白乐桥', imgKw: 'old farm house room messy' },
            { name: '火车东站旁“特价”连锁房', rating: 2.7, priceText: '¥109/晚', tags: ['隔音差'], kw: ['走廊吵一夜', '床垫塌陷', '空调滴水'], loc: '上城区东站附近', imgKw: 'worn budget hotel room' },
            { name: '灵隐寺旁“禅意”招待所', rating: 2.5, priceText: '¥88/晚', tags: ['设施老旧'], kw: ['墙上发霉', '热水等十分钟', '蚊子多'], loc: '西湖区白乐桥村', imgKw: 'dingy old guesthouse interior' }
        ]
    }
}

const SANYA = {
    spot: {
        red: [
            { name: '蜈支洲岛', rating: 4.8, priceText: '¥144', tags: ['海岛必去', '水上项目全'], kw: ['海水能见度高', '潜水体验棒', '环岛车值得'], loc: '海棠区林旺镇后海村', imgKw: 'tropical island turquoise sea china' },
            { name: '亚龙湾热带天堂森林公园', rating: 4.7, priceText: '¥158', tags: ['热带雨林', '俯瞰亚龙湾'], kw: ['过江龙索桥', '全景玻璃栈道', '兰花小路'], loc: '吉阳区亚龙湾国家旅游区', imgKw: 'tropical rainforest park sea view' },
            { name: '南山文化旅游区', rating: 4.8, priceText: '¥108', tags: ['108米海上观音', '人文'], kw: ['海上观音震撼', '素斋好吃', '园区大'], loc: '崖州区南山村', imgKw: 'giant guanyin statue seaside' },
            { name: '后海村（皇后湾）', rating: 4.6, priceText: '免费', tags: ['免费开放', '冲浪胜地'], kw: ['新手冲浪友好', '夜市热闹', '日落绝美'], loc: '海棠区后海村', imgKw: 'surf beach sunset village' },
            { name: '椰梦长廊', rating: 4.6, priceText: '免费', tags: ['免费开放', '适合骑行'], kw: ['椰林海风', '看日落绝佳', '适合拍照'], loc: '天涯区三亚湾路', imgKw: 'coconut palm beach road sunset' }
        ],
        black: [
            { name: '大东海“免费潜水体验”推销点', rating: 2.5, priceText: '¥299起', tags: ['强制消费'], kw: ['下水加钱', '拍照另收', '教练推销'], loc: '吉阳区大东海广场沙滩', imgKw: 'beach vendor diving gear' },
            { name: '第一市场“海鲜加工”黑心店', rating: 2.6, priceText: '加工费¥198', tags: ['缺斤少两'], kw: ['调包海鲜', '加工费刺客', '死虾充活'], loc: '天涯区新建路第一市场周边', imgKw: 'seafood market stall messy' },
            { name: '天涯海角门口“带路省票”黄牛', rating: 2.7, priceText: '¥60/人', tags: ['黄牛加价'], kw: ['带进野门', '看不到景点', '钱交了人就跑'], loc: '天涯区马岭社区周边', imgKw: 'ticket scalper tourist gate' }
        ]
    },
    food: {
        red: [
            { name: '林姐香味海鲜（第一市场店）', rating: 4.7, priceText: '人均 ¥130', tags: ['本地人推荐', '加工店老牌'], kw: ['香辣蟹绝', '自己买料加工', '明码标价'], loc: '天涯区新民街115号', imgKw: 'spicy crab seafood dish' },
            { name: '阿浪海鲜（火车头万人广场店）', rating: 4.6, priceText: '人均 ¥150', tags: ['连锁加工', '分量足'], kw: ['龙虾做得好', '环境干净', '代买陪挑'], loc: '吉阳区火车站万人海鲜广场', imgKw: 'lobster seafood platter' },
            { name: '抱罗粉店（解放路老店）', rating: 4.5, priceText: '人均 ¥15', tags: ['海南小吃', '便宜管饱'], kw: ['汤头甜鲜', '牛肉干香', '本地早餐'], loc: '天涯区解放路', imgKw: 'rice noodle soup bowl' },
            { name: '椰语堂（亚龙湾店）', rating: 4.6, priceText: '人均 ¥35', tags: ['清补凉', '环境好'], kw: ['椰奶清补凉', '椰子冻', '逛累歇脚'], loc: '吉阳区亚龙湾壹号小镇', imgKw: 'coconut dessert bowl tropical' },
            { name: '小海豚海鲜广场', rating: 4.5, priceText: '人均 ¥120', tags: ['亲子友好', '一站式'], kw: ['挑虾 fresh', '蒸海鲜原味', '儿童椅备齐'], loc: '吉阳区榆亚路', imgKw: 'steamed seafood family meal' }
        ],
        black: [
            { name: '三亚湾路“拉客海鲜”流动摊', rating: 2.5, priceText: '人均 ¥260', tags: ['缺斤少两'], kw: ['先称后调包', '强推贵货', '不敢差评'], loc: '天涯区三亚湾路沿线', imgKw: 'roadside seafood stall night' },
            { name: '大东海“网红”餐厅（抖音引流店）', rating: 2.7, priceText: '人均 ¥180', tags: ['名不副实'], kw: ['摆盘好看味道差', '冻虾当鲜虾', '排队两小时'], loc: '吉阳区大东海', imgKw: 'fancy plating small portion' },
            { name: '机场旁“海南特产”刺客店', rating: 2.8, priceText: '椰子¥58/个', tags: ['溢价严重'], kw: ['水果刺客', '真空包装坑', '不退不换'], loc: '凤凰机场到达厅周边', imgKw: 'airport souvenir shop expensive' }
        ]
    },
    hotel: {
        red: [
            { name: '三亚亚特兰蒂斯酒店', rating: 4.8, priceText: '¥2588/晚', tags: ['水世界亲子', '海底套房'], kw: ['水族馆震撼', '水世界玩一天', '失落的空间'], loc: '海棠区海棠北路36号', imgKw: 'luxury resort aquarium hotel' },
            { name: '三亚亚龙湾瑞吉度假酒店', rating: 4.9, priceText: '¥2188/晚', tags: ['私人沙滩', '服务顶级'], kw: ['管家服务', '沙滩躺椅管够', '下午茶出海景'], loc: '吉阳区亚龙湾国家旅游区', imgKw: 'beach resort infinity pool sunset' },
            { name: '三亚湾红树林度假世界', rating: 4.6, priceText: '¥680/晚', tags: ['度假综合体', '性价比高'], kw: ['袋鼠面包超全', '電影院商业街', '亲子设施多'], loc: '天涯区三亚湾路', imgKw: 'resort complex pool family' },
            { name: '亚朵酒店（大东海店）', rating: 4.6, priceText: '¥520/晚', tags: ['近大东海', '设施较新'], kw: ['步行到沙滩', '早餐有海南粉', '前台热情'], loc: '吉阳区榆亚路', imgKw: 'modern hotel room bright' },
            { name: '后海冲浪主题民宿', rating: 4.7, priceText: '¥380/晚', tags: ['冲浪社区', '年轻氛围'], kw: ['步行到浪点', '教练住店里', '天台看日落'], loc: '海棠区后海村', imgKw: 'surf hostel terrace beach vibe' }
        ],
        black: [
            { name: '三亚站旁“海景房”旅馆', rating: 2.5, priceText: '¥119/晚', tags: ['照骗严重'], kw: ['海景要探头', '潮味扑鼻', '空调呼呼响'], loc: '天涯区解放路延伸段', imgKw: 'cramped motel room window small' },
            { name: '大东海“一线海景”老公寓', rating: 2.6, priceText: '¥268/晚', tags: ['设施老旧'], kw: ['家具是十年前', '泳池浑', '保安不爱理'], loc: '吉阳区大东海海花路', imgKw: 'old apartment room balcony cluttered' },
            { name: '海棠湾“镇上家庭旅馆”', rating: 2.7, priceText: '¥138/晚', tags: ['位置偏'], kw: ['离海滩三公里', '蚊子军团', '热水靠运气'], loc: '海棠区林旺镇镇上', imgKw: 'rural guesthouse simple room' }
        ]
    }
}

// ---------------- 生成 SQL ----------------
const CITIES = { '南昌': NANCHANG, '成都': CHENGDU, '北京': BEIJING, '西安': XIAN, '杭州': HANGZHOU, '三亚': SANYA }
const j = (arr) => JSON.stringify(arr).replace(/'/g, "''")
const esc = (s) => String(s).replace(/'/g, "''")

let n = 0
const rows = []
for (const [city, cats] of Object.entries(CITIES)) {
    for (const [cat, colors] of Object.entries(cats)) {
        for (const [color, items] of Object.entries(colors)) {
            items.forEach((it, i) => {
                const pos = i + 1
                const img = genImg(it.imgKw, cat, color, pos)
                rows.push(`('${esc(city)}','${cat}','${color}',${pos},'${esc(it.name)}',${it.rating},'${esc(it.priceText)}','${j(it.tags)}','${j(it.kw)}','${esc(it.loc)}','${esc(img)}','${esc(it.imgKw)}')`)
                n++
            })
        }
    }
}

const sql = `-- rank_items 榜单种子（${Object.keys(CITIES).join('/')}）
USE travel_h5;
DROP TABLE IF EXISTS rank_items;
CREATE TABLE rank_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  city VARCHAR(32) NOT NULL COMMENT '城市',
  cat VARCHAR(16) NOT NULL COMMENT 'hotel/food/spot',
  color VARCHAR(8) NOT NULL COMMENT 'red/black',
  position INT NOT NULL COMMENT '名次',
  name VARCHAR(100) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  price_text VARCHAR(64),
  tags JSON,
  kw JSON,
  loc VARCHAR(120),
  img VARCHAR(600),
  img_kw VARCHAR(200),
  PRIMARY KEY (id),
  KEY idx_city (city, cat, color)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='榜单条目';

INSERT INTO rank_items (city,cat,color,position,name,rating,price_text,tags,kw,loc,img,img_kw) VALUES
${rows.join(',\n')};
`

fs.writeFileSync(new URL('./rank_seeds.sql', import.meta.url), sql)
console.log(`OK: ${n} rows -> rank_seeds.sql`)
