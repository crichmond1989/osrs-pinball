# OSRS Pinball - Agent Instructions

## Project Overview

An Old School RuneScape themed pinball game built with TypeScript, React, and Vite. Uses Matter.js for physics simulation.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Physics Engine**: Matter.js
- **Testing**: Vitest + React Testing Library + @vitest/coverage-v8
- **Linting**: ESLint with typescript-eslint
- **Deployment**: GitHub Pages via GitHub Actions

## Validation Loop

**Every code change must pass the following validation loop before committing:**

```bash
npm run lint      # ESLint checks
npm run build     # TypeScript compilation + Vite build
npm run test:coverage  # Tests with 100% coverage enforcement
```

Or run all at once:

```bash
npm run validate
```

## Code Coverage Requirement

The project enforces **100% code coverage** across all metrics:
- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

Coverage configuration is in `vite.config.ts`. The `src/main.tsx` entry point and test setup files are excluded from coverage.

## Feature Documentation

- The feature catalog is located at `/docs/feature-catalog.md`
- New features **must** create a feature markdown file at `/docs/YYYY-MM/##-feature-title.md` (where `##` is the next sequential number)
- The feature catalog (`/docs/feature-catalog.md`) **must** be updated whenever a new feature is added

### Feature File Template

```markdown
# Feature Title

## Description
Brief description of the feature.

## Implementation Details
- Key files changed
- Architecture decisions

## Testing
- Test coverage notes
```

## Project Structure

```
src/
├── components/       # React UI components
│   ├── PinballCanvas.tsx   # Main pinball table renderer
│   ├── Inventory.tsx       # 4x7 inventory grid
│   ├── Equipment.tsx       # Equipment slots display
│   ├── GrandExchange.tsx   # Grand Exchange buy menu
│   ├── HUD.tsx             # GP score and status display
│   └── MobileControls.tsx  # Touch flipper buttons
├── data/             # Static game data
│   ├── items.ts            # OSRS items and GE offers
│   └── bumpers.ts          # Pinball bumper configurations
├── engine/           # Physics engine
│   └── physics.ts          # Matter.js pinball table
├── hooks/            # React hooks
│   ├── useGameState.ts     # Main game state management
│   └── useFlipperControls.ts # Keyboard + touch flipper input
├── state/            # Pure state logic
│   └── gameState.ts        # Inventory, equipment, GP logic
├── test/             # Test setup
│   └── setup.ts
├── types.ts          # TypeScript type definitions
├── App.tsx           # Root component
├── main.tsx          # Entry point (excluded from coverage)
└── index.css         # Global styles
```

## Game Mechanics

- **Flippers**: Left Arrow/A for left, Right Arrow/D for right. Mobile: touch buttons.
- **Ball Launch**: Click the pinball table when no ball is in play.
- **Bumpers**: Hitting skill bumpers awards GP based on the skill type.
- **Grand Exchange**: Ball catch at top opens GE menu. Ball freezes while GE is open.
- **Inventory**: 4 columns x 7 rows (28 slots). Click items to equip. Drag to rearrange.
- **Equipment**: Standard OSRS slots (head, cape, neck, ammo, weapon, body, shield, legs, hands, feet, ring). Two-handed weapons clear both weapon and shield slots.
