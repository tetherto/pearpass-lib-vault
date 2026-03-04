import { pearpassVaultClient } from '../instances'

/**
 * @param {string} recordId
 * @returns {Promise<void>}
 */
export const removeOtpFromRecord = async (recordId) => {
  if (!recordId) {
    throw new Error('Record ID is required')
  }

  return pearpassVaultClient.removeOtpFromRecord(recordId)
}
