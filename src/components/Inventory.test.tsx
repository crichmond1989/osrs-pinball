import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Inventory } from './Inventory'
import { createInitialInventory } from '../state/gameState'
import type { Item } from '../types'

const makeItem = (id: string): Item => ({
  id,
  name: `Item ${id}`,
  icon: '🗡️',
  slot: 'weapon',
  value: 100,
})

describe('Inventory', () => {
  it('renders 28 inventory slots', () => {
    const inv = createInitialInventory()
    render(<Inventory inventory={inv} onMoveItem={vi.fn()} onEquipItem={vi.fn()} />)
    expect(screen.getByTestId('inventory')).toBeInTheDocument()
    expect(screen.getByTestId('inventory-slot-0')).toBeInTheDocument()
    expect(screen.getByTestId('inventory-slot-27')).toBeInTheDocument()
  })

  it('shows item icon in occupied slot', () => {
    const inv = createInitialInventory()
    inv.slots[0] = makeItem('a')
    render(<Inventory inventory={inv} onMoveItem={vi.fn()} onEquipItem={vi.fn()} />)
    expect(screen.getByTestId('inventory-slot-0')).toHaveTextContent('🗡️')
  })

  it('calls onEquipItem when clicking an item', () => {
    const inv = createInitialInventory()
    inv.slots[3] = makeItem('a')
    const onEquip = vi.fn()
    render(<Inventory inventory={inv} onMoveItem={vi.fn()} onEquipItem={onEquip} />)
    fireEvent.click(screen.getByTestId('inventory-slot-3'))
    expect(onEquip).toHaveBeenCalledWith(3)
  })

  it('does not call onEquipItem when clicking empty slot', () => {
    const inv = createInitialInventory()
    const onEquip = vi.fn()
    render(<Inventory inventory={inv} onMoveItem={vi.fn()} onEquipItem={onEquip} />)
    fireEvent.click(screen.getByTestId('inventory-slot-0'))
    expect(onEquip).not.toHaveBeenCalled()
  })

  it('handles drag and drop to move items', () => {
    const inv = createInitialInventory()
    inv.slots[0] = makeItem('a')
    const onMove = vi.fn()
    render(<Inventory inventory={inv} onMoveItem={onMove} onEquipItem={vi.fn()} />)

    const source = screen.getByTestId('inventory-slot-0')
    const target = screen.getByTestId('inventory-slot-5')

    fireEvent.dragStart(source)
    fireEvent.dragOver(target)
    fireEvent.drop(target)

    expect(onMove).toHaveBeenCalledWith(0, 5)
  })

  it('does not call onMoveItem when dropping on same slot', () => {
    const inv = createInitialInventory()
    inv.slots[0] = makeItem('a')
    const onMove = vi.fn()
    render(<Inventory inventory={inv} onMoveItem={onMove} onEquipItem={vi.fn()} />)

    const source = screen.getByTestId('inventory-slot-0')

    fireEvent.dragStart(source)
    fireEvent.drop(source)

    expect(onMove).not.toHaveBeenCalled()
  })

  it('does not start drag on empty slot', () => {
    const inv = createInitialInventory()
    const onMove = vi.fn()
    render(<Inventory inventory={inv} onMoveItem={onMove} onEquipItem={vi.fn()} />)

    const source = screen.getByTestId('inventory-slot-0')
    const target = screen.getByTestId('inventory-slot-5')

    fireEvent.dragStart(source)
    fireEvent.drop(target)

    expect(onMove).not.toHaveBeenCalled()
  })
})
