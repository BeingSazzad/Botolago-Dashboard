import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AdminUser, AuthState } from './types'

// Versioned key — bumping it invalidates any stale persisted session.
const STORAGE_KEY = 'botola_auth_v2'

function loadInitial(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AuthState
      return { ...parsed, isAuthenticated: Boolean(parsed.token) }
    }
  } catch {
    /* ignore corrupted storage */
  }
  return { user: null, token: null, isAuthenticated: false }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitial(),
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AdminUser; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    updateProfile: (state, action: PayloadAction<Partial<AdminUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})

export const { setCredentials, updateProfile, logout } = authSlice.actions
export default authSlice.reducer
