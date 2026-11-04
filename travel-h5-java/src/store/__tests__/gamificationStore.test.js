import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGamificationStore } from '../gamificationStore'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn(key => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

describe('gamificationStore - tagCloud', () => {
  let store

  beforeEach(() => {
    localStorageMock.clear()
    store = useGamificationStore()
  })

  it('should return empty array when tags is empty', () => {
    expect(store.tagCloud.value).toEqual([])
  })

  it('should return empty array when tags is null', () => {
    store.state.tags = null
    expect(store.tagCloud.value).toEqual([])
  })

  it('should return empty array when tags is undefined', () => {
    store.state.tags = undefined
    expect(store.tagCloud.value).toEqual([])
  })

  it('should aggregate duplicate tag names', () => {
    store.state.tags = [
      { name: '美食', count: 3 },
      { name: '交通', count: 2 },
      { name: '美食', count: 5 }
    ]

    const cloud = store.tagCloud.value
    expect(cloud).toHaveLength(2)
    expect(cloud[0]).toEqual({ name: '美食', count: 8 })
    expect(cloud[1]).toEqual({ name: '交通', count: 2 })
  })

  it('should sort by count descending', () => {
    store.state.tags = [
      { name: '交通', count: 2 },
      { name: '住宿', count: 10 },
      { name: '美食', count: 5 }
    ]

    const cloud = store.tagCloud.value
    expect(cloud[0].name).toBe('住宿')
    expect(cloud[1].name).toBe('美食')
    expect(cloud[2].name).toBe('交通')
  })

  it('should limit to 20 tags', () => {
    const tags = Array.from({ length: 30 }, (_, i) => ({
      name: `标签${i}`,
      count: 30 - i
    }))
    store.state.tags = tags

    expect(store.tagCloud.value).toHaveLength(20)
  })

  it('should handle tags with missing name', () => {
    store.state.tags = [
      { name: '美食', count: 3 },
      { count: 2 }, // missing name
      { name: '交通', count: 5 }
    ]

    const cloud = store.tagCloud.value
    expect(cloud).toHaveLength(2)
    expect(cloud.every(t => t.name)).toBe(true)
  })

  it('should default count to 1 when missing', () => {
    store.state.tags = [
      { name: '美食' }, // missing count
      { name: '交通', count: 3 }
    ]

    const cloud = store.tagCloud.value
    expect(cloud[0]).toEqual({ name: '交通', count: 3 })
    expect(cloud[1]).toEqual({ name: '美食', count: 1 })
  })

  it('should handle null tag in array', () => {
    store.state.tags = [
      { name: '美食', count: 3 },
      null,
      { name: '交通', count: 5 }
    ]

    const cloud = store.tagCloud.value
    expect(cloud).toHaveLength(2)
  })

  it('should handle undefined tag in array', () => {
    store.state.tags = [
      { name: '美食', count: 3 },
      undefined,
      { name: '交通', count: 5 }
    ]

    const cloud = store.tagCloud.value
    expect(cloud).toHaveLength(2)
  })
})
