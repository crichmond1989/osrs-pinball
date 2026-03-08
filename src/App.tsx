import { useState, useCallback } from 'react'
import { PinballCanvas } from './components/PinballCanvas'
import { Inventory } from './components/Inventory'
import { Equipment } from './components/Equipment'
import { GrandExchange } from './components/GrandExchange'
import { HUD } from './components/HUD'
import { MobileControls } from './components/MobileControls'
import { useGameState } from './hooks/useGameState'
import { useFlipperControls } from './hooks/useFlipperControls'
import type { FlipperState } from './hooks/useFlipperControls'
import { usePlungerControl } from './hooks/usePlungerControl'

export default function App() {
  const {
    state,
    launchBall,
    loseBall,
    openGe,
    closeGe,
    moveInventoryItem,
    equipInventoryItem,
    handleBumperHit,
    handleGeBuy,
  } = useGameState()

  const [flipperState, setFlipperState] = useState<FlipperState>({ left: false, right: false })

  const handleFlipperChange = useCallback((newState: FlipperState) => {
    setFlipperState(newState)
  }, [])

  const { handleTouchStart, handleTouchEnd } = useFlipperControls(handleFlipperChange)

  const [plungerHeld, setPlungerHeld] = useState(false)
  const handlePlungerChange = useCallback((held: boolean) => {
    setPlungerHeld(held)
  }, [])
  usePlungerControl(handlePlungerChange)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#0d0d0d',
        padding: 16,
      }}
    >
      <h1
        style={{
          color: '#FFD700',
          fontFamily: 'monospace',
          margin: '0 0 12px',
          fontSize: 24,
          textShadow: '0 0 10px rgba(255,215,0,0.5)',
        }}
      >
        OSRS Pinball
      </h1>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <HUD
            gp={state.gp}
            ballInPlay={state.ballInPlay}
            lastSkill={state.lastSkill}
            ballsFired={state.ballsFired}
          />
          <PinballCanvas
            ballInPlay={state.ballInPlay}
            geOpen={state.geOpen}
            onBumperHit={handleBumperHit}
            onGeCatch={openGe}
            onBallLost={loseBall}
            onLaunchBall={launchBall}
            flipperState={flipperState}
            plungerHeld={plungerHeld}
          />
          <MobileControls onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Equipment equipment={state.equipment} />
          <Inventory
            inventory={state.inventory}
            onMoveItem={moveInventoryItem}
            onEquipItem={equipInventoryItem}
          />
        </div>
      </div>

      {state.geOpen && (
        <GrandExchange gp={state.gp} onBuy={handleGeBuy} onClose={closeGe} />
      )}
    </div>
  )
}
