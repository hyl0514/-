// 批量从百度图片搜索拉取真实场所图片 URL，输出到 src/utils/imgMap.js
// 百度图片对中文酒店/餐厅/景点全名命中率远高于 Bing
// 全局去重保证每个 key 唯一
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// (key → 百度搜索 query) 清单，query 用场所全名精确匹配
const PAIRS = [
  // 景点 - 红榜
  ['成都大熊猫繁育研究基地', '成都大熊猫繁育研究基地'],
  ['宽窄巷子', '成都宽窄巷子'],
  ['锦里古街', '成都锦里古街'],
  ['都江堰景区', '都江堰景区'],
  ['武侯祠博物馆', '成都武侯祠博物馆'],
  ['春熙路·太古里', '成都春熙路太古里'],
  ['滕王阁', '南昌滕王阁'],
  ['万寿宫历史文化街区', '南昌万寿宫历史文化街区'],
  ['秋水广场', '南昌秋水广场'],
  ['南昌八一起义纪念馆', '南昌八一起义纪念馆'],
  ['江西省博物馆新馆', '江西省博物馆新馆'],
  ['艾溪湖湿地公园', '南昌艾溪湖湿地公园'],
  ['杭州西湖风景名胜区', '杭州西湖'],
  ['北京故宫博物院', '故宫博物院 北京'],
  ['西安秦始皇兵马俑', '秦始皇兵马俑'],
  ['上海外滩', '上海外滩'],
  ['断桥残雪', '杭州西湖断桥残雪'],
  ['雷峰塔', '杭州雷峰塔'],
  ['灵隐寺', '杭州灵隐寺'],
  ['龙井村', '杭州龙井村'],
  ['钟鼓楼', '西安钟鼓楼'],
  ['回民街', '西安回民街'],
  ['大唐不夜城', '西安大唐不夜城'],
  ['永兴坊', '西安永兴坊'],
  ['大雁塔', '西安大雁塔'],
  ['西安城墙', '西安城墙'],
  ['碑林博物馆', '西安碑林博物馆'],
  ['天安门广场', '北京天安门广场'],
  ['王府井', '北京王府井'],
  ['八达岭长城', '八达岭长城'],
  ['奥林匹克公园', '北京奥林匹克公园'],
  ['颐和园', '北京颐和园'],
  ['圆明园', '北京圆明园'],
  ['南锣鼓巷', '北京南锣鼓巷'],
  ['什刹海', '北京什刹海'],
  ['亚龙湾', '三亚亚龙湾'],
  ['百花谷商业街', '三亚百花谷'],
  ['蜈支洲岛', '三亚蜈支洲岛'],
  ['后海村', '三亚后海村'],
  ['热带天堂森林公园', '三亚热带天堂森林公园'],
  ['第一市场', '三亚第一市场'],
  ['天涯海角', '三亚天涯海角'],
  ['椰梦长廊', '三亚椰梦长廊'],
  ['西湖', '杭州西湖'],
  // 美食 - 用店名全名
  ['蜀大侠火锅（春熙路店）', '蜀大侠火锅 春熙路'],
  ['陈麻婆豆腐（骡马市总店）', '陈麻婆豆腐 成都'],
  ['马路边边串串香（致民路店）', '马路边边串串香'],
  ['钟水饺（提督街店）', '钟水饺 成都'],
  ['贺记蛋烘糕', '贺记蛋烘糕 成都'],
  ['成都吃客（致民路店）', '成都吃客 致民路'],
  ['民间瓦罐汤（孺子路店）', '南昌瓦罐汤 民间瓦罐汤'],
  ['味福记（红谷滩万达店）', '味福记 南昌'],
  ['周真真南昌粉店', '周真真南昌粉店'],
  ['打平火（船山路店）', '打平火 南昌 小龙虾'],
  ['老三样（系马桩店）', '南昌老三样 赣菜'],
  ['英娥水煮（系马桩店）', '英娥水煮 南昌'],
  ['成都小龙坎火锅', '小龙坎火锅 成都'],
  ['杭州外婆家', '外婆家 杭州 餐厅'],
  ['重庆朝天门火锅', '重庆朝天门火锅'],
  ['广州陶陶居', '广州陶陶居'],
  ['西安老孙家泡馍', '老孙家羊肉泡馍 西安'],
  // 酒店 - 用酒店全名
  ['成都博舍 The Temple House', '成都博舍 The Temple House'],
  ['成都富力丽思卡尔顿', '成都富力丽思卡尔顿酒店'],
  ['成都瑞吉酒店', '成都瑞吉酒店'],
  ['亚朵S酒店（春熙路店）', '亚朵S酒店 成都春熙路'],
  ['全季酒店（天府广场店）', '全季酒店 成都天府广场'],
  ['成都岷山饭店', '成都岷山饭店'],
  ['南昌香格里拉大酒店', '南昌香格里拉大酒店'],
  ['南昌喜来登酒店', '南昌喜来登酒店'],
  ['南昌瑞颐大酒店', '南昌瑞颐大酒店'],
  ['南昌万达嘉华酒店', '南昌万达嘉华酒店'],
  ['全季酒店（八一广场店）', '全季酒店 南昌八一广场'],
  ['亚朵酒店（红谷滩万达店）', '亚朵酒店 南昌红谷滩'],
  // 收藏页面 - 真实热门酒店
  ['北京王府井文华东方酒店', '北京王府井文华东方酒店'],
  ['上海外滩华尔道夫酒店', '上海外滩华尔道夫酒店'],
  ['三亚亚特兰蒂斯酒店', '三亚亚特兰蒂斯酒店'],
  ['杭州西子湖四季酒店', '杭州西子湖四季酒店'],
  // 行程封面 / 路线封面
  ['成都经典三日游', '成都 宽窄巷子'],
  ['杭州西湖深度游', '杭州西湖'],
  ['西安美食之旅', '西安回民街'],
  ['北京人文四日', '故宫博物院 北京'],
  ['三亚海滨度假', '三亚亚龙湾'],
  ['都江堰·熊猫基地', '都江堰景区'],
  ['滕王阁·武功山', '南昌滕王阁'],
  ['南昌本地深度游', '南昌滕王阁'],
  ['寒假三亚度假', '三亚亚龙湾'],
  ['三亚亚龙湾', '三亚亚龙湾'],
  // 黑榜通用图
  ['黑榜景点', '景区拉客 一日游'],
  ['黑榜美食', '路边摊小吃'],
  ['黑榜酒店', '快捷宾馆'],
]

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// 拉取百度图片搜索结果
async function fetchThumbs(query) {
  const url = `https://image.baidu.com/search/acjson?tn=resultjson_com&word=${encodeURIComponent(query)}&pn=0&rn=15&ie=utf-8`
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'zh-CN' } })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const d = await r.json()
  const out = []
  const seen = new Set()
  for (const it of (d.data || [])) {
    if (!it.thumbURL) continue
    // 改 w/h 到 600/450
    let u = it.thumbURL.replace(/\?w=\d+&h=\d+/, '?w=600&h=450')
    if (!seen.has(u)) { seen.add(u); out.push(u) }
  }
  return out
}

async function verifyImg(url) {
  try {
    const r = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
    return r.status === 200
  } catch { return false }
}

async function main() {
  const map = {}
  const usedUrls = new Set()
  const failed = []

  for (let i = 0; i < PAIRS.length; i++) {
    const [key, query] = PAIRS[i]
    try {
      const thumbs = await fetchThumbs(query)
      if (!thumbs.length) {
        failed.push({ key, query, reason: 'no thumbs' })
        console.log(`[${i + 1}/${PAIRS.length}] NO-THUMB ${key}`)
        continue
      }
      let chosen = null
      for (const u of thumbs) {
        if (usedUrls.has(u)) continue
        if (await verifyImg(u)) { chosen = u; break }
      }
      if (!chosen) {
        // 所有未用过的都验证失败，回退到第一张已用过的
        for (const u of thumbs) {
          if (await verifyImg(u)) { chosen = u; break }
        }
      }
      if (chosen) {
        map[key] = chosen
        usedUrls.add(chosen)
        console.log(`[${i + 1}/${PAIRS.length}] OK  ${key}`)
      } else {
        failed.push({ key, query, reason: 'all verify fail' })
        console.log(`[${i + 1}/${PAIRS.length}] VRF-FAIL ${key}`)
      }
    } catch (e) {
      failed.push({ key, query, reason: e.message })
      console.log(`[${i + 1}/${PAIRS.length}] FAIL ${key}: ${e.message}`)
    }
    await sleep(150)
  }

  const lines = []
  lines.push('// 由 scripts/gen-img-map.js 自动生成 - 真实场所图片 URL 映射')
  lines.push('// 来源：百度图片搜索 thumbURL，去重保证每个 key 唯一')
  lines.push('')
  lines.push('export const imgMap = {')
  for (const [key, u] of Object.entries(map)) {
    lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(u)},`)
  }
  lines.push('}')
  lines.push('')
  lines.push('// 按 name 取图；未命中则回退 fallback（如 picsum）')
  lines.push('export function getImg(name, fallback) {')
  lines.push('  return imgMap[name] || fallback')
  lines.push('}')
  lines.push('')

  const outPath = path.resolve(__dirname, '..', 'src', 'utils', 'imgMap.js')
  fs.writeFileSync(outPath, lines.join('\n'))
  console.log(`\nwritten: ${outPath}`)
  console.log(`mapped: ${Object.keys(map).length} / ${PAIRS.length}`)
  console.log(`unique urls: ${usedUrls.size}`)

  if (failed.length) {
    console.log('\nFAILED:')
    failed.forEach(f => console.log(`  - ${f.key} (${f.query}): ${f.reason}`))
  }
}

main().catch(e => { console.error('FATAL', e); process.exit(1) })
