import {
  setPearpassVaultClient,
  pearpassVaultClient,
  getCurrentDeviceName,
  setStoragePath
} from './index'

describe('instance management functions', () => {
  test('setPearpassVaultClient sets the client and device name', () => {
    const mockInstance = {
      setStoragePath: jest.fn()
    }

    setPearpassVaultClient(mockInstance, { currentDeviceName: 'ios 18.0' })

    expect(pearpassVaultClient).toBe(mockInstance)
    expect(getCurrentDeviceName()).toBe('ios 18.0')
  })

  test('setPearpassVaultClient defaults currentDeviceName to null when not provided', () => {
    const mockInstance = { setStoragePath: jest.fn() }

    setPearpassVaultClient(mockInstance)

    expect(getCurrentDeviceName()).toBeNull()
  })

  test('setStoragePath calls setStoragePath on the client instance', async () => {
    const mockInstance = {
      setStoragePath: jest.fn().mockResolvedValue(undefined)
    }
    setPearpassVaultClient(mockInstance)
    const testPath = '/test/path'

    await setStoragePath(testPath)

    expect(mockInstance.setStoragePath).toHaveBeenCalledWith(testPath)
    expect(mockInstance.setStoragePath).toHaveBeenCalledTimes(1)
  })

  test('setStoragePath throws if client is not initialized', async () => {
    setPearpassVaultClient(undefined)

    await expect(setStoragePath('/any/path')).rejects.toThrow()
  })
})
