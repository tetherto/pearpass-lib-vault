import { createAsyncThunk } from '@reduxjs/toolkit'

import { addDevice as addDeviceApi } from '../api/addDevice'
import { getVaultById as getVaultByIdApi } from '../api/getVaultById'
import { registerPeer } from '../api/inbox'
import { listDevices } from '../api/listDevices'
import { listRecords } from '../api/listRecords'
import { pearpassVaultClient } from '../instances'
import { logger } from '../utils/logger'

export const getVaultById = createAsyncThunk(
  'vault/getVault',
  async ({ vaultId, params } = {}) => {
    if (!vaultId) {
      throw new Error('Vault ID is required')
    }

    const vault = await getVaultByIdApi(vaultId, params)

    if (!vault) {
      throw new Error('Vault not found ' + vaultId)
    }

    const records = (await listRecords(vault.id)) ?? []
    const devices = (await listDevices(vault.id)) ?? []

    const healedDevices = await healLocalDeviceEntry(devices)
    await Promise.all(healedDevices.map(registerPeer))

    return {
      ...vault,
      records: records ?? [],
      devices: healedDevices
    }
  }
)

const healLocalDeviceEntry = async (devices) => {
  try {
    const writerKey =
      (await pearpassVaultClient?.activeVaultGetWriterKey?.()) ?? null
    if (!writerKey) return devices
    const existing = devices.find((d) => d?.writerKey === writerKey)
    if (!existing) return devices
    const masterTopic =
      typeof pearpassVaultClient?.personalSwarmGetTopic === 'function'
        ? (await pearpassVaultClient.personalSwarmGetTopic()) || null
        : null
    if ((existing.masterTopic ?? null) === masterTopic) {
      return devices
    }
    const healed = { ...existing, createdAt: Date.now() }
    if (masterTopic) healed.masterTopic = masterTopic
    else delete healed.masterTopic
    await addDeviceApi(healed)
    return devices.map((d) => (d.id === healed.id ? healed : d))
  } catch (err) {
    logger.error('getVaultById: device heal failed', { err })
    return devices
  }
}
