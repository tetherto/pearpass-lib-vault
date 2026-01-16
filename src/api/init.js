import { pearpassVaultClient } from '../instances'
import { initWithCredentials } from './initWithCredentials'
import { initWithPassword } from './initWithPassword'

/**
 * Initialize vault with either credentials or password
 * @param {({
 *   ciphertext: string
 *   nonce: string
 *   hashedPassword: string
 *   password?: undefined
 * } | {
 *   password: Uint8Array
 *   ciphertext?: undefined
 *   nonce?: undefined
 *   hashedPassword?: undefined
 * })} params
 * @returns {Promise<boolean>}
 */
export const init = async (params) => {
  let result

  if (params?.ciphertext && params?.nonce && params?.hashedPassword) {
    result = await initWithCredentials({
      ciphertext: params.ciphertext,
      nonce: params.nonce,
      hashedPassword: params.hashedPassword
    })
  } else if (params?.password) {
    result = await initWithPassword({
      password: params.password
    })
  } else {
    throw new Error('Either password or credentials are required')
  }

  await pearpassVaultClient.resetFailedAttempts()
  return result
}
