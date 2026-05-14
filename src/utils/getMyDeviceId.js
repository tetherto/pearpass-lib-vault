import { listDevices } from '../api/listDevices'
import { getCurrentDeviceName, pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<string | null>}
 */
export const getMyDeviceId = async () => {
  const writerKey = await pearpassVaultClient.activeVaultGetWriterKey()
  if (!writerKey) return null

  const devices = (await listDevices()) ?? []

  const byWriterKey = devices.find((device) => device?.writerKey === writerKey)
  if (byWriterKey) return byWriterKey.id ?? null

  const deviceName = getCurrentDeviceName()
  if (!deviceName) return null

  const byName = devices.find(
    (device) => device?.name === deviceName && !device?.writerKey
  )

  return byName?.id ?? null
}
