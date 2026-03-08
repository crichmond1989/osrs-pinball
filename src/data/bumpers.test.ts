import { describe, it, expect } from 'vitest'
import { BUMPER_CONFIGS } from './bumpers'

describe('bumpers', () => {
  it('has bumper configs defined', () => {
    expect(BUMPER_CONFIGS.length).toBeGreaterThan(0)
  })

  it('each bumper has required fields', () => {
    for (const bumper of BUMPER_CONFIGS) {
      expect(bumper.id).toBeTruthy()
      expect(bumper.skill).toBeTruthy()
      expect(bumper.label).toBeTruthy()
      expect(bumper.points).toBeGreaterThan(0)
      expect(bumper.x).toBeGreaterThan(0)
      expect(bumper.x).toBeLessThanOrEqual(1)
      expect(bumper.y).toBeGreaterThan(0)
      expect(bumper.y).toBeLessThanOrEqual(1)
    }
  })

  it('has unique bumper ids', () => {
    const ids = BUMPER_CONFIGS.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
