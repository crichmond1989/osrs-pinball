# Equipment System

## Description
OSRS-style equipment system with all standard equipment slots. Supports equipping, unequipping, and two-handed weapon logic.

## Implementation Details
- `src/components/Equipment.tsx` - Visual equipment slot layout
- `src/state/gameState.ts` - equipItem function with full slot logic
- Slots: Head, Cape, Neck, Ammo, Weapon, Body, Shield, Legs, Hands, Feet, Ring
- Two-handed weapons: equipping clears both weapon and shield, returning items to inventory
- Shield + 2H conflict: equipping shield with 2H weapon returns the 2H to inventory

## Testing
- Normal equip/swap tests
- Two-handed weapon edge cases
- Shield + 2H conflict resolution
- Full inventory edge cases
