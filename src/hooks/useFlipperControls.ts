import { useEffect, useCallback, useRef } from 'react'

export interface FlipperState {
  left: boolean
  right: boolean
}

export function useFlipperControls(
  onFlipperChange: (state: FlipperState) => void,
) {
  const stateRef = useRef<FlipperState>({ left: false, right: false })

  const update = useCallback(
    (side: 'left' | 'right', active: boolean) => {
      const newState = { ...stateRef.current, [side]: active }
      stateRef.current = newState
      onFlipperChange(newState)
    },
    [onFlipperChange],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        update('left', true)
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        update('right', true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        update('left', false)
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        update('right', false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [update])

  const handleTouchStart = useCallback(
    (side: 'left' | 'right') => {
      update(side, true)
    },
    [update],
  )

  const handleTouchEnd = useCallback(
    (side: 'left' | 'right') => {
      update(side, false)
    },
    [update],
  )

  return { handleTouchStart, handleTouchEnd }
}
