import { useState } from 'react'
import { FAMILY, todayLabel } from '../theme'
import { useAuth } from '../context/AuthContext'
import HeroCard from '../components/HeroCard'
import WeightCard from '../components/WeightCard'
import MacrosCard from '../components/MacrosCard'
import WeekCard from '../components/WeekCard'
import MealLogCard from '../components/MealLogCard'
import WaterCard from '../components/WaterCard'
import ExerciseCard from '../components/ExerciseCard'
import PhotoCard from '../components/PhotoCard'
import FloatingAdd from '../components/FloatingAdd'
import AddDrawer from '../components/AddDrawer'

const CALORIE_GOAL = 2200
const WATER_GOAL   = 2.0

const OBJETIVO_MAP = {
  lose:     'Bajar de peso',
  maintain: 'Mantenimiento',
  gain:     'Ganar masa',
}
const ACTIVIDAD_ICON = { 'No': '🛋️', 'A veces': '🚶', 'Sí, seguido': '🏃' }

const SEED_MEALS = [
  { id: 1, time: '08:15', name: 'Café americano · sin azúcar',            kcal: 5,   protein: 0,  carbs: 1,  fat: 0,  photo: null, tag: 'caf' },
  { id: 2, time: '08:30', name: 'Avena con frutos rojos y miel cruda',    kcal: 320, protein: 9,  carbs: 58, fat: 6,  photo: null, tag: 'des' },
  { id: 3, time: '13:45', name: 'Ensalada César con pollo a la parrilla', kcal: 480, protein: 38, carbs: 22, fat: 26, photo: null, tag: 'alm' },
]
const SEED_EX = [
  { id: 1, time: '07:00', name: 'Caminata matutina', duration: '35 min', kcal: 180 },
]
const SEED_WEIGHT = [
  { day: -84, kg: 82.0 }, { day: -70, kg: 81.2 }, { day: -56, kg: 80.1 },
  { day: -42, kg: 78.6 }, { day: -28, kg: 77.1 }, { day: -14, kg: 75.8 },
  { day: -7,  kg: 75.2 }, { day: 0,   kg: 74.8 },
]
const WEEK_CALS = [1840, 2050, 2210, 1920, 2090, 1780]

export default function Dashboard({ theme }) {
  const { user, getProfile } = useAuth()
  const profile = user ? getProfile(user.id) : {}

  const WEIGHT_START = profile.pesoActual  ? parseFloat(profile.pesoActual)  : 82.0
  const WEIGHT_GOAL  = profile.pesoObjetivo ? parseFloat(profile.pesoObjetivo) : 70.0

  const [meals,         setMeals]         = useState(SEED_MEALS)
  const [exercises,     setExercises]     = useState(SEED_EX)
  const [weightHistory, setWeightHistory] = useState(
    profile.pesoActual
      ? [{ day: 0, kg: parseFloat(profile.pesoActual) }]
      : SEED_WEIGHT
  )
  const [waterLiters,   setWaterLiters]   = useState(1.25)
  const [drawer,        setDrawer]        = useState({ open: false, tab: 'food' })

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
  const weekData      = [...WEEK_CALS, consumed]
  const currentWeight = weightHistory[weightHistory.length - 1]?.kg ?? WEIGHT_START
  const latestPhoto   = [...meals].reverse().find(m => m.photo)

  const openDrawer  = tab => setDrawer({ open: true, tab })
  const closeDrawer = ()  => setDrawer(d => ({ ...d, open: false }))

  return (
    <div style={{ minHeight: '100vh', fontFamily: FAMILY.body }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 0' }}>

        <header style={{ padding: '16px 0 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{
                fontFamily: FAMILY.display, fontWeight: 400,
                fontSize: 48, lineHeight: 0.92, letterSpacing: '-0.02em', fontStyle: 'italic',
              }}>
                {profile.nombre ? `Hola, ${profile.nombre.split(' ')[0]}` : 'Prime'}
              </div>
              <div style={{
                marginTop: 6, fontSize: 11, opacity: 0.55,
                letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600,
              }}>
                {profile.objetivo
                  ? OBJETIVO_MAP[profile.objetivo] || 'Concierge nutricional'
                  : 'Concierge nutricional'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, letterSpacing: '0.02em', fontWeight: 500 }}>
                {todayLabel()}
              </div>
              {profile.pesoActual && profile.pesoObjetivo && (
                <div style={{ marginTop: 5, fontSize: 13, fontWeight: 500 }}>
                  <span style={{ opacity: 0.5 }}>{profile.pesoActual} kg</span>
                  <span style={{ opacity: 0.3, margin: '0 6px' }}>→</span>
                  <span style={{ color: theme.accent, fontWeight: 700 }}>{profile.pesoObjetivo} kg</span>
                </div>
              )}
            </div>
          </div>

          {/* Habits summary strip */}
          {(profile.actividad || profile.agua || profile.horarioComida || profile.habitosCambiar) && (
            <div style={{
              marginTop: 18,
              background: `${theme.pageInk}06`,
              border: `1px solid ${theme.pageInk}10`,
              borderRadius: 16,
              padding: '14px 20px',
              display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center',
            }}>
              {profile.actividad && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{ACTIVIDAD_ICON[profile.actividad] || '🏃'}</span>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4 }}>Actividad</div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginTop: 1 }}>{profile.actividad}</div>
                  </div>
                </div>
              )}
              {profile.agua && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>💧</span>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4 }}>Hidratación</div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginTop: 1 }}>{profile.agua}</div>
                  </div>
                </div>
              )}
              {profile.horarioComida && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🕐</span>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4 }}>Hora pico</div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginTop: 1 }}>{profile.horarioComida}</div>
                  </div>
                </div>
              )}
              {profile.comidasDia && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🍽️</span>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4 }}>Comidas / día</div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginTop: 1 }}>{profile.comidasDia}</div>
                  </div>
                </div>
              )}
              {profile.habitosCambiar && (
                <div style={{ flex: 1, minWidth: 180, borderLeft: `1px solid ${theme.pageInk}12`, paddingLeft: 20 }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.4, marginBottom: 3 }}>A trabajar</div>
                  <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.75, lineHeight: 1.4 }}>
                    {profile.habitosCambiar.length > 60
                      ? profile.habitosCambiar.slice(0, 60) + '…'
                      : profile.habitosCambiar}
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Bento grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: 16, paddingBottom: 180 }}>

          {/* Fila 1: Hero · Peso · Foto */}
          <div style={{ gridColumn: 'span 5', minHeight: 460 }}>
            <HeroCard palette={theme.tiles.hero} consumed={consumed} burned={burned} goal={CALORIE_GOAL} />
          </div>
          <div style={{ gridColumn: 'span 4', minHeight: 460 }}>
            <WeightCard
              palette={theme.tiles.weight}
              history={weightHistory} start={WEIGHT_START} goal={WEIGHT_GOAL}
              onLog={() => openDrawer('weight')}
            />
          </div>
          <div style={{ gridColumn: 'span 3', minHeight: 460 }}>
            <PhotoCard
              palette={theme.tiles.photo}
              latestPhoto={latestPhoto?.photo} latestName={latestPhoto?.name}
              onAdd={() => openDrawer('food')}
            />
          </div>

          {/* Fila 2: Macros · Ejercicio */}
          <div style={{ gridColumn: 'span 7' }}>
            <MacrosCard palette={theme.tiles.macros} totals={totals} goals={macroGoals} />
          </div>
          <div style={{ gridColumn: 'span 5', minHeight: 320 }}>
            <ExerciseCard
              palette={theme.tiles.exercise} items={exercises}
              onAdd={() => openDrawer('exercise')}
              onDelete={id => setExercises(es => es.filter(e => e.id !== id))}
            />
          </div>

          {/* Fila 3: Agua · Comidas */}
          <div style={{ gridColumn: 'span 4', minHeight: 320 }}>
            <WaterCard
              palette={theme.tiles.water}
              liters={waterLiters} goal={WATER_GOAL}
              onAdd={amt => setWaterLiters(l => Math.min(WATER_GOAL + 1, +(l + amt).toFixed(2)))}
            />
          </div>
          <div style={{ gridColumn: 'span 8' }}>
            <MealLogCard
              palette={theme.tiles.log} items={meals}
              onAdd={() => openDrawer('food')}
              onDelete={id => setMeals(ms => ms.filter(m => m.id !== id))}
            />
          </div>

          {/* Fila 4: Semana */}
          <div style={{ gridColumn: 'span 12' }}>
            <WeekCard palette={theme.tiles.week} data={weekData} goal={CALORIE_GOAL} />
          </div>
        </div>
      </div>

      <FloatingAdd onClick={() => openDrawer('food')} theme={theme} />

      <AddDrawer
        open={drawer.open} initialTab={drawer.tab}
        onClose={closeDrawer}
        onAddFood={m  => setMeals(ms => [...ms, m])}
        onAddExercise={e => setExercises(es => [...es, e])}
        onLogWeight={kg => setWeightHistory(wh => [...wh, { day: 0, kg }])}
        currentWeight={currentWeight}
        theme={theme}
      />
    </div>
  )
}
