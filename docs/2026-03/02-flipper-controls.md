# Flipper Controls

## Description
Keyboard and mobile touch controls for left and right pinball flippers.

## Implementation Details
- `src/hooks/useFlipperControls.ts` - Unified input handler
- Keyboard: Left Arrow / A for left flipper, Right Arrow / D for right flipper
- Mobile: Touch buttons near each flipper, using onTouchStart/onTouchEnd events
- `src/components/MobileControls.tsx` - Touch-friendly flipper buttons

## Testing
- Tests verify keyboard event handling (keydown/keyup) for all valid keys
- Tests verify touch start/end callbacks fire correctly
