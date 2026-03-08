import { describe, it, expect, vi, beforeEach } from 'vitest'
import Matter from 'matter-js'
import {
  createTable,
  launchBall,
  firePlunger,
  removeBall,
  activateFlipper,
  deactivateFlipper,
  stepEngine,
  destroyTable,
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BALL_RADIUS,
  BUMPER_RADIUS,
  FLIPPER_WIDTH,
  FLIPPER_HEIGHT,
  PLUNGER_LANE_X,
  PLUNGER_MIN_POWER,
  PLUNGER_MAX_POWER,
} from './physics'
import type { CollisionCallback } from './physics'
import { BUMPER_CONFIGS } from '../data/bumpers'

describe('physics', () => {
  let callbacks: CollisionCallback

  beforeEach(() => {
    callbacks = {
      onBumperHit: vi.fn(),
      onGeCatch: vi.fn(),
      onBallLost: vi.fn(),
    }
  })

  it('exports constants', () => {
    expect(TABLE_WIDTH).toBe(400)
    expect(TABLE_HEIGHT).toBe(700)
    expect(BALL_RADIUS).toBe(10)
    expect(BUMPER_RADIUS).toBe(25)
    expect(FLIPPER_WIDTH).toBe(80)
    expect(FLIPPER_HEIGHT).toBe(16)
    expect(PLUNGER_LANE_X).toBe(362)
    expect(PLUNGER_MIN_POWER).toBe(2)
    expect(PLUNGER_MAX_POWER).toBe(15)
  })

  describe('createTable', () => {
    it('creates a table with all components', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      expect(table.engine).toBeDefined()
      expect(table.ball).toBeNull()
      expect(table.leftFlipper).toBeDefined()
      expect(table.rightFlipper).toBeDefined()
      expect(table.bumpers).toHaveLength(BUMPER_CONFIGS.length)
      expect(table.geCatch).toBeDefined()
      expect(table.walls).toHaveLength(8) // top, left, right, drain, 2 guides, plungerWall, topArch
      expect(table.width).toBe(TABLE_WIDTH)
      expect(table.height).toBe(TABLE_HEIGHT)
      destroyTable(table)
    })

    it('creates flippers at rest angles', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      expect(table.leftFlipper.angle).toBeCloseTo(0.4)
      expect(table.rightFlipper.angle).toBeCloseTo(-0.4)
      destroyTable(table)
    })
  })

  describe('launchBall', () => {
    it('creates and launches a ball', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      const ball = launchBall(table)
      expect(ball).toBeDefined()
      expect(ball.label).toBe('ball')
      expect(table.ball).toBe(ball)
      destroyTable(table)
    })

    it('removes old ball before launching new one', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      const ball1 = launchBall(table)
      const ball2 = launchBall(table)
      expect(ball2).not.toBe(ball1)
      expect(table.ball).toBe(ball2)
      destroyTable(table)
    })
  })

  describe('firePlunger', () => {
    it('fires ball when it is static — ball becomes non-static and gets upward velocity', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      launchBall(table)
      expect(table.ball!.isStatic).toBe(true)
      firePlunger(table, 10)
      expect(table.ball!.isStatic).toBe(false)
      expect(table.ball!.velocity.y).toBeLessThan(0)
      destroyTable(table)
    })

    it('does nothing when ball is already non-static', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      launchBall(table)
      firePlunger(table, 10)
      const velBefore = { ...table.ball!.velocity }
      firePlunger(table, 10)
      // velocity should be unchanged (gravity may change it slightly, but ball is not static so firePlunger returns early)
      expect(table.ball!.isStatic).toBe(false)
      // The second call should not have changed velocity since ball is not static
      expect(table.ball!.velocity.y).toBe(velBefore.y)
      destroyTable(table)
    })

    it('does nothing when no ball exists', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      expect(table.ball).toBeNull()
      // Should not throw
      firePlunger(table, 10)
      expect(table.ball).toBeNull()
      destroyTable(table)
    })

    it('caps power at PLUNGER_MAX_POWER', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      launchBall(table)
      firePlunger(table, PLUNGER_MAX_POWER + 100)
      expect(table.ball!.velocity.y).toBeCloseTo(-PLUNGER_MAX_POWER)
      destroyTable(table)
    })

    it('enforces minimum power even when power is 0', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      launchBall(table)
      firePlunger(table, 0)
      expect(table.ball!.velocity.y).toBeCloseTo(-PLUNGER_MIN_POWER)
      destroyTable(table)
    })
  })

  describe('removeBall', () => {
    it('removes ball from table', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      launchBall(table)
      expect(table.ball).not.toBeNull()
      removeBall(table)
      expect(table.ball).toBeNull()
    })

    it('does nothing when no ball exists', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      removeBall(table)
      expect(table.ball).toBeNull()
      destroyTable(table)
    })
  })

  describe('flipper controls', () => {
    it('activates left flipper', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      activateFlipper(table.leftFlipper, 'left')
      expect(table.leftFlipper.angle).toBeCloseTo(-0.4)
      destroyTable(table)
    })

    it('activates right flipper', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      activateFlipper(table.rightFlipper, 'right')
      expect(table.rightFlipper.angle).toBeCloseTo(0.4)
      destroyTable(table)
    })

    it('deactivates left flipper', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      activateFlipper(table.leftFlipper, 'left')
      deactivateFlipper(table.leftFlipper, 'left')
      expect(table.leftFlipper.angle).toBeCloseTo(0.4)
      destroyTable(table)
    })

    it('deactivates right flipper', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      activateFlipper(table.rightFlipper, 'right')
      deactivateFlipper(table.rightFlipper, 'right')
      expect(table.rightFlipper.angle).toBeCloseTo(-0.4)
      destroyTable(table)
    })
  })

  describe('stepEngine', () => {
    it('steps the physics engine', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      launchBall(table)
      firePlunger(table, 10)
      const posBefore = { ...table.ball!.position }
      stepEngine(table.engine)
      // Ball should have moved due to velocity
      expect(table.ball!.position.y).not.toBe(posBefore.y)
      destroyTable(table)
    })

    it('steps with custom delta', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      launchBall(table)
      stepEngine(table.engine, 16)
      expect(table.ball).toBeDefined()
      destroyTable(table)
    })
  })

  describe('destroyTable', () => {
    it('clears the engine', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      destroyTable(table)
      // Engine should be cleared
      expect(table.engine.world.bodies).toHaveLength(0)
    })
  })

  describe('collision callbacks', () => {
    it('fires onBumperHit on bumper collision', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      // Simulate a collision event by manually firing
      Matter.Events.trigger(table.engine, 'collisionStart', {
        pairs: [
          {
            bodyA: { label: `bumper-${BUMPER_CONFIGS[0].id}` },
            bodyB: { label: 'ball' },
          },
        ],
      })
      expect(callbacks.onBumperHit).toHaveBeenCalledWith(BUMPER_CONFIGS[0].id)
      destroyTable(table)
    })

    it('fires onGeCatch on GE zone collision', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      Matter.Events.trigger(table.engine, 'collisionStart', {
        pairs: [
          {
            bodyA: { label: 'geCatch' },
            bodyB: { label: 'ball' },
          },
        ],
      })
      expect(callbacks.onGeCatch).toHaveBeenCalled()
      destroyTable(table)
    })

    it('fires onBallLost on drain collision', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      launchBall(table)
      Matter.Events.trigger(table.engine, 'collisionStart', {
        pairs: [
          {
            bodyA: { label: 'drain' },
            bodyB: { label: 'ball' },
          },
        ],
      })
      expect(callbacks.onBallLost).toHaveBeenCalled()
      destroyTable(table)
    })

    it('ignores non-matching collision pairs', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      Matter.Events.trigger(table.engine, 'collisionStart', {
        pairs: [
          {
            bodyA: { label: 'wall' },
            bodyB: { label: 'ball' },
          },
        ],
      })
      expect(callbacks.onBumperHit).not.toHaveBeenCalled()
      expect(callbacks.onGeCatch).not.toHaveBeenCalled()
      expect(callbacks.onBallLost).not.toHaveBeenCalled()
      destroyTable(table)
    })
  })
})
