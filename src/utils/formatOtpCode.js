/**
 * Formats an OTP code with a space in the middle for readability.
 * @param {string | null} code
 * @returns {string}
 */
export const formatOtpCode = (code) => {
  if (!code) return ''
  const mid = Math.ceil(code.length / 2)
  return code.slice(0, mid) + ' ' + code.slice(mid)
}
