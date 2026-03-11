import { OTP_TYPE } from '../constants/otpType'

/**
 * Parses an otpauth:// URI into a structured OTP config object.
 * @param {string} uri
 * @returns {object|null}
 */
const parseOtpauthUri = (uri) => {
  try {
    const url = new URL(uri)
    const type = url.host.toUpperCase()
    if (type !== OTP_TYPE.TOTP && type !== OTP_TYPE.HOTP) return null

    const secret = url.searchParams.get('secret')
    if (!secret) return null

    const config = {
      secret: secret.toUpperCase(),
      type,
      algorithm: (url.searchParams.get('algorithm') || 'SHA1').toUpperCase(),
      digits: parseInt(url.searchParams.get('digits') || '6', 10)
    }

    if (type === OTP_TYPE.TOTP) {
      config.period = parseInt(url.searchParams.get('period') || '30', 10)
    } else {
      config.counter = parseInt(url.searchParams.get('counter') || '0', 10)
    }

    const issuer = url.searchParams.get('issuer')
    if (issuer) config.issuer = issuer

    const rawLabel = decodeURIComponent(url.pathname.slice(1))
    if (rawLabel) {
      // Strip issuer prefix (e.g. 'GitHub:user@example.com' -> 'user@example.com')
      // to match otpauth library behavior used in vault-core
      const colonIndex = rawLabel.indexOf(':')
      config.label =
        colonIndex !== -1 ? rawLabel.slice(colonIndex + 1) : rawLabel
    }

    return config
  } catch {
    return null
  }
}

/**
 * Parses OTP input: otpauth:// URI or raw Base32 secret.
 * Returns null if input is empty or unparseable.
 * @param {string} input
 * @returns {object|null}
 */
export const parseOtpInput = (input) => {
  if (!input || typeof input !== 'string') return null

  const trimmed = input.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('otpauth://')) {
    return parseOtpauthUri(trimmed)
  }

  return {
    secret: trimmed.toUpperCase(),
    type: OTP_TYPE.TOTP,
    algorithm: 'SHA1',
    digits: 6,
    period: 30
  }
}
