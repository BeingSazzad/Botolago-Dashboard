import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { applyTheme } from '@/lib/themes'
import App from './App'
import '@/styles/index.css'

// Keep the live theme + document title in sync with branding state.
let lastTheme = ''
let lastTitle = ''
function syncBranding() {
  const { themeKey, appName } = store.getState().branding
  if (themeKey !== lastTheme) {
    applyTheme(themeKey)
    lastTheme = themeKey
  }
  const title = `${appName} — Admin`
  if (title !== lastTitle) {
    document.title = title
    lastTitle = title
  }
}
syncBranding()
store.subscribe(syncBranding)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
