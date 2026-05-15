import { ACTION_TYPES } from '../actions'
import { broadcastAction } from './broadcastAction'

/**
 * @param {string} vaultId
 */
export const broadcastDeleteVault = (vaultId) => {
  if (!vaultId) {
    throw new Error('broadcastDeleteVault: vaultId is required')
  }
  return broadcastAction({
    type: ACTION_TYPES.DELETE_VAULT,
    payload: { vaultId }
  })
}
