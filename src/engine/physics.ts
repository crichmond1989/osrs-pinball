import Matter from 'matter-js'
import type { BumperConfig } from '../types'

const { Engine, World, Bodies, Body, Constraint, Events, Composite } = Matter

export interface PinballTable {
  engine: Matter.Engine
  ball: Matter.Body | null
  leftFlipper: Matter.Body
  rightFlipper: Matter.Body
  leftFlipperConstraint: Matter.Constraint
  rightFlipperConstraint: Matter.Constraint
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

  // Flipper base positions
  const flipperY = h - 80
  const leftFlipperX = w * 0.3
  const rightFlipperX = w * 0.7

  // Left flipper
  const leftFlipper = Bodies.rectangle(leftFlipperX, flipperY, FLIPPER_WIDTH, FLIPPER_HEIGHT, {
    label: 'leftFlipper',
    chamfer: { radius: FLIPPER_HEIGHT / 2 },
    density: 0.02,
  })
  const leftFlipperConstraint = Constraint.create({
    bodyA: leftFlipper,
    pointA: { x: -FLIPPER_WIDTH / 2 + FLIPPER_HEIGHT / 2, y: 0 },
    pointB: { x: leftFlipperX - FLIPPER_WIDTH / 2 + FLIPPER_HEIGHT / 2, y: flipperY },
    length: 0,
    stiffness: 0.9,
  })

  // Right flipper
  const rightFlipper = Bodies.rectangle(rightFlipperX, flipperY, FLIPPER_WIDTH, FLIPPER_HEIGHT, {
    label: 'rightFlipper',
    chamfer: { radius: FLIPPER_HEIGHT / 2 },
    density: 0.02,
  })
  const rightFlipperConstraint = Constraint.create({
    bodyA: rightFlipper,
    pointA: { x: FLIPPER_WIDTH / 2 - FLIPPER_HEIGHT / 2, y: 0 },
    pointB: { x: rightFlipperX + FLIPPER_WIDTH / 2 - FLIPPER_HEIGHT / 2, y: flipperY },
    length: 0,
    stiffness: 0.9,
  })

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

  // Lower guide walls (funnel to flippers)
  const leftGuide = Bodies.rectangle(w * 0.08, h - 160, 20, 120, {
    isStatic: true,
    angle: 0.4,
    label: 'wall',
  })
  const rightGuide = Bodies.rectangle(w * 0.92, h - 160, 20, 120, {
    isStatic: true,
    angle: -0.4,
    label: 'wall',
  })

  const walls = [topWall, leftWall, rightWall, drain, leftGuide, rightGuide]

  World.add(engine.world, [
    ...walls,
    leftFlipper,
    rightFlipper,
    leftFlipperConstraint,
    rightFlipperConstraint,
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
    leftFlipperConstraint,
    rightFlipperConstraint,
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
  const torque = direction === 'left' ? -0.05 : 0.05
  Body.setAngularVelocity(flipper, torque)
}

export function deactivateFlipper(flipper: Matter.Body, direction: 'left' | 'right'): void {
  const torque = direction === 'left' ? 0.03 : -0.03
  Body.setAngularVelocity(flipper, torque)
}

export function stepEngine(engine: Matter.Engine, delta: number = 1000 / 60): void {
  Engine.update(engine, delta)
}

export function destroyTable(table: PinballTable): void {
  Events.off(table.engine, 'collisionStart')
  World.clear(table.engine.world, false)
  Engine.clear(table.engine)
}
