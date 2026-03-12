import { createSlice } from '@reduxjs/toolkit'

import { resetState } from '../actions/resetState'

const initialState = {
  codes: {}
}

export const otpSlice = createSlice({
  name: 'otp',
  initialState,
  reducers: {
    updateOtpCodes: (state, action) => {
      const results = action.payload
      if (!results?.length) return

      for (const { recordId, code, timeRemaining } of results) {
        state.codes[recordId] = {
          code,
          timeRemaining: timeRemaining ?? null
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(resetState.fulfilled, (state) => {
      state.codes = initialState.codes
    })
  }
})

export const { updateOtpCodes } = otpSlice.actions
export default otpSlice.reducer
