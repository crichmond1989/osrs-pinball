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

  describe('integration: plunger and drain game flow (real physics)', () => {
    // Note: multi-step physics tests are unreliable because the mock onBallLost callback
    // does not remove the ball, so it falls through the sensor and eventually overflows.
    // These tests use one real physics step (safe) plus Matter.Events.trigger with the
    // actual engine bodies for the drain scenarios.

    it('ball has upward velocity after firing and moves up on first physics step', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      launchBall(table)
      const spawnY = table.ball!.position.y  // 640

      firePlunger(table, 10)

      // Physics state immediately after firing
      expect(table.ball!.isStatic).toBe(false)
      expect(table.ball!.velocity.y).toBeLessThan(0) // negative y = upward

      // One real physics step — ball must have moved upward
      stepEngine(table.engine, 16)
      expect(table.ball!.position.y).toBeLessThan(spawnY)
      expect(callbacks.onBallLost).not.toHaveBeenCalled()
      destroyTable(table)
    })

    it('drain body collision fires onBallLost for a live (non-static) ball', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      launchBall(table)
      firePlunger(table, 10) // ball is now live and non-static

      // Find the real drain body that createTable added to the world
      const drainBody = Matter.Composite.allBodies(table.engine.world)
        .find((b) => b.label === 'drain')!
      expect(drainBody).toBeDefined()

      // Trigger the collision event using real engine bodies (not stub objects)
      Matter.Events.trigger(table.engine, 'collisionStart', {
        pairs: [{ bodyA: drainBody, bodyB: table.ball! }],
      })

      expect(callbacks.onBallLost).toHaveBeenCalled()
      destroyTable(table)
    })

    it('ball enters playing field after max-power plunger shot', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      launchBall(table)
      firePlunger(table, PLUNGER_MAX_POWER)

      // Run up to 100 physics steps — ball must cross the plunger wall into the main field
      let enteredField = false
      for (let i = 0; i < 100; i++) {
        stepEngine(table.engine)
        if (table.ball!.position.x < PLUNGER_LANE_X) {
          enteredField = true
          break
        }
      }

      expect(enteredField).toBe(true)
      expect(callbacks.onBallLost).not.toHaveBeenCalled()
      destroyTable(table)
    })

    it('full cycle: plunger fires ball → ball drains → callback respawns static ball in gutter', () => {
      let drainFired = false
      const intCallbacks = {
        onBumperHit: vi.fn(),
        onGeCatch: vi.fn(),
        onBallLost: () => {
          drainFired = true
          // Mirrors exactly what PinballCanvas.onBallLost does
          removeBall(table)
          launchBall(table)
        },
      }
      const table = createTable(BUMPER_CONFIGS, intCallbacks)

      // Ball auto-spawns as static in the plunger gutter
      launchBall(table)
      expect(table.ball!.isStatic).toBe(true)
      expect(table.ball!.position.y).toBe(TABLE_HEIGHT - 60)

      // Player fires plunger — ball enters the playfield
      firePlunger(table, 10)
      expect(table.ball!.isStatic).toBe(false)

      // One real physics step confirms ball is moving upward, not draining
      const liveBall = table.ball!
      stepEngine(table.engine, 16)
      expect(table.ball!.position.y).toBeLessThan(TABLE_HEIGHT - 60)

      // Ball misses the flippers and reaches the drain sensor
      const drainBody = Matter.Composite.allBodies(table.engine.world)
        .find((b) => b.label === 'drain')!
      Matter.Events.trigger(table.engine, 'collisionStart', {
        pairs: [{ bodyA: drainBody, bodyB: liveBall }],
      })

      // Drain callback fired; old ball removed, fresh ball placed in gutter
      expect(drainFired).toBe(true)
      expect(table.ball).not.toBeNull()
      expect(table.ball).not.toBe(liveBall) // different object — freshly spawned
      expect(table.ball!.isStatic).toBe(true)
      expect(table.ball!.position.y).toBe(TABLE_HEIGHT - 60)

      destroyTable(table)
    })
  })

  describe('integration: flipper mechanics (real physics)', () => {
    // Flipper geometry constants derived from createTable:
    //   flipperY = TABLE_HEIGHT - 80 = 620
    //   leftFlipper pivot  at x=100, rightFlipper pivot at x=300
    //   Active left flipper center ≈ (130, 608); active right flipper center ≈ (270, 608)
    //
    // TODO: The active-flipper deflection tests below are fragile because the ball contacts
    // the flipper at y≈588 — just below the y>580 threshold — so the reachedFlipper flag
    // and the vy<0 check must fire in the same physics step. This works in CI but has proven
    // sensitive to subtle environment differences (Matter.js substep timing, platform FP rounding).
    // A more robust approach would be to decouple the "ball reached flipper zone" check from
    // the "ball is moving upward" check, or to assert solely that onBallLost is NOT called
    // within a short window (proving the flipper prevented the drain without relying on velocity).

    function dropBallOntoFlipper(
      table: ReturnType<typeof import('./physics').createTable>,
      x: number,
      startY: number,
      downwardSpeed: number,
    ) {
      // Make the gutter ball dynamic, teleport it above the flipper, give it downward speed.
      Matter.Body.setStatic(table.ball!, false)
      Matter.Body.setPosition(table.ball!, { x, y: startY })
      Matter.Body.setVelocity(table.ball!, { x: 0, y: downwardSpeed })
    }

    it('active left flipper deflects ball upward (no drain)', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      launchBall(table)

      dropBallOntoFlipper(table, 130, 560, 10)
      activateFlipper(table.leftFlipper, 'left')

      // Ball contacts the flipper around y≈588 (below the flipper surface).
      // Track once ball enters the lower field (y > 580) and check that vy
      // becomes negative (upward) in the same or next step — proving deflection.
      let reachedFlipper = false
      let deflectedUpward = false
      for (let i = 0; i < 60; i++) {
        stepEngine(table.engine)
        if (table.ball!.position.y > 580) reachedFlipper = true
        if (reachedFlipper && table.ball!.velocity.y < 0) {
          deflectedUpward = true
          break
        }
      }

      expect(reachedFlipper).toBe(true)
      expect(deflectedUpward).toBe(true)
      expect(callbacks.onBallLost).not.toHaveBeenCalled()
      destroyTable(table)
    })

    it('active right flipper deflects ball upward (no drain)', () => {
      const table = createTable(BUMPER_CONFIGS, callbacks)
      launchBall(table)

      dropBallOntoFlipper(table, 270, 560, 10)
      activateFlipper(table.rightFlipper, 'right')

      let reachedFlipper = false
      let deflectedUpward = false
      for (let i = 0; i < 60; i++) {
        stepEngine(table.engine)
        if (table.ball!.position.y > 580) reachedFlipper = true
        if (reachedFlipper && table.ball!.velocity.y < 0) {
          deflectedUpward = true
          break
        }
      }

      expect(reachedFlipper).toBe(true)
      expect(deflectedUpward).toBe(true)
      expect(callbacks.onBallLost).not.toHaveBeenCalled()
      destroyTable(table)
    })

    it('inactive flippers allow ball to drain through the center gap', () => {
      const intCallbacks = {
        onBumperHit: vi.fn(),
        onGeCatch: vi.fn(),
        onBallLost: vi.fn(() => {
          // Stop the ball so it doesn't keep falling and overflow
          if (table.ball) Matter.Body.setStatic(table.ball, true)
        }),
      }
      const table = createTable(BUMPER_CONFIGS, intCallbacks)
      launchBall(table)

      // Drop ball straight down through the center gap between both flippers
      dropBallOntoFlipper(table, 200, 560, 5)
      // Flippers remain at rest (tips angled down — no activation)

      for (let i = 0; i < 250; i++) {
        stepEngine(table.engine)
        if (intCallbacks.onBallLost.mock.calls.length > 0) break
      }

      expect(intCallbacks.onBallLost).toHaveBeenCalled()
      destroyTable(table)
    })
  })
})
