import { useEffect, useCallback } from 'react'

export function usePlungerControl(onPlungerChange: (held: boolean) => void) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault()
        onPlungerChange(true)
      }
    },
    [onPlungerChange],
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        onPlungerChange(false)
      }
    },
    [onPlungerChange],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])
}
