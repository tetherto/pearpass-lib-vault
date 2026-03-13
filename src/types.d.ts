export interface OtpPublic {
  type: 'TOTP' | 'HOTP'
  digits: number
  period?: number
  issuer?: string
  label?: string
  currentCode: string | null
  timeRemaining?: number | null
}

export interface OtpGroupResult {
  totpGroups: Array<{ period: number; records: Array<unknown> }>
  hotpRecords: Array<unknown>
}

export declare function groupOtpRecords(records: Array<{ otpPublic?: OtpPublic }>): OtpGroupResult
