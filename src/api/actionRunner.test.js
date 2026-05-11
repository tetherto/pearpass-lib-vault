import { runActionScan } from './actionRunner'

const mockProcessPendingActions = jest.fn()

jest.mock('./processPendingActions', () => ({
  processPendingActions: (...args) => mockProcessPendingActions(...args)
}))

describe('actionRunner', () => {
  beforeEach(() => {
    mockProcessPendingActions.mockReset()
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

  it('propagates processPendingActions errors but resets state for the next scan', async () => {
    mockProcessPendingActions
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue(undefined)

    await expect(runActionScan()).rejects.toThrow('boom')
    expect(mockProcessPendingActions).toHaveBeenCalledTimes(1)

    await runActionScan()
    expect(mockProcessPendingActions).toHaveBeenCalledTimes(2)
  })
})
