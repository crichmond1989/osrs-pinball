import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileControls } from './MobileControls'

describe('MobileControls', () => {
  it('renders left and right flipper buttons', () => {
    render(<MobileControls onTouchStart={vi.fn()} onTouchEnd={vi.fn()} />)
    expect(screen.getByTestId('mobile-controls')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-left-flipper')).toHaveTextContent('Left Flipper')
    expect(screen.getByTestId('mobile-right-flipper')).toHaveTextContent('Right Flipper')
  })

  it('calls onTouchStart with left on left button touch', () => {
    const onStart = vi.fn()
    render(<MobileControls onTouchStart={onStart} onTouchEnd={vi.fn()} />)
    fireEvent.touchStart(screen.getByTestId('mobile-left-flipper'))
    expect(onStart).toHaveBeenCalledWith('left')
  })

  it('calls onTouchEnd with left on left button touch end', () => {
    const onEnd = vi.fn()
    render(<MobileControls onTouchStart={vi.fn()} onTouchEnd={onEnd} />)
    fireEvent.touchEnd(screen.getByTestId('mobile-left-flipper'))
    expect(onEnd).toHaveBeenCalledWith('left')
  })

  it('calls onTouchStart with right on right button touch', () => {
    const onStart = vi.fn()
    render(<MobileControls onTouchStart={onStart} onTouchEnd={vi.fn()} />)
    fireEvent.touchStart(screen.getByTestId('mobile-right-flipper'))
    expect(onStart).toHaveBeenCalledWith('right')
  })

  it('calls onTouchEnd with right on right button touch end', () => {
    const onEnd = vi.fn()
    render(<MobileControls onTouchStart={vi.fn()} onTouchEnd={onEnd} />)
    fireEvent.touchEnd(screen.getByTestId('mobile-right-flipper'))
    expect(onEnd).toHaveBeenCalledWith('right')
  })

  it('handles mouse events for left button', () => {
    const onStart = vi.fn()
    const onEnd = vi.fn()
    render(<MobileControls onTouchStart={onStart} onTouchEnd={onEnd} />)
    fireEvent.mouseDown(screen.getByTestId('mobile-left-flipper'))
    expect(onStart).toHaveBeenCalledWith('left')
    fireEvent.mouseUp(screen.getByTestId('mobile-left-flipper'))
    expect(onEnd).toHaveBeenCalledWith('left')
  })

  it('handles mouse events for right button', () => {
    const onStart = vi.fn()
    const onEnd = vi.fn()
    render(<MobileControls onTouchStart={onStart} onTouchEnd={onEnd} />)
    fireEvent.mouseDown(screen.getByTestId('mobile-right-flipper'))
    expect(onStart).toHaveBeenCalledWith('right')
    fireEvent.mouseUp(screen.getByTestId('mobile-right-flipper'))
    expect(onEnd).toHaveBeenCalledWith('right')
  })
})
