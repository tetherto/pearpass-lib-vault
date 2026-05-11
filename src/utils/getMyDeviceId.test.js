import { getMyDeviceId } from './getMyDeviceId'
import { pearpassVaultClient, setCurrentDeviceName } from '../instances'

describe('getMyDeviceId', () => {
  beforeEach(() => {
    setCurrentDeviceName(null)
    pearpassVaultClient.activeVaultGetWriterKey.mockReset()
    pearpassVaultClient.activeVaultList.mockReset()
  })

  describe('primary path (writerKey match)', () => {
    it('returns the deviceId whose writerKey matches mine', async () => {
      pearpassVaultClient.activeVaultGetWriterKey.mockResolvedValue('w-bbb')
      pearpassVaultClient.activeVaultList.mockResolvedValue([
        { id: 'AAA', name: 'macos 15.0', writerKey: 'w-aaa' },
        { id: 'BBB', name: 'ios 18.0', writerKey: 'w-bbb' }
      ])
      expect(await getMyDeviceId()).toBe('BBB')
    })

    it('writerKey match wins even if a different name-only record matches the singleton', async () => {
      setCurrentDeviceName('ios 18.0')
      pearpassVaultClient.activeVaultGetWriterKey.mockResolvedValue('w-bbb')
      pearpassVaultClient.activeVaultList.mockResolvedValue([
        { id: 'OLD', name: 'ios 18.0' },
        { id: 'BBB', name: 'ios 18.0', writerKey: 'w-bbb' }
      ])
      expect(await getMyDeviceId()).toBe('BBB')
    })
  })

  describe('legacy fallback (name match via singleton)', () => {
    it('returns the legacy record id when writerKey does not match and singleton name does', async () => {
      setCurrentDeviceName('ios 18.0')
      pearpassVaultClient.activeVaultGetWriterKey.mockResolvedValue('w-bbb')
      pearpassVaultClient.activeVaultList.mockResolvedValue([
        { id: 'OLD', name: 'ios 18.0' }
      ])
      expect(await getMyDeviceId()).toBe('OLD')
    })

    it('only matches legacy records (no writerKey on record)', async () => {
      setCurrentDeviceName('ios 18.0')
      pearpassVaultClient.activeVaultGetWriterKey.mockResolvedValue('w-bbb')
      pearpassVaultClient.activeVaultList.mockResolvedValue([
        { id: 'OTHER', name: 'ios 18.0', writerKey: 'w-other' }
      ])
      expect(await getMyDeviceId()).toBeNull()
    })

    it('returns null when no singleton deviceName is set', async () => {
      pearpassVaultClient.activeVaultGetWriterKey.mockResolvedValue('w-bbb')
      pearpassVaultClient.activeVaultList.mockResolvedValue([
        { id: 'OLD', name: 'ios 18.0' }
      ])
      expect(await getMyDeviceId()).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('returns null when no writerKey is available', async () => {
      pearpassVaultClient.activeVaultGetWriterKey.mockResolvedValue(null)
      expect(await getMyDeviceId()).toBeNull()
    })

    it('handles a missing device list gracefully', async () => {
      pearpassVaultClient.activeVaultGetWriterKey.mockResolvedValue('w-bbb')
      pearpassVaultClient.activeVaultList.mockResolvedValue(null)
      expect(await getMyDeviceId()).toBeNull()
    })
  })
})
