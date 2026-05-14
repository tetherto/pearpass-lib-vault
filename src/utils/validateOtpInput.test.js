import { validateOtpInput } from './validateOtpInput'

describe('validateOtpInput', () => {
  describe('empty / non-string', () => {
    it('returns null for empty string', () => {
      expect(validateOtpInput('')).toBeNull()
    })

    it('returns null for whitespace-only', () => {
      expect(validateOtpInput('   ')).toBeNull()
    })

    it('returns null for undefined or null', () => {
      expect(validateOtpInput(undefined)).toBeNull()
      expect(validateOtpInput(null)).toBeNull()
    })

    it('returns null for non-string input', () => {
      expect(validateOtpInput(12345)).toBeNull()
    })
  })

  describe('raw Base32 secrets', () => {
    it('accepts a valid 16-char Base32 secret', () => {
      expect(validateOtpInput('JBSWY3DPEHPK3PXP')).toBeNull()
    })

    it('accepts a valid 32-char Base32 secret', () => {
      expect(
        validateOtpInput('JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP')
      ).toBeNull()
    })

    it('accepts a Base32 secret with trailing padding', () => {
      expect(validateOtpInput('JBSWY3DPEHPK3PXP====')).toBeNull()
    })

    it('normalizes lowercase before validating', () => {
      expect(validateOtpInput('jbswy3dpehpk3pxp')).toBeNull()
    })

    it('normalizes spaces (4-char group format)', () => {
      expect(validateOtpInput('JBSW Y3DP EHPK 3PXP')).toBeNull()
    })

    it('normalizes dashes', () => {
      expect(validateOtpInput('JBSW-Y3DP-EHPK-3PXP')).toBeNull()
    })

    it('rejects secrets shorter than 16 chars', () => {
      expect(validateOtpInput('JBSWY3DP')).toBe('Invalid secret key')
    })

    it('rejects secrets containing characters outside the Base32 alphabet', () => {
      // 0, 1, 8, 9 are not valid Base32 chars
      expect(validateOtpInput('JBSWY3DPEHPK3PX0')).toBe('Invalid secret key')
      expect(validateOtpInput('JBSWY3DPEHPK3PX!')).toBe('Invalid secret key')
    })
  })

  describe('otpauth:// URIs', () => {
    it('accepts a valid totp URI', () => {
      expect(
        validateOtpInput(
          'otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example'
        )
      ).toBeNull()
    })

    it('accepts a valid hotp URI', () => {
      expect(
        validateOtpInput(
          'otpauth://hotp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&counter=0'
        )
      ).toBeNull()
    })

    it('rejects URIs with an unsupported type', () => {
      expect(
        validateOtpInput(
          'otpauth://yotp/Example?secret=JBSWY3DPEHPK3PXP'
        )
      ).toBe('Unsupported OTP type')
    })

    it('rejects URIs missing the secret param', () => {
      expect(
        validateOtpInput('otpauth://totp/Example?issuer=Example')
      ).toBe('OTP URI is missing secret')
    })

    it('rejects URIs whose secret is not valid Base32', () => {
      expect(
        validateOtpInput('otpauth://totp/Example?secret=not-a-base32-secret!!')
      ).toBe('OTP URI has an invalid secret')
    })

    it('rejects malformed URIs', () => {
      expect(validateOtpInput('otpauth://')).toBe('Unsupported OTP type')
    })

    it('is case-insensitive on the URI host', () => {
      expect(
        validateOtpInput('otpauth://TOTP/Example?secret=JBSWY3DPEHPK3PXP')
      ).toBeNull()
    })
  })
})
