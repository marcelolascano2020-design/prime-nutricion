import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FAMILY } from '../theme'
import { useAuth } from '../context/AuthContext'

export default function ForgotPassword({ theme }) {
  const { resetPassword } = useAuth()

  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)

  const ink    = theme.pageInk
  const accent = theme.accent
  const bg     = theme.page

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) { setError('Ingresá tu email.'); return }
    setLoading(true)
    setError('')
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
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

        <div style={{
          background: `${ink}06`,
          border: `1px solid ${ink}12`,
          borderRadius: 24,
          padding: '36px 32px',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>📬</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
                Email enviado
              </div>
              <div style={{ fontSize: 14, opacity: 0.55, lineHeight: 1.7, marginBottom: 24 }}>
                Te enviamos las instrucciones para recuperar tu contraseña a <strong style={{ opacity: 1 }}>{email}</strong>.
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
          ) : (
            <>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 6 }}>
                Recuperar contraseña
              </div>
              <div style={{ fontSize: 14, opacity: 0.5, marginBottom: 28, lineHeight: 1.5 }}>
                Ingresá tu email y te enviamos un link para crear una nueva contraseña.
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoComplete="email"
                  style={{
                    width: '100%',
                    background: `${ink}08`,
                    border: `1px solid ${focused ? ink + '50' : ink + '20'}`,
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
                  {loading ? 'Enviando…' : 'Enviar link'}
                </button>
              </form>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, opacity: 0.5 }}>
          <Link to="/login" style={{ color: ink, textDecoration: 'none' }}>
            ← Volver al login
          </Link>
        </div>
      </div>
    </div>
  )
}
