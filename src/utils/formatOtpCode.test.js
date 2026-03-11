import { formatOtpCode } from './formatOtpCode'

describe('formatOtpCode', () => {
  it('should return empty string for null', () => {
    expect(formatOtpCode(null)).toBe('')
  })

  it('should return empty string for undefined', () => {
    expect(formatOtpCode(undefined)).toBe('')
  })

  it('should return empty string for empty string', () => {
    expect(formatOtpCode('')).toBe('')
  })

  it('should format 6-digit code with space in the middle', () => {
    expect(formatOtpCode('123456')).toBe('123 456')
  })

  it('should format 8-digit code with space in the middle', () => {
    expect(formatOtpCode('12345678')).toBe('1234 5678')
  })

  it('should format odd-length code with larger first half', () => {
    expect(formatOtpCode('1234567')).toBe('1234 567')
  })

  it('should handle single character code', () => {
    expect(formatOtpCode('1')).toBe('1 ')
  })
})
