import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import { generateOtpCodesByIds } from '../api/generateOtpCodesByIds'
import { createAlignedInterval } from '../utils/createAlignedInterval'

const OtpRefreshContext = createContext(null)

/**
 * Provider that holds a shared ref for OTP refresh callbacks.
 * Meant to be placed above both the list view (useOtpCodes) and detail view (useOtp).
 */
export const OtpRefreshProvider = ({ children }) => {
  const refreshRef = useRef(null)
  return createElement(
    OtpRefreshContext.Provider,
    { value: refreshRef },
    children
  )
}

/**
 * Returns a function that triggers an immediate OTP codes refresh.
 * Call this after HOTP counter increments.
 * @returns {(() => void) | null}
 */
export const useOtpRefresh = () => {
  const ref = useContext(OtpRefreshContext)
  return ref ? () => ref.current?.() : null
}

/**
 * Polls OTP codes for records that have otpPublic data.
 * Synced to wall-clock seconds. Auto-registers refresh via OtpRefreshContext.
 *
 * @param {Array} records
 * @returns {Object} Map of recordId → { code, timeRemaining, recordId }
 */
export const useOtpCodes = (records) => {
  const [otpCodes, setOtpCodes] = useState({})
  const recordsRef = useRef(records)
  recordsRef.current = records

  const otpRecordCount = records?.filter((r) => r.otpPublic).length ?? 0

  const refresh = useCallback(async () => {
    const current = recordsRef.current
    if (!current?.length) return

    const ids = current.filter((r) => r.otpPublic).map((r) => r.id)
    if (!ids.length) return

    try {
      const results = await generateOtpCodesByIds(ids)
      const codesMap = {}
      for (const result of results) {
        codesMap[result.recordId] = result
      }
      setOtpCodes(codesMap)
    } catch {
      // Will retry on next tick
    }
  }, [])

  const refreshRef = useContext(OtpRefreshContext)
  useEffect(() => {
    if (refreshRef) refreshRef.current = refresh
    return () => {
      if (refreshRef) refreshRef.current = null
    }
  }, [refreshRef, refresh])

  useEffect(() => {
    if (!otpRecordCount) return

    refresh()
    const cleanup = createAlignedInterval(refresh)

    return cleanup
  }, [otpRecordCount, refresh])

  return { otpCodes }
}
