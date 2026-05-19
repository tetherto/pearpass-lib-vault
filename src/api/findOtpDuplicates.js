import { pearpassVaultClient } from '../instances'

/**
 * @param {{ secret?: string, excludeRecordId?: string }} params
 * @returns {Promise<Array<{ id: string, title: string }>>}
 */
export const findOtpDuplicates = async (params) => {
  if (!params?.secret) return []
  return pearpassVaultClient.findOtpDuplicates(params)
}
