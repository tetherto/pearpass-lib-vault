import { generateUniqueId } from '@tetherto/pear-apps-utils-generate-unique-id'

import { addDevice } from './addDevice'
import { addDevice as addDeviceApi } from '../api/addDevice'
import { setPearpassVaultClient, pearpassVaultClient } from '../instances'
import { validateAndPrepareDevice } from '../utils/validateAndPrepareDevice'

jest.mock('../api/addDevice', () => ({
  addDevice: jest.fn()
}))

jest.mock('@tetherto/pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn()
}))

jest.mock('../utils/validateAndPrepareDevice', () => ({
  validateAndPrepareDevice: jest.fn((device) => device)
}))

describe('addDevice', () => {
  const mockVaultId = 'vault-123'
  const mockDeviceId = 'device-456'
  const mockDate = 1633000000000
  const mockDeviceName = 'ios 18.0'
  const mockWriterKey = 'wk-test'

  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()

    global.Date.now = jest.fn().mockReturnValue(mockDate)

    generateUniqueId.mockReturnValue(mockDeviceId)
    setPearpassVaultClient(pearpassVaultClient, { currentDeviceName: mockDeviceName })
    pearpassVaultClient.activeVaultGetWriterKey.mockResolvedValue(mockWriterKey)

    dispatch = jest.fn()
    getState = jest.fn().mockReturnValue({
      vault: {
        data: {
          id: mockVaultId
        }
      }
    })

    addDeviceApi.mockResolvedValue({})
    validateAndPrepareDevice.mockImplementation((device) => device)
  })

  it('should create a device with name from the singleton', async () => {
    const thunk = addDevice()
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual({
      id: mockDeviceId,
      vaultId: mockVaultId,
      name: mockDeviceName,
      writerKey: mockWriterKey,
      createdAt: mockDate
    })
  })

  it('should call addDeviceApi with correct parameters', async () => {
    const thunk = addDevice()
    await thunk(dispatch, getState)

    expect(addDeviceApi).toHaveBeenCalledWith({
      id: mockDeviceId,
      vaultId: mockVaultId,
      name: mockDeviceName,
      writerKey: mockWriterKey,
      createdAt: mockDate
    })
  })

  it('should throw an error if validation fails', async () => {
    validateAndPrepareDevice.mockImplementation(() => {
      throw new Error('Validation error')
    })

    const thunk = addDevice()
    const result = await thunk(dispatch, getState)

    await expect(result.type).toBe(addDevice.rejected.type)
    expect(addDeviceApi).not.toHaveBeenCalled()
  })

  it('should generate a unique ID for the device', async () => {
    const thunk = addDevice()
    await thunk(dispatch, getState)

    expect(generateUniqueId).toHaveBeenCalled()
  })

  it('should return existing device when one with the same name is already present', async () => {
    const existing = {
      id: 'existing-id',
      vaultId: mockVaultId,
      name: mockDeviceName,
      createdAt: 0
    }
    getState.mockReturnValueOnce({
      vault: {
        data: { id: mockVaultId, devices: [existing] }
      }
    })

    const thunk = addDevice()
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual(existing)
    expect(addDeviceApi).not.toHaveBeenCalled()
  })
})
