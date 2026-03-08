# Plunger Lane, Boundaries, and Auto-Respawn

## Description
Adds a proper plunger lane to the right side of the table, S/↓ key to charge and fire the plunger, automatic ball placement on game start and after drain, and a minimum plunger power to prevent a quick tap from silently draining the ball.

## Implementation Details
- **`src/engine/physics.ts`**: Added `PLUNGER_LANE_X = 362` (inner wall), `PLUNGER_MIN_POWER = 2`, `PLUNGER_MAX_POWER = 15`. Added `plungerWall` and `topArch` (45° deflector) to the wall set. `firePlunger` clamps power to `[MIN, MAX]` so a zero-charge tap always sends the ball upward.
- **`src/hooks/usePlungerControl.ts`**: New hook that listens for ArrowDown/S/s keydown/keyup events and calls `onPlungerChange(held)`.
- **`src/components/PinballCanvas.tsx`**: Accumulates plunger charge in the RAF loop while `plungerHeldRef.current && ball.isStatic`. Fires on key release. Auto-respawns ball via `launchBall` inside the `onBallLost` physics callback.
- **`src/state/gameState.ts`**: `ballInPlay` initialises to `true` so the ball auto-spawns on mount.
- **`src/hooks/useGameState.ts`**: `loseBall` no longer sets `ballInPlay: false`; instead it increments `ballsFired` and resets `lastSkill`, keeping the ball always in play.
- **`src/components/HUD.tsx`**: Status hint updates — "Click to place ball" when not in play, "Hold S / ↓ to fire" when in play.

## Testing
- 100% coverage maintained across statements, branches, functions, and lines.
- New physics tests: `PLUNGER_MIN_POWER` constant, minimum power enforcement.
- Updated `PinballCanvas` test: ball lost callback verifies respawn via `launchBall`.
- Updated `App` and `useGameState` tests to reflect auto-spawn semantics (`ballInPlay: true` initially, `ballsFired` increments on drain).
