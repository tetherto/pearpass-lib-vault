import { listDevices } from './listDevices'
import { queueAction } from './queueAction'
import { getMyDeviceId } from '../utils/getMyDeviceId'
import { ACTION_TYPES } from '../actions'

/**
 * @param {{
 *   type: string,
 *   payload?: any
 * }} action
 * @returns {Promise<Array<{
 *   targetDeviceId: string,
 *   timestamp: string,
 *   actionId: string,
 *   key: string
 * }>>}
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

  const results = []
  for (const target of others) {
    const result = await queueAction(target.id, {
      type,
      payload,
      actor: myDeviceId
    })
    results.push({ targetDeviceId: target.id, ...result })
  }

  return results
}
