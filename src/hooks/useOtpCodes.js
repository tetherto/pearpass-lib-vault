import {
  createContext,
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
 * Provider that exposes a refresh trigger for OTP codes.
 * Wrap around any subtree that contains both useOtpCodes and useOtp consumers.
 */
export const OtpRefreshProvider = OtpRefreshContext.Provider

/**
 * Returns a function that triggers an immediate OTP codes refresh.
 * Call this after HOTP counter increments.
 * @returns {(() => void) | null}
 */
export const useOtpRefresh = () => useContext(OtpRefreshContext)

/**
 * Polls OTP codes for records that have otpPublic data.
 * Synced to wall-clock seconds. Exposes a refresh trigger via OtpRefreshProvider.
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

  useEffect(() => {
    if (!otpRecordCount) return

    refresh()
    const cleanup = createAlignedInterval(refresh)

    return cleanup
  }, [otpRecordCount, refresh])

  return { otpCodes, refresh }
}
