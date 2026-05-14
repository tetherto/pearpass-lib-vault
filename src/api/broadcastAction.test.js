import { broadcastAction } from './broadcastAction'
import { pearpassVaultClient } from '../instances'

jest.mock(
  '@tetherto/pear-apps-utils-generate-unique-id',
  () => ({ generateUniqueId: jest.fn(() => 'fixed-id') }),
  { virtual: true }
)

jest.mock('../actions', () => ({
  ACTION_TYPES: { LOGOUT: 'logout', DELETE_VAULT: 'delete-vault' }
}))

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
    await expect(broadcastAction({ type: 'logout' })).rejects.toThrow(
      'cannot resolve own device id'
    )
  })

  it('queues one entry per device, excluding self', async () => {
    pearpassVaultClient.activeVaultList.mockResolvedValue([
      { id: 'AAA', name: 'ios 18.0', writerKey: 'w-aaa' },
      { id: 'BBB', name: 'macos 15.0', writerKey: 'w-bbb' },
      { id: 'CCC', name: 'android 14', writerKey: 'w-ccc' }
    ])

    const { results, failures } = await broadcastAction({
      type: 'delete-vault',
      payload: { reason: 'manual' }
    })

    expect(failures).toEqual([])
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

  it('returns empty results and failures when only self is paired', async () => {
    pearpassVaultClient.activeVaultList.mockResolvedValue([
      { id: 'AAA', name: 'ios 18.0', writerKey: 'w-aaa' }
    ])

    const { results, failures } = await broadcastAction({ type: 'logout' })

    expect(results).toEqual([])
    expect(failures).toEqual([])
    expect(pearpassVaultClient.activeVaultAdd).not.toHaveBeenCalled()
  })

  it('reports partial failures without aborting other targets', async () => {
    pearpassVaultClient.activeVaultList.mockResolvedValue([
      { id: 'AAA', name: 'ios 18.0', writerKey: 'w-aaa' },
      { id: 'BBB', name: 'macos 15.0', writerKey: 'w-bbb' },
      { id: 'CCC', name: 'android 14', writerKey: 'w-ccc' }
    ])

    const boom = new Error('write failed')
    pearpassVaultClient.activeVaultAdd.mockImplementation((key) => {
      if (key.includes('/BBB/')) return Promise.reject(boom)
      return Promise.resolve()
    })

    const { results, failures } = await broadcastAction({ type: 'logout' })

    expect(results.map((r) => r.targetDeviceId)).toEqual(['CCC'])
    expect(failures).toEqual([{ targetDeviceId: 'BBB', error: boom }])
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledTimes(2)
  })
})
