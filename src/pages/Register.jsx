import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FAMILY } from '../theme'
import { useAuth } from '../context/AuthContext'

function AuthInput({ type = 'text', placeholder, value, onChange, autoComplete, ink }) {
  const [focus, setFocus] = useState(false)
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: '100%',
        background: `${ink}08`,
        border: `1px solid ${focus ? ink + '50' : ink + '20'}`,
        borderRadius: 14,
        padding: '14px 18px',
        fontSize: 15,
        color: ink,
        fontFamily: FAMILY.body,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color .2s',
      }}
    />
  )
}

export default function Register({ theme }) {
  const { register } = useAuth()
  const navigate      = useNavigate()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const [loading,  setLoading]  = useState(false)

  const ink    = theme.pageInk
  const accent = theme.accent
  const bg     = theme.page

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name || !email || !password || !confirm) {
      setError('Completá todos los campos.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    setError('')
    const { data, error } = await register(name, email, password)
    setLoading(false)

    if (error) {
      setError(
        error.message.includes('already registered')
          ? 'Este email ya está registrado. ¿Querés iniciar sesión?'
          : error.message
      )
    } else if (data?.user && !data.session) {
      // Email confirmation required
      setSuccess(true)
    } else {
      navigate('/', { replace: true })
    }
  }

  const inputProps = { ink }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', background: bg, color: ink,
        fontFamily: FAMILY.body,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px',
      }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{
            fontFamily: FAMILY.display, fontWeight: 400, fontSize: 48,
            lineHeight: 0.9, letterSpacing: '-0.02em', fontStyle: 'italic', marginBottom: 44,
          }}>Prime</div>
          <div style={{ fontSize: 32, marginBottom: 16 }}>📬</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
            Revisá tu email
          </div>
          <div style={{ fontSize: 14, opacity: 0.55, lineHeight: 1.7, maxWidth: 320, margin: '0 auto 28px' }}>
            Te enviamos un link de confirmación a <strong style={{ opacity: 1 }}>{email}</strong>.
            Hacé click en el link para activar tu cuenta.
          </div>
          <Link to="/login" style={{
            display: 'inline-block', padding: '13px 32px',
            background: accent, color: '#0c0d0a',
            borderRadius: 14, fontWeight: 700, fontSize: 14,
            textDecoration: 'none', letterSpacing: '0.04em',
          }}>
            Volver al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: bg, color: ink,
      fontFamily: FAMILY.body,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            fontFamily: FAMILY.display, fontWeight: 400, fontSize: 48,
            lineHeight: 0.9, letterSpacing: '-0.02em', fontStyle: 'italic',
          }}>Prime</div>
          <div style={{
            marginTop: 8, fontSize: 10, letterSpacing: '0.26em',
            textTransform: 'uppercase', fontWeight: 600, opacity: 0.4,
          }}>Concierge nutricional</div>
        </div>

        {/* Card */}
        <div style={{
          background: `${ink}06`,
          border: `1px solid ${ink}12`,
          borderRadius: 24,
          padding: '36px 32px',
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 6 }}>
            Crear cuenta
          </div>
          <div style={{ fontSize: 14, opacity: 0.5, marginBottom: 28 }}>
            Empezá tu transformación hoy.
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AuthInput
              placeholder="Nombre completo"
              value={name} onChange={e => setName(e.target.value)}
              autoComplete="name" {...inputProps}
            />
            <AuthInput
              type="email" placeholder="tu@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="email" {...inputProps}
            />
            <AuthInput
              type="password" placeholder="Contraseña (mín. 6 caracteres)"
              value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="new-password" {...inputProps}
            />
            <AuthInput
              type="password" placeholder="Confirmar contraseña"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password" {...inputProps}
            />

            {error && (
              <div style={{
                background: `${accent}15`, border: `1px solid ${accent}30`,
                borderRadius: 10, padding: '10px 14px',
                fontSize: 13, color: accent, lineHeight: 1.4,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                width: '100%', padding: '15px 0',
                borderRadius: 14, border: 'none',
                background: loading ? `${ink}20` : accent,
                color: loading ? `${ink}50` : '#0c0d0a',
                fontSize: 14, fontWeight: 700,
                fontFamily: FAMILY.body, letterSpacing: '0.04em',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all .2s',
              }}
            >
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, opacity: 0.5 }}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={{ color: accent, opacity: 1, fontWeight: 600, textDecoration: 'none' }}>
            Iniciá sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
