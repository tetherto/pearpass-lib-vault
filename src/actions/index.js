import { pearpassVaultClient } from '../instances'
import { ACTION_TYPES } from './types'

export { ACTION_TYPES }

/**
 * Built-in receive-side handlers. Each handler runs from processInbox
 * when a matching envelope is delivered via the personal swarm.
 *
 * delete-vault: another paired device removed our access. Emit
 * 'vault-access-revoked' so the app layer can run the local data wipe
 * via its existing useVault.deleteVaultLocal flow.
 */
export const ACTIONS = {
  [ACTION_TYPES.DELETE_VAULT]: {
    execute: async (action) => {
      const vaultId = action?.payload?.vaultId
      if (!vaultId) {
        throw new Error('delete-vault action: payload.vaultId is required')
      }
      if (pearpassVaultClient.listenerCount?.('vault-access-revoked') === 0) {
        throw new Error('delete-vault action: no vault-access-revoked listener')
      }
      pearpassVaultClient.emit('vault-access-revoked', {
        vaultId,
        actor: action?.actor
      })
    }
  }
}
