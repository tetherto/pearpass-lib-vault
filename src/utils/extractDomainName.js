/**
 * Extracts the bare domain label from a URL or hostname.
 * Strips protocol, leading `www.`, path, query, fragment, and port,
 * then returns the second-to-last label (so `github.com`,
 * `subdomain.github.io`, and `accounts.github.com` all collapse to `github`).
 *
 * @param {string | undefined} url
 * @returns {string | null}
 */
export const extractDomainName = (url) => {
  if (!url) return null

  let domainMatch = url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0]

  domainMatch = domainMatch.split(':')[0]

  const parts = domainMatch.split('.')
  if (parts.length < 2) return null
  return parts.length > 2 ? parts[parts.length - 2] : parts[0]
}
