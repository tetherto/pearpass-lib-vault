import { configureStore } from '@reduxjs/toolkit'

import otpReducer, { updateOtpCodes } from './otpSlice'
import { resetState } from '../actions/resetState'

jest.mock('../actions/resetState', () => ({
  resetState: { fulfilled: { type: 'resetState/fulfilled' } }
}))

describe('otpSlice', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        otp: otpReducer
      }
    })
  })

  it('should handle initial state', () => {
    expect(store.getState().otp).toEqual({
      codes: {}
    })
  })

  describe('updateOtpCodes', () => {
    it('should store a single OTP code', () => {
      store.dispatch(
        updateOtpCodes([
          { recordId: 'rec-1', code: '123456', timeRemaining: 20 }
        ])
      )

      expect(store.getState().otp.codes).toEqual({
        'rec-1': { code: '123456', timeRemaining: 20 }
      })
    })

    it('should store multiple OTP codes', () => {
      store.dispatch(
        updateOtpCodes([
          { recordId: 'rec-1', code: '123456', timeRemaining: 20 },
          { recordId: 'rec-2', code: '654321', timeRemaining: 15 }
        ])
      )

      expect(store.getState().otp.codes).toEqual({
        'rec-1': { code: '123456', timeRemaining: 20 },
        'rec-2': { code: '654321', timeRemaining: 15 }
      })
    })

    it('should update existing codes', () => {
      store.dispatch(
        updateOtpCodes([
          { recordId: 'rec-1', code: '123456', timeRemaining: 20 }
        ])
      )
      store.dispatch(
        updateOtpCodes([
          { recordId: 'rec-1', code: '789012', timeRemaining: 30 }
        ])
      )

      expect(store.getState().otp.codes['rec-1']).toEqual({
        code: '789012',
        timeRemaining: 30
      })
    })

    it('should default timeRemaining to null when not provided', () => {
      store.dispatch(
        updateOtpCodes([{ recordId: 'rec-1', code: '111222' }])
      )

      expect(store.getState().otp.codes['rec-1']).toEqual({
        code: '111222',
        timeRemaining: null
      })
    })

    it('should not modify state for empty array', () => {
      store.dispatch(updateOtpCodes([]))

      expect(store.getState().otp.codes).toEqual({})
    })

    it('should not modify state for null payload', () => {
      store.dispatch(updateOtpCodes(null))

      expect(store.getState().otp.codes).toEqual({})
    })

    it('should not modify state for undefined payload', () => {
      store.dispatch(updateOtpCodes(undefined))

      expect(store.getState().otp.codes).toEqual({})
    })

    it('should preserve other records when updating one', () => {
      store.dispatch(
        updateOtpCodes([
          { recordId: 'rec-1', code: '111111', timeRemaining: 10 },
          { recordId: 'rec-2', code: '222222', timeRemaining: 20 }
        ])
      )
      store.dispatch(
        updateOtpCodes([
          { recordId: 'rec-1', code: '333333', timeRemaining: 30 }
        ])
      )

      expect(store.getState().otp.codes).toEqual({
        'rec-1': { code: '333333', timeRemaining: 30 },
        'rec-2': { code: '222222', timeRemaining: 20 }
      })
    })
  })

  describe('resetState', () => {
    it('should clear all codes on reset', () => {
      store.dispatch(
        updateOtpCodes([
          { recordId: 'rec-1', code: '123456', timeRemaining: 20 },
          { recordId: 'rec-2', code: '654321', timeRemaining: 15 }
        ])
      )

      expect(Object.keys(store.getState().otp.codes)).toHaveLength(2)

      store.dispatch({ type: resetState.fulfilled.type })

      expect(store.getState().otp).toEqual({
        codes: {}
      })
    })
  })
})
