import { createAlignedInterval } from './createAlignedInterval'

jest.useFakeTimers()

describe('createAlignedInterval', () => {
  beforeEach(() => {
    jest.clearAllTimers()
  })

  test('calls callback on each tick', () => {
    const callback = jest.fn()
    const cleanup = createAlignedInterval(callback)

    jest.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(2)

    cleanup()
  })

  test('stops calling after cleanup', () => {
    const callback = jest.fn()
    const cleanup = createAlignedInterval(callback)

    jest.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    cleanup()

    jest.advanceTimersByTime(3000)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('aligns to whole-second boundaries', () => {
    // Set clock to 500ms past a second boundary
    jest.setSystemTime(new Date('2026-01-01T00:00:00.500Z'))

    const callback = jest.fn()
    const cleanup = createAlignedInterval(callback)

    // Should fire after 500ms (to align to next second)
    jest.advanceTimersByTime(499)
    expect(callback).not.toHaveBeenCalled()

    jest.advanceTimersByTime(1)
    expect(callback).toHaveBeenCalledTimes(1)

    cleanup()
  })

  test('does not call callback immediately', () => {
    const callback = jest.fn()
    const cleanup = createAlignedInterval(callback)

    expect(callback).not.toHaveBeenCalled()

    cleanup()
  })

  test('returns a cleanup function', () => {
    const callback = jest.fn()
    const cleanup = createAlignedInterval(callback)

    expect(typeof cleanup).toBe('function')

    cleanup()
  })
})
