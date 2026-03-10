import { renderHook, act, waitFor } from '@testing-library/react'

const mockGenerateOtpCodesByIds = jest.fn()
const mockGenerateHotpNext = jest.fn()

jest.mock('../api/generateOtpCodesByIds', () => ({
  generateOtpCodesByIds: (...args) => mockGenerateOtpCodesByIds(...args)
}))

jest.mock('../api/generateHotpNext', () => ({
  generateHotpNext: (...args) => mockGenerateHotpNext(...args)
}))

jest.mock('../utils/createAlignedInterval', () => ({
  createAlignedInterval: (callback) => {
    const id = setInterval(callback, 1000)
    return () => clearInterval(id)
  }
}))

const { useOtp } = require('./useOtp')

jest.useFakeTimers()

describe('useOtp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns null values when otpPublic is undefined', () => {
    const { result } = renderHook(() =>
      useOtp({ recordId: 'rec-1', otpPublic: undefined })
    )

    expect(result.current.code).toBeNull()
    expect(result.current.timeRemaining).toBeNull()
    expect(result.current.type).toBeNull()
    expect(result.current.period).toBeNull()
    expect(result.current.generateNext).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  test('TOTP fetches fresh code on mount', async () => {
    const otpPublic = {
      type: 'TOTP',
      digits: 6,
      period: 30,
      currentCode: '123456',
      timeRemaining: 20
    }

    mockGenerateOtpCodesByIds.mockResolvedValue([
      { recordId: 'rec-1', code: '999888', timeRemaining: 25 }
    ])

    const { result } = renderHook(() =>
      useOtp({ recordId: 'rec-1', otpPublic })
    )

    await waitFor(() => {
      expect(result.current.code).toBe('999888')
      expect(result.current.timeRemaining).toBe(25)
    })

    expect(result.current.type).toBe('TOTP')
    expect(result.current.period).toBe(30)
    expect(result.current.generateNext).toBeNull()
  })

  test('TOTP refreshes every second via interval', async () => {
    const otpPublic = {
      type: 'TOTP',
      digits: 6,
      period: 30,
      currentCode: '123456',
      timeRemaining: 20
    }

    mockGenerateOtpCodesByIds
      .mockResolvedValueOnce([
        { recordId: 'rec-1', code: '111111', timeRemaining: 15 }
      ])
      .mockResolvedValueOnce([
        { recordId: 'rec-1', code: '111111', timeRemaining: 14 }
      ])
      .mockResolvedValueOnce([
        { recordId: 'rec-1', code: '111111', timeRemaining: 13 }
      ])

    const { result } = renderHook(() =>
      useOtp({ recordId: 'rec-1', otpPublic })
    )

    await waitFor(() => {
      expect(result.current.timeRemaining).toBe(15)
    })

    await act(async () => {
      jest.advanceTimersByTime(2000)
    })

    await waitFor(() => {
      expect(mockGenerateOtpCodesByIds).toHaveBeenCalledTimes(3)
    })
  })

  test('TOTP updates code when worklet returns new code', async () => {
    const otpPublic = {
      type: 'TOTP',
      digits: 6,
      period: 30,
      currentCode: '123456',
      timeRemaining: 2
    }

    mockGenerateOtpCodesByIds.mockResolvedValue([
      { recordId: 'rec-1', code: '222222', timeRemaining: 30 }
    ])

    const { result } = renderHook(() =>
      useOtp({ recordId: 'rec-1', otpPublic })
    )

    await waitFor(() => {
      expect(result.current.code).toBe('222222')
      expect(result.current.timeRemaining).toBe(30)
    })
  })

  test('HOTP initializes with currentCode and exposes generateNext', () => {
    const otpPublic = {
      type: 'HOTP',
      digits: 6,
      currentCode: '111222'
    }

    const { result } = renderHook(() =>
      useOtp({ recordId: 'rec-1', otpPublic })
    )

    expect(result.current.code).toBe('111222')
    expect(result.current.type).toBe('HOTP')
    expect(result.current.timeRemaining).toBeNull()
    expect(result.current.generateNext).toBeInstanceOf(Function)
  })

  test('HOTP generateNext calls generateHotpNext and updates code', async () => {
    const otpPublic = {
      type: 'HOTP',
      digits: 6,
      currentCode: '111222'
    }

    mockGenerateHotpNext.mockResolvedValue({ code: '333444', counter: 1 })

    const { result } = renderHook(() =>
      useOtp({ recordId: 'rec-1', otpPublic })
    )

    await act(async () => {
      await result.current.generateNext()
    })

    expect(mockGenerateHotpNext).toHaveBeenCalledWith('rec-1')
    expect(result.current.code).toBe('333444')
    expect(result.current.isLoading).toBe(false)
  })
})
