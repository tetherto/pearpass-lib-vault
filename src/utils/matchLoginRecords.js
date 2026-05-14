import { extractDomainName } from './extractDomainName'

/**
 * @typedef {'issuer-domain' | 'label-username'} MatchReason
 */

/**
 * @typedef {Object} ParsedOtp
 * @property {string} [issuer]
 * @property {string} [label]
 */

/**
 * @typedef {Object} LoginRecord
 * @property {string} [id]
 * @property {{
 *   title?: string,
 *   username?: string,
 *   websites?: Array<string>
 * }} [data]
 */

/**
 * @typedef {Object} LoginMatch
 * @property {LoginRecord} record
 * @property {Array<MatchReason>} reasons
 */

const norm = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

const splitLabel = (label) => {
  const value = norm(label)
  if (!value) return { full: '', localPart: '' }
  const atIndex = value.indexOf('@')
  return {
    full: value,
    localPart: atIndex === -1 ? value : value.slice(0, atIndex)
  }
}

const hostnameOf = (url) => {
  if (typeof url !== 'string') return ''
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0]
    .split(':')[0]
}

const issuerMatchesAnyWebsite = (issuerToken, websites) => {
  if (!issuerToken) return false
  for (const website of websites) {
    const host = hostnameOf(website)
    if (host && host.includes(issuerToken)) return true
  }
  return false
}

const labelMatchesUsername = ({ full, localPart }, usernameNorm) => {
  if (!usernameNorm || !full) return false
  if (full === usernameNorm || localPart === usernameNorm) return true
  return usernameNorm.includes(full) || full.includes(usernameNorm)
}

/**
 * Returns login records that look like they correspond to the given parsed OTP,
 * ranked by how many independent signals matched.
 * @param {ParsedOtp | null | undefined} parsedOtp
 * @param {Array<LoginRecord>} loginRecords
 * @returns {Array<LoginMatch>} sorted desc by reason count, then by record id
 */
export const matchLoginRecords = (parsedOtp, loginRecords) => {
  if (!parsedOtp || !Array.isArray(loginRecords) || loginRecords.length === 0) {
    return []
  }

  const issuerNorm = norm(parsedOtp.issuer)
  const issuerToken = extractDomainName(parsedOtp.issuer) || issuerNorm
  const labelParts = splitLabel(parsedOtp.label)

  if (!issuerNorm && !labelParts.full) return []

  const matches = []

  for (const record of loginRecords) {
    const data = record?.data ?? {}
    const usernameNorm = norm(data.username)
    const websites = Array.isArray(data.websites) ? data.websites : []

    const reasons = []

    if (issuerMatchesAnyWebsite(issuerToken, websites)) {
      reasons.push('issuer-domain')
    }
    if (labelMatchesUsername(labelParts, usernameNorm)) {
      reasons.push('label-username')
    }

    if (reasons.length > 0) {
      matches.push({ record, reasons })
    }
  }

  matches.sort((a, b) => {
    if (b.reasons.length !== a.reasons.length) {
      return b.reasons.length - a.reasons.length
    }
    return String(a.record?.id ?? '').localeCompare(
      String(b.record?.id ?? '')
    )
  })

  return matches
}
