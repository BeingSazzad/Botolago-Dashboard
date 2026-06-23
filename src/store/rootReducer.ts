import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '@/components/auth/authSlice'
import brandingReducer from '@/store/brandingSlice'
import uiReducer from '@/store/uiSlice'
import { api } from '@/services/api'

export const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  branding: brandingReducer,
  ui: uiReducer,
})

export type RootReducer = ReturnType<typeof rootReducer>
