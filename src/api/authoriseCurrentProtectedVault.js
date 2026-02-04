import { constantTimeHashCompare } from 'pearpass-utils-password-check'

import { pearpassVaultClient } from '../instances'
import { getCurrentProtectedVaultEncryption } from './getCurrentProtectedVaultEncryption'
import { getCurrentVault } from './getCurrentVault'

/**
 * @param {string} password
 * @returns {Promise<void>}
 */
export const authoriseCurrentProtectedVault = async (password) => {
  const currentVault = await getCurrentVault()

  const { hashedPassword, salt } = await getCurrentProtectedVaultEncryption(
    currentVault.id
  )

  const currentHashedPassword = await pearpassVaultClient.getDecryptionKey({
    salt: salt,
    password: password
  })

  if (!constantTimeHashCompare(hashedPassword, currentHashedPassword)) {
    throw new Error('Invalid password')
  }

  return true
}
