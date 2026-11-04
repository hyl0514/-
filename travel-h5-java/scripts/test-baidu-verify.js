// 测试百度图片 thumbURL 可访问性
const url = 'https://img2.baidu.com/it/u=3202093132,1579858515&fm=253&fmt=auto&app=138&f=JPEG?w=600&h=450'

fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
  .then(r => console.log('无 Referer:', r.status, r.headers.get('content-type')))
  .catch(e => console.error('ERR', e.message))

fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://image.baidu.com/' } })
  .then(r => console.log('带 Referer:', r.status, r.headers.get('content-type')))
  .catch(e => console.error('ERR2', e.message))
