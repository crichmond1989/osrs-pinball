import type { Item, GrandExchangeOffer } from '../types'

export const ITEMS: Item[] = [
  { id: 'bronze-helm', name: 'Bronze Full Helm', icon: '🪖', slot: 'head', value: 50 },
  { id: 'iron-helm', name: 'Iron Full Helm', icon: '⛑️', slot: 'head', value: 150 },
  { id: 'red-cape', name: 'Red Cape', icon: '🧣', slot: 'cape', value: 30 },
  { id: 'amulet-str', name: 'Amulet of Strength', icon: '📿', slot: 'neck', value: 300 },
  { id: 'bronze-arrow', name: 'Bronze Arrows', icon: '🏹', slot: 'ammo', value: 10 },
  { id: 'bronze-sword', name: 'Bronze Sword', icon: '🗡️', slot: 'weapon', value: 40 },
  { id: 'iron-sword', name: 'Iron Sword', icon: '⚔️', slot: 'weapon', value: 120 },
  { id: 'bronze-2h', name: 'Bronze 2H Sword', icon: '🔪', slot: 'weapon', value: 80, twoHanded: true },
  { id: 'leather-body', name: 'Leather Body', icon: '🦺', slot: 'body', value: 60 },
  { id: 'wooden-shield', name: 'Wooden Shield', icon: '🛡️', slot: 'shield', value: 25 },
  { id: 'bronze-legs', name: 'Bronze Platelegs', icon: '👖', slot: 'legs', value: 70 },
  { id: 'leather-gloves', name: 'Leather Gloves', icon: '🧤', slot: 'hands', value: 20 },
  { id: 'leather-boots', name: 'Leather Boots', icon: '👢', slot: 'feet', value: 20 },
  { id: 'gold-ring', name: 'Gold Ring', icon: '💍', slot: 'ring', value: 100 },
]

export function getGrandExchangeOffers(): GrandExchangeOffer[] {
  return ITEMS.map((item) => ({
    item,
    price: item.value,
  }))
}
