import {
  setPearpassVaultClient,
  pearpassVaultClient,
  getCurrentDeviceName,
  setStoragePath
} from './index'

const mockRunActionScan = jest.fn().mockResolvedValue(undefined)
jest.mock('../api/actionRunner.js', () => ({
  runActionScan: (...args) => mockRunActionScan(...args)
}))

describe('instance management functions', () => {
  beforeEach(() => {
    mockRunActionScan.mockClear()
  })

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

  test('subscribes to master-update and kicks runActionScan when fired', async () => {
    const listeners = new Map()
    const mockInstance = {
      setStoragePath: jest.fn(),
      on: jest.fn((event, handler) => {
        listeners.set(event, handler)
      }),
      off: jest.fn()
    }

    setPearpassVaultClient(mockInstance)

    expect(mockInstance.on).toHaveBeenCalledWith(
      'master-update',
      expect.any(Function)
    )

    await listeners.get('master-update')?.()

    expect(mockRunActionScan).toHaveBeenCalledTimes(1)
  })

  test('detaches the master-update listener when the client is replaced', () => {
    const firstInstance = {
      setStoragePath: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    }
    const secondInstance = {
      setStoragePath: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    }

    setPearpassVaultClient(firstInstance)
    const firstHandler = firstInstance.on.mock.calls.find(
      ([event]) => event === 'master-update'
    )?.[1]

    setPearpassVaultClient(secondInstance)

    expect(firstInstance.off).toHaveBeenCalledWith(
      'master-update',
      firstHandler
    )
    expect(secondInstance.on).toHaveBeenCalledWith(
      'master-update',
      expect.any(Function)
    )
  })
})
