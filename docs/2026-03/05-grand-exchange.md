# Grand Exchange

## Description
Ball catch zone at the top of the table that opens the Grand Exchange menu, allowing players to buy items with GP. The ball freezes while the menu is open.

## Implementation Details
- `src/components/GrandExchange.tsx` - Modal UI with item listings and buy buttons
- `src/data/items.ts` - Item definitions and GE offer generation
- Ball freeze: Physics engine pauses stepping when GE is open
- Sensor body in physics engine detects ball entering GE zone

## Testing
- GE rendering, buy button functionality, close button
- Ball freeze verification
- Insufficient GP handling
