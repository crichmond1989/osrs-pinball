export type EquipmentSlot =
  | 'head'
  | 'cape'
  | 'neck'
  | 'ammo'
  | 'weapon'
  | 'body'
  | 'shield'
  | 'legs'
  | 'hands'
  | 'feet'
  | 'ring'

export interface Item {
  id: string
  name: string
  icon: string
  slot: EquipmentSlot
  value: number
  twoHanded?: boolean
}

export interface InventoryState {
  /** 4 columns x 7 rows = 28 slots, null means empty */
  slots: (Item | null)[]
}

export interface EquipmentState {
  head: Item | null
  cape: Item | null
  neck: Item | null
  ammo: Item | null
  weapon: Item | null
  body: Item | null
  shield: Item | null
  legs: Item | null
  hands: Item | null
  feet: Item | null
  ring: Item | null
}

export type SkillType =
  | 'mining'
  | 'fishing'
  | 'sailing'
  | 'smithing'
  | 'woodcutting'
  | 'cooking'
  | 'herblore'
  | 'crafting'
  | 'fletching'
  | 'farming'

export interface BumperConfig {
  id: string
  skill: SkillType
  label: string
  points: number
  x: number
  y: number
}

export interface GrandExchangeOffer {
  item: Item
  price: number
}

export interface GameState {
  gp: number
  inventory: InventoryState
  equipment: EquipmentState
  ballInPlay: boolean
  geOpen: boolean
  lastSkill: SkillType | null
  ballsFired: number
}
