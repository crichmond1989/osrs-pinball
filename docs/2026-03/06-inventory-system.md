# Inventory System

## Description
4x7 grid inventory (28 slots) matching OSRS inventory layout. Players can move items between slots via drag-and-drop.

## Implementation Details
- `src/components/Inventory.tsx` - Grid UI with drag-and-drop support
- `src/state/gameState.ts` - Pure inventory manipulation functions
- Drag to swap items between slots
- Click to equip items

## Testing
- Inventory rendering tests
- Drag-and-drop behavior tests
- Item movement state tests
