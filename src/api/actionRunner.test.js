import { runActionScan } from './actionRunner'
import { logger } from '../utils/logger'

const mockProcessPendingActions = jest.fn()

jest.mock('./processPendingActions', () => ({
  processPendingActions: (...args) => mockProcessPendingActions(...args)
}))

jest.spyOn(logger, 'error').mockImplementation(() => {})

describe('actionRunner', () => {
  beforeEach(() => {
    mockProcessPendingActions.mockReset()
    logger.error.mockClear()
  })

  it('calls processPendingActions', async () => {
    mockProcessPendingActions.mockResolvedValue(undefined)
    await runActionScan()
    expect(mockProcessPendingActions).toHaveBeenCalledTimes(1)
  })

  it('coalesces overlapping calls via single-flight + pendingRescan', async () => {
    let resolveFirst
    mockProcessPendingActions
      .mockImplementationOnce(
        () => new Promise((resolve) => { resolveFirst = resolve })
      )
      .mockResolvedValue(undefined)

    const first = runActionScan()
    await new Promise((r) => setTimeout(r, 0))

    const second = runActionScan()
    const third = runActionScan()

    resolveFirst()
    await Promise.all([first, second, third])

    expect(mockProcessPendingActions).toHaveBeenCalledTimes(2)
  })

  it('swallows processPendingActions errors, logs them, and resets state for the next scan', async () => {
    mockProcessPendingActions
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue(undefined)

    await expect(runActionScan()).resolves.toBeUndefined()
    expect(mockProcessPendingActions).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith(
      'runActionScan: processPendingActions failed',
      expect.any(Error)
    )

    await runActionScan()
    expect(mockProcessPendingActions).toHaveBeenCalledTimes(2)
  })
})
