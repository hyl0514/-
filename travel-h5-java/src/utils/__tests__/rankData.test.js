import { describe, it, expect } from 'vitest'
import { getCityBoard } from '../rankData.js'
import { imgMap } from '../imgMap.js'

describe('rankData - 黑榜图片逻辑', () => {
  it('imgMap 应包含成都黑榜景点的图片映射', () => {
    const blackSpots = [
      '春熙路地铁口一日游拉客点',
      '熊猫基地门口野生导游',
      '锦里门口化妆照相摊',
      '火车站旁黑车一日游',
      '宽窄巷子口免费喝茶体验店'
    ]
    
    blackSpots.forEach(name => {
      expect(imgMap[name]).toBeDefined()
      expect(imgMap[name]).toMatch(/^https:\/\/img\d\.baidu\.com/)
    })
  })

  it('imgMap 应包含成都黑榜美食的图片映射', () => {
    const blackFoods = [
      '景区门口正宗成都小吃大排档',
      '春熙路自助烤肉引流店',
      '火车站旁24小时快餐店',
      '太古里网红奶茶排队店',
      '夜市野生烧烤摊'
    ]
    
    blackFoods.forEach(name => {
      expect(imgMap[name]).toBeDefined()
      expect(imgMap[name]).toMatch(/^https:\/\/img\d\.baidu\.com/)
    })
  })

  it('imgMap 应包含成都黑榜酒店的图片映射', () => {
    const blackHotels = [
      '春熙路三无低价旅馆',
      '火车站旁拉客小宾馆',
      '景区边江景房民宿',
      '太古里旁胶囊公寓',
      '车站边特价招待所'
    ]
    
    blackHotels.forEach(name => {
      expect(imgMap[name]).toBeDefined()
      expect(imgMap[name]).toMatch(/^https:\/\/img\d\.baidu\.com/)
    })
  })

  it('imgMap 应包含南昌黑榜景点的图片映射', () => {
    const blackSpots = [
      '火车站旁滕王阁一日游黑车',
      '八一广场周边野导服务点',
      '秋水广场观景台收费点',
      '万寿宫口特产大甩卖店',
      '郊区鄱阳湖观鸟园私家景点'
    ]
    
    blackSpots.forEach(name => {
      expect(imgMap[name]).toBeDefined()
      expect(imgMap[name]).toMatch(/^https:\/\/img\d\.baidu\.com/)
    })
  })

  it('imgMap 应包含南昌黑榜美食的图片映射', () => {
    const blackFoods = [
      '滕王阁门口正宗拌粉摊',
      '火车站旁24小时大排档',
      '中山路网红奶茶引流店',
      '秋水广场夜市串串摊',
      '绳金塔旁老字号餐厅'
    ]
    
    blackFoods.forEach(name => {
      expect(imgMap[name]).toBeDefined()
      expect(imgMap[name]).toMatch(/^https:\/\/img\d\.baidu\.com/)
    })
  })

  it('imgMap 应包含南昌黑榜酒店的图片映射', () => {
    const blackHotels = [
      '火车站旁拉客小旅馆',
      '八一广场特价招待所',
      '滕王阁旁江景民宿',
      '中山路胶囊青年旅舍',
      '万寿宫旁无窗快捷宾馆'
    ]
    
    blackHotels.forEach(name => {
      expect(imgMap[name]).toBeDefined()
      expect(imgMap[name]).toMatch(/^https:\/\/img\d\.baidu\.com/)
    })
  })

  it('getCityBoard 生成的成都黑榜应使用 imgMap 中的图片', () => {
    const board = getCityBoard('成都')
    
    // 检查黑榜景点
    board.spot.black.forEach(item => {
      expect(item.img).toBeDefined()
      expect(item.img).toMatch(/^https:\/\//)
      // 如果 imgMap 中有映射，应该使用 imgMap 的图片
      if (imgMap[item.name]) {
        expect(item.img).toBe(imgMap[item.name])
      }
    })
    
    // 检查黑榜美食
    board.food.black.forEach(item => {
      expect(item.img).toBeDefined()
      expect(item.img).toMatch(/^https:\/\//)
      if (imgMap[item.name]) {
        expect(item.img).toBe(imgMap[item.name])
      }
    })
    
    // 检查黑榜酒店
    board.hotel.black.forEach(item => {
      expect(item.img).toBeDefined()
      expect(item.img).toMatch(/^https:\/\//)
      if (imgMap[item.name]) {
        expect(item.img).toBe(imgMap[item.name])
      }
    })
  })

  it('getCityBoard 生成的南昌黑榜应使用 imgMap 中的图片', () => {
    const board = getCityBoard('南昌')
    
    // 检查黑榜景点
    board.spot.black.forEach(item => {
      expect(item.img).toBeDefined()
      expect(item.img).toMatch(/^https:\/\//)
      if (imgMap[item.name]) {
        expect(item.img).toBe(imgMap[item.name])
      }
    })
    
    // 检查黑榜美食
    board.food.black.forEach(item => {
      expect(item.img).toBeDefined()
      expect(item.img).toMatch(/^https:\/\//)
      if (imgMap[item.name]) {
        expect(item.img).toBe(imgMap[item.name])
      }
    })
    
    // 检查黑榜酒店
    board.hotel.black.forEach(item => {
      expect(item.img).toBeDefined()
      expect(item.img).toMatch(/^https:\/\//)
      if (imgMap[item.name]) {
        expect(item.img).toBe(imgMap[item.name])
      }
    })
  })

  it('黑榜和红榜应使用相同的图片优先级逻辑', () => {
    const board = getCityBoard('成都')
    
    // 红榜和黑榜都应该优先使用 imgMap 中的图片
    const redSpot = board.spot.red[0]
    const blackSpot = board.spot.black[0]
    
    // 如果 imgMap 中有映射，都应该使用
    if (imgMap[redSpot.name]) {
      expect(redSpot.img).toBe(imgMap[redSpot.name])
    }
    if (imgMap[blackSpot.name]) {
      expect(blackSpot.img).toBe(imgMap[blackSpot.name])
    }
    
    // 图片格式应该一致（都是百度图片或 picsum）
    expect(redSpot.img).toMatch(/^https:\/\//)
    expect(blackSpot.img).toMatch(/^https:\/\//)
  })

  it('gallery 图片也应使用 imgMap 中的图片', () => {
    const board = getCityBoard('成都')
    
    // 检查黑榜景点的 gallery
    board.spot.black.forEach(item => {
      expect(item.gallery).toBeDefined()
      expect(Array.isArray(item.gallery)).toBe(true)
      expect(item.gallery.length).toBeGreaterThan(0)
      
      item.gallery.forEach(img => {
        expect(img).toMatch(/^https:\/\//)
        // 如果 imgMap 中有映射，gallery 也应该使用
        if (imgMap[item.name]) {
          expect(img).toBe(imgMap[item.name])
        }
      })
    })
  })
})
