import { pearpassVaultClient } from '../instances'

/**
 * @param {string} recordId
 * @returns {Promise<{ code: string, counter: number }>}
 */
export const generateHotpNext = async (recordId) => {
  if (!recordId) {
    throw new Error('Record ID is required')
  }

  return pearpassVaultClient.generateHotpNext(recordId)
}
