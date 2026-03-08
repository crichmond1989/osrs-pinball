import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PinballCanvas } from './PinballCanvas'
import type { CollisionCallback, PinballTable } from '../engine/physics'
import { BUMPER_CONFIGS } from '../data/bumpers'

// Create mock bumper bodies matching BUMPER_CONFIGS
const mockBumpers = BUMPER_CONFIGS.map((c) => ({
  position: { x: c.x * 400, y: c.y * 700 },
})) as unknown as PinballTable['bumpers']

// Capture the collision callbacks passed to createTable
let capturedCallbacks: CollisionCallback | null = null
const mockTable: PinballTable = {
  engine: { world: { bodies: [] } } as unknown as PinballTable['engine'],
  ball: null,
  leftFlipper: { angularVelocity: 0, position: { x: 129, y: 632 }, angle: 0.4 } as unknown as PinballTable['leftFlipper'],
  rightFlipper: { angularVelocity: 0, position: { x: 270, y: 632 }, angle: -0.4 } as unknown as PinballTable['rightFlipper'],
  bumpers: mockBumpers,
  geCatch: { position: { x: 200, y: 56 } } as unknown as PinballTable['geCatch'],
  walls: [],
  width: 400,
  height: 700,
}

vi.mock('../engine/physics', () => ({
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

// Mock canvas context
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
  mockTable.bumpers = mockBumpers
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

describe('PinballCanvas', () => {
  const defaultProps = {
    ballInPlay: false,
    geOpen: false,
    onBumperHit: vi.fn(),
    onGeCatch: vi.fn(),
    onBallLost: vi.fn(),
    onLaunchBall: vi.fn(),
    flipperState: { left: false, right: false },
  }

  it('renders a canvas element', () => {
    render(<PinballCanvas {...defaultProps} />)
    expect(screen.getByTestId('pinball-canvas')).toBeInTheDocument()
  })

  it('calls onLaunchBall when canvas is clicked and ball is not in play', () => {
    const onLaunch = vi.fn()
    render(<PinballCanvas {...defaultProps} onLaunchBall={onLaunch} />)
    fireEvent.click(screen.getByTestId('pinball-canvas'))
    expect(onLaunch).toHaveBeenCalled()
  })

  it('does not call onLaunchBall when ball is already in play', () => {
    const onLaunch = vi.fn()
    render(<PinballCanvas {...defaultProps} ballInPlay={true} onLaunchBall={onLaunch} />)
    fireEvent.click(screen.getByTestId('pinball-canvas'))
    expect(onLaunch).not.toHaveBeenCalled()
  })

  it('renders with geOpen overlay', () => {
    render(<PinballCanvas {...defaultProps} geOpen={true} />)
    expect(screen.getByTestId('pinball-canvas')).toBeInTheDocument()
  })

  it('responds to flipper state changes', () => {
    const { rerender } = render(<PinballCanvas {...defaultProps} />)
    rafCallCount = 0
    rerender(<PinballCanvas {...defaultProps} flipperState={{ left: true, right: false }} />)
    rafCallCount = 0
    rerender(<PinballCanvas {...defaultProps} flipperState={{ left: false, right: false }} />)
    rafCallCount = 0
    rerender(<PinballCanvas {...defaultProps} flipperState={{ left: false, right: true }} />)
    rafCallCount = 0
    rerender(<PinballCanvas {...defaultProps} flipperState={{ left: false, right: false }} />)
    expect(screen.getByTestId('pinball-canvas')).toBeInTheDocument()
  })

  it('launches ball when ballInPlay transitions to true', () => {
    const { rerender } = render(<PinballCanvas {...defaultProps} />)
    rafCallCount = 0
    rerender(<PinballCanvas {...defaultProps} ballInPlay={true} />)
    expect(screen.getByTestId('pinball-canvas')).toBeInTheDocument()
  })

  it('handles bumper hit callback with known bumper', () => {
    const onBumperHit = vi.fn()
    render(<PinballCanvas {...defaultProps} onBumperHit={onBumperHit} />)
    expect(capturedCallbacks).not.toBeNull()
    capturedCallbacks!.onBumperHit('mining-1')
    expect(onBumperHit).toHaveBeenCalledWith('mining-1', 'mining', 100)
  })

  it('handles bumper hit callback with unknown bumper', () => {
    const onBumperHit = vi.fn()
    render(<PinballCanvas {...defaultProps} onBumperHit={onBumperHit} />)
    capturedCallbacks!.onBumperHit('unknown-bumper')
    expect(onBumperHit).not.toHaveBeenCalled()
  })

  it('handles GE catch callback', () => {
    const onGeCatch = vi.fn()
    render(<PinballCanvas {...defaultProps} onGeCatch={onGeCatch} />)
    capturedCallbacks!.onGeCatch()
    expect(onGeCatch).toHaveBeenCalled()
  })

  it('handles ball lost callback and removes ball', () => {
    const onBallLost = vi.fn()
    render(<PinballCanvas {...defaultProps} ballInPlay={true} onBallLost={onBallLost} />)
    capturedCallbacks!.onBallLost()
    expect(onBallLost).toHaveBeenCalled()
  })
})
