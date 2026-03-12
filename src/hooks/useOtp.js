import { useCallback, useState } from 'react'

import { useDispatch } from 'react-redux'

import { useOtpRefresh } from './useOtpCodes'
import { generateHotpNext } from '../api/generateHotpNext'
import { OTP_TYPE } from '../constants/otpType'
import { updateOtpCodes } from '../slices/otpSlice'

/**
 * Manages OTP state for a single record.
 * Reads code/timeRemaining reactively from otpPublic prop (fed by Redux).
 * HOTP: exposes a generateNext callback that increments the counter
 * and dispatches the new code to the store.
 *
 * @param {{ recordId: string, otpPublic: object }} params
 */
export const useOtp = ({ recordId, otpPublic }) => {
  const dispatch = useDispatch()
  const otpRefresh = useOtpRefresh()
  const [isLoading, setIsLoading] = useState(false)

  const generateNext = useCallback(async () => {
    if (otpPublic?.type !== OTP_TYPE.HOTP || !recordId) return
    setIsLoading(true)
    try {
      const result = await generateHotpNext(recordId)
      if (result) {
        dispatch(updateOtpCodes([{ recordId, code: result.code }]))
        if (otpRefresh) {
          otpRefresh()
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [recordId, otpPublic?.type, otpRefresh, dispatch])

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
    code: otpPublic.currentCode ?? null,
    timeRemaining: otpPublic.timeRemaining ?? null,
    type: otpPublic.type,
    period: otpPublic.period ?? null,
    generateNext: otpPublic.type === OTP_TYPE.HOTP ? generateNext : null,
    isLoading
  }
}
