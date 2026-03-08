# OSRS Skilling Bumpers

## Description
Bumpers themed around OSRS skilling activities. Each bumper awards GP when hit by the pinball.

## Implementation Details
- `src/data/bumpers.ts` - Bumper configurations with skill types and point values
- Skills: Mining, Fishing, Sailing (Salvage), Smithing (Smelt), Woodcutting, Cooking, Herblore, Crafting, Fletching, Farming
- Positioned across the playfield using percentage-based coordinates

## Testing
- Bumper data integrity tests
- Collision callback tests via physics engine
