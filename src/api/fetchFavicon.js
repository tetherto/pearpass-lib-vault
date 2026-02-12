import { pearpassVaultClient } from '../instances'

/**
 * Fetches a favicon for the given URL
 * @param {string} url - The URL to fetch the favicon for
 * @returns {Promise<{url: string, favicon: string | null}>}
 */
export const fetchFavicon = async (url) => {
  if (!url) {
    throw new Error('URL is required')
  }

  if (!pearpassVaultClient) {
    throw new Error('Pearpass vault client is not initialized')
  }

  const result = await pearpassVaultClient.fetchFavicon(url)

  return result
}
