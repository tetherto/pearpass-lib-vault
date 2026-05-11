import { generateUniqueId } from '@tetherto/pear-apps-utils-generate-unique-id'

import { validateAndPrepareDevice } from './validateAndPrepareDevice'

/**
 * @param {string} payload - device name (e.g. `Platform.OS + ' ' + Platform.Version`)
 * @param {string} vaultId
 * @param {string} writerKey - the autobase writer key for this device on this vault
 * @returns {Object}
 */
export const addDeviceFactory = (payload, vaultId, writerKey) => {
  if (!payload || !vaultId || !writerKey) {
    throw new Error('Payload, vaultId and writerKey are required')
  }

  const device = {
    id: generateUniqueId(),
    vaultId: vaultId,
    name: payload,
    writerKey,
    createdAt: Date.now()
  }

  return validateAndPrepareDevice(device)
}
