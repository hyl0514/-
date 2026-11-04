// 测试必应图片搜索 - 验证可行性
const query = '滕王阁 景点'
const url = `https://cn.bing.com/images/async?q=${encodeURIComponent(query)}&first=1&count=35&queryNegation=&form=HDRSC2`

fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'zh-CN' } })
  .then(r => { console.log('status', r.status); return r.text() })
  .then(t => {
    console.log('len', t.length)
    // 必应图片结果里 m.mediaurl 是原始图片 URL（已 URL 编码）
    const re = /mediaurl=([^&"\\]+)/g
    const all = []
    let m
    while ((m = re.exec(t)) !== null) { all.push(decodeURIComponent(m[1])) }
    console.log('first 3 mediaurls:')
    all.slice(0, 3).forEach((u, i) => console.log(`  [${i}]`, u.slice(0, 120)))
    console.log('total', all.length)
  })
  .catch(e => console.error('ERR', e.message, e.cause?.code))
