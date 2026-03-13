import { groupOtpRecords } from './groupOtpRecords'

describe('groupOtpRecords', () => {
  test('returns empty groups for empty input', () => {
    const result = groupOtpRecords([])
    expect(result).toEqual({ totpGroups: [], hotpRecords: [] })
  })

  test('groups TOTP records by period', () => {
    const records = [
      { id: '1', otpPublic: { type: 'TOTP', period: 30 } },
      { id: '2', otpPublic: { type: 'TOTP', period: 60 } },
      { id: '3', otpPublic: { type: 'TOTP', period: 30 } }
    ]

    const result = groupOtpRecords(records)

    expect(result.totpGroups).toHaveLength(2)
    expect(result.totpGroups[0].period).toBe(30)
    expect(result.totpGroups[0].records).toHaveLength(2)
    expect(result.totpGroups[1].period).toBe(60)
    expect(result.totpGroups[1].records).toHaveLength(1)
    expect(result.hotpRecords).toHaveLength(0)
  })

  test('separates HOTP records', () => {
    const records = [
      { id: '1', otpPublic: { type: 'TOTP', period: 30 } },
      { id: '2', otpPublic: { type: 'HOTP' } },
      { id: '3', otpPublic: { type: 'HOTP' } }
    ]

    const result = groupOtpRecords(records)

    expect(result.totpGroups).toHaveLength(1)
    expect(result.hotpRecords).toHaveLength(2)
  })

  test('defaults period to 30 when not specified', () => {
    const records = [
      { id: '1', otpPublic: { type: 'TOTP' } },
      { id: '2', otpPublic: { type: 'TOTP', period: 30 } }
    ]

    const result = groupOtpRecords(records)

    expect(result.totpGroups).toHaveLength(1)
    expect(result.totpGroups[0].period).toBe(30)
    expect(result.totpGroups[0].records).toHaveLength(2)
  })

  test('sorts TOTP groups by period ascending', () => {
    const records = [
      { id: '1', otpPublic: { type: 'TOTP', period: 60 } },
      { id: '2', otpPublic: { type: 'TOTP', period: 30 } },
      { id: '3', otpPublic: { type: 'TOTP', period: 90 } }
    ]

    const result = groupOtpRecords(records)

    expect(result.totpGroups.map((g) => g.period)).toEqual([30, 60, 90])
  })

  test('handles mixed TOTP and HOTP records', () => {
    const records = [
      { id: '1', otpPublic: { type: 'TOTP', period: 30 } },
      { id: '2', otpPublic: { type: 'HOTP' } },
      { id: '3', otpPublic: { type: 'TOTP', period: 60 } },
      { id: '4', otpPublic: { type: 'HOTP' } },
      { id: '5', otpPublic: { type: 'TOTP', period: 30 } }
    ]

    const result = groupOtpRecords(records)

    expect(result.totpGroups).toHaveLength(2)
    expect(result.totpGroups[0].records).toHaveLength(2)
    expect(result.totpGroups[1].records).toHaveLength(1)
    expect(result.hotpRecords).toHaveLength(2)
  })
})
