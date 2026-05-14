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

export declare function groupOtpRecords(
  _records: Array<{ otpPublic?: OtpPublic }>
): OtpGroupResult

export declare const ACTION_TYPES: Record<string, string>

export declare const ACTIONS: Record<
  string,
  { execute: (entry: unknown) => Promise<void> }
>

export declare function queueAction(
  targetDeviceId: string,
  action: { type: string; actor: string; payload?: any }
): Promise<{ timestamp: string; actionId: string; key: string }>

export declare function broadcastAction(action: {
  type: string
  payload?: any
}): Promise<
  Array<{
    targetDeviceId: string
    timestamp: string
    actionId: string
    key: string
  }>
>

export declare function processPendingActions(): Promise<void>

export declare function runActionScan(): Promise<void>

export declare function getMyDeviceId(): Promise<string | null>
