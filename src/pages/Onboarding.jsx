import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FAMILY } from '../theme'
import { useAuth } from '../context/AuthContext'

const OBJETIVO_OPTS = [
  { key: 'lose',     label: 'Bajar de peso',  icon: '↓' },
  { key: 'maintain', label: 'Mantenimiento',  icon: '→' },
  { key: 'gain',     label: 'Ganar masa',     icon: '↑' },
]
const COMIDAS_OPTS   = ['1–2 veces', '3 veces', '4–5 veces', 'Más de 5']
const AGUA_OPTS      = ['Poco', 'Regular', 'Bastante']
const ACTIVIDAD_OPTS = ['No', 'A veces', 'Sí, seguido']
const HORARIO_OPTS   = ['Mañana', 'Tarde', 'Noche', 'Todo el día']

const TOTAL_STEPS = 5

function inputStyle(ink) {
  return {
    width: '100%',
    background: `${ink}0A`,
    border: `1px solid ${ink}25`,
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 15,
    color: ink,
    fontFamily: FAMILY.body,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .2s',
  }
}

function Label({ children, ink }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
      fontWeight: 600, opacity: 0.55, marginBottom: 8, color: ink,
    }}>
      {children}
    </div>
  )
}

function Field({ label, ink, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <Label ink={ink}>{label}</Label>
      {children}
    </div>
  )
}

function ChipGroup({ options, value, onChange, ink, accent }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const active = value === opt
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '9px 18px',
              borderRadius: 999,
              border: `1.5px solid ${active ? accent : ink + '25'}`,
              background: active ? accent : 'transparent',
              color: active ? '#0c0d0a' : ink,
              fontSize: 13, fontWeight: active ? 600 : 400,
              fontFamily: FAMILY.body,
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function SummaryRow({ label, value, ink }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '10px 0', borderBottom: `1px solid ${ink}10` }}>
      <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.45, flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, textAlign: 'right', maxWidth: '65%' }}>{value}</div>
    </div>
  )
}

export default function Onboarding({ theme }) {
  const navigate = useNavigate()
  const { user, saveProfile } = useAuth()
  const ink    = theme.pageInk
  const accent = theme.accent
  const bg     = theme.page

  const [step, setStep] = useState(1)
  const [visible, setVisible] = useState(true)

  const [form, setForm] = useState({
    // Paso 1
    nombre: '', edad: '', sexo: '',
    // Paso 2
    pesoActual: '', altura: '', pesoObjetivo: '', objetivo: '',
    // Paso 3
    comidasDia: '', agua: '', actividad: '', ansiedad: '', horarioComida: '',
    // Paso 4
    habitosPositivos: '', habitosCambiar: '', alimentoFavorito: '',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  function transition(nextStep) {
    setVisible(false)
    setTimeout(() => {
      setStep(nextStep)
      setVisible(true)
    }, 200)
  }

  function handleNext() {
    if (step < TOTAL_STEPS) transition(step + 1)
    else handleFinish()
  }

  function handleBack() {
    if (step > 1) transition(step - 1)
  }

  async function handleFinish() {
    console.log('[Onboarding] handleFinish — user:', user?.id ?? 'null')
    if (!user) {
      console.error('[Onboarding] Sin usuario autenticado — abortando')
      return
    }
    try {
      console.log('[Onboarding] Llamando saveProfile con form:', form)
      const saved = await saveProfile(form)
      console.log('[Onboarding] saveProfile OK:', saved)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      console.error('[Onboarding] saveProfile FALLÓ:', e)
      // No navegamos si el save falló — el usuario se queda en el paso 5
    }
  }

  const canNext = () => {
    if (step === 1) return form.nombre.trim() && form.edad && form.sexo
    if (step === 2) return form.pesoActual && form.altura && form.pesoObjetivo && form.objetivo
    if (step === 3) return form.comidasDia && form.agua && form.actividad && form.horarioComida
    if (step === 4) return form.habitosPositivos.trim() && form.habitosCambiar.trim()
    return true
  }

  const pct = (step / TOTAL_STEPS) * 100

  const objetivoLabel = OBJETIVO_OPTS.find(o => o.key === form.objetivo)?.label || ''

  return (
    <div style={{
      minHeight: '100vh', background: bg, color: ink,
      fontFamily: FAMILY.body, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      padding: '0 20px 60px',
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 560, paddingTop: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{
            fontFamily: FAMILY.display, fontSize: 24, fontStyle: 'italic',
            fontWeight: 400, letterSpacing: '-0.02em',
          }}>Prime</div>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4 }}>
            {step} / {TOTAL_STEPS}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ position: 'relative', height: 3, borderRadius: 999, overflow: 'hidden', marginBottom: 40 }}>
          <div style={{ position: 'absolute', inset: 0, background: ink, opacity: 0.12, borderRadius: 999 }} />
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: pct + '%', background: accent, borderRadius: 999,
            transition: 'width .4s cubic-bezier(.2,.7,.2,1)',
          }} />
        </div>

        {/* Step content */}
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity .2s ease, transform .2s ease',
        }}>

          {/* ── PASO 1 ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div>
                <div style={{ fontFamily: FAMILY.display, fontSize: 38, fontStyle: 'italic', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: 10 }}>
                  Bienvenido/a
                </div>
                <div style={{ fontSize: 14, opacity: 0.55, lineHeight: 1.6 }}>
                  Contanos un poco sobre vos para personalizar tu experiencia.
                </div>
              </div>

              <Field label="Nombre completo" ink={ink}>
                <input
                  value={form.nombre}
                  onChange={e => set('nombre', e.target.value)}
                  placeholder="Tu nombre"
                  style={inputStyle(ink)}
                />
              </Field>

              <Field label="Edad" ink={ink}>
                <input
                  type="number" min="10" max="100"
                  value={form.edad}
                  onChange={e => set('edad', e.target.value)}
                  placeholder="Años"
                  style={inputStyle(ink)}
                />
              </Field>

              <Field label="Sexo" ink={ink}>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[['M', 'Masculino'], ['F', 'Femenino']].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => set('sexo', key)}
                      style={{
                        flex: 1, padding: '14px 0', borderRadius: 14,
                        border: `1.5px solid ${form.sexo === key ? accent : ink + '22'}`,
                        background: form.sexo === key ? accent : 'transparent',
                        color: form.sexo === key ? '#0c0d0a' : ink,
                        fontSize: 14, fontWeight: form.sexo === key ? 600 : 400,
                        fontFamily: FAMILY.body, cursor: 'pointer', transition: 'all .15s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* ── PASO 2 ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div>
                <div style={{ fontFamily: FAMILY.display, fontSize: 38, fontStyle: 'italic', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: 10 }}>
                  Tu cuerpo hoy
                </div>
                <div style={{ fontSize: 14, opacity: 0.55, lineHeight: 1.6 }}>
                  Estos datos nos ayudan a calcular tus metas calóricas.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Peso actual" ink={ink}>
                  <div style={{ position: 'relative' }}>
                    <input type="number" min="30" max="300"
                      value={form.pesoActual} onChange={e => set('pesoActual', e.target.value)}
                      placeholder="82" style={{ ...inputStyle(ink), paddingRight: 40 }}
                    />
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, opacity: 0.45 }}>kg</span>
                  </div>
                </Field>
                <Field label="Altura" ink={ink}>
                  <div style={{ position: 'relative' }}>
                    <input type="number" min="100" max="250"
                      value={form.altura} onChange={e => set('altura', e.target.value)}
                      placeholder="175" style={{ ...inputStyle(ink), paddingRight: 44 }}
                    />
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, opacity: 0.45 }}>cm</span>
                  </div>
                </Field>
              </div>

              <Field label="Peso objetivo" ink={ink}>
                <div style={{ position: 'relative' }}>
                  <input type="number" min="30" max="300"
                    value={form.pesoObjetivo} onChange={e => set('pesoObjetivo', e.target.value)}
                    placeholder="70" style={{ ...inputStyle(ink), paddingRight: 40 }}
                  />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, opacity: 0.45 }}>kg</span>
                </div>
              </Field>

              <Field label="Objetivo principal" ink={ink}>
                <div style={{ display: 'flex', gap: 10 }}>
                  {OBJETIVO_OPTS.map(o => (
                    <button key={o.key} onClick={() => set('objetivo', o.key)} style={{
                      flex: 1, padding: '14px 8px', borderRadius: 14, textAlign: 'center',
                      border: `1.5px solid ${form.objetivo === o.key ? accent : ink + '22'}`,
                      background: form.objetivo === o.key ? accent : 'transparent',
                      color: form.objetivo === o.key ? '#0c0d0a' : ink,
                      fontFamily: FAMILY.body, cursor: 'pointer', transition: 'all .15s',
                    }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{o.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>{o.label}</div>
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* ── PASO 3 ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div>
                <div style={{ fontFamily: FAMILY.display, fontSize: 38, fontStyle: 'italic', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: 10 }}>
                  Tus hábitos
                </div>
                <div style={{ fontSize: 14, opacity: 0.55, lineHeight: 1.6 }}>
                  Queremos entender tu rutina actual para darte mejores recomendaciones.
                </div>
              </div>

              <Field label="¿Cuántas veces comés por día?" ink={ink}>
                <ChipGroup options={COMIDAS_OPTS} value={form.comidasDia} onChange={v => set('comidasDia', v)} ink={ink} accent={accent} />
              </Field>

              <Field label="¿Tomás agua regularmente?" ink={ink}>
                <ChipGroup options={AGUA_OPTS} value={form.agua} onChange={v => set('agua', v)} ink={ink} accent={accent} />
              </Field>

              <Field label="¿Hacés actividad física?" ink={ink}>
                <ChipGroup options={ACTIVIDAD_OPTS} value={form.actividad} onChange={v => set('actividad', v)} ink={ink} accent={accent} />
              </Field>

              <Field label="¿A qué hora solés comer más?" ink={ink}>
                <ChipGroup options={HORARIO_OPTS} value={form.horarioComida} onChange={v => set('horarioComida', v)} ink={ink} accent={accent} />
              </Field>

              <Field label="¿Qué comés cuando sentís ansiedad?" ink={ink}>
                <input
                  value={form.ansiedad}
                  onChange={e => set('ansiedad', e.target.value)}
                  placeholder="Ej: chocolate, galletitas, pan..."
                  style={inputStyle(ink)}
                />
              </Field>
            </div>
          )}

          {/* ── PASO 4 ── */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div>
                <div style={{ fontFamily: FAMILY.display, fontSize: 38, fontStyle: 'italic', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: 10 }}>
                  Lo que querés mejorar
                </div>
                <div style={{ fontSize: 14, opacity: 0.55, lineHeight: 1.6 }}>
                  Esto nos ayuda a celebrar tus logros y trabajar en tus puntos débiles.
                </div>
              </div>

              <Field label="Hábitos positivos que ya tenés" ink={ink}>
                <textarea
                  value={form.habitosPositivos}
                  onChange={e => set('habitosPositivos', e.target.value)}
                  placeholder="Ej: tomo mucha agua, como frutas, desayuno todos los días..."
                  rows={3}
                  style={{ ...inputStyle(ink), resize: 'none', lineHeight: 1.55 }}
                />
              </Field>

              <Field label="Hábitos que querés cambiar" ink={ink}>
                <textarea
                  value={form.habitosCambiar}
                  onChange={e => set('habitosCambiar', e.target.value)}
                  placeholder="Ej: como muchos dulces de noche, me salteo el almuerzo..."
                  rows={3}
                  style={{ ...inputStyle(ink), resize: 'none', lineHeight: 1.55 }}
                />
              </Field>

              <Field label="¿Hay algún alimento que no podés dejar de comer?" ink={ink}>
                <input
                  value={form.alimentoFavorito}
                  onChange={e => set('alimentoFavorito', e.target.value)}
                  placeholder="Ej: pizza, medialunas, helado..."
                  style={inputStyle(ink)}
                />
              </Field>
            </div>
          )}

          {/* ── PASO 5 — RESUMEN ── */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ fontFamily: FAMILY.display, fontSize: 38, fontStyle: 'italic', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: 10 }}>
                  Todo listo
                </div>
                <div style={{ fontSize: 14, opacity: 0.55, lineHeight: 1.6 }}>
                  Revisá que todo esté correcto antes de arrancar.
                </div>
              </div>

              <div style={{
                background: `${ink}07`, borderRadius: 20, padding: 24,
                border: `1px solid ${ink}12`,
              }}>
                <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4, marginBottom: 16 }}>
                  Perfil
                </div>
                <SummaryRow label="Nombre" value={form.nombre} ink={ink} />
                <SummaryRow label="Edad" value={form.edad ? `${form.edad} años` : ''} ink={ink} />
                <SummaryRow label="Sexo" value={form.sexo === 'M' ? 'Masculino' : form.sexo === 'F' ? 'Femenino' : ''} ink={ink} />
                <SummaryRow label="Peso actual" value={form.pesoActual ? `${form.pesoActual} kg` : ''} ink={ink} />
                <SummaryRow label="Altura" value={form.altura ? `${form.altura} cm` : ''} ink={ink} />
                <SummaryRow label="Peso objetivo" value={form.pesoObjetivo ? `${form.pesoObjetivo} kg` : ''} ink={ink} />
                <SummaryRow label="Objetivo" value={objetivoLabel} ink={ink} />
              </div>

              <div style={{
                background: `${ink}07`, borderRadius: 20, padding: 24,
                border: `1px solid ${ink}12`,
              }}>
                <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4, marginBottom: 16 }}>
                  Hábitos
                </div>
                <SummaryRow label="Comidas / día" value={form.comidasDia} ink={ink} />
                <SummaryRow label="Hidratación" value={form.agua} ink={ink} />
                <SummaryRow label="Actividad física" value={form.actividad} ink={ink} />
                <SummaryRow label="Hora pico" value={form.horarioComida} ink={ink} />
                {form.ansiedad && <SummaryRow label="Ansiedad" value={form.ansiedad} ink={ink} />}
              </div>

              {(form.habitosPositivos || form.habitosCambiar || form.alimentoFavorito) && (
                <div style={{
                  background: `${ink}07`, borderRadius: 20, padding: 24,
                  border: `1px solid ${ink}12`,
                }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4, marginBottom: 16 }}>
                    Metas
                  </div>
                  <SummaryRow label="Fortalezas" value={form.habitosPositivos} ink={ink} />
                  <SummaryRow label="A mejorar" value={form.habitosCambiar} ink={ink} />
                  <SummaryRow label="Alimento favorito" value={form.alimentoFavorito} ink={ink} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
          {step > 1 && (
            <button
              onClick={handleBack}
              style={{
                flex: '0 0 auto', padding: '14px 24px', borderRadius: 14,
                border: `1.5px solid ${ink}20`, background: 'transparent',
                color: ink, fontSize: 14, fontWeight: 500,
                fontFamily: FAMILY.body, cursor: 'pointer', transition: 'all .15s',
              }}
            >
              ← Atrás
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canNext()}
            style={{
              flex: 1, padding: '15px 24px', borderRadius: 14,
              border: 'none',
              background: canNext() ? accent : `${ink}15`,
              color: canNext() ? '#0c0d0a' : `${ink}40`,
              fontSize: 14, fontWeight: 700,
              fontFamily: FAMILY.body,
              cursor: canNext() ? 'pointer' : 'not-allowed',
              letterSpacing: '0.04em',
              transition: 'all .2s',
            }}
          >
            {step === TOTAL_STEPS ? 'Comenzar →' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  )
}
