import { readFileSync, writeFileSync } from 'fs';

const filepath = 'D:\\项目文件综合\\旅游项目java(源码)\\travel-h5-java\\src\\utils\\rankData.js';
let content = readFileSync(filepath, 'utf-8');

function replaceSection(label, oldStr, newStr) {
  if (content.includes(oldStr)) {
    content = content.replace(oldStr, newStr);
    console.log('OK:', label);
  } else {
    console.log('FAIL:', label, '- string not found');
  }
}

// ===== 1. 成都 spot black: 5 -> 20 =====
replaceSection('cd spot black',
`            black: [
                { name: '春熙路地铁口一日游拉客点', rating: 2.8, priceText: '¥99起', tags: ['强制购物', '行程缩水'], kw: ['强制购物', '行程缩水', '拉客缠人'], loc: '锦江区春熙路地铁站B口', imgKw: 'chengdu,street' },
                { name: '熊猫基地门口野生导游', rating: 3.0, priceText: '¥60/次', tags: ['无证带团'], kw: ['讲解乱编', '乱收费', '带去购物点'], loc: '成华区熊猫大道', imgKw: 'panda,zoo' },
                { name: '锦里门口化妆照相摊', rating: 2.9, priceText: '¥199起', tags: ['隐形消费'], kw: ['拍完加价', '底片勒索', '妆面敷衍'], loc: '武侯区武侯祠大街', imgKw: 'china,portrait' },
                { name: '火车站旁黑车一日游', rating: 2.6, priceText: '面议', tags: ['漫天要价'], kw: ['不打表', '绕路', '中途加价'], loc: '成都站南广场', imgKw: 'train,station,china' },
                { name: '宽窄巷子口\u201c免费喝茶\u201d体验店', rating: 2.7, priceText: '免费进店', tags: ['套路推销'], kw: ['进店套路', '茶叶刺客', '话术洗脑'], loc: '青羊区宽窄巷子北口', imgKw: 'tea,shop' }
            ]
        },
        food: {`,
`            black: [
                { name: '春熙路地铁口一日游拉客点', rating: 2.8, priceText: '¥99起', tags: ['强制购物', '行程缩水'], kw: ['强制购物', '行程缩水', '拉客缠人'], loc: '锦江区春熙路地铁站B口', imgKw: 'chengdu,street' },
                { name: '熊猫基地门口野生导游', rating: 3.0, priceText: '¥60/次', tags: ['无证带团'], kw: ['讲解乱编', '乱收费', '带去购物点'], loc: '成华区熊猫大道', imgKw: 'panda,zoo' },
                { name: '锦里门口化妆照相摊', rating: 2.9, priceText: '¥199起', tags: ['隐形消费'], kw: ['拍完加价', '底片勒索', '妆面敷衍'], loc: '武侯区武侯祠大街', imgKw: 'china,portrait' },
                { name: '火车站旁黑车一日游', rating: 2.6, priceText: '面议', tags: ['漫天要价'], kw: ['不打表', '绕路', '中途加价'], loc: '成都站南广场', imgKw: 'train,station,china' },
                { name: '宽窄巷子口\u201c免费喝茶\u201d体验店', rating: 2.7, priceText: '免费进店', tags: ['套路推销'], kw: ['进店套路', '茶叶刺客', '话术洗脑'], loc: '青羊区宽窄巷子北口', imgKw: 'tea,shop' },
                { name: '景区周边\u201c正宗川菜\u201d陷阱店', rating: 2.5, priceText: '人均¥120', tags: ['价格虚高', '味道一般'], kw: ['宰客', '分量少', '服务态度差'], loc: '武侯区景区周边', imgKw: 'china,restaurant,tourist' },
                { name: '春熙路地下商场推销店', rating: 2.7, priceText: '面议', tags: ['强制消费', '商品劣质'], kw: ['推销缠人', '质量差', '退货难'], loc: '锦江区春熙路地下', imgKw: 'china,shopping,mall' },
                { name: '锦里古街高价小吃摊', rating: 2.8, priceText: '人均¥80', tags: ['价格离谱', '分量极少'], kw: ['又贵又少', '味道一般', '专坑游客'], loc: '武侯区锦里内', imgKw: 'china,street,food' },
                { name: '宽窄巷子景区纪念品店', rating: 2.6, priceText: '人均¥150', tags: ['价格虚高', '同质化严重'], kw: ['义乌货', '价格翻倍', '毫无特色'], loc: '青羊区宽窄巷子', imgKw: 'china,souvenir,shop' },
                { name: '熊猫基地周边农家乐', rating: 2.9, priceText: '人均¥90', tags: ['环境差', '菜品不新鲜'], kw: ['卫生堪忧', '食材不新鲜', '服务态度差'], loc: '成华区熊猫基地周边', imgKw: 'china,farm,restaurant' },
                { name: '成都站旁低价旅馆', rating: 2.5, priceText: '¥60/晚', tags: ['卫生差', '安全隐患'], kw: ['床单脏', '隔音差', '环境复杂'], loc: '成都站北广场', imgKw: 'china,hotel,budget' },
                { name: '景区门口\u201c特色体验\u201d店', rating: 2.7, priceText: '¥120起', tags: ['隐形消费', '体验差'], kw: ['货不对板', '强制拍照', '加钱才走'], loc: '武侯区景区门口', imgKw: 'china,tourist,trap' },
                { name: '春熙路网红打卡拍照点', rating: 2.8, priceText: '¥50/次', tags: ['收费拍照', '效果差'], kw: ['排队久', '照片敷衍', '背景杂乱'], loc: '锦江区春熙路', imgKw: 'chengdu,street,photo' },
                { name: '宽窄巷子\u201c老成都\u201d茶馆', rating: 2.9, priceText: '人均¥88', tags: ['价格虚高', '体验一般'], kw: ['茶叶普通', '环境嘈杂', '专坑游客'], loc: '青羊区宽窄巷子', imgKw: 'china,tea,house' },
                { name: '锦里古街\u201c川剧变脸\u201d表演', rating: 2.7, priceText: '¥80/位', tags: ['表演缩水', '体验差'], kw: ['时间短', '位置差', '强制拍照'], loc: '武侯区锦里内', imgKw: 'china,opera,show' },
                { name: '成都周边\u201c一日游\u201d黑团', rating: 2.4, priceText: '¥199起', tags: ['强制购物', '行程缩水'], kw: ['购物点多', '景点走马观花', '导游态度差'], loc: '成都市区集合', imgKw: 'china,tour,bus' },
                { name: '景区周边\u201c特产\u201d超市', rating: 2.6, priceText: '人均¥200', tags: ['价格虚高', '商品劣质'], kw: ['假货多', '价格离谱', '强卖'], loc: '武侯区景区周边', imgKw: 'china,specialty,shop' },
                { name: '春熙路\u201c美食城\u201d陷阱', rating: 2.5, priceText: '人均¥100', tags: ['卫生差', '味道差'], kw: ['环境脏乱', '食材不新鲜', '宰客'], loc: '锦江区春熙路', imgKw: 'china,food,court' },
                { name: '宽窄巷子\u201c手工艺品\u201d店', rating: 2.8, priceText: '人均¥180', tags: ['价格虚高', '同质化'], kw: ['义乌货', '价格翻倍', '毫无特色'], loc: '青羊区宽窄巷子', imgKw: 'china,craft,shop' },
                { name: '成都站旁\u201c快餐\u201d店', rating: 2.4, priceText: '人均¥50', tags: ['卫生差', '食材不新鲜'], kw: ['环境脏乱', '吃完拉肚子', '态度差'], loc: '成都站南广场', imgKw: 'china,fast,food' }
            ]
        },
        food: {`);

// ===== 2. 成都 food red: 6 -> 20 =====
replaceSection('cd food red',
`            red: [
                { name: '蜀大侠火锅（春熙路店）', rating: 4.8, priceText: '人均 ¥128', tags: ['本地人推荐', '江湖风'], kw: ['牛油锅香', '毛肚脆', '排队火爆', '侠客主题'], loc: '锦江区春熙路南段', imgKw: 'hotpot' },
                { name: '陈麻婆豆腐（骡马市总店）', rating: 4.6, priceText: '人均 ¥75', tags: ['老字号', '川菜正宗'], kw: ['麻婆豆腐正宗', '性价比高', '历史老店'], loc: '青羊区西玉龙街197号', imgKw: 'sichuan,food' },
                { name: '马路边边串串香（致民路店）', rating: 4.7, priceText: '人均 ¥80', tags: ['市井风', '排队王'], kw: ['锅底香', '串串新鲜', '还原老成都'], loc: '武侯区致民路56号', imgKw: 'skewer,bbq' },
                { name: '钟水饺（提督街店）', rating: 4.5, priceText: '人均 ¥30', tags: ['老字号', '成都小吃'], kw: ['红油水饺', '甜辣口', '皮薄馅足'], loc: '锦江区提督街7号', imgKw: 'dumplings' },
                { name: '贺记蛋烘糕', rating: 4.6, priceText: '人均 ¥10', tags: ['街头小吃', '便宜大碗'], kw: ['外脆内软', '馅料多', '本地人从小吃'], loc: '青羊区文庙西街', imgKw: 'street,food,china' },
                { name: '成都吃客（致民路店）', rating: 4.7, priceText: '人均 ¥95', tags: ['创意川菜', '网红餐厅'], kw: ['裸奔坨坨虾', '特色菜', '摆盘出片'], loc: '武侯区致民路', imgKw: 'chinese,cuisine' }
            ],`,
`            red: [
                { name: '蜀大侠火锅（春熙路店）', rating: 4.8, priceText: '人均 ¥128', tags: ['本地人推荐', '江湖风'], kw: ['牛油锅香', '毛肚脆', '排队火爆', '侠客主题'], loc: '锦江区春熙路南段', imgKw: 'hotpot' },
                { name: '陈麻婆豆腐（骡马市总店）', rating: 4.6, priceText: '人均 ¥75', tags: ['老字号', '川菜正宗'], kw: ['麻婆豆腐正宗', '性价比高', '历史老店'], loc: '青羊区西玉龙街197号', imgKw: 'sichuan,food' },
                { name: '马路边边串串香（致民路店）', rating: 4.7, priceText: '人均 ¥80', tags: ['市井风', '排队王'], kw: ['锅底香', '串串新鲜', '还原老成都'], loc: '武侯区致民路56号', imgKw: 'skewer,bbq' },
                { name: '钟水饺（提督街店）', rating: 4.5, priceText: '人均 ¥30', tags: ['老字号', '成都小吃'], kw: ['红油水饺', '甜辣口', '皮薄馅足'], loc: '锦江区提督街7号', imgKw: 'dumplings' },
                { name: '贺记蛋烘糕', rating: 4.6, priceText: '人均 ¥10', tags: ['街头小吃', '便宜大碗'], kw: ['外脆内软', '馅料多', '本地人从小吃'], loc: '青羊区文庙西街', imgKw: 'street,food,china' },
                { name: '成都吃客（致民路店）', rating: 4.7, priceText: '人均 ¥95', tags: ['创意川菜', '网红餐厅'], kw: ['裸奔坨虾', '特色菜', '摆盘出片'], loc: '武侯区致民路', imgKw: 'chinese,cuisine' },
                { name: '小龙坎老火锅（玉林店）', rating: 4.7, priceText: '人均 ¥110', tags: ['排队王', '牛油锅底'], kw: ['牛油锅香', '毛肚脆', '排队火爆', '服务热情'], loc: '武侯区玉林路', imgKw: 'hotpot,chengdu' },
                { name: '大龙燚火锅（九眼桥店）', rating: 4.6, priceText: '人均 ¥120', tags: ['辣度够劲', '本地人爱去'], kw: ['辣得过瘾', '菜品新鲜', '环境好', '夜宵首选'], loc: '武侯区九眼桥', imgKw: 'hotpot,spicy' },
                { name: '集渔泰式海鲜火锅', rating: 4.5, priceText: '人均 ¥130', tags: ['泰式风味', '海鲜新鲜'], kw: ['冬阴功汤底', '虾很新鲜', '环境好', '适合聚餐'], loc: '锦江区太古里', imgKw: 'thai,hotpot' },
                { name: '钢管厂五区小郡肝串串香', rating: 4.6, priceText: '人均 ¥70', tags: ['老字号串串', '市井风'], kw: ['小郡肝必点', '锅底香', '排队久', '性价比高'], loc: '锦江区东大街', imgKw: 'skewer,chengdu' },
                { name: '巴蜀大将火锅', rating: 4.5, priceText: '人均 ¥100', tags: ['三国主题', '特色菜多'], kw: ['变脸表演', '锅底香', '菜品丰富', '适合拍照'], loc: '锦江区春熙路', imgKw: 'hotpot,theme' },
                { name: '甘食记成都肥肠粉', rating: 4.5, priceText: '人均 ¥25', tags: ['成都名小吃', '早餐首选'], kw: ['肥肠处理干净', '粉条爽滑', '辣油香', '本地人推荐'], loc: '青羊区宽窄巷子', imgKw: 'noodles,chengdu' },
                { name: '严太婆锅盔', rating: 4.6, priceText: '人均 ¥15', tags: ['传统小吃', '排队名店'], kw: ['外酥里嫩', '肉馅足', '排队值得', '本地人从小吃'], loc: '青羊区文殊院', imgKw: 'guokui,chengdu' },
                { name: '洞子口张老二凉粉', rating: 4.5, priceText: '人均 ¥20', tags: ['老字号', '甜水面'], kw: ['甜水面好吃', '凉粉爽口', '价格便宜', '老店味道'], loc: '青羊区文殊院', imgKw: 'liangfen,chengdu' },
                { name: '冒椒火辣', rating: 4.6, priceText: '人均 ¥60', tags: ['冒菜名店', '辣味十足'], kw: ['冒菜好吃', '辣得过瘾', '排队火爆', '菜品新鲜'], loc: '锦江区太古里', imgKw: 'maocai,chengdu' },
                { name: '烤匠麻辣烤鱼（春熙路店）', rating: 4.5, priceText: '人均 ¥85', tags: ['烤鱼名店', '夜宵首选'], kw: ['烤鱼外焦里嫩', '麻辣够味', '配菜丰富', '适合聚餐'], loc: '锦江区春熙路', imgKw: 'grilled,fish' },
                { name: '李长清三大炮', rating: 4.4, priceText: '人均 ¥15', tags: ['传统小吃', '非遗美食'], kw: ['糯米软糯', '红糖香', '现场制作', '文化体验'], loc: '锦江区锦里', imgKw: 'sanpao,chengdu' },
                { name: '王婆串串香', rating: 4.5, priceText: '人均 ¥65', tags: ['市井串串', '本地人爱去'], kw: ['锅底香', '菜品新鲜', '价格便宜', '环境接地气'], loc: '武侯区玉林路', imgKw: 'skewer,local' },
                { name: '降龙爪爪', rating: 4.5, priceText: '人均 ¥45', tags: ['特色小吃', '卤味'], kw: ['鸡爪软糯', '卤味入味', '排队火爆', '适合打包'], loc: '锦江区春熙路', imgKw: 'chicken,feet' },
                { name: '叶婆婆钵钵鸡', rating: 4.6, priceText: '人均 ¥50', tags: ['乐山名吃', '红油香'], kw: ['红油香', '食材新鲜', '种类多', '辣而不燥'], loc: '青羊区宽窄巷子', imgKw: 'boboji,chengdu' }
            ],`);

// ===== 3. 成都 food black: 5 -> 20 =====
replaceSection('cd food black',
`            black: [
                { name: '景区门口\u201c正宗成都小吃\u201d大排档', rating: 2.7, priceText: '人均 ¥95', tags: ['溢价严重', '味道一般'], kw: ['又贵又难吃', '缺斤少两', '回头客为零'], loc: '青羊区长顺街', imgKw: 'street,food' },
                { name: '春熙路自助烤肉引流店', rating: 2.8, priceText: '人均 ¥118', tags: ['隐形收费'], kw: ['茶位费刺客', '食材不新鲜', '引流套路'], loc: '锦江区春熙路', imgKw: 'bbq' },
                { name: '火车站旁24小时快餐店', rating: 2.5, priceText: '人均 ¥45', tags: ['食材不新鲜'], kw: ['吃完拉肚子', '预制菜', '环境油腻'], loc: '成都站南广场', imgKw: 'fastfood' },
                { name: '太古里网红奶茶排队店', rating: 3.0, priceText: '人均 ¥42', tags: ['排队超久', '溢价'], kw: ['排两小时', '味道一般', '黄牛加价'], loc: '锦江区太古里', imgKw: 'bubble,tea' },
                { name: '夜市野生烧烤摊', rating: 2.9, priceText: '人均 ¥88', tags: ['缺斤少两'], kw: ['先烤后算价', '强卖', '卫生堪忧'], loc: '武侯区倪家桥', imgKw: 'bbq,night' }
            ]`,
`            black: [
                { name: '景区门口\u201c正宗成都小吃\u201d大排档', rating: 2.7, priceText: '人均 ¥95', tags: ['溢价严重', '味道一般'], kw: ['又贵又难吃', '缺斤少两', '回头客为零'], loc: '青羊区长顺街', imgKw: 'street,food' },
                { name: '春熙路自助烤肉引流店', rating: 2.8, priceText: '人均 ¥118', tags: ['隐形收费'], kw: ['茶位费刺客', '食材不新鲜', '引流套路'], loc: '锦江区春熙路', imgKw: 'bbq' },
                { name: '火车站旁24小时快餐店', rating: 2.5, priceText: '人均 ¥45', tags: ['食材不新鲜'], kw: ['吃完拉肚子', '预制菜', '环境油腻'], loc: '成都站南广场', imgKw: 'fastfood' },
                { name: '太古里网红奶茶排队店', rating: 3.0, priceText: '人均 ¥42', tags: ['排队超久', '溢价'], kw: ['排两小时', '味道一般', '黄牛加价'], loc: '锦江区太古里', imgKw: 'bubble,tea' },
                { name: '夜市野生烧烤摊', rating: 2.9, priceText: '人均 ¥88', tags: ['缺斤少两'], kw: ['先烤后算价', '强卖', '卫生堪忧'], loc: '武侯区倪家桥', imgKw: 'bbq,night' },
                { name: '锦里\u201c古法\u201d糖画摊', rating: 2.6, priceText: '人均 ¥35', tags: ['价格虚高', '卫生差'], kw: ['糖不纯', '环境脏', '专坑游客'], loc: '武侯区锦里', imgKw: 'sugar,art' },
                { name: '宽窄巷子\u201c三大炮\u201d体验店', rating: 2.7, priceText: '人均 ¥60', tags: ['价格离谱', '体验差'], kw: ['又贵又少', '味道一般', '强制拍照'], loc: '青羊区宽窄巷子', imgKw: 'sanpao,tourist' },
                { name: '春熙路\u201c网红\u201d甜品店', rating: 2.8, priceText: '人均 ¥55', tags: ['排队超久', '味道一般'], kw: ['排一小时', '味道一般', '宣传夸大'], loc: '锦江区春熙路', imgKw: 'dessert,wanghong' },
                { name: '景区旁\u201c老字号\u201d面馆', rating: 2.5, priceText: '人均 ¥68', tags: ['名不副实', '预制菜'], kw: ['预制面', '服务差', '专坑游客'], loc: '青羊区景区旁', imgKw: 'noodles,tourist' },
                { name: '火车站旁\u201c成都特产\u201d店', rating: 2.4, priceText: '人均 ¥150', tags: ['价格虚高', '商品劣质'], kw: ['假货多', '价格离谱', '强卖'], loc: '成都站南广场', imgKw: 'specialty,train' },
                { name: '太古里\u201c创意\u201d日料店', rating: 2.9, priceText: '人均 ¥180', tags: ['溢价严重', '食材一般'], kw: ['食材不新鲜', '价格虚高', '服务差'], loc: '锦江区太古里', imgKw: 'japanese,restaurant' },
                { name: '九眼桥\u201c音乐\u201d酒吧', rating: 2.7, priceText: '人均 ¥200', tags: ['强制消费', '酒水贵'], kw: ['最低消费', '酒水贵', '环境嘈杂'], loc: '武侯区九眼桥', imgKw: 'bar,night' },
                { name: '春熙路\u201c手工\u201d冰淇淋店', rating: 2.8, priceText: '人均 ¥45', tags: ['价格虚高', '味道一般'], kw: ['排长队', '味道一般', '价格离谱'], loc: '锦江区春熙路', imgKw: 'icecream,street' },
                { name: '宽窄巷子\u201c传统\u201d茶馆', rating: 2.6, priceText: '人均 ¥88', tags: ['价格虚高', '体验差'], kw: ['茶叶普通', '环境嘈杂', '专坑游客'], loc: '青羊区宽窄巷子', imgKw: 'tea,tourist' },
                { name: '锦里\u201c川剧\u201d变脸表演', rating: 2.7, priceText: '¥80/位', tags: ['表演缩水', '体验差'], kw: ['时间短', '位置差', '强制拍照'], loc: '武侯区锦里', imgKw: 'opera,tourist' },
                { name: '景区旁\u201c特色\u201d火锅', rating: 2.5, priceText: '人均 ¥130', tags: ['味道一般', '服务差'], kw: ['锅底不香', '食材不新鲜', '宰客'], loc: '青羊区景区旁', imgKw: 'hotpot,tourist' },
                { name: '春熙路\u201c网红\u201d串串店', rating: 2.8, priceText: '人均 ¥90', tags: ['排队超久', '味道一般'], kw: ['排两小时', '味道一般', '宣传夸大'], loc: '锦江区春熙路', imgKw: 'skewer,wanghong' },
                { name: '火车站旁\u201c24小时\u201d面馆', rating: 2.4, priceText: '人均 ¥35', tags: ['卫生差', '食材不新鲜'], kw: ['环境脏乱', '吃完拉肚子', '态度差'], loc: '成都站南广场', imgKw: 'noodles,station' },
                { name: '太古里\u201c精品\u201d咖啡', rating: 2.9, priceText: '人均 ¥65', tags: ['价格虚高', '味道一般'], kw: ['咖啡一般', '价格离谱', '环境嘈杂'], loc: '锦江区太古里', imgKw: 'coffee,wanghong' },
                { name: '宽窄巷子\u201c手工\u201d糕点', rating: 2.7, priceText: '人均 ¥50', tags: ['价格虚高', '同质化'], kw: ['义乌货', '价格翻倍', '毫无特色'], loc: '青羊区宽窄巷子', imgKw: 'pastry,tourist' }
            ]`);

// ===== 4. 成都 hotel red: 6 -> 20 =====
replaceSection('cd hotel red',
`            red: [
                { name: '成都博舍 The Temple House', rating: 4.9, priceText: '¥1888/晚', tags: ['设计酒店', '闹中取静'], kw: ['网红泳池', '服务贴心', '太古里旁'], loc: '锦江区笔帖式街81号', imgKw: 'luxury,hotel' },
                { name: '成都富力丽思卡尔顿', rating: 4.8, priceText: '¥1288/晚', tags: ['奢华五星', '早餐丰富'], kw: ['行政酒廊', '床品舒服', '下午茶棒'], loc: '青羊区顺城大街269号', imgKw: 'luxury,hotel' },
                { name: '成都瑞吉酒店', rating: 4.8, priceText: '¥1100/晚', tags: ['服务贴心', '近太古里'], kw: ['管家服务', '下午茶', '健身设施新'], loc: '锦江区崇德里1号', imgKw: 'hotel,lobby' },
                { name: '亚朵S酒店（春熙路店）', rating: 4.7, priceText: '¥520/晚', tags: ['性价比高', '设施较新'], kw: ['床很舒服', '深睡枕', '前台热情'], loc: '锦江区春熙路', imgKw: 'hotel,bedroom' },
                { name: '全季酒店（天府广场店）', rating: 4.6, priceText: '¥420/晚', tags: ['交通便利', '干净整洁'], kw: ['近地铁', '安静好眠', '早餐不错'], loc: '青羊区天府广场东侧', imgKw: 'hotel,room' },
                { name: '成都岷山饭店', rating: 4.5, priceText: '¥480/晚', tags: ['老牌五星', '位置好'], kw: ['早餐丰富', '近机场大巴', '服务稳定'], loc: '锦江区人民南路二段55号', imgKw: 'hotel,building' }
            ],`,
`            red: [
                { name: '成都博舍 The Temple House', rating: 4.9, priceText: '¥1888/晚', tags: ['设计酒店', '闹中取静'], kw: ['网红泳池', '服务贴心', '太古里旁'], loc: '锦江区笔帖式街81号', imgKw: 'luxury,hotel' },
                { name: '成都富力丽思卡尔顿', rating: 4.8, priceText: '¥1288/晚', tags: ['奢华五星', '早餐丰富'], kw: ['行政酒廊', '床品舒服', '下午茶棒'], loc: '青羊区顺城大街269号', imgKw: 'luxury,hotel' },
                { name: '成都瑞吉酒店', rating: 4.8, priceText: '¥1100/晚', tags: ['服务贴心', '近太古里'], kw: ['管家服务', '下午茶', '健身设施新'], loc: '锦江区崇德里1号', imgKw: 'hotel,lobby' },
                { name: '亚朵S酒店（春熙路店）', rating: 4.7, priceText: '¥520/晚', tags: ['性价比高', '设施较新'], kw: ['床很舒服', '深睡枕', '前台热情'], loc: '锦江区春熙路', imgKw: 'hotel,bedroom' },
                { name: '全季酒店（天府广场店）', rating: 4.6, priceText: '¥420/晚', tags: ['交通便利', '干净整洁'], kw: ['近地铁', '安静好眠', '早餐不错'], loc: '青羊区天府广场东侧', imgKw: 'hotel,room' },
                { name: '成都岷山饭店', rating: 4.5, priceText: '¥480/晚', tags: ['老牌五星', '位置好'], kw: ['早餐丰富', '近机场大巴', '服务稳定'], loc: '锦江区人民南路二段55号', imgKw: 'hotel,building' },
                { name: '成都华尔道夫酒店', rating: 4.8, priceText: '¥1500/晚', tags: ['奢华五星', '服务顶级'], kw: ['行政酒廊', '床品顶级', '管家服务'], loc: '高新区天府大道', imgKw: 'waldorf,hotel' },
                { name: '成都尼依格罗酒店', rating: 4.7, priceText: '¥1200/晚', tags: ['时尚设计', '高空景观'], kw: ['高空景观', '设计感强', '服务贴心'], loc: '锦江区红星路', imgKw: 'niccolo,hotel' },
                { name: '成都群光君悦酒店', rating: 4.7, priceText: '¥900/晚', tags: ['位置优越', '早餐丰富'], kw: ['春熙路旁', '早餐丰富', '床品舒服'], loc: '锦江区春熙路', imgKw: 'grand,hyatt' },
                { name: '成都茂业JW万豪酒店', rating: 4.7, priceText: '¥850/晚', tags: ['商务首选', '设施完善'], kw: ['行政酒廊', '健身设施', '服务专业'], loc: '锦江区东御街', imgKw: 'jw,marriott' },
                { name: '成都香格里拉大酒店', rating: 4.6, priceText: '¥780/晚', tags: ['江景房', '服务贴心'], kw: ['锦江景观', '早餐丰富', '泳池好'], loc: '锦江区滨江东路', imgKw: 'shangrila,chengdu' },
                { name: '成都世纪城天堂洲际大饭店', rating: 4.6, priceText: '¥700/晚', tags: ['会展首选', '设施完善'], kw: ['会议设施', '早餐丰富', '位置便利'], loc: '高新区世纪城路', imgKw: 'intercontinental,hotel' },
                { name: '成都首座万豪酒店', rating: 4.6, priceText: '¥680/晚', tags: ['商务酒店', '交通便利'], kw: ['近地铁', '早餐丰富', '服务专业'], loc: '武侯区天府大道', imgKw: 'marriott,chengdu' },
                { name: '成都协信中心希尔顿酒店', rating: 4.5, priceText: '¥600/晚', tags: ['位置好', '设施新'], kw: ['床品舒服', '早餐丰富', '健身设施'], loc: '成华区府青路', imgKw: 'hilton,chengdu' },
                { name: '成都环球中心天堂洲际酒店', rating: 4.6, priceText: '¥750/晚', tags: ['地标建筑', '设施完善'], kw: ['环球中心', '泳池好', '早餐丰富'], loc: '高新区天府大道', imgKw: 'intercontinental,global' },
                { name: '成都明宇尚雅饭店', rating: 4.5, priceText: '¥550/晚', tags: ['性价比高', '位置好'], kw: ['近地铁', '早餐丰富', '服务热情'], loc: '锦江区人民南路', imgKw: 'mingyu,hotel' },
                { name: '成都望江宾馆', rating: 4.5, priceText: '¥500/晚', tags: ['园林酒店', '环境好'], kw: ['园林环境', '安静', '早餐丰富'], loc: '锦江区下沙河铺', imgKw: 'wangjiang,hotel' },
                { name: '成都费尔顿凯莱大酒店', rating: 4.5, priceText: '¥480/晚', tags: ['商务酒店', '设施完善'], kw: ['近地铁', '早餐丰富', '服务专业'], loc: '武侯区科华北路', imgKw: 'felton,hotel' },
                { name: '成都新东方千禧大酒店', rating: 4.5, priceText: '¥450/晚', tags: ['位置好', '性价比高'], kw: ['近地铁', '早餐丰富', '床品舒服'], loc: '武侯区科华北路', imgKw: 'millennium,hotel' },
                { name: '成都城市名人酒店', rating: 4.4, priceText: '¥400/晚', tags: ['商务酒店', '交通便利'], kw: ['近地铁', '早餐丰富', '服务热情'], loc: '青羊区人民南路', imgKw: 'celebrity,hotel' }
            ],`);

// ===== 5. 成都 hotel black: 5 -> 20 =====
replaceSection('cd hotel black',
`            black: [
                { name: '春熙路\u201c三无\u201d低价旅馆', rating: 2.7, priceText: '¥89/晚', tags: ['卫生堪忧', '照骗严重'], kw: ['房间有味', '图片与实物不符', '床单发黄'], loc: '锦江区春熙路背街', imgKw: 'old,hotel' },
                { name: '火车站旁拉客小宾馆', rating: 2.5, priceText: '¥79/晚', tags: ['隔音差', '设施老旧'], kw: ['隔音很差', '空调不制冷', '态度差'], loc: '成都站北广场', imgKw: 'old,building' },
                { name: '景区边\u201c江景房\u201d民宿', rating: 2.9, priceText: '¥328/晚', tags: ['照骗严重'], kw: ['根本看不到江', '退房扯皮', '设施坏了没人修'], loc: '都江堰市幸福路', imgKw: 'apartment,interior' },
                { name: '太古里旁胶囊公寓', rating: 2.8, priceText: '¥98/晚', tags: ['空间小', '位置嘈杂'], kw: ['翻身都难', '整晚吵', '储物不便'], loc: '锦江区东大街', imgKw: 'capsule,hotel' },
                { name: '车站边\u201c特价\u201d招待所', rating: 2.6, priceText: '¥69/晚', tags: ['押金套路', '服务态度差'], kw: ['前台敷衍', '扣押金', '门窗老旧'], loc: '成都站南广场', imgKw: 'hostel' }
            ]`,
`            black: [
                { name: '春熙路\u201c三无\u201d低价旅馆', rating: 2.7, priceText: '¥89/晚', tags: ['卫生堪忧', '照骗严重'], kw: ['房间有味', '图片与实物不符', '床单发黄'], loc: '锦江区春熙路背街', imgKw: 'old,hotel' },
                { name: '火车站旁拉客小宾馆', rating: 2.5, priceText: '¥79/晚', tags: ['隔音差', '设施老旧'], kw: ['隔音很差', '空调不制冷', '态度差'], loc: '成都站北广场', imgKw: 'old,building' },
                { name: '景区边\u201c江景房\u201d民宿', rating: 2.9, priceText: '¥328/晚', tags: ['照骗严重'], kw: ['根本看不到江', '退房扯皮', '设施坏了没人修'], loc: '都江堰市幸福路', imgKw: 'apartment,interior' },
                { name: '太古里旁胶囊公寓', rating: 2.8, priceText: '¥98/晚', tags: ['空间小', '位置嘈杂'], kw: ['翻身都难', '整晚吵', '储物不便'], loc: '锦江区东大街', imgKw: 'capsule,hotel' },
                { name: '车站边\u201c特价\u201d招待所', rating: 2.6, priceText: '¥69/晚', tags: ['押金套路', '服务态度差'], kw: ['前台敷衍', '扣押金', '门窗老旧'], loc: '成都站南广场', imgKw: 'hostel' },
                { name: '宽窄巷子\u201c精品\u201d民宿', rating: 2.7, priceText: '¥258/晚', tags: ['照骗严重', '卫生差'], kw: ['图片与实物不符', '卫生死角', '隔音差'], loc: '青羊区宽窄巷子', imgKw: 'minsu,tourist' },
                { name: '锦里旁\u201c特色\u201d客栈', rating: 2.8, priceText: '¥198/晚', tags: ['设施老旧', '服务差'], kw: ['设施坏了没人修', '前台态度差', '环境嘈杂'], loc: '武侯区锦里', imgKw: 'inn,tourist' },
                { name: '春熙路\u201c网红\u201d公寓', rating: 2.7, priceText: '¥168/晚', tags: ['照骗严重', '位置差'], kw: ['图片与实物不符', '位置偏僻', '隔音差'], loc: '锦江区春熙路', imgKw: 'apartment,wanghong' },
                { name: '景区旁\u201c观景\u201d酒店', rating: 2.6, priceText: '¥288/晚', tags: ['照骗严重', '价格虚高'], kw: ['根本看不到景', '价格离谱', '服务差'], loc: '都江堰市景区旁', imgKw: 'hotel,tourist' },
                { name: '火车站旁\u201c快捷\u201d酒店', rating: 2.5, priceText: '¥128/晚', tags: ['卫生差', '设施老旧'], kw: ['床单脏', '空调不制冷', '环境复杂'], loc: '成都站南广场', imgKw: 'hotel,station' },
                { name: '太古里\u201c设计\u201d民宿', rating: 2.8, priceText: '¥228/晚', tags: ['照骗严重', '位置差'], kw: ['图片与实物不符', '位置偏僻', '隔音差'], loc: '锦江区太古里', imgKw: 'minsu,design' },
                { name: '九眼桥\u201c江景\u201d公寓', rating: 2.7, priceText: '¥198/晚', tags: ['照骗严重', '环境嘈杂'], kw: ['根本看不到江', '整晚吵', '卫生差'], loc: '武侯区九眼桥', imgKw: 'apartment,bar' },
                { name: '宽窄巷子\u201c文化\u201d主题酒店', rating: 2.6, priceText: '¥268/晚', tags: ['设施老旧', '服务差'], kw: ['设施坏了没人修', '前台态度差', '环境嘈杂'], loc: '青羊区宽窄巷子', imgKw: 'hotel,theme' },
                { name: '春熙路\u201c商务\u201d快捷酒店', rating: 2.5, priceText: '¥158/晚', tags: ['卫生差', '隔音差'], kw: ['床单脏', '隔音很差', '环境复杂'], loc: '锦江区春熙路', imgKw: 'hotel,budget' },
                { name: '景区旁\u201c亲子\u201d民宿', rating: 2.7, priceText: '¥238/晚', tags: ['照骗严重', '设施差'], kw: ['图片与实物不符', '设施坏了没人修', '卫生差'], loc: '都江堰市景区旁', imgKw: 'minsu,family' },
                { name: '火车站旁\u201c24小时\u201d旅馆', rating: 2.4, priceText: '¥88/晚', tags: ['卫生差', '安全隐患'], kw: ['床单脏', '环境复杂', '隔音差'], loc: '成都站北广场', imgKw: 'hotel,24h' },
                { name: '锦里\u201c古色\u201d客栈', rating: 2.6, priceText: '¥178/晚', tags: ['设施老旧', '服务差'], kw: ['设施坏了没人修', '前台态度差', '环境嘈杂'], loc: '武侯区锦里', imgKw: 'inn,ancient' },
                { name: '太古里\u201c时尚\u201d公寓', rating: 2.8, priceText: '¥208/晚', tags: ['照骗严重', '位置差'], kw: ['图片与实物不符', '位置偏僻', '隔音差'], loc: '锦江区太古里', imgKw: 'apartment,fashion' },
                { name: '宽窄巷子\u201c传统\u201d民宿', rating: 2.7, priceText: '¥218/晚', tags: ['照骗严重', '卫生差'], kw: ['图片与实物不符', '卫生死角', '隔音差'], loc: '青羊区宽窄巷子', imgKw: 'minsu,traditional' },
                { name: '春熙路\u201c精品\u201d酒店', rating: 2.5, priceText: '¥188/晚', tags: ['卫生差', '服务差'], kw: ['床单脏', '前台态度差', '环境嘈杂'], loc: '锦江区春熙路', imgKw: 'hotel,boutique' }
            ]`);

writeFileSync(filepath, content, 'utf-8');
console.log('\nAll 成都 sections written successfully!');
