import { pearpassVaultClient } from '../instances'

/**
 * @param {string} recordId
 * @param {string} otpInput - otpauth:// URI or raw Base32 secret
 * @returns {Promise<void>}
 */
export const addOtpToRecord = async (recordId, otpInput) => {
  if (!recordId) {
    throw new Error('Record ID is required')
  }

  if (!otpInput) {
    throw new Error('OTP input is required')
  }

  return pearpassVaultClient.addOtpToRecord(recordId, otpInput)
}
