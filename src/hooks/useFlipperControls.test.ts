import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFlipperControls } from './useFlipperControls'

describe('useFlipperControls', () => {
  it('fires left flipper on ArrowLeft keydown', () => {
    const onChange = vi.fn()
    renderHook(() => useFlipperControls(onChange))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    })
    expect(onChange).toHaveBeenCalledWith({ left: true, right: false })
  })

  it('fires left flipper on "a" keydown', () => {
    const onChange = vi.fn()
    renderHook(() => useFlipperControls(onChange))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    })
    expect(onChange).toHaveBeenCalledWith({ left: true, right: false })
  })

  it('fires left flipper on "A" keydown', () => {
    const onChange = vi.fn()
    renderHook(() => useFlipperControls(onChange))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }))
    })
    expect(onChange).toHaveBeenCalledWith({ left: true, right: false })
  })

  it('fires right flipper on ArrowRight keydown', () => {
    const onChange = vi.fn()
    renderHook(() => useFlipperControls(onChange))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    })
    expect(onChange).toHaveBeenCalledWith({ left: false, right: true })
  })

  it('fires right flipper on "d" keydown', () => {
    const onChange = vi.fn()
    renderHook(() => useFlipperControls(onChange))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }))
    })
    expect(onChange).toHaveBeenCalledWith({ left: false, right: true })
  })

  it('fires right flipper on "D" keydown', () => {
    const onChange = vi.fn()
    renderHook(() => useFlipperControls(onChange))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'D' }))
    })
    expect(onChange).toHaveBeenCalledWith({ left: false, right: true })
  })

  it('releases left flipper on ArrowLeft keyup', () => {
    const onChange = vi.fn()
    renderHook(() => useFlipperControls(onChange))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
    })
    expect(onChange).toHaveBeenLastCalledWith({ left: false, right: false })
  })

  it('releases left flipper on "a" keyup', () => {
    const onChange = vi.fn()
    renderHook(() => useFlipperControls(onChange))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }))
    })
    expect(onChange).toHaveBeenLastCalledWith({ left: false, right: false })
  })

  it('releases left flipper on "A" keyup', () => {
    const onChange = vi.fn()
    renderHook(() => useFlipperControls(onChange))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'A' }))
    })
    expect(onChange).toHaveBeenLastCalledWith({ left: false, right: false })
  })

  it('releases right flipper on ArrowRight keyup', () => {
    const onChange = vi.fn()
    renderHook(() => useFlipperControls(onChange))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }))
    })
    expect(onChange).toHaveBeenLastCalledWith({ left: false, right: false })
  })

  it('releases right flipper on "d" keyup', () => {
    const onChange = vi.fn()
    renderHook(() => useFlipperControls(onChange))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }))
    })
    expect(onChange).toHaveBeenLastCalledWith({ left: false, right: false })
  })

  it('releases right flipper on "D" keyup', () => {
    const onChange = vi.fn()
    renderHook(() => useFlipperControls(onChange))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'D' }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'D' }))
    })
    expect(onChange).toHaveBeenLastCalledWith({ left: false, right: false })
  })

  it('provides touch handlers', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useFlipperControls(onChange))

    act(() => {
      result.current.handleTouchStart('left')
    })
    expect(onChange).toHaveBeenCalledWith({ left: true, right: false })

    act(() => {
      result.current.handleTouchEnd('left')
    })
    expect(onChange).toHaveBeenCalledWith({ left: false, right: false })

    act(() => {
      result.current.handleTouchStart('right')
    })
    expect(onChange).toHaveBeenCalledWith({ left: false, right: true })

    act(() => {
      result.current.handleTouchEnd('right')
    })
    expect(onChange).toHaveBeenCalledWith({ left: false, right: false })
  })

  it('cleans up event listeners on unmount', () => {
    const onChange = vi.fn()
    const spy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useFlipperControls(onChange))
    unmount()
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(spy).toHaveBeenCalledWith('keyup', expect.any(Function))
    spy.mockRestore()
  })
})
