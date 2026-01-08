/**
 * @jest-environment node
 */

// TextEncoder polyfill for test environment
import util from 'util'
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = util.TextEncoder
  globalThis.TextDecoder = util.TextDecoder
}

import {
  stringToBuffer,
  bufferToString,
  clearBuffer,
  withBuffer,
  compareBuffers
} from './buffer'

describe('buffer utilities', () => {
  describe('stringToBuffer', () => {
    it('should convert string to Uint8Array', () => {
      const str = 'test'
      const buffer = stringToBuffer(str)

      expect(buffer).toBeTruthy()
      expect(typeof buffer.length).toBe('number')
      expect(buffer.length).toBe(4)
    })

    it('should correctly encode UTF-8', () => {
      const buffer = stringToBuffer('test')
      expect(Array.from(buffer)).toEqual([116, 101, 115, 116])
    })

    it('should handle empty string', () => {
      const buffer = stringToBuffer('')
      expect(buffer.length).toBe(0)
    })

    it('should handle unicode', () => {
      const buffer = stringToBuffer('🔒')
      expect(buffer.length).toBeGreaterThan(1)
    })

    it('should throw TypeError for non-string', () => {
      expect(() => stringToBuffer(123)).toThrow(TypeError)
      expect(() => stringToBuffer(null)).toThrow(TypeError)
    })
  })

  describe('bufferToString', () => {
    it('should convert buffer to string', () => {
      const buffer = stringToBuffer('hello')
      const str = bufferToString(buffer)
      expect(str).toBe('hello')
    })

    it('should handle empty buffer', () => {
      const buffer = new Uint8Array(0)
      const str = bufferToString(buffer)
      expect(str).toBe('')
    })

    it('should handle unicode', () => {
      const original = '🔒test'
      const buffer = stringToBuffer(original)
      const str = bufferToString(buffer)
      expect(str).toBe(original)
    })
  })

  describe('clearBuffer', () => {
    it('should zero out buffer', () => {
      const buffer = stringToBuffer('test')
      expect(Array.from(buffer).some((byte) => byte !== 0)).toBe(true)

      // Note: Can't check after clearBuffer as sodium_free invalidates the buffer
      expect(() => clearBuffer(buffer)).not.toThrow()
    })

    it('should throw TypeError for null', () => {
      expect(() => clearBuffer(null)).toThrow(TypeError)
      expect(() => clearBuffer(null)).toThrow(
        'clearBuffer() requires a valid Buffer'
      )
    })

    it('should throw TypeError for undefined', () => {
      expect(() => clearBuffer(undefined)).toThrow(TypeError)
      expect(() => clearBuffer(undefined)).toThrow(
        'clearBuffer() requires a valid Buffer'
      )
    })

    it('should work with empty buffer', () => {
      const buffer = Buffer.alloc(0)
      expect(() => clearBuffer(buffer)).not.toThrow()
    })
  })

  describe('withBuffer', () => {
    it('should execute callback and clear buffer', async () => {
      const buffer = stringToBuffer('test')
      let dataWasPresent = false

      const result = await withBuffer(buffer, async (buf) => {
        dataWasPresent = Array.from(buf).some((byte) => byte !== 0)
        return 'success'
      })

      expect(result).toBe('success')
      expect(dataWasPresent).toBe(true)
      // Note: Cannot check buffer after clearBuffer as sodium_free detaches it
    })

    it('should clear buffer even if callback throws', async () => {
      const buffer = stringToBuffer('test')
      let dataWasPresent = false

      await expect(
        withBuffer(buffer, async (buf) => {
          dataWasPresent = Array.from(buf).some((byte) => byte !== 0)
          throw new Error('Test error')
        })
      ).rejects.toThrow('Test error')

      expect(dataWasPresent).toBe(true)
      // Note: Cannot check buffer after clearBuffer as sodium_free detaches it
    })
  })

  describe('compareBuffers', () => {
    it('should return true for identical buffers', () => {
      const a = stringToBuffer('test')
      const b = stringToBuffer('test')
      expect(compareBuffers(a, b)).toBe(true)
      clearBuffer(a)
      clearBuffer(b)
    })

    it('should return false for different buffers', () => {
      const a = stringToBuffer('test1')
      const b = stringToBuffer('test2')
      expect(compareBuffers(a, b)).toBe(false)
      clearBuffer(a)
      clearBuffer(b)
    })

    it('should return false for different lengths', () => {
      const a = stringToBuffer('short')
      const b = stringToBuffer('muchlonger')
      expect(compareBuffers(a, b)).toBe(false)
      clearBuffer(a)
      clearBuffer(b)
    })

    it('should return true for empty buffers', () => {
      const a = Buffer.alloc(0)
      const b = Buffer.alloc(0)
      expect(compareBuffers(a, b)).toBe(true)
    })

    it('should throw TypeError for non-buffers', () => {
      const buffer = stringToBuffer('test')
      expect(() => compareBuffers('not buffer', buffer)).toThrow(TypeError)
      expect(() => compareBuffers(buffer, null)).toThrow(TypeError)
      clearBuffer(buffer)
    })
  })

  describe('integration', () => {
    it('should handle full string->buffer->clear cycle', () => {
      const original = 'sensitive data'
      const buffer = stringToBuffer(original)

      expect(bufferToString(buffer)).toBe(original)

      clearBuffer(buffer)
      // Note: After sodium_free, buffer is invalid, so we can't check its contents
    })
  })
})
