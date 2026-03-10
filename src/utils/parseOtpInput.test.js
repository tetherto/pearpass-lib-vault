import { parseOtpInput } from './parseOtpInput'

describe('parseOtpInput', () => {
  test('returns null for empty/invalid input', () => {
    expect(parseOtpInput(null)).toBeNull()
    expect(parseOtpInput(undefined)).toBeNull()
    expect(parseOtpInput('')).toBeNull()
    expect(parseOtpInput('   ')).toBeNull()
    expect(parseOtpInput(123)).toBeNull()
  })

  test('parses raw Base32 secret as TOTP with defaults', () => {
    const result = parseOtpInput('JBSWY3DPEHPK3PXP')

    expect(result).toEqual({
      secret: 'JBSWY3DPEHPK3PXP',
      type: 'TOTP',
      algorithm: 'SHA1',
      digits: 6,
      period: 30
    })
  })

  test('uppercases raw Base32 secret', () => {
    const result = parseOtpInput('jbswy3dpehpk3pxp')

    expect(result.secret).toBe('JBSWY3DPEHPK3PXP')
  })

  test('parses TOTP otpauth:// URI', () => {
    const uri =
      'otpauth://totp/GitHub:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub&algorithm=SHA256&digits=8&period=60'
    const result = parseOtpInput(uri)

    expect(result).toEqual({
      secret: 'JBSWY3DPEHPK3PXP',
      type: 'TOTP',
      algorithm: 'SHA256',
      digits: 8,
      period: 60,
      issuer: 'GitHub',
      label: 'user@example.com'
    })
  })

  test('parses HOTP otpauth:// URI', () => {
    const uri = 'otpauth://hotp/Service:user?secret=JBSWY3DPEHPK3PXP&counter=5'
    const result = parseOtpInput(uri)

    expect(result.secret).toBe('JBSWY3DPEHPK3PXP')
    expect(result.type).toBe('HOTP')
    expect(result.algorithm).toBe('SHA1')
    expect(result.digits).toBe(6)
    expect(result.counter).toBe(5)
    expect(result.label).toBe('user')
  })

  test('defaults TOTP URI missing optional params', () => {
    const uri = 'otpauth://totp/MyApp?secret=ABC123'
    const result = parseOtpInput(uri)

    expect(result.algorithm).toBe('SHA1')
    expect(result.digits).toBe(6)
    expect(result.period).toBe(30)
  })

  test('returns null for invalid otpauth:// URI type', () => {
    const uri = 'otpauth://invalid/Test?secret=ABC'
    expect(parseOtpInput(uri)).toBeNull()
  })

  test('returns null for otpauth:// URI without secret', () => {
    const uri = 'otpauth://totp/Test'
    expect(parseOtpInput(uri)).toBeNull()
  })

  test('strips issuer prefix from label', () => {
    const uri =
      'otpauth://totp/GitHub:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub'
    const result = parseOtpInput(uri)

    expect(result.label).toBe('user@example.com')
  })

  test('keeps label as-is when no issuer prefix', () => {
    const uri = 'otpauth://totp/user@example.com?secret=JBSWY3DPEHPK3PXP'
    const result = parseOtpInput(uri)

    expect(result.label).toBe('user@example.com')
  })

  test('trims whitespace from input', () => {
    const result = parseOtpInput('  JBSWY3DPEHPK3PXP  ')

    expect(result.secret).toBe('JBSWY3DPEHPK3PXP')
  })
})
