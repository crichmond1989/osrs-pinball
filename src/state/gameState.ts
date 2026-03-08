import type { GameState, EquipmentState, InventoryState, Item, EquipmentSlot } from '../types'

export const INVENTORY_SIZE = 28

export function createInitialEquipment(): EquipmentState {
  return {
    head: null,
    cape: null,
    neck: null,
    ammo: null,
    weapon: null,
    body: null,
    shield: null,
    legs: null,
    hands: null,
    feet: null,
    ring: null,
  }
}

export function createInitialInventory(): InventoryState {
  return {
    slots: new Array<Item | null>(INVENTORY_SIZE).fill(null),
  }
}

export function createInitialGameState(): GameState {
  return {
    gp: 500,
    inventory: createInitialInventory(),
    equipment: createInitialEquipment(),
    ballInPlay: true,
    geOpen: false,
    lastSkill: null,
    ballsFired: 0,
  }
}

export function findEmptySlot(inventory: InventoryState): number {
  return inventory.slots.findIndex((slot) => slot === null)
}

export function addItemToInventory(inventory: InventoryState, item: Item): InventoryState {
  const emptyIndex = findEmptySlot(inventory)
  if (emptyIndex === -1) return inventory
  const newSlots = [...inventory.slots]
  newSlots[emptyIndex] = item
  return { slots: newSlots }
}

export function removeItemFromInventory(inventory: InventoryState, index: number): InventoryState {
  const newSlots = [...inventory.slots]
  newSlots[index] = null
  return { slots: newSlots }
}

export function moveItemInInventory(
  inventory: InventoryState,
  fromIndex: number,
  toIndex: number,
): InventoryState {
  if (fromIndex === toIndex) return inventory
  if (fromIndex < 0 || fromIndex >= INVENTORY_SIZE) return inventory
  if (toIndex < 0 || toIndex >= INVENTORY_SIZE) return inventory
  const newSlots = [...inventory.slots]
  const temp = newSlots[toIndex]
  newSlots[toIndex] = newSlots[fromIndex]
  newSlots[fromIndex] = temp
  return { slots: newSlots }
}

export function equipItem(
  inventory: InventoryState,
  equipment: EquipmentState,
  inventoryIndex: number,
): { inventory: InventoryState; equipment: EquipmentState } {
  const item = inventory.slots[inventoryIndex]
  if (!item) return { inventory, equipment }

  const slot: EquipmentSlot = item.slot
  const newEquipment = { ...equipment }
  const newSlots = [...inventory.slots]

  if (item.twoHanded) {
    // Two-handed: need to unequip both weapon and shield
    const currentWeapon = newEquipment.weapon
    const currentShield = newEquipment.shield

    // Remove the item from inventory first
    newSlots[inventoryIndex] = null

    // Put current weapon back if exists (always has room since we freed inventoryIndex)
    if (currentWeapon) {
      const emptyIdx = newSlots.findIndex((s) => s === null)
      newSlots[emptyIdx] = currentWeapon
    }

    // Put current shield back if exists
    if (currentShield) {
      const emptyIdx = newSlots.findIndex((s) => s === null)
      if (emptyIdx === -1) {
        // No room for shield, revert everything.
        // currentWeapon is always truthy here (it consumed the freed slot).
        const wpnIdx = newSlots.findIndex((s) => s?.id === currentWeapon!.id)
        newSlots[wpnIdx] = null
        newSlots[inventoryIndex] = item
        return { inventory, equipment }
      }
      newSlots[emptyIdx] = currentShield
    }

    newEquipment.weapon = item
    newEquipment.shield = null
  } else if (slot === 'shield' && newEquipment.weapon?.twoHanded) {
    // Equipping a shield while using a 2H weapon: unequip the 2H
    const current2H = newEquipment.weapon
    newSlots[inventoryIndex] = current2H
    newEquipment.weapon = null
    newEquipment.shield = item
  } else {
    // Normal equip: swap with current
    const currentEquipped = newEquipment[slot]
    newSlots[inventoryIndex] = currentEquipped
    newEquipment[slot] = item
  }

  return { inventory: { slots: newSlots }, equipment: newEquipment }
}
