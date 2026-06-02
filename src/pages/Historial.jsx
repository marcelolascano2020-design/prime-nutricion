import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchMonthMeals, fetchMonthExercises } from '../lib/db'
import { FAMILY } from '../theme'

// ── Constants ─────────────────────────────────────────────────────────────────

const MOMENT_ORDER = [
  'desayuno', 'col_manana', 'almuerzo', 'col_tarde', 'merienda', 'cena', 'snack',
]
const MOMENT_META = {
  desayuno:   { label: 'Desayuno',    icon: '🌅' },
  col_manana: { label: 'Col. Mañana', icon: '🍎' },
  almuerzo:   { label: 'Almuerzo',    icon: '☀️' },
  col_tarde:  { label: 'Col. Tarde',  icon: '🍊' },
  merienda:   { label: 'Merienda',    icon: '☕' },
  cena:       { label: 'Cena',        icon: '🌙' },
  snack:      { label: 'Snack',       icon: '🍴' },
}
const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function dateToStr(d) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// ── Calendar ──────────────────────────────────────────────────────────────────

function Calendar({ year, month, itemsByDate, selectedDate, onSelect, theme }) {
  const tile      = theme.tiles.week
  const firstDow  = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today     = dateToStr(new Date())

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    })
  }

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 2, marginBottom: 6,
      }}>
        {WEEK_DAYS.map(label => (
          <div key={label} style={{
            textAlign: 'center', fontSize: 10,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            fontWeight: 700, color: tile.ink, opacity: 0.4, padding: '2px 0',
          }}>
            {label}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e${i}`} />

          const hasItems   = !!(itemsByDate[cell.dateStr]?.length)
          const isSelected = selectedDate === cell.dateStr
          const isToday    = today === cell.dateStr
          const isFuture   = cell.dateStr > today

          return (
            <button
              key={cell.dateStr}
              onClick={() => !isFuture && onSelect(isSelected ? null : cell.dateStr)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '9px 2px',
                background: isSelected ? theme.accent : 'transparent',
                color: isSelected
                  ? theme.page
                  : isFuture ? `${tile.ink}22` : tile.ink,
                border: isToday && !isSelected
                  ? `1px solid ${theme.accent}66`
                  : '1px solid transparent',
                borderRadius: 10,
                cursor: isFuture ? 'default' : 'pointer',
                fontFamily: 'inherit', minWidth: 0,
                transition: 'background .12s, color .12s',
              }}
            >
              <span style={{
                fontSize: 14, lineHeight: 1,
                fontWeight: isToday && !isSelected ? 700 : 400,
              }}>
                {cell.day}
              </span>
              <span style={{
                width: 4, height: 4, borderRadius: 999,
                background: hasItems
                  ? (isSelected ? theme.page : theme.accent)
                  : 'transparent',
                flexShrink: 0,
              }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Meal row ──────────────────────────────────────────────────────────────────

function MealRow({ meal, theme }) {
  const ink = theme.tiles.log.ink
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0', borderBottom: `1px solid ${ink}12`,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        flexShrink: 0, overflow: 'hidden',
        background: meal.photo
          ? `url(${meal.photo}) center/cover`
          : `${theme.accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>
        {!meal.photo && '🍽️'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 500, color: ink,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {meal.name}
        </div>
        <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>{meal.time}</div>
      </div>
      <div style={{
        fontSize: 15, fontWeight: 700, color: theme.accent,
        flexShrink: 0, fontVariantNumeric: 'tabular-nums',
      }}>
        {meal.kcal}
        <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.55, marginLeft: 3 }}>kcal</span>
      </div>
    </div>
  )
}

// ── Exercise row ──────────────────────────────────────────────────────────────

function ExerciseRow({ exercise, theme }) {
  const ink = theme.tiles.log.ink
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0', borderBottom: `1px solid ${ink}12`,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        flexShrink: 0,
        background: `${theme.accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>
        🏃
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 500, color: ink,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {exercise.name}
        </div>
        <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>
          {exercise.time} · {exercise.duration}
        </div>
      </div>
      <div style={{
        fontSize: 15, fontWeight: 700, color: theme.accent,
        flexShrink: 0, fontVariantNumeric: 'tabular-nums',
      }}>
        −{exercise.kcal}
        <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.55, marginLeft: 3 }}>kcal</span>
      </div>
    </div>
  )
}

// ── Day view ──────────────────────────────────────────────────────────────────

function DayView({ dateStr, items, theme }) {
  const tile = theme.tiles.log

  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const wkNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const mnNames = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const dateLabel = `${wkNames[dt.getDay()]}, ${d} de ${mnNames[m - 1]}`

  const meals     = (items || []).filter(i => i._type !== 'exercise')
  const exercises = (items || []).filter(i => i._type === 'exercise')

  const totalKcalIn  = meals.reduce((s, m) => s + m.kcal, 0)
  const totalKcalOut = exercises.reduce((s, e) => s + e.kcal, 0)

  // Agrupar comidas por momento
  const groups = {}
  for (const meal of meals) {
    const k = meal.tag || 'snack'
    if (!groups[k]) groups[k] = []
    groups[k].push(meal)
  }
  const sortedKeys = MOMENT_ORDER.filter(k => groups[k])

  return (
    <div style={{
      background: tile.bg, borderRadius: 24,
      padding: '20px 20px 8px',
      border: `1px solid ${tile.ink}08`,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        paddingBottom: 14, marginBottom: 16,
        borderBottom: `1px solid ${tile.ink}15`,
      }}>
        <div style={{
          fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
          fontWeight: 700, opacity: 0.45, color: tile.ink,
        }}>
          {dateLabel}
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
          {totalKcalIn > 0 && (
            <div style={{
              fontFamily: FAMILY.display, fontSize: 26, fontWeight: 400,
              color: theme.accent, letterSpacing: '-0.01em',
            }}>
              {totalKcalIn}
              <span style={{
                fontSize: 12, opacity: 0.6,
                letterSpacing: '0.12em', textTransform: 'uppercase', marginLeft: 4,
              }}>kcal</span>
            </div>
          )}
          {totalKcalOut > 0 && (
            <div style={{
              fontFamily: FAMILY.display, fontSize: 18, fontWeight: 400,
              color: tile.ink, opacity: 0.5, letterSpacing: '-0.01em',
            }}>
              −{totalKcalOut}
              <span style={{
                fontSize: 10, opacity: 0.6,
                letterSpacing: '0.12em', textTransform: 'uppercase', marginLeft: 3,
              }}>quem.</span>
            </div>
          )}
        </div>
      </div>

      {/* Sin registros */}
      {sortedKeys.length === 0 && exercises.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '28px 0',
          fontSize: 14, opacity: 0.3, color: tile.ink,
        }}>
          Sin registros
        </div>
      ) : (
        <>
          {/* Comidas agrupadas por momento */}
          {sortedKeys.map(key => (
            <div key={key} style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                fontWeight: 700, opacity: 0.5, color: tile.ink, marginBottom: 2,
              }}>
                <span style={{ fontSize: 14 }}>{MOMENT_META[key]?.icon}</span>
                <span>{MOMENT_META[key]?.label ?? key}</span>
              </div>
              {groups[key].map(meal => (
                <MealRow key={meal.id} meal={meal} theme={theme} />
              ))}
            </div>
          ))}

          {/* Ejercicios */}
          {exercises.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                fontWeight: 700, opacity: 0.5, color: tile.ink, marginBottom: 2,
              }}>
                <span style={{ fontSize: 14 }}>🏃</span>
                <span>Movimiento</span>
              </div>
              {exercises.map(ex => (
                <ExerciseRow key={ex.id} exercise={ex} theme={theme} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Historial({ theme }) {
  const { user } = useAuth()
  const now = new Date()

  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  })
  const [selectedDate, setSelectedDate] = useState(dateToStr(now))
  const [monthMeals, setMonthMeals]         = useState([])
  const [monthExercises, setMonthExercises] = useState([])
  const [loading, setLoading]               = useState(false)

  // Mezclar comidas + ejercicios por fecha
  const itemsByDate = useMemo(() => {
    const map = {}
    for (const m of monthMeals) {
      if (!map[m.date]) map[m.date] = []
      map[m.date].push(m)
    }
    for (const e of monthExercises) {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    }
    return map
  }, [monthMeals, monthExercises])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      fetchMonthMeals(user.id, cursor.year, cursor.month),
      fetchMonthExercises(user.id, cursor.year, cursor.month),
    ]).then(([meals, exercises]) => {
      setMonthMeals(meals)
      setMonthExercises(exercises)
      setLoading(false)
    }).catch(e => { console.error('[Historial]', e); setLoading(false) })
  }, [user, cursor.year, cursor.month])

  function prevMonth() {
    setCursor(c => {
      const d = new Date(c.year, c.month - 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
    setSelectedDate(null)
  }

  function nextMonth() {
    const isNow =
      cursor.year  === now.getFullYear() &&
      cursor.month === now.getMonth()
    if (isNow) return
    setCursor(c => {
      const d = new Date(c.year, c.month + 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
    setSelectedDate(null)
  }

  const isCurrentMonth =
    cursor.year  === now.getFullYear() &&
    cursor.month === now.getMonth()

  const calTile = theme.tiles.week

  return (
    <div style={{ padding: '32px 24px 80px', maxWidth: 600, margin: '0 auto' }}>

      <div style={{
        fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
        fontWeight: 700, opacity: 0.45, marginBottom: 20,
      }}>
        Historial
      </div>

      {/* Calendar card */}
      <div style={{
        background: calTile.bg, borderRadius: 24,
        padding: 20, marginBottom: 16,
        border: `1px solid ${calTile.ink}08`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 20,
        }}>
          <button onClick={prevMonth} style={{
            background: 'transparent', border: `1px solid ${calTile.ink}22`,
            borderRadius: 8, color: calTile.ink,
            width: 34, height: 34, fontSize: 20, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit', lineHeight: 1,
          }}>‹</button>

          <div style={{
            fontFamily: FAMILY.display, fontSize: 22, fontStyle: 'italic',
            fontWeight: 400, letterSpacing: '-0.01em', color: calTile.ink,
          }}>
            {MONTH_NAMES[cursor.month]} {cursor.year}
          </div>

          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            style={{
              background: 'transparent', border: `1px solid ${calTile.ink}22`,
              borderRadius: 8, color: calTile.ink,
              width: 34, height: 34, fontSize: 20,
              cursor: isCurrentMonth ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit', lineHeight: 1,
              opacity: isCurrentMonth ? 0.2 : 1,
              transition: 'opacity .15s',
            }}
          >›</button>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center', padding: '48px 0',
            fontSize: 14, opacity: 0.3, color: calTile.ink,
          }}>
            Cargando…
          </div>
        ) : (
          <Calendar
            year={cursor.year}
            month={cursor.month}
            itemsByDate={itemsByDate}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            theme={theme}
          />
        )}
      </div>

      {/* Day view */}
      {selectedDate ? (
        <DayView
          dateStr={selectedDate}
          items={itemsByDate[selectedDate] || []}
          theme={theme}
        />
      ) : (
        <div style={{
          textAlign: 'center', padding: '24px 0',
          fontSize: 13, opacity: 0.3,
        }}>
          Tocá un día para ver los registros
        </div>
      )}
    </div>
  )
}
