import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import App from './App'
import type { CollisionCallback, PinballTable } from './engine/physics'
import { BUMPER_CONFIGS } from './data/bumpers'

// Capture physics callbacks
let capturedCallbacks: CollisionCallback | null = null

const mockBumpers = BUMPER_CONFIGS.map((c) => ({
  position: { x: c.x * 400, y: c.y * 700 },
})) as unknown as PinballTable['bumpers']

const mockTable: PinballTable = {
  engine: { world: { bodies: [] } } as unknown as PinballTable['engine'],
  ball: null,
  leftFlipper: { angularVelocity: 0, position: { x: 120, y: 620 }, angle: 0 } as unknown as PinballTable['leftFlipper'],
  rightFlipper: { angularVelocity: 0, position: { x: 280, y: 620 }, angle: 0 } as unknown as PinballTable['rightFlipper'],
  leftFlipperConstraint: {} as PinballTable['leftFlipperConstraint'],
  rightFlipperConstraint: {} as PinballTable['rightFlipperConstraint'],
  bumpers: mockBumpers,
  geCatch: { position: { x: 200, y: 56 } } as unknown as PinballTable['geCatch'],
  walls: [],
  width: 400,
  height: 700,
}

vi.mock('./engine/physics', () => ({
  createTable: vi.fn((_bumpers: unknown, callbacks: CollisionCallback) => {
    capturedCallbacks = callbacks
    return mockTable
  }),
  launchBall: vi.fn(() => {
    const ball = { position: { x: 370, y: 650 }, label: 'ball' }
    mockTable.ball = ball as unknown as PinballTable['ball']
    return ball
  }),
  removeBall: vi.fn(() => {
    mockTable.ball = null
  }),
  activateFlipper: vi.fn(),
  deactivateFlipper: vi.fn(),
  stepEngine: vi.fn(),
  destroyTable: vi.fn(),
  TABLE_WIDTH: 400,
  TABLE_HEIGHT: 700,
  BALL_RADIUS: 10,
  BUMPER_RADIUS: 25,
  FLIPPER_WIDTH: 80,
  FLIPPER_HEIGHT: 16,
}))

const mockCtx = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
  textBaseline: '',
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  fillText: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
}

let rafCallCount = 0

beforeEach(() => {
  rafCallCount = 0
  capturedCallbacks = null
  mockTable.ball = null
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    rafCallCount++
    if (rafCallCount <= 2) {
      cb(16)
    }
    return rafCallCount
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  vi.spyOn(performance, 'now').mockReturnValue(0)
})

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText('OSRS Pinball')).toBeInTheDocument()
  })

  it('renders HUD, canvas, equipment, and inventory', () => {
    render(<App />)
    expect(screen.getByTestId('hud')).toBeInTheDocument()
    expect(screen.getByTestId('pinball-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('equipment')).toBeInTheDocument()
    expect(screen.getByTestId('inventory')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-controls')).toBeInTheDocument()
  })

  it('does not show GE by default', () => {
    render(<App />)
    expect(screen.queryByTestId('grand-exchange')).not.toBeInTheDocument()
  })

  it('launches ball when canvas is clicked', () => {
    render(<App />)
    rafCallCount = 0
    fireEvent.click(screen.getByTestId('pinball-canvas'))
    expect(screen.getByTestId('balls-fired')).toHaveTextContent('Balls: 1')
  })

  it('handles flipper keyboard controls', () => {
    render(<App />)
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
    })
    expect(screen.getByTestId('pinball-canvas')).toBeInTheDocument()
  })

  it('handles mobile flipper touch controls', () => {
    render(<App />)
    fireEvent.mouseDown(screen.getByTestId('mobile-left-flipper'))
    fireEvent.mouseUp(screen.getByTestId('mobile-left-flipper'))
    expect(screen.getByTestId('pinball-canvas')).toBeInTheDocument()
  })

  it('opens GE when ball hits GE catch zone', () => {
    render(<App />)
    expect(screen.queryByTestId('grand-exchange')).not.toBeInTheDocument()
    act(() => {
      capturedCallbacks!.onGeCatch()
    })
    expect(screen.getByTestId('grand-exchange')).toBeInTheDocument()
  })

  it('closes GE and buys item', () => {
    render(<App />)
    act(() => {
      capturedCallbacks!.onGeCatch()
    })
    expect(screen.getByTestId('grand-exchange')).toBeInTheDocument()

    // Buy an item
    fireEvent.click(screen.getByTestId('ge-buy-bronze-helm'))

    // Close GE
    fireEvent.click(screen.getByTestId('ge-close'))
    expect(screen.queryByTestId('grand-exchange')).not.toBeInTheDocument()
  })

  it('updates GP when bumper is hit', () => {
    render(<App />)
    const gpBefore = screen.getByTestId('gp-display').textContent
    act(() => {
      capturedCallbacks!.onBumperHit('mining-1')
    })
    const gpAfter = screen.getByTestId('gp-display').textContent
    expect(gpAfter).not.toBe(gpBefore)
  })

  it('handles ball lost', () => {
    render(<App />)
    rafCallCount = 0
    fireEvent.click(screen.getByTestId('pinball-canvas'))
    expect(screen.getByTestId('balls-fired')).toHaveTextContent('Balls: 1')
    act(() => {
      capturedCallbacks!.onBallLost()
    })
    // Ball should be lost, can launch again
    expect(screen.getByText('Click table to launch')).toBeInTheDocument()
  })
})
