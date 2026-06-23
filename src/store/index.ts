import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { api } from '@/services/api'
import { rootReducer } from './rootReducer'

// Ensure all endpoint modules are registered with the base api before the
// store is created (injectEndpoints has side effects).
import '@/services/endpoints/authApi'
import '@/services/endpoints/dashboardApi'
import '@/services/endpoints/playersApi'
import '@/services/endpoints/usersApi'
import '@/services/endpoints/fixturesApi'
import '@/services/endpoints/cmsApi'
import '@/services/endpoints/adminsApi'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault().concat(api.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
