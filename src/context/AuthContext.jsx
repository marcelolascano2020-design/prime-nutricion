import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchProfile, upsertProfile } from '../lib/db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,           setUser]           = useState(null)
  const [loading,        setLoading]        = useState(true)   // auth session check
  const [profile,        setProfile]        = useState(null)   // profiles row
  // Arranca en true: hay que esperar tanto el auth como el profile fetch
  // antes de que los guards puedan decidir a dónde redirigir.
  const [profileLoading, setProfileLoading] = useState(true)

  // ── Fetch profile whenever user changes ────────────────────────
  const loadProfile = useCallback(async (u) => {
    if (!u) { setProfile(null); setProfileLoading(false); return }
    setProfileLoading(true)
    try {
      const p = await fetchProfile(u.id)
      setProfile(p)   // null if onboarding not complete
    } catch (e) {
      console.error('Error loading profile:', e)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  // ── Bootstrap: restore session + listen for changes ────────────
  // En Supabase JS v2, onAuthStateChange dispara INITIAL_SESSION
  // de forma inmediata — no hace falta llamar getSession() por separado.
  // Usar ambos causaba un doble loadProfile que podía resetear el profile
  // justo después del saveProfile del onboarding.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      console.log('[AuthContext] onAuthStateChange — event:', _event, '| user:', u?.id ?? 'null')
      setUser(u)
      setLoading(false)
      loadProfile(u)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  // ── Auth actions ───────────────────────────────────────────────

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    return { data, error }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  // ── Profile: save (onboarding finish) ─────────────────────────
  /** Guarda el perfil en Supabase y actualiza el contexto */
  const saveProfile = async (formData) => {
    console.log('[AuthContext] saveProfile — user:', user?.id ?? 'null')
    if (!user) throw new Error('No hay usuario autenticado')
    const saved = await upsertProfile(user.id, formData)
    console.log('[AuthContext] upsertProfile result:', saved)
    setProfile(saved)
    return saved
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      profile,
      profileLoading,
      login,
      register,
      logout,
      resetPassword,
      saveProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
