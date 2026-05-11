import { ACTIONS } from '../actions'
import { getMyDeviceId } from '../utils/getMyDeviceId'
import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<void>}
 */
export const processPendingActions = async () => {
  const myId = await getMyDeviceId()
  if (!myId) {
    throw new Error('No device id resolved for processing pending actions')
  }

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
    } catch {
      throw new Error('Failed to process pending action')
    }
  }
}
