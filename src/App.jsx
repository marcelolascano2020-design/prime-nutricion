import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { THEMES, FAMILY } from './theme'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar      from './components/Sidebar'
import Dashboard    from './pages/Dashboard'
import Comidas      from './pages/Comidas'
import Peso         from './pages/Peso'
import Agua         from './pages/Agua'
import Ejercicio    from './pages/Ejercicio'
import Progreso     from './pages/Progreso'
import Perfil       from './pages/Perfil'
import Onboarding   from './pages/Onboarding'
import Login        from './pages/Login'
import Register     from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import './App.css'

// ── Route guards ─────────────────────────────────────────────────────────────

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
        opacity: 0.3,
        letterSpacing: '-0.02em',
      }}>
        Prime
      </div>
    </div>
  )
}

/** Redirect based on auth + onboarding state */
function RootRedirect() {
  const { user, loading, hasProfile } = useAuth()
  if (loading)                       return <LoadingScreen />
  if (!user)                         return <Navigate to="/login"      replace />
  if (!hasProfile(user.id))          return <Navigate to="/onboarding" replace />
  return                                    <Navigate to="/dashboard"  replace />
}

/** Must be logged in — otherwise → /login */
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/login" replace />
  return children
}

/** Must be logged in AND have completed onboarding — otherwise → /onboarding */
function RequireProfile({ children }) {
  const { user, hasProfile } = useAuth()
  if (!hasProfile(user.id)) return <Navigate to="/onboarding" replace />
  return children
}

/** Already authenticated users going to auth pages → skip to dashboard */
function RedirectIfAuthed({ children }) {
  const { user, loading, hasProfile } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) {
    return hasProfile(user.id)
      ? <Navigate to="/dashboard"  replace />
      : <Navigate to="/onboarding" replace />
  }
  return children
}

// ── Inner app (needs AuthProvider in tree) ────────────────────────────────────

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

  const pageStyle = {
    background: theme.page,
    color: theme.pageInk,
    fontFamily: FAMILY.body,
    minHeight: '100vh',
    transition: 'background .4s ease, color .4s ease',
    ...cssVars,
  }

  /** Sidebar + inner routes shared wrapper */
  const AppShell = ({ children }) => (
    <div className="app-layout">
      <Sidebar theme={theme} themeKey={themeKey} setThemeKey={setThemeKey} />
      <main className="app-main">{children}</main>
    </div>
  )

  return (
    <div style={pageStyle}>
      <Routes>

        {/* ── Root: smart redirect ───────────────────────── */}
        <Route path="/"  element={<RootRedirect />} />

        {/* ── Public: auth pages ────────────────────────── */}
        <Route path="/login" element={
          <RedirectIfAuthed><Login theme={theme} /></RedirectIfAuthed>
        } />
        <Route path="/register" element={
          <RedirectIfAuthed><Register theme={theme} /></RedirectIfAuthed>
        } />
        <Route path="/forgot-password" element={<ForgotPassword theme={theme} />} />

        {/* ── Semi-protected: onboarding ────────────────── */}
        <Route path="/onboarding" element={
          <RequireAuth>
            <Onboarding theme={theme} />
          </RequireAuth>
        } />

        {/* ── Protected: main app ───────────────────────── */}
        <Route path="/dashboard" element={
          <RequireAuth>
            <RequireProfile>
              <AppShell>
                <Dashboard theme={theme} />
              </AppShell>
            </RequireProfile>
          </RequireAuth>
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
            <AppShell>
              <Perfil theme={theme} themeKey={themeKey} setThemeKey={setThemeKey} />
            </AppShell>
          </RequireProfile></RequireAuth>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

// ── Root export (wraps everything in AuthProvider) ────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
