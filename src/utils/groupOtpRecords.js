import { OTP_TYPE } from '../constants/otpType'

/**
 * Groups OTP-enabled records by type and period.
 * TOTP records are grouped by their period (e.g. 30s, 60s), sorted ascending.
 * HOTP records are collected into a separate flat array.
 *
 * @param {Array<{ otpPublic?: { type: string, period?: number } }>} records
 * @returns {{ totpGroups: Array<{ period: number, records: Array }>, hotpRecords: Array }}
 */
export const groupOtpRecords = (records) => {
  const groupMap = {}
  const hotp = []

  for (const record of records) {
    if (record.otpPublic?.type === OTP_TYPE.HOTP) {
      hotp.push(record)
    } else {
      const period = record.otpPublic?.period ?? 30
      if (!groupMap[period]) {
        groupMap[period] = []
      }
      groupMap[period].push(record)
    }
  }

  const groups = Object.entries(groupMap)
    .map(([period, groupRecords]) => ({
      period: Number(period),
      records: groupRecords
    }))
    .sort((a, b) => a.period - b.period)

  return { totpGroups: groups, hotpRecords: hotp }
}
