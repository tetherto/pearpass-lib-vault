import { useState, useEffect } from 'react'

import { fetchFavicon } from '../api/fetchFavicon'

/**
 * Hook to fetch and manage favicon state for a given URL
 * @param {{ url: string }} params - Parameters object containing the URL
 * @returns {{
 *   faviconSrc: string | null,
 *   isLoading: boolean,
 *   hasError: boolean
 * }}
 */
export const useFavicon = (params) => {
  const { url } = params
  const [faviconSrc, setFaviconSrc] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!url) {
      setFaviconSrc(null)
      setIsLoading(false)
      setHasError(false)
      return
    }

    setIsLoading(true)
    setHasError(false)

    const loadFavicon = async () => {
      try {
        const res = await fetchFavicon(url)

        if (res && res.favicon) {
          setFaviconSrc(res.favicon)
          setHasError(false)
        } else {
          setFaviconSrc(null)
          setHasError(true)
        }
        setIsLoading(false)
      } catch (err) {
        console.warn('Favicon fetch failed:', err)
        setFaviconSrc(null)
        setHasError(true)
        setIsLoading(false)
      }
    }

    loadFavicon()
  }, [url])

  return { faviconSrc, isLoading, hasError }
}
