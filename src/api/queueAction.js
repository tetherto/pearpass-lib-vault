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
  if (!targetDeviceId || !type || !actor) {
    throw new Error('queueAction: targetDeviceId, type and actor are required')
  }

  const timestamp = String(Date.now()).padStart(13, '0')
  const actionId = generateUniqueId()
  const key = `actions/queue/${targetDeviceId}/${timestamp}_${actionId}`

  const body = {
    type,
    actor,
    createdAt: new Date().toISOString()
  }
  if (payload !== undefined) body.payload = payload

  await pearpassVaultClient.activeVaultAdd(key, body)

  return { timestamp, actionId, key }
}
