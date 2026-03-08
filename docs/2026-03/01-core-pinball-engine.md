# Core Pinball Engine

## Description
Matter.js-based physics engine powering the pinball table with realistic ball physics, wall collisions, and gravity simulation.

## Implementation Details
- `src/engine/physics.ts` - Full pinball table creation with walls, drain, guide rails
- Ball launch mechanics with initial velocity
- Collision event system for bumpers, GE catch, and drain detection
- Engine step function for frame-by-frame simulation

## Testing
- Unit tests cover table creation, ball launch/removal, flipper activation, and engine lifecycle
