import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePlungerControl } from './usePlungerControl'

describe('usePlungerControl', () => {
  it('calls onPlungerChange(true) on ArrowDown keydown', () => {
    const onChange = vi.fn()
    renderHook(() => usePlungerControl(onChange))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onPlungerChange(true) on s keydown', () => {
    const onChange = vi.fn()
    renderHook(() => usePlungerControl(onChange))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onPlungerChange(true) on S keydown', () => {
    const onChange = vi.fn()
    renderHook(() => usePlungerControl(onChange))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'S', bubbles: true }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('does NOT call onPlungerChange when keydown is repeated', () => {
    const onChange = vi.fn()
    renderHook(() => usePlungerControl(onChange))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', repeat: true, bubbles: true }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('calls onPlungerChange(false) on ArrowDown keyup', () => {
    const onChange = vi.fn()
    renderHook(() => usePlungerControl(onChange))
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', bubbles: true }))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('calls onPlungerChange(false) on s keyup', () => {
    const onChange = vi.fn()
    renderHook(() => usePlungerControl(onChange))
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 's', bubbles: true }))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('calls onPlungerChange(false) on S keyup', () => {
    const onChange = vi.fn()
    renderHook(() => usePlungerControl(onChange))
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'S', bubbles: true }))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('does not call onPlungerChange for unrelated keys', () => {
    const onChange = vi.fn()
    renderHook(() => usePlungerControl(onChange))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft', bubbles: true }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('cleans up event listeners on unmount', () => {
    const onChange = vi.fn()
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => usePlungerControl(onChange))
    unmount()

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('keyup', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('keyup', expect.any(Function))
  })
})
