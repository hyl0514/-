// 提取 Bing 自己托管的缩略图 URL（最稳定，可国内访问）
const query = '滕王阁 景点'
const url = `https://cn.bing.com/images/async?q=${encodeURIComponent(query)}&first=1&count=35&queryNegation=&form=HDRSC2`

fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'zh-CN' } })
  .then(r => r.text())
  .then(async t => {
    // 每条结果的 .iuscp 元素有 data-m 属性，是一个 JSON 字符串
    const mRe = /<div class="iuscp"[^>]*data-m="([^"]+)"/g
    const turlRe = /<img class="mimg"[^>]*src="([^"]+)"/g
    const results = []
    let m
    while ((m = mRe.exec(t)) !== null) {
      try {
        // HTML 实体解码（&quot; → "）
        const json = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')
        const obj = JSON.parse(json)
        // murl = 原图 URL，turl = Bing 缩略图 URL
        results.push({
          murl: obj.murl,
          turl: obj.turl,
          desc: obj.desc,
          width: obj.mw,
          height: obj.mh
        })
      } catch (e) {}
    }
    console.log('parsed results:', results.length)
    results.slice(0, 5).forEach((r, i) => console.log(`  [${i}]`, JSON.stringify(r).slice(0, 200)))

    // 验证 Bing turl 可访问
    console.log('\nverifying bing turl:')
    for (const r of results.slice(0, 3)) {
      if (!r.turl) continue
      try {
        const resp = await fetch(r.turl, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
        console.log('  ', resp.status, resp.headers.get('content-type'), r.turl.slice(0, 80))
      } catch (e) {
        console.log('   ERR', e.message)
      }
    }
  })
  .catch(e => console.error('ERR', e.message))
