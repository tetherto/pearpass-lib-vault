const BASE32_REGEX = /^[A-Z2-7]+=*$/
const MIN_BASE32_LENGTH = 16

/**
 * Strips whitespace and dashes commonly used to format secrets in 4-char
 * groups (e.g. `"JBSW Y3DP EHPK 3PXP"` or `"JBSW-Y3DP-EHPK-3PXP"`) and
 * uppercases the result. Base32 is case-insensitive but the spec uses
 * uppercase.
 * @param {string} secret
 * @returns {string}
 */
const normalizeSecret = (secret) =>
  secret.replace(/[\s-]/g, '').toUpperCase()

/**
 * @param {string} secret - Already normalized.
 * @returns {boolean}
 */
const isValidBase32 = (secret) => {
  if (!secret || secret.length < MIN_BASE32_LENGTH) return false
  return BASE32_REGEX.test(secret)
}

/**
 * Validates an OTP secret or `otpauth://` URI. Returns `null` when valid
 * (including for empty input, since the form layer is responsible for
 * required-ness). Returns a human-readable error message string otherwise.
 *
 * Mirrors the return shape of the built-in Validator methods (`.email()`,
 * `.website()`, etc.) so it can be passed directly to `Validator.refine`.
 *
 * @param {string | undefined | null} input
 * @returns {string | null}
 */
export const validateOtpInput = (input) => {
  if (!input || typeof input !== 'string') return null

  const trimmed = input.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('otpauth://')) {
    let url
    try {
      url = new URL(trimmed)
    } catch {
      return 'Invalid OTP URI'
    }

    const type = url.host.toLowerCase()
    if (type !== 'totp' && type !== 'hotp') {
      return 'Unsupported OTP type'
    }

    const secret = url.searchParams.get('secret')
    if (!secret) {
      return 'OTP URI is missing secret'
    }

    if (!isValidBase32(normalizeSecret(secret))) {
      return 'OTP URI has an invalid secret'
    }

    return null
  }

  if (!isValidBase32(normalizeSecret(trimmed))) {
    return 'Invalid secret key'
  }

  return null
}
