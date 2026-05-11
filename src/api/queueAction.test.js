import { generateUniqueId } from '@tetherto/pear-apps-utils-generate-unique-id'

import { queueAction } from './queueAction'
import { pearpassVaultClient } from '../instances'

jest.mock('@tetherto/pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn()
}))

describe('queueAction', () => {
  const FIXED_NOW = 1736000000001
  const FIXED_ACTION_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(FIXED_NOW)
    generateUniqueId.mockReturnValue(FIXED_ACTION_ID)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('throws when targetDeviceId is missing', async () => {
    await expect(
      queueAction(null, { type: 'foo', actor: 'AAA' })
    ).rejects.toThrow('targetDeviceId is required')
  })

  it('throws when type is missing', async () => {
    await expect(queueAction('BBB', { actor: 'AAA' })).rejects.toThrow(
      'type is required'
    )
  })

  it('throws when actor is missing', async () => {
    await expect(queueAction('BBB', { type: 'foo' })).rejects.toThrow(
      'actor is required'
    )
  })

  it('writes a queue entry with the canonical key shape and body', async () => {
    const result = await queueAction('BBB', {
      type: 'delete-vault',
      payload: { reason: 'manual' },
      actor: 'AAA'
    })

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledTimes(1)
    const [key, body] = pearpassVaultClient.activeVaultAdd.mock.calls[0]

    expect(key).toBe(
      `actions/queue/BBB/${String(FIXED_NOW).padStart(13, '0')}_${FIXED_ACTION_ID}`
    )

    expect(body).toEqual({
      type: 'delete-vault',
      actor: 'AAA',
      createdAt: expect.any(String),
      payload: { reason: 'manual' }
    })

    expect(result).toEqual({
      timestamp: String(FIXED_NOW).padStart(13, '0'),
      actionId: FIXED_ACTION_ID,
      key
    })
  })

  it('omits payload when not provided', async () => {
    await queueAction('BBB', { type: 'logout', actor: 'AAA' })
    const [, body] = pearpassVaultClient.activeVaultAdd.mock.calls[0]
    expect(body).not.toHaveProperty('payload')
  })
})
