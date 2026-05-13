import { ACTIONS } from '../actions'
import { getMyDeviceId } from '../utils/getMyDeviceId'
import { pearpassVaultClient } from '../instances'
import { logger } from '../utils/logger'

/**
 * @returns {Promise<void>}
 */
export const processPendingActions = async () => {
  const myId = await getMyDeviceId()
  if (!myId) {
    throw new Error('processPendingActions: cannot resolve own device id')
  }

  // '/' (0x2F) is exactly one byte before '0' (0x30), so the range captures
  // all keys of the form `actions/queue/<myId>/...` without spilling into
  // keys for a different device whose id starts with the same prefix.
  const entries =
    (await pearpassVaultClient.activeVaultFind({
      gte: { key: `actions/queue/${myId}/` },
      lt: { key: `actions/queue/${myId}0` }
    })) ?? []

  for (const entry of entries) {
    const handler = ACTIONS[entry?.value?.type]
    if (!handler) continue

    try {
      await handler.execute(entry.value)
      await pearpassVaultClient.activeVaultRemove(entry.key)
    } catch (err) {
      logger.error('Failed to process pending action', { type: entry?.value?.type, err })
    }
  }
}
