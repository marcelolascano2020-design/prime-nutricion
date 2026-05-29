import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FAMILY } from '../theme'
import { useAuth } from '../context/AuthContext'

function AuthInput({ type = 'text', placeholder, value, onChange, ink }) {
  const [focus, setFocus] = useState(false)
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      autoComplete={type === 'password' ? 'current-password' : 'email'}
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

export default function Login({ theme }) {
  const { login } = useAuth()
  const navigate   = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const ink    = theme.pageInk
  const accent = theme.accent
  const bg     = theme.page

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Completá todos los campos.'); return }
    setLoading(true)
    setError('')
    const { error } = await login(email, password)
    setLoading(false)
    if (error) {
      setError(
        error.message.includes('Invalid login')
          ? 'Email o contraseña incorrectos.'
          : error.message
      )
    } else {
      navigate('/', { replace: true })
    }
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
          <div style={{
            fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 6,
          }}>Bienvenido de vuelta</div>
          <div style={{ fontSize: 14, opacity: 0.5, marginBottom: 28 }}>
            Ingresá a tu cuenta para continuar.
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AuthInput
              type="email" placeholder="tu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} ink={ink}
            />
            <div>
              <AuthInput
                type="password" placeholder="Contraseña"
                value={password} onChange={e => setPassword(e.target.value)} ink={ink}
              />
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <Link to="/forgot-password" style={{
                  fontSize: 12, color: ink, opacity: 0.45,
                  textDecoration: 'none', letterSpacing: '0.01em',
                }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

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
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, opacity: 0.5 }}>
          ¿No tenés cuenta?{' '}
          <Link to="/register" style={{ color: accent, opacity: 1, fontWeight: 600, textDecoration: 'none' }}>
            Registrate
          </Link>
        </div>
      </div>
    </div>
  )
}
