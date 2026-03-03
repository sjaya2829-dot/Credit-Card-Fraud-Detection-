export enum Screen {
  LOGIN,
  HOME,
  OTP_INPUT,
  OPERATIONS,
  WITHDRAW,
  DEPOSIT,
  BALANCE,
  FINAL,
}

export type CardSlotStatus = 'idle' | 'success' | 'error' | 'active';