import { renderHook, act, waitFor } from '@testing-library/react'

const mockGenerateOtpCodesByIds = jest.fn()

jest.mock('../api/generateOtpCodesByIds', () => ({
  generateOtpCodesByIds: (...args) => mockGenerateOtpCodesByIds(...args)
}))

jest.mock('../utils/createAlignedInterval', () => ({
  createAlignedInterval: (callback) => {
    const id = setInterval(callback, 1000)
    return () => clearInterval(id)
  }
}))

const { useOtpCodes } = require('./useOtpCodes')

jest.useFakeTimers()

describe('useOtpCodes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns empty map initially', () => {
    const { result } = renderHook(() => useOtpCodes([]))

    expect(result.current.otpCodes).toEqual({})
  })

  test('returns empty map when records is null', () => {
    const { result } = renderHook(() => useOtpCodes(null))

    expect(result.current.otpCodes).toEqual({})
  })

  test('fetches codes for records with otpPublic', async () => {
    const records = [
      { id: 'rec-1', otpPublic: { type: 'TOTP', period: 30 } },
      { id: 'rec-2', otpPublic: { type: 'TOTP', period: 30 } }
    ]

    mockGenerateOtpCodesByIds.mockResolvedValue([
      { recordId: 'rec-1', code: '123456', timeRemaining: 20 },
      { recordId: 'rec-2', code: '654321', timeRemaining: 20 }
    ])

    const { result } = renderHook(() => useOtpCodes(records))

    await waitFor(() => {
      expect(result.current.otpCodes).toEqual({
        'rec-1': { recordId: 'rec-1', code: '123456', timeRemaining: 20 },
        'rec-2': { recordId: 'rec-2', code: '654321', timeRemaining: 20 }
      })
    })

    expect(mockGenerateOtpCodesByIds).toHaveBeenCalledWith(['rec-1', 'rec-2'])
  })

  test('does not fetch when no records have otpPublic', () => {
    const records = [{ id: 'rec-1' }, { id: 'rec-2' }]

    renderHook(() => useOtpCodes(records))

    expect(mockGenerateOtpCodesByIds).not.toHaveBeenCalled()
  })

  test('only fetches codes for records that have otpPublic', async () => {
    const records = [
      { id: 'rec-1', otpPublic: { type: 'TOTP', period: 30 } },
      { id: 'rec-2' },
      { id: 'rec-3', otpPublic: { type: 'TOTP', period: 30 } }
    ]

    mockGenerateOtpCodesByIds.mockResolvedValue([
      { recordId: 'rec-1', code: '111111', timeRemaining: 15 },
      { recordId: 'rec-3', code: '333333', timeRemaining: 15 }
    ])

    const { result } = renderHook(() => useOtpCodes(records))

    await waitFor(() => {
      expect(mockGenerateOtpCodesByIds).toHaveBeenCalledWith(['rec-1', 'rec-3'])
    })

    await waitFor(() => {
      expect(result.current.otpCodes).toEqual({
        'rec-1': { recordId: 'rec-1', code: '111111', timeRemaining: 15 },
        'rec-3': { recordId: 'rec-3', code: '333333', timeRemaining: 15 }
      })
    })
  })

  test('refreshes codes on interval tick', async () => {
    const records = [{ id: 'rec-1', otpPublic: { type: 'TOTP', period: 30 } }]

    mockGenerateOtpCodesByIds
      .mockResolvedValueOnce([
        { recordId: 'rec-1', code: '111111', timeRemaining: 25 }
      ])
      .mockResolvedValueOnce([
        { recordId: 'rec-1', code: '111111', timeRemaining: 24 }
      ])
      .mockResolvedValueOnce([
        { recordId: 'rec-1', code: '111111', timeRemaining: 23 }
      ])

    const { result } = renderHook(() => useOtpCodes(records))

    await waitFor(() => {
      expect(result.current.otpCodes['rec-1'].timeRemaining).toBe(25)
    })

    await act(async () => {
      jest.advanceTimersByTime(2000)
    })

    await waitFor(() => {
      expect(mockGenerateOtpCodesByIds).toHaveBeenCalledTimes(3)
    })
  })

  test('handles API errors gracefully', async () => {
    const records = [{ id: 'rec-1', otpPublic: { type: 'TOTP', period: 30 } }]

    mockGenerateOtpCodesByIds.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useOtpCodes(records))

    // Wait for the async call to complete
    await act(async () => {
      await Promise.resolve()
    })

    // Should remain empty after error, not crash
    expect(result.current.otpCodes).toEqual({})
  })

  test('cleans up interval on unmount', async () => {
    const records = [{ id: 'rec-1', otpPublic: { type: 'TOTP', period: 30 } }]

    mockGenerateOtpCodesByIds.mockResolvedValue([
      { recordId: 'rec-1', code: '111111', timeRemaining: 20 }
    ])

    const { unmount } = renderHook(() => useOtpCodes(records))

    await waitFor(() => {
      expect(mockGenerateOtpCodesByIds).toHaveBeenCalledTimes(1)
    })

    unmount()

    mockGenerateOtpCodesByIds.mockClear()

    await act(async () => {
      jest.advanceTimersByTime(3000)
    })

    expect(mockGenerateOtpCodesByIds).not.toHaveBeenCalled()
  })

  test('re-subscribes when otpRecordCount changes', async () => {
    const recordsWithoutOtp = [{ id: 'rec-1' }]
    const recordsWithOtp = [
      { id: 'rec-1', otpPublic: { type: 'TOTP', period: 30 } }
    ]

    mockGenerateOtpCodesByIds.mockResolvedValue([
      { recordId: 'rec-1', code: '999999', timeRemaining: 30 }
    ])

    const { result, rerender } = renderHook(
      ({ records }) => useOtpCodes(records),
      { initialProps: { records: recordsWithoutOtp } }
    )

    expect(mockGenerateOtpCodesByIds).not.toHaveBeenCalled()

    rerender({ records: recordsWithOtp })

    await waitFor(() => {
      expect(mockGenerateOtpCodesByIds).toHaveBeenCalledTimes(1)
      expect(result.current.otpCodes).toEqual({
        'rec-1': { recordId: 'rec-1', code: '999999', timeRemaining: 30 }
      })
    })
  })
})
