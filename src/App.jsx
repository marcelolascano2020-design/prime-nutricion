import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { THEMES, FAMILY } from './theme'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar        from './components/Sidebar'
import Dashboard      from './pages/Dashboard'
import Comidas        from './pages/Comidas'
import Peso           from './pages/Peso'
import Ejercicio      from './pages/Ejercicio'
import Progreso       from './pages/Progreso'
import Perfil         from './pages/Perfil'
import Onboarding     from './pages/Onboarding'
import Historial      from './pages/Historial'
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
  const { profile, updateSettings } = useAuth()
  const [themeKey, setThemeKey] = useState('obsidian')
  const theme = THEMES[themeKey] ?? THEMES.obsidian

  // ── Inicializar paleta desde el perfil guardado ──────────────
  // Sólo escucha profile.paleta; cuando el usuario cambia la paleta
  // nosotros mismos actualizamos profile.paleta → este effect se
  // vuelve a disparar pero es un no-op (key ya coincide).
  useEffect(() => {
    const saved = profile?.paleta
    if (saved && THEMES[saved] && saved !== themeKey) {
      setThemeKey(saved)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.paleta])

  // ── Cambio de paleta: aplica inmediatamente + persiste en DB ──
  function handleThemeChange(key) {
    if (!THEMES[key] || key === themeKey) return
    setThemeKey(key)
    // Guardado silencioso; si falla sólo aparece en consola
    if (updateSettings) {
      updateSettings({ paleta: key }).catch(e =>
        console.error('[AppInner] Error guardando paleta:', e)
      )
    }
  }

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

  function AppShell({ children }) {
    const [drawerOpen, setDrawerOpen] = useState(false)
    return (
      <div className="app-layout">
        <Sidebar
          theme={theme}
          themeKey={themeKey}
          setThemeKey={handleThemeChange}
          drawerOpen={drawerOpen}
          onCloseDrawer={() => setDrawerOpen(false)}
        />
        <main className="app-main">
          {/* ── Mobile topbar (hidden on desktop via CSS) ─── */}
          <div className="mobile-topbar">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú"
              style={{
                background: 'transparent',
                border: `1px solid ${theme.pageInk}20`,
                borderRadius: 10,
                color: theme.pageInk,
                width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, cursor: 'pointer', lineHeight: 1,
              }}
            >
              ☰
            </button>
            <div style={{
              fontFamily: FAMILY.display,
              fontSize: 22, fontStyle: 'italic',
              fontWeight: 400, letterSpacing: '-0.02em',
              color: theme.pageInk,
            }}>
              Prime
            </div>
            <div style={{ width: 40 }} />{/* spacer to center logo */}
          </div>
          {children}
        </main>
      </div>
    )
  }

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
        <Route path="/historial" element={
          <RequireAuth><RequireProfile>
            <AppShell><Historial theme={theme} /></AppShell>
          </RequireProfile></RequireAuth>
        } />
        <Route path="/perfil" element={
          <RequireAuth><RequireProfile>
            <AppShell><Perfil theme={theme} themeKey={themeKey} setThemeKey={handleThemeChange} /></AppShell>
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
