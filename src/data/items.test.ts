import { describe, it, expect } from 'vitest'
import { ITEMS, getGrandExchangeOffers } from './items'

describe('items', () => {
  it('has items defined', () => {
    expect(ITEMS.length).toBeGreaterThan(0)
  })

  it('each item has required fields', () => {
    for (const item of ITEMS) {
      expect(item.id).toBeTruthy()
      expect(item.name).toBeTruthy()
      expect(item.icon).toBeTruthy()
      expect(item.slot).toBeTruthy()
      expect(item.value).toBeGreaterThan(0)
    }
  })

  it('has at least one two-handed item', () => {
    expect(ITEMS.some((item) => item.twoHanded)).toBe(true)
  })
})

describe('getGrandExchangeOffers', () => {
  it('returns offers for all items', () => {
    const offers = getGrandExchangeOffers()
    expect(offers).toHaveLength(ITEMS.length)
  })

  it('each offer has item and price', () => {
    const offers = getGrandExchangeOffers()
    for (const offer of offers) {
      expect(offer.item).toBeDefined()
      expect(offer.price).toBe(offer.item.value)
    }
  })
})
