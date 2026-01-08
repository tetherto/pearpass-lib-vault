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
  if (params?.ciphertext && params?.nonce && params?.hashedPassword) {
    return initWithCredentials({
      ciphertext: params.ciphertext,
      nonce: params.nonce,
      hashedPassword: params.hashedPassword
    })
  }

  if (params?.password) {
    return initWithPassword({
      password: params.password
    })
  }

  throw new Error('Either password or credentials are required')
}
