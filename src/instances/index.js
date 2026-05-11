export let pearpassVaultClient

let _currentDeviceName = null

/**
 * @param {Autopass} instance
 */
export const setPearpassVaultClient = (instance) => {
  pearpassVaultClient = instance
}

/**
 * @param {string} name
 */
export const setCurrentDeviceName = (name) => {
  _currentDeviceName = name
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
