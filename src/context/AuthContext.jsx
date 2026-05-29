import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchProfile, upsertProfile } from '../lib/db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,           setUser]           = useState(null)
  const [loading,        setLoading]        = useState(true)   // auth session check
  const [profile,        setProfile]        = useState(null)   // profiles row
  const [profileLoading, setProfileLoading] = useState(false)  // per-user profile fetch

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
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      setLoading(false)
      loadProfile(u)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
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
    if (!user) throw new Error('No user')
    const saved = await upsertProfile(user.id, formData)
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
