import type { EquipmentState, EquipmentSlot } from '../types'

interface EquipmentProps {
  equipment: EquipmentState
}

interface SlotPosition {
  slot: EquipmentSlot
  label: string
  gridColumn: string
  gridRow: string
}

const SLOT_LAYOUT: SlotPosition[] = [
  { slot: 'head', label: 'Head', gridColumn: '2', gridRow: '1' },
  { slot: 'cape', label: 'Cape', gridColumn: '1', gridRow: '2' },
  { slot: 'neck', label: 'Neck', gridColumn: '2', gridRow: '2' },
  { slot: 'ammo', label: 'Ammo', gridColumn: '3', gridRow: '2' },
  { slot: 'weapon', label: 'Weapon', gridColumn: '1', gridRow: '3' },
  { slot: 'body', label: 'Body', gridColumn: '2', gridRow: '3' },
  { slot: 'shield', label: 'Shield', gridColumn: '3', gridRow: '3' },
  { slot: 'legs', label: 'Legs', gridColumn: '2', gridRow: '4' },
  { slot: 'hands', label: 'Hands', gridColumn: '1', gridRow: '5' },
  { slot: 'feet', label: 'Feet', gridColumn: '2', gridRow: '5' },
  { slot: 'ring', label: 'Ring', gridColumn: '3', gridRow: '5' },
]

export function Equipment({ equipment }: EquipmentProps) {
  return (
    <div data-testid="equipment" style={{ padding: 8 }}>
      <h3 style={{ color: '#FFD700', margin: '0 0 8px', fontFamily: 'monospace' }}>
        Equipment
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 50px)',
          gridTemplateRows: 'repeat(5, 50px)',
          gap: 4,
          justifyContent: 'center',
        }}
      >
        {SLOT_LAYOUT.map(({ slot, label, gridColumn, gridRow }) => {
          const item = equipment[slot]
          return (
            <div
              key={slot}
              data-testid={`equipment-slot-${slot}`}
              style={{
                gridColumn,
                gridRow,
                width: 50,
                height: 50,
                background: '#3d2a14',
                border: '1px solid #6B4914',
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: item ? 20 : 10,
                color: '#8B6914',
                fontFamily: 'monospace',
              }}
              title={item ? item.name : label}
            >
              {item ? item.icon : label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
