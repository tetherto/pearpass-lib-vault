import { useState, useEffect } from 'react'

import { findOtpDuplicates } from '../api/findOtpDuplicates'

/**
 * @param {{ secret?: string | null, excludeRecordId?: string }} [params]
 * @returns {{ data: Array<{ id: string, title: string }>, isLoading: boolean }}
 */
export const useFindOtpDuplicates = (params) => {
  const secret = params?.secret
  const excludeRecordId = params?.excludeRecordId

  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!secret) {
      setData([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    findOtpDuplicates({ secret, excludeRecordId })
      .then((matches) => {
        if (cancelled) return
        setData(Array.isArray(matches) ? matches : [])
        setIsLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setData([])
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [secret, excludeRecordId])

  return { data, isLoading }
}
