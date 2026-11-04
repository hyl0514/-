// 找到 Bing 图片实际项的结构
const query = '滕王阁 景点'
const url = `https://cn.bing.com/images/async?q=${encodeURIComponent(query)}&first=1&count=35&queryNegation=&form=HDRSC2`

fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'zh-CN' } })
  .then(r => r.text())
  .then(t => {
    // 找到第一条 mediaurl 的位置，往前看上下文
    const idx = t.indexOf('mediaurl=')
    if (idx > -1) console.log('first mediaurl context:\n', t.slice(Math.max(0, idx - 300), idx + 300))
    console.log('\n---\n')
    // 找 m= 属性
    const mIdx = t.indexOf('"m":"{')
    if (mIdx > -1) console.log('first m-json context:\n', t.slice(Math.max(0, mIdx - 100), mIdx + 500))
    else console.log('no "m":"{" found')
    console.log('\n---\n')
    // 找 <img class="mimg"
    const imgIdx = t.indexOf('class="mimg"')
    if (imgIdx > -1) console.log('first mimg context:\n', t.slice(Math.max(0, imgIdx - 200), imgIdx + 300))
  })
  .catch(e => console.error('ERR', e.message))
