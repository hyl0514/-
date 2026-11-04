// 测试百度图片搜索对酒店/美食/景点的命中率
const query = '南昌香格里拉大酒店'

const url = `https://image.baidu.com/search/acjson?tn=resultjson_com&word=${encodeURIComponent(query)}&pn=0&rn=10&ie=utf-8`

fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'zh-CN' } })
  .then(r => r.json())
  .then(d => {
    console.log('百度图片返回：', (d.data || []).length, '条')
    ;(d.data || []).slice(0, 5).forEach((it, i) => {
      console.log(`[${i}] thumbURL=${it.thumbURL}`)
      console.log(`    fromURL=${it.fromURL}`)
      console.log(`    ${it.fromPageTitleEnc}`)
    })
  })
  .catch(e => console.error('ERR', e.message))
