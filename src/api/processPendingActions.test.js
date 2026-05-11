import { processPendingActions } from './processPendingActions'
import { pearpassVaultClient } from '../instances'

const mockExecute = {}

jest.mock('../actions', () => ({
  get ACTIONS() {
    return mockExecute
  }
}))

describe('processPendingActions', () => {
  beforeEach(() => {
    for (const k of Object.keys(mockExecute)) delete mockExecute[k]

    pearpassVaultClient.activeVaultGetWriterKey.mockReset()
    pearpassVaultClient.activeVaultList.mockReset()
    pearpassVaultClient.activeVaultFind = jest.fn()
    pearpassVaultClient.activeVaultRemove.mockReset()

    pearpassVaultClient.activeVaultGetWriterKey.mockResolvedValue('w-bbb')
    pearpassVaultClient.activeVaultList.mockResolvedValue([
      { id: 'AAA', name: 'macos 15.0', writerKey: 'w-aaa' },
      { id: 'BBB', name: 'ios 18.0', writerKey: 'w-bbb' }
    ])
  })

  it('skips the find when deviceId cannot be resolved', async () => {
    pearpassVaultClient.activeVaultList.mockResolvedValue([])
    await processPendingActions()
    expect(pearpassVaultClient.activeVaultFind).not.toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultRemove).not.toHaveBeenCalled()
  })

  it('scans the device-specific prefix range', async () => {
    pearpassVaultClient.activeVaultFind.mockResolvedValue([])
    await processPendingActions()
    expect(pearpassVaultClient.activeVaultFind).toHaveBeenCalledWith({
      gte: { key: 'actions/queue/BBB/' },
      lt: { key: 'actions/queue/BBB0' }
    })
  })

  it('dispatches each entry to the action handler and removes it', async () => {
    const execute = jest.fn().mockResolvedValue()
    mockExecute['smoke-test'] = { execute }

    pearpassVaultClient.activeVaultFind.mockResolvedValue([
      {
        key: 'actions/queue/BBB/1736000000001_x1',
        value: {
          type: 'smoke-test',
          actor: 'AAA',
          createdAt: 't1',
          payload: { description: 'hello' }
        }
      }
    ])

    await processPendingActions()

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'smoke-test',
        actor: 'AAA',
        payload: { description: 'hello' }
      })
    )
    expect(pearpassVaultClient.activeVaultRemove).toHaveBeenCalledWith(
      'actions/queue/BBB/1736000000001_x1'
    )
  })

  it('skips entries whose type has no entry in ACTIONS', async () => {
    pearpassVaultClient.activeVaultFind.mockResolvedValue([
      {
        key: 'actions/queue/BBB/1736000000001_x1',
        value: { type: 'never-registered', actor: 'AAA' }
      }
    ])

    await processPendingActions()

    expect(pearpassVaultClient.activeVaultRemove).not.toHaveBeenCalled()
  })

  it('continues past a handler error and leaves that entry in the queue', async () => {
    mockExecute['ok'] = { execute: jest.fn().mockResolvedValue() }
    mockExecute['fail'] = {
      execute: jest.fn().mockRejectedValue(new Error('boom'))
    }

    pearpassVaultClient.activeVaultFind.mockResolvedValue([
      {
        key: 'actions/queue/BBB/1736000000001_a',
        value: { type: 'fail', actor: 'AAA' }
      },
      {
        key: 'actions/queue/BBB/1736000000002_b',
        value: { type: 'ok', actor: 'AAA' }
      }
    ])

    await processPendingActions()

    expect(pearpassVaultClient.activeVaultRemove).not.toHaveBeenCalledWith(
      'actions/queue/BBB/1736000000001_a'
    )
    expect(pearpassVaultClient.activeVaultRemove).toHaveBeenCalledWith(
      'actions/queue/BBB/1736000000002_b'
    )
  })
})
