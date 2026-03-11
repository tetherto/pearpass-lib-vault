import { EXPIRY_THRESHOLD_SECONDS, isExpiring } from './otpExpiry'

describe('otpExpiry', () => {
  describe('EXPIRY_THRESHOLD_SECONDS', () => {
    it('should be 5', () => {
      expect(EXPIRY_THRESHOLD_SECONDS).toBe(5)
    })
  })

  describe('isExpiring', () => {
    it('should return true when timeRemaining is less than threshold', () => {
      expect(isExpiring(3)).toBe(true)
    })

    it('should return true when timeRemaining equals threshold', () => {
      expect(isExpiring(5)).toBe(true)
    })

    it('should return false when timeRemaining is greater than threshold', () => {
      expect(isExpiring(6)).toBe(false)
      expect(isExpiring(30)).toBe(false)
    })

    it('should return false when timeRemaining is null', () => {
      expect(isExpiring(null)).toBe(false)
    })

    it('should return true when timeRemaining is 0', () => {
      expect(isExpiring(0)).toBe(true)
    })

    it('should return true when timeRemaining is 1', () => {
      expect(isExpiring(1)).toBe(true)
    })
  })
})
