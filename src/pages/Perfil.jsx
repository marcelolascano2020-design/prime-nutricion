import { useState, useEffect } from 'react'
import { FAMILY, THEMES } from '../theme'
import { Tile, MicroLabel, Display } from '../components/ui'
import { useAuth } from '../context/AuthContext'

const OBJETIVOS = [
  { key: 'lose',     label: 'Bajar de peso', icon: '↓' },
  { key: 'maintain', label: 'Mantenimiento', icon: '→' },
  { key: 'gain',     label: 'Ganar masa',    icon: '↑' },
]

function Field({ label, children, ink }) {
  return (
    <div>
      <div style={{
        fontSize: 11, opacity: 0.55, letterSpacing: '0.14em',
        textTransform: 'uppercase', fontWeight: 600, marginBottom: 6,
        color: ink,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function ProfileInput({ value, onChange, placeholder, type = 'text', readonly = false, ink }) {
  const [focus, setFocus] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readonly}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: '100%',
        background: readonly ? 'transparent' : `${ink}08`,
        border: `1px solid ${focus ? ink + '50' : ink + '18'}`,
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 14,
        color: readonly ? `${ink}60` : ink,
        fontFamily: FAMILY.body,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color .2s',
        cursor: readonly ? 'default' : 'text',
      }}
    />
  )
}

export default function Perfil({ theme, themeKey, setThemeKey }) {
  const { user, profile, updateSettings } = useAuth()
  const ink    = theme.tiles.log.ink
  const accent = theme.accent

  // ── Estado local del formulario ────────────────────────────────
  const [form, setForm] = useState({
    nombre:           '',
    edad:             '',
    altura_cm:        '',
    peso_inicial_kg:  '',
    peso_objetivo_kg: '',
    objetivo:         'maintain',
    agua_meta_litros: '2.0',
  })

  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  // ── Pre-completar desde AuthContext cuando llega el profile ────
  useEffect(() => {
    if (!profile) return
    setForm({
      nombre:           profile.nombre            ?? '',
      edad:             profile.edad              ?? '',
      altura_cm:        profile.altura_cm         ?? '',
      peso_inicial_kg:  profile.peso_inicial_kg   ?? '',
      peso_objetivo_kg: profile.peso_objetivo_kg  ?? '',
      objetivo:         profile.objetivo          ?? 'maintain',
      agua_meta_litros: profile.agua_meta_litros  ?? '2.0',
    })
  }, [profile])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // ── Guardar cambios ────────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await updateSettings({
        nombre:           form.nombre           || null,
        edad:             parseInt(form.edad)   || null,
        altura_cm:        parseFloat(form.altura_cm)        || null,
        peso_inicial_kg:  parseFloat(form.peso_inicial_kg)  || null,
        peso_objetivo_kg: parseFloat(form.peso_objetivo_kg) || null,
        objetivo:         form.objetivo         || null,
        agua_meta_litros: parseFloat(form.agua_meta_litros) || 2.0,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (e) {
      console.error('[Perfil] updateSettings error:', e)
      setError(e.message || 'Error al guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', padding: '40px 40px 120px',
      fontFamily: FAMILY.body,
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* ── Encabezado ─────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontSize: 11, opacity: 0.5, letterSpacing: '0.22em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: 10,
          }}>
            Configuración
          </div>
          <div style={{
            fontFamily: FAMILY.display, fontWeight: 400,
            fontSize: 52, lineHeight: 0.92, letterSpacing: '-0.02em', fontStyle: 'italic',
          }}>
            Perfil
          </div>
          <div style={{ marginTop: 14, fontSize: 14, opacity: 0.55, lineHeight: 1.6 }}>
            Objetivo, datos personales y preferencias visuales.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Datos personales ──────────────────────────────── */}
          <Tile palette={theme.tiles.log} style={{ padding: 28 }}>
            <MicroLabel style={{ marginBottom: 20 }}>Datos personales</MicroLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Nombre" ink={ink}>
                <ProfileInput
                  value={form.nombre}
                  onChange={e => set('nombre', e.target.value)}
                  placeholder="Tu nombre"
                  ink={ink}
                />
              </Field>

              {/* Email del usuario — solo lectura */}
              <Field label="Email" ink={ink}>
                <ProfileInput
                  value={user?.email ?? ''}
                  placeholder="—"
                  readonly
                  ink={ink}
                />
              </Field>

              <Field label="Altura (cm)" ink={ink}>
                <ProfileInput
                  type="number"
                  value={form.altura_cm}
                  onChange={e => set('altura_cm', e.target.value)}
                  placeholder="175"
                  ink={ink}
                />
              </Field>

              <Field label="Edad" ink={ink}>
                <ProfileInput
                  type="number"
                  value={form.edad}
                  onChange={e => set('edad', e.target.value)}
                  placeholder="30"
                  ink={ink}
                />
              </Field>
            </div>
          </Tile>

          {/* ── Objetivo ─────────────────────────────────────── */}
          <Tile palette={theme.tiles.macros} style={{ padding: 28 }}>
            <MicroLabel style={{ marginBottom: 20 }}>Objetivo</MicroLabel>
            <div style={{ display: 'flex', gap: 10 }}>
              {OBJETIVOS.map(o => {
                const active = form.objetivo === o.key
                return (
                  <button
                    key={o.key}
                    onClick={() => set('objetivo', o.key)}
                    style={{
                      flex: 1, padding: '14px 16px', borderRadius: 14,
                      background: active ? theme.tiles.macros.ink : 'transparent',
                      color: active ? theme.tiles.macros.bg : theme.tiles.macros.ink,
                      border: active
                        ? '1.5px solid transparent'
                        : `1.5px solid ${theme.tiles.macros.ink}30`,
                      cursor: 'pointer', textAlign: 'center',
                      fontFamily: FAMILY.body,
                      transition: 'all .15s',
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{o.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>
                      {o.label}
                    </div>
                  </button>
                )
              })}
            </div>
          </Tile>

          {/* ── Metas numéricas ───────────────────────────────── */}
          <Tile palette={theme.tiles.hero} style={{ padding: 28 }}>
            <MicroLabel style={{ marginBottom: 20 }}>Metas</MicroLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              {[
                { label: 'Peso inicial', key: 'peso_inicial_kg',  unit: 'kg', placeholder: '80' },
                { label: 'Peso objetivo', key: 'peso_objetivo_kg', unit: 'kg', placeholder: '70' },
                { label: 'Agua diaria',  key: 'agua_meta_litros', unit: 'L',  placeholder: '2.0' },
              ].map(m => (
                <div key={m.key}>
                  <MicroLabel style={{ marginBottom: 8, fontSize: 9 }}>{m.label}</MicroLabel>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <input
                      type="number"
                      step="0.1"
                      value={form[m.key]}
                      onChange={e => set(m.key, e.target.value)}
                      placeholder={m.placeholder}
                      style={{
                        width: '100%',
                        background: `${theme.tiles.hero.ink}0A`,
                        border: `1px solid ${theme.tiles.hero.ink}20`,
                        borderRadius: 10, padding: '8px 12px',
                        fontSize: 22, color: theme.tiles.hero.ink,
                        fontFamily: FAMILY.display,
                        outline: 'none', boxSizing: 'border-box',
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.01em',
                      }}
                    />
                    <span style={{ fontSize: 13, opacity: 0.6, flexShrink: 0 }}>{m.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </Tile>

          {/* ── Paleta visual ─────────────────────────────────── */}
          <Tile palette={theme.tiles.log} style={{ padding: 28 }}>
            <MicroLabel style={{ marginBottom: 20 }}>Paleta visual</MicroLabel>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(THEMES).map(([key, t]) => (
                <button key={key} onClick={() => setThemeKey(key)} style={{
                  flex: 1, padding: '16px 12px', borderRadius: 14,
                  background: t.page,
                  border: key === themeKey
                    ? `2px solid ${ink}`
                    : `2px solid ${ink}18`,
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start',
                }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[t.pageInk, t.tiles.hero.bg, t.tiles.weight.bg].map((c, i) => (
                      <div key={i} style={{
                        width: 12, height: 12, borderRadius: 999, background: c,
                      }} />
                    ))}
                  </div>
                  <div style={{
                    fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                    fontWeight: 700, color: t.pageInk,
                  }}>
                    {t.label}
                  </div>
                </button>
              ))}
            </div>
          </Tile>

          {/* ── Guardar ──────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {error && (
              <div style={{
                background: `${accent}15`, border: `1px solid ${accent}35`,
                borderRadius: 12, padding: '12px 16px',
                fontSize: 13, color: accent, lineHeight: 1.4,
              }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{
                background: `${ink}0A`, border: `1px solid ${ink}20`,
                borderRadius: 12, padding: '12px 16px',
                fontSize: 13, opacity: 0.75, letterSpacing: '0.04em',
              }}>
                ✓ Cambios guardados correctamente.
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '15px 0',
                borderRadius: 14, border: 'none',
                background: saving ? `${ink}20` : ink,
                color: saving ? `${ink}50` : theme.page,
                fontSize: 14, fontWeight: 700,
                fontFamily: FAMILY.body, letterSpacing: '0.04em',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all .2s',
              }}
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
