// 提取必应图片搜索结果中的真实图片 URL，验证可用性
const query = '滕王阁 景点'
const url = `https://cn.bing.com/images/async?q=${encodeURIComponent(query)}&first=1&count=35&queryNegation=&form=HDRSC2`

fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'zh-CN' } })
  .then(r => r.text())
  .then(async t => {
    // 必应图片结果里 m="{...json...}"，含 mediaurl 字段
    // 提取所有 m 属性的 JSON，逐个解析拿 mediaurl
    const mJsonRe = /data-m="(\{[^"]*(?:"[^"]*"[^"]*)*\})"/g
    // 简单 fallback：直接抓 mediaurl=... 字段
    const re = /mediaurl=([^&"\\]+)/g
    const all = new Set()
    let m
    while ((m = re.exec(t)) !== null) {
      try { all.add(decodeURIComponent(m[1])) } catch (e) {}
    }
    const urls = [...all]
    console.log('unique urls:', urls.length)
    urls.slice(0, 5).forEach((u, i) => console.log(`  [${i}]`, u.slice(0, 100)))

    // 验证前 3 张图片实际可访问
    console.log('\nverifying reachability:')
    for (const u of urls.slice(0, 3)) {
      try {
        const r = await fetch(u, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
        console.log('  ', r.status, r.headers.get('content-type'), u.slice(0, 80))
      } catch (e) {
        console.log('   ERR', e.message, u.slice(0, 80))
      }
    }
  })
  .catch(e => console.error('ERR', e.message))
