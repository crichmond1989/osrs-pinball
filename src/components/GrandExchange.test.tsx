import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GrandExchange } from './GrandExchange'
import { ITEMS } from '../data/items'

describe('GrandExchange', () => {
  it('renders the grand exchange modal', () => {
    render(<GrandExchange gp={1000} onBuy={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByTestId('grand-exchange')).toBeInTheDocument()
    expect(screen.getByText('Grand Exchange')).toBeInTheDocument()
  })

  it('displays current GP', () => {
    render(<GrandExchange gp={1500} onBuy={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('GP: 1,500')).toBeInTheDocument()
  })

  it('renders offers for all items', () => {
    render(<GrandExchange gp={1000} onBuy={vi.fn()} onClose={vi.fn()} />)
    for (const item of ITEMS) {
      expect(screen.getByTestId(`ge-offer-${item.id}`)).toBeInTheDocument()
    }
  })

  it('calls onBuy when clicking buy button', () => {
    const onBuy = vi.fn()
    render(<GrandExchange gp={1000} onBuy={onBuy} onClose={vi.fn()} />)
    fireEvent.click(screen.getByTestId(`ge-buy-${ITEMS[0].id}`))
    expect(onBuy).toHaveBeenCalledWith({ item: ITEMS[0], price: ITEMS[0].value })
  })

  it('disables buy button when not enough GP', () => {
    render(<GrandExchange gp={0} onBuy={vi.fn()} onClose={vi.fn()} />)
    const button = screen.getByTestId(`ge-buy-${ITEMS[0].id}`)
    expect(button).toBeDisabled()
  })

  it('calls onClose when clicking close button', () => {
    const onClose = vi.fn()
    render(<GrandExchange gp={1000} onBuy={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('ge-close'))
    expect(onClose).toHaveBeenCalled()
  })
})
