import { useEffect, useRef, useCallback } from 'react'
import type { PinballTable } from '../engine/physics'
import {
  createTable,
  launchBall,
  removeBall,
  activateFlipper,
  deactivateFlipper,
  stepEngine,
  destroyTable,
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BUMPER_RADIUS,
  BALL_RADIUS,
  FLIPPER_WIDTH,
  FLIPPER_HEIGHT,
} from '../engine/physics'
import { BUMPER_CONFIGS } from '../data/bumpers'
import type { FlipperState } from '../hooks/useFlipperControls'
import type { SkillType } from '../types'

interface PinballCanvasProps {
  ballInPlay: boolean
  geOpen: boolean
  onBumperHit: (bumperId: string, skill: SkillType, points: number) => void
  onGeCatch: () => void
  onBallLost: () => void
  onLaunchBall: () => void
  flipperState: FlipperState
}

export function PinballCanvas({
  ballInPlay,
  geOpen,
  onBumperHit,
  onGeCatch,
  onBallLost,
  onLaunchBall,
  flipperState,
}: PinballCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tableRef = useRef<PinballTable | null>(null)
  const animFrameRef = useRef<number>(0)
  const prevFlipperRef = useRef<FlipperState>({ left: false, right: false })

  const handleBumperHit = useCallback(
    (bumperId: string) => {
      const config = BUMPER_CONFIGS.find((b) => b.id === bumperId)
      if (config) {
        onBumperHit(bumperId, config.skill, config.points)
      }
    },
    [onBumperHit],
  )

  // Initialize physics table
  useEffect(() => {
    const table = createTable(BUMPER_CONFIGS, {
      onBumperHit: handleBumperHit,
      onGeCatch,
      onBallLost: () => {
        removeBall(tableRef.current!)
        onBallLost()
      },
    })
    tableRef.current = table

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      destroyTable(table)
    }
  }, [handleBumperHit, onGeCatch, onBallLost])

  // Launch ball when triggered
  useEffect(() => {
    if (ballInPlay && tableRef.current && !tableRef.current.ball) {
      launchBall(tableRef.current)
    }
  }, [ballInPlay])

  // Flipper control
  useEffect(() => {
    const table = tableRef.current
    /* v8 ignore start */
    if (!table) return
    /* v8 ignore stop */

    const prev = prevFlipperRef.current

    if (flipperState.left && !prev.left) {
      activateFlipper(table.leftFlipper, 'left')
    } else if (!flipperState.left && prev.left) {
      deactivateFlipper(table.leftFlipper, 'left')
    }

    if (flipperState.right && !prev.right) {
      activateFlipper(table.rightFlipper, 'right')
    } else if (!flipperState.right && prev.right) {
      deactivateFlipper(table.rightFlipper, 'right')
    }

    prevFlipperRef.current = { ...flipperState }
  }, [flipperState])

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    /* v8 ignore start */
    if (!canvas || !ctx) return
    /* v8 ignore stop */

    let lastTime = performance.now()

    const render = (time: number) => {
      const table = tableRef.current
      /* v8 ignore start */
      if (!table) return
      /* v8 ignore stop */

      const delta = time - lastTime
      lastTime = time

      // Don't step physics if GE is open (ball frozen)
      if (!geOpen) {
        stepEngine(table.engine, delta)
      }

      // Clear
      ctx.fillStyle = '#1a0a00'
      ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT)

      // Draw table border
      ctx.strokeStyle = '#8B6914'
      ctx.lineWidth = 4
      ctx.strokeRect(2, 2, TABLE_WIDTH - 4, TABLE_HEIGHT - 4)

      // Draw bumpers
      BUMPER_CONFIGS.forEach((config, i) => {
        const body = table.bumpers[i]
        ctx.beginPath()
        ctx.arc(body.position.x, body.position.y, BUMPER_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = '#4a2800'
        ctx.fill()
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = '#FFD700'
        ctx.font = '11px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(config.label, body.position.x, body.position.y)
      })

      // Draw GE catch zone
      const ge = table.geCatch
      ctx.fillStyle = '#2d5a1e'
      ctx.fillRect(ge.position.x - 30, ge.position.y - 10, 60, 20)
      ctx.fillStyle = '#FFD700'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('💰 G.E.', ge.position.x, ge.position.y + 1)

      // Draw flippers
      const drawFlipper = (body: typeof table.leftFlipper) => {
        ctx.save()
        ctx.translate(body.position.x, body.position.y)
        ctx.rotate(body.angle)
        ctx.fillStyle = '#C0C0C0'
        ctx.beginPath()
        const r = FLIPPER_HEIGHT / 2
        ctx.moveTo(-FLIPPER_WIDTH / 2 + r, -r)
        ctx.lineTo(FLIPPER_WIDTH / 2 - r, -r)
        ctx.arc(FLIPPER_WIDTH / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2)
        ctx.lineTo(-FLIPPER_WIDTH / 2 + r, r)
        ctx.arc(-FLIPPER_WIDTH / 2 + r, 0, r, Math.PI / 2, -Math.PI / 2)
        ctx.fill()
        ctx.restore()
      }
      drawFlipper(table.leftFlipper)
      drawFlipper(table.rightFlipper)

      // Draw ball
      if (table.ball) {
        ctx.beginPath()
        ctx.arc(table.ball.position.x, table.ball.position.y, BALL_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = '#E0E0E0'
        ctx.fill()
        ctx.strokeStyle = '#888'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw guide walls
      ctx.fillStyle = '#8B6914'
      ctx.save()
      ctx.translate(TABLE_WIDTH * 0.08, TABLE_HEIGHT - 160)
      ctx.rotate(0.4)
      ctx.fillRect(-10, -60, 20, 120)
      ctx.restore()
      ctx.save()
      ctx.translate(TABLE_WIDTH * 0.92, TABLE_HEIGHT - 160)
      ctx.rotate(-0.4)
      ctx.fillRect(-10, -60, 20, 120)
      ctx.restore()

      // Frozen indicator
      if (geOpen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
        ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT)
        ctx.fillStyle = '#FFD700'
        ctx.font = '18px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('Grand Exchange Open', TABLE_WIDTH / 2, TABLE_HEIGHT / 2)
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [geOpen])

  const handleCanvasClick = () => {
    if (!ballInPlay) {
      onLaunchBall()
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={TABLE_WIDTH}
      height={TABLE_HEIGHT}
      onClick={handleCanvasClick}
      data-testid="pinball-canvas"
      style={{
        border: '2px solid #8B6914',
        borderRadius: 8,
        cursor: ballInPlay ? 'default' : 'pointer',
        touchAction: 'none',
      }}
    />
  )
}
