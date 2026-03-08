import { useState, useCallback } from 'react'
import type { GameState, SkillType, Item, GrandExchangeOffer } from '../types'
import {
  createInitialGameState,
  addItemToInventory,
  moveItemInInventory,
  equipItem,
  findEmptySlot,
} from '../state/gameState'

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialGameState)

  const addGp = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, gp: prev.gp + amount }))
  }, [])

  const setLastSkill = useCallback((skill: SkillType) => {
    setState((prev) => ({ ...prev, lastSkill: skill }))
  }, [])

  const launchBall = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ballInPlay: true,
      ballsFired: prev.ballsFired + 1,
    }))
  }, [])

  const loseBall = useCallback(() => {
    setState((prev) => ({ ...prev, ballInPlay: false, lastSkill: null }))
  }, [])

  const openGe = useCallback(() => {
    setState((prev) => ({ ...prev, geOpen: true }))
  }, [])

  const closeGe = useCallback(() => {
    setState((prev) => ({ ...prev, geOpen: false }))
  }, [])

  const buyItem = useCallback((item: Item, price: number) => {
    setState((prev) => {
      if (prev.gp < price) return prev
      if (findEmptySlot(prev.inventory) === -1) return prev
      return {
        ...prev,
        gp: prev.gp - price,
        inventory: addItemToInventory(prev.inventory, item),
      }
    })
  }, [])

  const moveInventoryItem = useCallback((from: number, to: number) => {
    setState((prev) => ({
      ...prev,
      inventory: moveItemInInventory(prev.inventory, from, to),
    }))
  }, [])

  const equipInventoryItem = useCallback((inventoryIndex: number) => {
    setState((prev) => {
      const result = equipItem(prev.inventory, prev.equipment, inventoryIndex)
      return { ...prev, inventory: result.inventory, equipment: result.equipment }
    })
  }, [])

  const handleBumperHit = useCallback(
    (_bumperId: string, skill: SkillType, points: number) => {
      addGp(points)
      setLastSkill(skill)
    },
    [addGp, setLastSkill],
  )

  const handleGeBuy = useCallback(
    (offer: GrandExchangeOffer) => {
      buyItem(offer.item, offer.price)
    },
    [buyItem],
  )

  return {
    state,
    addGp,
    setLastSkill,
    launchBall,
    loseBall,
    openGe,
    closeGe,
    buyItem,
    moveInventoryItem,
    equipInventoryItem,
    handleBumperHit,
    handleGeBuy,
  }
}
