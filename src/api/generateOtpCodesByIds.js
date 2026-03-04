import { pearpassVaultClient } from '../instances'

/**
 * @param {string[]} recordIds
 * @returns {Promise<Array<{ recordId: string, code: string, timeRemaining?: number }>>}
 */
export const generateOtpCodesByIds = async (recordIds) => {
  if (!recordIds?.length) {
    throw new Error('Record IDs are required')
  }

  return pearpassVaultClient.generateOtpCodesByIds(recordIds)
}
