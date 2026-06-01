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

function MacroInput({ label, value, onChange, accent, ink }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6 }}>
        {label}
      </div>
      <input
        type="number" min="0" value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'transparent',
          border: 0,
          borderBottom: `1px solid ${ink}33`,
          outline: 'none',
          fontFamily: FAMILY.display,
          fontSize: 36,
          fontWeight: 400,
          letterSpacing: '-0.01em',
          color: accent,
          fontVariantNumeric: 'tabular-nums',
          width: '100%',
          padding: '4px 0 8px',
        }}
      />
    </div>
  )
}

export default function AddDrawer({ open, initialTab, onClose, onAddFood, onAddExercise, onLogWeight, currentWeight, theme }) {
  const [tab, setTab] = useState('food')
  const [photo, setPhoto] = useState(null)
  const [moment, setMoment] = useState(getDefaultMoment)

  // Comida
  const [foodName, setFoodName]     = useState('')
  const [kcal, setKcal]             = useState('')
  const [protein, setProtein]       = useState('')
  const [carbs, setCarbs]           = useState('')
  const [fat, setFat]               = useState('')

  // Ejercicio
  const [exName, setExName]         = useState('')
  const [exDuration, setExDuration] = useState('')
  const [exKcal, setExKcal]         = useState('')

  // Peso
  const [weight, setWeight]         = useState(currentWeight || 75)

  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setTab(initialTab || 'food')
      setPhoto(null)
      setMoment(getDefaultMoment())
      setFoodName(''); setKcal(''); setProtein(''); setCarbs(''); setFat('')
      setExName(''); setExDuration(''); setExKcal('')
      setWeight(currentWeight || 75)
      setTimeout(() => inputRef.current && inputRef.current.focus(), 220)
    }
  }, [open, initialTab, currentWeight])

  const drawerBg  = theme.page
  const drawerInk = theme.pageInk
  const accent    = theme.tiles.weight.bg

  const canSubmitFood = foodName.trim() && kcal !== ''
  const canSubmitEx   = exName.trim() && exKcal !== ''

  const submitFood = () => {
    if (!canSubmitFood) return
    onAddFood({
      id: Date.now(), time: nowHHMM(), photo,
      name:    foodName.trim(),
      kcal:    Math.round(Number(kcal)    || 0),
      protein: Math.round(Number(protein) || 0),
      carbs:   Math.round(Number(carbs)   || 0),
      fat:     Math.round(Number(fat)     || 0),
      tag: moment,
    })
    onClose()
  }

  const submitExercise = () => {
    if (!canSubmitEx) return
    onAddExercise({
      id: Date.now(), time: nowHHMM(),
      name:     exName.trim(),
      duration: exDuration ? `${exDuration} min` : '—',
      kcal:     Math.round(Number(exKcal) || 0),
    })
    onClose()
  }

  const submitWeight = () => {
    onLogWeight(Number(weight))
    onClose()
  }

  const tabs = [
    { key: 'food',     label: 'Comida'   },
    { key: 'exercise', label: 'Ejercicio' },
    { key: 'weight',   label: 'Peso'     },
  ]

  const tabBtnStyle = active => ({
    background: active ? drawerInk : 'transparent',
    color: active ? drawerBg : drawerInk,
    border: active ? 0 : `1px solid ${drawerInk}33`,
    padding: '12px 22px',
    fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
    fontWeight: 600, cursor: 'pointer', borderRadius: 999, fontFamily: 'inherit',
  })

  const primaryBtn = {
    background: accent, color: drawerBg, border: 0,
    padding: '14px 30px', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
    fontWeight: 700, cursor: 'pointer', borderRadius: 999, fontFamily: 'inherit',
  }
  const primaryBtnDisabled = { ...primaryBtn, opacity: 0.35, cursor: 'not-allowed' }
  const stepBtn = {
    background: 'transparent', border: `1px solid ${drawerInk}55`,
    width: 36, height: 36, borderRadius: 999, color: drawerInk,
    fontSize: 16, cursor: 'pointer', fontFamily: 'inherit',
  }

  const nameInputStyle = {
    width: '100%', background: 'transparent', color: 'inherit',
    border: 0, borderBottom: `1px solid ${drawerInk}33`,
    fontFamily: FAMILY.display, fontSize: 26, lineHeight: 1.35, fontWeight: 400,
    padding: '10px 0 12px', outline: 'none',
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
              <button key={tb.key} onClick={() => setTab(tb.key)} style={tabBtnStyle(tab === tb.key)}>
                {tb.label}
              </button>
            ))}
          </div>

          {/* ── COMIDA ── */}
          {tab === 'food' && (
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

              {/* Nombre */}
              <div style={{ marginTop: 24 }}>
                <MicroLabel>Nombre del plato</MicroLabel>
                <input
                  ref={inputRef}
                  type="text"
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  placeholder="2 milanesas con puré"
                  style={nameInputStyle}
                />
              </div>

              {/* Macros */}
              <div style={{ marginTop: 24 }}>
                <MicroLabel>Calorías y macros</MicroLabel>
                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                  <MacroInput label="Kcal"      value={kcal}    onChange={setKcal}    accent={accent} ink={drawerInk} />
                  <MacroInput label="Prot (g)"  value={protein} onChange={setProtein} accent={drawerInk} ink={drawerInk} />
                  <MacroInput label="Carbs (g)" value={carbs}   onChange={setCarbs}   accent={drawerInk} ink={drawerInk} />
                  <MacroInput label="Grasas (g)" value={fat}    onChange={setFat}     accent={drawerInk} ink={drawerInk} />
                </div>
              </div>

              <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={submitFood}
                  disabled={!canSubmitFood}
                  style={canSubmitFood ? primaryBtn : primaryBtnDisabled}
                >
                  Registrar
                </button>
              </div>
            </div>
          )}

          {/* ── EJERCICIO ── */}
          {tab === 'exercise' && (
            <div style={{ marginTop: 24 }}>
              <MicroLabel>Actividad</MicroLabel>
              <input
                ref={inputRef}
                type="text"
                value={exName}
                onChange={e => setExName(e.target.value)}
                placeholder="Caminata, pesas, natación…"
                style={{ ...nameInputStyle, marginTop: 10 }}
              />

              <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 6 }}>
                    Duración (min)
                  </div>
                  <input
                    type="number" min="0" value={exDuration}
                    onChange={e => setExDuration(e.target.value)}
                    placeholder="45"
                    style={{
                      background: 'transparent', border: 0,
                      borderBottom: `1px solid ${drawerInk}33`,
                      outline: 'none', fontFamily: FAMILY.display,
                      fontSize: 36, fontWeight: 400, color: drawerInk,
                      fontVariantNumeric: 'tabular-nums',
                      width: '100%', padding: '4px 0 8px',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 6 }}>
                    Kcal quemadas
                  </div>
                  <input
                    type="number" min="0" value={exKcal}
                    onChange={e => setExKcal(e.target.value)}
                    placeholder="300"
                    style={{
                      background: 'transparent', border: 0,
                      borderBottom: `1px solid ${drawerInk}33`,
                      outline: 'none', fontFamily: FAMILY.display,
                      fontSize: 36, fontWeight: 400, color: accent,
                      fontVariantNumeric: 'tabular-nums',
                      width: '100%', padding: '4px 0 8px',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={submitExercise}
                  disabled={!canSubmitEx}
                  style={canSubmitEx ? primaryBtn : primaryBtnDisabled}
                >
                  Registrar
                </button>
              </div>
            </div>
          )}

          {/* ── PESO ── */}
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
                <button onClick={submitWeight} style={primaryBtn}>Guardar peso</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
