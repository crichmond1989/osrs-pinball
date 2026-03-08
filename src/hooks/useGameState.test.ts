import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from './useGameState'
import { ITEMS } from '../data/items'

describe('useGameState', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useGameState())
    expect(result.current.state.gp).toBe(500)
    expect(result.current.state.ballInPlay).toBe(false)
    expect(result.current.state.geOpen).toBe(false)
    expect(result.current.state.lastSkill).toBeNull()
    expect(result.current.state.ballsFired).toBe(0)
  })

  it('addGp increases gp', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.addGp(100))
    expect(result.current.state.gp).toBe(600)
  })

  it('setLastSkill updates last skill', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.setLastSkill('mining'))
    expect(result.current.state.lastSkill).toBe('mining')
  })

  it('launchBall sets ballInPlay and increments ballsFired', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.launchBall())
    expect(result.current.state.ballInPlay).toBe(true)
    expect(result.current.state.ballsFired).toBe(1)
  })

  it('loseBall resets ball state', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.launchBall())
    act(() => result.current.setLastSkill('fishing'))
    act(() => result.current.loseBall())
    expect(result.current.state.ballInPlay).toBe(false)
    expect(result.current.state.lastSkill).toBeNull()
  })

  it('openGe and closeGe toggle geOpen', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.openGe())
    expect(result.current.state.geOpen).toBe(true)
    act(() => result.current.closeGe())
    expect(result.current.state.geOpen).toBe(false)
  })

  it('buyItem adds item and deducts gp', () => {
    const { result } = renderHook(() => useGameState())
    const item = ITEMS[0]
    act(() => result.current.buyItem(item, item.value))
    expect(result.current.state.gp).toBe(500 - item.value)
    expect(result.current.state.inventory.slots[0]).toEqual(item)
  })

  it('buyItem does nothing when not enough gp', () => {
    const { result } = renderHook(() => useGameState())
    const item = ITEMS[0]
    act(() => result.current.buyItem(item, 9999))
    expect(result.current.state.gp).toBe(500)
    expect(result.current.state.inventory.slots[0]).toBeNull()
  })

  it('buyItem does nothing when inventory is full', () => {
    const { result } = renderHook(() => useGameState())
    // Fill inventory
    for (let i = 0; i < 28; i++) {
      act(() => result.current.addGp(10000))
      act(() => result.current.buyItem({ ...ITEMS[0], id: `item-${i}` }, 1))
    }
    const gpBefore = result.current.state.gp
    act(() => result.current.buyItem(ITEMS[0], 1))
    expect(result.current.state.gp).toBe(gpBefore)
  })

  it('moveInventoryItem swaps items', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.buyItem(ITEMS[0], 0))
    act(() => result.current.moveInventoryItem(0, 5))
    expect(result.current.state.inventory.slots[0]).toBeNull()
    expect(result.current.state.inventory.slots[5]).toEqual(ITEMS[0])
  })

  it('equipInventoryItem equips item', () => {
    const { result } = renderHook(() => useGameState())
    const headItem = ITEMS.find((i) => i.slot === 'head')!
    act(() => result.current.buyItem(headItem, 0))
    act(() => result.current.equipInventoryItem(0))
    expect(result.current.state.equipment.head).toEqual(headItem)
    expect(result.current.state.inventory.slots[0]).toBeNull()
  })

  it('handleBumperHit adds gp and sets last skill', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleBumperHit('mining-1', 'mining', 100))
    expect(result.current.state.gp).toBe(600)
    expect(result.current.state.lastSkill).toBe('mining')
  })

  it('handleGeBuy buys item from GE offer', () => {
    const { result } = renderHook(() => useGameState())
    const item = ITEMS[0]
    act(() => result.current.handleGeBuy({ item, price: item.value }))
    expect(result.current.state.gp).toBe(500 - item.value)
    expect(result.current.state.inventory.slots[0]).toEqual(item)
  })
})
