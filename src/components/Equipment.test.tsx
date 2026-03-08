import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Equipment } from './Equipment'
import { createInitialEquipment } from '../state/gameState'
import type { Item } from '../types'

describe('Equipment', () => {
  it('renders all equipment slots', () => {
    const eq = createInitialEquipment()
    render(<Equipment equipment={eq} />)
    expect(screen.getByTestId('equipment')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-slot-head')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-slot-cape')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-slot-neck')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-slot-ammo')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-slot-weapon')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-slot-body')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-slot-shield')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-slot-legs')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-slot-hands')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-slot-feet')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-slot-ring')).toBeInTheDocument()
  })

  it('shows item icon when slot is equipped', () => {
    const item: Item = { id: 'helm', name: 'Bronze Helm', icon: '🪖', slot: 'head', value: 50 }
    const eq = { ...createInitialEquipment(), head: item }
    render(<Equipment equipment={eq} />)
    expect(screen.getByTestId('equipment-slot-head')).toHaveTextContent('🪖')
  })

  it('shows slot label when empty', () => {
    const eq = createInitialEquipment()
    render(<Equipment equipment={eq} />)
    expect(screen.getByTestId('equipment-slot-head')).toHaveTextContent('Head')
  })
})
