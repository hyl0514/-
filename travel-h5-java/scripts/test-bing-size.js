// 测试 Bing 缩略图支持的最大尺寸 - 用不同 w/h 试一遍
const url = 'https://tse3-mm.cn.bing.net/th/id/OIP-C.s9onb8XszuLcxnSyg3_NaQHaE7'
const variants = [
  { w: 271, h: 180, c: 7, r: 0, o: 5, pid: '1.7' },        // 原始
  { w: 500, h: 400, c: 7, r: 0, o: 5, pid: '1.7' },        // 放大
  { w: 800, h: 600, c: 7, r: 0, o: 5, pid: '1.7' },
  { w: 1024, h: 768, c: 7, r: 0, o: 5, pid: '1.7' },
  { w: 0, h: 0, c: 0, r: 0, o: 5, pid: 'ImgDetail' }       // 用 ImgDetail 试试拿全尺寸
]
for (const v of variants) {
  const qs = Object.entries(v).filter(([_, x]) => x !== '').map(([k, x]) => `${k}=${x}`).join('&')
  const u = `${url}?${qs}`
  try {
    const r = await fetch(u, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
    console.log(`  w=${v.w} h=${v.h} pid=${v.pid} ->`, r.status, r.headers.get('content-type'), r.headers.get('content-length') + ' bytes')
  } catch (e) {
    console.log(`  w=${v.w} h=${v.h} pid=${v.pid} -> ERR`, e.message)
  }
}
