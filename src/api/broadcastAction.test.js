import { broadcastAction } from './broadcastAction'
import { pearpassVaultClient } from '../instances'

describe('broadcastAction', () => {
  beforeEach(() => {
    pearpassVaultClient.activeVaultGetWriterKey.mockReset()
    pearpassVaultClient.activeVaultList.mockReset()
    pearpassVaultClient.activeVaultAdd.mockReset()

    pearpassVaultClient.activeVaultGetWriterKey.mockResolvedValue('w-aaa')
  })

  it('throws when type is missing', async () => {
    pearpassVaultClient.activeVaultList.mockResolvedValue([
      { id: 'AAA', name: 'ios 18.0', writerKey: 'w-aaa' }
    ])
    await expect(broadcastAction({})).rejects.toThrow('type is required')
  })

  it('throws when no device entry matches the current writerKey', async () => {
    pearpassVaultClient.activeVaultList.mockResolvedValue([
      { id: 'BBB', name: 'macos 15.0', writerKey: 'w-bbb' }
    ])
    await expect(broadcastAction({ type: 'foo' })).rejects.toThrow(
      'cannot resolve own device id'
    )
  })

  it('queues one entry per device, excluding self', async () => {
    pearpassVaultClient.activeVaultList.mockResolvedValue([
      { id: 'AAA', name: 'ios 18.0', writerKey: 'w-aaa' },
      { id: 'BBB', name: 'macos 15.0', writerKey: 'w-bbb' },
      { id: 'CCC', name: 'android 14', writerKey: 'w-ccc' }
    ])

    const results = await broadcastAction({
      type: 'delete-vault',
      payload: { reason: 'manual' }
    })

    expect(results).toHaveLength(2)
    const targets = results.map((r) => r.targetDeviceId).sort()
    expect(targets).toEqual(['BBB', 'CCC'])

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledTimes(2)
    for (const call of pearpassVaultClient.activeVaultAdd.mock.calls) {
      const [key, body] = call
      expect(key.startsWith('actions/queue/')).toBe(true)
      expect(body.type).toBe('delete-vault')
      expect(body.actor).toBe('AAA')
      expect(body.payload).toEqual({ reason: 'manual' })
    }
  })

  it('returns an empty array when only self is paired', async () => {
    pearpassVaultClient.activeVaultList.mockResolvedValue([
      { id: 'AAA', name: 'ios 18.0', writerKey: 'w-aaa' }
    ])

    const results = await broadcastAction({ type: 'logout' })

    expect(results).toEqual([])
    expect(pearpassVaultClient.activeVaultAdd).not.toHaveBeenCalled()
  })
})
