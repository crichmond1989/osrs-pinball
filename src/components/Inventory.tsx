import { useState } from 'react'
import type { InventoryState } from '../types'

interface InventoryProps {
  inventory: InventoryState
  onMoveItem: (from: number, to: number) => void
  onEquipItem: (index: number) => void
}

const COLS = 4
const ROWS = 7

export function Inventory({ inventory, onMoveItem, onEquipItem }: InventoryProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    if (inventory.slots[index]) {
      setDragIndex(index)
    }
  }

  const handleDrop = (toIndex: number) => {
    if (dragIndex !== null && dragIndex !== toIndex) {
      onMoveItem(dragIndex, toIndex)
    }
    setDragIndex(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div data-testid="inventory" style={{ padding: 8 }}>
      <h3 style={{ color: '#FFD700', margin: '0 0 8px', fontFamily: 'monospace' }}>
        Inventory
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 44px)`,
          gridTemplateRows: `repeat(${ROWS}, 44px)`,
          gap: 2,
          background: '#2d1f0e',
          padding: 4,
          borderRadius: 4,
          border: '1px solid #8B6914',
        }}
      >
        {inventory.slots.map((item, index) => (
          <div
            key={index}
            data-testid={`inventory-slot-${index}`}
            draggable={!!item}
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            onClick={() => item && onEquipItem(index)}
            style={{
              width: 44,
              height: 44,
              background: dragIndex === index ? '#5a3a1a' : '#3d2a14',
              border: '1px solid #6B4914',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: item ? 'pointer' : 'default',
              fontSize: 20,
              userSelect: 'none',
            }}
            title={item?.name}
          >
            {item?.icon}
          </div>
        ))}
      </div>
    </div>
  )
}
