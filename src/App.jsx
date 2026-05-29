import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { THEMES, FAMILY } from './theme'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar        from './components/Sidebar'
import Dashboard      from './pages/Dashboard'
import Comidas        from './pages/Comidas'
import Peso           from './pages/Peso'
import Agua           from './pages/Agua'
import Ejercicio      from './pages/Ejercicio'
import Progreso       from './pages/Progreso'
import Perfil         from './pages/Perfil'
import Onboarding     from './pages/Onboarding'
import Login          from './pages/Login'
import Register       from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import './App.css'

// ── Shared loading screen ─────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg, #0c0d0a)',
    }}>
      <div style={{
        fontFamily: FAMILY.display,
        fontSize: 36, fontStyle: 'italic', fontWeight: 400,
        color: 'var(--ink, #e8dcb8)',
        opacity: 0.3, letterSpacing: '-0.02em',
      }}>
        Prime
      </div>
    </div>
  )
}

// ── Route guards ──────────────────────────────────────────────────────────────

/**
 * / → smart redirect según estado de auth + perfil
 *   sin sesión              → /login
 *   con sesión, sin perfil  → /onboarding
 *   con sesión + perfil     → /dashboard
 */
function RootRedirect() {
  const { user, loading, profile, profileLoading } = useAuth()
  if (loading || profileLoading) return <LoadingScreen />
  if (!user)    return <Navigate to="/login"      replace />
  if (!profile) return <Navigate to="/onboarding" replace />
  return              <Navigate to="/dashboard"  replace />
}

/** Ruta protegida: requiere sesión activa */
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/login" replace />
  return children
}

/** Ruta protegida: requiere sesión + onboarding completo */
function RequireProfile({ children }) {
  const { profile, profileLoading } = useAuth()
  if (profileLoading) return <LoadingScreen />
  if (!profile)       return <Navigate to="/onboarding" replace />
  return children
}

/** Páginas de auth: si ya tiene todo, ir al dashboard */
function RedirectIfAuthed({ children }) {
  const { user, loading, profile, profileLoading } = useAuth()
  if (loading || profileLoading) return <LoadingScreen />
  if (user) {
    return profile
      ? <Navigate to="/dashboard"  replace />
      : <Navigate to="/onboarding" replace />
  }
  return children
}

// ── App inner (necesita AuthProvider en el árbol) ─────────────────────────────

function AppInner() {
  const [themeKey, setThemeKey] = useState('obsidian')
  const theme = THEMES[themeKey]

  const cssVars = {
    '--bg':               theme.page,
    '--ink':              theme.pageInk,
    '--accent':           theme.accent,
    '--surface-hero':     theme.tiles.hero.bg,
    '--surface-weight':   theme.tiles.weight.bg,
    '--surface-macros':   theme.tiles.macros.bg,
    '--surface-exercise': theme.tiles.exercise.bg,
    '--surface-log':      theme.tiles.log.bg,
    '--surface-week':     theme.tiles.week.bg,
  }

  const AppShell = ({ children }) => (
    <div className="app-layout">
      <Sidebar theme={theme} themeKey={themeKey} setThemeKey={setThemeKey} />
      <main className="app-main">{children}</main>
    </div>
  )

  return (
    <div style={{
      background: theme.page, color: theme.pageInk,
      fontFamily: FAMILY.body, minHeight: '100vh',
      transition: 'background .4s ease, color .4s ease',
      ...cssVars,
    }}>
      <Routes>

        {/* Smart redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auth público */}
        <Route path="/login"    element={<RedirectIfAuthed><Login          theme={theme} /></RedirectIfAuthed>} />
        <Route path="/register" element={<RedirectIfAuthed><Register       theme={theme} /></RedirectIfAuthed>} />
        <Route path="/forgot-password" element={<ForgotPassword theme={theme} />} />

        {/* Onboarding: requiere sesión, no perfil completo */}
        <Route path="/onboarding" element={
          <RequireAuth><Onboarding theme={theme} /></RequireAuth>
        } />

        {/* App protegida */}
        <Route path="/dashboard" element={
          <RequireAuth><RequireProfile>
            <AppShell><Dashboard theme={theme} /></AppShell>
          </RequireProfile></RequireAuth>
        } />
        <Route path="/comidas" element={
          <RequireAuth><RequireProfile>
            <AppShell><Comidas theme={theme} /></AppShell>
          </RequireProfile></RequireAuth>
        } />
        <Route path="/peso" element={
          <RequireAuth><RequireProfile>
            <AppShell><Peso theme={theme} /></AppShell>
          </RequireProfile></RequireAuth>
        } />
        <Route path="/agua" element={
          <RequireAuth><RequireProfile>
            <AppShell><Agua theme={theme} /></AppShell>
          </RequireProfile></RequireAuth>
        } />
        <Route path="/ejercicio" element={
          <RequireAuth><RequireProfile>
            <AppShell><Ejercicio theme={theme} /></AppShell>
          </RequireProfile></RequireAuth>
        } />
        <Route path="/progreso" element={
          <RequireAuth><RequireProfile>
            <AppShell><Progreso theme={theme} /></AppShell>
          </RequireProfile></RequireAuth>
        } />
        <Route path="/perfil" element={
          <RequireAuth><RequireProfile>
            <AppShell><Perfil theme={theme} themeKey={themeKey} setThemeKey={setThemeKey} /></AppShell>
          </RequireProfile></RequireAuth>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
