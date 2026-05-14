import { generateUniqueId } from '@tetherto/pear-apps-utils-generate-unique-id'

import { pearpassVaultClient } from '../instances'

/**
 * @param {string} targetDeviceId
 * @param {{
 *   type: string,
 *   actor: string,
 *   payload?: any
 * }} action
 * @returns {Promise<{ timestamp: string, actionId: string, key: string }>}
 */
export const queueAction = async (
  targetDeviceId,
  { type, actor, payload } = {}
) => {
  if (!targetDeviceId) {
    throw new Error('queueAction: targetDeviceId is required')
  }
  if (!type) {
    throw new Error('queueAction: type is required')
  }
  if (!actor) {
    throw new Error('queueAction: actor is required')
  }

  const now = Date.now()
  const timestamp = String(now)
  const actionId = generateUniqueId()
  const key = `actions/queue/${targetDeviceId}/${timestamp}_${actionId}`

  const body = {
    type,
    actor,
    createdAt: new Date(now).toISOString()
  }
  if (payload !== undefined) body.payload = payload

  await pearpassVaultClient.activeVaultAdd(key, body)

  return { timestamp, actionId, key }
}
