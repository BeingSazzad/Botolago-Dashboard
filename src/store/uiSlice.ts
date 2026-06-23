import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export interface Toast {
  id: string
  title: string
  description?: string
  variant: 'success' | 'error' | 'info'
}

interface UiState {
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  toasts: Toast[]
}

const initialState: UiState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  toasts: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setMobileSidebar: (state, action: PayloadAction<boolean>) => {
      state.mobileSidebarOpen = action.payload
    },
    pushToast: {
      reducer: (state, action: PayloadAction<Toast>) => {
        state.toasts.push(action.payload)
      },
      prepare: (toast: Omit<Toast, 'id'>) => ({ payload: { ...toast, id: nanoid() } }),
    },
    dismissToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const { toggleSidebar, setMobileSidebar, pushToast, dismissToast } = uiSlice.actions
export default uiSlice.reducer
