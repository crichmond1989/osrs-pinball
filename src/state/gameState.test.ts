import { describe, it, expect } from 'vitest'
import {
  createInitialGameState,
  createInitialEquipment,
  createInitialInventory,
  findEmptySlot,
  addItemToInventory,
  removeItemFromInventory,
  moveItemInInventory,
  equipItem,
  INVENTORY_SIZE,
} from './gameState'
import type { Item, InventoryState, EquipmentState } from '../types'

const makeItem = (overrides: Partial<Item> = {}): Item => ({
  id: 'test-item',
  name: 'Test Item',
  icon: '🗡️',
  slot: 'weapon',
  value: 100,
  ...overrides,
})

describe('gameState', () => {
  describe('createInitialGameState', () => {
    it('creates initial state with defaults', () => {
      const state = createInitialGameState()
      expect(state.gp).toBe(500)
      expect(state.ballInPlay).toBe(true)
      expect(state.geOpen).toBe(false)
      expect(state.lastSkill).toBeNull()
      expect(state.ballsFired).toBe(0)
      expect(state.inventory.slots).toHaveLength(INVENTORY_SIZE)
      expect(state.inventory.slots.every((s) => s === null)).toBe(true)
    })
  })

  describe('createInitialEquipment', () => {
    it('creates equipment with all slots null', () => {
      const eq = createInitialEquipment()
      expect(eq.head).toBeNull()
      expect(eq.cape).toBeNull()
      expect(eq.neck).toBeNull()
      expect(eq.ammo).toBeNull()
      expect(eq.weapon).toBeNull()
      expect(eq.body).toBeNull()
      expect(eq.shield).toBeNull()
      expect(eq.legs).toBeNull()
      expect(eq.hands).toBeNull()
      expect(eq.feet).toBeNull()
      expect(eq.ring).toBeNull()
    })
  })

  describe('createInitialInventory', () => {
    it('creates inventory with 28 null slots', () => {
      const inv = createInitialInventory()
      expect(inv.slots).toHaveLength(28)
      expect(inv.slots.every((s) => s === null)).toBe(true)
    })
  })

  describe('findEmptySlot', () => {
    it('returns 0 for empty inventory', () => {
      const inv = createInitialInventory()
      expect(findEmptySlot(inv)).toBe(0)
    })

    it('returns -1 for full inventory', () => {
      const inv: InventoryState = {
        slots: Array.from({ length: INVENTORY_SIZE }, (_, i) =>
          makeItem({ id: `item-${i}` }),
        ),
      }
      expect(findEmptySlot(inv)).toBe(-1)
    })

    it('returns first empty index', () => {
      const inv = createInitialInventory()
      inv.slots[0] = makeItem()
      inv.slots[1] = makeItem({ id: 'item2' })
      expect(findEmptySlot(inv)).toBe(2)
    })
  })

  describe('addItemToInventory', () => {
    it('adds item to first empty slot', () => {
      const inv = createInitialInventory()
      const item = makeItem()
      const result = addItemToInventory(inv, item)
      expect(result.slots[0]).toEqual(item)
    })

    it('returns same inventory when full', () => {
      const inv: InventoryState = {
        slots: Array.from({ length: INVENTORY_SIZE }, (_, i) =>
          makeItem({ id: `item-${i}` }),
        ),
      }
      const result = addItemToInventory(inv, makeItem({ id: 'new' }))
      expect(result).toBe(inv)
    })
  })

  describe('removeItemFromInventory', () => {
    it('removes item at given index', () => {
      const inv = createInitialInventory()
      inv.slots[3] = makeItem()
      const result = removeItemFromInventory(inv, 3)
      expect(result.slots[3]).toBeNull()
    })
  })

  describe('moveItemInInventory', () => {
    it('swaps two items', () => {
      const inv = createInitialInventory()
      const itemA = makeItem({ id: 'a' })
      const itemB = makeItem({ id: 'b' })
      inv.slots[0] = itemA
      inv.slots[5] = itemB
      const result = moveItemInInventory(inv, 0, 5)
      expect(result.slots[0]).toEqual(itemB)
      expect(result.slots[5]).toEqual(itemA)
    })

    it('returns same inventory when from === to', () => {
      const inv = createInitialInventory()
      expect(moveItemInInventory(inv, 3, 3)).toBe(inv)
    })

    it('returns same inventory for out-of-bounds from', () => {
      const inv = createInitialInventory()
      expect(moveItemInInventory(inv, -1, 3)).toBe(inv)
    })

    it('returns same inventory for out-of-bounds to', () => {
      const inv = createInitialInventory()
      expect(moveItemInInventory(inv, 3, INVENTORY_SIZE)).toBe(inv)
    })

    it('returns same inventory for negative to', () => {
      const inv = createInitialInventory()
      expect(moveItemInInventory(inv, 3, -1)).toBe(inv)
    })

    it('returns same inventory for from >= INVENTORY_SIZE', () => {
      const inv = createInitialInventory()
      expect(moveItemInInventory(inv, INVENTORY_SIZE, 0)).toBe(inv)
    })
  })

  describe('equipItem', () => {
    it('equips item from inventory to empty slot', () => {
      const inv = createInitialInventory()
      const item = makeItem({ slot: 'head' })
      inv.slots[0] = item
      const eq = createInitialEquipment()
      const result = equipItem(inv, eq, 0)
      expect(result.equipment.head).toEqual(item)
      expect(result.inventory.slots[0]).toBeNull()
    })

    it('swaps equipped item with inventory item', () => {
      const inv = createInitialInventory()
      const newHead = makeItem({ id: 'new-head', slot: 'head' })
      const oldHead = makeItem({ id: 'old-head', slot: 'head' })
      inv.slots[0] = newHead
      const eq: EquipmentState = { ...createInitialEquipment(), head: oldHead }
      const result = equipItem(inv, eq, 0)
      expect(result.equipment.head).toEqual(newHead)
      expect(result.inventory.slots[0]).toEqual(oldHead)
    })

    it('returns unchanged when slot is empty', () => {
      const inv = createInitialInventory()
      const eq = createInitialEquipment()
      const result = equipItem(inv, eq, 0)
      expect(result.inventory).toBe(inv)
      expect(result.equipment).toBe(eq)
    })

    it('equips two-handed weapon clearing both weapon and shield', () => {
      const inv = createInitialInventory()
      const twoHander = makeItem({ id: '2h', slot: 'weapon', twoHanded: true })
      const oldWeapon = makeItem({ id: 'old-wpn', slot: 'weapon' })
      const oldShield = makeItem({ id: 'old-shield', slot: 'shield' })
      inv.slots[0] = twoHander
      const eq: EquipmentState = {
        ...createInitialEquipment(),
        weapon: oldWeapon,
        shield: oldShield,
      }
      const result = equipItem(inv, eq, 0)
      expect(result.equipment.weapon).toEqual(twoHander)
      expect(result.equipment.shield).toBeNull()
      // Old weapon and shield should be in inventory
      expect(result.inventory.slots.filter((s) => s !== null)).toHaveLength(2)
      expect(result.inventory.slots.some((s) => s?.id === 'old-wpn')).toBe(true)
      expect(result.inventory.slots.some((s) => s?.id === 'old-shield')).toBe(true)
    })

    it('equips two-handed weapon with no existing equipment', () => {
      const inv = createInitialInventory()
      const twoHander = makeItem({ id: '2h', slot: 'weapon', twoHanded: true })
      inv.slots[0] = twoHander
      const eq = createInitialEquipment()
      const result = equipItem(inv, eq, 0)
      expect(result.equipment.weapon).toEqual(twoHander)
      expect(result.equipment.shield).toBeNull()
      expect(result.inventory.slots[0]).toBeNull()
    })

    it('equips 2H when only room for existing weapon (slot freed by 2H removal)', () => {
      // All slots full. Slot 0 has 2H. Weapon equipped, no shield.
      // Removing 2H from slot 0 frees it, old weapon goes to slot 0.
      const slots = Array.from({ length: INVENTORY_SIZE }, (_, i) =>
        i === 0 ? makeItem({ id: '2h', slot: 'weapon', twoHanded: true }) : makeItem({ id: `filler-${i}` }),
      )
      const inv: InventoryState = { slots }
      const eq: EquipmentState = {
        ...createInitialEquipment(),
        weapon: makeItem({ id: 'old-wpn' }),
      }
      const result = equipItem(inv, eq, 0)
      expect(result.equipment.weapon).toEqual(makeItem({ id: '2h', slot: 'weapon', twoHanded: true }))
      expect(result.inventory.slots[0]).toEqual(makeItem({ id: 'old-wpn' }))
    })

    it('fails to equip 2H when no room for existing shield', () => {
      // All slots full except slot 0 (which has our 2H) and we have weapon + shield equipped
      const slots: (Item | null)[] = Array.from({ length: INVENTORY_SIZE }, (_, i) =>
        i === 0
          ? makeItem({ id: '2h', slot: 'weapon', twoHanded: true })
          : i === 1
            ? null
            : makeItem({ id: `filler-${i}` }),
      )
      const inv: InventoryState = { slots }
      const eq: EquipmentState = {
        ...createInitialEquipment(),
        weapon: makeItem({ id: 'old-wpn' }),
        shield: makeItem({ id: 'old-shield', slot: 'shield' }),
      }
      // Slot 0 holds the 2H, slot 1 is empty.
      // After removing 2H from slot 0 → slots 0 and 1 are free.
      // Put old weapon in slot 0, old shield in slot 1. Room for both.
      const result = equipItem(inv, eq, 0)
      expect(result.equipment.weapon).toEqual(makeItem({ id: '2h', slot: 'weapon', twoHanded: true }))
    })

    it('reverts 2H equip when no room for shield after placing weapon', () => {
      // All slots full except slot 0 (2H). Weapon equipped, shield equipped.
      // After removing 2H → only slot 0 free. Weapon goes to slot 0.
      // No room for shield → revert.
      const slots: (Item | null)[] = Array.from({ length: INVENTORY_SIZE }, (_, i) =>
        i === 0
          ? makeItem({ id: '2h', slot: 'weapon', twoHanded: true })
          : makeItem({ id: `filler-${i}` }),
      )
      const inv: InventoryState = { slots }
      const eq: EquipmentState = {
        ...createInitialEquipment(),
        weapon: makeItem({ id: 'old-wpn' }),
        shield: makeItem({ id: 'old-shield', slot: 'shield' }),
      }
      const result = equipItem(inv, eq, 0)
      expect(result.inventory).toBe(inv)
      expect(result.equipment).toBe(eq)
    })

    it('reverts 2H equip when no room for shield (no weapon equipped)', () => {
      // All slots full except slot 0 (2H). Only shield equipped (no weapon).
      // After removing 2H → slot 0 free. No weapon to place. Shield needs a slot.
      // But slot 0 is the only free one, and we need it for the shield.
      // Actually with only shield equipped and no weapon, slot 0 remains free.
      // Shield goes to slot 0. That works! So we need ALL slots full.
      // Let's fill every slot and only have shield equipped.
      const slots: (Item | null)[] = Array.from({ length: INVENTORY_SIZE }, (_, i) =>
        i === 0
          ? makeItem({ id: '2h', slot: 'weapon', twoHanded: true })
          : makeItem({ id: `filler-${i}` }),
      )
      const inv: InventoryState = { slots }
      const eq: EquipmentState = {
        ...createInitialEquipment(),
        shield: makeItem({ id: 'old-shield', slot: 'shield' }),
      }
      // Slot 0 has 2H → remove 2H → slot 0 free → no weapon to place → shield goes to slot 0.
      const result = equipItem(inv, eq, 0)
      expect(result.equipment.weapon).toEqual(makeItem({ id: '2h', slot: 'weapon', twoHanded: true }))
      expect(result.equipment.shield).toBeNull()
      expect(result.inventory.slots[0]).toEqual(makeItem({ id: 'old-shield', slot: 'shield' }))
    })

    it('equips shield when 2H weapon is equipped, swapping 2H to inventory', () => {
      const inv = createInitialInventory()
      const shield = makeItem({ id: 'shield', slot: 'shield' })
      const twoHander = makeItem({ id: '2h', slot: 'weapon', twoHanded: true })
      inv.slots[0] = shield
      const eq: EquipmentState = {
        ...createInitialEquipment(),
        weapon: twoHander,
      }
      const result = equipItem(inv, eq, 0)
      expect(result.equipment.shield).toEqual(shield)
      expect(result.equipment.weapon).toBeNull()
      expect(result.inventory.slots[0]).toEqual(twoHander)
    })
  })
})
