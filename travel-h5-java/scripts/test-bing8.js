// 查看 Bing 图片搜索的 img 标签实际写法
const query = '滕王阁 景点'
const url = `https://cn.bing.com/images/async?q=${encodeURIComponent(query)}&first=1&count=35&queryNegation=&form=HDRSC2`

fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'zh-CN' } })
  .then(r => r.text())
  .then(t => {
    // 找到第一条 img 标签
    const imgIdx = t.indexOf('<img')
    if (imgIdx > -1) {
      console.log('first img tag context:')
      console.log(t.slice(imgIdx, imgIdx + 400))
    }
    console.log('\n---\n')
    // 找到 th/id/R-C 这种 Bing 缩略图 URL
    const re = /src="(https:\/\/ts\d+\.tc\.mm\.bing\.net\/th[^"]+)"/g
    const urls = []
    let m
    while ((m = re.exec(t)) !== null) urls.push(m[1])
    console.log('bing thumbnail urls:', urls.length)
    urls.slice(0, 3).forEach((u, i) => console.log(`  [${i}]`, u.slice(0, 150)))
  })
  .catch(e => console.error('ERR', e.message))
