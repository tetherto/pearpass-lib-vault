import { createSelector } from '@reduxjs/toolkit'

export const selectRecordById = (id) =>
  createSelector(
    (state) => state.vault,
    (state) => state.otp.codes[id],
    (vault, otpData) => {
      const record = vault.data?.records?.find((record) => record?.id === id)

      if (!record || !record.otpPublic || !otpData) {
        return { isLoading: vault.isRecordLoading, data: record }
      }

      return {
        isLoading: vault.isRecordLoading,
        data: {
          ...record,
          otpPublic: {
            ...record.otpPublic,
            currentCode: otpData.code,
            timeRemaining: otpData.timeRemaining
          }
        }
      }
    }
  )
