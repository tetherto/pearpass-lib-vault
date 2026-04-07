import { createSelector } from '@reduxjs/toolkit'
import { matchPatternToValue } from '@tetherto/pear-apps-utils-pattern-search'

export const selectRecords = ({ filters, sort } = {}) =>
  createSelector(
    (state) => state.vault,
    (state) => state.otp.codes,
    (vault, otpCodes) => {
      const records =
        vault.data?.records?.filter((record) => {
          if (!record) {
            return false
          }
          if (
            (filters?.folder || filters?.folder === null) &&
            record.folder !== filters?.folder
          ) {
            return false
          }

          if (filters?.type && record.type !== filters.type) {
            return false
          }

          if (
            typeof filters?.isFavorite === 'boolean' &&
            !!record.isFavorite !== filters.isFavorite
          ) {
            return false
          }

          if (filters?.hasOtp && !record.otpPublic) {
            return false
          }

          if (!matchRecordToSearchPattern(filters?.searchPattern, record)) {
            return false
          }

          return filters?.isFolder === true || !!record.data
        }) ?? []

      const sortedRecords = [...records].sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) {
          return a.isFavorite ? -1 : 1
        }

        if (sort?.key === 'updatedAt') {
          return sort?.direction === 'asc'
            ? a.updatedAt - b.updatedAt
            : b.updatedAt - a.updatedAt
        }
        if (sort?.key === 'createdAt') {
          return sort?.direction === 'asc'
            ? a.createdAt - b.createdAt
            : b.createdAt - a.createdAt
        }
        if (sort?.key === 'data.title') {
          const titleA = a.data?.title ?? ''
          const titleB = b.data?.title ?? ''
          return sort?.direction === 'asc'
            ? titleA.localeCompare(titleB)
            : titleB.localeCompare(titleA)
        }

        return 0
      })

      return {
        isLoading: vault.isLoading,
        data: mergeOtpCodes(sortedRecords, otpCodes)
      }
    }
  )

/**
 * @param {string} searchPattern
 * @param {Object} record
 */
const matchRecordToSearchPattern = (searchPattern, record) => {
  if (!searchPattern?.length || !record?.data) {
    return true
  }

  const {
    title,
    username,
    email,
    note,
    name,
    fullName,
    websites = [],
    customFields = []
  } = record.data

  const valuesToSearch = [
    title,
    username,
    email,
    note,
    name,
    fullName,
    ...websites,
    ...customFields.map((field) => field.note)
  ]

  return valuesToSearch.some((value) =>
    matchPatternToValue(searchPattern, value)
  )
}

const mergeOtpCodes = (records, otpCodes) => {
  if (!otpCodes || !Object.keys(otpCodes).length) return records

  return records.map((record) => {
    const otpData = otpCodes[record.id]
    if (!record.otpPublic || !otpData) return record

    return {
      ...record,
      otpPublic: {
        ...record.otpPublic,
        currentCode: otpData.code,
        timeRemaining: otpData.timeRemaining
      }
    }
  })
}
