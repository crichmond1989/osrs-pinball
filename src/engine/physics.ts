import Matter from 'matter-js'
import type { BumperConfig } from '../types'

const { Engine, World, Bodies, Body, Events, Composite } = Matter

export interface PinballTable {
  engine: Matter.Engine
  ball: Matter.Body | null
  leftFlipper: Matter.Body
  rightFlipper: Matter.Body
  bumpers: Matter.Body[]
  geCatch: Matter.Body
  walls: Matter.Body[]
  width: number
  height: number
}

export interface CollisionCallback {
  onBumperHit: (bumperId: string) => void
  onGeCatch: () => void
  onBallLost: () => void
}

export const TABLE_WIDTH = 400
export const TABLE_HEIGHT = 700
export const BALL_RADIUS = 10
export const BUMPER_RADIUS = 25
export const FLIPPER_WIDTH = 80
export const FLIPPER_HEIGHT = 16

const FLIPPER_PIVOT_OFFSET = FLIPPER_WIDTH / 2 - FLIPPER_HEIGHT / 2 // 32
const FLIPPER_REST_ANGLE = 0.4   // tip angled down
const FLIPPER_ACTIVE_ANGLE = -0.4 // tip angled up

// Compute the world position of the flipper's pivot (stays fixed during rotation).
// localOffsetX is the signed distance from body center to pivot along body's local x-axis.
function getFlipperPivot(flipper: Matter.Body, localOffsetX: number): { x: number; y: number } {
  return {
    x: flipper.position.x + localOffsetX * Math.cos(flipper.angle),
    y: flipper.position.y + localOffsetX * Math.sin(flipper.angle),
  }
}

// Rotate the flipper to a new angle keeping the pivot point fixed in world space.
function setFlipperAngle(flipper: Matter.Body, localOffsetX: number, angle: number): void {
  const pivot = getFlipperPivot(flipper, localOffsetX)
  Body.setPosition(flipper, {
    x: pivot.x - localOffsetX * Math.cos(angle),
    y: pivot.y - localOffsetX * Math.sin(angle),
  })
  Body.setAngle(flipper, angle)
}

export function createTable(
  bumperConfigs: BumperConfig[],
  callbacks: CollisionCallback,
): PinballTable {
  const engine = Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 },
  })

  const w = TABLE_WIDTH
  const h = TABLE_HEIGHT
  const wallThickness = 20

  // Walls
  const topWall = Bodies.rectangle(w / 2, -wallThickness / 2, w + wallThickness * 2, wallThickness, { isStatic: true, label: 'wall' })
  const leftWall = Bodies.rectangle(-wallThickness / 2, h / 2, wallThickness, h, { isStatic: true, label: 'wall' })
  const rightWall = Bodies.rectangle(w + wallThickness / 2, h / 2, wallThickness, h, { isStatic: true, label: 'wall' })

  // Bottom drain (sensor to detect ball loss)
  const drain = Bodies.rectangle(w / 2, h + wallThickness, w + wallThickness * 2, wallThickness, {
    isStatic: true,
    isSensor: true,
    label: 'drain',
  })

  // Flipper pivot positions
  const flipperY = h - 80       // 620
  const leftPivotX = w * 0.25   // 100
  const rightPivotX = w * 0.75  // 300

  // Left flipper: pivot at left end (localOffsetX = -FLIPPER_PIVOT_OFFSET)
  const leftLocalOffset = -FLIPPER_PIVOT_OFFSET
  const leftFlipper = Bodies.rectangle(
    leftPivotX - leftLocalOffset * Math.cos(FLIPPER_REST_ANGLE),
    flipperY - leftLocalOffset * Math.sin(FLIPPER_REST_ANGLE),
    FLIPPER_WIDTH, FLIPPER_HEIGHT,
    { isStatic: true, label: 'leftFlipper', chamfer: { radius: FLIPPER_HEIGHT / 2 } },
  )
  Body.setAngle(leftFlipper, FLIPPER_REST_ANGLE)

  // Right flipper: pivot at right end (localOffsetX = +FLIPPER_PIVOT_OFFSET)
  const rightLocalOffset = FLIPPER_PIVOT_OFFSET
  const rightFlipperRestAngle = -FLIPPER_REST_ANGLE
  const rightFlipper = Bodies.rectangle(
    rightPivotX - rightLocalOffset * Math.cos(rightFlipperRestAngle),
    flipperY - rightLocalOffset * Math.sin(rightFlipperRestAngle),
    FLIPPER_WIDTH, FLIPPER_HEIGHT,
    { isStatic: true, label: 'rightFlipper', chamfer: { radius: FLIPPER_HEIGHT / 2 } },
  )
  Body.setAngle(rightFlipper, rightFlipperRestAngle)

  // Bumpers
  const bumpers = bumperConfigs.map((config) =>
    Bodies.circle(config.x * w, config.y * h, BUMPER_RADIUS, {
      isStatic: true,
      restitution: 1.5,
      label: `bumper-${config.id}`,
    }),
  )

  // Grand Exchange catch zone (sensor at top center)
  const geCatch = Bodies.rectangle(w / 2, h * 0.08, 60, 20, {
    isStatic: true,
    isSensor: true,
    label: 'geCatch',
  })

  // Lower guide walls — extended to reach near the side walls at flipper height,
  // closing the gap that previously allowed the ball to bypass the flippers.
  const leftGuide = Bodies.rectangle(w * 0.08, h - 145, 20, 160, {
    isStatic: true,
    angle: 0.4,
    label: 'wall',
  })
  const rightGuide = Bodies.rectangle(w * 0.92, h - 145, 20, 160, {
    isStatic: true,
    angle: -0.4,
    label: 'wall',
  })

  const walls = [topWall, leftWall, rightWall, drain, leftGuide, rightGuide]

  World.add(engine.world, [
    ...walls,
    leftFlipper,
    rightFlipper,
    ...bumpers,
    geCatch,
  ])

  // Collision events
  Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const labels = [pair.bodyA.label, pair.bodyB.label]

      // Check bumper hits
      for (const label of labels) {
        if (label.startsWith('bumper-')) {
          const bumperId = label.replace('bumper-', '')
          callbacks.onBumperHit(bumperId)
        }
      }

      // Check GE catch
      if (labels.includes('geCatch') && (labels.includes('ball'))) {
        callbacks.onGeCatch()
      }

      // Check drain
      if (labels.includes('drain') && (labels.includes('ball'))) {
        callbacks.onBallLost()
      }
    }
  })

  return {
    engine,
    ball: null,
    leftFlipper,
    rightFlipper,
    bumpers,
    geCatch,
    walls,
    width: w,
    height: h,
  }
}

export function launchBall(table: PinballTable): Matter.Body {
  // Remove old ball if exists
  if (table.ball) {
    Composite.remove(table.engine.world, table.ball)
  }

  const ball = Bodies.circle(TABLE_WIDTH - 30, TABLE_HEIGHT - 50, BALL_RADIUS, {
    restitution: 0.6,
    friction: 0.01,
    density: 0.004,
    label: 'ball',
  })

  World.add(table.engine.world, ball)
  Body.setVelocity(ball, { x: -2, y: -15 })
  table.ball = ball
  return ball
}

export function removeBall(table: PinballTable): void {
  if (table.ball) {
    Composite.remove(table.engine.world, table.ball)
    table.ball = null
  }
}

export function activateFlipper(flipper: Matter.Body, direction: 'left' | 'right'): void {
  const localOffsetX = direction === 'left' ? -FLIPPER_PIVOT_OFFSET : FLIPPER_PIVOT_OFFSET
  const angle = direction === 'left' ? FLIPPER_ACTIVE_ANGLE : -FLIPPER_ACTIVE_ANGLE
  setFlipperAngle(flipper, localOffsetX, angle)
}

export function deactivateFlipper(flipper: Matter.Body, direction: 'left' | 'right'): void {
  const localOffsetX = direction === 'left' ? -FLIPPER_PIVOT_OFFSET : FLIPPER_PIVOT_OFFSET
  const angle = direction === 'left' ? FLIPPER_REST_ANGLE : -FLIPPER_REST_ANGLE
  setFlipperAngle(flipper, localOffsetX, angle)
}

export function stepEngine(engine: Matter.Engine, delta: number = 1000 / 60): void {
  Engine.update(engine, delta)
}

export function destroyTable(table: PinballTable): void {
  Events.off(table.engine, 'collisionStart')
  World.clear(table.engine.world, false)
  Engine.clear(table.engine)
}
