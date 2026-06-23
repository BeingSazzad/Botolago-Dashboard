import { useState } from 'react'
import {
  Bell,
  Building2,
  Check,
  Gamepad2,
  Palette,
  Plug,
  ShieldCheck,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ImageUpload } from '@/components/shared/ImageUpload'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { useToast } from '@/hooks/useToast'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { resetBranding, setAppName, setLogo, setThemeKey } from '@/store/brandingSlice'
import { THEME_LIST, applyTheme, DEFAULT_THEME_KEY } from '@/lib/themes'

// ─── Option lists ─────────────────────────────────────────────────────────────

const TIMEZONE_OPTIONS = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Europe/London (GMT)', value: 'Europe/London' },
  { label: 'Europe/Paris (CET)', value: 'Europe/Paris' },
  { label: 'America/New_York (ET)', value: 'America/New_York' },
  { label: 'America/Los_Angeles (PT)', value: 'America/Los_Angeles' },
  { label: 'Asia/Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Asia/Kolkata (IST)', value: 'Asia/Kolkata' },
]

const DATA_PROVIDER_OPTIONS = [
  { label: 'Opta', value: 'opta' },
  { label: 'StatsBomb', value: 'statsbomb' },
  { label: 'Sportmonks', value: 'sportmonks' },
  { label: 'Football-Data.org', value: 'footballdata' },
]

const SYNC_FREQUENCY_OPTIONS = [
  { label: 'Live (real-time)', value: 'live' },
  { label: 'Every 5 minutes', value: '5min' },
  { label: 'Every 15 minutes', value: '15min' },
  { label: 'Hourly', value: 'hourly' },
]

const SESSION_TIMEOUT_OPTIONS = [
  { label: '15 minutes', value: '15' },
  { label: '30 minutes', value: '30' },
  { label: '60 minutes', value: '60' },
]

// ─── Section components ───────────────────────────────────────────────────────

function GeneralSection() {
  const toast = useToast()
  const [appName, setAppName] = useState('Botola Go')
  const [supportEmail, setSupportEmail] = useState('support@botolago.com')
  const [timezone, setTimezone] = useState('UTC')
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  const handleSave = () => {
    toast({ variant: 'success', title: 'Settings saved', description: 'General settings have been updated.' })
  }

  return (
    <Card>
      <CardHeader title="General" description="Basic platform identity and availability settings." />
      <CardContent className="space-y-5">
        <Input
          label="App name"
          name="app-name"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="Botola Go"
        />
        <Input
          label="Support email"
          name="support-email"
          type="email"
          value={supportEmail}
          onChange={(e) => setSupportEmail(e.target.value)}
          placeholder="support@example.com"
        />
        <Select
          label="Timezone"
          name="timezone"
          options={TIMEZONE_OPTIONS}
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        />
        <Switch
          id="maintenance-mode"
          checked={maintenanceMode}
          onChange={setMaintenanceMode}
          label="Maintenance mode"
          description="When enabled, only admins can access the platform. All users see a maintenance page."
        />
        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={handleSave}>Save changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function GameplaySection() {
  const toast = useToast()
  const [squadSize, setSquadSize] = useState('15')
  const [budgetCap, setBudgetCap] = useState('100')
  const [freeTransfers, setFreeTransfers] = useState('1')
  const [transferCost, setTransferCost] = useState('4')
  const [scoreNorm, setScoreNorm] = useState('30')

  const handleSave = () => {
    toast({ variant: 'success', title: 'Settings saved', description: 'Gameplay settings have been updated.' })
  }

  return (
    <Card>
      <CardHeader
        title="Gameplay & Scoring"
        description="Configure squad rules, transfers, and score normalisation."
      />
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Squad size"
            name="squad-size"
            type="number"
            min={1}
            value={squadSize}
            onChange={(e) => setSquadSize(e.target.value)}
          />
          <Input
            label="Budget cap (M DH)"
            name="budget-cap"
            type="number"
            min={1}
            value={budgetCap}
            onChange={(e) => setBudgetCap(e.target.value)}
          />
          <Input
            label="Free transfers per gameweek"
            name="free-transfers"
            type="number"
            min={0}
            value={freeTransfers}
            onChange={(e) => setFreeTransfers(e.target.value)}
          />
          <Input
            label="Transfer cost (points)"
            name="transfer-cost"
            type="number"
            min={0}
            value={transferCost}
            onChange={(e) => setTransferCost(e.target.value)}
          />
        </div>
        <Input
          label="Score normalisation (N)"
          name="score-norm"
          type="number"
          min={1}
          value={scoreNorm}
          onChange={(e) => setScoreNorm(e.target.value)}
          hint="Maps raw performance ratings to a 0–10 scale using N as the normalisation factor."
        />
        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={handleSave}>Save changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function NotificationsSection() {
  const toast = useToast()
  const [deadlineEmail, setDeadlineEmail] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState(true)
  const [newUserAlerts, setNewUserAlerts] = useState(false)
  const [transferAlerts, setTransferAlerts] = useState(false)
  const [scoreUpdates, setScoreUpdates] = useState(true)

  const handleSave = () => {
    toast({ variant: 'success', title: 'Settings saved', description: 'Notification preferences updated.' })
  }

  return (
    <Card>
      <CardHeader
        title="Notifications"
        description="Choose which system events trigger admin notifications."
      />
      <CardContent className="space-y-4">
        <Switch
          id="deadline-email"
          checked={deadlineEmail}
          onChange={setDeadlineEmail}
          label="Email on deadline"
          description="Send admins an email when a gameweek transfer deadline approaches."
        />
        <Switch
          id="weekly-summary"
          checked={weeklySummary}
          onChange={setWeeklySummary}
          label="Weekly summary"
          description="Receive a weekly digest of platform activity and key stats."
        />
        <Switch
          id="new-user-alerts"
          checked={newUserAlerts}
          onChange={setNewUserAlerts}
          label="New user alerts"
          description="Notify admins when a new user registers on the platform."
        />
        <Switch
          id="transfer-alerts"
          checked={transferAlerts}
          onChange={setTransferAlerts}
          label="High-volume transfer alerts"
          description="Alert when more than 1 000 transfers are processed in an hour."
        />
        <Switch
          id="score-updates"
          checked={scoreUpdates}
          onChange={setScoreUpdates}
          label="Score update notifications"
          description="Push notifications when live gameweek scores are updated."
        />
        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={handleSave}>Save changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function DataFeedSection() {
  const toast = useToast()
  const [provider, setProvider] = useState('opta')
  const [apiUrl, setApiUrl] = useState('https://api.opta.com/v3')
  const [apiKey, setApiKey] = useState('')
  const [syncFrequency, setSyncFrequency] = useState('15min')
  const [autoSync, setAutoSync] = useState(true)

  const handleSave = () => {
    toast({ variant: 'success', title: 'Settings saved', description: 'Data feed settings have been updated.' })
  }

  const handleTestConnection = () => {
    toast({ variant: 'success', title: 'Connection successful', description: 'The API responded with status 200 OK.' })
  }

  return (
    <Card>
      <CardHeader
        title="Data Feed"
        description="Configure the external sports data provider that supplies fixtures, results, and player statistics."
        action={<Badge variant="success" dot>Connected</Badge>}
      />
      <CardContent className="space-y-5">
        <Select
          label="Data provider"
          name="data-provider"
          options={DATA_PROVIDER_OPTIONS}
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        />
        <Input
          label="API base URL"
          name="api-base-url"
          type="url"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="https://api.provider.com/v3"
          hint="All fixture, result, and stats requests are sent to this endpoint."
        />
        <Input
          label="API key"
          name="api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="••••••••••••••••"
          hint="Stored encrypted at rest. Leave blank to keep the existing key."
        />
        <Select
          label="Sync frequency"
          name="sync-frequency"
          options={SYNC_FREQUENCY_OPTIONS}
          value={syncFrequency}
          onChange={(e) => setSyncFrequency(e.target.value)}
        />
        <Switch
          id="auto-sync"
          checked={autoSync}
          onChange={setAutoSync}
          label="Auto-sync fixtures & results"
          description="Automatically ingest updated fixtures and match results on the configured schedule."
        />
        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <span className="font-medium text-slate-700">Last sync:</span>
          <span>Today at 14:32 UTC</span>
          <Badge variant="neutral" className="ml-auto">247 records updated</Badge>
        </div>
        <div className="flex items-center justify-between pt-1">
          <Button variant="outline" size="sm" onClick={handleTestConnection}>
            Test connection
          </Button>
          <Button size="sm" onClick={handleSave}>Save changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function BrandingSection() {
  const toast = useToast()
  const dispatch = useAppDispatch()
  const branding = useAppSelector((s) => s.branding)

  const [localName, setLocalName] = useState(branding.appName)

  // ── Theme selection ──────────────────────────────────────────────────────────
  const handleThemeSelect = (key: string) => {
    applyTheme(key)
    dispatch(setThemeKey(key))
  }

  // ── Save / reset ─────────────────────────────────────────────────────────────
  const handleSave = () => {
    dispatch(setAppName(localName.trim() || branding.appName))
    toast({ variant: 'success', title: 'Branding saved', description: 'App name has been updated.' })
  }

  const handleReset = () => {
    dispatch(resetBranding())
    applyTheme(DEFAULT_THEME_KEY)
    setLocalName(branding.appName) // optimistic; slice resets to env.appName
    toast({ variant: 'info', title: 'Branding reset', description: 'All branding settings have been restored to defaults.' })
  }

  return (
    <Card>
      <CardHeader
        title="Branding"
        description="Customise the visual identity shown to users across the platform."
      />
      <CardContent className="space-y-6">

        {/* ── App name ── */}
        <Input
          label="App name"
          name="branding-app-name"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          placeholder="Botola Go"
          hint="Displayed in the sidebar header and browser tab title. Saved on 'Save changes'."
        />

        {/* ── Logo upload ── */}
        <ImageUpload
          variant="square"
          value={branding.logo}
          onChange={(v) => dispatch(setLogo(v))}
          label="App logo"
          hint="PNG/JPG/SVG, under 512 KB"
        />

        {/* ── Theme colour picker ── */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Theme colour</p>
          <div className="flex flex-wrap gap-3">
            {THEME_LIST.map((theme) => {
              const isActive = branding.themeKey === theme.key
              return (
                <button
                  key={theme.key}
                  type="button"
                  title={theme.label}
                  onClick={() => handleThemeSelect(theme.key)}
                  className={[
                    'flex flex-col items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                    isActive
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm ring-2 ring-primary-400 ring-offset-1'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <span className="relative flex h-6 w-6 items-center justify-center">
                    <span
                      className="h-6 w-6 rounded-full shadow-sm"
                      style={{ background: theme.swatch }}
                    />
                    {isActive && (
                      <Check className="absolute h-3.5 w-3.5 text-white drop-shadow" />
                    )}
                  </span>
                  {theme.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Live preview chip ── */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Live preview</p>
          <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
            <Button size="sm">Primary button</Button>
            <Badge variant="primary" dot>Active theme</Badge>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between pt-1">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset to defaults
          </Button>
          <Button size="sm" onClick={handleSave}>Save changes</Button>
        </div>

      </CardContent>
    </Card>
  )
}

function SecuritySection() {
  const toast = useToast()
  const [enforce2fa, setEnforce2fa] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [allowedDomains, setAllowedDomains] = useState('botolago.com')

  const handleSave = () => {
    toast({ variant: 'success', title: 'Settings saved', description: 'Security settings have been updated.' })
  }

  const handlePurgeCache = () => {
    toast({ variant: 'success', title: 'Cache purged', description: 'All cached data has been cleared successfully.' })
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Security"
          description="Manage authentication requirements and session policies for admin accounts."
        />
        <CardContent className="space-y-5">
          <Switch
            id="enforce-2fa"
            checked={enforce2fa}
            onChange={setEnforce2fa}
            label="Enforce 2FA for admins"
            description="Require all admin accounts to configure two-factor authentication before accessing the dashboard."
          />
          <Select
            label="Session timeout"
            name="session-timeout"
            options={SESSION_TIMEOUT_OPTIONS}
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
          />
          <Input
            label="Allowed login domains"
            name="allowed-domains"
            value={allowedDomains}
            onChange={(e) => setAllowedDomains(e.target.value)}
            placeholder="example.com, corp.example.com"
            hint="Comma-separated list of email domains permitted to register admin accounts. Leave blank to allow all."
          />
          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={handleSave}>Save changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-rose-200">
        <CardHeader
          title="Danger zone"
          description="Irreversible or disruptive actions. Proceed with caution."
        />
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-800">Purge application cache</p>
              <p className="mt-0.5 text-sm text-slate-500">
                Clears all server-side caches. Users may experience slower page loads for a short period.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-rose-300 text-rose-600 hover:bg-rose-50"
              onClick={handlePurgeCache}
            >
              Purge cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Nav config ───────────────────────────────────────────────────────────────

type SectionId = 'general' | 'gameplay' | 'notifications' | 'data-feed' | 'branding' | 'security'

interface NavItem {
  id: SectionId
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: 'general', label: 'General', icon: <Building2 className="h-4 w-4" /> },
  { id: 'gameplay', label: 'Gameplay & Scoring', icon: <Gamepad2 className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'data-feed', label: 'Data Feed', icon: <Plug className="h-4 w-4" /> },
  { id: 'branding', label: 'Branding', icon: <Palette className="h-4 w-4" /> },
  { id: 'security', label: 'Security', icon: <ShieldCheck className="h-4 w-4" /> },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('general')

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage platform configuration, integrations, and security."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* Left nav */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={[
                        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                      ].join(' ')}
                    >
                      <span className={isActive ? 'text-primary-600' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Right content */}
        <div>
          {activeSection === 'general' && <GeneralSection />}
          {activeSection === 'gameplay' && <GameplaySection />}
          {activeSection === 'notifications' && <NotificationsSection />}
          {activeSection === 'data-feed' && <DataFeedSection />}
          {activeSection === 'branding' && <BrandingSection />}
          {activeSection === 'security' && <SecuritySection />}
        </div>
      </div>
    </div>
  )
}
