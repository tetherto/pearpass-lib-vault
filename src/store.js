import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

import blindMirrorsReducer from './slices/blindMirrorsSlice'
import inviteReducer from './slices/inviteSlice'
import otpReducer from './slices/otpSlice'
import userReducer from './slices/userSlice'
import vaultReducer from './slices/vaultSlice'
import vaultsReducer from './slices/vaultsSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    vaults: vaultsReducer,
    vault: vaultReducer,
    invite: inviteReducer,
    blindMirrors: blindMirrorsReducer,
    otp: otpReducer
  }
})

export const VaultProvider = (props) => Provider({ store, ...props })
