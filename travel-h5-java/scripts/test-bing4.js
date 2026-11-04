// 打印 Bing 图片搜索 HTML 结构片段
const query = '滕王阁 景点'
const url = `https://cn.bing.com/images/async?q=${encodeURIComponent(query)}&first=1&count=35&queryNegation=&form=HDRSC2`

fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'zh-CN' } })
  .then(r => r.text())
  .then(t => {
    // 找到第一张图片所在的 div 区域
    const idx = t.indexOf('iuscp')
    if (idx > -1) console.log('first iuscp context:', t.slice(idx, idx + 600))
    else console.log('no iuscp found')
    console.log('\n---')
    // 找 data-m 字段
    const mIdx = t.indexOf('data-m=')
    if (mIdx > -1) console.log('first data-m context:', t.slice(mIdx, mIdx + 400))
  })
  .catch(e => console.error('ERR', e.message))
