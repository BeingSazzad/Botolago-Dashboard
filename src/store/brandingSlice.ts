import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { env } from '@/config/env'
import { DEFAULT_THEME_KEY } from '@/lib/themes'

const STORAGE_KEY = 'botola_branding'

export interface BrandingState {
  /** App display name (overrides the build-time env default). */
  appName: string
  /** Uploaded logo as a data URL, or null to use the initials badge. */
  logo: string | null
  /** Active theme preset key (see lib/themes.ts). */
  themeKey: string
}

function loadInitial(): BrandingState {
  const fallback: BrandingState = {
    appName: env.appName,
    logo: null,
    themeKey: DEFAULT_THEME_KEY,
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...fallback, ...(JSON.parse(raw) as Partial<BrandingState>) }
  } catch {
    /* ignore corrupted storage */
  }
  return fallback
}

function persist(state: BrandingState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage may be full (large logo) — fail silently */
  }
}

const brandingSlice = createSlice({
  name: 'branding',
  initialState: loadInitial(),
  reducers: {
    setAppName: (state, action: PayloadAction<string>) => {
      state.appName = action.payload
      persist(state)
    },
    setLogo: (state, action: PayloadAction<string | null>) => {
      state.logo = action.payload
      persist(state)
    },
    setThemeKey: (state, action: PayloadAction<string>) => {
      state.themeKey = action.payload
      persist(state)
    },
    resetBranding: (state) => {
      state.appName = env.appName
      state.logo = null
      state.themeKey = DEFAULT_THEME_KEY
      persist(state)
    },
  },
})

export const { setAppName, setLogo, setThemeKey, resetBranding } = brandingSlice.actions
export default brandingSlice.reducer
