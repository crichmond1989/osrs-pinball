import type { BumperConfig } from '../types'

/** Bumper positions are defined as percentages of the table width/height */
export const BUMPER_CONFIGS: BumperConfig[] = [
  { id: 'mining-1', skill: 'mining', label: '⛏️ Mine', points: 100, x: 0.3, y: 0.2 },
  { id: 'fishing-1', skill: 'fishing', label: '🎣 Fish', points: 80, x: 0.7, y: 0.2 },
  { id: 'sailing-1', skill: 'sailing', label: '⛵ Salvage', points: 120, x: 0.5, y: 0.15 },
  { id: 'smithing-1', skill: 'smithing', label: '🔨 Smelt', points: 90, x: 0.25, y: 0.35 },
  { id: 'woodcutting-1', skill: 'woodcutting', label: '🪓 Chop', points: 70, x: 0.75, y: 0.35 },
  { id: 'cooking-1', skill: 'cooking', label: '🍳 Cook', points: 60, x: 0.4, y: 0.45 },
  { id: 'herblore-1', skill: 'herblore', label: '🧪 Herb', points: 110, x: 0.6, y: 0.45 },
  { id: 'crafting-1', skill: 'crafting', label: '✂️ Craft', points: 85, x: 0.35, y: 0.55 },
  { id: 'fletching-1', skill: 'fletching', label: '🏹 Fletch', points: 75, x: 0.65, y: 0.55 },
  { id: 'farming-1', skill: 'farming', label: '🌱 Farm', points: 95, x: 0.5, y: 0.3 },
]
