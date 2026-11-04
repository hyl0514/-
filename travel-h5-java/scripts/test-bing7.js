// 提取 Bing 自己托管的缩略图 URL（ts1.tc.mm.bing.net）+ 原始 URL
const query = '滕王阁 景点'
const url = `https://cn.bing.com/images/async?q=${encodeURIComponent(query)}&first=1&count=35&queryNegation=&form=HDRSC2`

function decodeEntities(s) {
  return s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'zh-CN' } })
  .then(r => r.text())
  .then(async t => {
    // 方法 1：从 <img class="mimg" src="..." 提取 Bing 缩略图
    const thumbRe = /<img[^>]*class="mimg"[^>]*src="([^"]+)"/g
    const thumbs = []
    let m
    while ((m = thumbRe.exec(t)) !== null) thumbs.push(m[1])

    // 方法 2：从 href 里提取原始 mediaurl
    const hrefRe = /href="([^"]*mediaurl=[^"]+)"/g
    const origs = new Set()
    let h
    while ((h = hrefRe.exec(t)) !== null) {
      const mu = h[1].match(/mediaurl=([^&]+)/)
      if (mu) origs.add(decodeURIComponent(mu[1]))
    }

    console.log('bing thumbs:', thumbs.length)
    thumbs.slice(0, 5).forEach((u, i) => console.log(`  thumb[${i}]`, u.slice(0, 120)))
    console.log('\noriginal urls (unique):', origs.size)
    Array.from(origs).slice(0, 5).forEach((u, i) => console.log(`  orig[${i}]`, u.slice(0, 100)))

    // 验证 Bing 缩略图可访问
    console.log('\nverify bing thumb[0]:')
    if (thumbs[0]) {
      try {
        const r = await fetch(thumbs[0], { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
        console.log('  ', r.status, r.headers.get('content-type'))
      } catch (e) { console.log('   ERR', e.message) }
    }
  })
  .catch(e => console.error('ERR', e.message))
