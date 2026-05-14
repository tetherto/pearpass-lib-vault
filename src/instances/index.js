export let pearpassVaultClient

let _currentDeviceName = null

/**
 * @param {object} instance
 * @param {{ currentDeviceName: string }} options
 */
export const setPearpassVaultClient = (instance, { currentDeviceName } = {}) => {
  pearpassVaultClient = instance
  _currentDeviceName = currentDeviceName ?? null
}

/**
 * @returns {string | null}
 */
export const getCurrentDeviceName = () => _currentDeviceName

/**
 * @param {string} path
 */
export const setStoragePath = async (path) => {
  await pearpassVaultClient.setStoragePath(path)
}
