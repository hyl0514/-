// 提取 Bing 托管的缩略图（tse*-mm.cn.bing.net）+ 原始 URL，验证可达性
const query = '滕王阁 景点'
const url = `https://cn.bing.com/images/async?q=${encodeURIComponent(query)}&first=1&count=35&queryNegation=&form=HDRSC2`

fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'zh-CN' } })
  .then(r => r.text())
  .then(async t => {
    // Bing 托管缩略图 src="https://tse*-mm.cn.bing.net/th/id/..."
    const thumbRe = /src="(https:\/\/tse\d+-mm\.cn\.bing\.net\/th\/id\/[^"]+)"/g
    const thumbs = []
    let m
    while ((m = thumbRe.exec(t)) !== null) thumbs.push(m[1])
    console.log('bing thumbs:', thumbs.length)
    thumbs.slice(0, 3).forEach((u, i) => console.log(`  [${i}]`, u))

    // 原始 URL
    const hrefRe = /href="([^"]*mediaurl=[^"]+)"/g
    const origs = new Set()
    let h
    while ((h = hrefRe.exec(t)) !== null) {
      const mu = h[1].match(/mediaurl=([^&]+)/)
      if (mu) origs.add(decodeURIComponent(mu[1]))
    }
    console.log('\norig unique:', origs.size)

    // 验证可达性（前 3 个 Bing 缩略图）
    console.log('\nverify bing thumbs:')
    for (const u of thumbs.slice(0, 3)) {
      try {
        const r = await fetch(u, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
        console.log('  ', r.status, r.headers.get('content-type'))
      } catch (e) { console.log('   ERR', e.message) }
    }
  })
  .catch(e => console.error('ERR', e.message))
