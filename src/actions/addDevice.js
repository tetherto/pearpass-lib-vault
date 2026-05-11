import { createAsyncThunk } from '@reduxjs/toolkit'

import { addDevice as addDeviceApi } from '../api/addDevice'
import { addDeviceFactory } from '../utils/addDeviceFactory'
import { logger } from '../utils/logger'
import {
  getCurrentDeviceName,
  pearpassVaultClient
} from '../instances'

export const addDevice = createAsyncThunk(
  'vault/addDevice',
  async (_, { getState }) => {
    const state = getState()
    const vaultState = state.vault
    const vaultId = vaultState.data.id
    const existingDevices = vaultState.data?.devices ?? []

    const deviceName = getCurrentDeviceName()

    const existingDevice = existingDevices.find(
      (device) => device.name === deviceName
    )

    if (existingDevice) {
      logger.log('Device already added to vault')
      return existingDevice
    }

    const writerKey = await pearpassVaultClient.activeVaultGetWriterKey()

    const newDevice = addDeviceFactory(deviceName, vaultId, writerKey)

    await addDeviceApi(newDevice)

    return newDevice
  }
)
