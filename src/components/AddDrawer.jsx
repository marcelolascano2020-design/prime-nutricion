import { useState, useRef, useEffect } from 'react'
import { MicroLabel } from './ui'
import { FAMILY, nowHHMM } from '../theme'

const MOMENTS = [
  { key: 'desayuno',   label: 'Desayuno',    icon: '🌅' },
  { key: 'col_manana', label: 'Col. Mañana', icon: '🍎' },
  { key: 'almuerzo',   label: 'Almuerzo',    icon: '☀️' },
  { key: 'col_tarde',  label: 'Col. Tarde',  icon: '🍊' },
  { key: 'merienda',   label: 'Merienda',    icon: '☕' },
  { key: 'cena',       label: 'Cena',        icon: '🌙' },
]

function getDefaultMoment() {
  const h = new Date().getHours()
  if (h < 10) return 'desayuno'
  if (h < 12) return 'col_manana'
  if (h < 15) return 'almuerzo'
  if (h < 17) return 'col_tarde'
  if (h < 20) return 'merienda'
  return 'cena'
}

// ── Gemini Flash API ──────────────────────────────────────────────────────────

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`

async function callGemini(prompt) {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`)
  const data = await response.json()
  const text = data.candidates[0].content.parts[0].text.trim()
  console.log('[gemini] respuesta cruda:', text)
  return text
}

async function estimateFood(description) {
  try {
    const prompt = `Sos un nutricionista. Analizá este alimento y devolvé SOLO un JSON válido sin markdown ni texto extra: {"name":"nombre del alimento","kcal":número,"protein_g":número,"carbs_g":número,"fat_g":número}. Sé preciso con las cantidades. Alimento: ${description}`
    const text = await callGemini(prompt)
    const j = JSON.parse(text.replace(/```json|```/g, '').trim())
    console.log('[estimateFood] resultado:', j)
    return {
      name:    String(j.name || description).slice(0, 80),
      kcal:    Math.round(Number(j.kcal)                   || 0),
      protein: Math.round(Number(j.protein_g ?? j.protein) || 0),
      carbs:   Math.round(Number(j.carbs_g   ?? j.carbs)   || 0),
      fat:     Math.round(Number(j.fat_g     ?? j.fat)     || 0),
    }
  } catch (e) {
    console.error('[estimateFood] error:', e.message)
    return { name: description.slice(0, 60), kcal: 0, protein: 0, carbs: 0, fat: 0 }
  }
}

async function estimateExercise(description) {
  try {
    const prompt = `Sos un nutricionista deportivo. Estimá las calorías quemadas para una persona de 70 kg y devolvé SOLO un JSON válido sin markdown ni texto extra: {"name":"nombre del ejercicio","duration_min":número entero,"kcal":número entero}. Actividad: ${description}`
    const text = await callGemini(prompt)
    const j = JSON.parse(text.replace(/```json|```/g, '').trim())
    console.log('[estimateExercise] resultado:', j)
    return {
      name:     String(j.name || description).slice(0, 80),
      duration: j.duration_min ? `${j.duration_min} min` : '30 min',
      kcal:     Math.round(Number(j.kcal) || 0),
    }
  } catch (e) {
    console.error('[estimateExercise] error:', e.message)
    return { name: description.slice(0, 60), duration: '30 min', kcal: 0 }
  }
}

function PhotoUploader({ photo, onChange, ink, accent, bg }) {
  const inputRef = useRef(null)
  const [over, setOver] = useState(false)
  const handle = file => { if (!file) return; onChange(URL.createObjectURL(file)) }

  return (
    <div
      onDragEnter={e => { e.preventDefault(); setOver(true) }}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files[0]) }}
      onClick={() => inputRef.current && inputRef.current.click()}
      style={{
        width: '100%', aspectRatio: '16 / 6', borderRadius: 20,
        border: photo ? `1px solid ${ink}33` : `1.5px dashed ${over ? accent : ink + '55'}`,
        background: photo ? `url(${photo}) center/cover` : 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        transition: 'border-color .2s',
      }}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => handle(e.target.files && e.target.files[0])} />
      {!photo && (
        <div style={{ textAlign: 'center', color: ink }}>
          <div style={{
            width: 48, height: 48, borderRadius: 999,
            background: accent, color: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 300, lineHeight: 0.5,
            margin: '0 auto 12px',
          }}>+</div>
          <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600 }}>
            Subir foto del plato
          </div>
          <div style={{ marginTop: 4, fontSize: 11, opacity: 0.6 }}>
            Arrastrá o hacé clic
          </div>
        </div>
      )}
      {photo && (
        <button onClick={e => { e.stopPropagation(); onChange(null) }} style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(0,0,0,0.55)', color: '#fff', border: 0,
          padding: '6px 12px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
          borderRadius: 999, cursor: 'pointer', fontWeight: 600,
        }}>Quitar</button>
      )}
    </div>
  )
}

function SubmitBar({ loading, canSubmit, onSubmit, accent, drawerBg }) {
  return (
    <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 20 }}>
      <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.6 }}>
        {loading ? 'Calculando…' : '⌘ + Enter'}
      </span>
      <button onClick={onSubmit} disabled={!canSubmit || loading} style={{
        background: accent, color: drawerBg, border: 0,
        padding: '14px 30px', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
        fontWeight: 700, cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
        borderRadius: 999, fontFamily: 'inherit',
        opacity: canSubmit && !loading ? 1 : 0.4,
      }}>{loading ? 'Calculando' : 'Calcular'}</button>
    </div>
  )
}

function PreviewStat({ label, value, unit, accent, emphasis }) {
  return (
    <div>
      <MicroLabel style={{ fontSize: 10 }}>{label}</MicroLabel>
      <div style={{
        marginTop: 8,
        fontFamily: FAMILY.display,
        fontSize: emphasis ? 52 : 34, fontWeight: 400,
        letterSpacing: '-0.015em', fontVariantNumeric: 'tabular-nums',
        color: emphasis ? accent : 'inherit', lineHeight: 1,
      }}>
        {value}
        {unit && (
          <span style={{
            fontSize: 13, marginLeft: 4, opacity: 0.6,
            letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
          }}>{unit}</span>
        )}
      </div>
    </div>
  )
}

export default function AddDrawer({ open, initialTab, onClose, onAddFood, onAddExercise, onLogWeight, currentWeight, theme }) {
  const [tab, setTab] = useState('food')
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState(null)
  const [weight, setWeight] = useState(currentWeight || 75)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [moment, setMoment] = useState(getDefaultMoment)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setTab(initialTab || 'food')
      setText(''); setPhoto(null); setPreview(null); setLoading(false)
      setWeight(currentWeight || 75)
      setMoment(getDefaultMoment())
      setTimeout(() => inputRef.current && inputRef.current.focus(), 220)
    }
  }, [open, initialTab, currentWeight])

  const drawerBg = theme.page
  const drawerInk = theme.pageInk
  const accent = theme.tiles.weight.bg

  const submit = async () => {
    if (tab === 'weight') { onLogWeight(Number(weight)); onClose(); return }
    if (!text.trim() || loading) return
    setPreview(null)   // limpiar resultado anterior para que no queden valores viejos
    setLoading(true)
    const r = tab === 'food'
      ? await estimateFood(text)
      : await estimateExercise(text)
    setPreview({ kind: tab, ...r })
    setLoading(false)
  }

  const confirm = () => {
    const time = nowHHMM()
    if (preview.kind === 'food') {
      onAddFood({ id: Date.now(), time, photo, name: preview.name, kcal: preview.kcal, protein: preview.protein, carbs: preview.carbs, fat: preview.fat, tag: moment })
    } else {
      onAddExercise({ id: Date.now(), time, name: preview.name, duration: preview.duration, kcal: preview.kcal })
    }
    onClose()
  }

  const tabs = [
    { key: 'food', label: 'Comida' },
    { key: 'exercise', label: 'Ejercicio' },
    { key: 'weight', label: 'Peso' },
  ]

  const tabBtnStyle = active => ({
    background: active ? drawerInk : 'transparent',
    color: active ? drawerBg : drawerInk,
    border: active ? 0 : `1px solid ${drawerInk}33`,
    padding: '12px 22px',
    fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
    fontWeight: 600, cursor: 'pointer', borderRadius: 999, fontFamily: 'inherit',
  })

  const primaryBtn = { background: accent, color: drawerBg, border: 0, padding: '14px 30px', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 999, fontFamily: 'inherit' }
  const secondaryBtn = { background: 'transparent', color: drawerInk, border: `1px solid ${drawerInk}55`, padding: '14px 28px', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', borderRadius: 999, fontFamily: 'inherit' }
  const stepBtn = { background: 'transparent', border: `1px solid ${drawerInk}55`, width: 36, height: 36, borderRadius: 999, color: drawerInk, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }

  const textareaStyle = {
    width: '100%', background: 'transparent', color: 'inherit',
    border: 0, borderBottom: `1px solid ${drawerInk}33`,
    fontFamily: FAMILY.display, fontSize: 26, lineHeight: 1.35, fontWeight: 400,
    padding: '10px 0 12px', outline: 'none', resize: 'none',
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 90,
        background: 'rgba(20,12,4,0.5)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity .35s ease',
      }} />

      <div role="dialog" aria-modal="true" style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 100,
        background: drawerBg, color: drawerInk,
        borderTopLeftRadius: 36, borderTopRightRadius: 36,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform .4s cubic-bezier(.2,.8,.2,1)',
        boxShadow: '0 -40px 80px rgba(0,0,0,0.25)',
        paddingBottom: 48, maxHeight: '92vh', overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 48px 0' }}>
          <div style={{ width: 44, height: 4, background: drawerInk, opacity: 0.2, borderRadius: 999, margin: '0 auto 18px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <MicroLabel>Registrar</MicroLabel>
            <button onClick={onClose} aria-label="Cerrar" style={{
              background: 'transparent', border: 0, fontSize: 22, color: drawerInk,
              cursor: 'pointer', padding: 4, lineHeight: 1,
            }}>×</button>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            {tabs.map(tb => (
              <button key={tb.key} onClick={() => { setTab(tb.key); setPreview(null); setText('') }}
                style={tabBtnStyle(tab === tb.key)}>
                {tb.label}
              </button>
            ))}
          </div>

          {/* FOOD */}
          {tab === 'food' && !preview && (
            <div style={{ marginTop: 24 }}>

              {/* Momento del día */}
              <div style={{ marginBottom: 20 }}>
                <MicroLabel>Momento del día</MicroLabel>
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {MOMENTS.map(m => {
                    const active = moment === m.key
                    return (
                      <button key={m.key} onClick={() => setMoment(m.key)} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        padding: '10px 6px',
                        background: active ? theme.accent : 'transparent',
                        color: active ? theme.page : drawerInk,
                        border: `1px solid ${active ? theme.accent : drawerInk + '33'}`,
                        borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
                        transition: 'background .15s ease, color .15s ease, border-color .15s ease',
                      }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>{m.icon}</span>
                        <span style={{ marginTop: 2 }}>{m.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <PhotoUploader photo={photo} onChange={setPhoto} ink={drawerInk} accent={accent} bg={drawerBg} />
              <div style={{ marginTop: 24, fontSize: 13, opacity: 0.7, marginBottom: 10 }}>
                Describí en lenguaje natural. Yo calculo calorías y macros.
              </div>
              <textarea
                ref={inputRef} value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
                placeholder="2 huevos revueltos con tostada de aguacate y café negro"
                rows={2} style={textareaStyle}
              />
              <SubmitBar loading={loading} canSubmit={!!text.trim() && !!moment} onSubmit={submit} accent={accent} drawerBg={drawerBg} />
            </div>
          )}

          {/* EXERCISE */}
          {tab === 'exercise' && !preview && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 10 }}>
                Describí la actividad y la duración. Estimo calorías quemadas.
              </div>
              <textarea
                ref={inputRef} value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
                placeholder="45 min cinta a paso rápido más 20 min de pesas"
                rows={2} style={textareaStyle}
              />
              <SubmitBar loading={loading} canSubmit={!!text.trim()} onSubmit={submit} accent={accent} drawerBg={drawerBg} />
            </div>
          )}

          {/* WEIGHT */}
          {tab === 'weight' && (
            <div style={{ marginTop: 28 }}>
              <MicroLabel>Peso actual de báscula</MicroLabel>
              <div style={{
                marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 12,
                borderBottom: `1px solid ${drawerInk}33`, paddingBottom: 16,
              }}>
                <input
                  type="number" step="0.1" value={weight}
                  onChange={e => setWeight(e.target.value)}
                  style={{
                    background: 'transparent', border: 0, outline: 'none',
                    fontFamily: FAMILY.display, fontSize: 84, fontWeight: 400,
                    letterSpacing: '-0.025em', color: accent,
                    fontVariantNumeric: 'tabular-nums', width: 240, padding: 0,
                  }}
                />
                <span style={{ fontSize: 16, opacity: 0.7, letterSpacing: '0.18em', textTransform: 'uppercase' }}>kg</span>
                <span style={{ flex: 1 }} />
                <button onClick={() => setWeight(v => (+v - 0.1).toFixed(1))} style={stepBtn}>−</button>
                <button onClick={() => setWeight(v => (+v + 0.1).toFixed(1))} style={stepBtn}>+</button>
              </div>
              <div style={{ marginTop: 14, fontSize: 12, opacity: 0.6 }}>
                Se añadirá al historial con la fecha de hoy.
              </div>
              <div style={{ marginTop: 36, display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={submit} style={primaryBtn}>Guardar peso</button>
              </div>
            </div>
          )}

          {/* PREVIEW */}
          {preview && (
            <div style={{ marginTop: 28 }}>
              <MicroLabel>Vista previa</MicroLabel>
              {photo && preview.kind === 'food' && (
                <div style={{
                  marginTop: 16, width: '100%', aspectRatio: '16 / 6',
                  background: `url(${photo}) center/cover`, borderRadius: 20,
                }} />
              )}
              <div style={{ marginTop: 16, paddingBottom: 24, borderBottom: `1px solid ${drawerInk}33` }}>
                <div style={{
                  fontFamily: FAMILY.display, fontSize: 30, fontWeight: 400,
                  letterSpacing: '-0.01em', marginBottom: 20,
                }}>
                  {preview.name}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: preview.kind === 'food' ? 'auto 1fr 1fr 1fr' : 'auto 1fr',
                  gap: 28, alignItems: 'baseline',
                }}>
                  <PreviewStat
                    label={preview.kind === 'exercise' ? 'Quemadas' : 'Calorías'}
                    value={(preview.kind === 'exercise' ? '−' : '') + preview.kcal}
                    unit="kcal" accent={accent} emphasis
                  />
                  {preview.kind === 'food' && (
                    <>
                      <PreviewStat label="Proteína" value={preview.protein} unit="g" />
                      <PreviewStat label="Carbs" value={preview.carbs} unit="g" />
                      <PreviewStat label="Grasas" value={preview.fat} unit="g" />
                    </>
                  )}
                  {preview.kind === 'exercise' && (
                    <PreviewStat label="Duración" value={preview.duration} unit="" />
                  )}
                </div>
              </div>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={() => setPreview(null)} style={secondaryBtn}>Recalcular</button>
                <button onClick={confirm} style={primaryBtn}>Registrar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
