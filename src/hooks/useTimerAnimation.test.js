import { renderHook, act } from '@testing-library/react'

import { useTimerAnimation } from './useTimerAnimation'

// Mock requestAnimationFrame / cancelAnimationFrame for jsdom
beforeAll(() => {
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0)
  global.cancelAnimationFrame = (id) => clearTimeout(id)
})

jest.useFakeTimers()

describe('useTimerAnimation', () => {
  test('starts with noTransition true', () => {
    const { result } = renderHook(() => useTimerAnimation(20, 30))

    expect(result.current.noTransition).toBe(true)
  })

  test('returns correct targetTime equal to timeRemaining when noTransition is true', () => {
    const { result } = renderHook(() => useTimerAnimation(20, 30))

    expect(result.current.targetTime).toBe(20)
  })

  test('transitions to noTransition false after rAF frames', async () => {
    const { result } = renderHook(() => useTimerAnimation(20, 30, true))

    expect(result.current.noTransition).toBe(true)

    // Flush the double-rAF (two setTimeout(cb, 0) calls)
    await act(async () => {
      jest.advanceTimersByTime(1)
      jest.advanceTimersByTime(1)
    })

    expect(result.current.noTransition).toBe(false)
  })

  test('returns targetTime of timeRemaining - 1 when animating', async () => {
    const { result } = renderHook(() => useTimerAnimation(20, 30, true))

    // Flush double-rAF to enable transition
    await act(async () => {
      jest.advanceTimersByTime(1)
      jest.advanceTimersByTime(1)
    })

    expect(result.current.noTransition).toBe(false)
    expect(result.current.targetTime).toBe(19)
  })

  test('detects expiring state when timeRemaining <= 5', () => {
    const { result } = renderHook(() => useTimerAnimation(5, 30))

    expect(result.current.expiring).toBe(true)
  })

  test('detects expiring state when timeRemaining is 1', () => {
    const { result } = renderHook(() => useTimerAnimation(1, 30))

    expect(result.current.expiring).toBe(true)
  })

  test('not expiring when timeRemaining > 5', () => {
    const { result } = renderHook(() => useTimerAnimation(6, 30))

    expect(result.current.expiring).toBe(false)
  })

  test('handles null timeRemaining', () => {
    const { result } = renderHook(() => useTimerAnimation(null, 30))

    expect(result.current.targetTime).toBe(0)
    expect(result.current.expiring).toBe(false)
    expect(result.current.noTransition).toBe(true)
  })

  test('sets noTransition on large time jumps (diff > 1)', async () => {
    const { result, rerender } = renderHook(
      ({ time }) => useTimerAnimation(time, 30, true),
      { initialProps: { time: 20 } }
    )

    // Flush rAF to transition to animated state
    await act(async () => {
      jest.advanceTimersByTime(1)
      jest.advanceTimersByTime(1)
    })

    expect(result.current.noTransition).toBe(false)

    // Simulate a large time jump (e.g., new OTP period)
    rerender({ time: 30 })

    // After a large jump, noTransition should be true again
    expect(result.current.noTransition).toBe(true)
    expect(result.current.targetTime).toBe(30)
  })

  test('does not set noTransition on normal 1-second decrements', async () => {
    const { result, rerender } = renderHook(
      ({ time }) => useTimerAnimation(time, 30, true),
      { initialProps: { time: 20 } }
    )

    // Flush rAF to transition to animated state
    await act(async () => {
      jest.advanceTimersByTime(1)
      jest.advanceTimersByTime(1)
    })

    expect(result.current.noTransition).toBe(false)

    // Normal 1-second decrement (diff = 1, not > 1)
    rerender({ time: 19 })

    // Should stay animated
    expect(result.current.noTransition).toBe(false)
  })

  test('noTransition is always true when animated is false', async () => {
    const { result } = renderHook(() => useTimerAnimation(20, 30, false))

    expect(result.current.noTransition).toBe(true)

    // Even after advancing timers, it should stay noTransition
    await act(async () => {
      jest.advanceTimersByTime(1)
      jest.advanceTimersByTime(1)
    })

    expect(result.current.noTransition).toBe(true)
  })

  test('targetTime is clamped to 0 minimum', () => {
    const { result } = renderHook(() => useTimerAnimation(0, 30))

    expect(result.current.targetTime).toBe(0)
  })
})
