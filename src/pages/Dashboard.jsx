import { useState, useEffect } from 'react'
import { FAMILY, todayLabel } from '../theme'
import { useAuth } from '../context/AuthContext'
import {
  fetchTodayMeals, insertMeal, deleteMeal,
  fetchTodayExercises, insertExercise, deleteExercise,
  fetchWeightHistory, upsertWeight,
  fetchTodayWater, insertWater,
  fetchWeekCalories,
} from '../lib/db'
import HeroCard     from '../components/HeroCard'
import WeightCard   from '../components/WeightCard'
import MacrosCard   from '../components/MacrosCard'
import WeekCard     from '../components/WeekCard'
import MealLogCard  from '../components/MealLogCard'
import WaterCard    from '../components/WaterCard'
import ExerciseCard from '../components/ExerciseCard'
import PhotoCard    from '../components/PhotoCard'
import FloatingAdd  from '../components/FloatingAdd'
import AddDrawer    from '../components/AddDrawer'

const OBJETIVO_MAP = {
  lose:     'Bajar de peso',
  maintain: 'Mantenimiento',
  gain:     'Ganar masa',
}
const ACTIVIDAD_ICON = { 'No': '🛋️', 'A veces': '🚶', 'Sí, seguido': '🏃' }

export default function Dashboard({ theme }) {
  const { user, profile } = useAuth()

  // ── Metas desde el perfil ──────────────────────────────────────
  const CALORIE_GOAL = profile?.calorias_meta      || 2200
  const WATER_GOAL   = profile?.agua_meta_litros   || 2.0
  const WEIGHT_START = profile?.peso_inicial_kg    || 82.0
  const WEIGHT_GOAL  = profile?.peso_objetivo_kg   || 70.0

  // ── Estado de datos del día ────────────────────────────────────
  const [meals,         setMeals]         = useState([])
  const [exercises,     setExercises]     = useState([])
  const [weightHistory, setWeightHistory] = useState([])
  const [waterLiters,   setWaterLiters]   = useState(0)
  const [weekCals,      setWeekCals]      = useState(Array(7).fill(0))
  const [dataLoading,   setDataLoading]   = useState(true)
  const [drawer,        setDrawer]        = useState({ open: false, tab: 'food' })

  // ── Carga inicial desde Supabase ───────────────────────────────
  useEffect(() => {
    if (!user) return
    setDataLoading(true)
    Promise.all([
      fetchTodayMeals(user.id),
      fetchTodayExercises(user.id),
      fetchWeightHistory(user.id),
      fetchTodayWater(user.id),
      fetchWeekCalories(user.id),
    ])
      .then(([m, e, w, water, wk]) => {
        setMeals(m)
        setExercises(e)
        setWeightHistory(w)
        setWaterLiters(water)
        setWeekCals(wk)
      })
      .catch(err => console.error('Error cargando datos:', err))
      .finally(() => setDataLoading(false))
  }, [user])

  // ── Métricas derivadas ─────────────────────────────────────────
  const consumed = meals.reduce((s, m) => s + m.kcal, 0)
  const burned   = exercises.reduce((s, e) => s + e.kcal, 0)
  const totals   = meals.reduce(
    (acc, m) => ({ protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
    { protein: 0, carbs: 0, fat: 0 },
  )
  const macroGoals = {
    protein: Math.round((CALORIE_GOAL * 0.30) / 4),
    carbs:   Math.round((CALORIE_GOAL * 0.40) / 4),
    fat:     Math.round((CALORIE_GOAL * 0.30) / 9),
  }

  // Últimos 6 días desde Supabase + hoy en vivo
  const weekData = [...weekCals.slice(0, 6), consumed]

  const currentWeight = weightHistory.length > 0
    ? weightHistory[weightHistory.length - 1].kg
    : WEIGHT_START

  const displayHistory = weightHistory.length > 0
    ? weightHistory
    : [{ day: 0, kg: WEIGHT_START }]

  const latestPhoto = [...meals].reverse().find(m => m.photo)

  // ── Handlers: escritura optimista + sync a Supabase ───────────

  const handleAddFood = async (meal) => {
    try {
      const saved = await insertMeal(user.id, meal)
      setMeals(ms => [...ms, saved])
    } catch (e) { console.error('insertMeal:', e) }
  }

  const handleDeleteMeal = async (id) => {
    setMeals(ms => ms.filter(m => m.id !== id))        // optimistic
    try { await deleteMeal(id) }
    catch (e) { console.error('deleteMeal:', e) }
  }

  const handleAddExercise = async (exercise) => {
    try {
      const saved = await insertExercise(user.id, exercise)
      setExercises(es => [...es, saved])
    } catch (e) { console.error('insertExercise:', e) }
  }

  const handleDeleteExercise = async (id) => {
    setExercises(es => es.filter(e => e.id !== id))    // optimistic
    try { await deleteExercise(id) }
    catch (e) { console.error('deleteExercise:', e) }
  }

  const handleAddWater = async (amt) => {
    setWaterLiters(l => Math.min(WATER_GOAL + 1, +(l + amt).toFixed(2)))  // optimistic
    try { await insertWater(user.id, amt) }
    catch (e) { console.error('insertWater:', e) }
  }

  const handleLogWeight = async (kg) => {
    setWeightHistory(wh => [...wh, { day: 0, kg }])    // optimistic
    try { await upsertWeight(user.id, kg) }
    catch (e) { console.error('upsertWeight:', e) }
  }

  const openDrawer  = tab => setDrawer({ open: true, tab })
  const closeDrawer = ()  => setDrawer(d => ({ ...d, open: false }))

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', fontFamily: FAMILY.body }}>
      <div className="dashboard-outer" style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 0' }}>

        {/* ── Header personalizado ─────────────────────────────── */}
        <header style={{ padding: '16px 0 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div
                className="dashboard-name"
                style={{
                  fontFamily: FAMILY.display, fontWeight: 400,
                  fontSize: 48, lineHeight: 0.92, letterSpacing: '-0.02em', fontStyle: 'italic',
                }}
              >
                {profile?.nombre ? `Hola, ${profile.nombre.split(' ')[0]}` : 'Prime'}
              </div>
              <div style={{
                marginTop: 6, fontSize: 11, opacity: 0.55,
                letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600,
              }}>
                {OBJETIVO_MAP[profile?.objetivo] || 'Concierge nutricional'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, letterSpacing: '0.02em', fontWeight: 500 }}>
                {todayLabel()}
              </div>
              {profile?.peso_inicial_kg && profile?.peso_objetivo_kg && (
                <div style={{ marginTop: 5, fontSize: 13, fontWeight: 500 }}>
                  <span style={{ opacity: 0.5 }}>{profile.peso_inicial_kg} kg</span>
                  <span style={{ opacity: 0.3, margin: '0 6px' }}>→</span>
                  <span style={{ color: theme.accent, fontWeight: 700 }}>{profile.peso_objetivo_kg} kg</span>
                </div>
              )}
            </div>
          </div>

          {/* Hábitos chip strip */}
          {profile && (profile.actividad_fisica || profile.agua_habito || profile.horario_comida || profile.habitos_cambiar) && (
            <div style={{
              marginTop: 18,
              background: `${theme.pageInk}06`,
              border: `1px solid ${theme.pageInk}10`,
              borderRadius: 16, padding: '14px 20px',
              display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center',
            }}>
              {profile.actividad_fisica && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{ACTIVIDAD_ICON[profile.actividad_fisica] || '🏃'}</span>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4 }}>Actividad</div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginTop: 1 }}>{profile.actividad_fisica}</div>
                  </div>
                </div>
              )}
              {profile.agua_habito && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>💧</span>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4 }}>Hidratación</div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginTop: 1 }}>{profile.agua_habito}</div>
                  </div>
                </div>
              )}
              {profile.horario_comida && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🕐</span>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4 }}>Hora pico</div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginTop: 1 }}>{profile.horario_comida}</div>
                  </div>
                </div>
              )}
              {profile.comidas_dia && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🍽️</span>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4 }}>Comidas / día</div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginTop: 1 }}>{profile.comidas_dia}</div>
                  </div>
                </div>
              )}
              {profile.habitos_cambiar && (
                <div style={{ flex: 1, minWidth: 180, borderLeft: `1px solid ${theme.pageInk}12`, paddingLeft: 20 }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4, marginBottom: 3 }}>A trabajar</div>
                  <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.75, lineHeight: 1.4 }}>
                    {profile.habitos_cambiar.length > 60
                      ? profile.habitos_cambiar.slice(0, 60) + '…'
                      : profile.habitos_cambiar}
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        {/* ── Bento grid ───────────────────────────────────────── */}
        <div
          className="dashboard-grid"
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
            gap: 16, paddingBottom: 180,
            opacity: dataLoading ? 0.5 : 1,
            transition: 'opacity .3s ease',
          }}
        >
          {/* Fila 1: Hero · Peso · Foto */}
          <div className="grid-item grid-item--hero" style={{ gridColumn: 'span 5', minHeight: 460 }}>
            <HeroCard palette={theme.tiles.hero} consumed={consumed} burned={burned} goal={CALORIE_GOAL} />
          </div>
          <div className="grid-item grid-item--weight" style={{ gridColumn: 'span 4', minHeight: 460 }}>
            <WeightCard
              palette={theme.tiles.weight}
              history={displayHistory} start={WEIGHT_START} goal={WEIGHT_GOAL}
              onLog={() => openDrawer('weight')}
            />
          </div>
          <div className="grid-item grid-item--photo" style={{ gridColumn: 'span 3', minHeight: 460 }}>
            <PhotoCard
              palette={theme.tiles.photo}
              latestPhoto={latestPhoto?.photo} latestName={latestPhoto?.name}
              onAdd={() => openDrawer('food')}
            />
          </div>

          {/* Fila 2: Macros · Ejercicio */}
          <div className="grid-item grid-item--macros" style={{ gridColumn: 'span 7' }}>
            <MacrosCard palette={theme.tiles.macros} totals={totals} goals={macroGoals} />
          </div>
          <div className="grid-item grid-item--exercise" style={{ gridColumn: 'span 5', minHeight: 320 }}>
            <ExerciseCard
              palette={theme.tiles.exercise} items={exercises}
              onAdd={() => openDrawer('exercise')}
              onDelete={handleDeleteExercise}
            />
          </div>

          {/* Fila 3: Agua · Comidas */}
          <div className="grid-item grid-item--water" style={{ gridColumn: 'span 4', minHeight: 320 }}>
            <WaterCard
              palette={theme.tiles.water}
              liters={waterLiters} goal={WATER_GOAL}
              onAdd={handleAddWater}
            />
          </div>
          <div className="grid-item grid-item--log" style={{ gridColumn: 'span 8' }}>
            <MealLogCard
              palette={theme.tiles.log} items={meals}
              onAdd={() => openDrawer('food')}
              onDelete={handleDeleteMeal}
            />
          </div>

          {/* Fila 4: Semana */}
          <div className="grid-item grid-item--week" style={{ gridColumn: 'span 12' }}>
            <WeekCard palette={theme.tiles.week} data={weekData} goal={CALORIE_GOAL} />
          </div>
        </div>
      </div>

      <FloatingAdd onClick={() => openDrawer('food')} theme={theme} />

      <AddDrawer
        open={drawer.open} initialTab={drawer.tab}
        onClose={closeDrawer}
        onAddFood={handleAddFood}
        onAddExercise={handleAddExercise}
        onLogWeight={handleLogWeight}
        currentWeight={currentWeight}
        theme={theme}
      />
    </div>
  )
}
