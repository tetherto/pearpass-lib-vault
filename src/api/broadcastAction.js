import { listDevices } from './listDevices'
import { queueAction } from './queueAction'
import { getMyDeviceId } from '../utils/getMyDeviceId'
import { logger } from '../utils/logger'
import { ACTION_TYPES } from '../actions'

/**
 * @param {{
 *   type: string,
 *   payload?: any
 * }} action
 * @returns {Promise<{
 *   results: Array<{
 *     targetDeviceId: string,
 *     timestamp: string,
 *     actionId: string,
 *     key: string
 *   }>,
 *   failures: Array<{
 *     targetDeviceId: string,
 *     error: Error
 *   }>
 * }>}
 */
export const broadcastAction = async ({ type, payload } = {}) => {
  if (!type) {
    throw new Error('broadcastAction: type is required')
  }

  if (!Object.values(ACTION_TYPES).includes(type)) {
    throw new Error('broadcastAction: unknown action type: ' + type)
  }

  const myDeviceId = await getMyDeviceId()
  if (!myDeviceId) {
    throw new Error('broadcastAction: cannot resolve own device id')
  }

  const devices = (await listDevices()) ?? []
  const others = devices.filter((d) => d?.id && d.id !== myDeviceId)

  const settled = await Promise.allSettled(
    others.map((target) =>
      queueAction(target.id, { type, payload, actor: myDeviceId }).then(
        (result) => ({ targetDeviceId: target.id, ...result })
      )
    )
  )

  const results = []
  const failures = []
  settled.forEach((entry, i) => {
    if (entry.status === 'fulfilled') {
      results.push(entry.value)
    } else {
      failures.push({ targetDeviceId: others[i].id, error: entry.reason })
    }
  })

  if (failures.length) {
    logger.error('broadcastAction: partial failures', { type, failures })
  }

  return results
}
