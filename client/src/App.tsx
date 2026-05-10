import React, { useEffect, ReactNode } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore.ts'
import { useSettingsStore } from './store/settingsStore.ts'
import { useAddonStore } from './store/addonStore.ts'
import { usePermissionsStore, PermissionLevel } from './store/permissionsStore.ts'
import { useInAppNotificationListener } from './hooks/useInAppNotificationListener.ts'
import { registerSyncTriggers, unregisterSyncTriggers } from './sync/syncTriggers.ts'
import { TranslationProvider, useTranslation } from './i18n/index.ts'
import { authApi } from './api/client.ts'

// Layout
import BottomNav from './components/Layout/BottomNav.tsx'
import OfflineBanner from './components/Layout/OfflineBanner.tsx'
import { ToastContainer } from './components/shared/Toast.tsx'
import { SystemNoticeHost } from './components/SystemNotices/SystemNoticeHost.js'

// Pages — Auth
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx'
import ResetPasswordPage from './pages/ResetPasswordPage.tsx'

// Pages — Core (protected)
import DashboardPage from './pages/DashboardPage.tsx'
import TripPlannerPage from './pages/TripPlannerPage.tsx'
import FilesPage from './pages/FilesPage.tsx'
import SettingsPage from './pages/SettingsPage.tsx'
import AdminPage from './pages/AdminPage.tsx'
import CommunityPage from './pages/CommunityPage.tsx'
import TripNotesPage from './pages/TripNotesPage.tsx'
import InvoicePage from './pages/InvoicePage.tsx'
import InAppNotificationsPage from './pages/InAppNotificationsPage.tsx'

// Pages — Public / Special
import SharedTripPage from './pages/SharedTripPage.tsx'
import OAuthAuthorizePage from './pages/OAuthAuthorizePage.tsx'

// Side-effect imports
import './pages/Trips/noticeActions.js'

// ── ProtectedRoute ────────────────────────────────────────────────────────────
interface ProtectedRouteProps {
  children: ReactNode
  adminRequired?: boolean
  addonId?: string
}

function ProtectedRoute({ children, adminRequired = false, addonId }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const appRequireMfa = useAuthStore((s) => s.appRequireMfa)
  const addonStore = useAddonStore()
  const { t } = useTranslation()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    const redirectParam = encodeURIComponent(location.pathname + location.search + location.hash)
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />
  }

  if (appRequireMfa && user && !user.mfa_enabled && location.pathname !== '/settings') {
    return <Navigate to="/settings?mfa=required" replace />
  }

  if (adminRequired && user && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  if (addonId && addonStore.loaded && !addonStore.isEnabled(addonId)) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex flex-col h-screen md:block md:h-auto">
      <div className="flex-1 overflow-y-auto md:overflow-visible">{children}</div>
      <BottomNav />
    </div>
  )
}

// ── RootRedirect ──────────────────────────────────────────────────────────────
function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const {
    loadUser, isAuthenticated, demoMode, setDemoMode, setDevMode,
    setIsPrerelease, setAppVersion, setHasMapsKey, setServerTimezone,
    setAppRequireMfa, setTripRemindersEnabled, setPlacesPhotosEnabled,
    setPlacesAutocompleteEnabled, setPlacesDetailsEnabled,
  } = useAuthStore()
  const { loadSettings } = useSettingsStore()
  const { loadAddons } = useAddonStore()

  useEffect(() => {
    if (
      !location.pathname.startsWith('/shared/') &&
      !location.pathname.startsWith('/public/') &&
      !location.pathname.startsWith('/login')
    ) {
      const alreadyAuthenticated = useAuthStore.getState().isAuthenticated
      if (alreadyAuthenticated) {
        useAuthStore.setState({ isLoading: false })
        loadUser({ silent: true })
      } else {
        loadUser()
      }
    }

    authApi.getAppConfig().then(async (config: {
      demo_mode?: boolean; dev_mode?: boolean; is_prerelease?: boolean;
      has_maps_key?: boolean; version?: string; timezone?: string;
      require_mfa?: boolean; trip_reminders_enabled?: boolean;
      places_photos_enabled?: boolean; places_autocomplete_enabled?: boolean;
      places_details_enabled?: boolean; permissions?: Record<string, PermissionLevel>
    }) => {
      if (config?.demo_mode) setDemoMode(true)
      if (config?.dev_mode) setDevMode(true)
      if (config?.is_prerelease !== undefined) setIsPrerelease(config.is_prerelease)
      if (config?.version) setAppVersion(config.version)
      if (config?.has_maps_key !== undefined) setHasMapsKey(config.has_maps_key)
      if (config?.timezone) setServerTimezone(config.timezone)
      if (config?.require_mfa !== undefined) setAppRequireMfa(!!config.require_mfa)
      if (config?.trip_reminders_enabled !== undefined) setTripRemindersEnabled(config.trip_reminders_enabled)
      if (config?.places_photos_enabled !== undefined) setPlacesPhotosEnabled(config.places_photos_enabled)
      if (config?.places_autocomplete_enabled !== undefined) setPlacesAutocompleteEnabled(config.places_autocomplete_enabled)
      if (config?.places_details_enabled !== undefined) setPlacesDetailsEnabled(config.places_details_enabled)
      if (config?.permissions) usePermissionsStore.getState().setPermissions(config.permissions)

      if (config?.version) {
        const storedVersion = localStorage.getItem('traveloop_app_version')
        if (storedVersion && storedVersion !== config.version) {
          try {
            if ('caches' in window) {
              const names = await caches.keys()
              await Promise.all(names.map(n => caches.delete(n)))
            }
            if ('serviceWorker' in navigator) {
              const regs = await navigator.serviceWorker.getRegistrations()
              await Promise.all(regs.map(r => r.unregister()))
            }
          } catch {}
          localStorage.setItem('traveloop_app_version', config.version)
          window.location.reload()
          return
        }
        localStorage.setItem('traveloop_app_version', config.version)
      }
    }).catch(() => {})
  }, [])

  const { settings } = useSettingsStore()
  useInAppNotificationListener()

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings()
      loadAddons()
    }
  }, [isAuthenticated])

  useEffect(() => {
    registerSyncTriggers()
    return () => unregisterSyncTriggers()
  }, [])

  const location = useLocation()
  const isSharedPage = location.pathname.startsWith('/shared/')

  useEffect(() => {
    if (isSharedPage) {
      document.documentElement.classList.remove('dark')
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', '#ffffff')
      return
    }

    const mode = settings.dark_mode
    const applyDark = (isDark: boolean) => {
      document.documentElement.classList.toggle('dark', isDark)
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', isDark ? '#09090b' : '#ffffff')
    }

    if (mode === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      applyDark(mq.matches)
      const handler = (e: MediaQueryListEvent) => applyDark(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
    applyDark(mode === true || mode === 'dark')
  }, [settings.dark_mode, isSharedPage])

  const isAuthPage =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password')

  return (
    <TranslationProvider>
      {!isAuthPage && <SystemNoticeHost />}
      <ToastContainer />
      <OfflineBanner />
      <Routes>
        {/* ── Public Routes ───────────────────────────── */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/shared/:token" element={<SharedTripPage />} />
        <Route path="/oauth/consent" element={<OAuthAuthorizePage />} />

        {/* ── Protected Routes ────────────────────────── */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/trips/:id" element={<ProtectedRoute><TripPlannerPage /></ProtectedRoute>} />
        <Route path="/trips/:id/files" element={<ProtectedRoute><FilesPage /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><TripNotesPage /></ProtectedRoute>} />
        <Route path="/invoice" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><InAppNotificationsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* ── Admin-Only Routes ───────────────────────── */}
        <Route path="/admin" element={<ProtectedRoute adminRequired><AdminPage /></ProtectedRoute>} />

        {/* ── Fallback ─────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TranslationProvider>
  )
}
// Traveloop – Travel Planning Platform 2026
