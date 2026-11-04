// 解析 Bing 图片搜索结果的 data-m JSON
const query = '滕王阁 景点'
const url = `https://cn.bing.com/images/async?q=${encodeURIComponent(query)}&first=1&count=35&queryNegation=&form=HDRSC2`

function decodeEntities(s) {
  return s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'zh-CN' } })
  .then(r => r.text())
  .then(async t => {
    // data-m="..." 是 HTML 实体编码后的 JSON
    const mRe = /data-m="(\{[^"]*(?:"[^"]*"[^"]*)*\})"/g
    const results = []
    let m
    while ((m = mRe.exec(t)) !== null) {
      try {
        const json = decodeEntities(m[1])
        const obj = JSON.parse(json)
        results.push(obj)
      } catch (e) {
        // 长度可能太长，先打印失败原因
        if (results.length === 0) console.log('parse err:', e.message, '\n  raw:', m[1].slice(0, 200))
      }
    }
    console.log('parsed results:', results.length)
    if (results[0]) {
      console.log('first result keys:', Object.keys(results[0]))
      console.log('first result:', JSON.stringify(results[0], null, 2).slice(0, 500))
    }

    // 如果上面没解析出来，从 href 里的 mediaurl= 提取
    if (!results.length) {
      console.log('\n--- fallback: parse mediaurl from href ---')
      const hrefRe = /href="([^"]*mediaurl=[^"]+)"/g
      const urls = []
      let h
      while ((h = hrefRe.exec(t)) !== null) {
        const mu = h[1].match(/mediaurl=([^&]+)/)
        if (mu) urls.push(decodeURIComponent(mu[1]))
      }
      console.log('urls from href:', urls.length)
      urls.slice(0, 5).forEach((u, i) => console.log(`  [${i}]`, u.slice(0, 100)))
    }
  })
  .catch(e => console.error('ERR', e.message))
