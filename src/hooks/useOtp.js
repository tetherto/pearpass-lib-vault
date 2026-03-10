import { useCallback, useEffect, useState } from 'react'

import { useOtpRefresh } from './useOtpCodes'
import { generateHotpNext } from '../api/generateHotpNext'
import { generateOtpCodesByIds } from '../api/generateOtpCodesByIds'
import { OTP_TYPE } from '../constants/otpType'
import { createAlignedInterval } from '../utils/createAlignedInterval'

/**
 * Manages OTP state for a single record.
 * TOTP: polls the worklet every second for fresh codes.
 * HOTP: exposes a generateNext callback that increments the counter.
 *
 * @param {{ recordId: string, otpPublic: object }} params
 */
export const useOtp = ({ recordId, otpPublic }) => {
  const [code, setCode] = useState(otpPublic?.currentCode ?? null)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const otpRefresh = useOtpRefresh()

  // TOTP: call worklet every second to get fresh code + timeRemaining
  useEffect(() => {
    if (otpPublic?.type !== OTP_TYPE.TOTP || !recordId) return

    const refresh = async () => {
      try {
        const results = await generateOtpCodesByIds([recordId])
        const result = results?.[0]

        if (result) {
          setCode(result.code)
          setTimeRemaining(result.timeRemaining)
        }
      } catch {
        // Will retry on next interval tick
      }
    }

    refresh()

    const cleanup = createAlignedInterval(() => {
      void refresh()
    })

    return cleanup
  }, [recordId, otpPublic?.type])

  // HOTP: generateNext callback
  const generateNext = useCallback(async () => {
    if (otpPublic?.type !== OTP_TYPE.HOTP || !recordId) return
    setIsLoading(true)
    try {
      const result = await generateHotpNext(recordId)
      if (result) {
        setCode(result.code)
        if (otpRefresh) {
          otpRefresh()
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [recordId, otpPublic?.type, otpRefresh])

  if (!otpPublic) {
    return {
      code: null,
      timeRemaining: null,
      type: null,
      period: null,
      generateNext: null,
      isLoading: false
    }
  }

  return {
    code,
    timeRemaining,
    type: otpPublic.type,
    period: otpPublic.period ?? null,
    generateNext: otpPublic.type === OTP_TYPE.HOTP ? generateNext : null,
    isLoading
  }
}
