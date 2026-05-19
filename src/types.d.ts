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

export declare const ACTION_TYPES: {
  DELETE_VAULT: 'delete-vault'
  LEAVE_VAULT: 'leave-vault'
} & Record<string, string>

export declare const ACTIONS: Record<
  string,
  { execute: (_entry: unknown) => Promise<void> }
>

export interface BroadcastActionResult {
  results: Array<{ targetDeviceId: string; channel: 'outbox' }>
  failures: Array<{ targetDeviceId: string; error: Error }>
}

export declare function broadcastAction(_action: {
  type: string
  payload?: any
}): Promise<BroadcastActionResult>

export declare function broadcastDeleteVault(
  _vaultId: string
): Promise<BroadcastActionResult>

export declare function deleteVaultLocal(
  _vaultId: string
): Promise<Array<unknown>>

export declare function runActionScan(): Promise<void>

export declare function getMyDeviceId(): Promise<string | null>
